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
import { unstakeToken } from "@/entry-functions/unstakeToken";

interface UnstakeCardProps {
  tokenName: string;
  tokenDecimal: number;
}

export const UnstakeCard: React.FC<UnstakeCardProps> = ({ tokenName, tokenDecimal }) => {
  const { signAndSubmitTransaction, account } = useWallet();

  const { toast } = useToast();

  const stakerStakedData = useGetUserStakeData(account?.address);
  const stakerStakedAmount = stakerStakedData?.amount ?? "0";

  const [amountToUnstake, setAmountToUnstake] = useState<string>();

  const onAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = e.target.value;
    setAmountToUnstake(amount);
  };

  const onStakeClick = async () => {
    if (!amountToUnstake) return;
    try {
      const response = await signAndSubmitTransaction(
        unstakeToken({ amount: convertAmountFromHumanReadableToOnChain(parseInt(amountToUnstake), tokenDecimal) }),
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
    <Dialog>
      <Card>
        <CardContent className="px-4 py-4 bg-gray-100">
          <div className="flex flex-row w-full justify-between">
            <div className="flex flex-row gap-6">
              <div>
                <p>Total {tokenName} Staked</p>
                <p className="body-md-semibold">
                  {convertAmountFromOnChainToHumanReadable(parseInt(stakerStakedAmount), tokenDecimal)}
                </p>
              </div>
            </div>
            <div>
              <DialogTrigger asChild>
                <Button className="bg-white text-black border-gray border-2 flex items-center">Unstake</Button>
              </DialogTrigger>
            </div>
          </div>
        </CardContent>
      </Card>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Unstake {tokenName}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 space-y-4">
          <div className="flex flex-col item-center space-y-2">
            <Label htmlFor="incentive-amount">Amount</Label>
            <Input id="incentive-amount" className="col-span-3" type="number" onChange={onAmountChange} />
            <p className="text-gray-400 text-sm">
              {convertAmountFromOnChainToHumanReadable(parseInt(stakerStakedData?.amount ?? "0"), tokenDecimal)}{" "}
              {tokenName} available to unstake
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onStakeClick}>Unstake</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
