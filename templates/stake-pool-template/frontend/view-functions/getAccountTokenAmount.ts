import { aptosClient } from "@/utils/aptosClient";

export const getAccountTokenBalance = async (accountAddress: string | undefined, token?: string): Promise<number> => {
  if (!accountAddress) return 0;
  const balance = await aptosClient().view<[number]>({
    payload: {
      function: "0x1::primary_fungible_store::balance",
      typeArguments: ["0x1::object::ObjectCore"],
      functionArguments: [accountAddress, token ?? import.meta.env.VITE_FA_ADDRESS],
    },
  });

  return balance[0];
};
