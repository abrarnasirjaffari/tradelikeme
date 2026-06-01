# Antigravity — TradeLikeMe Mobile App Plan

*Mobile companion to tradelikeme.xyz. Same agent, same strategy, native mobile UX.*

---

## What This Is

A React Native (Expo) mobile app that mirrors the TradeLikeMe web platform. Users can:
- Sign in via Phantom Connect (email) or social login (Google/GitHub)
- Deposit USDC into their Solana vault and delegate to the agent
- Monitor open trades, P&L, and agent status in real time
- Receive push notifications for zone touches, TP hits, and SL events
- Browse the strategy marketplace and switch strategies

The mobile app is a **consumer of the existing FastAPI backend** (`api.tradelikeme.xyz`). No new backend code needed — all endpoints are already built.

---

## Design Reference

19 screens already designed in `mobileapp.pen` (Pencil):

| # | Screen | Notes |
|---|--------|-------|
| 1 | Splash | Logo + tagline |
| 2 | Login | Email / Google / Phantom |
| 3 | Signup | Same providers |
| 4 | Onboarding 1 | What is TradeLikeMe |
| 5 | Onboarding 2 | How the agent works |
| 6 | Onboarding 3 | Risk modes explained |
| 7 | Dashboard | P&L summary, agent status, active vault |
| 8 | Active Trades | Live positions with entry/TP/SL |
| 9 | Trade History | Closed trades, win rate, avg RR |
| 10 | Live Trade Detail | Single trade — zone map, P&L, countdown |
| 11 | Strategies | Marketplace listing |
| 12 | Strategy Detail | Win rate, trade sample, fee tier |
| 13 | Vault | Balance, deposit/withdraw, epoch info |
| 14 | Deposit Flow | Amount → confirm → Phantom sign |
| 15 | Settings | Risk mode, notification prefs |
| 16 | Notifications List | All past alerts |
| 17 | Notification Detail | Single event — zone, price, outcome |
| 18 | Leaderboard | All strategies ranked by win rate |
| 19 | Referral | Referral code + share link |

Theme: white/blue, Inter font, pill tab bar.

---

## Tech Stack

| Layer | Tool | Reason |
|-------|------|--------|
| Framework | Expo (React Native) | Fastest path to iOS + Android from one codebase |
| Language | TypeScript | Matches frontend repo |
| Navigation | Expo Router (file-based) | Same mental model as Next.js |
| State | Zustand | Lightweight, no boilerplate |
| API client | TanStack Query + fetch | Caching, background refresh, WS hooks |
| Auth | BetterAuth SDK + Phantom Connect mobile | Same auth service as web |
| Wallet | `@solana/mobile-wallet-adapter` | Standard for Solana mobile |
| Real-time | Native WebSocket → `ws/live` FastAPI endpoint | Same WS the web dashboard uses |
| Push notifications | Expo Notifications + FCM/APNs | Zone touch, TP hit, SL alerts |
| Charts | Victory Native XL | Lightweight P&L sparklines (no full charting needed) |
| Styling | NativeWind (Tailwind for RN) | Matches web Tailwind classes |
| Build/deploy | EAS Build (Expo Application Services) | OTA updates, no App Store wait for patches |

---

## Architecture

```
Mobile App (Expo)
        │
        ├── BetterAuth (auth.tradelikeme.xyz) — login, session, JWT
        │
        ├── FastAPI (api.tradelikeme.xyz) — REST + WebSocket
        │       ├── GET /strategies
        │       ├── GET /users/{id}/vaults
        │       ├── GET /users/{id}/trades
        │       ├── GET /users/{id}/pnl
        │       ├── POST /vaults/{id}/deposit
        │       ├── POST /vaults/{id}/withdraw
        │       ├── GET|POST /users/{id}/risk-mode
        │       ├── GET|POST /notifications/config
        │       └── WS /ws/live  ← real-time trade events
        │
        └── Solana (Helius RPC)
                └── Vault PDA reads (balance, epoch) — direct on-chain
```

The app never calls the trading agent directly. All data flows through FastAPI. The agent writes to the DB; FastAPI reads and serves.

---

## Auth Flow (Mobile)

```
Open app
  +-- Returning user  → stored BetterAuth session token → auto-login
  +-- New user
        +-- Email/pass  → BetterAuth
        +-- Google       → OAuth2 via Expo WebBrowser
        +-- Phantom      → @solana/mobile-wallet-adapter SIWS
              ↓
        BetterAuth session → JWT stored in SecureStore
              ↓
        All API calls use Bearer JWT
```

Phantom Connect email (web2 flow) works via WebBrowser redirect — same Phantom Connect SDK, mobile-compatible.

---

## Screen → API Mapping

| Screen | API Calls |
|--------|-----------|
| Dashboard | `GET /users/{id}/pnl`, `GET /users/{id}/positions`, agent status via WS |
| Active Trades | `GET /users/{id}/positions` + WS live updates |
| Trade History | `GET /users/{id}/trades` |
| Live Trade Detail | WS subscription filtered by `trade_id` |
| Strategies | `GET /strategies` |
| Strategy Detail | `GET /strategies/{id}` |
| Vault | `GET /users/{id}/vaults` + on-chain PDA read |
| Deposit Flow | `POST /vaults/{id}/deposit` + Phantom wallet-adapter tx sign |
| Settings | `GET|POST /users/{id}/risk-mode`, `GET|POST /notifications/config` |
| Leaderboard | `GET /strategies` sorted by win_rate |
| Notifications List | `GET /notifications/history` |

---

## Push Notifications

Expo Notifications registers FCM (Android) / APNs (iOS) device tokens. Token saved to backend via `POST /notifications/config`.

**Events that trigger push:**
| Event | Source | Push Message |
|-------|--------|-------------|
| `ZONE_TOUCH` | sentinel.py → notifier.py | "SOL approaching demand zone $145.20 — entry imminent" |
| `TRADE_ENTERED` | trade_agent.py | "SOL LONG entered $145.00. TP1 $152, SL $141" |
| `TP1_HIT` | sentinel.py | "SOL TP1 hit +3.2%. SL moved to break-even." |
| `TP2_HIT` | trade_agent.py | "SOL TP2 hit +6.8%. Trade closed. +$124.50" |
| `SL_HIT` | sentinel.py | "SOL SL hit. -$48.20. Agent continues scanning." |
| `BALANCE_LOW` | loop.py | "Balance below $40. Consider deposit." |
| `AGENT_DOWN` | sentinel.py health check | "Agent offline. Check dashboard." |
| `DAILY_SUMMARY` | scheduled | "Today: 2 trades, +$87.40, win rate 89%" |

The existing `notifier.py` already has all 8 event templates. We add a `channels/push.py` alongside `channels/telegram.py` to dispatch to Expo push endpoint.

---

## Folder Structure

```
mobile/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── onboarding/
│   │       ├── slide1.tsx
│   │       ├── slide2.tsx
│   │       └── slide3.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx        ← pill tab bar (Dashboard, Trades, Vault, Strategies, Settings)
│   │   ├── index.tsx          ← Dashboard
│   │   ├── trades.tsx         ← Active Trades + Trade History tabs
│   │   ├── vault.tsx          ← Vault + Deposit Flow
│   │   ├── strategies.tsx     ← Marketplace + Leaderboard
│   │   └── settings.tsx       ← Risk mode, notifications, account
│   ├── trade/[id].tsx         ← Live Trade Detail
│   ├── strategy/[id].tsx      ← Strategy Detail
│   ├── notification/[id].tsx  ← Notification Detail
│   ├── referral.tsx
│   └── _layout.tsx            ← root layout, auth gate
├── components/
│   ├── PnLCard.tsx
│   ├── TradeRow.tsx
│   ├── VaultCard.tsx
│   ├── AgentStatusBadge.tsx
│   ├── RiskModePicker.tsx
│   └── DepositModal.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useTrades.ts
│   ├── useVault.ts
│   ├── useLiveWS.ts           ← WebSocket /ws/live
│   └── useStrategies.ts
├── lib/
│   ├── api.ts                 ← typed fetch wrapper (base URL + JWT inject)
│   ├── auth.ts                ← BetterAuth mobile client
│   └── solana.ts              ← Helius RPC + PDA reads
├── store/
│   └── auth.ts                ← Zustand: user, session, JWT
├── app.json
├── eas.json
├── package.json
└── tailwind.config.js
```

---

## Build Phases

### Phase 1 — Core (2 weeks)
- [ ] M1 — Expo project init (`expo init mobile --template tabs`)
- [ ] M2 — EAS Build config + `.env` setup (API URL, auth URL)
- [ ] M3 — BetterAuth mobile client + SecureStore session persistence
- [ ] M4 — Login / Signup screens (email + Google OAuth)
- [ ] M5 — Onboarding 3-slide flow (show once on first install)
- [ ] M6 — Tab navigation shell (5 tabs, pill style per design)
- [ ] M7 — Dashboard screen — P&L summary, agent status badge
- [ ] M8 — Active Trades screen — positions list + WS live updates
- [ ] M9 — Trade History screen — closed trades, win rate
- [ ] M10 — Vault screen — balance, epoch info, deposit/withdraw buttons
- [ ] M11 — Deposit Flow — amount input → Phantom wallet-adapter tx sign
- [ ] M12 — Strategies marketplace listing
- [ ] M13 — Strategy Detail screen

### Phase 2 — Polish (1 week)
- [ ] M14 — Expo push notification registration + `channels/push.py` on backend
- [ ] M15 — Notification settings in Settings screen
- [ ] M16 — Notifications List + Notification Detail screens
- [ ] M17 — Leaderboard (strategies sorted by win rate)
- [ ] M18 — Referral screen + share link
- [ ] M19 — Live Trade Detail with zone info
- [ ] M20 — NativeWind styling pass — match mobileapp.pen white/blue theme exactly

### Phase 3 — Release
- [ ] M21 — EAS Build iOS + Android
- [ ] M22 — TestFlight (iOS) + internal track (Android) for QA
- [ ] M23 — App Store + Google Play submission

---

## Key Design Decisions

1. **Expo, not bare React Native** — OTA updates mean we can patch without waiting for App Store review. Critical for a trading app where bugs need instant fixes.

2. **FastAPI as the only data source** — The mobile app never reads SQLite directly or calls the agent. Same API as the web dashboard. One backend to maintain.

3. **No charting library** — Matches the web decision. Users see P&L numbers and trade rows, not live candlestick charts. Victory Native for sparklines only.

4. **Phantom wallet-adapter mobile** — `@solana/mobile-wallet-adapter` is the standard. Phantom app handles signing; our app requests the transaction. No private keys ever in our app.

5. **Push via Expo Notifications** — Simpler than raw FCM/APNs. One push endpoint, works on both platforms. Backend sends via `channels/push.py` — same dispatcher pattern as `channels/telegram.py`.

6. **SecureStore for JWT** — Never AsyncStorage for auth tokens. Expo SecureStore is encrypted on device.

---

## What This Does NOT Do

- No live candlestick charts (strategy privacy — don't expose zone logic visually)
- No CEX API key management (Phase 2, web-only for now)
- No agent control (start/stop) — admin-only, stays on web
- No TradingView or KLineChart integration in mobile

---

## Dependencies on Existing Work

| Dependency | Status | Notes |
|------------|--------|-------|
| FastAPI backend routes | BUILT | All 16 endpoints ready |
| BetterAuth service | LIVE | `auth.tradelikeme.xyz` deployed |
| WebSocket `/ws/live` | BUILT | Real-time push to dashboard |
| `notifier.py` dispatcher | BUILT, gap | `notifier.send()` not yet wired in handlers — must fix before push works end-to-end |
| Vault deposit/withdraw | STUB | Backend returns mock — needs `anchor_vault_client` integration first |

**Blocking items before Phase 1 complete:**
1. Wire `notifier.send()` in `trade_agent.py` and `loop.py` (existing gap from CLAUDE.md)
2. Anchor vault client integration (so deposit/withdraw aren't stubs)

---

## Estimated Timeline

| Phase | Duration | Outcome |
|-------|----------|---------|
| Phase 1 | 2 weeks | Working app — auth, dashboard, trades, vault, strategies |
| Phase 2 | 1 week | Push notifications, leaderboard, referral, full design polish |
| Phase 3 | 1 week | App Store + Google Play submission |

**Total: ~4 weeks from start to stores.**
