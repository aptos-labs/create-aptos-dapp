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

  const [status, setStatus] = useState("");
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
    const webIrys = new WebIrys({
      network: "devnet",
      token: "aptos",
      wallet: { rpcUrl: "testnet", name: "aptos", provider: aptosWallet },
    });
    await webIrys.ready();

    try {
      const receipt = await webIrys.uploadFolder(files); //returns the manifest ID

      console.log(
        `Files uploaded. Manifest Id=${receipt.manifestId} Receipt Id=${
          receipt.id
        }
      access with: https://gateway.irys.xyz/${
        receipt.manifestId
      }/<image-name>, receipt: ${JSON.stringify(receipt)}`
      );
    } catch (e) {
      console.log("Error uploading file ", e);
    }
  };

  const onFilesAdded = async (files: File[]) => {
    setStatus("Uploading...");
    try {
      const collectionFile = files.find(
        (file) => file.name === "collection.json"
      );
      const imageFiles = files.filter((file) =>
        file.webkitRelativePath.startsWith("images/")
      );
      const metadataFiles = files.filter((file) =>
        file.webkitRelativePath.startsWith("metadatas/")
      );

      //   // 1. Upload the collection image to Irys
      //   const collectionImageFile = files.find(
      //     (file) => file.webkitRelativePath === "collection-image.png"
      //   );
      //   const collectionImageUrl = await uploadToIrys(collectionImageFile);

      //   // 2. Update the collection.json file
      //   const collectionData = JSON.parse(await collectionFile.text());
      //   collectionData.image = collectionImageUrl;
      //   const updatedCollectionFile = new File(
      //     [JSON.stringify(collectionData)],
      //     "collection.json",
      //     { type: "application/json" }
      //   );
      //   const collectionJsonUrl = await uploadToIrys(updatedCollectionFile);

      //   // 3. Upload all NFT images to Irys
      //   const nftImageUrls = await Promise.all(imageFiles.map(uploadToIrys));

      //   // 4. Update all NFT metadata files
      //   const updatedMetadataFiles = await Promise.all(
      //     metadataFiles.map(async (file) => {
      //       const metadata = JSON.parse(await file.text());
      //       const imageFileName = file.name.replace("metadata.json", "image.png");
      //       const imageUrl = nftImageUrls.find((url) =>
      //         url.includes(imageFileName)
      //       );
      //       metadata.image = imageUrl;
      //       return new File([JSON.stringify(metadata)], file.name, {
      //         type: "application/json",
      //       });
      //     })
      //   );

      //   const metadataUrls = await Promise.all(
      //     updatedMetadataFiles.map(uploadToIrys)
      //   );

      setStatus("Upload complete!");
    } catch (error) {
      console.error(error);
      setStatus("Error uploading files");
    }
  };

  //   const uploadToIrys = async (file) => {
  //     const formData = new FormData();
  //     formData.append("file", file);

  //     const response = await axios.post("https://api.irys.io/upload", formData, {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //       },
  //     });

  //     return response.data.url; // Adjust according to the actual response structure
  //   };

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
      </VStack>
    </Container>
  );
};
