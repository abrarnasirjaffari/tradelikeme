# TradeLikeMe Platform — Claude Context

## What Is This Project
TradeLikeMe is a verified-strategy trading marketplace. Users deposit funds, a proven agent trades on their behalf using a human-cloned strategy with 89% win rate. Platform takes 20% profit share. Zero fees, zero subscriptions.

**This repo** (`abrarnasirjaffari/tradelikeme`) = full platform: Python trading agent + FastAPI backend + React frontend + BetterAuth service.
**`tradelikeme-website`** (separate GitHub repo) has been fully merged into `frontend/` — do NOT touch that old repo.

---

## Repo & Working Directory
- **Local path**: `F:/AgentTeam/hackathon/Platform/`
- **GitHub**: `https://github.com/abrarnasirjaffari/tradelikeme` (private)
- **Branch**: `master`
- **GitHub PAT**: in `F:/AgentTeam/.env` — key: `GITHUB_PAT`
- Do NOT touch `F:/AgentTeam/AgentTeam` repo or any file outside `F:/AgentTeam/hackathon/Platform/`

---

## EC2 Server
- **Instance**: `i-0cf0e5a7a3021b840` — `tradelikeme-prod`, Singapore (ap-southeast-1)
- **IP**: `54.179.141.76`
- **Type**: t3.large, Ubuntu 22.04
- **Disk**: 50GB (resized Apr 29 from 30GB)
- **SSH key**: `F:/AgentTeam/hackathon/Platform/telegram-windows-key.pem`
- **SSH command**: `ssh -i "F:/AgentTeam/hackathon/Platform/telegram-windows-key.pem" ubuntu@54.179.141.76`
- **Installed**: Rust 1.95.0, Solana CLI 3.1.14, Anchor CLI 0.32.1, Node.js v24.10.0, Yarn 1.22.22
- **Devnet keypair**: `~/.config/solana/devnet-agent.json` (pubkey: `35Jt4Uz9NDXAZcwUaNHqr1TMtpdgvtHKHW3NnrRRi6p4`)
- **PATH on EC2**: add `~/.cargo/bin` and `~/.local/share/solana/install/active_release/bin` to every SSH command

---

## Related Projects (read-only context — do not modify)
- `F:/AgentTeam/trading_agent/agent/` — old AgentTeam agent code (WEEX-only, single strategy). Context only — we are NOT copying from it.
- `abrarnasirjaffari/AgentTeam` — private GitHub repo for the old project. Do not push anything there.

---

## Build Status (as of May 6, 2026) — 126 commits

### DONE ✅
- **Auth service** (`auth/`) — BetterAuth v1.6.9 on Hono, deployed at `auth.tradelikeme.xyz`. Google + GitHub OAuth active. Twitter disabled (creds needed). Custom Phantom SIWS plugin (Ed25519). 2FA, admin panel, rate limiting, 30-day sessions.
- **FastAPI backend** (`backend/`) — All routes built. Supabase (PostgreSQL) via SQLAlchemy. BetterAuth JWT middleware. WebSocket `/ws/live`. Vault deposit/withdraw stubs (TODO: anchor integration).
- **Frontend** (`frontend/`) — React 19 + Vite + React Router (NOT Next.js). Landing page, auth flows, blog, docs hub, waitlist/strategy submission forms. Protected routes. Phantom SIWS. Sonner toasts.
- **Trading agent** (`trading_agent/strategies/sd_zones/`) — ~85% done. Full zone scan → 5-gate check → 4-order atomic entry → sentinel TP1/body-SL → SQLite journal.
- **Exchange layer** (`trading_agent/exchanges/solana/`) — ZetaClient (primary, devnet+mainnet) + JupiterClient (fallback, mainnet only) + SolanaRouter abstraction + PythPriceFeed.
- **KLineChart MCP** (`infra/klinechart-mcp/`) — Fully built. 8 MCP tools. Playwright + Binance datafeed + Pyth fallback.
- **Docker Compose** (`infra/docker-compose.yml`) — 3 services: backend (port 8001), auth (port 3002), agent.
- **Tests** — 32 Python integration tests + 79 TypeScript Vitest tests in auth/src/.
- **Notifications** — Telegram channel built. `notifier.py` dispatcher ready. **Gap: `notifier.send()` not yet called in event handlers.**

### PENDING ⏳
- **Frontend wiring** (FE2–FE10) — Dashboard placeholder only. Need to wire `/vaults`, `/trades`, `/pnl`, WS live feed.
- **Vault anchor client** — `POST /vaults/{id}/deposit|withdraw` return mock responses. Need `anchor_vault_client` integration.
- **Notifier wiring** — `notifier.send()` defined but not imported/called in `trade_agent.py` or `loop.py`.
- **CEX layer** — `trading_agent/exchanges/cex/` is completely empty (Phase 2).
- **WhatsApp** — ON HOLD post-hackathon (Twilio).
- **Pyth symbol mapping** — 8 of 14 watchlist symbols mapped in sentinel.

### Accounts & Keys
- Helius RPC, Phantom wallet (`HgcX7tJLhHTBUXmWskaohFcr4J1NR66FMwR7iAPawP7F`), devnet keypair (`35Jt4Uz9NDXAZcwUaNHqr1TMtpdgvtHKHW3NnrRRi6p4`), Telegram bot (`@tradelikeme_alerts_bot`, chat ID `6398964627`), AWS Bedrock IAM (`claude-code-bedrock`, `us-east-1`), WEEX API key, Colosseum registration — all done.
- Twilio (WhatsApp): ON HOLD. CEX keys (Bybit/BingX/Binance/Bitget): Phase 2.

---

## What To Build Next
1. Wire `notifier.send()` into `trade_agent.py` and `loop.py` event handlers
2. Wire frontend FE2–FE10 (deposit/withdraw UI, trade history, P&L dashboard, WS live)
3. Build `anchor_vault_client` to replace deposit/withdraw stubs in backend
4. Add remaining 6 Pyth symbol mappings in sentinel

---

## Architecture Summary

### This Platform Does
- Python asyncio trading agent (strategy logic, zone scanning, trade execution)
- Custom Anchor vault program on Solana (on-chain profit split)
- FastAPI backend (REST API + WebSocket for website to consume)
- Multi-strategy isolation (each strategy = separate agent process + separate SQLite DB + separate Docker container)
- Multi-channel notifications (Telegram + WhatsApp Phase 1, more later)

### This Platform Does NOT Do (this phase)
- Forex (on hold — research needed)
- CEX clients (post-hackathon — focus is Solana first)
- Live trading dashboard UI (frontend wiring FE2–FE10 pending)

---

## Exchange Layer

### Solana (Phase 1 — built)
| Protocol | File | Coins | Leverage | Priority |
|----------|------|-------|----------|----------|
| Zeta Markets | `zeta_client.py` | SOL/BTC/ETH/APT/ARB | cross-margin USDC | 1st (primary) |
| Jupiter Perps | `jupiter_client.py` | SOL/BTC/ETH | 100x | 2nd (fallback) |

- **Router**: `SolanaRouter` (`solana_router.py`) — tries Zeta first, falls back to Jupiter on failure
- **Price oracle**: Pyth Hermes WebSocket (`pyth_ws.py`) — auto-reconnect, REST fallback
- **RPC**: Helius (free tier)
- **Wallet**: Phantom Connect + @solana/wallet-adapter
- **Stablecoin**: USDC
- **Note**: Raydium Perps was in the plan but is NOT in the codebase. Zeta is the actual primary.

### CEX (Phase 2 — not started)
`trading_agent/exchanges/cex/` is empty. WEEX, Bybit, BingX, Binance, Bitget planned via `exchange_base.py` abstraction.

### Forex (On Hold)
Research needed before any integration.

---

## Anchor Vault Program (CORE — start here)

Custom Solana smart contract. ~300-400 lines Rust/Anchor. This is what makes TradeLikeMe trustless and wins the hackathon.

**4 instructions:**
1. `deposit()` — user sends USDC/CASH to vault PDA
2. `delegate_to_protocol()` — vault authorizes agent to trade (trade only, NEVER withdraw)
3. `settle_epoch()` — called by agent monthly, auto-splits 20% profit to platform wallet on-chain
4. `withdraw()` — user pulls their balance anytime

**Vault PDA seeds**: `[b"vault", user_pubkey, strategy_id]` — one vault per (user × strategy)

**Profit settlement rules:**
- Agent calls `settle_epoch()` every month automatically
- Contract calculates: closing balance − opening balance = profit
- 20% of profit → platform wallet (on-chain, automatic, trustless)
- 80% stays in vault — user can compound freely
- User withdraws whenever they want — we never touch their principal or 80% share
- If user compounds → next epoch profit calculated on larger balance → we still take 20%

---

## Multi-Strategy Isolation

Each strategy = isolated sandbox:
- Own Python agent process
- Own SQLite database (`strategy_{id}.db`)
- Own Solana sub-account / vault
- Own sentinel (WebSocket watcher)
- Own Docker container (Dokploy)

FastAPI routes requests by `strategy_id + user_id`. Zero cross-strategy access.

---

## Strategy Architecture

### Hybrid Config Model
- Core logic → Python class per strategy (`SDZoneStrategy`, `StrategyB`, etc.)
- Tuneable params → SQLite row (coins, leverage, risk modes, SL%, TP zones, session hours)
- All inherit `BaseStrategy` abstract class
- All call `ExchangeBase` abstract methods — same code runs on Solana, CEX, Forex

### Our Strategy — S/D Zone Trading
- Entry: Supply/Demand zone reversal
- TF stack: 1M → 1W → 1D → 4H → 1H → 30M → 15M
- BTC 1D gate: no alt entries against BTC direction
- 4H zone gate: lower-TF zones need 4H zone within ±5%
- SL: structural body-close (30m candle body, not wick). Wick past SL = stop hunt = IGNORE
- TP1: 50% qty at zone 1. TP2: 50% qty at zone 2. Never zone 3-4.
- Disaster SL on exchange: structural + 3% buffer (fires only if sentinel dies)
- Max 2 concurrent positions. Min balance $35.

### Zone Scanning
KLineChart Pro is our **self-hosted TradingView replacement** — no API keys, no desktop dependency, runs headlessly on EC2.

**Pipeline**: `fetch_ohlcv(symbol, tf)` → Playwright opens `infra/chart_server/index.html?symbol=X&tf=Y` → KLineChart Pro renders candles + all indicators → wait for `data-ready` DOM signal → Playwright screenshots PNG → Claude Opus 4.6 analyzes for S/D zones

- **Primary**: KLineChart Pro + Playwright (`infra/klinechart-pro/` + `infra/chart_server/`)
- **Fallback**: TradingView MCP (triggered on chart server timeout or failure)
- **Datafeed**: `CryptoDatafeed.ts` — replaces Pro's default Polygon.io datafeed with our exchange REST / Pyth HTTP fallback
- **Indicators**: all kept for now (MA, EMA, MACD, RSI, BOLL, VOL, KDJ, etc.) — Claude benefits from volume context when identifying zones
- **Claude model**: Opus 4.6 via **AWS Bedrock** (not Anthropic direct API)
- **AWS credentials**: IAM user `claude-code-bedrock`, region `us-east-1`

**KLineChart stack:**
| Repo | Path | Version | Role |
|------|------|---------|------|
| KLineChart | `infra/klinechart/` | v10.0.0-beta1 | Canvas engine (peer dep) |
| KLineChart Pro | `infra/klinechart-pro/` | v0.1.1 | Full chart UI |
| Chart server | `infra/chart_server/index.html` | — | Headless render page for Playwright |

---

## Database Architecture

```
Supabase (PostgreSQL)   ← FastAPI + BetterAuth: users, sessions, strategies, subscriptions, notification_config
strategy_sd.db (SQLite) ← isolated per strategy: trades, epochs journal (at repo root)
```

- FastAPI uses SQLAlchemy ORM against Supabase via `SUPABASE_DATABASE_URL`
- BetterAuth uses its own Kysely adapter against the same Supabase instance
- Trading agent writes to local SQLite (`strategy_sd.db`) — not Supabase
- `platform.db` mentioned in plan.md but actual implementation uses Supabase

---

## Notifications

### Phase 1 (built, wiring gap)
- **Telegram**: `channels/telegram.py` — `send_telegram()` + `send_photo_telegram()` built. HTML message templates for all 8 events defined in `notifier.py`.
- **WhatsApp**: ON HOLD post-hackathon (Twilio).

### Architecture
```
sentinel / trade_agent
        ↓
    notifier.py  ← unified dispatcher (asyncio.gather)
        └── channels/telegram.py  ← BUILT
        (whatsapp.py — not yet)
```

### Event Types (all defined, templates written)
`ZONE_TOUCH`, `TRADE_ENTERED`, `TP1_HIT`, `TP2_HIT`, `SL_HIT`, `BALANCE_LOW`, `AGENT_DOWN`, `DAILY_SUMMARY`

### CRITICAL GAP
`notifier.send()` is defined but never imported or called in `trade_agent.py` or `loop.py`. All trade lifecycle handlers currently only log. Must add `await notifier.send(...)` calls to complete the notification loop.

---

## FastAPI Backend

### Public endpoints (website calls, JWT required)
- `GET /strategies` — list strategies with stats
- `GET /strategies/{id}` — strategy detail
- `POST /subscriptions` — subscribe to strategy
- `DELETE /subscriptions/{id}` — unsubscribe
- `GET /users/{id}/vaults` — user's vaults
- `GET /users/{id}/positions` — open positions
- `GET /users/{id}/trades` — trade history
- `GET /users/{id}/pnl` — P&L summary
- `POST /vaults/{id}/deposit` — deposit
- `POST /vaults/{id}/withdraw` — withdraw
- `GET|POST /users/{id}/risk-mode` — risk mode
- `GET|POST /notifications/config` — notification settings
- `POST /notifications/test` — test notification
- `WS /ws/live` — real-time push to dashboard

### Internal only
- `POST|GET /agent/{strategy_id}/start|stop|status`
- `POST /strategies` — add strategy (admin)
- `GET /admin/users|revenue`

---

## User Risk Modes
3 presets stored in Supabase, read by agent at runtime. UI form exists in frontend (NotificationPicker/ModePicker).
- **Conservative**: low leverage, low margin, 20+ trade buffer
- **Medium**: balanced risk/reward
- **Aggressive**: high leverage, high margin, 4-5 trade buffer
Exact leverage/margin parameters TBD when strategy config is finalised.

---

## Deployment
- **Server**: AWS EC2 t3.large, Ubuntu 22.04, Singapore (`54.179.141.76`)
- **Docker Compose**: `infra/docker-compose.yml` — 3 services (backend:8001, auth:3002, agent). External network `supabase_default`.
- **Live URLs**: `tradelikeme.xyz` (frontend), `auth.tradelikeme.xyz` (auth service — deployed + smoke tested), `api.tradelikeme.xyz` (backend — deployed)
- **Dokploy**: planned PaaS layer. Install: `curl -sSL https://dokploy.com/install.sh | bash`. Not yet set up.
- **Traefik**: auto-SSL. `dash.tradelikeme.xyz` → Dokploy dashboard (planned).

---

## Folder Structure
```
tradelikeme/
├── CLAUDE.md
├── README.md
├── plan.md
├── tasks.md
├── auth.md                        # Auth task tracking (BA1–BA48)
├── .env / .env.example
├── requirements.txt
├── auth/                          # BetterAuth service (Hono, TypeScript)
│   ├── auth.ts                    # BetterAuth config (providers, plugins)
│   ├── server.ts                  # Hono server + CORS
│   ├── migrate.ts                 # DB migration runner
│   ├── Dockerfile
│   └── src/providers/phantom.ts   # Custom Phantom SIWS plugin
├── backend/                       # FastAPI REST API
│   ├── main.py
│   ├── auth.py                    # BetterAuth JWT middleware
│   ├── routes/                    # strategies, users, trades, vaults, subs, ws, admin, agent
│   └── models/                    # SQLAlchemy models (Supabase)
├── frontend/                      # React 19 + Vite + React Router
│   ├── src/
│   │   ├── App.tsx                # Routes: /, /login, /signup, /dashboard, /docs, /blog, /submit-strategy
│   │   ├── context/AuthContext.tsx
│   │   ├── components/            # Navbar, Footer, landing sections, EmailVerificationBanner
│   │   └── pages/                 # WaitlistHero, InvestorForm, TraderForm, BlogPage, DocsPage, etc.
│   ├── vite.config.ts             # Proxies /api/auth/* → http://localhost:3001
│   └── package.json               # React 19, React Router 7, Framer Motion, Solana wallet-adapter
├── trading_agent/
│   ├── base/
│   │   ├── base_strategy.py       # Abstract strategy class
│   │   ├── exchange_base.py       # Abstract exchange interface (7 methods)
│   │   ├── notifier.py            # Dispatcher — NOT YET WIRED to handlers
│   │   └── config.py              # Constants: MAX_AT_RISK_SLOTS=2, MIN_BALANCE=35, TF_STACK, etc.
│   ├── strategies/sd_zones/
│   │   ├── agent.py               # SDZoneStrategy entry point
│   │   ├── loop.py                # Orchestrator (startup, zone refresh 4H, compound 72H, event loop)
│   │   ├── trade_agent.py         # 4-order atomic entry, TP1/TP2/SL/body-SL handlers
│   │   ├── sentinel.py            # Pyth WS watcher: ZONE_TOUCH, TP1_HIT, BODY_SL
│   │   ├── zones.py               # 7-TF zone scan via KLineChart MCP → Claude Bedrock
│   │   ├── journal.py             # SQLite: trades table + epochs table
│   │   ├── state.py               # Dataclasses (defined but unused — loop uses own dicts)
│   │   └── config.py              # Strategy params: WATCHLIST (14 coins), LEVERAGE=200, MARGIN=0.5%
│   ├── exchanges/
│   │   ├── solana/
│   │   │   ├── zeta_client.py     # Zeta Markets (primary, devnet+mainnet, 5 coins)
│   │   │   ├── jupiter_client.py  # Jupiter Perps (fallback, mainnet only, 3 coins)
│   │   │   ├── solana_router.py   # Routes Zeta→Jupiter on failure
│   │   │   ├── pyth_ws.py         # Pyth Hermes WS price feed
│   │   │   └── anchor_vault/      # Rust Anchor vault program (deposit/settle/withdraw)
│   │   └── cex/                   # EMPTY — Phase 2
│   └── channels/
│       └── telegram.py            # send_telegram() + send_photo_telegram()
├── tests/                         # 32 Python integration tests
├── infra/
│   ├── docker-compose.yml         # 3 services: backend (8001), auth (3002), agent
│   ├── Dockerfile.backend
│   ├── Dockerfile.agent
│   ├── klinechart/                # KLineChart v10 canvas engine (vendored)
│   ├── klinechart-pro/            # KLineChart Pro UI (vendored, SolidJS)
│   └── klinechart-mcp/            # MCP server — FULLY BUILT
│       ├── src/index.ts           # Static HTTP server (port 8765) + MCP entry
│       ├── src/browser.ts         # Playwright Chromium automation
│       ├── src/tools/             # 8 tools: open_chart, screenshot, set_symbol, set_timeframe,
│       │                          #           get_ohlcv, get_price, scroll_chart, toggle_indicator
│       └── chart/
│           ├── index.html         # Chart UI shell (KLineChart Pro, dark theme)
│           └── datafeed.js        # Binance Futures REST (primary) + Pyth Benchmarks (fallback)
└── venv/
```

---

## Tech Stack
| Layer | Tool |
|-------|------|
| Language | Python 3.11 asyncio |
| Solana Perps | Zeta Markets (primary) + Jupiter Perps (fallback) |
| Solana Vault | Custom Anchor program (Rust) — devnet tested |
| Price Oracle | Pyth Hermes WebSocket + REST fallback |
| RPC | Helius (free tier) |
| Wallet | Phantom Connect + @solana/wallet-adapter |
| Stablecoin | USDC |
| Zone Scanning | KLineChart MCP server (Playwright + Binance datafeed + Pyth fallback) |
| Zone Analysis | Claude Opus 4.6 via AWS Bedrock (IAM user `claude-code-bedrock`, region `us-east-1`) |
| Auth | BetterAuth v1.6.9 (Hono server, Kysely+Postgres adapter) |
| Backend | FastAPI + SQLAlchemy + Supabase (PostgreSQL) |
| Database | Supabase PostgreSQL (platform) + SQLite (per-strategy journal) |
| Notifications | Telegram (built) + WhatsApp Twilio (post-hackathon) |
| Server | AWS EC2 t3.large, Ubuntu 22.04, Singapore |
| Deployment | Docker Compose (3 services) — Dokploy planned |
| Frontend | React 19 + Vite + React Router + Tailwind (`frontend/`) |

---

## Strategy Marketplace
- Traders submit via form on website (not this project)
- We review manually: TradingView verification, win rate check, strategy interview
- If approved: we build the agent instance ourselves and add to marketplace
- No self-serve automation
- Requirement: 50+ verified trades, 55%+ win rate minimum

---

## CEX Profit Settlement (Phase 2)
- Users send 20% manually (honour system for now)
- Automated enforcement to be built later
- Not a priority until Solana phase is complete

---

## Hackathon Info
- **Event**: Solana Frontier Hackathon — Colosseum / Solana Foundation
- **Period**: Apr 6 – May 11, 2026
- **Registration**: ✅ DONE (A18 completed)
- **Submission deadline**: May 11, 2026
- **Prize target**: Grand Champion $30k or Standout $10k
- **Sponsors used**: Phantom Connect, Helius RPC, Colosseum Copilot (CASH stablecoin in docs/marketing)

---

## Key Rules For Claude
- Working directory for this project is always `F:/AgentTeam/hackathon/Platform/`
- Never touch files outside this folder
- Never push to `abrarnasirjaffari/AgentTeam` repo
- Never read or copy code from `F:/AgentTeam/trading_agent/` — start fresh
- Always commit + push after completing a meaningful unit of work
- tasks.md is the source of truth for what to build next — check it before starting
- plan.md has all architectural decisions — check it before making design choices
- Keep tasks.md updated as tasks are completed (check off done items)
