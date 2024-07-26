import { aptosClient } from "@/utils/aptosClient";

export const getRewardDistributed = async (): Promise<number> => {
  const rewardDistributed = await aptosClient().view<[number]>({
    payload: {
      function: `${import.meta.env.VITE_MODULE_ADDRESS}::stake_pool::get_reward_distributed_so_far`,
      functionArguments: [],
    },
  });
  console.log("rewardDistributed", rewardDistributed);
  return rewardDistributed[0];
};
