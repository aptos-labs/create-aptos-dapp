import { neon } from "@neondatabase/serverless";

export const getPostgresClient = () => {
  return neon(process.env.DATABASE_URL!);
};
