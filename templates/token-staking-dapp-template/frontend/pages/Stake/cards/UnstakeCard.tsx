import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { aptosClient } from "@/utils/aptosClient";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Input } from "@/components/ui/input";
import { convertAmountFromHumanReadableToOnChain } from "@/utils/helpers";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { useState } from "react";
import { unstake } from "@/entry-functions/unstake";
import { useGetTokenData } from "@/hooks/useGetTokenData";
import { useGetAccountData } from "@/hooks/useGetAccountData";
import { useQueryClient } from "@tanstack/react-query";

export const UnstakeCard: React.FC = () => {
  const { signAndSubmitTransaction } = useWallet();
  const { tokenData } = useGetTokenData();

  const { accountStakeAmount } = useGetAccountData();
  const queryClient = useQueryClient();

  const [amountToUnstake, setAmountToUnstake] = useState<string>();

  const onAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = e.target.value;
    setAmountToUnstake(amount);
  };

  const onUnstakeClick = async () => {
    if (!amountToUnstake) return;
    try {
      const response = await signAndSubmitTransaction(
        unstake({
          amount: convertAmountFromHumanReadableToOnChain(parseInt(amountToUnstake), tokenData?.decimals ?? 0),
        }),
      );

      // Wait for the transaction to be commited to chain
      await aptosClient().waitForTransaction({
        transactionHash: response.hash,
      });
      queryClient.refetchQueries();
    } catch (error: any) {}
  };

  return (
    <Dialog>
      <Card>
        <CardContent className="px-4 py-4 bg-gray-100">
          <div className="flex flex-row w-full justify-between">
            <div className="flex flex-row gap-6">
              <div>
                <p>Total {tokenData?.name} Staked</p>
                <p className="body-md-semibold">{accountStakeAmount}</p>
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
          <DialogTitle>Unstake {tokenData?.name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 space-y-4">
          <div className="flex flex-col item-center space-y-2">
            <Label htmlFor="incentive-amount">Amount</Label>
            <Input id="incentive-amount" className="col-span-3" type="number" onChange={onAmountChange} />
            <p className="text-gray-400 text-sm">
              {accountStakeAmount} {tokenData?.name} available to unstake
            </p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button onClick={onUnstakeClick}>Unstake</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
