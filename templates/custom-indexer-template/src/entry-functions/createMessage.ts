import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { MODULE_ADDRESS } from "@/constants";

export type CreateMessageArguments = {
  content: string; // the content of the message
};

export const createMessage = (
  args: CreateMessageArguments
): InputTransactionData => {
  const { content } = args;
  return {
    data: {
      function: `${MODULE_ADDRESS}::custom_indexer_ex_message_board::create_message`,
      functionArguments: [content],
    },
  };
};
