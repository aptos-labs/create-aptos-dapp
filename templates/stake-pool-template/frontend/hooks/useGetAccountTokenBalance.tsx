import { useState, useEffect } from "react";

import { getAccountTokenBalance } from "@/view-functions/getAccountTokenAmount";
import { getTokenDecimals } from "@/view-functions/getTokenDecimals";
import { convertAmountFromOnChainToHumanReadable } from "@/utils/helpers";

/**
 * A react hook to get the TOKEN balance of an Account
 *
 * The token amount is represnted as the smallest amount on chain. i.e if an account balance is 500
 * and the token decimals is 2, then the account token balance is represnted as 500,00 (500 as the balance and
 * 00 as the decimals).
 *
 * This query first fetch the account token balance, then the token decimals and calculates
 * the account balance and converts it into a human readable format.
 */
export function useGetAccountTokenBalance(accountAddress: string | undefined, token?: string) {
  const [onChainBalance, setOnChainBalance] = useState<number>(0);
  const [onChainDecimals, setOnChainDecimals] = useState<number>(0);

  useEffect(() => {
    async function getAccountOnChainBalance() {
      if (!accountAddress) return;
      const balance = await getAccountTokenBalance(accountAddress, token);

      setOnChainBalance(balance);
    }

    async function getOnChainTokenDecimals() {
      const decimals = await getTokenDecimals(token);

      setOnChainDecimals(decimals);
    }

    getAccountOnChainBalance().then(() => {
      getOnChainTokenDecimals();
    });
  }, []);

  return convertAmountFromOnChainToHumanReadable(onChainBalance, onChainDecimals);
}
