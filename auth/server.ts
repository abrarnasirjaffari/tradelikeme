import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { auth } from "./auth.js";

const app = new Hono();

app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

serve({ fetch: app.fetch, port: 3001 }, (info) => {
  console.log(`Auth server running on http://localhost:${info.port}`);
});
