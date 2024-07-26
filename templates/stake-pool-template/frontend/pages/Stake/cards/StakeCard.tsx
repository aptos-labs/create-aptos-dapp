import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { aptosClient } from "@/utils/aptosClient";

import Twitter from "../../../assets/icons/twitter.svg";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { stakeToken } from "@/entry-functions/stakeToken";
import { Input } from "@/components/ui/input";
import { convertAmountFromHumanReadableToOnChain } from "@/utils/helpers";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useGetAccountTokenBalance } from "@/hooks/useGetAccountTokenBalance";
import { useGetAPY } from "@/hooks/useGetAPY";

interface StakeCard {
  tokenName: string;
  tokenDecimal: number;
}

export const StakeCard: React.FC<StakeCard> = ({ tokenName, tokenDecimal }) => {
  const { signAndSubmitTransaction, account } = useWallet();

  const { toast } = useToast();

  const stakerStakedTokenAmount = useGetAccountTokenBalance(account?.address, import.meta.env.VITE_FA_ADDRESS);
  const apy = useGetAPY();

  const [amount, setAmount] = useState<string>();

  const onAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = e.target.value;
    setAmount(amount);
  };

  const onStakeClick = async () => {
    if (!amount) return;
    try {
      const response = await signAndSubmitTransaction(
        stakeToken({ amount: convertAmountFromHumanReadableToOnChain(parseInt(amount), tokenDecimal) }),
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
        <CardContent className="px-4 py-4">
          <div className="flex flex-row w-full justify-between">
            <div className="flex flex-row gap-6">
              <Image width={16} height={16} src={Twitter} className="dark:invert" />
              <div>
                <p>Start earning up to</p>
                <p className="body-md-semibold">{apy}% APY</p>
              </div>
            </div>
            <div>
              <DialogTrigger asChild>
                <Button className="flex items-center" disabled={!account}>
                  Stake {tokenName}
                </Button>
              </DialogTrigger>
            </div>
          </div>
        </CardContent>
      </Card>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Stake {tokenName}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 space-y-4">
          <div className="flex flex-col item-center space-y-2">
            <Label htmlFor="incentive-amount">Amount</Label>
            <Input id="incentive-amount" className="col-span-3" type="number" onChange={onAmountChange} />
            <p className="text-gray-400 text-sm">
              {stakerStakedTokenAmount} {tokenName} Available in your wallet
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onStakeClick}>Stake</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
