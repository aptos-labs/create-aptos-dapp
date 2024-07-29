import { aptosClient } from "@/utils/aptosClient";

export interface RewardsScheduleReponse {
  index: string;
  rps: string;
  last_update_ts: string;
  start_ts: string;
  end_ts: string;
}

export const getRewardSchedule = async (): Promise<RewardsScheduleReponse> => {
  const response = await aptosClient().view<string[]>({
    payload: {
      function: `${import.meta.env.VITE_MODULE_ADDRESS}::stake_pool::get_reward_schedule`,
    },
  });

  const rewardsSchedule = {
    index: response[0],
    rps: response[1],
    last_update_ts: response[2],
    start_ts: response[3],
    end_ts: response[4],
  };

  return rewardsSchedule;
};
