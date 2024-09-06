import { aptosClient } from "@/utils/aptosClient";

type GetAccountAPTBalanceArguments = {
  accountAddress: string;
};

export const getAccountAPTBalance = async (args: GetAccountAPTBalanceArguments): Promise<number> => {
  const { accountAddress } = args;
  const balance = await aptosClient().view<[number]>({
    payload: {
      function: "0x1::coin::balance",
      typeArguments: ["0x1::aptos_coin::AptosCoin"],
      functionArguments: [accountAddress],
    },
  });
  return balance[0];
};
