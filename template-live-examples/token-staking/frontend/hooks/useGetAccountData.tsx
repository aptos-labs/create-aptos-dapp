import { AccountDataContext } from "@/providers/accountData";
import { useContext } from "react";

/**
 * A react hook to get the curretn connected account data
 */
export function useGetAccountData() {
  return useContext(AccountDataContext);
}
