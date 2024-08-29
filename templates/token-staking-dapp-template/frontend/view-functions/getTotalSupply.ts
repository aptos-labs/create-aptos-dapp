import { FA_ADDRESS } from "@/constants";
import { aptosClient } from "@/utils/aptosClient";

export const getTotalSupply = async (): Promise<number> => {
  try {
    const totalSupply = await aptosClient().view<[{ vec: string }]>({
      payload: {
        function: "0x1::fungible_asset::supply",
        typeArguments: ["0x1::fungible_asset::Metadata"],
        functionArguments: [FA_ADDRESS],
      },
    });
    return parseInt(totalSupply[0].vec);
  } catch (error: any) {
    return 0;
  }
};
