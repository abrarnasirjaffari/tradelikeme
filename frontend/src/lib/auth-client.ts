import { createAuthClient } from "better-auth/client"

const AUTH_BASE_URL =
  import.meta.env.VITE_AUTH_URL ?? "http://localhost:3001"

export const authClient = createAuthClient({
  baseURL: `${AUTH_BASE_URL}/api/auth`,
})
