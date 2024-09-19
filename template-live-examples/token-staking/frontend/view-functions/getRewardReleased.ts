import { MODULE_ADDRESS } from "@/constants";
import { aptosClient } from "@/utils/aptosClient";

export const getRewardReleased = async (): Promise<number> => {
  try {
    const rewardReleased = await aptosClient().view<[number]>({
      payload: {
        function: `${MODULE_ADDRESS}::stake_pool::get_reward_released_so_far`,
        functionArguments: [],
      },
    });

    return rewardReleased[0];
  } catch (error: any) {
    return 0;
  }
};
