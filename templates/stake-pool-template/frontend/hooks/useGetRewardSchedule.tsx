import { useState, useEffect } from "react";

import { getRewardSchedule } from "@/view-functions/getRewardSchedule";

/**
 * A react hook to get the TOKEN balance of an Account
 *
 */
export function useGetRewardSchedule() {
  const [rewardSchedule, setRewardSchedule] = useState<{
    index: string;
    rps: string;
    last_update_ts: string;
    start_ts: string;
    end_ts: string;
  }>();

  useEffect(() => {
    async function getOnChainRewardSchedule() {
      try {
        const rewardSchedule = await getRewardSchedule();
        setRewardSchedule(rewardSchedule);
      } catch (error: any) {
        setRewardSchedule(undefined);
      }
    }

    getOnChainRewardSchedule();
  }, []);

  return rewardSchedule;
}
