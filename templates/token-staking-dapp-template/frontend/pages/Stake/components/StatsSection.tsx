// Internal components
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useGetStakePoolData } from "@/hooks/useGetStakePoolData";
import { useGetTokenData } from "@/hooks/useGetTokenData";

export const StatsSection: React.FC = () => {
  const { tokenData } = useGetTokenData();
  const { totalStaked, stakingRatio, apr, rewardReleased, uniqueHolders } = useGetStakePoolData();

  return (
    <section className="stats-container px-4 max-w-screen-xl mx-auto w-full">
      <ul className="flex flex-col md:flex-row gap-6">
        {[
          {
            title: `Total Staked ${tokenData?.name ?? "TOKEN"}`,
            value: totalStaked,
            tooltip: `The cumulative amount of ${tokenData?.name ?? "TOKEN"} tokens that have been locked`,
          },
          {
            title: "Holders",
            value: uniqueHolders,
            tooltip: `The number of unique holders of the ${tokenData?.name ?? "TOKEN"} token`,
          },
          {
            title: "Protocol Staking Ratio",
            value: `${stakingRatio}%`,
            tooltip: `The proportion of the total supply of the ${tokenData?.name ?? "TOKEN"} token that is currently being staked`,
          },
          {
            title: "Rewards Released So Far",
            value: rewardReleased,
            tooltip: `The amount of ${tokenData?.name ?? "TOKEN"} that has been released so far but not distributed`,
          },
          {
            title: "APR",
            value: `${apr}%`,
            tooltip: `Annual Percentage Rate. It represents the yearly rate of return earned by staking ${tokenData?.name ?? "TOKEN"}`,
          },
        ].map(({ title, value, tooltip }) => (
          <li className="basis-1/3" key={title + " " + value}>
            <Card className="py-2 px-4" shadow="md">
              <div className="flex flex-col">
                <Label className="label-sm" tooltip={tooltip}>
                  {title}
                </Label>
              </div>
              <p className="heading-sm">{value}</p>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
};
