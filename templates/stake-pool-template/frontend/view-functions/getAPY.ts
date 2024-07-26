import { aptosClient } from "@/utils/aptosClient";

export const getAPY = async (): Promise<number> => {
  const apy = await aptosClient().view<[number]>({
    payload: {
      function: `${import.meta.env.VITE_MODULE_ADDRESS}::stake_pool::get_apy`,
      functionArguments: [],
    },
  });

  return apy[0];
};
