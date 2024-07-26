// Internal components
import { Card } from "@/components/ui/card";
import { useGetAPY } from "@/hooks/useGetAPY";
import { useGetRewardDistributed } from "@/hooks/useGetRewardDistributed";
import { useGetStakePoolData } from "@/hooks/useGetStakePoolData";
import { useGetStakingRatio } from "@/hooks/useGetStakingRatio";
// Internal utils
import { convertAmountFromOnChainToHumanReadable } from "@/utils/helpers";
import { useEffect, useState } from "react";
// Internal hooks
//import { useGetCollectionData } from "@/hooks/useGetCollectionData";

interface StatsSectionProps {
  tokenData?: { decimals: number; icon_url: string; name: string; project_uri: string; symbol: string };
}

export const StatsSection: React.FC<StatsSectionProps> = ({ tokenData }) => {
  const stakePoolData = useGetStakePoolData();
  const apr = useGetAPY();
  const rewardDistributed = useGetRewardDistributed();

  const stakingRatio = useGetStakingRatio();

  const [totalStaked, setTotalStaked] = useState<string>("0");
  const [tokenDecimal, setTokenDecimal] = useState<number>(0);

  useEffect(() => {
    setTotalStaked(stakePoolData?.total_staked ?? "0");
    setTokenDecimal(tokenData?.decimals ?? 0);
  }, [stakePoolData, tokenData]);

  return (
    <section className="stats-container px-4 max-w-screen-xl mx-auto w-full">
      <ul className="flex flex-col md:flex-row gap-6">
        {[
          {
            title: "Total Staked TOKEN",
            value: convertAmountFromOnChainToHumanReadable(parseInt(totalStaked), tokenDecimal),
          },
          { title: "Holders", value: 0 },
          { title: "Protocol Staking Ratio", value: `${stakingRatio}%` ?? "0%" },
          {
            title: "Rewards Released So Far",
            value: convertAmountFromOnChainToHumanReadable(rewardDistributed ?? 0, tokenDecimal) ?? 0,
          },
          { title: "APR", value: `${apr}%` ?? "0%" },
        ].map(({ title, value }) => (
          <li className="basis-1/3" key={title + " " + value}>
            <Card className="py-2 px-4" shadow="md">
              <p className="label-sm">{title}</p>
              <p className="heading-sm">{value}</p>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
};
