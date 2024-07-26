import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

export type StakeTokenArguments = {
  amount: number; // The TOKEN amount to stake in smallest
};

export const stakeToken = (args: StakeTokenArguments): InputTransactionData => {
  const { amount } = args;
  return {
    data: {
      function: `${import.meta.env.VITE_MODULE_ADDRESS}::stake_pool::stake`,
      functionArguments: [amount],
    },
  };
};
