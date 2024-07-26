import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

export type CreateRewardScheduleArguments = {
  rps: number; // the reward per seconds
  durationInSeconds: number; // the reward schedule in seconds
};

export const createRewardSchedule = (args: CreateRewardScheduleArguments): InputTransactionData => {
  const { rps, durationInSeconds } = args;
  return {
    data: {
      function: `${import.meta.env.VITE_MODULE_ADDRESS}::stake_pool::create_reward_schedule`,
      functionArguments: [rps, durationInSeconds],
    },
  };
};
