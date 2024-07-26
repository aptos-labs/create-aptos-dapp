import { aptosClient } from "@/utils/aptosClient";

export const getTokenData = async (
  token?: string,
): Promise<{ decimals: number; icon_url: string; name: string; project_uri: string; symbol: string }> => {
  const onChainTokenData = await aptosClient().view<
    [{ decimals: number; icon_url: string; name: string; project_uri: string; symbol: string }]
  >({
    payload: {
      function: `0x1::fungible_asset::metadata`,
      typeArguments: ["0x1::object::ObjectCore"],
      functionArguments: [token ?? import.meta.env.VITE_FA_ADDRESS],
    },
  });

  return onChainTokenData[0];
};
