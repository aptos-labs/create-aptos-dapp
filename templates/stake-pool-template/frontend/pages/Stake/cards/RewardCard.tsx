import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { aptosClient } from "@/utils/aptosClient";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Input } from "@/components/ui/input";
import { convertAmountFromHumanReadableToOnChain, convertAmountFromOnChainToHumanReadable } from "@/utils/helpers";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useGetUserStakeData } from "@/hooks/useGetUserStakeData";
import { claimRewards } from "@/entry-functions/claimRewards";
import { stakeToken } from "@/entry-functions/stakeToken";

interface RewardCardProps {
  tokenName: string;
  tokenDecimal: number;
  userClaimableRewards: number;
}

export const RewardCard: React.FC<RewardCardProps> = ({ tokenName, tokenDecimal, userClaimableRewards }) => {
  const { signAndSubmitTransaction, account } = useWallet();

  const { toast } = useToast();

  const stakerStakedData = useGetUserStakeData(account?.address);

  const [claimRewardsAmount, setClaimRewardsAmount] = useState<string>();

  const [stakeRewardsAmount, setStakeRewardsAmount] = useState<string>();

  const onClaimRewardsAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = e.target.value;
    setClaimRewardsAmount(amount);
  };

  const onClaimRewardsClick = async () => {
    if (!claimRewardsAmount) return;
    try {
      const response = await signAndSubmitTransaction(
        claimRewards({ amount: convertAmountFromHumanReadableToOnChain(parseInt(claimRewardsAmount), tokenDecimal) }),
      );

      // Wait for the transaction to be commited to chain
      const committedTransactionResponse = await aptosClient().waitForTransaction({
        transactionHash: response.hash,
      });
      toast({
        title: "Transaction Succeed",
        description: `Transaction ${committedTransactionResponse.hash} succeed`,
      });
    } catch (error: any) {}
  };

  const onStakeRewardsAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = e.target.value;
    setStakeRewardsAmount(amount);
  };

  const onStakeRewardsClick = async () => {
    if (!stakeRewardsAmount) return;
    try {
      const response = await signAndSubmitTransaction(
        stakeToken({ amount: convertAmountFromHumanReadableToOnChain(parseInt(stakeRewardsAmount), tokenDecimal) }),
      );

      // Wait for the transaction to be commited to chain
      const committedTransactionResponse = await aptosClient().waitForTransaction({
        transactionHash: response.hash,
      });
      toast({
        title: "Transaction Succeed",
        description: `Transaction ${committedTransactionResponse.hash} succeed`,
      });
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
                {convertAmountFromOnChainToHumanReadable(userClaimableRewards, tokenDecimal)}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-white text-black border-gray border-2 flex items-center">Claim Rewards</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Claim {tokenName} Rewards</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4 space-y-4">
                  <div className="flex flex-col item-center space-y-2">
                    <Label htmlFor="incentive-amount">Amount</Label>
                    <Input
                      id="incentive-amount"
                      className="col-span-3"
                      type="number"
                      onChange={onClaimRewardsAmountChange}
                    />
                    <p className="text-gray-400 text-sm">
                      {convertAmountFromOnChainToHumanReadable(userClaimableRewards, tokenDecimal)} {tokenName}{" "}
                      available to claim
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={onClaimRewardsClick}>Claim</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-white text-black border-gray border-2 flex items-center">Stake Rewards</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Stake {tokenName} Rewards</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4 space-y-4">
                  <div className="flex flex-col item-center space-y-2">
                    <Label htmlFor="incentive-amount">Amount</Label>
                    <Input
                      id="incentive-amount"
                      className="col-span-3"
                      type="number"
                      onChange={onStakeRewardsAmountChange}
                    />
                    <p className="text-gray-400 text-sm">
                      {convertAmountFromOnChainToHumanReadable(userClaimableRewards, tokenDecimal)} {tokenName}{" "}
                      available to Stake
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={onStakeRewardsClick}>Stake</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
