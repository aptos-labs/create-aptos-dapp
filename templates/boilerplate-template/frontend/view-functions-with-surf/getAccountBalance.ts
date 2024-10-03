import { createSurfClient } from "@thalalabs/surf";

import { aptosClient } from "@/utils/aptosClient";
import { COIN_ABI } from "@/utils/coin_abi";

export type AccountAPTBalanceArguments = {
  accountAddress: string;
};

export const getAccountAPTBalance = async (args: AccountAPTBalanceArguments): Promise<number> => {
  const { accountAddress } = args;
  const balance = await createSurfClient(aptosClient())
    .useABI(COIN_ABI)
    .view.balance({
      functionArguments: [accountAddress as `0x${string}`],
      typeArguments: ["0x1::aptos_coin::AptosCoin"],
    });
  return parseInt(balance[0]);
};
