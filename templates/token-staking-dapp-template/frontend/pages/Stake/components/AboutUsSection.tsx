import ExternalLinkIcon from "@/assets/icons/external-link.svg";

// Internal components
import { buttonVariants } from "@/components/ui/button";
import { Image } from "@/components/ui/image";

// Internal config
import { config } from "@/config";

import { AddIncentivePoolDialog } from "../cards/AddIncentivePoolCard";

import { StakeCard } from "../cards/StakeCard";
import { UnstakeCard } from "../cards/UnstakeCard";
import { RewardCard } from "../cards/RewardCard";
import { useGetTokenData } from "@/hooks/useGetTokenData";
import { useGetAccountData } from "@/hooks/useGetAccountData";

export const AboutUsSection: React.FC = () => {
  const { tokenData } = useGetTokenData();

  const { hasStake, hasRewards, isCreator } = useGetAccountData();

  return (
    <section className="flex flex-col md:flex-row items-start justify-between px-4 py-2 gap-4 max-w-screen-xl mx-auto">
      <div className="basis-1/2">
        <p className="label-sm">{config.aboutUs?.subTitle}</p>
        <p className="heading-md">{`Staking ${tokenData?.name ?? config.aboutUs?.title}`}</p>
        <p className="body-sm pt-2">{config.aboutUs?.description}</p>
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
        <StakeCard />
        {hasStake && <UnstakeCard />}
        {hasRewards && <RewardCard />}
        {isCreator && <AddIncentivePoolDialog />}
        <a href="#" target="_blank">
          <div className="flex flex-row gap-2 mt-4">
            <p>Get more {tokenData?.name ?? config.aboutUs?.title}</p>
            <Image width={16} height={16} src={ExternalLinkIcon} className="dark:invert" />
          </div>
        </a>
      </div>
    </section>
  );
};
