import { PostgresDialect } from "kysely";
import pg from "pg";
import { betterAuth } from "./src/index.js";
import { phantom } from "./src/providers/phantom.js";

const { Pool } = pg;

export const auth = betterAuth({
  database: new PostgresDialect({
    pool: new Pool({ connectionString: process.env.SUPABASE_DB_URL }),
  }),
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3001",
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    twitter: {
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    },
  },
  plugins: [phantom()],
  user: {
    additionalFields: {
      walletAddress: {
        type: "string",
        required: false,
        returned: true,
      },
    },
  },
});
