// Internal components
import { buttonVariants } from "@/components/ui/button";

// Internal config
import { config } from "@/config";

import { AddIncentivePoolDialog } from "../cards/AddIncentivePoolCard";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useEffect, useState } from "react";
import { StakeCard } from "../cards/StakeCard";
import { UnstakeCard } from "../cards/UnstakeCard";
import { RewardCard } from "../cards/RewardCard";
import { useGetUserHasStake } from "@/hooks/useGetUserHasStake";
import { useGetClaimableRewards } from "@/hooks/useGetClaimableRewards";

interface OurStorySectionProps {
  tokenData?: { decimals: number; icon_url: string; name: string; project_uri: string; symbol: string };
}

export const OurStorySection: React.FC<OurStorySectionProps> = ({ tokenData }) => {
  if (!config.ourStory) return null;

  const [tokenName, setTokenName] = useState<string>("TOKEN");
  const [tokenDecimal, setTokenDecimal] = useState<number>(0);

  const { account } = useWallet();

  const userHasStake = useGetUserHasStake(account?.address);
  const userClaimableRewards = useGetClaimableRewards(account?.address);

  console.log("userClaimableRewards", userClaimableRewards);

  useEffect(() => {
    setTokenName(tokenData?.name ?? "TOKEN");
    setTokenDecimal(tokenData?.decimals ?? 0);
  }, [tokenData]);

  return (
    <section className="flex flex-col md:flex-row items-start justify-between px-4 py-2 gap-4 max-w-screen-xl mx-auto">
      <div className="basis-1/2">
        <p className="label-sm">{config.ourStory.subTitle}</p>
        <p className="heading-md">{`Staking ${tokenName}` ?? config.ourStory.title}</p>
        <p className="body-sm pt-2">{config.ourStory.description}</p>
        {config.socials?.discord && (
          <a
            href={config.socials.discord}
            target="_blank"
            className={buttonVariants({
              variant: "outline",
              className: "mt-4",
            })}
          >
            Join Our Discord
          </a>
        )}
      </div>

      <div className="w-full basis-1/2 order-1 md:order-2">
        <StakeCard tokenName={tokenName} tokenDecimal={tokenDecimal} />
        {userHasStake && <UnstakeCard tokenName={tokenName} tokenDecimal={tokenDecimal} />}
        {userClaimableRewards && (
          <RewardCard tokenName={tokenName} tokenDecimal={tokenDecimal} userClaimableRewards={userClaimableRewards} />
        )}

        {account?.address === import.meta.env.VITE_CREATOR_ADDRESS && (
          <AddIncentivePoolDialog tokenName={tokenName} tokenDecimal={tokenDecimal} />
        )}
      </div>
    </section>
  );
};
