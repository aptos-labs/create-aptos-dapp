import { createSurfClient } from "@thalalabs/surf";

import { aptosClient } from "@/utils/aptosClient";
import { MESSAGE_BOARD_ABI } from "@/utils/message_board_abi";

export const getMessageContent = async (): Promise<string> => {
  const content = await createSurfClient(aptosClient())
    .useABI(MESSAGE_BOARD_ABI)
    .view.get_message_content({
      functionArguments: [],
      typeArguments: [],
    })
    .catch((error) => {
      console.error(error);
      return ["message not exist"];
    });

  return content[0];
};