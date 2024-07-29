import { aptosClient } from "@/utils/aptosClient";

export const getAPR = async (): Promise<string> => {
  try {
    const apr = await aptosClient().view<[string]>({
      payload: {
        function: `${import.meta.env.VITE_MODULE_ADDRESS}::stake_pool::get_apr`,
        functionArguments: [],
      },
    });

    return apr[0];
  } catch (error: any) {
    return "0";
  }
};
