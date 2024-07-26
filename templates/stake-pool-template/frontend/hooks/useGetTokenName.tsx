import { useState, useEffect } from "react";

import { getTokenName } from "@/view-functions/getTokenName";

/**
 * A react hook to get the TOKEN balance of an Account
 *
 */
export function useGetTokenName() {
  const [tokenName, setTokenName] = useState<string>();

  useEffect(() => {
    async function getOnChainTokenName() {
      const rewardSchedule = await getTokenName();

      setTokenName(rewardSchedule);
    }

    getOnChainTokenName();
  }, []);

  return tokenName;
}
