import { aptosClient } from "@/utils/aptosClient";

export const getExistsRewardSchedule = async (): Promise<boolean> => {
  const existsRewardSchedule = await aptosClient().view<[boolean]>({
    payload: {
      function: `${import.meta.env.VITE_MODULE_ADDRESS}::stake_pool::exists_reward_schedule`,
    },
  });
  return existsRewardSchedule[0];
};
