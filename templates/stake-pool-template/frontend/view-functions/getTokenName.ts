import { aptosClient } from "@/utils/aptosClient";

export const getTokenName = async (token?: string): Promise<string> => {
  const tokenName = await aptosClient().view<[string]>({
    payload: {
      function: `0x1::fungible_asset::name`,
      typeArguments: ["0x1::object::ObjectCore"],
      functionArguments: [token ?? import.meta.env.VITE_FA_ADDRESS],
    },
  });

  return tokenName[0];
};
