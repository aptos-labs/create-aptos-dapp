import { FA_ADDRESS } from "@/constants";
import { aptosClient } from "@/utils/aptosClient";

export interface TokenDataResponse {
  decimals: number;
  icon_url: string;
  name: string;
  project_uri: string;
  symbol: string;
}

export const getTokenData = async (): Promise<TokenDataResponse | null> => {
  try {
    const onChainTokenData = await aptosClient().view<[TokenDataResponse]>({
      payload: {
        function: "0x1::fungible_asset::metadata",
        typeArguments: ["0x1::object::ObjectCore"],
        functionArguments: [FA_ADDRESS],
      },
    });

    return onChainTokenData[0];
  } catch (error: any) {
    return null;
  }
};
