import { aptosClient } from "@/utils/aptosClient";

export const getRewardReleased = async (): Promise<number> => {
  try {
    const rewardReleased = await aptosClient().view<[number]>({
      payload: {
        function: `${import.meta.env.VITE_MODULE_ADDRESS}::stake_pool::get_reward_distributed_so_far`,
        functionArguments: [],
      },
    });

    return rewardReleased[0];
  } catch (error: any) {
    return 0;
  }
};
