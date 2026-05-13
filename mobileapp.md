# TradeLikeMe Mobile App — Build Plan

## Overview
React Native + Expo app for Android (iOS later). Clean, light-theme fintech UI. Same brand as web.
Lives at `mobile/` inside the existing `tradelikeme` repo.
Post-hackathon build — no May 11 pressure.

**No Android Studio required.** Expo EAS Build compiles APK in the cloud — you just run a command and download the APK link.

---

## Decision Log

| Decision | Choice | Reason |
|----------|--------|--------|
| Framework | React Native + Expo | No Android Studio needed, you already know React, cloud builds via EAS |
| Theme | Light (white bg, subtle shadows) | Clean fintech feel — Revolut/Cash App/Coinbase style |
| Accent color | Blue `#3B82F6` | Trust, tech, consistent with brand |
| Distribution | APK only (Android first) | Zero store fees, faster to ship, iOS later |
| Auth | Email/pass + Google/GitHub + Magic link + Phantom wallet | Full BetterAuth stack |
| Charts | None | Clean list-based UI, faster to build |
| Notifications | Native push + Telegram (alongside) | Maximum user reach |
| Real-time | WebSocket + polling fallback | /ws/live primary, REST every 30s fallback |
| Offline | None | Always-online trading app |
| Manual trade entry | No | Agent-only, app is read-only for trade execution |
| Manual close | Yes | Emergency exit button per open position |
| Deposit/withdraw | Phantom deep-link | Tap → Phantom mobile signs tx → returns to app |

---

## What You Need to Install (that's it)

```bash
# Node.js — you likely already have it
node --version   # must be 18+

# Expo CLI + EAS CLI
npm install -g expo-cli eas-cli

# Sign up at expo.dev (free account)
```

To build APK: `eas build -p android --profile preview`
Expo builds it in the cloud, emails you a download link. No Android Studio, no SDK, no emulator required.

---

## Screens (10 total)

### 1. Splash / Onboarding
- TradeLikeMe logo + blue accent
- Value prop: "89% win rate. Verified. Automated."
- Get Started / Log In buttons
- Skip for returning users (check auth token on launch)

### 2. Login
- Email + password
- Google OAuth button
- GitHub OAuth button
- "Send magic link" option
- Link to signup
- BetterAuth session token stored in Expo SecureStore

### 3. Signup
- Email + password fields
- Google / GitHub
- Email verification banner (same flow as web)

### 4. Home / Dashboard
- Greeting + account name
- Summary cards row: Total P&L | Win Rate | Open Trades
- Recent activity feed (last 5 trade events)
- Quick links: Active Trades, Vault, Strategies
- WebSocket live updates on P&L cards

### 5. Active Trades
- List of open positions
  - Coin, direction (LONG/SHORT badge), entry price
  - Current price (live WS)
  - Unrealised P&L (green/red)
  - TP1 / TP2 / SL levels
- Swipe-to-reveal or tap → "Close Position" button
  - Confirmation modal before calling backend
  - Calls agent close endpoint

### 6. Trade History
- Closed trades, newest first
- Each row: coin, direction, entry → exit, P&L, date
- Filter bar: All / Wins / Losses / by coin
- Pull-to-refresh

### 7. Strategies Marketplace
- Card per strategy: name, tier (S/A/B/C), win rate, monthly return, fee %
- Tap card → strategy detail screen
  - Stats table, trade sample, rules summary
  - Subscribe button → confirms risk mode selection
- Our strategy shown first with "Verified" badge

### 8. Vault / Portfolio
- Total deposited, current value, unrealised gain
- Per-strategy allocation breakdown
- Deposit button → deep-link to Phantom mobile app (signs Drift vault tx) → returns
- Withdraw button → same Phantom deep-link flow
- Balance history (simple list: epoch start/end, profit, our 20% cut shown)

### 9. Settings / Profile
- Account: name, email, connected wallet address
- Risk mode selector: Conservative / Medium / Aggressive
- Notifications: toggle push on/off, toggle Telegram on/off
- Connected wallets: Phantom disconnect
- Logout

### 10. Notification Detail (deep-link target)
- Tapping a push notification opens this screen
- Shows the event: ZONE_TOUCH / TP1_HIT / SL_HIT etc.
- Links to relevant active trade or history entry

---

## Tech Stack

| Layer | Tool |
|-------|------|
| Framework | React Native 0.76+ (New Architecture) |
| Build & distribution | Expo SDK 52 + EAS Build (cloud APK) |
| Language | TypeScript (same as your frontend) |
| Navigation | Expo Router (file-based, same feel as Next.js) |
| State management | Zustand (lightweight, simple) |
| HTTP client | Axios + axios-retry |
| WebSocket | React Native built-in WebSocket + reconnect hook |
| Auth storage | expo-secure-store (JWT token, encrypted) |
| Push notifications | expo-notifications + FCM (Android) |
| Phantom deep-link | expo-linking + expo-web-browser |
| Google OAuth | expo-auth-session (PKCE flow, no native SDK needed) |
| GitHub OAuth | expo-auth-session (same) |
| UI components | React Native Paper (Material 3, light theme) |
| Animations | React Native Reanimated 3 (smooth, 60fps) |
| Icons | @expo/vector-icons (Ionicons) |
| Code sharing | Share `types/`, `api/` with `frontend/` |

---

## Code Sharing with Frontend

Because both are TypeScript, you can share:

```
mobile/src/shared/   →  symlink or copy from  →  frontend/src/
├── types/api.ts         (trade, position, strategy, vault types)
├── api/client.ts        (Axios instance with auth header)
├── api/endpoints.ts     (all API endpoint functions)
└── constants.ts         (API base URL, event names)
```

This means you write the API layer once and both web + mobile use it. This is the #1 advantage over Flutter.

---

## Backend Integration

All calls go to `https://api.tradelikeme.xyz`. Auth via BetterAuth JWT in `Authorization: Bearer` header.

| Screen | Endpoint |
|--------|----------|
| Dashboard P&L | `GET /users/{id}/pnl` + `WS /ws/live` |
| Active trades | `GET /users/{id}/positions` |
| Close trade | `POST /agent/{strategy_id}/close` |
| Trade history | `GET /users/{id}/trades` |
| Strategies | `GET /strategies` + `GET /strategies/{id}` |
| Subscribe | `POST /subscriptions` |
| Vault balance | `GET /users/{id}/vaults` |
| Deposit/Withdraw | Phantom deep-link → Drift vault tx (on-chain) |
| Risk mode | `GET|POST /users/{id}/risk-mode` |
| Notif config | `GET|POST /notifications/config` |

---

## Push Notifications

Expo Notifications + Firebase Cloud Messaging (FCM) for Android. FCM token sent to backend on login.
Backend's `notifier.py` needs a new `channels/fcm.py` that calls FCM HTTP v1 API.

Event mapping (same 8 events from notifier.py):
- `ZONE_TOUCH` → "Zone touched: {coin} at ${price}"
- `TRADE_ENTERED` → "Trade entered: {coin} {direction}"
- `TP1_HIT` → "TP1 hit! {coin} +{pnl}"
- `TP2_HIT` → "TP2 hit! Trade complete. +{total_pnl}"
- `SL_HIT` → "SL hit. {coin} -{loss}"
- `BALANCE_LOW` → "Balance low: ${balance} remaining"
- `AGENT_DOWN` → "Agent offline — check dashboard"
- `DAILY_SUMMARY` → "Daily: {n} trades, P&L: ${pnl}"

Tapping any notification deep-links to the relevant screen via Expo Router.

---

## Phantom Deep-Link Flow (Deposit)

1. App builds a Drift vault deposit transaction (serialized)
2. `expo-linking` opens `phantom://ul/v1/signAndSendTransaction?...`
3. Phantom mobile shows signing prompt
4. User approves → Phantom returns to app via universal link `tradelikeme://phantom-callback`
5. `expo-linking` event listener catches the return URL, extracts tx signature
6. App calls backend `POST /vaults/{id}/deposit` with the signature to record

Same flow for withdraw. Requires registering `tradelikeme://` as a custom URL scheme in `app.json`.

---

## Folder Structure

```
mobile/
├── app.json                          ← Expo config (name, scheme, icons)
├── eas.json                          ← EAS Build profiles (preview APK, production)
├── package.json
├── tsconfig.json
└── src/
    ├── app/                          ← Expo Router screens (file = route)
    │   ├── index.tsx                 ← Splash / redirect
    │   ├── (auth)/
    │   │   ├── login.tsx
    │   │   └── signup.tsx
    │   ├── (tabs)/                   ← Bottom tab navigator
    │   │   ├── _layout.tsx           ← Tab bar config
    │   │   ├── dashboard.tsx
    │   │   ├── trades.tsx
    │   │   ├── strategies.tsx
    │   │   └── vault.tsx
    │   └── settings.tsx
    ├── components/
    │   ├── PnlCard.tsx               ← green/red P&L summary card
    │   ├── TradeRow.tsx              ← single trade list item
    │   ├── StrategyCard.tsx          ← strategy marketplace card
    │   ├── CloseTradeModal.tsx       ← confirmation modal
    │   └── LoadingSkeleton.tsx       ← shimmer loading state
    ├── store/
    │   ├── authStore.ts              ← Zustand: user, JWT token
    │   ├── tradesStore.ts            ← Zustand: positions, history
    │   └── dashboardStore.ts         ← Zustand: P&L, WS connection
    ├── api/
    │   ├── client.ts                 ← Axios instance, auth header
    │   ├── auth.ts                   ← login, signup, logout, magic link
    │   ├── trades.ts                 ← positions, history, close
    │   ├── strategies.ts             ← list, detail, subscribe
    │   └── vault.ts                  ← balance, deposit, withdraw
    ├── hooks/
    │   ├── useWebSocket.ts           ← WS connection + polling fallback
    │   └── usePhantomDeepLink.ts     ← deposit/withdraw deep-link logic
    ├── notifications/
    │   └── fcm.ts                    ← FCM token init + send to backend
    ├── theme/
    │   └── index.ts                  ← light theme, blue #3B82F6, typography
    └── types/
        └── api.ts                    ← Trade, Position, Strategy, Vault types
```

---

## Backend Changes Required

New file: `trading_agent/channels/fcm.py`
```python
# Calls FCM HTTP v1 API with device token + notification payload
# Called by notifier.py alongside telegram.py
```

Update `notifier.py`: add FCM channel alongside Telegram for all 8 event types.
Store FCM tokens in Supabase: new column `fcm_token` on users table (or separate `device_tokens` table for multi-device).

---

## Build Timeline (post-hackathon)

| Phase | Duration | Work |
|-------|----------|------|
| 1. Setup | 1 day | Expo project init, Expo Router, Zustand, theme, EAS config |
| 2. Auth | 2 days | Login/signup/magic link screens, BetterAuth integration, SecureStore |
| 3. Dashboard | 2 days | Home screen, WS live feed, P&L cards |
| 4. Trades | 2 days | Active trades + close modal, trade history + filters |
| 5. Strategies | 1 day | Marketplace list + detail + subscribe |
| 6. Vault | 2 days | Balance display, Phantom deep-link deposit/withdraw |
| 7. Settings + Notifications | 1 day | Settings screen, FCM setup, risk mode |
| 8. Polish + APK | 1 day | Light theme polish, EAS build, test APK |
| **Total** | **~12 days** | MVP Android APK |

---

## What Does NOT Need to Be Built (out of scope)

- Price charts (no candlesticks in app — clean list UI only)
- Manual trade entry / signal input (agent is fully autonomous)
- iOS App Store submission (Android APK first)
- CEX API mode UI (Solana vault mode only for v1)
- Offline mode / local cache

---

## iOS Notes (future)

When ready for iOS:
1. Add Apple Developer account ($99/yr)
2. Run `eas build -p ios --profile production`
3. EAS builds the IPA in the cloud (no Mac needed for builds)
4. Submit to TestFlight → App Store via `eas submit -p ios`

Same codebase — zero code changes for iOS. Just need the Apple developer account.

---

## Open Questions (to resolve before build)

- [ ] Does the backend have a `POST /agent/{strategy_id}/close` endpoint? If not, add it.
- [ ] Where does the FCM token get stored — `users` table or separate `device_tokens`?
- [ ] Phantom deep-link: does the existing backend anchor vault client accept a pre-signed tx, or does it build + sign server-side?
- [ ] Google OAuth on mobile: need a separate OAuth client ID for Android in Google Cloud Console.
