import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./auth.js";

const DEFAULT_ORIGIN = "http://localhost:5173";

function parseOrigins(raw: string): string[] {
  const validated = raw
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean)
    .filter((origin) => {
      try {
        const url = new URL(origin);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        console.warn(`[CORS] Invalid origin ignored: "${origin}"`);
        return false;
      }
    });

  if (validated.length === 0) {
    console.warn(`[CORS] No valid origins configured, falling back to ${DEFAULT_ORIGIN}`);
    return [DEFAULT_ORIGIN];
  }
  return validated;
}

const TRUSTED_ORIGINS = parseOrigins(process.env.TRUSTED_ORIGINS ?? DEFAULT_ORIGIN);

const app = new Hono();

app.use(
  "/api/auth/*",
  cors({
    origin: TRUSTED_ORIGINS,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

serve({ fetch: app.fetch, port: 3001 }, (info) => {
  console.log(`Auth server running on http://localhost:${info.port}`);
});
