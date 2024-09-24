import { getPostgresClient } from "@/lib/db";
import { Message } from "@/lib/type/message";

export type GetMessagesProps = {
  page: number;
  limit: number;
  sortedBy: "creation_timestamp";
  order: "ASC" | "DESC";
};

export const getMessages = async ({
  page,
  limit,
  sortedBy,
  order,
}: GetMessagesProps): Promise<{
  messages: Message[];
  total: number;
}> => {
  const rows = await getPostgresClient()(
    `SELECT * FROM messages ORDER BY ${sortedBy} ${order} LIMIT ${limit} OFFSET ${
      (page - 1) * limit
    }`
  );

  const messages = rows.map((row) => {
    return {
      message_obj_addr: row.message_obj_addr,
      creation_timestamp: parseInt(row.creation_timestamp),
      content: row.content,
      creator_addr: row.creator_addr,
      last_update_timestamp: parseInt(row.last_update_timestamp),
      last_update_event_idx: parseInt(row.last_update_event_idx),
    };
  });

  const rows2 = await getPostgresClient()(`
        SELECT COUNT(*) FROM messages;
    `);
  const count = rows2[0].count;

  return { messages, total: count };
};
