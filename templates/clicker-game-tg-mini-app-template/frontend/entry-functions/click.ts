import { MODULE_ADDRESS } from "@/constants";
import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

export const click = (): InputTransactionData => {
  return {
    data: {
      function: `${MODULE_ADDRESS}::cad_tg_counter_app::click`,
      functionArguments: [],
    },
  };
};
