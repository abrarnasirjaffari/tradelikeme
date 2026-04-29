# TradeLikeMe

**Verified-strategy trading vaults on Solana. Users deposit, our proven agent trades. 20% profit share, zero fees.**

[tradelikeme.xyz](https://tradelikeme.xyz) · Built for Solana Frontier Hackathon 2026

---

## The Problem

43+ "AI trading" projects in Solana hackathons — zero have proven results.  
Every platform says "AI picks trades" but none show win rates, backtests, or live P&L.  
Users deposit money into black-box AI with no accountability. Copy trading exposes the strategy and requires manual work from traders.

## The Solution

TradeLikeMe is a verified-strategy trading marketplace. Strategies are human-cloned, TradingView-verified, and run 24/7 by an autonomous agent — without exposing the rules to users or competitors.

**Two execution modes:**

| Mode | How | Markets |
|------|-----|---------|
| **Solana Vault** | Deposit USDC/CASH, delegate trade authority via Phantom | Raydium Perps + Jupiter Perps (70+ coins, up to 250x) |
| **Multi-CEX** | Paste trade-only API key | WEEX + Bybit + Binance (600+ pairs) |

Same verified strategy. Same agent brain. Different execution layer.

---

## Why It Works

- **89% win rate** — verified on TradingView charts across real trades (ongoing, growing sample)
- **Human-cloned strategy** — exact rules from a real profitable trader, not AI guessing
- **Trustless on Solana** — custom Anchor vault: agent can trade but can never withdraw user funds
- **Sentinel architecture** — WebSocket price watcher burns zero AI tokens, wakes agent only on events
- **Body-close stop loss** — wicks past SL are treated as stop hunts and ignored (70% wick survival rate)
- **7-timeframe analysis** — 1M → 1W → 1D → 4H → 1H → 30M → 15M

---

## For Users

Deposit once. The agent trades 24/7. You earn 80% of all profit. We take 20% — only when you profit.

| Deposit | Monthly Return | Your Share (80%) | Platform Fee (20%) |
|---------|---------------|------------------|--------------------|
| $1,000 | 8% | $80 | $20 |
| $10,000 | 8% | $800 | $200 |
| $100,000 | 8% | $8,000 | $2,000 |

**No subscriptions. No flat fees. Zero if you don't profit.**

**Risk modes** — you choose one preset, the agent handles the rest:

| Mode | Who It's For |
|------|-------------|
| Conservative | New users, large deposits — low margin, 20+ trade buffer before liquidation |
| Medium | Experienced users — balanced risk/reward |
| Aggressive | Risk-tolerant, small deposits — higher margin, higher upside |

**Withdrawals** available anytime (Solana vault: smart contract enforced, no human approval needed).

---

## For Traders

Submit your verified strategy to the marketplace. We build and run the agent. You earn from every user deposit — without risking your own capital or trading manually.

**To qualify:**
- 50+ verified trades on TradingView
- 55%+ win rate minimum
- Clear written rules (entry, exit, SL, TP)
- 30-minute strategy interview
- 2-week paper test on devnet

**Quality-based fee tiers** — better strategy = higher fee = more for everyone:

| Tier | Win Rate | Total Fee | You Earn (70%) | User Keeps |
|------|---------|-----------|----------------|-----------|
| S-tier | 85%+ | 15% | 10.5% | 85% |
| A-tier | 75–84% | 12% | 8.4% | 88% |
| B-tier | 65–74% | 10% | 7.0% | 90% |
| C-tier | 55–64% | 8% | 5.6% | 92% |
| Below 55% | — | REJECTED | — | — |

**Example earnings** (B-tier strategy, $500k user deposits): **$3,500/month** for zero work.  
At $2M deposits: **$14,000/month** — your strategy runs 24/7 on all user capital, not just yours.

Traders control: coins traded, max concurrent positions, trading hours, risk mode parameters.  
Users control: risk mode selection and deposit amount only.

**Withdrawal window**: minimum 3 days, maximum 30 days (set by trader per strategy).

---

## Architecture

```
User
 ├── Mode A: Phantom Connect → Deposit CASH/USDC → Anchor Vault (trustless)
 └── Mode B: Paste CEX API Key → WEEX / Bybit / Binance
                    │
          Exchange Abstraction Layer (exchange_base.py)
                    │
              Agent Brain (loop.py)
              ├── Zone Scanner (zones.py) → KLineChart Pro + Claude Opus 4.6
              ├── Sentinel (sentinel.py)  → Zero-token WebSocket price watcher
              └── Trade Agent (trade_agent.py)
                    │
          ┌─────────┴─────────┐
     SQLite Journal      Profit Tracker
          └─────────┬─────────┘
            Strategy Dashboard (FastAPI + Next.js)
                    │
        Multi-channel Notifications (Telegram + WhatsApp)
```

### Sentinel — Zero-AI Price Watcher

Sentinel watches prices 24/7 via WebSocket, burns zero AI tokens. Three watches:

1. **Zone touch** → Telegram alert → wake agent → place 4 orders (market + TP1 + TP2 + disaster SL)
2. **TP1 hit** → Telegram alert → wake agent → move SL to break-even
3. **30m body-close SL** → Telegram alert → wake agent → close position

Wick past SL = stop hunt = **ignore**. Body close only.

### Anchor Vault — Trustless Profit Split

Custom Solana smart contract. Agent can open/close positions but can **never withdraw user funds**.

4 instructions:
- `deposit()` — user sends USDC/CASH to vault PDA
- `delegate_to_protocol()` — vault authorizes agent to trade
- `settle_epoch()` — called monthly, auto-splits 20% profit to platform on-chain
- `withdraw()` — user pulls their balance anytime

Vault PDA seeds: `[b"vault", user_pubkey, strategy_id]` — one vault per (user × strategy).

---

## Tech Stack

| Layer | Tool |
|-------|------|
| Runtime | Python 3.11 asyncio |
| Solana wallet | Phantom Connect + @solana/wallet-adapter |
| Stablecoin | CASH + USDC |
| Solana vault | Custom Anchor program (Rust) |
| Perps (Solana) | Raydium Perps + Jupiter Perps |
| Price oracle | Pyth Network WebSocket |
| RPC | Helius (free tier) |
| CEX | WEEX + Bybit + Binance |
| Chart rendering | KLineChart Pro (self-hosted, headless) |
| Zone analysis | Claude Opus 4.6 via AWS Bedrock |
| Auth | BetterAuth |
| Frontend | Next.js + Tailwind |
| Backend | FastAPI |
| Database | SQLite (platform.db + per-strategy DBs) |
| Server | AWS EC2 t3.xlarge (Singapore) |
| Deployment | Dokploy + Docker Compose + Traefik |
| Notifications | Telegram + WhatsApp |

---

## Competitive Edge

| Feature | TradeLikeMe | Everyone Else |
|---------|------------|---------------|
| Proven results | 89% win rate, TradingView-verified | None |
| Real money tested | Live P&L documented | Demos only |
| Trustless custody | Anchor vault — agent can't withdraw | Custodial or manual |
| Dual execution | Solana vault + CEX API | One or the other |
| Marketplace | Quality-gated, verified traders | Single strategy |
| Business model | 20% profit share, $0 fees | Subscriptions |
| Stop loss method | Body-close — wicks ignored | Exchange SL only |

---

## Project Structure

```
tradelikeme/
├── trading_agent/
│   ├── base/
│   │   ├── base_strategy.py     # Abstract strategy class
│   │   ├── exchange_base.py     # Unified exchange interface
│   │   ├── notifier.py          # Notification dispatcher
│   │   └── config.py            # Platform-wide constants
│   ├── strategies/
│   │   └── sd_zones/
│   │       ├── loop.py          # Orchestrator
│   │       ├── trade_agent.py   # Per-trade monitor
│   │       ├── sentinel.py      # Zero-token WS price watcher
│   │       ├── zones.py         # Multi-TF zone scanner
│   │       ├── journal.py       # SQLite persistence
│   │       ├── state.py         # Runtime state
│   │       └── config.py        # Strategy params
│   ├── exchanges/
│   │   ├── solana/
│   │   │   ├── raydium_client.py
│   │   │   ├── jupiter_client.py
│   │   │   ├── pyth_ws.py
│   │   │   └── anchor_vault/    # Rust Anchor program
│   │   └── cex/
│   │       ├── weex.py
│   │       ├── bybit.py
│   │       └── binance.py
│   └── channels/
│       ├── telegram.py
│       └── whatsapp.py
├── backend/
│   ├── main.py                  # FastAPI app
│   └── routes/
├── infra/
│   ├── klinechart-mcp/          # KLineChart MCP server (zone scanning)
│   │   ├── src/index.ts         # MCP server entry point
│   │   └── chart/               # Headless chart page (Playwright)
│   ├── klinechart-pro/          # KLineChart Pro UI (self-hosted)
│   └── docker-compose.yml
└── frontend/                    # Next.js app (merged post-hackathon)
```

---

## Hackathon

**Solana Frontier Hackathon** — Colosseum / Solana Foundation  
Period: Apr 6 – May 11, 2026 | Prize target: Grand Champion $30k

Sponsored tools: Phantom Connect · CASH stablecoin · Helius RPC · Colosseum Copilot

---

## License

Platform code: MIT  
Strategy rules: Private IP — not included in this repository
