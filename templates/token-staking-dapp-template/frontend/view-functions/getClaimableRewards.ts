import { aptosClient } from "@/utils/aptosClient";

export const getClaimableRewards = async (accountAddress: string | undefined): Promise<number> => {
  try {
    const rewards = await aptosClient().view<[number]>({
      payload: {
        function: `${import.meta.env.VITE_MODULE_ADDRESS}::stake_pool::get_claimable_reward`,
        functionArguments: [accountAddress],
      },
    });

    return rewards[0];
  } catch (error: any) {
    return 0;
  }
};
