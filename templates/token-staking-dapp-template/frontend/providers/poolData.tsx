import { useToast } from "@/components/ui/use-toast";
import { useGetTokenData } from "@/hooks/useGetTokenData";
import { useGetUniqueHolders } from "@/hooks/useGetUniqueHolders";
import { convertAmountFromOnChainToHumanReadable } from "@/utils/helpers";
import { getAPR } from "@/view-functions/getAPR";
import { getExistsRewardSchedule } from "@/view-functions/getExistsRewardSchedule";
import { getRewardReleased } from "@/view-functions/getRewardDistributed";
import { getRewardSchedule } from "@/view-functions/getRewardSchedule";
import { getStakePoolData } from "@/view-functions/getStakePoolData";
import { getTotalSupply } from "@/view-functions/getTotalSupply";
import { useQuery } from "@tanstack/react-query";
import { PropsWithChildren, createContext, useEffect, useState } from "react";

export interface PoolDataProviderState {
  totalStaked: string;
  stakingRatio: string;
  apr: string;
  rewardReleased: string;
  uniqueHolders: number;
  existsRewardSchedule: boolean;
  rewardSchedule?: GetRewardScheduleResponse;
}

const defaultValues: PoolDataProviderState = {
  totalStaked: "0",
  stakingRatio: "0",
  apr: "0",
  rewardReleased: "0",
  uniqueHolders: 0,
  existsRewardSchedule: false,
  rewardSchedule: undefined,
};

export interface GetRewardScheduleResponse {
  index: string;
  rps: string;
  last_update_ts: string;
  start_ts: string;
  end_ts: string;
}

export const PoolDataContext = createContext<PoolDataProviderState>(defaultValues);

export const PoolDataContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [totalStaked, setTotalStaked] = useState<string>("0");
  const [stakingRatio, setStakingRatio] = useState<string>("0");
  const [apr, setAPR] = useState<string>("0");
  const [rewardReleased, setRewardReleased] = useState<string>("0");
  const [uniqueHolders, setUniqueHolders] = useState<number>(0);
  const [existsRewardSchedule, setExistsRewardSchedule] = useState<boolean>(false);
  const [rewardSchedule, setRewardSchedule] = useState<GetRewardScheduleResponse>();

  const { tokenData } = useGetTokenData();
  const { toast } = useToast();

  const { data } = useQuery({
    queryKey: ["pool-data-context", tokenData],
    refetchInterval: 1000 * 30,
    queryFn: async () => {
      try {
        /**
         * Get total staked amount
         */
        const poolData = await getStakePoolData();

        const totalStaked = convertAmountFromOnChainToHumanReadable(
          parseInt(poolData?.total_staked ?? "0"),
          tokenData?.decimals ?? 0,
        ).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

        /**
         * Get total supply and calculate staking ratio
         */
        const totalSupply = await getTotalSupply();

        const stakingRatio = totalSupply > 0 ? (100 * parseInt(poolData?.total_staked ?? "0")) / totalSupply : 0;
        const formattedStakingRatio = stakingRatio?.toFixed(2) ?? 0;

        /**
         * Get whether a rewards achedule exists
         */

        const existsRewardSchedule = await getExistsRewardSchedule();

        /**
         * Get the rewards scheulde
         */
        const rewardSchedule = await getRewardSchedule();

        /**
         * Get APR
         */
        const apr = await getAPR();
        const formattedAPR =
          parseInt(apr).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }) ?? "0";
        /**
         * Get reward released so far
         */
        const rewardReleasedFromChain = await getRewardReleased();

        const rewardReleased =
          convertAmountFromOnChainToHumanReadable(
            rewardReleasedFromChain ?? 0,
            tokenData?.decimals ?? 0,
          ).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }) ?? 0;

        /**
         * Get unique holders
         */
        const { uniqueHolders } = await useGetUniqueHolders();
        return {
          totalStaked,
          totalSupply,
          formattedStakingRatio,
          formattedAPR,
          rewardReleased,
          uniqueHolders,
          existsRewardSchedule,
          rewardSchedule,
        };
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error,
        });
      }
    },
  });

  useEffect(() => {
    if (data) {
      setTotalStaked(data.totalStaked);
      setAPR(data.formattedAPR);
      setRewardReleased(data.rewardReleased);
      setStakingRatio(data.formattedStakingRatio);
      setUniqueHolders(data.uniqueHolders);
      setExistsRewardSchedule(data.existsRewardSchedule);
      setRewardSchedule(data.rewardSchedule);
    }
  }, [data]);

  return (
    <PoolDataContext.Provider
      value={{ totalStaked, stakingRatio, apr, rewardReleased, uniqueHolders, existsRewardSchedule, rewardSchedule }}
    >
      {children}
    </PoolDataContext.Provider>
  );
};
