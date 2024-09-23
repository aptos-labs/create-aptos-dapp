import { getPostgresClient } from "@/lib/db";
import { Message } from "@/lib/type/message";

export type GetMessageProps = {
  messageObjAddr: `0x${string}`;
};

export const getMessage = async ({
  messageObjAddr,
}: GetMessageProps): Promise<{
  message: Message;
}> => {
  const rows = await getPostgresClient()(
    `SELECT * FROM messages WHERE message_obj_addr = '${messageObjAddr}'`
  );
  if (rows.length === 0) {
    throw new Error("Message not found");
  }
  const message = rows[0] as Message;
  const messageConverted = {
    message_obj_addr: message.message_obj_addr as `0x${string}`,
    creator_addr: message.creator_addr as `0x${string}`,
    creation_timestamp: message.creation_timestamp,
    last_update_timestamp: message.last_update_timestamp,
    content: message.content,
    last_update_event_idx: message.last_update_event_idx,
  };
  return { message: messageConverted };
};
