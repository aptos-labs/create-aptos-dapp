import { getPostgresClient } from "@/lib/db";
import { UserStat } from "@/lib/type/user_stats";

export type GetUserStatsProps = {
  page: number;
  limit: number;
  sortedBy: "total_points";
  order: "ASC" | "DESC";
};

export const getUserStats = async ({
  page,
  limit,
  sortedBy,
  order,
}: GetUserStatsProps): Promise<{
  userStats: UserStat[];
  total: number;
}> => {
  const rows = await getPostgresClient()(
    `SELECT * FROM user_stats ORDER BY ${sortedBy} ${order} LIMIT ${limit} OFFSET ${
      (page - 1) * limit
    }`
  );

  const userStats = rows.map((row) => {
    return {
      user_addr: row.user_addr,
      creation_timestamp: parseInt(row.creation_timestamp),
      last_update_timestamp: parseInt(row.last_update_timestamp),
      created_messages: parseInt(row.created_messages),
      updated_messages: parseInt(row.updated_messages),
      s1_points: parseInt(row.s1_points),
      total_points: parseInt(row.total_points),
    };
  });

  const rows2 = await getPostgresClient()(`
        SELECT COUNT(*) FROM user_stats;
    `);
  const count = rows2[0].count;

  return { userStats, total: count };
};
