import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { MODULE_ADDRESS } from "@/constants";

export type UpdateMessageArguments = {
  messageObj: `0x${string}`; // the message object
  content: string; // the updated content of the message
};

export const updateMessage = (
  args: UpdateMessageArguments
): InputTransactionData => {
  const { messageObj, content } = args;
  return {
    data: {
      function: `${MODULE_ADDRESS}::custom_indexer_ex_message_board::update_message`,
      functionArguments: [messageObj, content],
    },
  };
};
