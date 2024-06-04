"use client";

import { WebIrys } from "@irys/sdk";
import { ABI } from "@/utils/abi_nft_launchpad";
import { humanReadableToOnChain } from "@/utils/math";
import { aptosClient } from "@/utils/aptos";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { useWalletClient } from "@thalalabs/surf/hooks";
import { useRef } from "react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export const CreateCollection = () => {
  const [maxSupply, setMaxSupply] = useState("1000");
  const [collectionName, setCollectionName] = useState("Test Collection Name");
  const [collectionDescription, setDescription] = useState(
    "Test Collection Description"
  );
  const [projectUri, setProjectUri] = useState(
    "https://github.com/aptos-labs/solana-to-aptos/tree/main/aptos/launchpad"
  );
  const [royaltyPercentage, setRoyaltyPercentage] = useState(10);
  const [preMintAmount, setPreMintAmount] = useState(5);

  const currentUnixTimestamp = Math.floor(Date.now() / 1000);

  const [allowlist, setAllowlist] = useState<`0x${string}`[]>([]);
  const [allowlistStartTime, setAllowlistStartTime] =
    useState(currentUnixTimestamp);
  const [allowlistEndTime, setAllowlistEndTime] = useState(
    currentUnixTimestamp + 150
  );
  const [allowlistMintLimitPerAddr, setAllowlistMintLimitPerAddr] = useState(2);
  const [allowlistMintFeePerNft, setAllowlistMintFeePerNft] = useState(10);
  const [publicMintStartTime, setPublicMintStartTime] = useState(
    currentUnixTimestamp + 210
  );
  const [publicMintEndTime, setPublicMintEndTime] = useState(
    currentUnixTimestamp + 600
  );
  const [publicMintLimitPerAddr, setPublicMintLimitPerAddr] = useState(1);
  const [publicMintFeePerNft, setPublicMintFeePerNft] = useState(100);

  const { client: walletClient } = useWalletClient();
  const aptosWallet = useWallet();

  const [files, setFiles] = useState<File[] | null>(null);

  // const onFilesAdded = async (files) => {
  //   setStatus("Uploading...");
  //   try {
  //     const collectionFile = files.find(
  //       (file) => file.name === "collection.json"
  //     );
  //     const imageFiles = files.filter((file) =>
  //       file.path.startsWith("images/")
  //     );
  //     const metadataFiles = files.filter((file) =>
  //       file.path.startsWith("metadatas/")
  //     );

  //     // 1. Upload the collection image to Irys
  //     const collectionImageFile = files.find(
  //       (file) => file.path === "collection-image.png"
  //     );
  //     const collectionImageUrl = await uploadToIrys(collectionImageFile);

  //     // 2. Update the collection.json file
  //     const collectionData = JSON.parse(await collectionFile.text());
  //     collectionData.image = collectionImageUrl;
  //     const updatedCollectionFile = new File(
  //       [JSON.stringify(collectionData)],
  //       "collection.json",
  //       { type: "application/json" }
  //     );
  //     const collectionJsonUrl = await uploadToIrys(updatedCollectionFile);

  //     // 3. Upload all NFT images to Irys
  //     const nftImageUrls = await Promise.all(imageFiles.map(uploadToIrys));

  //     // 4. Update all NFT metadata files
  //     const updatedMetadataFiles = await Promise.all(
  //       metadataFiles.map(async (file) => {
  //         const metadata = JSON.parse(await file.text());
  //         const imageFileName = file.name.replace("metadata.json", "image.png");
  //         const imageUrl = nftImageUrls.find((url) =>
  //           url.includes(imageFileName)
  //         );
  //         metadata.image = imageUrl;
  //         return new File([JSON.stringify(metadata)], file.name, {
  //           type: "application/json",
  //         });
  //       })
  //     );

  //     const metadataUrls = await Promise.all(
  //       updatedMetadataFiles.map(uploadToIrys)
  //     );

  //     setStatus("Upload complete!");
  //   } catch (error) {
  //     console.error(error);
  //     setStatus("Error uploading files");
  //   }
  // };

  // const onDrop = useCallback(
  //   (acceptedFiles) => {
  //     onFilesAdded(acceptedFiles);
  //   },
  //   [onFilesAdded]
  // );

  // const { getRootProps, getInputProps, isDragActive } = useDropzone({
  //   onDrop,
  //   noClick: true,
  //   noKeyboard: true,
  //   // webkitdirectory: "true", // To allow folder selection
  // });

  const onFundIrys = async () => {
    const webIrys = new WebIrys({
      network: "devnet",
      token: "aptos",
      wallet: { rpcUrl: "testnet", name: "aptos", provider: aptosWallet },
    });
    await webIrys.ready();

    const irysAddr = webIrys.address;
    console.log(`Irys address: ${irysAddr}`);

    await webIrys.getBalance(irysAddr).then((balance) => {
      console.log(`Balance: ${balance}`);
    });

    try {
      const fundTx = await webIrys.fund(1000);
      console.log(
        `Successfully funded ${webIrys.utils.fromAtomic(fundTx.quantity)} ${
          webIrys.token
        }, tx: ${JSON.stringify(fundTx)}`
      );
    } catch (e) {
      console.log("Error uploading data ", e);
    }
  };

  const handleMultipleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = [];
    if (e.target.files) {
      for (let i = 0; i < e.target.files.length; i++) {
        files.push(e.target.files[i]);
      }
    }
    setFiles(files);
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

  const onCreate = async () => {
    if (!walletClient) {
      throw new Error("Wallet not connected");
    }
    if (!collectionName || !projectUri) {
      throw new Error("Invalid input");
    }
    const response = await walletClient.useABI(ABI).create_collection({
      type_arguments: [],
      arguments: [
        collectionDescription,
        collectionName,
        projectUri,
        maxSupply,
        royaltyPercentage,
        preMintAmount,
        allowlist,
        allowlistStartTime,
        allowlistEndTime,
        allowlistMintLimitPerAddr,
        allowlistMintFeePerNft,
        publicMintStartTime,
        publicMintEndTime,
        publicMintLimitPerAddr,
        publicMintFeePerNft,
      ],
    });
    await aptosClient.waitForTransaction({
      transactionHash: response.hash,
    });
  };

  return (
    walletClient && (
      <Box>
        <FormControl>
          <FormLabel>Max Supply</FormLabel>
          <Input
            type="number"
            onChange={(e) => setMaxSupply(e.target.value)}
            value={maxSupply}
          />
          <FormLabel>Collection Name</FormLabel>
          <Input
            type="text"
            onChange={(e) => setCollectionName(e.target.value)}
            value={collectionName}
          />
          <FormLabel>Collection Description</FormLabel>
          <Input
            type="text"
            onChange={(e) => setDescription(e.target.value)}
            value={collectionDescription}
          />
          <FormLabel>Project URI</FormLabel>
          <Input
            type="url"
            onChange={(e) => setProjectUri(e.target.value)}
            value={projectUri}
          />
          <FormLabel>Royalty Percentage</FormLabel>
          <Input
            type="number"
            onChange={(e) => setRoyaltyPercentage(parseInt(e.target.value))}
            value={royaltyPercentage}
          />
          <FormLabel>Pre Mint Amount</FormLabel>
          <Input
            type="number"
            onChange={(e) => setPreMintAmount(parseInt(e.target.value))}
            value={preMintAmount}
          />
          <FormLabel>Allowlist</FormLabel>
          <Input
            type="text"
            onChange={(e) =>
              setAllowlist(
                e.target.value.split(",").map((addr) => addr as `0x${string}`)
              )
            }
            value={allowlist.join(",")}
          />
          <FormLabel>Allowlist Start Time</FormLabel>
          <Input
            type="number"
            onChange={(e) => setAllowlistStartTime(parseInt(e.target.value))}
            value={allowlistStartTime}
          />
          <FormLabel>Allowlist End Time</FormLabel>
          <Input
            type="number"
            onChange={(e) => setAllowlistEndTime(parseInt(e.target.value))}
            value={allowlistEndTime}
          />
          <FormLabel>Allowlist Mint Limit Per Addr</FormLabel>
          <Input
            type="number"
            onChange={(e) =>
              setAllowlistMintLimitPerAddr(parseInt(e.target.value))
            }
            value={allowlistMintLimitPerAddr}
          />
          <FormLabel>Allowlist Mint Fee Per NFT</FormLabel>
          <Input
            type="number"
            onChange={(e) =>
              setAllowlistMintFeePerNft(parseInt(e.target.value))
            }
            value={allowlistMintFeePerNft}
          />
          <FormLabel>Public Mint Start Time</FormLabel>
          <Input
            type="number"
            onChange={(e) => setPublicMintStartTime(parseInt(e.target.value))}
            value={publicMintStartTime}
          />
          <FormLabel>Public Mint End Time</FormLabel>
          <Input
            type="number"
            onChange={(e) => setPublicMintEndTime(parseInt(e.target.value))}
            value={publicMintEndTime}
          />
          <FormLabel>Public Mint Limit Per Addr</FormLabel>
          <Input
            type="number"
            onChange={(e) =>
              setPublicMintLimitPerAddr(parseInt(e.target.value))
            }
            value={publicMintLimitPerAddr}
          />
          <FormLabel>Public Mint Fee Per NFT</FormLabel>
          <Input
            type="number"
            onChange={(e) => setPublicMintFeePerNft(parseInt(e.target.value))}
            value={publicMintFeePerNft}
          />
        </FormControl>
        <Button onClick={onFundIrys}>Fund Irys</Button>
        <Box>
          <Box className="input-group">
            <FormLabel htmlFor="file" className="sr-only">
              Choose Multiple Files
            </FormLabel>
            <input
              id="folder"
              type="file"
              multiple
              onChange={handleMultipleFiles}
            />
          </Box>
          {files && (
            <section>
              Files details:
              <ul>
                {files.map((file) => {
                  return (
                    <>
                      <hr />
                      <li>Name: {file.name}</li>

                      <li>Type: {file.type}</li>
                      <li>Size: {file.size} bytes</li>
                    </>
                  );
                })}
              </ul>
            </section>
          )}
          {files && (
            <Button onClick={() => onUploadToIrys(files)} className="submit">
              Upload Assets
            </Button>
          )}
        </Box>
        <Button onClick={onCreate}>Create</Button>
      </Box>
    )
  );
};
