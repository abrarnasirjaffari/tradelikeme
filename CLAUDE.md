# TradeLikeMe Platform — Claude Context

## What Is This Project
TradeLikeMe is a verified-strategy trading marketplace. Users deposit funds, a proven agent trades on their behalf using a human-cloned strategy with 89% win rate. Platform takes 20% profit share. Zero fees, zero subscriptions.

**This repo** (`abrarnasirjaffari/tradelikeme`) = Python backend platform only (for now).
**`tradelikeme-website`** (separate GitHub repo) = Next.js website, waitlist live. Will be merged into this repo under `frontend/` **after the main platform is complete**. Do not touch it until then.

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

## Build Status (as of Apr 29, 2026)
- `README.md` — written and pushed
- `plan.md` — full build plan written and pushed (updated with KLineChart zone scanner)
- `tasks.md` — full task list written and pushed (KLineChart section added, KC1–KC3 done)
- `.env` — created with Helius RPC URL + Phantom wallet keys
- `.env.example` — created with all variable names
- `infra/klinechart/` — KLineChart v10 cloned ✅
- `infra/klinechart-pro/` — KLineChart Pro cloned, architecture reviewed ✅
- **No Python/Rust code written yet** — accounts/infra setup in progress

### Accounts & Keys Completed
- **A1–A2** ✅ Helius account + project created. RPC URL saved to `.env`
- **A3–A4** ✅ Phantom wallet created for agent sub-account. Private key + pubkey saved to `.env`
  - Pubkey: `HgcX7tJLhHTBUXmWskaohFcr4J1NR66FMwR7iAPawP7F`
- **A5** ✅ Devnet keypair generated on EC2: `35Jt4Uz9NDXAZcwUaNHqr1TMtpdgvtHKHW3NnrRRi6p4`
- **A6** ✅ 2.5 devnet SOL airdropped via faucet.solana.com
- **A9–A10** ✅ Telegram bot created (@tradelikeme_alerts_bot), token + chat ID (6398964627) saved to `.env`
- **A19** ✅ tradelikeme.xyz domain verified, pointing to EC2 (54.179.141.76)

### Remaining Accounts (A7–A20)
- A7–A8: Twilio (WhatsApp) — ON HOLD (post-hackathon)
- A11–A12: AWS Bedrock — model `anthropic.claude-opus-4-6-v1` confirmed ACTIVE in us-east-1. Need dedicated IAM user + keys.
- A13–A17: CEX API keys (WEEX, Bybit, BingX, Binance, Bitget) — not started (Phase 2)
- A18: Colosseum registration — **ACTION REQUIRED by May 4**
- A20: `.env` fully filled — in progress

---

## What To Build Next Session
1. **A18**: Register on Colosseum (deadline May 4 — do this first)
2. **A11–A12**: AWS Bedrock IAM user + test Claude Opus 4.6 invoke
3. **KC4–KC7**: Install KLineChart + Pro deps, fix peer dep, verify build
4. **KC8–KC9**: Write `CryptoDatafeed.ts`, wire into KLineChart Pro
5. **KC10–KC14**: Build headless chart server, test in browser
6. **R1–R10**: Scaffold full folder structure
7. **P1–P15**: Python environment + requirements.txt

---

## Architecture Summary

### This Platform Does
- Python asyncio trading agent (strategy logic, zone scanning, trade execution)
- Custom Anchor vault program on Solana (on-chain profit split)
- FastAPI backend (REST API + WebSocket for website to consume)
- Multi-strategy isolation (each strategy = separate agent process + separate SQLite DB + separate Docker container)
- Multi-channel notifications (Telegram + WhatsApp Phase 1, more later)

### This Platform Does NOT Do (this phase)
- Frontend / UI — merge is deferred until platform is complete
- Forex (on hold — research needed)
- CEX clients in Phase 1 (post-hackathon — focus is Solana first)

---

## Exchange Layer

### Solana (Phase 1 — hackathon priority)
| Protocol | SDK | Coins | Leverage | Priority |
|----------|-----|-------|----------|----------|
| Raydium Perps | `raydium-sdk` | 70+ | 50x | 1st (primary) |
| Jupiter Perps | `@jup-ag/perps-sdk` | BTC/SOL/ETH | 250x | 2nd (fallback) |
| Third protocol | TBD | TBD | TBD | Research needed (Drift removed — hacked) |

- **Price oracle**: Pyth Network WebSocket (shared by all Solana protocols)
- **RPC**: Helius (free tier, ~5% usage)
- **Wallet**: Phantom Connect (email sign-in, hackathon sponsor) + @solana/wallet-adapter
- **Stablecoin**: CASH + USDC
- **Auth**: BetterAuth (sessions, social login, 2FA, roles)

### CEX (Phase 2 — post hackathon)
WEEX, Bybit, BingX, Binance, Bitget — all via `exchange_base.py` abstraction

### Forex (On Hold)
Research needed before any integration

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
platform.db          ← shared: users, auth sessions, strategy registry, notification prefs
strategy_sd.db       ← isolated: trades, positions, journal, epochs for S/D zone strategy
strategy_b.db        ← isolated: trades, positions, journal, epochs for strategy B
```

FastAPI reads `platform.db` for auth, routes queries to the correct `strategy_{id}.db`.

---

## Notifications

### Phase 1 (build now)
- Telegram (Bot API)
- WhatsApp (Twilio sandbox → production Meta Cloud API later)

### Architecture
```
sentinel / trade_agent
        ↓
    notifier.py  ← unified dispatcher (asyncio.gather)
        ├── channels/telegram.py
        └── channels/whatsapp.py
```

### Event Types
`ZONE_TOUCH`, `TRADE_ENTERED`, `TP1_HIT`, `TP2_HIT`, `SL_HIT`, `BALANCE_LOW`, `AGENT_DOWN`, `DAILY_SUMMARY`

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
3 presets stored in `platform.db`, read by agent at runtime. UI is on the website.
- **Conservative**: low leverage, low margin, 20+ trade buffer
- **Medium**: balanced risk/reward
- **Aggressive**: high leverage, high margin, 4-5 trade buffer
Exact parameters TBD when we define strategy config.

---

## Deployment
- **Server**: AWS EC2 t3.xlarge (Singapore, already running)
- **PaaS**: Dokploy (self-hosted, install: `curl -sSL https://dokploy.com/install.sh | bash`)
- **Containers**: one Docker container per strategy agent + one for FastAPI
- **Routing**: Traefik auto-SSL → `api.tradelikeme.xyz` (FastAPI), `dash.tradelikeme.xyz` (Dokploy)
- **Config**: single `docker-compose.yml` in `infra/`

---

## Folder Structure
```
tradelikeme/
├── CLAUDE.md
├── README.md
├── plan.md
├── tasks.md
├── .env.example
├── requirements.txt
├── trading_agent/
│   ├── base/
│   │   ├── base_strategy.py    # Abstract strategy class
│   │   ├── exchange_base.py    # Abstract exchange interface
│   │   ├── notifier.py         # Notification dispatcher
│   │   └── config.py           # Platform-wide constants
│   ├── strategies/
│   │   └── sd_zones/
│   │       ├── agent.py        # Entry point for this strategy
│   │       ├── loop.py         # Orchestrator
│   │       ├── trade_agent.py  # Per-trade monitor
│   │       ├── sentinel.py     # WS price watcher (zero AI tokens)
│   │       ├── zones.py        # Zone scanner
│   │       ├── journal.py      # SQLite persistence
│   │       ├── state.py        # Runtime state
│   │       └── config.py       # Strategy params
│   ├── exchanges/
│   │   ├── solana/
│   │   │   ├── raydium_client.py
│   │   │   ├── jupiter_client.py
│   │   │   ├── pyth_ws.py
│   │   │   └── anchor_vault/   # Rust Anchor program
│   │   └── cex/                # Phase 2
│   │       ├── weex.py
│   │       ├── bybit.py
│   │       ├── bingx.py
│   │       ├── binance.py
│   │       └── bitget.py
│   └── channels/
│       ├── telegram.py
│       └── whatsapp.py
├── backend/
│   ├── main.py
│   ├── routes/
│   └── models/
└── infra/
    ├── klinechart/                # KLineChart v10 canvas engine (cloned)
    ├── klinechart-pro/            # KLineChart Pro UI (cloned + adapted)
    │   └── src/
    │       └── CryptoDatafeed.ts  # Our OHLCV datafeed (replaces DefaultDatafeed)
    ├── chart_server/
    │   └── index.html             # Headless render page for Playwright screenshots
    └── docker-compose.yml
├── frontend/                      # Next.js app (merged from tradelikeme-website)
│   ├── app/                       # Next.js app router pages
│   ├── components/                # Shared UI components
│   ├── public/                    # Static assets
│   └── package.json
└── .env.example
```

---

## Tech Stack
| Layer | Tool |
|-------|------|
| Language | Python 3.11 asyncio |
| Solana Perps | Raydium Perps + Jupiter Perps |
| Solana Vault | Custom Anchor program (Rust) |
| Price Oracle | Pyth Network WebSocket |
| RPC | Helius (free tier) |
| Wallet | Phantom Connect + @solana/wallet-adapter |
| Stablecoin | CASH + USDC |
| Zone Scanning | KLineChart Pro + Playwright (primary) → TradingView MCP (fallback) |
| Zone Analysis | Claude Opus 4.6 via AWS Bedrock |
| Auth | BetterAuth |
| Backend | FastAPI + SQLAlchemy |
| Database | SQLite (platform.db + per-strategy DBs) |
| Notifications | Telegram + WhatsApp (Twilio) |
| Server | AWS EC2 t3.xlarge |
| Deployment | Dokploy + Docker Compose + Traefik |
| Frontend | Next.js + Tailwind (merged into `frontend/`) |

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
- **Registration deadline**: May 4, 2026 (ACTION REQUIRED)
- **Prize target**: Grand Champion $30k or Standout $10k
- **Sponsors used**: Phantom Connect, CASH stablecoin, Helius RPC, Colosseum Copilot

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
