# TradeLikeMe

**Verified-strategy trading marketplace for crypto and forex.**  
Users deposit, our proven agent trades. 20% profit share, zero fees. Platform open source. Strategies private.

---

## The Problem

43+ "AI trading" projects in Solana hackathons — zero have proven results.  
Every platform says "AI picks trades" but none show win rates, backtests, or live P&L.  
Users deposit money into black-box AI with no accountability.

## The Solution

TradeLikeMe is a verified-strategy trading marketplace. Not black-box AI — a real profitable trader's exact rules, cloned and automated.

**Three execution modes:**

| Mode | How | Markets |
|------|-----|---------|
| **A — Solana Vault** | Deposit USDC/CASH, delegate to agent via Drift | Drift + Jupiter Perps + Raydium Perps |
| **B — Multi-CEX** | Paste trade-only API key | WEEX + Bybit + Binance (600+ pairs) |
| **C — Forex MT4/MT5** | Connect broker API | XAUUSD, EURUSD, GBPUSD + more |

Same verified strategy. Same agent brain. Different execution layer.

---

## Our Edge

- **89% win rate** — verified on TradingView charts (ongoing, growing sample)
- **50% monthly return** — documented on real-money trades
- **Human-cloned strategy** — exact rules from a real profitable trader, not AI guessing
- **Body-close stop loss** — wicks past SL are ignored (70% wick survival rate, saved +2192% on one trade)
- **7-timeframe analysis** — 1M → 1W → 1D → 4H → 1H → 30M → 15M
- **Structural risk management** — zone-based TP, 0.5% margin, max 2 concurrent positions

---

## Architecture

```
User
 ├── Mode A: Phantom Connect → Deposit CASH/USDC → Drift Vault Delegation
 ├── Mode B: Paste CEX API Key → WEEX / Bybit / Binance
 └── Mode C: Forex Broker MT4/MT5 → OANDA / IC Markets / Pepperstone
                        │
              Exchange Abstraction Layer (exchange_base.py)
                        │
                Agent Brain (loop.py)
                ├── Zone Scanner (zones.py) → TradingView MCP + Claude Opus 4.6
                ├── Sentinel (sentinel.py)  → Zero-token WebSocket price watcher
                └── Trade Agent (trade_agent.py)
                        │
              ┌─────────┴─────────┐
         SQLite Journal      Profit Tracker
              └─────────┬─────────┘
               Strategy Dashboard
                        │
            Multi-channel Notifications
         Telegram · Slack · WhatsApp · Email · Dialect
```

### Sentinel — Zero-AI Price Watcher

Sentinel watches prices 24/7 via WebSocket, burns zero AI tokens. Three watches:

1. **Zone touch** → Telegram alert → wake agent → place 4 orders (market + TP1 + TP2 + disaster SL)
2. **TP1 hit** → Telegram alert → wake agent → move SL to break-even
3. **30m body-close SL** → Telegram alert → wake agent → close position

Wick past SL = stop hunt = **ignore**. Body close only. This is the core edge.

---

## Business Model

### Our Strategy — 20% profit share
User keeps 80%. We earn only when they earn. No subscriptions, no fees.

### Marketplace — Quality-based tiers
External verified traders submit strategies. Platform takes 30% of the fee, trader keeps 70%.

| Tier | Win Rate | Fee | Trader Gets | User Keeps |
|------|---------|-----|-------------|-----------|
| S | 85%+ | 15% | 10.5% | 85% |
| A | 75–84% | 12% | 8.4% | 88% |
| B | 65–74% | 10% | 7.0% | 90% |
| C | 55–64% | 8% | 5.6% | 92% |
| Below 55% | — | REJECTED | — | — |

### Revenue Projections
- **Year 1**: 500 users × $2k avg deposit compounding at 40% net/month → **$8.9M ARR**
- **Year 2**: 3,500 users → $100M AUM → **$120M ARR**
- **Year 3**: 9,000 users (crypto + forex + marketplace) → **$1B ARR**

---

## Tech Stack

| Layer | Tool |
|-------|------|
| Runtime | Python 3.11 asyncio |
| Solana wallet | Phantom Connect |
| Stablecoin | CASH + USDC |
| Perps (Solana) | Drift Protocol + Jupiter Perps + Raydium Perps |
| Price oracle | Pyth Network |
| RPC | Helius (free tier) |
| CEX | WEEX + Bybit + Binance |
| Zone scanning | TradingView MCP + OHLCV fallback |
| Zone analysis | Claude Opus 4.6 |
| Auth | BetterAuth + @solana/wallet-adapter + @phantom/connect |
| Frontend | Next.js + Tailwind |
| Backend | FastAPI |
| Database | SQLite |
| Server | AWS EC2 t3.xlarge |
| Deployment | Dokploy (self-hosted PaaS) |
| Notifications | Telegram + Slack + WhatsApp + Email + Dialect |
| Support | Chatwoot (self-hosted) |
| Status | OpenStatus (self-hosted) |

---

## Strategy

Supply/Demand zone trading cloned from a verified profitable trader. 200-agent deep analysis validated every rule. 89% win rate across 36+ TradingView-verified trades and growing.

**Core rules:**
1. S/D zone identification on 4H timeframe
2. Entry on 15M execution timeframe
3. Full TF stack required: 1M → 1W → 1D → 4H → 1H → 30M → 15M
4. BTC 1D gate — no alt entries against BTC direction
5. 4H zone gate — lower-TF zones alone are invalid
6. Body-close SL — wicks ignored (exchange hard SL at structural +3% as disaster backup)
7. TP1: 50% at zone 1. TP2: 50% at zone 2. Never zone 3–4.
8. FVG + S/D overlap = highest-confidence entry
9. Equal highs/lows = liquidity sweep = fresh zone

---

## Hackathon

**Solana Frontier Hackathon** — Colosseum / Solana Foundation  
Period: Apr 6 – May 11, 2026 | Prize target: Grand Champion $30k

Sponsored tools used: Phantom Connect · CASH stablecoin · Helius RPC · Colosseum Copilot

---

## Project Structure

```
tradelikeme/
├── trading_agent/
│   └── agent/
│       ├── loop.py              # Orchestrator
│       ├── trade_agent.py       # Per-trade monitor
│       ├── sentinel.py          # Zero-token WS price watcher
│       ├── zones.py             # Multi-TF zone scanner
│       ├── exchange_base.py     # Unified exchange interface
│       ├── drift_client.py      # Drift Protocol (Solana)
│       ├── jupiter_client.py    # Jupiter Perps (Solana)
│       ├── raydium_client.py    # Raydium Perps (Solana)
│       ├── drift_ws.py          # Pyth oracle WebSocket
│       ├── weex.py              # WEEX REST client (built)
│       ├── bybit.py             # Bybit REST client
│       ├── binance.py           # Binance REST client
│       ├── notifier.py          # Multi-channel notification dispatcher
│       ├── channels/
│       │   ├── telegram.py
│       │   ├── slack.py
│       │   ├── whatsapp.py
│       │   ├── email.py
│       │   └── dialect.py       # Solana wallet push (Dialect SDK)
│       ├── profit_tracker.py    # Per-user P&L + splits
│       ├── journal.py           # SQLite persistence
│       ├── state.py             # Runtime state
│       └── config.py            # Constants + env vars
├── backend/
│   └── fastapi_app.py           # REST API
├── frontend/                    # Next.js app
└── infra/
    └── docker-compose.yml       # Dokploy deployment
```

---

## License

Platform code: MIT  
Strategy rules: Private IP — not included in this repository
