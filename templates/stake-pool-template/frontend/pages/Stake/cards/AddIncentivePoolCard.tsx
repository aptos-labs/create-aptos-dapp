import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { createRewardSchedule } from "@/entry-functions/createRewardSchedule";
import { useGetAccountTokenBalance } from "@/hooks/useGetAccountTokenBalance";
import { aptosClient } from "@/utils/aptosClient";
import {
  convertAmountFromOnChainToHumanReadable,
  convertAmountFromHumanReadableToOnChain,
  secondsToDate,
} from "@/utils/helpers";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState } from "react";
import { useGetExistsRewardSchedule } from "@/hooks/useGetExistsRewardSchedule";
import { useGetRewardSchedule } from "@/hooks/useGetRewardSchedule";

interface AddIncentivePoolDialog {
  tokenName: string;
  tokenDecimal: number;
}

export const AddIncentivePoolDialog: React.FC<AddIncentivePoolDialog> = ({ tokenName, tokenDecimal }) => {
  const { signAndSubmitTransaction } = useWallet();
  const { toast } = useToast();

  const [incentiveAmount, setIncentiveAmount] = useState<string>("");
  const [weeks, setWeeks] = useState<string>("");

  const [isValidMinimalIncentiveAmount, setisValidMinimalIncentiveAmount] = useState<boolean>(true);
  const [minimalIncentiveAmountInHumandReadable, setMinimalIncentiveAmountInHumandReadable] = useState<number>(0);

  const creatorRewardTokenAmount = useGetAccountTokenBalance(
    import.meta.env.VITE_CREATOR_ADDRESS,
    import.meta.env.VITE_REWARDS_TOKEN_ADDRESS,
  );

  const existsRewardSchedule = useGetExistsRewardSchedule();
  const rewardSchedule = useGetRewardSchedule();

  const rps = parseInt(rewardSchedule?.rps ?? "0");
  const start_ts = parseInt(rewardSchedule?.start_ts ?? "0");
  const end_ts = parseInt(rewardSchedule?.end_ts ?? "0");

  const onWeeksDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const weeks = e.target.value;
    setWeeks(weeks);
    validateMinimalIncentiveAmount(weeks);
  };

  const onIncentiveAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = e.target.value;
    setIncentiveAmount(amount);
    validateMinimalIncentiveAmount(weeks);
  };

  const validateMinimalIncentiveAmount = (weeks: string) => {
    // minimal reward * 10 ^ decimal / duration week in seconds >= 1
    // 500 minimal reward * 10 ^ decimals 2 / (weeks 2 * 604800)
    const weeksInSeconds = parseInt(weeks) * 604800;
    const minimalIncentiveAmountInHumandReadable = Math.ceil(
      convertAmountFromOnChainToHumanReadable(weeksInSeconds, 8),
    );
    setMinimalIncentiveAmountInHumandReadable(minimalIncentiveAmountInHumandReadable);
    const isValidMinimalIncentiveAmount = minimalIncentiveAmountInHumandReadable >= 1;
    setisValidMinimalIncentiveAmount(isValidMinimalIncentiveAmount);
  };

  const onAddIncetive = async () => {
    // rps = math.floor(incentive_amount * 10^8 / weeks_in_seconds)
    const incentiveAmountInChainUnit = convertAmountFromHumanReadableToOnChain(parseInt(incentiveAmount), 8);
    const durationInSeconds = parseInt(weeks) * 604800;
    const rps = Math.floor(incentiveAmountInChainUnit / durationInSeconds);

    try {
      const response = await signAndSubmitTransaction(createRewardSchedule({ rps, durationInSeconds }));

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
        {existsRewardSchedule ? (
          <CardContent className="px-4 py-4 bg-gray-100">
            <div className="flex flex-row w-full justify-between">
              <div className="flex flex-row gap-6">
                <div>
                  <p>Existing {tokenName} Rewards Schedule </p>
                  <p className="body-md-semibold">
                    Total Rewards:{" "}
                    {Math.ceil(convertAmountFromOnChainToHumanReadable((end_ts - start_ts) * rps, tokenDecimal))}
                  </p>
                  <div>
                    <p className="text-gray-400 text-sm">Start date: {secondsToDate(start_ts).toDateString()}</p>
                    <p className="text-gray-400 text-sm">End date: {secondsToDate(end_ts).toDateString()}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <DialogTrigger asChild>
                  <Button disabled={existsRewardSchedule}>Incentivize</Button>
                </DialogTrigger>
              </div>
            </div>
          </CardContent>
        ) : (
          <CardContent className="px-4 py-4 bg-gray-100">
            <div className="flex flex-row w-full justify-between">
              <div className="flex flex-row gap-6">
                <div>
                  <p>Available {tokenName} Rewards </p>
                  <p className="body-md-semibold">
                    {convertAmountFromOnChainToHumanReadable(creatorRewardTokenAmount, tokenDecimal)}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <DialogTrigger asChild>
                  <Button disabled={existsRewardSchedule}>Incentivize</Button>
                </DialogTrigger>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Incentivize Pool</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 space-y-4">
          <Card>
            <CardContent className="px-4 py-4 bg-gray-100 space-y-6">
              <div className="flex flex-col item-center space-y-2">
                <Label htmlFor="incentive-amount">Duration</Label>
                <p className="text-gray-400 text-sm">
                  Define how many weeks your incentive will be distributed linearly.
                </p>
              </div>
              <div className="flex flex-col item-center space-y-2">
                <Label htmlFor="incentive-amount">Weeks</Label>
                <Input
                  id="incentive-amount"
                  defaultValue={weeks}
                  className="col-span-3"
                  type="number"
                  onChange={onWeeksDurationChange}
                />
                {!isValidMinimalIncentiveAmount && weeks && (
                  <p className="text-gray-400 text-sm">
                    Minimal incentivize should be greater than 0, try increasing the weeks durations
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          <div className="flex flex-col item-center space-y-2">
            <Label htmlFor="incentive-amount">Incentive Amount</Label>
            <Input id="incentive-amount" className="col-span-3" type="number" onChange={onIncentiveAmountChange} />
            <p className="text-gray-400 text-sm">{creatorRewardTokenAmount} TOKEN Available in your wallet</p>
            {incentiveAmount && parseInt(incentiveAmount) < minimalIncentiveAmountInHumandReadable && (
              <p className="text-gray-400 text-sm">
                {" "}
                Minimum Incentive amount should be {minimalIncentiveAmountInHumandReadable}
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onAddIncetive} disabled={existsRewardSchedule}>
            Add Incentive
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
