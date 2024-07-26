import { useState, useEffect } from "react";

import { getStakePoolData } from "@/view-functions/getStakePoolData";
import { aptosClient } from "@/utils/aptosClient";

/**
 * A react hook to get the TOKEN balance of an Account
 *
 */
export function useGetStakingRatio() {
  const [stakingRatio, setStakingRatio] = useState<number>();

  useEffect(() => {
    async function getStakingRatio() {
      const stakePoolData = await getStakePoolData();

      const totalSupply = await aptosClient().view<[{ vec: string }]>({
        payload: {
          function: `0x1::fungible_asset::supply`,
          typeArguments: ["0x1::fungible_asset::Metadata"],
          functionArguments: [import.meta.env.VITE_FA_ADDRESS],
        },
      });

      // staking ratio is calculated by total_stake / total_supply
      const stakingRatio = parseInt(stakePoolData.total_staked) / parseInt(totalSupply[0].vec);

      setStakingRatio(stakingRatio);
    }

    getStakingRatio();
  }, []);

  return stakingRatio;
}
