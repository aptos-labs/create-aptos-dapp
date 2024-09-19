import { sql } from "@vercel/postgres";

import { MessageBoardColumns } from "@/lib/type/message";

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
  messages: MessageBoardColumns[];
  totalMessages: number;
}> => {
  // vercel doesn't allow $1 $2 in the query string, so we do it like this
  // we checked the type above to prevent sql injection
  const query = `SELECT message_obj_addr, creation_timestamp FROM messages ORDER BY ${sortedBy} ${order} LIMIT $1 OFFSET $2`;
  const { rows } = await sql.query(query, [limit, (page - 1) * limit]);
  const messages = rows.map((row) => {
    return {
      message_obj_addr: row.message_obj_addr,
      creation_timestamp: row.creation_timestamp,
    };
  });
  const { rows: count } = await sql`
        SELECT COUNT(*) FROM messages;
    `;
  return { messages, totalMessages: count[0].count };
};
