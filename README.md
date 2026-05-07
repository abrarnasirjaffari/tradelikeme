# TradeLikeMe

**Marketplace for Verified AI Trading Strategies on Solana.**

[tradelikeme.xyz](https://tradelikeme.xyz) · [Live Demo](https://tradelikeme.xyz/dashboard)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Solana](https://img.shields.io/badge/Solana-devnet%20live-9945FF)](https://solscan.io)
[![Python](https://img.shields.io/badge/Python-3.11%20asyncio-3776AB)](https://python.org)
[![Tests](https://img.shields.io/badge/tests-32%20passing-brightgreen)](tests/)

---

## About

TradeLikeMe is a marketplace for verified AI trading strategies on Solana. Traders submit strategies, we verify them through an automated pipeline, and autonomous agents execute them 24/7 on-chain via a trustless Anchor vault — the agent can trade but can never withdraw user funds.

---

## Architecture

```
User
 ├── Mode A: Phantom Connect → Deposit USDC → Anchor Vault (trustless)
 └── Mode B: Paste CEX API Key → WEEX / Bybit / Binance (Phase 2)
                    │
          Exchange Abstraction Layer (exchange_base.py)
                    │
              Agent Brain (loop.py)
              ├── Zone Scanner (zones.py)
              │     └── KLineChart Pro (self-hosted) → Claude Opus 4.6 (AWS Bedrock)
              ├── Sentinel (sentinel.py)  ← zero AI tokens, WebSocket only
              └── Trade Agent (trade_agent.py)
                        └── 4 orders: market + TP1 + TP2 + disaster SL
                    │
          ┌─────────┴──────────────┐
     SQLite Journal         On-Chain Journal (Anchor)
          └─────────┬──────────────┘
              FastAPI Backend
                    │
            React 19 Dashboard
                    │
        Telegram Notifications
```

### Sentinel — Zero-AI Price Watcher

Runs 24/7 via Pyth WebSocket, consuming zero AI tokens. Three watch types:

1. **Zone touch** → Telegram alert → agent wakes → places 4 orders atomically
2. **TP1 hit** → Telegram alert → agent wakes → moves SL to break-even
3. **30m body-close SL** → checks every 30-min candle close → wick past SL = ignored, body close = exit

### Anchor Vault

Custom Solana smart contract deployed on devnet (`rGMTq8sS5GUJ7q1ei9x75dnZ3kM2QCn5YRKYGHbwdSd`).

Four instructions:
- `deposit()` — user sends USDC to vault PDA
- `delegate_to_protocol()` — vault authorizes agent keypair to trade (never withdraw)
- `settle_epoch()` — called monthly by agent, computes and splits profit on-chain
- `withdraw()` — user pulls balance anytime, no human approval needed

Vault PDA seeds: `[b"vault", user_pubkey, strategy_id]` — one vault per (user × strategy).

---

## Strategy Verification Pipeline

Automated 4-stage pipeline that grades every strategy. Grade is stored on-chain via `register_strategy()` and cannot be changed without re-running the pipeline.

```
Stage 1 — In-Sample Backtest (2024, full year)
  Engine: vectorbt · Data: Binance REST API (reproducible)
  Output: win_rate, avg_winner%, avg_loser%, RRR, max_drawdown%, sharpe_ratio

Stage 2 — Out-of-Sample Verification (2025, full year)
  Same rules, same code, same coins — only date range changes
  Pass condition: OOS win_rate within ±8% of IS win_rate
  Output: "Strategy consistent" or "Strategy overfit"

Stage 3 — Shadow Trade (30-day live paper mode)
  Entries timestamped BEFORE price moves — cannot be backfilled
  Stored in trade journal with same schema as live trades

Stage 4 — Edge Discovery (5 parallel agents)
  Each agent tests one rule variation on IS data
  Accepted improvements shared privately with the strategy author
```

---

## Tech Stack

| Layer | Tool |
|-------|------|
| Runtime | Python 3.11 asyncio |
| Solana wallet | Phantom Connect + `@solana/wallet-adapter` |
| Stablecoin | USDC |
| Solana vault | Custom Anchor program (Rust) |
| Perps (primary) | Zeta Markets (`zetamarkets-py`) |
| Perps (fallback) | Jupiter Perps (`@jup-ag/perps-sdk`) |
| Price oracle | Pyth Network WebSocket + REST fallback |
| RPC | Helius |
| Chart rendering | KLineChart Pro (self-hosted, headless Playwright) |
| Zone analysis | Claude Opus 4.6 via AWS Bedrock |
| Auth | BetterAuth v1.6.9 (Hono, Google/GitHub OAuth + Phantom SIWS) |
| Frontend | React 19 + Vite + React Router + Tailwind |
| Backend | FastAPI + SQLAlchemy + Supabase (PostgreSQL) |
| Database | Supabase PostgreSQL (platform) + SQLite (per-strategy journal) |
| Notifications | Telegram |
| Deployment | Docker Compose (3 services) |

---

## Project Structure

```
tradelikeme/
├── trading_agent/
│   ├── base/
│   │   ├── base_strategy.py       # Abstract strategy class
│   │   ├── exchange_base.py       # Unified exchange interface (7 methods)
│   │   ├── notifier.py            # Multi-channel notification dispatcher
│   │   └── config.py              # Platform-wide constants
│   ├── strategies/
│   │   └── sd_zones/
│   │       ├── loop.py            # Orchestrator — zone refresh, entry gates, event routing
│   │       ├── trade_agent.py     # 4-order atomic entry, TP/SL/body-SL handlers
│   │       ├── sentinel.py        # Zero-token WebSocket price watcher
│   │       ├── zones.py           # Multi-TF zone scanner (KLineChart + Claude Bedrock)
│   │       ├── journal.py         # SQLite trade log
│   │       ├── state.py           # In-memory state dataclasses
│   │       └── config.py          # Strategy params (watchlist, leverage, thresholds)
│   ├── exchanges/
│   │   ├── solana/
│   │   │   ├── zeta_client.py         # Zeta Markets (primary, devnet+mainnet)
│   │   │   ├── jupiter_client.py      # Jupiter Perps (fallback, mainnet)
│   │   │   ├── solana_router.py       # Routes Zeta → Jupiter on failure
│   │   │   ├── pyth_ws.py             # Pyth Hermes WebSocket + REST fallback
│   │   │   ├── anchor_vault_client.py # Vault deposit/withdraw/settle
│   │   │   ├── trade_journal_client.py # On-chain trade recording
│   │   │   └── anchor_vault/          # Rust Anchor program source + IDL
│   │   └── cex/                       # Phase 2
│   ├── channels/
│   │   └── telegram.py            # Telegram Bot API
│   ├── main.py                    # Production entry point
│   └── devnet_demo.py             # Demo script (DRY_RUN=1 for no real orders)
├── verification/
│   ├── data_fetcher.py            # OHLCV from Binance REST → parquet
│   ├── backtest_engine.py         # vectorbt IS + OOS backtest
│   ├── shadow_trades.py           # 30-day paper trade log
│   ├── edge_discovery.py          # Parallel agents testing rule variations
│   └── run_pipeline.py            # Orchestrates all 4 stages
├── backend/
│   ├── main.py                    # FastAPI app
│   ├── auth.py                    # BetterAuth JWT middleware
│   ├── models/                    # SQLAlchemy ORM models
│   └── routes/                    # strategies, vaults, trades, notifications, users, ws
├── frontend/                      # React 19 + Vite SPA
│   └── src/
│       ├── pages/                 # Landing, auth, dashboard, docs, blog
│       └── components/            # Dashboard widgets, forms, layout
├── auth/                          # BetterAuth v1.6.9 (Hono server)
│   ├── auth.ts                    # Providers: Google, GitHub, Phantom SIWS
│   ├── server.ts                  # Hono entry point
│   └── src/providers/phantom.ts   # Custom Ed25519 Solana wallet auth plugin
├── infra/
│   ├── docker-compose.yml         # backend (8001) + auth (3002) + agent
│   ├── Dockerfile.backend
│   ├── Dockerfile.agent           # includes Playwright + Chromium
│   ├── klinechart-mcp/            # MCP server: 8 tools, Playwright, port 8765
│   ├── klinechart-pro/            # KLineChart Pro UI (vendored, Apache 2.0)
│   └── klinechart/                # KLineChart v10 canvas engine (vendored)
├── tests/                         # 32 integration tests
├── requirements.txt
├── run_agent.sh                   # Start live agent
├── run_demo.sh                    # Demo run (DRY_RUN=1)
├── SETUP.md                       # Full local setup guide
├── CONTRIBUTING.md
└── TRADING_RULES.md               # Full strategy rules
```

---

## Quick Start

See [SETUP.md](SETUP.md) for the full setup guide.

```bash
# 1. Clone and set up Python environment
git clone https://github.com/abrarnasirjaffari/tradelikeme
cd tradelikeme
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
playwright install chromium

# 2. Copy and fill in environment variables
cp .env.example .env

# 3. Run the agent (devnet)
bash run_agent.sh

# 4. Or run the demo (synthetic zone touch, no real orders)
DRY_RUN=1 bash run_demo.sh
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `HELIUS_RPC_URL` | Yes | Helius RPC endpoint (get free at helius.dev) |
| `SOLANA_NETWORK` | Yes | `devnet` or `mainnet-beta` |
| `PHANTOM_PRIVATE_KEY` | Yes | Agent wallet keypair (base58) |
| `AWS_ACCESS_KEY_ID` | Yes | AWS IAM key for Claude Bedrock (zone analysis) |
| `AWS_SECRET_ACCESS_KEY` | Yes | AWS IAM secret |
| `AWS_REGION` | Yes | e.g. `us-east-1` |
| `TELEGRAM_BOT_TOKEN` | Yes | Telegram bot token from @BotFather |
| `TELEGRAM_CHAT_ID` | Yes | Chat/channel ID to send alerts to |
| `SUPABASE_DATABASE_URL` | Yes | Supabase PostgreSQL connection string |
| `SUPABASE_ANON_KEY` | Yes | Supabase public anon key |
| `BETTER_AUTH_SECRET` | Yes | Random secret for BetterAuth sessions |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth (auth service) |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth (auth service) |
| `GITHUB_CLIENT_ID` | Optional | GitHub OAuth (auth service) |
| `GITHUB_CLIENT_SECRET` | Optional | GitHub OAuth (auth service) |

---

## Running the Full Stack

```bash
# Start all 3 services via Docker Compose
docker compose -f infra/docker-compose.yml up --build

# Services:
# - FastAPI backend:    http://localhost:8001
# - BetterAuth server:  http://localhost:3002
# - Trading agent:      (background process)

# Frontend (dev mode)
cd frontend && npm install && npm run dev   # http://localhost:5173

# Auth service (dev mode)
cd auth && npm install && npm run dev       # http://localhost:3001
```

---

## Running Tests

```bash
# All integration tests (requires .env with devnet credentials)
pytest tests/ -v

# Specific suites
pytest tests/test_zeta_open_position.py -v      # Zeta Markets devnet
pytest tests/test_vault_deposit_devnet.py -v    # Anchor vault
pytest tests/test_sentinel_zone_touch.py -v     # Sentinel logic
pytest tests/test_strategies_api.py -v          # FastAPI routes
```

---

## Adding a Strategy

Each strategy is an isolated Python class that inherits `BaseStrategy` and calls `ExchangeBase` methods.

1. Create a folder under `trading_agent/strategies/<your_strategy>/`
2. Implement `loop.py`, `trade_agent.py`, `sentinel.py`, `zones.py`, `journal.py`, `config.py` — follow `sd_zones/` as reference
3. Add a `config.py` entry for `WATCHLIST`, `LEVERAGE`, and `MARGIN_PCT`
4. Register via `POST /strategies` (admin endpoint) with strategy rules and risk mode params
5. Run the verification pipeline: `python verification/run_pipeline.py --strategy <id>`

The pipeline grades the strategy and stores the grade on-chain. Only strategies passing Stage 2 (OOS consistency) go live.

---

## Roadmap

- [ ] CEX layer (`trading_agent/exchanges/cex/`) — WEEX, Bybit, Binance
- [ ] Wire `notifier.send()` into `trade_agent.py` and `loop.py` event handlers
- [ ] Frontend dashboard wiring — deposit/withdraw UI, trade history, P&L, WS live feed
- [ ] Anchor vault client integration (replace deposit/withdraw stubs in backend)
- [ ] WhatsApp notifications via Twilio
- [ ] Dokploy PaaS setup on EC2

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, branch conventions, and PR process.

---

## Disclaimer

> **Past performance is not indicative of future results.** Crypto trading involves substantial risk of loss. Leverage amplifies both gains and losses. You can lose your entire deposit. Nothing here constitutes financial advice. Only use funds you can afford to lose.

---

## License

Platform code: [MIT](LICENSE) · Strategy rules: [TRADING_RULES.md](TRADING_RULES.md)
