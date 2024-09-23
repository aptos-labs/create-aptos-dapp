import { FA_ADDRESS } from "@/constants";
import { aptosClient } from "@/utils/aptosClient";

export const getAccountTokenBalance = async (accountAddress: string | undefined): Promise<number> => {
  if (!accountAddress) return 0;
  try {
    const balance = await aptosClient().view<[number]>({
      payload: {
        function: "0x1::primary_fungible_store::balance",
        typeArguments: ["0x1::object::ObjectCore"],
        functionArguments: [accountAddress, FA_ADDRESS],
      },
    });
    return balance[0];
  } catch (error: any) {
    return 0;
  }
};
