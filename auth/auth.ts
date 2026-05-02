import { PostgresDialect } from "kysely";
import pg from "pg";
import { betterAuth } from "./src/index.js";

const { Pool } = pg;

export const auth = betterAuth({
  database: new PostgresDialect({
    pool: new Pool({ connectionString: process.env.SUPABASE_DB_URL }),
  }),
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3001",
});
