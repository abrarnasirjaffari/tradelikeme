# TradeLikeMe — Build Plan

*Being filled in via Q&A session — Apr 29, 2026*

---

## Scope

- **This repo** (`tradelikeme`): Python trading platform — agent, sentinel, zone scanner, exchange clients, FastAPI backend, notifications, profit tracker
- **Separate repo** (`tradelikeme-website`): Next.js website + dashboard — already built, will be linked to this platform later
- Frontend is NOT part of this project

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
1. **Raydium Perps** (`raydium-sdk`) — first choice, 70+ coins, 50x, gasless CLOB
2. **Jupiter Perps** (`@jup-ag/perps-sdk`) — fallback, BTC/SOL/ETH only, 250x
3. **Third protocol** — TBD (Drift removed — recently hacked, inactive. Candidates: Flash Trade, Zeta Markets, Mango Markets. Decide after research.)

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
1. Anchor vault program (on-chain profit split)
2. Raydium Perps client
3. Jupiter Perps client
4. Pyth price feed WebSocket
5. Agent brain wired to Solana protocols
6. Phantom Connect auth
7. Telegram + WhatsApp notifications
8. Demo + submit

### Phase 2 — Post Hackathon
- CEX clients (WEEX, Bybit, BingX, Binance, Bitget)
- CEX profit settlement system
- Third Solana protocol (research needed)
- Forex (research needed)
- More notification channels
- Link tradelikeme-website to this platform

---

## Zone Scanning
- **Primary**: KLineChart + Playwright — fetch OHLCV → render chart → screenshot → Claude analysis
- **Fallback**: TradingView MCP (if KLineChart unavailable)
- **AI model**: Claude Opus 4.6 for zone identification on all screenshots

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
│   │       ├── zones.py           # Zone scanner (KLineChart + TV MCP fallback)
│   │       ├── journal.py         # SQLite persistence
│   │       ├── state.py           # Runtime state
│   │       └── config.py          # Strategy-specific params
│   ├── exchanges/
│   │   ├── solana/
│   │   │   ├── raydium_client.py  # Raydium Perps
│   │   │   ├── jupiter_client.py  # Jupiter Perps (fallback)
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
├── infra/
│   └── docker-compose.yml
└── .env.example
```

---

## Tech Stack Summary

| Layer | Tool |
|-------|------|
| Language | Python 3.11 asyncio |
| Solana Perps | Raydium Perps + Jupiter Perps |
| Solana Vault | Custom Anchor program (Rust) |
| Price Oracle | Pyth Network WebSocket |
| RPC | Helius (free tier) |
| Wallet Auth | Phantom Connect + @solana/wallet-adapter |
| Stablecoin | CASH + USDC |
| CEX (Phase 2) | WEEX, Bybit, BingX, Binance, Bitget |
| Zone Scanning | KLineChart + Playwright (primary) → TradingView MCP (fallback) |
| Zone Analysis | Claude Opus 4.6 via AWS Bedrock |
| Auth | BetterAuth |
| Backend | FastAPI |
| Database | SQLite (platform.db + per-strategy DB) |
| Notifications | Telegram + WhatsApp (Phase 1) |
| Server | AWS EC2 t3.xlarge |
| Deployment | Dokploy + Docker Compose + Traefik |
| Frontend | tradelikeme-website (separate repo, linked later) |

---

## What We Are NOT Building Here
- Next.js frontend / website (separate repo: tradelikeme-website)
- Forex integration (on hold — research needed)
- Manual CEX profit settlement UI (later)
- Third Solana protocol beyond Raydium + Jupiter (research needed)

