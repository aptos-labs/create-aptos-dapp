import { useState, useEffect } from "react";

import { getRewardSchedule } from "@/view-functions/getRewardSchedule";

export interface GetRewardScheduleResponse {
  index: string;
  rps: string;
  last_update_ts: string;
  start_ts: string;
  end_ts: string;
}

/**
 * A react hook to get the existing reward schedule data
 */
export function useGetRewardSchedule() {
  const [rewardSchedule, setRewardSchedule] = useState<GetRewardScheduleResponse>();

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
