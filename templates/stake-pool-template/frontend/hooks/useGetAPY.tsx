import { useState, useEffect } from "react";

import { getAPY } from "@/view-functions/getAPY";

/**
 * A react hook to get the TOKEN balance of an Account
 *
 */
export function useGetAPY() {
  const [apy, setAPY] = useState<number>();

  useEffect(() => {
    async function getOnChainPoolAPY() {
      const apy = await getAPY();

      setAPY(apy);
    }

    getOnChainPoolAPY();
  }, []);

  return apy;
}
