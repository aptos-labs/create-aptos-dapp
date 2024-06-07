import { WebIrys } from "@irys/sdk";
import { useEffect, useRef, useState } from "react";
import {
  Container,
  Heading,
  Text,
  VStack,
  Box,
  Button,
} from "@chakra-ui/react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

type CollectionMetadata = {
  name: string;
  description: string;
  image: string;
  external_url: string;
};

type ImageAttribute = {
  trait_type: string;
  value: string;
};

type ImageMetadata = {
  name: string;
  description: string;
  image: string;
  external_url: string;
  attributes: ImageAttribute[];
};

type Props = {
  onUpdateName: (name: string) => void;
  onUpdateDescription: (description: string) => void;
  onUpdateProjectUri: (uri: string) => void;
};
export const AssetUploader = ({
  onUpdateName,
  onUpdateDescription,
  onUpdateProjectUri,
}: Props) => {
  const aptosWallet = useWallet();

  const [uploadStatus, setUploadStatus] = useState("Select files to upload");
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.setAttribute("webkitdirectory", "true");
    }
  }, []);

  const handleFiles = (event) => {
    const files = Array.from(event.target.files);
    console.log("select files", files);
    setFiles(files);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.items)
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile());
    console.log("drop files", files);
    setFiles(files);
  };

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const onUploadToIrys = async (files: File[]) => {
    setUploadStatus("Uploading files...");
    const webIrys = new WebIrys({
      network: "devnet",
      token: "aptos",
      wallet: { rpcUrl: "testnet", name: "aptos", provider: aptosWallet },
    });
    await webIrys.ready();

    const VALID_MEDIA_EXTENSIONS = ["png", "jpg", "jpeg", "gltf"];

    const collectionMetadata = files.find(
      (file) => file.name === "collection.json"
    );

    if (!collectionMetadata) {
      console.error("Collection metadata not found");
      return;
    }

    let mediaExt: string;
    const collectionCover = files.find((file) =>
      VALID_MEDIA_EXTENSIONS.some((ext) => {
        if (file.name.endsWith(`collection.${ext}`)) {
          mediaExt = ext;
          return true;
        } else {
          return false;
        }
      })
    );

    if (!collectionCover) {
      console.error("Collection cover not found");
      return;
    }

    const imageMetadatas = files.filter(
      (file) => file.name.endsWith("json") && file.name !== "collection.json"
    );

    if (imageMetadatas.length === 0) {
      console.error("Image metadata not found");
      return;
    }

    const imageFiles = files.filter(
      (file) =>
        file.name.endsWith(`.${mediaExt}`) && file.name !== collectionCover.name
    );

    if (imageFiles.length === 0) {
      console.error("Image files not found");
      return;
    }

    if (imageMetadatas.length !== imageFiles.length) {
      console.error("Mismatch between image metadata and files");
      return;
    }

    console.log(
      "collectionCover",
      collectionCover,
      "collectionMetadata",
      collectionMetadata,
      "imageFiles",
      imageFiles,
      "imageMetadatas",
      imageMetadatas
    );

    const totalFileSize =
      collectionCover.size +
      collectionMetadata.size +
      imageFiles.reduce((acc, file) => acc + file.size, 0) +
      imageMetadatas.reduce((acc, file) => acc + file.size, 0);

    try {
      const costToUpload = await webIrys.getPrice(totalFileSize);
      const irysBalance = await webIrys.getLoadedBalance();
      //   const convertedBalance = webIrys.utils
      //     .fromAtomic(atomicBalance)
      //     .toNumber();

      console.log("costToUpload", costToUpload, "irysBalance", irysBalance);

      if (irysBalance < costToUpload) {
        const fundTx = await webIrys.fund(costToUpload.minus(irysBalance));
        console.log(
          `Successfully funded ${webIrys.utils.fromAtomic(fundTx.quantity)} ${
            webIrys.token
          }, tx: ${JSON.stringify(fundTx)}`
        );
      }

      // upload collection cover
      const collectionCoverReceipt = await webIrys.uploadFile(collectionCover);
      console.log(
        `Collection cover uploaded. Receipt Id=${collectionCoverReceipt.id}
            access with: https://gateway.irys.xyz/${collectionCoverReceipt.id}`
      );

      // update collection metadata with the cover image and upload
      const parsedCollectionMetadata: CollectionMetadata = JSON.parse(
        await collectionMetadata.text()
      );
      onUpdateName(parsedCollectionMetadata.name);
      onUpdateDescription(parsedCollectionMetadata.description);
      parsedCollectionMetadata.image = `https://gateway.irys.xyz/${collectionCoverReceipt.id}`;
      const updatedCollectionMetadata = new File(
        [JSON.stringify(parsedCollectionMetadata)],
        "collection.json",
        { type: collectionMetadata.type }
      );

      const collectionMetadataReceipt = await webIrys.uploadFile(
        updatedCollectionMetadata
      );
      console.log(
        `Collection metadata uploaded. Receipt Id=${collectionMetadataReceipt.id}
                access with: https://gateway.irys.xyz/${collectionMetadataReceipt.id}`
      );
      onUpdateProjectUri(
        `https://gateway.irys.xyz/${collectionMetadataReceipt.id}`
      );

      // upload NFT images as a folder
      const imagesReceipt = await webIrys.uploadFolder(imageFiles);
      console.log(
        `NFT images uploaded. Receipt Id=${imagesReceipt.id}
                    access with: https://gateway.irys.xyz/${imagesReceipt.id}`
      );

      // update image metadata with the image URL and upload
      const updatedImageMetadatas = await Promise.all(
        imageMetadatas.map(async (file) => {
          const metadata: ImageMetadata = JSON.parse(await file.text());
          const imageUrl = `https://gateway.irys.xyz/${
            imagesReceipt.manifestId
          }/${file.name.replace("json", `${mediaExt}`)}`;
          metadata.image = imageUrl;
          return new File([JSON.stringify(metadata)], file.name, {
            type: file.type,
          });
        })
      );

      const imageMetadatasReceipts = await webIrys.uploadFolder(
        updatedImageMetadatas
      );

      console.log(
        `Image metadatas uploaded. Receipt Id=${imageMetadatasReceipts.id}
                            access with: https://gateway.irys.xyz/${imageMetadatasReceipts.id}`
      );
      setUploadStatus("Files uploaded successfully");
    } catch (e) {
      console.log("Error", e);
      setUploadStatus("Error uploading files");
    }
  };

  return (
    <Container>
      <VStack spacing={4}>
        <Heading>Upload NFT Collection</Heading>
        <Box
          border="2px dashed"
          borderColor="gray.300"
          borderRadius="md"
          p="20px"
          textAlign="center"
          cursor="pointer"
          bg="white"
          _hover={{ bg: "gray.50" }}
          onClick={handleClick}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={inputRef}
            style={{ display: "none" }}
            multiple
            onChange={handleFiles}
          />
          <VStack spacing={2}>
            <Text fontSize="lg" color="gray.500">
              Drag & drop a folder here, or click to select files
            </Text>
          </VStack>
        </Box>
        <Text>{status}</Text>
        {files && (
          <section>
            Files details:
            <ul>
              {files.map((file, idx) => {
                return (
                  <div key={idx}>
                    <hr />
                    <li>Name: {file.name}</li>
                    <li>Type: {file.type}</li>
                    <li>Size: {file.size} bytes</li>
                  </div>
                );
              })}
            </ul>
          </section>
        )}
        {files && (
          <Button onClick={() => onUploadToIrys(files)} className="submit">
            Upload Assets to Irys
          </Button>
        )}
        <Text fontSize="lg" color="gray.500">
          {uploadStatus}
        </Text>
      </VStack>
    </Container>
  );
};
