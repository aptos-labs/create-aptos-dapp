import { useContext } from "react";

import { TokenDataContext, TokenDataProviderState } from "@/providers/tokenData";

/**
 * A react hook to get the token data global context
 */
export function useGetTokenData(): TokenDataProviderState {
  return useContext(TokenDataContext);
}
