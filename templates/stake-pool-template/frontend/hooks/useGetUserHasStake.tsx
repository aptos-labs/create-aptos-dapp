import { useState, useEffect } from "react";

import { getUserHasStake } from "@/view-functions/getUserHasStake";

/**
 * A react hook to get the TOKEN balance of an Account
 *
 */
export function useGetUserHasStake(accountAddress: string | undefined) {
  const [userHasStake, setUserHasStake] = useState<boolean>();

  useEffect(() => {
    async function getOnChainUserHasStake() {
      if (!accountAddress) return;
      const apy = await getUserHasStake(accountAddress);

      setUserHasStake(apy);
    }

    getOnChainUserHasStake();
  }, [accountAddress]);

  return userHasStake;
}
