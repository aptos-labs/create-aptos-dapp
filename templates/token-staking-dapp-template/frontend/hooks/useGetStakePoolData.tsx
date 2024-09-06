import { useContext } from "react";

import { PoolDataContext } from "@/providers/poolData";

/**
 * A react hook to get the stake pool data global context
 */
export function useGetStakePoolData() {
  return useContext(PoolDataContext);
}
