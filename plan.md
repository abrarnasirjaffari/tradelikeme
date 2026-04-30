# TradeLikeMe — Build Plan

*Being filled in via Q&A session — Apr 29, 2026*

---

## Scope

- **This repo** (`tradelikeme`): Python trading platform — agent, sentinel, zone scanner, exchange clients, FastAPI backend, notifications, profit tracker
- **Separate repo** (`tradelikeme-website`): Next.js website + dashboard — already built, waitlist live
- **Merge is planned but deferred** — `tradelikeme-website` will be merged into this repo under `frontend/` once the main platform (Python backend + Solana) is complete
- Frontend is NOT touched until merge happens

---

## Build Approach

- Start **from scratch** — no code copied from AgentTeam
- All new, clean codebase

---

## Exchange Layer

### CEX (Phase 1 — build now)
- WEEX
- Bybit
- BingX
- Binance
- Bitget
- More added as we grow

### Forex (On Hold)
- Research needed to decide which broker APIs to integrate
- Not building until research is done

### Decentralized / Solana (START HERE — hackathon priority)
- Phantom wallet connect
- This is the main part for the hackathon
- Details TBD next

---

## Notifications

### Phase 1 — build now
- Telegram
- WhatsApp

### Later
- More channels added as we grow

---

## Decentralized / Solana Stack

### Protocols (auto-routed in priority order)
1. **Zeta Markets** (`zetamarkets-py`) — first choice. Official Python SDK on PyPI, REST API + WebSocket, Anchor IDL published, SOL/BTC/ETH/APT/ARB, 50x. Program ID: `ZETAxsqBRPpep611126PjPNs6pCgB28B47v1vX61X6`
2. **Jupiter Perps** (anchorpy + on-chain IDL) — fallback, BTC/SOL/ETH only, 100x. Program ID: `PERPHjGBqRHArX4DySjwM6UJHiR3sWAatqfdBS2qQJu`

**Removed:**
- ~~Raydium Perps~~ — confirmed does NOT have its own on-chain perps engine. perps.raydium.io routes to other protocols. No program ID, no IDL, no SDK.
- ~~Drift Protocol~~ — hacked Apr 1 2026 ($285M exploit), vaults drained, protocol paused. Unlikely to recover within hackathon window.

### Anchor Vault Program (custom — core of hackathon)
- User deposits USDC/CASH into our **vault PDA** (on-chain)
- Vault delegates trading authority to agent (trade only, never withdraw)
- Agent calls `settle_epoch()` monthly → contract auto-splits: 20% to platform wallet, 80% stays user-claimable
- User calls `withdraw()` anytime for their share
- 4 instructions: `deposit()`, `delegate_to_protocol()`, `settle_epoch()`, `withdraw()`
- ~300–400 lines Anchor — fully trustless, no human in the loop
- **This is what no other competitor has**

### Profit Settlement Rules
- Every month-end agent calls `settle_epoch()` automatically
- Contract calculates profit since last epoch (closing balance − opening balance)
- **20% of profit sent directly to platform wallet — on-chain, automatic, no human involved**
- User's 80% stays inside the vault — they can compound freely
- User withdraws whenever they want — their choice entirely
- If user compounds and balance grows, next epoch profit is calculated on the larger balance — we still take 20% of whatever profit is made
- We only touch our 20% — user's principal + their 80% profit share is never touched by us

### Price Feed
- **Pyth Network** — shared oracle for all 3 protocols, WebSocket real-time

### RPC
- **Helius** — free tier (~5% usage)

### Wallet & Auth
- **Phantom Connect** (`@phantom/connect`) — email sign-in for web2 users (hackathon sponsor)
- **@solana/wallet-adapter** — native wallet connect + signs Drift delegation tx

### Stablecoin
- **CASH** + **USDC** — accepted as deposits

### Auth Framework
- **BetterAuth** — sessions, social login, 2FA, roles — all auth paths converge to unified session + JWT

### Custody Model
- Agent gets **trade-only** sub-account delegation — can trade, can NEVER withdraw
- Trustless — no smart contract needed, Drift delegation handles it natively

### Profit Settlement (On-chain — TO DECIDE)
- Research: can we encode 20% profit share logic into a Solana smart contract / Drift hook so month-end split to our wallet is automatic and trustless?
- Status: under consideration (see below)

---

## CEX Profit Settlement
- Users send 20% manually — honour system for now
- Automated enforcement to be built later
- **Not a priority — focus on Solana first**

---

## Build Order

### Phase 1 — Hackathon (NOW)
1. KLineChart MCP server — combined KLineChart + Pro, 8 tools, Playwright headless
2. Anchor vault program (on-chain profit split)
3. Zeta Markets client (primary Solana perps)
4. Jupiter Perps client (fallback, higher leverage)
5. Pyth price feed WebSocket
6. Agent brain wired to Solana protocols
7. Phantom Connect auth
8. Telegram notifications
9. Demo + submit

### Phase 2 — Post Hackathon
- **Merge `tradelikeme-website` into this repo** under `frontend/` (deferred until platform is complete)
- Wire frontend to FastAPI backend (deposit, withdraw, trades, P&L, WS)
- CEX clients (WEEX, Bybit, BingX, Binance, Bitget)
- CEX profit settlement system
- Third Solana protocol: Mango Markets (50x, Python via AgentiPy) — research when ready
- Forex (research needed)
- More notification channels
- WhatsApp notifications (Twilio)
- Raydium Perps — revisit once they publish IDL/SDK (protocol is live but no Python path yet)

---

## Zone Scanning

We build a **KLineChart MCP server** — a self-hosted TradingView replacement that Claude controls directly like a human uses a chart.

### Why MCP over Playwright-in-Python
- Claude calls MCP tools directly — no Python middleman needed
- One MCP server works for all strategies, all agents, forever
- Claude can scroll, zoom, switch timeframes, toggle indicators — full control
- Screenshot tool returns PNG base64 — Claude analyzes inline
- Reusable open-source tool (good for hackathon composability score)

### How It Works
```
Claude calls MCP tool
        ↓
KLineChart MCP server (Node.js)
        ↓
Playwright headless browser (internal)
        ↓
chart/index.html — KLineChart + KLineChart Pro combined, 1400×700px
        ↓
CryptoDatafeed.ts — fetches OHLCV from exchange REST / Pyth fallback
        ↓
screenshot() tool returns base64 PNG
        ↓
Claude Opus 4.6 analyzes for S/D zones
        ↓
[{type, top, bottom, tf, strength}]
```

### MCP Tools Exposed
- `open_chart(symbol, timeframe)` — load chart with candles
- `set_symbol(symbol)` — change symbol
- `set_timeframe(tf)` — change timeframe (15m / 1H / 4H / 1D etc)
- `toggle_indicator(name)` — show/hide MA, RSI, MACD, BOLL, VOL etc
- `screenshot()` — capture PNG, return base64
- `get_ohlcv(symbol, tf, limit)` — return raw candle data as JSON
- `scroll_chart(bars)` — scroll backward in time
- `get_price(symbol)` — return current price

### Chart Stack
- `infra/klinechart/` — KLineChart v10 canvas engine (peer dep)
- `infra/klinechart-pro/` — KLineChart Pro full UI (all indicators)
- `infra/klinechart-mcp/` — MCP server (Node.js + Playwright + MCP SDK)
  - `src/index.ts` — MCP server entry, registers all tools
  - `src/browser.ts` — Playwright browser lifecycle manager
  - `src/tools/` — one file per MCP tool
  - `chart/index.html` — headless render page (KLineChart + Pro combined)
  - `chart/datafeed.ts` — CryptoDatafeed (exchange REST + Pyth fallback)

### Indicators (keep all for now)
All built-in KLineChart Pro indicators kept: MA, EMA, MACD, RSI, BOLL, VOL, KDJ, etc.

### Fallback
- TradingView MCP remains fallback if KLineChart MCP server is down
- zones.py catches MCP timeout → falls back to TradingView MCP

---

## Multi-Strategy Isolation

Each strategy runs in its own **isolated agent instance** — completely sandboxed:

```
Strategy A (our S/D strategy)     Strategy B (trader X's strategy)
        │                                   │
   Agent Instance A               Agent Instance B
   - own config                   - own config
   - own positions                - own positions
   - own journal (SQLite)         - own journal (SQLite)
   - own Solana sub-account       - own Solana sub-account
   - own CEX API keys             - own CEX API keys
   - own sentinel                 - own sentinel
        │                                   │
        └──────────── FastAPI ──────────────┘
                   (routes by strategy_id + user_id)
```

**Rules:**
- One agent process per strategy — never shared
- Each strategy gets its own SQLite DB file (`strategy_A.db`, `strategy_B.db`)
- Each user's delegation is tied to one strategy's sub-account only
- User can follow multiple strategies — each gets a separate vault/sub-account
- Strategies cannot read each other's state, positions, or funds
- Dokploy runs each strategy agent as a separate Docker container

---

## Vault Architecture

- **One vault PDA per (user × strategy)** — fully separate on-chain
- User following 2 strategies = 2 vaults, 2 sub-accounts, 2 agent instances
- Funds in Vault A are physically unreachable by Strategy B's agent — enforced by Solana
- Vault PDA seeds: `[b"vault", user_pubkey, strategy_id]` — unique per combination
- Each vault tracks its own: opening balance, current balance, epoch profit, platform fees owed
- `settle_epoch()` on Vault A never touches Vault B — completely independent

---

## Strategy Marketplace Onboarding

- Trader fills a form on the website (tradelikeme-website — not this project)
- We review manually: verify trades on TradingView, check win rate, strategy rules
- If approved: we automate the strategy into a new agent instance ourselves
- No self-serve automation — fully manual onboarding by us
- Platform adds the strategy to the marketplace after verification

---

## Strategy Rules Architecture — Hybrid

- **Core logic** → Python class per strategy (entry rules, SL method, TP method, zone analysis)
- **Tuneable parameters** → SQLite row per strategy (coins, leverage, risk modes, SL%, TP zones, session hours, max positions)
- Agent loads parameters from DB at startup, executes the logic class
- Updating params (e.g. coin list, leverage) = update DB row — no code redeploy needed
- Adding a new strategy = one new Python class + one DB row insert

```
BaseStrategy (abstract class)
    └── SDZoneStrategy      ← our strategy (S/D zones, body-close SL)
    └── StrategyB           ← future marketplace trader
    └── ForexStrategy       ← forex variant (same base, different session logic)
```

- Works identically across Solana, CEX, Forex — execution layer is fully separate
- Same strategy class calls `exchange_base.py` methods regardless of which market

---

## Database Architecture

- **One SQLite file per strategy** — fully isolated
- Naming: `strategy_{id}.db` (e.g. `strategy_sd_zones.db`, `strategy_b.db`)
- Each DB contains: trades, positions, journal entries, user subscriptions, epoch balances for that strategy only
- **One shared SQLite** for platform-level data: users, auth sessions, strategy registry, notification prefs
- Structure:

```
platform.db          ← shared: users, auth, strategy list, notification config
strategy_sd.db       ← isolated: all trades/positions/P&L for S/D zone strategy
strategy_b.db        ← isolated: all trades/positions/P&L for strategy B
```

- FastAPI reads from `platform.db` for auth + routes queries to the right `strategy_{id}.db`
- No cross-strategy DB access ever

---

## User Risk Modes

- 3 presets: **Conservative / Medium / Aggressive**
- Mode selection UI lives on the website (tradelikeme-website — not this project)
- This platform stores the user's chosen mode in `platform.db` and agent reads it at runtime
- We define the exact leverage + margin parameters for all 3 modes (TBD)

---

## FastAPI Backend — Endpoints

### Public (website calls these, JWT required)
- `GET /strategies` — list all strategies with live stats
- `GET /strategies/{id}` — single strategy detail + performance history
- `POST /subscriptions` — user subscribes to a strategy
- `DELETE /subscriptions/{id}` — unsubscribe
- `GET /subscriptions` — user's active subscriptions
- `GET /users/{id}/vaults` — user's vaults (one per strategy)
- `GET /users/{id}/positions` — open positions across all strategies
- `GET /users/{id}/trades` — trade history (filterable by strategy + date)
- `GET /users/{id}/pnl` — P&L summary (total, per strategy, per month)
- `POST /vaults/{id}/deposit` — initiate deposit
- `POST /vaults/{id}/withdraw` — initiate withdrawal
- `GET /users/{id}/risk-mode` — get current risk mode
- `POST /users/{id}/risk-mode` — update risk mode
- `GET /notifications/config` — get notification channel settings
- `POST /notifications/config` — update notification channels
- `POST /notifications/test` — fire test notification
- `GET /notifications/history` — last N alerts sent

### Internal only (agent + admin, not exposed to website)
- `POST /agent/{strategy_id}/start` — start agent
- `POST /agent/{strategy_id}/stop` — stop agent
- `GET /agent/{strategy_id}/status` — health check
- `POST /strategies` — add new strategy to marketplace (admin)
- `GET /admin/users` — all users
- `GET /admin/revenue` — platform fees + total P&L collected

### WebSocket
- `WS /ws/live` — real-time push to website dashboard (price, position changes, TP/SL hits)

---

## AI / Claude Setup
- Claude Opus 4.6 via **AWS Bedrock** (not Anthropic direct API)
- AWS credentials already in `.env` (IAM user: claude-code-bedrock)
- Region: us-east-1

---

## Deployment
- All services on **AWS EC2 t3.xlarge** (already running)
- **Dokploy** — self-hosted PaaS, manages all containers
- Each strategy agent = separate Docker container
- `docker-compose.yml` defines all services
- Traefik handles routing + auto SSL
- Domains: `api.tradelikeme.xyz` → FastAPI, `dash.tradelikeme.xyz` → Dokploy dashboard

---

## Project Folder Structure

```
tradelikeme/
├── trading_agent/
│   ├── base/
│   │   ├── base_strategy.py       # Abstract strategy class
│   │   ├── exchange_base.py       # Abstract exchange interface
│   │   ├── notifier.py            # Multi-channel notification dispatcher
│   │   └── config.py              # Platform-wide constants
│   ├── strategies/
│   │   └── sd_zones/              # Our S/D zone strategy
│   │       ├── agent.py           # Strategy agent instance
│   │       ├── loop.py            # Orchestrator
│   │       ├── trade_agent.py     # Per-trade monitor
│   │       ├── sentinel.py        # WS price watcher
│   │       ├── zones.py           # Zone scanner (KLineChart Pro + TV MCP fallback)
│   │       ├── journal.py         # SQLite persistence
│   │       ├── state.py           # Runtime state
│   │       └── config.py          # Strategy-specific params
│   ├── exchanges/
│   │   ├── solana/
│   │   │   ├── zeta_client.py     # Zeta Markets Perps (primary)
│   │   │   ├── jupiter_client.py  # Jupiter Perps (fallback, higher leverage)
│   │   │   ├── pyth_ws.py         # Pyth oracle WebSocket
│   │   │   └── anchor_vault/      # Custom Anchor program (Rust)
│   │   └── cex/
│   │       ├── weex.py
│   │       ├── bybit.py
│   │       ├── bingx.py
│   │       ├── binance.py
│   │       └── bitget.py
│   └── channels/
│       ├── telegram.py
│       ├── whatsapp.py
│       └── (more later)
├── backend/
│   ├── main.py                    # FastAPI app entry point
│   ├── routes/                    # All API routes
│   ├── models/                    # SQLAlchemy models
│   └── platform.db                # Shared DB (users, auth, strategy registry)
├── frontend/                      # Next.js app (merged from tradelikeme-website)
│   ├── app/                       # Next.js app router pages
│   ├── components/                # Shared UI components
│   ├── public/                    # Static assets
│   └── package.json
├── infra/
│   ├── klinechart/                # KLineChart v10 canvas engine (cloned)
│   ├── klinechart-pro/            # KLineChart Pro UI (cloned + adapted)
│   ├── klinechart-mcp/            # KLineChart MCP server (NEW — replaces chart_server)
│   │   ├── src/
│   │   │   ├── index.ts           # MCP server entry point, tool registration
│   │   │   ├── browser.ts         # Playwright browser lifecycle
│   │   │   └── tools/             # One file per MCP tool
│   │   ├── chart/
│   │   │   ├── index.html         # Headless chart page (KLineChart + Pro combined)
│   │   │   └── datafeed.ts        # CryptoDatafeed (exchange REST + Pyth fallback)
│   │   └── package.json
│   └── docker-compose.yml
└── .env.example
```

---

## Tech Stack Summary

| Layer | Tool |
|-------|------|
| Language | Python 3.11 asyncio |
| Solana Perps | Zeta Markets (primary) + Jupiter Perps (fallback) |
| Solana Vault | Custom Anchor program (Rust) |
| Price Oracle | Pyth Network WebSocket |
| RPC | Helius (free tier) |
| Wallet Auth | Phantom Connect + @solana/wallet-adapter |
| Stablecoin | CASH + USDC |
| CEX (Phase 2) | WEEX, Bybit, BingX, Binance, Bitget |
| Zone Scanning | KLineChart MCP server (primary) → TradingView MCP (fallback) |
| Zone Analysis | Claude Opus 4.6 via AWS Bedrock |
| Auth | BetterAuth |
| Backend | FastAPI |
| Database | SQLite (platform.db + per-strategy DB) |
| Notifications | Telegram + WhatsApp (Phase 1) |
| Server | AWS EC2 t3.xlarge |
| Deployment | Dokploy + Docker Compose + Traefik |
| Frontend | Next.js + Tailwind (merged into this repo under `frontend/`) |

---

## What We Are NOT Building (this phase)
- Forex integration (on hold — research needed)
- Manual CEX profit settlement UI (post-hackathon)
- Raydium Perps — no IDL/SDK published yet, revisit post-hackathon
- Drift Protocol — hacked Apr 2026, not recovering within hackathon window
- Third Solana protocol beyond Zeta + Jupiter (Mango = Phase 2)
- New frontend pages beyond what user specifies — wait for direction before adding

