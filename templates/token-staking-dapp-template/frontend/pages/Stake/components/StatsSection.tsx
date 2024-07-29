// Internal components
import { Card } from "@/components/ui/card";
import { useGetStakePoolData } from "@/hooks/useGetStakePoolData";

export const StatsSection: React.FC = () => {
  const { totalStaked, stakingRatio, apr, rewardReleased, uniqueHolders } = useGetStakePoolData();

  return (
    <section className="stats-container px-4 max-w-screen-xl mx-auto w-full">
      <ul className="flex flex-col md:flex-row gap-6">
        {[
          {
            title: "Total Staked TOKEN",
            value: totalStaked,
          },
          { title: "Holders", value: uniqueHolders },
          { title: "Protocol Staking Ratio", value: `${stakingRatio}%` },
          {
            title: "Rewards Released So Far",
            value: rewardReleased,
          },
          { title: "APR", value: `${apr}%` },
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
