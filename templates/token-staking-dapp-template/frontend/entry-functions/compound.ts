import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";
/**
 * Claim and stake rewards at the same operation
 */
export const compound = (): InputTransactionData => {
  return {
    data: {
      function: `${import.meta.env.VITE_MODULE_ADDRESS}::stake_pool::compound`,
      functionArguments: [],
    },
  };
};
