"use client";

import { ABI } from "@/utils/abi_nft_launchpad";
import { humanReadableToOnChain } from "@/utils/math";
import { aptosClient } from "@/utils/aptos";
import { Box, Button, FormControl, FormLabel, Input } from "@chakra-ui/react";
import { useState } from "react";
import { useWalletClient } from "@thalalabs/surf/hooks";

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
  const [preMintAmount, setPreMintAmount] = useState(100);

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
        <Button onClick={onCreate}>Create</Button>
      </Box>
    )
  );
};
