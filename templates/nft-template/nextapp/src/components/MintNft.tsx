"use client";

import { ABI } from "@/utils/abi_nft_launchpad";
import { Stack, StackDivider, Button, Flex } from "@chakra-ui/react";
import { useState } from "react";
import { useWalletClient } from "@thalalabs/surf/hooks";
import { aptosClient } from "@/utils/aptos";

type Props = {
  collectionAddress: `0x${string}`;
};

export const MintNft = ({ collectionAddress }: Props) => {
  const [mintAmount, setMintAmount] = useState("1");
  const { client: walletClient } = useWalletClient();

  const onMint = async () => {
    if (!walletClient) {
      throw new Error("Wallet not connected");
    }
    const response = await walletClient.useABI(ABI).mint_nft({
      type_arguments: [],
      arguments: [collectionAddress],
    });
    await aptosClient.waitForTransaction({
      transactionHash: response.hash,
    });
  };

  return (
    walletClient && (
      <Stack divider={<StackDivider />} spacing="4" textAlign="center">
        <Flex>
          <Button onClick={onMint}>Mint</Button>
        </Flex>
      </Stack>
    )
  );
};
