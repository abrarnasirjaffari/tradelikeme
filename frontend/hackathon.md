# TradeLikeMe Frontend — Hackathon Checklist

Deadline: **May 11, 2026** | Submission: Colosseum Solana Frontier Hackathon

---

## REQUIRED FOR HACKATHON

### 1. Dashboard — Core Trading UI
Judges will watch the demo video and evaluate: Functionality, UX, Novelty. These 4 items must exist.

- [ ] **Vault balance display** — show current USDC balance in vault (call `GET /users/{id}/vaults`)
- [ ] **Deposit button + flow** — "Deposit USDC → delegate to agent" (call `POST /vaults/{id}/deposit`). This is the core UX claim.
- [ ] **Strategy stats card** — 89% win rate, total trades, avg return, RRR. Reads from `GET /strategies/{id}` or `GET /users/{id}/pnl`. This is the entire novelty claim.
- [ ] **Trade history table** — list of entry/exit/P&L rows (call `GET /users/{id}/trades`). Proves the agent actually traded.

### 2. Mode Selector
Judges need to see dual-mode execution in the demo.

- [ ] **Mode toggle** — Solana Vault (Mode A) vs CEX API (Mode B)
- [ ] **CEX API key input** — text field to paste API key for Mode B (calls `POST /users/{id}/exchange-key` or similar)

### 3. Lint / Build Fixes (blocking — must fix before `npm run build`)

| # | File | Error | Fix |
|---|------|-------|-----|
| 1 | `FadingVideo.tsx:75` | `Unexpected any` type | Type the parameter properly |
| 2 | `FeatureMarketplace.tsx:2` | `fadeLeft` imported but never used | Remove unused import |
| 3 | `OpenSource.tsx:3` | `fadeRight` imported but never used | Remove unused import |
| 4 | `AuthContext.tsx:89` | Fast refresh — file exports both component and hook | Split into separate files or use workaround |
| 5 | `DashboardPage.tsx:13` | `Unexpected any` for `twoFactorEnabled` | Add proper type to user object |
| 6 | `SubmitStrategyForm.tsx:117` | `usernameValid` assigned but never used | Remove or use the variable |
| 7 | `SubmitStrategyForm.tsx:206` | `active` assigned but never used | Remove or use the variable |
| 8 | `WaitlistHero.tsx:31` | setState called synchronously in useEffect | Move to useState initializer |
| 9 | `BlogPage.tsx:155` | `Unexpected any` type | Add proper type |
| 10 | `BlogPostPage.tsx:162` | `Unexpected any` type | Add proper type |

### 4. API Client Layer
No trading API calls exist anywhere in the codebase. Need a minimal service layer.

- [ ] Create `src/services/api.ts` — base fetch wrapper using `VITE_API_URL`
- [ ] `GET /users/{id}/vaults` — fetch vault balance
- [ ] `GET /users/{id}/trades` — fetch trade history
- [ ] `GET /users/{id}/pnl` — fetch P&L summary
- [ ] `POST /vaults/{id}/deposit` — trigger deposit
- [ ] `GET /strategies` — list strategies (for mode selector / strategy stats)

---

## POST-HACKATHON (skip for now)

### Dashboard Features
- [ ] Withdraw UI — not needed for demo, deposit is enough
- [ ] Live WebSocket feed (`ws://api.tradelikeme.xyz/ws/live`) — real-time P&L updates
- [ ] Full P&L chart (Recharts/Nivo)
- [ ] Open positions live monitor
- [ ] Vault compound/reinvest UI

### User Settings
- [ ] Profile page (edit name, email, avatar)
- [ ] Exchange API key management (full CRUD)
- [ ] Notification config UI (wire to `GET|POST /notifications/config`)
- [ ] Risk mode selector UI (Conservative / Medium / Aggressive)

### Strategy Marketplace
- [ ] Browse strategies page
- [ ] Strategy detail page (stats, trade log, trader info)
- [ ] Subscribe/unsubscribe flow

### Admin
- [ ] Admin dashboard (user list, revenue, agent status)
- [ ] Strategy approval workflow

### Code Quality
- [ ] Add WebSocket library (`socket.io-client` or native WS hook)
- [ ] Add API error boundaries and retry logic
- [ ] Move hardcoded video URL to env var (currently in 4 files)
- [ ] Add proper TypeScript types for all Supabase tables (currently `any`)
- [ ] Add loading/error states for all API calls
- [ ] Split `AuthContext.tsx` into provider + hook files (react-refresh compliance)

### Marketing / Content
- [ ] Replace static blog data with CMS or real API
- [ ] Replace static FAQ/pricing with CMS
- [ ] Add Docs content (currently text only, no code examples)

---

## CURRENT STATE SUMMARY

| Area | Status | Notes |
|------|--------|-------|
| Marketing site | ✅ Done | Landing, pricing, blog, docs, FAQ |
| Auth flows | ✅ Done | Email, Google, GitHub, Phantom, 2FA, reset |
| Strategy submission | ✅ Done | Form + Supabase insert |
| Dashboard | ❌ Placeholder | Single "Coming soon" card |
| Trading API client | ❌ Missing | Zero API calls to backend |
| Vault / deposit UI | ❌ Missing | No component |
| Trade history | ❌ Missing | No component |
| Strategy stats | ❌ Missing | No component |
| Mode selector | ❌ Missing | No component |
| WebSocket / live feed | ❌ Missing | No WS library in dependencies |
| Lint errors | ❌ 10 errors | Blocking `npm run build` |

---

## DEMO VIDEO SEQUENCE (90 seconds)

Per `hackathon/tradelikeme_summary.md`:

1. Phantom Connect email sign-in (10s) — **auth: working**
2. Deposit USDC into vault (15s) — **FE: missing**
3. Agent scanning zones on TradingView (20s) — **backend: working**
4. Agent entering trade on devnet (15s) — **backend: working**
5. Telegram notification (5s) — **backend: working**
6. Strategy dashboard with 89% win rate (10s) — **FE: missing**
7. CEX API mode with WEEX (10s) — **FE: missing**
8. Marketplace fee structure (5s) — **pricing page: done**
