import { useState, useEffect } from "react";

import { getExistsRewardSchedule } from "@/view-functions/getExistsRewardSchedule";

/**
 * A react hook to get the TOKEN balance of an Account
 *
 */
export function useGetExistsRewardSchedule() {
  const [existsRewardSchedule, setExistsRewardSchedule] = useState<boolean>(false);

  useEffect(() => {
    async function getOnChainExistsRewardSchedule() {
      const existsRewardSchedule = await getExistsRewardSchedule();

      setExistsRewardSchedule(existsRewardSchedule);
    }

    getOnChainExistsRewardSchedule();
  }, []);

  return existsRewardSchedule;
}
