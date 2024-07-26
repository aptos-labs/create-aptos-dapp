import { useState, useEffect } from "react";

import { getStakePoolData } from "@/view-functions/getStakePoolData";

/**
 * A react hook to get the TOKEN balance of an Account
 *
 */
export function useGetStakePoolData() {
  const [stakePoolData, setStakePoolData] = useState<{
    fa_metadata_object: string;
    reward_store: string;
    total_staked: string;
  }>();

  useEffect(() => {
    async function getOnChainStakePoolData() {
      const rewardSchedule = await getStakePoolData();

      setStakePoolData(rewardSchedule);
    }

    getOnChainStakePoolData();
  }, []);

  return stakePoolData;
}
