import { sql } from "@vercel/postgres";

export const getLastSuccessVersion = async (): Promise<number> => {
  const query = `SELECT last_success_version FROM processor_status`;
  const { rows } = await sql.query(query, []);
  if (rows.length === 0) {
    throw new Error("Status not found");
  }
  const status: {
    last_success_version: number;
  } = rows[0];

  return status.last_success_version;
};
