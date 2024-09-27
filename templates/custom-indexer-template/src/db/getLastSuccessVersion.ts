import { getPostgresClient } from "@/lib/db";

export const getLastSuccessVersion = async (): Promise<number> => {
  const rows =
    await getPostgresClient()(`SELECT last_success_version FROM processor_status`);
  if (rows.length === 0) {
    throw new Error("Status not found");
  }
  const last_success_version = rows[0].last_success_version;

  return last_success_version;
};
