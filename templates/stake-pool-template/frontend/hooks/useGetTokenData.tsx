import { useState, useEffect } from "react";

import { getTokenData } from "@/view-functions/getTokenData";

/**
 * A react hook to get the TOKEN balance of an Account
 *
 */
export function useGetTokenData() {
  const [tokenData, setTokenData] = useState<{
    decimals: number;
    icon_url: string;
    name: string;
    project_uri: string;
    symbol: string;
  }>();

  useEffect(() => {
    async function getOnChainTokenData() {
      const rewardSchedule = await getTokenData();

      setTokenData(rewardSchedule);
    }

    getOnChainTokenData();
  }, []);

  return tokenData;
}
