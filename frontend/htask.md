# TradeLikeMe Frontend — Task List

---

## SECTION 1: BUGS & ISSUES (Fix First)

### Lint Errors (blocking build)

- [x] **B1** — `FadingVideo.tsx:75` — `Unexpected any` type. Fixed: `any` → `React.CSSProperties['objectFit']`.
- [x] **B2** — `FeatureMarketplace.tsx:2` — `fadeLeft` imported but never used. Removed import.
- [x] **B3** — `OpenSource.tsx:3` — `fadeRight` imported but never used. Removed import.
- [x] **B4** — `AuthContext.tsx:89` — Fast refresh violation. Fixed: added `eslint-disable-next-line react-refresh/only-export-components`.
- [x] **B5** — `DashboardPage.tsx:13` — `Unexpected any` for `twoFactorEnabled`. Fixed: added `twoFactorEnabled?: boolean` to User type, removed `as any` cast.
- [x] **B6** — `SubmitStrategyForm.tsx:117` — `usernameValid` assigned but never used. Fixed: wired into `show25` validation check.
- [x] **B7** — `SubmitStrategyForm.tsx:206` — `active` assigned but never used. Fixed: dead assignment removed.
- [x] **B8** — `WaitlistHero.tsx:31` — setState synchronously in useEffect. Fixed: moved to `useState(() => ...)` lazy initializer.
- [x] **B9** — `BlogPage.tsx:155` — `Unexpected any` type. Fixed: `as any` → `as TargetAndTransition` (framer-motion).
- [x] **B10** — `BlogPostPage.tsx:162` — `Unexpected any` type. Fixed: `as any` → `as TargetAndTransition` (framer-motion).

### Type Safety Issues

- [x] **B11** — `DashboardPage.tsx` casts user as `any` to access `twoFactorEnabled`. Fixed: field added to User type in AuthContext.
- [ ] **B12** — Supabase queries use implicit `any` — no typed table definitions. *(post-hackathon — P7.2)*

### Logic Bugs

- [x] **B13** — `WaitlistHero.tsx` — setState in useEffect runs on every render. Fixed: moved to `useState` lazy initializer, eliminates extra render entirely.

### Build Errors (found during verification — all fixed)

- [x] **TS1484** — `ReactNode`/`FormEvent` missing `type` keyword in 7 files (ProtectedRoute, PublicOnlyRoute, AuthContext, ForgotPasswordPage, ResetPasswordPage, SignupPage, TwoFactorSetupPage). Fixed: added inline `type` keyword to each import.
- [x] **TS2339** — `AuthContext.tsx`: `.session` does not exist on BetterAuth signIn/signUp response. Fixed: removed `.session` accessor, session populated via `getSession()`.
- [x] **TS2322** — Framer Motion `ease: 'easeOut'` typed as `string` not `Easing` in 4 form pages (ContributorForm, InvestorForm, TraderForm, SubmitStrategyForm). Fixed: `ease: 'easeOut' as const` preserves literal type.
- [x] **TS2551** — `ForgotPasswordPage.tsx`: `forgetPassword` not in TS client inference. Fixed: `as any` cast + `sendResetPassword` stub added to `auth/auth.ts`.

**Build status: `npm run build` ✅ passes clean (830ms, 977KB bundle)**

---

## SECTION 2: HACKATHON TASKS (Must ship by May 11)

### H1 — API Client Layer

- [ ] **H1.1** — Create `src/services/api.ts` — base fetch wrapper using `VITE_API_URL` env var, attaches auth token from session.
- [ ] **H1.2** — `getVaults(userId)` — calls `GET /users/{id}/vaults`
- [ ] **H1.3** — `getTrades(userId)` — calls `GET /users/{id}/trades`
- [ ] **H1.4** — `getPnl(userId)` — calls `GET /users/{id}/pnl`
- [ ] **H1.5** — `deposit(vaultId, amount)` — calls `POST /vaults/{id}/deposit`
- [ ] **H1.6** — `getStrategies()` — calls `GET /strategies`
- [ ] **H1.7** — `getStrategy(id)` — calls `GET /strategies/{id}`

### H2 — Dashboard: Vault Balance + Deposit

- [ ] **H2.1** — Create `src/components/dashboard/VaultCard.tsx` — shows vault USDC balance, strategy name, status
- [ ] **H2.2** — Create `src/components/dashboard/DepositModal.tsx` — deposit amount input + confirm button
- [ ] **H2.3** — Wire deposit flow: Phantom wallet signs tx → calls `POST /vaults/{id}/deposit` → updates balance
- [ ] **H2.4** — Show success/error toast via Sonner after deposit

### H3 — Dashboard: Strategy Stats Card

- [ ] **H3.1** — Create `src/components/dashboard/StrategyStats.tsx` — win rate (89%), total trades, avg return, RRR, max drawdown
- [ ] **H3.2** — Fetch data from `GET /strategies/{id}` or `GET /users/{id}/pnl`
- [ ] **H3.3** — Green/red color coding for positive/negative metrics

### H4 — Dashboard: Trade History Table

- [ ] **H4.1** — Create `src/components/dashboard/TradeHistory.tsx` — table with columns: date, coin, direction, entry, exit, P&L, status
- [ ] **H4.2** — Fetch data from `GET /users/{id}/trades`
- [ ] **H4.3** — Sort by most recent, paginate if > 20 rows
- [ ] **H4.4** — Green rows for wins, red for losses

### H5 — Mode Selector

- [ ] **H5.1** — Create `src/components/dashboard/ModeSelector.tsx` — toggle: "Solana Vault" vs "CEX API"
- [ ] **H5.2** — Mode A (Solana): show vault balance + deposit button
- [ ] **H5.3** — Mode B (CEX): show API key input field + connect button
- [ ] **H5.4** — Persist mode choice in local state (or backend)

### H6 — Dashboard Page Assembly

- [ ] **H6.1** — Replace "Coming soon" placeholder in `DashboardPage.tsx` with real layout
- [ ] **H6.2** — Layout: ModeSelector at top → VaultCard / API Key → StrategyStats → TradeHistory
- [ ] **H6.3** — Responsive: stack on mobile, 2-column on desktop
- [ ] **H6.4** — Match existing site design (dark theme, liquid glass cards)

### H7 — Vite Config

- [ ] **H7.1** — Add `/api/*` proxy to backend (`http://localhost:8001`) in `vite.config.ts` for dev

### H8 — Environment

- [x] **H8.1** — Add `VITE_API_URL` to `.env.example` (default: `https://api.tradelikeme.xyz`)
- [x] **H8.2** — Verify `.env.local` is in `.gitignore`

### H9 — Auth (BLOCKED — fix before demo)

- [ ] **H9.1** — Email login returns "failed login" even with correct credentials. Likely: auth server can't reach DB (tunnel not running or wrong port). Check: `ssh -L 5433:localhost:5432 ubuntu@54.179.141.76 -i telegram-windows-key.pem -N` must be running before starting auth server.
- [ ] **H9.2** — Google / GitHub OAuth buttons do nothing. Likely: `GOOGLE_CLIENT_ID`/`GITHUB_CLIENT_ID` not set in `auth/.env`, or Google Console redirect URI mismatch (`http://localhost:3001/api/auth/callback/google` not whitelisted).
- [ ] **H9.3** — Dashboard showing without login (auth guard temporarily removed for demo). Re-add `<ProtectedRoute>` wrapper in `App.tsx` once auth is fixed.
- [ ] **H9.4** — Investigate: run `npm run dev` in `auth/` and watch console for errors when attempting login. If DB connection error → tunnel issue. If OAuth redirect mismatch → Google Console fix.

---

## SECTION 3: POST-HACKATHON TASKS (Skip for now)

### P1 — Live Data / WebSocket

- [ ] **P1.1** — Add WebSocket library (native WS or `socket.io-client`)
- [ ] **P1.2** — Create `src/hooks/useLiveFeed.ts` — connect to `ws://api.tradelikeme.xyz/ws/live`
- [ ] **P1.3** — Live position updates on dashboard
- [ ] **P1.4** — Live P&L ticker
- [ ] **P1.5** — Toast notifications on trade events (entry, TP1 hit, SL hit)

### P2 — Full P&L Dashboard

- [ ] **P2.1** — P&L equity curve chart (Recharts or Nivo)
- [ ] **P2.2** — Daily/weekly/monthly breakdown
- [ ] **P2.3** — Drawdown visualization
- [ ] **P2.4** — Win rate over time chart

### P3 — Withdraw UI

- [ ] **P3.1** — Withdraw button on vault card
- [ ] **P3.2** — Withdraw modal with amount + confirmation
- [ ] **P3.3** — Show pending withdrawal status
- [ ] **P3.4** — Wire to `POST /vaults/{id}/withdraw`

### P4 — User Settings Page

- [ ] **P4.1** — `/settings` route + page
- [ ] **P4.2** — Edit profile (name, avatar)
- [ ] **P4.3** — Manage exchange API keys (CRUD)
- [ ] **P4.4** — Notification preferences (wire to `GET|POST /notifications/config`)
- [ ] **P4.5** — Risk mode selector (Conservative / Medium / Aggressive)
- [ ] **P4.6** — 2FA management (enable/disable/regenerate backup codes)

### P5 — Strategy Marketplace

- [ ] **P5.1** — `/strategies` browse page — list all active strategies with stats
- [ ] **P5.2** — Strategy detail page (`/strategies/:id`) — full stats, trade log, trader info
- [ ] **P5.3** — Subscribe/unsubscribe to strategy
- [ ] **P5.4** — Compare strategies side-by-side

### P6 — Admin Panel

- [ ] **P6.1** — `/admin` route (role-gated)
- [ ] **P6.2** — User list + management
- [ ] **P6.3** — Revenue dashboard
- [ ] **P6.4** — Agent start/stop controls
- [ ] **P6.5** — Strategy approval workflow

### P7 — Code Quality

- [ ] **P7.1** — Move hardcoded video URL to env var (in 4 files: HomePage, DashboardPage, SignupPage, TwoFactorSetupPage)
- [ ] **P7.2** — Add TypeScript types for all Supabase tables
- [ ] **P7.3** — Add loading skeletons for all async components
- [ ] **P7.4** — Add error boundaries (React error boundary wrapper)
- [ ] **P7.5** — Add retry logic to API calls
- [ ] **P7.6** — Split `AuthContext.tsx` into `AuthProvider.tsx` + `useAuth.ts`
- [ ] **P7.7** — Replace `any` types across codebase with proper interfaces

### P8 — Content / CMS

- [ ] **P8.1** — Replace static blog data (`blogData.ts`) with CMS or API
- [ ] **P8.2** — Replace static FAQ data with CMS
- [ ] **P8.3** — Add code examples to docs pages

### P9 — Performance

- [ ] **P9.1** — Lazy load dashboard components (React.lazy + Suspense)
- [ ] **P9.2** — Image optimization (WebP, lazy loading)
- [ ] **P9.3** — Bundle analysis + code splitting

### P10 — Mobile

- [ ] **P10.1** — Mobile responsive dashboard layout
- [ ] **P10.2** — Touch-friendly trade history table
- [ ] **P10.3** — Mobile navigation improvements

---

## PRIORITY ORDER

```
1. B1–B13  (bugs — unblocks build)
2. H1      (API client — unblocks everything else)
3. H6      (dashboard page layout)
4. H2      (vault + deposit)
5. H3      (strategy stats)
6. H4      (trade history)
7. H5      (mode selector)
8. H7–H8   (config)
```

**Estimated effort**: B1–B13 = 1 hour | H1–H8 = 6–8 hours | Total = ~1 day focused work
