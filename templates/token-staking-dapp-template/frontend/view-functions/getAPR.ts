import { MODULE_ADDRESS } from "@/constants";
import { aptosClient } from "@/utils/aptosClient";

export const getAPR = async (): Promise<string> => {
  try {
    const apr = await aptosClient().view<[string]>({
      payload: {
        function: `${MODULE_ADDRESS}::stake_pool::get_apr`,
        functionArguments: [],
      },
    });

    return apr[0];
  } catch (error: any) {
    return "0";
  }
};
