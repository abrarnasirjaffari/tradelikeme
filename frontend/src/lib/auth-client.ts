import { createAuthClient } from "better-auth/client"
import { twoFactorClient } from "better-auth/client/plugins"

const AUTH_BASE_URL =
  import.meta.env.VITE_AUTH_URL ?? "http://localhost:3001"

export const authClient = createAuthClient({
  baseURL: `${AUTH_BASE_URL}/api/auth`,
  plugins: [
    twoFactorClient({
      twoFactorPage: "/2fa",
    }),
  ],
})
