import ExternalLinkIcon from "@/assets/icons/external-link.svg";

import { Image } from "@/components/ui/image";

// Internal config
import { config } from "@/config";

import { AddIncentivePoolDialog } from "../cards/AddIncentivePoolCard";

import { StakeCard } from "../cards/StakeCard";
import { UnstakeCard } from "../cards/UnstakeCard";
import { RewardCard } from "../cards/RewardCard";
import { useGetTokenData } from "@/hooks/useGetTokenData";
import { useGetAccountData } from "@/hooks/useGetAccountData";

export const UserOperationsSection: React.FC = () => {
  const { tokenData } = useGetTokenData();

  const { hasStake, hasRewards, isCreator } = useGetAccountData();

  return (
    <div className="w-full basis-1/2 order-1 md:order-2">
      <StakeCard />
      {hasStake && <UnstakeCard />}
      {hasRewards && <RewardCard />}
      {isCreator && <AddIncentivePoolDialog />}
      <a href="#" target="_blank">
        <div className="flex flex-row gap-2 mt-4">
          <p>Get more {tokenData?.symbol ?? config.aboutUs?.title}</p>
          <Image width={16} height={16} src={ExternalLinkIcon} className="dark:invert" />
        </div>
      </a>
    </div>
  );
};
