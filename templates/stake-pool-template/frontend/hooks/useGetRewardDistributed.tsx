import { useState, useEffect } from "react";

import { getRewardDistributed } from "@/view-functions/getRewardDistributed";

/**
 * A react hook to get the TOKEN balance of an Account
 *
 */
export function useGetRewardDistributed() {
  const [rewardDistributed, setRewardDistributed] = useState<number>();

  useEffect(() => {
    async function getRewardDistributedSoFAr() {
      try {
        const rewardDistributed = await getRewardDistributed();

        setRewardDistributed(rewardDistributed);
      } catch (error: any) {
        setRewardDistributed(0);
      }
    }

    getRewardDistributedSoFAr();
  }, []);

  return rewardDistributed;
}
