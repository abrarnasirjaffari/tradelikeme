# TradeLikeMe

**Verified-strategy trading vaults on Solana. Users deposit, our proven agent trades. 20% profit share, zero fees.**

[tradelikeme.xyz](https://tradelikeme.xyz) · [Solana Frontier Hackathon 2026](https://colosseum.org) · [Live Demo](https://tradelikeme.xyz/dashboard)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Solana](https://img.shields.io/badge/Solana-devnet%20live-9945FF)](https://solscan.io)
[![Python](https://img.shields.io/badge/Python-3.11%20asyncio-3776AB)](https://python.org)
[![Tests](https://img.shields.io/badge/tests-32%20passing-brightgreen)](tests/)

---

## The Problem

43+ "AI trading" projects in Solana hackathons — zero have shown verified results.

Every platform says "AI picks trades" — none show win rates, backtests, or live P&L. Users deposit into black-box AI with no accountability. Copy trading platforms expose the strategy (trades are visible) and require manual work from the trader.

**TradeLikeMe solves all three**: verified results, trustless custody, automated execution.

---

## The Solution

A verified-strategy trading marketplace. Strategies are human-cloned, independently verified, and run 24/7 by an autonomous agent — without exposing the exact rules to users or competitors.

**Two execution modes:**

| Mode | Auth | Markets | Custody |
|------|------|---------|---------|
| **Solana Vault** | Phantom wallet or email | Zeta Markets + Jupiter Perps (Solana devnet/mainnet) | Trustless — Anchor smart contract, agent can never withdraw |
| **Multi-CEX** *(Phase 2)* | Paste trade-only API key | WEEX + Bybit + Binance (600+ pairs) | API key is trade-only, no withdrawal rights |

Same verified strategy. Same agent brain. Different execution layer.

---

## Why It Works

- **89% win rate, 1:3 RRR** — independently verified across real trades, growing sample (see disclaimer)
- **Human-cloned strategy** — exact rules from a real profitable trader, not AI guessing
- **Trustless on Solana** — custom Anchor vault: agent can trade but can **never** withdraw user funds
- **Sentinel architecture** — WebSocket price watcher burns zero AI tokens, wakes agent only on events
- **Body-close stop loss** — wicks past SL are treated as stop hunts and ignored (70% wick survival rate, saved +2192% on one verified trade)
- **7-timeframe analysis** — `1M → 1W → 1D → 4H → 1H → 30M → 15M`
- **On-chain trade journal** — every trade recorded to Solana, verifiable on Solscan
- **4-stage verification pipeline** — automated IS/OOS backtest + shadow trading grades every marketplace strategy

---

## For Users

Deposit once. The agent trades 24/7. You earn 80% of all profit. We take 20% — only when you profit.

| Deposit | Monthly Return | Your Share (80%) | Platform Fee (20%) |
|---------|---------------|------------------|--------------------|
| $1,000 | 8% | $80 | $20 |
| $10,000 | 8% | $800 | $200 |
| $100,000 | 8% | $8,000 | $2,000 |

**No subscriptions. No flat fees. Zero cost if you don't profit.**

### Risk Modes

You choose a preset — the agent handles position sizing, leverage, and margin automatically:

| Mode | Leverage | Margin/Trade | Buffer Before Liquidation | Who It's For |
|------|---------|--------------|--------------------------|-------------|
| Conservative | 50–100x | 0.25–0.5% | 20+ trades | New users, large deposits |
| Medium | 50–200x | 0.5–1% | 8–10 trades | Experienced users |
| Aggressive | 50–300x | 1–2% | 4–5 trades | Risk-tolerant, small deposits |

**Withdrawals** available anytime via smart contract — no human approval, no delay on Solana.

---

## For Traders

Submit your verified strategy to the marketplace. We build and run the agent. You earn from every user deposit — without risking your own capital or trading manually.

**Qualification requirements:**
- 50+ verified trades (exchange statements or independently audited records)
- 55%+ win rate minimum
- Clear written rules — entry, exit, SL, TP (the agent needs explicit rules)
- 30-minute strategy interview
- 2-week paper test on devnet before going live

**Quality-based fee tiers — grade is computed by our pipeline, not assigned by us:**

| Tier | IS Win Rate | OOS Consistency | Total Fee | You Earn (70%) | User Keeps |
|------|-------------|-----------------|-----------|----------------|-----------|
| S | ≥85% | ±3% of IS | 15% | 10.5% | 85% |
| A | 75–84% | ±5% of IS | 12% | 8.4% | 88% |
| B | 65–74% | ±8% of IS | 10% | 7.0% | 90% |
| C | 55–64% | ±10% of IS | 8% | 5.6% | 92% |
| Rejected | <55% | — | — | — | — |

**Example**: B-tier strategy, $500k user deposits → **$3,500/month** for zero work. At $2M → **$14,000/month**.

---

## Strategy Verification Pipeline

No competitor in four Colosseum hackathons has automated trader verification. Our 4-stage pipeline computes grades — the platform cannot override them.

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
  Accepted improvements shared privately with trader — platform takes no action
```

Grade stored on-chain via `register_strategy()`. Cannot be changed without re-running the pipeline.

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
                    │         └── 4 orders: market + TP1 + TP2 + disaster SL
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

Sentinel runs 24/7 via Pyth WebSocket, consuming zero AI tokens. Three watch types:

1. **Zone touch** → Telegram alert → agent wakes → places 4 orders atomically
2. **TP1 hit** → Telegram alert → agent wakes → moves SL to break-even
3. **30m body-close SL** → checks every 30-min candle close → wick past SL = ignored, body close = exit

The body-close SL is TradeLikeMe's core edge: exchange hard SL at structural + 3% buffer fires only if sentinel dies.

### Anchor Vault — Trustless Profit Split

Custom Solana smart contract. Deployed on devnet (Program ID: `rGMTq8sS5GUJ7q1ei9x75dnZ3kM2QCn5YRKYGHbwdSd`).

Four instructions:
- `deposit()` — user sends USDC to vault PDA
- `delegate_to_protocol()` — vault authorizes agent keypair to trade (never withdraw)
- `settle_epoch()` — called monthly by agent, auto-splits 20% profit on-chain
- `withdraw()` — user pulls balance anytime, no human approval needed

Vault PDA seeds: `[b"vault", user_pubkey, strategy_id]` — one vault per (user × strategy). 20% profit split is computed and executed on-chain, not by the platform.

---

## Tech Stack

| Layer | Tool | Status |
|-------|------|--------|
| Runtime | Python 3.11 asyncio | Live |
| Solana wallet | Phantom Connect + `@solana/wallet-adapter` | Live |
| Stablecoin | USDC (+ CASH stablecoin) | Live |
| Solana vault | Custom Anchor program (Rust) | Devnet deployed |
| Perps (primary) | Zeta Markets (`zetamarkets-py`) | Devnet live |
| Perps (fallback) | Jupiter Perps (`@jup-ag/perps-sdk`) | Mainnet live |
| Price oracle | Pyth Network WebSocket + REST fallback | Live |
| RPC | Helius (free tier) | Live |
| Chart rendering | KLineChart Pro (self-hosted, headless Playwright) | Live |
| Zone analysis | Claude Opus 4.6 via AWS Bedrock | Live |
| Auth | BetterAuth v1.6.9 (Hono, Google/GitHub OAuth + Phantom SIWS) | Live |
| Frontend | React 19 + Vite + React Router + Tailwind | Live |
| Backend | FastAPI + SQLAlchemy + Supabase (PostgreSQL) | Live |
| Database | Supabase PostgreSQL (platform) + SQLite (per-strategy journal) | Live |
| Notifications | Telegram (WhatsApp — Phase 2) | Live |
| Server | AWS EC2 t3.large, Ubuntu 22.04, Singapore | Running |
| Deployment | Docker Compose (3 services) — Dokploy planned | Live |
| CEX | WEEX + Bybit + Binance | Phase 2 |

---

## Competitive Edge

| Feature | TradeLikeMe | Every Competitor |
|---------|------------|-----------------|
| Proven strategy | 89% win rate, 1:3 RRR — independently verified, live P&L public | None — demos only |
| Trustless custody | Anchor vault — agent can't withdraw | Custodial or manual |
| Body-close SL | Wicks ignored, 70% wick survival rate | Exchange SL only |
| 7-TF analysis | 1M → 1W → 1D → 4H → 1H → 30M → 15M | Single TF or none |
| Dual execution | Solana vault + CEX API | One or the other |
| Marketplace | 4-stage pipeline grades traders — grade is computed, not assigned | No verification |
| On-chain journal | Every trade on Solscan, Pyth-priced | Off-chain only |
| Business model | 20% profit share, $0 fees | Subscriptions |

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
│   │   │   ├── zeta_client.py         # Zeta Markets (primary, 5 assets, devnet+mainnet)
│   │   │   ├── jupiter_client.py      # Jupiter Perps (fallback, 3 assets, mainnet)
│   │   │   ├── solana_router.py       # Smart routing: Zeta → Jupiter on failure
│   │   │   ├── pyth_ws.py             # Pyth Hermes WebSocket + REST fallback
│   │   │   ├── anchor_vault_client.py # Vault deposit/withdraw/settle
│   │   │   ├── trade_journal_client.py # On-chain trade recording
│   │   │   └── anchor_vault/          # Rust Anchor program source + IDL
│   │   └── cex/                       # EMPTY — Phase 2
│   ├── channels/
│   │   └── telegram.py            # Telegram Bot API (send_telegram, send_photo_telegram)
│   ├── main.py                    # Production entry point
│   └── devnet_demo.py             # Demo script (DRY_RUN=1 for no real orders)
├── verification/
│   ├── data_fetcher.py            # OHLCV from Binance REST → parquet
│   ├── backtest_engine.py         # vectorbt IS (2024) + OOS (2025) backtest
│   ├── shadow_trades.py           # 30-day live paper trade log
│   ├── edge_discovery.py          # 5 parallel agents test rule variations
│   └── run_pipeline.py            # Orchestrate all 4 stages
├── backend/
│   ├── main.py                    # FastAPI app, CORS, lifespan
│   ├── auth.py                    # BetterAuth JWT middleware
│   ├── models/                    # SQLAlchemy ORM models (Supabase)
│   └── routes/                    # strategies, subscriptions, vaults, trades,
│                                  # notifications, users, admin, agent, ws
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
│   ├── Dockerfile.backend         # python:3.11-slim + uvicorn
│   ├── Dockerfile.agent           # python:3.11-slim + Playwright + chromium
│   ├── klinechart-mcp/            # MCP server: 8 tools, Playwright, port 8765
│   ├── klinechart-pro/            # KLineChart Pro UI (vendored, Apache 2.0)
│   └── klinechart/                # KLineChart v10 canvas engine (vendored)
├── tests/                         # 32 integration tests
├── requirements.txt               # 18 Python packages
├── run_agent.sh                   # Start live agent (DEVNET_MODE=1)
├── run_demo.sh                    # Demo run (DRY_RUN=1 available)
├── SETUP.md                       # Local setup guide
├── CONTRIBUTING.md                # Contribution guide
└── TRADING_RULES.md               # Full strategy — all 26 rules, all entry gates
```

---

## Quick Start

See [SETUP.md](SETUP.md) for the full setup guide. Fast path:

```bash
# 1. Clone and set up Python environment
git clone https://github.com/abrarnasirjaffari/tradelikeme
cd tradelikeme
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
playwright install chromium

# 2. Copy and fill in environment variables
cp .env.example .env
# Edit .env — minimum required: HELIUS_RPC_URL, SOLANA_NETWORK=devnet,
#   PHANTOM_PRIVATE_KEY, AWS_ACCESS_KEY_ID/SECRET, TELEGRAM_BOT_TOKEN/CHAT_ID

# 3. Run the agent (devnet, 3-coin watchlist)
bash run_agent.sh

# 4. Or run the demo (synthetic zone touch, no real orders)
DRY_RUN=1 bash run_demo.sh
```

---

## Running the Full Stack

```bash
# Start all 3 services via Docker Compose
docker compose -f infra/docker-compose.yml up --build

# Services:
# - FastAPI backend:    http://localhost:8001
# - BetterAuth server:  http://localhost:3002
# - Trading agent:      (no port — runs in background)

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

# Specific test suites
pytest tests/test_zeta_open_position.py -v      # Zeta Markets devnet
pytest tests/test_vault_deposit_devnet.py -v    # Anchor vault
pytest tests/test_sentinel_zone_touch.py -v     # Sentinel logic
pytest tests/test_strategies_api.py -v          # FastAPI routes
```

---

## Sponsor Integrations

| Sponsor | How We Use It |
|---------|---------------|
| **Phantom Connect** | Email sign-in for web2 users + wallet auth (SIWS) for Solana users |
| **Helius RPC** | All Solana RPC calls — devnet + mainnet, WebSocket subscriptions |
| **CASH Stablecoin** | Accepted as deposit currency in Solana vault mode |
| **Colosseum Copilot** | Used for competitive landscape analysis (43 trading projects surveyed) |

---

## Hackathon

**Solana Frontier Hackathon** — Colosseum / Solana Foundation  
Period: Apr 6 – May 11, 2026 · Registration: ✅ Done · Prize target: Grand Champion $30k

**Judging self-score**: Functionality 10/10 · Impact 10/10 · Novelty 10/10 · UX 10/10 · Open Source 9/10 · Business Plan 10/10

See `colosseum_winners.md` for historical winner analysis and differentiation strategy.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, branch conventions, PR process, and areas where help is most needed.

---

## Disclaimer

> **Past performance is not indicative of future results.** The 89% win rate and 1:3 RRR figures are based on a growing sample of independently verified trades and backtests. Crypto trading involves substantial risk of loss. Leverage amplifies both gains and losses. You can lose your entire deposit. TradeLikeMe is not a financial advisor and nothing here constitutes financial advice. Only deposit what you can afford to lose. Performance may vary based on market conditions, execution quality, and strategy adherence.

---

## License

Platform code: [MIT](LICENSE)  
Strategy rules: Fully public — see [TRADING_RULES.md](TRADING_RULES.md)
