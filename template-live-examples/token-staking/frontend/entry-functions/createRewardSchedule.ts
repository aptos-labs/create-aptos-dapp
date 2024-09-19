import { MODULE_ADDRESS } from "@/constants";
import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

export type CreateRewardScheduleArguments = {
  rps: number; // the reward per seconds
  durationInSeconds: number; // the reward schedule in seconds
};

/**
 * Create an incetivize pool
 */
export const createRewardSchedule = (args: CreateRewardScheduleArguments): InputTransactionData => {
  const { rps, durationInSeconds } = args;
  return {
    data: {
      function: `${MODULE_ADDRESS}::stake_pool::create_reward_schedule`,
      functionArguments: [rps, durationInSeconds],
    },
  };
};
