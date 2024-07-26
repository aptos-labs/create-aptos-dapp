import { aptosClient } from "@/utils/aptosClient";

export const getTokenDecimals = async (token?: string): Promise<number> => {
  const decimals = await aptosClient().view<[number]>({
    payload: {
      function: "0x1::fungible_asset::decimals",
      typeArguments: ["0x1::object::ObjectCore"],
      functionArguments: [token ?? import.meta.env.VITE_FA_ADDRESS],
    },
  });

  return decimals[0];
};
