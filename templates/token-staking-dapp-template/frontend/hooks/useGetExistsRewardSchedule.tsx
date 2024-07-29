import { useState, useEffect } from "react";

import { getExistsRewardSchedule } from "@/view-functions/getExistsRewardSchedule";

/**
 * A react hook to query whether there is an existing reward schedule
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
