import { useState, useEffect } from "react";

import { getUserStakeData } from "@/view-functions/getUserStakeData";

/**
 * A react hook to get the TOKEN balance of an Account
 *
 */
export function useGetUserStakeData(accountAddress: string | undefined) {
  const [userStakeData, setUserStakeData] = useState<{ amount: string; last_claim_ts: string; index: string } | null>();

  useEffect(() => {
    async function getOnChainUserStakeData() {
      if (!accountAddress) return;
      const userStakeData = await getUserStakeData(accountAddress);

      setUserStakeData(userStakeData);
    }

    getOnChainUserStakeData();
  }, []);

  return userStakeData;
}
