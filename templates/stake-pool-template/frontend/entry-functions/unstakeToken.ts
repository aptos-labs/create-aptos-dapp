import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

export type UnstakeTokenArguments = {
  amount: number; // The TOKEN amount to stake in smallest
};

export const unstakeToken = (args: UnstakeTokenArguments): InputTransactionData => {
  const { amount } = args;
  return {
    data: {
      function: `${import.meta.env.VITE_MODULE_ADDRESS}::stake_pool::unstake`,
      functionArguments: [amount],
    },
  };
};
