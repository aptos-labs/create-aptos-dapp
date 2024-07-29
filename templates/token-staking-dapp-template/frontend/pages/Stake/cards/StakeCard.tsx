import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { aptosClient } from "@/utils/aptosClient";

import Twitter from "../../../assets/icons/twitter.svg";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { stake } from "@/entry-functions/stake";
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
import { useGetTokenData } from "@/hooks/useGetTokenData";
import { useGetStakePoolData } from "@/hooks/useGetStakePoolData";
import { useQueryClient } from "@tanstack/react-query";
import { useGetAccountData } from "@/hooks/useGetAccountData";

export const StakeCard: React.FC = () => {
  const { signAndSubmitTransaction, account } = useWallet();
  const { tokenData } = useGetTokenData();
  const queryClient = useQueryClient();

  const { accountTokenBalance } = useGetAccountData();
  const { apr } = useGetStakePoolData();

  const [amount, setAmount] = useState<string>();

  const onAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = e.target.value;
    setAmount(amount);
  };

  const onStakeClick = async () => {
    if (!amount) return;
    try {
      const response = await signAndSubmitTransaction(
        stake({ amount: convertAmountFromHumanReadableToOnChain(parseInt(amount), tokenData?.decimals ?? 0) }),
      );

      // Wait for the transaction to be commited to chain
      await aptosClient().waitForTransaction({
        transactionHash: response.hash,
      });
      queryClient.invalidateQueries();
    } catch (error: any) {}
  };

  return (
    <Dialog>
      <Card>
        <CardContent className="px-4 py-4">
          <div className="flex flex-row w-full justify-between">
            <div className="flex flex-row gap-6">
              <Image width={16} height={16} src={Twitter} className="dark:invert" />
              <div>
                <p>Start earning up to</p>
                <p className="body-md-semibold">{apr}% APR</p>
              </div>
            </div>
            <div>
              <DialogTrigger asChild>
                <Button className="flex items-center" disabled={!account}>
                  Stake {tokenData?.name}
                </Button>
              </DialogTrigger>
            </div>
          </div>
        </CardContent>
      </Card>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Stake {tokenData?.name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 space-y-4">
          <div className="flex flex-col item-center space-y-2">
            <Label htmlFor="incentive-amount">Amount</Label>
            <Input id="incentive-amount" className="col-span-3" type="number" onChange={onAmountChange} />
            <p className="text-gray-400 text-sm">
              {accountTokenBalance} {tokenData?.name} Available in your wallet
            </p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button onClick={onStakeClick}>Stake</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
