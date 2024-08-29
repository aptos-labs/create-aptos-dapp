import { MODULE_ADDRESS } from "@/constants";
import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

/**
 * Claim all available rewards
 */
export const claimRewards = (): InputTransactionData => {
  return {
    data: {
      function: `${MODULE_ADDRESS}::stake_pool::claim_reward`,
      functionArguments: [],
    },
  };
};
