import { useState, useEffect } from "react";

import { getClaimableRewards } from "@/view-functions/getClaimableRewards";

/**
 * A react hook to get the TOKEN balance of an Account
 *
 */
export function useGetClaimableRewards(accountAddress: string | undefined) {
  const [rewards, setRewards] = useState<number>();

  useEffect(() => {
    if (!accountAddress) return;
    async function getOnChainClaimableRewards() {
      const apy = await getClaimableRewards(accountAddress);

      setRewards(apy);
    }

    getOnChainClaimableRewards();
  }, [accountAddress]);

  return rewards;
}
