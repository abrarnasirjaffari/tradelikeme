import { PostgresDialect } from "kysely";
import pg from "pg";
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins/admin";
import { twoFactor } from "better-auth/plugins/two-factor";
import { phantom } from "./src/providers/phantom.js";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim()).filter(Boolean);
const TRUSTED_ORIGINS = (process.env.TRUSTED_ORIGINS ?? "http://localhost:5173").split(",").map(o => o.trim()).filter(Boolean);

const { Pool } = pg;

export const auth = betterAuth({
  database: new PostgresDialect({
    pool: new Pool({ connectionString: process.env.SUPABASE_DB_URL }),
  }),
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3001",
  trustedOrigins: TRUSTED_ORIGINS,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      // In production, replace with a real email sender (Resend, SES, etc.)
      // For now, log the link so it can be tested manually via server logs.
      console.log(`[EMAIL VERIFICATION] To: ${user.email} | Link: ${url}`);
    },
  },
  session: {
    expiresIn: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  rateLimit: {
    enabled: true,
    customRules: {
      "/sign-in/*": { window: 15 * 60, max: 10 },
    },
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
    // twitter: disabled — add TWITTER_CLIENT_ID/SECRET to .env to re-enable
    // twitter: {
    //   clientId: process.env.TWITTER_CLIENT_ID!,
    //   clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    // },
  },
  plugins: [
    admin(),
    twoFactor(),
    phantom(),
  ],
  databaseHooks: {
    user: {
      create: {
        async before(user) {
          if (ADMIN_EMAILS.includes(user.email)) {
            return { data: { ...user, role: "admin" } };
          }
        },
      },
    },
  },
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
