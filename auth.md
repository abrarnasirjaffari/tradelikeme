# TradeLikeMe Frontend — Auth Tasks

**Stack**: BetterAuth (source) + Hono server + Supabase Postgres + Vite React SPA  
**Date**: 2026-05-02  
**Status**: In progress

---

## Chunk 1 — Extract & Clean BetterAuth

Goal: Pull just what we need from the `better-auth/` clone, strip all open-source artifacts, set up a private `auth/` service folder.

- [x] **BA1** — Create `auth/` folder at `Platform/auth/` (sibling to `frontend/`, not inside it)
- [x] **BA2** — Copy `frontend/better-auth/packages/better-auth/src/` into `auth/src/`
- [x] **BA3** — Copy `frontend/better-auth/packages/better-auth/package.json` into `auth/package.json` and rename package to `tradelikeme-auth`
- [x] **BA4** — Delete all open-source artifacts from `auth/`: LICENSE.md, CODE_OF_CONDUCT.md, CONTRIBUTING.md, SECURITY.md, banner-*.png, README references to open-source contribution, all `repository` and `homepage` fields in package.json
- [x] **BA5** — Delete the entire `frontend/better-auth/` monorepo clone (no longer needed)
- [x] **BA6** — Remove any `.git` folder inside `auth/` if one exists

---

## Chunk 2 — Auth Server Setup (Hono)

Goal: Standalone Node.js auth server that BetterAuth runs on. Frontend calls this server.

- [x] **BA7** — Add Hono to `auth/package.json` dependencies (`hono`, `@hono/node-server`)
- [x] **BA8** — Add DB adapter to `auth/package.json`: `kysely`, `pg` (connects to Supabase Postgres)
- [x] **BA9** — Create `auth/tsconfig.json` (ESM, Node 20 target)
- [x] **BA10** — Create `auth/server.ts` — Hono app that mounts BetterAuth on `/api/auth/*`
- [x] **BA11** — Create `auth/auth.ts` — BetterAuth config (import from local `src/`, not npm)
- [x] **BA12** — Wire Kysely adapter in `auth/auth.ts` pointing to `SUPABASE_DB_URL` (Postgres direct connection string, not PostgREST)
- [x] **BA13** — Add `auth/` start script to package.json: `tsx server.ts`
- [x] **BA14** — Smoke test: `npm run dev` in `auth/`, confirm server starts on port 3001

---

## Chunk 3 — BetterAuth Config (Plugins)

Goal: Configure all auth features we need before touching the frontend.

- [x] **BA15** — Email + password auth (built-in) — enable in `auth/auth.ts`
- [x] **BA16** — Google OAuth — add `socialProviders.google` with env vars `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (covers all Gmail accounts too)
- [x] **BA17** — GitHub OAuth — add `socialProviders.github` with env vars `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- [x] **BA17b** — X/Twitter OAuth — add `socialProviders.twitter` with env vars `TWITTER_CLIENT_ID`, `TWITTER_CLIENT_SECRET` (OAuth 2.0, requires Twitter Developer App)
- [x] **BA17c** — Phantom (SIWS — Sign In With Solana) — add custom BetterAuth provider in `auth/src/providers/phantom.ts`:
  - Server: verify Ed25519 signature + nonce, extract wallet address, create/find user account with `providerId: "phantom"`, `accountId: walletAddress`
  - Two endpoints: `GET /api/auth/phantom/nonce` (returns one-time nonce) + `POST /api/auth/phantom/verify` (verifies signed message, returns session)
  - User table: add `walletAddress` field (nullable — only set for Phantom users or users who link wallet)
  - Account table: `providerId = "phantom"`, `accountId = base58_wallet_address`
- [x] **BA18** — Sessions — set `expiresIn: 30 * 24 * 60 * 60` (30 days), `updateAge: 24 * 60 * 60` (refresh daily)
- [x] **BA19** — Two-factor auth (TOTP) — add `twoFactor()` plugin
- [x] **BA20** — Admin plugin — add `admin()` plugin, set admin user role for `abrarnasirjaffari@hacklikeme.com`
- [x] **BA21** — Rate limiting — add `rateLimit()` plugin (10 attempts / 15 min on login)
- [x] **BA22** — Add all new env vars to `frontend/.env.local` and `frontend/.env.example`: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `TWITTER_CLIENT_ID`, `TWITTER_CLIENT_SECRET`

---

## Chunk 4 — Frontend Auth Client

Goal: Wire the existing SignupPage + LoginPage UI to the auth server. No UI changes yet — just plumbing.

- [x] **BA23** — Install `better-auth` client package in `frontend/`: `npm install better-auth` (npm version, for the client SDK only)
- [x] **BA24** — Create `frontend/src/lib/auth-client.ts` — initialise BetterAuth client pointing to `http://localhost:3001/api/auth` (dev) / `https://auth.tradelikeme.xyz/api/auth` (prod)
- [x] **BA25** — Create `frontend/src/context/AuthContext.tsx` — React context that exposes `user`, `session`, `loading`, `signIn`, `signUp`, `signOut`
- [x] **BA26** — Wrap `frontend/src/main.tsx` with `<AuthProvider>`
- [x] **BA27** — Wire `SignupPage.tsx` form submit → `authClient.signUp.email()` — handle success (redirect to dashboard) + error (show message)
- [x] **BA28** — Wire `LoginPage.tsx` form submit → `authClient.signIn.email()` — handle success + error
- [x] **BA29** — Add Google sign-in button handler → `authClient.signIn.social({ provider: 'google' })`
- [x] **BA30** — Add GitHub sign-in button handler → `authClient.signIn.social({ provider: 'github' })`
- [x] **BA30b** — Add X/Twitter sign-in button handler → `authClient.signIn.social({ provider: 'twitter' })`
- [x] **BA30c** — Add Phantom sign-in button handler:
  - Install `@solana/wallet-adapter-react` + `@phantom/connect` in `frontend/`
  - On click: fetch nonce from `GET /api/auth/phantom/nonce`, prompt Phantom to sign message, POST signature to `POST /api/auth/phantom/verify`, store returned session
  - Show wallet address (truncated: `AbCd...xYz`) in header after login
- [x] **BA31** — Add sign-out handler in nav/header (wherever the logout button will live)

---

## Chunk 5 — Protected Routes

Goal: Redirect unauthenticated users away from protected pages.

- [ ] **BA32** — Install `react-router-dom` v7 in `frontend/` (replace the current `window.location.pathname` routing)
- [ ] **BA33** — Migrate `App.tsx` routing to React Router `<Routes>` + `<Route>` components
- [ ] **BA34** — Create `frontend/src/components/ProtectedRoute.tsx` — redirects to `/login` if no session
- [ ] **BA35** — Mark dashboard route as protected (placeholder page for now — content comes later)
- [ ] **BA36** — Redirect already-logged-in users away from `/login` and `/signup` to dashboard

---

## Chunk 6 — Auth UX Polish

Goal: Make auth flows feel complete and production-ready.

- [ ] **BA37** — Add toast notification system (`sonner` or `react-hot-toast`) — show success/error on all auth actions
- [ ] **BA38** — Add loading spinner on Sign In / Sign Up buttons while request is in flight
- [ ] **BA39** — Forgot password page + form → `authClient.forgetPassword()` call
- [ ] **BA40** — Reset password page (handles `?token=` from email link) → `authClient.resetPassword()`
- [ ] **BA41** — Email verification banner on dashboard for unverified accounts → `authClient.sendVerificationEmail()`
- [ ] **BA42** — 2FA setup page (after login, if user enables TOTP) — QR code display + verify code

---

## Chunk 7 — Deployment

Goal: Auth server running on EC2 behind Traefik, accessible at `auth.tradelikeme.xyz`.

- [ ] **BA43** — Create `auth/Dockerfile` (Node 20 Alpine, builds and runs the Hono server)
- [ ] **BA44** — Add `auth` service to `infra/docker-compose.yml` (port 3001, depends on Supabase Postgres)
- [ ] **BA45** — Add Traefik label to auth service: route `auth.tradelikeme.xyz` → port 3001
- [ ] **BA46** — Add Cloudflare DNS A record: `auth.tradelikeme.xyz` → `54.179.141.76`
- [ ] **BA47** — Add all production env vars to Dokploy dashboard for `auth` service
- [ ] **BA48** — Deploy + smoke test: `POST https://auth.tradelikeme.xyz/api/auth/sign-up/email` returns 200

---

## Notes

- BetterAuth server runs at port `3001` (dev) / `auth.tradelikeme.xyz` (prod)
- Supabase Postgres connection: use **direct Postgres URL** (`postgresql://...`), NOT the PostgREST API URL
- BetterAuth creates its own tables (`user`, `session`, `account`, `verification`) — these live in Supabase Postgres alongside our existing tables
- Frontend calls auth server for all auth operations. Supabase client (`@supabase/supabase-js`) stays for DB reads (trade data, positions, etc.) only — NOT for auth
- Google + GitHub OAuth: register apps on Google Cloud Console + GitHub Developer Settings, get client IDs before BA16/BA17
- X/Twitter OAuth: register app at developer.x.com, enable OAuth 2.0, set callback URL to `https://auth.tradelikeme.xyz/api/auth/callback/twitter`
- Phantom SIWS: no external app registration needed — wallet signs a local message, we verify the Ed25519 signature server-side using `@solana/web3.js`
- All 5 login methods create/find a row in `user` table + a linked row in `account` table — one user can have multiple providers linked
- `account.providerId` tracks which method was used: `"email"`, `"google"`, `"github"`, `"twitter"`, `"phantom"`
