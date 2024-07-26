import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

export type ClaimRewardsArguments = {
  amount: number; // The TOKEN amount to claim in smallest
};

export const claimRewards = (args: ClaimRewardsArguments): InputTransactionData => {
  const { amount } = args;
  return {
    data: {
      function: `${import.meta.env.VITE_MODULE_ADDRESS}::stake_pool::claim_reward`,
      functionArguments: [amount],
    },
  };
};
