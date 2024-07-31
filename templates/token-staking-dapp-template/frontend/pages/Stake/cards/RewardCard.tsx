import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { aptosClient } from "@/utils/aptosClient";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { convertAmountFromOnChainToHumanReadable } from "@/utils/helpers";
import { claimRewards } from "@/entry-functions/claimRewards";
import { useGetTokenData } from "@/hooks/useGetTokenData";
import { useGetAccountData } from "@/hooks/useGetAccountData";
import { useQueryClient } from "@tanstack/react-query";
import { compound } from "@/entry-functions/compound";

export const RewardCard: React.FC = () => {
  const { signAndSubmitTransaction } = useWallet();
  const { tokenData } = useGetTokenData();

  const { claimableRewards } = useGetAccountData();
  const queryClient = useQueryClient();

  const onClaimRewardsClick = async () => {
    try {
      const response = await signAndSubmitTransaction(claimRewards());

      // Wait for the transaction to be commited to chain
      await aptosClient().waitForTransaction({
        transactionHash: response.hash,
      });
      queryClient.refetchQueries();
    } catch (error: any) {}
  };

  const onStakeRewardsClick = async () => {
    try {
      const response = await signAndSubmitTransaction(compound());

      // Wait for the transaction to be commited to chain
      await aptosClient().waitForTransaction({
        transactionHash: response.hash,
      });
      queryClient.refetchQueries();
    } catch (error: any) {}
  };

  return (
    <Card>
      <CardContent className="px-4 py-4 bg-gray-100">
        <div className="flex flex-row w-full justify-between">
          <div className="flex flex-row gap-6">
            <div>
              <p>Your Rewards</p>
              <p className="body-md-semibold">
                {convertAmountFromOnChainToHumanReadable(claimableRewards, tokenData?.decimals ?? 0)}
              </p>
              <p className="text-gray-400 text-sm">Stake rewards will auto claim your available rewards</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Button
              className="bg-white text-black border-gray border-2 flex items-center"
              onClick={onClaimRewardsClick}
            >
              Claim Rewards
            </Button>
            <Button
              className="bg-white text-black border-gray border-2 flex items-center"
              onClick={onStakeRewardsClick}
            >
              Stake Rewards
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
