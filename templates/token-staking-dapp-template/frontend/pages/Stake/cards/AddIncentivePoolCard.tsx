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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createRewardSchedule } from "@/entry-functions/createRewardSchedule";
import { aptosClient } from "@/utils/aptosClient";
import {
  convertAmountFromOnChainToHumanReadable,
  convertAmountFromHumanReadableToOnChain,
  secondsToDate,
} from "@/utils/helpers";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState } from "react";
import { useGetTokenData } from "@/hooks/useGetTokenData";
import { useGetAccountData } from "@/hooks/useGetAccountData";
import { useQueryClient } from "@tanstack/react-query";
import { useGetStakePoolData } from "@/hooks/useGetStakePoolData";

const WEEKS_IN_SECONDS = 604800;

export const AddIncentivePoolDialog: React.FC = () => {
  const { signAndSubmitTransaction } = useWallet();
  const { tokenData } = useGetTokenData();
  const { accountTokenBalance } = useGetAccountData();
  const { existsRewardSchedule, rewardSchedule } = useGetStakePoolData();
  const queryClient = useQueryClient();

  const [incentiveAmount, setIncentiveAmount] = useState<string>("");
  const [weeks, setWeeks] = useState<string>("");

  const [isValidMinimalIncentiveAmount, setisValidMinimalIncentiveAmount] = useState<boolean>(true);
  const [minimalIncentiveAmountInHumandReadable, setMinimalIncentiveAmountInHumandReadable] = useState<number>(0);

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
  };

  const validateMinimalIncentiveAmount = (weeks: string) => {
    /**
     * Minimal rewards are considered valid if the: minimal reward * 10 ^ decimal / duration week in seconds >= 1
     * For example, consider minimal rewards is 500, the token decimal is 2 and the weeks is set to 2, then
     * 500 (minimal reward) * 10 ^ decimals 2 / (2 (weeks) * 604800)
     */
    const weeksInSeconds = parseInt(weeks) * WEEKS_IN_SECONDS;
    const minimalIncentiveAmountInHumandReadable = Math.ceil(
      convertAmountFromOnChainToHumanReadable(weeksInSeconds, tokenData?.decimals ?? 0),
    );
    setMinimalIncentiveAmountInHumandReadable(minimalIncentiveAmountInHumandReadable);
    const isValidMinimalIncentiveAmount = minimalIncentiveAmountInHumandReadable >= 1;
    setisValidMinimalIncentiveAmount(isValidMinimalIncentiveAmount);
  };

  const getTotalRewardsInThePool = () => {
    /**
     * Get the pool weeks (end date - start date), multiply it by the RPS
     * and convert it into a human readable format
     */
    return Math.ceil(
      convertAmountFromOnChainToHumanReadable((end_ts - start_ts) * rps, tokenData?.decimals ?? 0),
    ).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const onAddIncentive = async () => {
    /**
     * RPS (rewards per second) calculated by the incentive amount value * 10^8 / weeks_in_seconds
     * For example, if incentive amount is 500 and weeks is 2, then
     * 500 (incentive amount) * 10^8 / (2 (weeks) * 604800)
     */
    const incentiveAmountInChainUnit = convertAmountFromHumanReadableToOnChain(
      parseInt(incentiveAmount),
      tokenData?.decimals ?? 0,
    );
    const durationInSeconds = parseInt(weeks) * WEEKS_IN_SECONDS;
    const rps = Math.floor(incentiveAmountInChainUnit / durationInSeconds);

    try {
      const response = await signAndSubmitTransaction(createRewardSchedule({ rps, durationInSeconds }));

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
        {existsRewardSchedule ? (
          <CardContent className="px-4 py-4 bg-gray-100">
            <div className="flex flex-row w-full justify-between">
              <div className="flex flex-row gap-6">
                <div>
                  <p>Existing {tokenData?.name} Rewards Schedule </p>
                  <p className="body-md-semibold">Total Rewards: {getTotalRewardsInThePool()}</p>
                  <div>
                    <p className="text-gray-400 text-sm">Start date: {secondsToDate(start_ts).toDateString()}</p>
                    <p className="text-gray-400 text-sm">End date: {secondsToDate(end_ts).toDateString()}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <DialogTrigger asChild>
                  <Button disabled={true}>Incentivize</Button>
                </DialogTrigger>
              </div>
            </div>
          </CardContent>
        ) : (
          <CardContent className="px-4 py-4 bg-gray-100">
            <div className="flex flex-row w-full justify-between">
              <div className="flex flex-row gap-6">
                <div>
                  <p>Available {tokenData?.name} Rewards </p>
                  <p className="body-md-semibold">{accountTokenBalance}</p>
                </div>
              </div>
              <div className="flex items-center">
                <DialogTrigger asChild>
                  <Button>Incentivize</Button>
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
            <p className="text-gray-400 text-sm">
              {accountTokenBalance} {tokenData?.name} Available in your wallet
            </p>
            {incentiveAmount && parseInt(incentiveAmount) < minimalIncentiveAmountInHumandReadable && (
              <p className="text-gray-400 text-sm">
                {" "}
                Minimum Incentive amount should be {minimalIncentiveAmountInHumandReadable}
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button onClick={onAddIncentive} disabled={existsRewardSchedule}>
              Add Incentive
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
