import { nftLaunchpadClient } from "@/utils/aptos";
import { useEffect, useState } from "react";

export const useGetFungibleAssetBalance = (
  collectionAddress: string,
  walletAddress?: string
) => {
  const [balance, setBalance] = useState<string>();
  useEffect(() => {
    if (!walletAddress) {
      return;
    }
    nftLaunchpadClient.view
      .get_balance({
        typeArguments: [],
        functionArguments: [
          collectionAddress as `0x${string}`,
          walletAddress as `0x${string}`,
        ],
      })
      .then((res) => {
        setBalance(res[0] as string);
      });
  }, [collectionAddress, walletAddress]);
  return balance;
};
