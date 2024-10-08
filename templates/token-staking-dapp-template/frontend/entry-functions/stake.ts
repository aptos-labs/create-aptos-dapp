import { MODULE_ADDRESS } from "@/constants";
import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

export type StakeTokenArguments = {
  amount: number; // The TOKEN amount to stake in smallest units
};

/**
 * Stake an amount of token
 */
export const stake = (args: StakeTokenArguments): InputTransactionData => {
  const { amount } = args;
  return {
    data: {
      function: `${MODULE_ADDRESS}::stake_pool::stake`,
      functionArguments: [amount],
    },
  };
};
