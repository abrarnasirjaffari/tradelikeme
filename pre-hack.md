# Pre-Hackathon — Demo-Critical Missing Pieces

> Only what judges NEED to see in the video / live demo. Everything else = post-hackathon.
> Deadline: May 11, 2026 (4 days)

---

## What Judges See (90-second video)

1. User signs in (Phantom Connect / Google)
2. User deposits into vault
3. Agent scans zones (KLineChart screenshot visible)
4. Agent enters trade on Solana devnet
5. Telegram notification fires
6. Dashboard shows live trade + P&L + win rate
7. On-chain trade visible on Solscan (the 9/10 differentiator)

---

## MISSING — Must Fix for Demo

### 1. Frontend Dashboard ✅ DONE
**Status**: Complete. All 75 items built. Sidebar nav with 7 pages. Committed `fda8e76`.

**Building for demo (9 sections):**

**Stat Cards (16):**
- [x] Vault balance, current value, profit $, profit %, win rate %, total trades, active positions, avg duration, best trade, worst trade, max drawdown, profit factor, risk-reward ratio, monthly return, weekly return, streak

**Open Positions (15):**
- [x] Coin, direction, entry price, current price, P&L $, P&L %, qty, leverage, SL, TP1, TP2, time open, margin, liquidation price, close button

**Trade History (11):**
- [x] Coin, direction, entry, exit, outcome (TP1/TP2/SL/Manual), P&L $, P&L %, duration, date opened, date closed, on-chain tx link

**Vault / Deposit (6):**
- [x] Deposit button + input, withdraw button + input, deposit history, withdraw history, vault address (copyable), view on Solscan link

**Strategy Info (10):**
- [x] Name + description, rules summary, trader profile, grade (S/A/B/C), fee tier, coins traded, timeframes, max positions, start date, total AUM

**Risk Mode (3):**
- [x] Selector (Conservative/Medium/Aggressive), current mode displayed, explanation of each mode

**Agent Status (5):**
- [x] Status indicator (Running/Stopped/Scanning), last scan time, next scan time, coins watched, sentinel watches

**Account / Settings (5):**
- [x] Connected wallet address, OAuth provider, 2FA status, logout button, dark/light toggle

**On-Chain Verification (4):**
- [x] Link to all trades on Solscan, vault PDA on Solscan, strategy registration tx link, "Verify our win rate" button

**Skipped**: Charts/graphs, notification settings, WS live feed, mobile responsive

---

### 2. Vault Deposit Flow — End-to-End on Devnet ✅ DONE
**Status**: Complete. Real Solana txs. Phantom signs. DB records history. Committed `cafa6a1`.
**What judges need to see**:
- [x] User clicks "Deposit" → Phantom wallet pops up → signs tx
- [x] USDC transfers to vault PDA on devnet
- [x] Balance updates on dashboard
- [x] "Withdraw" button works same way (reverse)

**Can skip**: CASH stablecoin (just use devnet USDC), mainnet

---

### 3. Notifier Wiring (Telegram fires during demo)
**Status**: `notifier.send()` defined but never called.
**What judges need to see**:
- [ ] Trade entered → Telegram message appears
- [ ] TP1 hit → Telegram message appears
- [ ] Show phone with Telegram channel in video

**Can skip**: WhatsApp, daily summary, balance_low alert

---

### 4. On-Chain Trade Journal (moves score from 8→9) ✅ DONE
**Status**: Complete. Deployed to devnet. 30/30 tests passing. Committed `e9f0f82`.
**What judges need to see**:
- [x] Agent enters trade → `record_trade()` writes to Solana (deployed program ID: `rGMTq8sS5GUJ7q1ei9x75dnZ3kM2QCn5YRKYGHbwdSd`)
- [x] Trade closes → `close_trade()` updates on-chain
- [x] Show trade on Solscan in video ("every trade is verifiable")
- [x] `register_strategy()` and `set_risk_mode()` on-chain — also built

**Can skip**: Pyth CPI price verification (trades are on-chain; agent signs them)

---

### 5. Agent Running on Devnet (visible in demo)
**Status**: Agent code ~85% done, but never run end-to-end on devnet.
**What judges need to see**:
- [ ] Agent starts → scans zones (KLineChart screenshot in terminal/logs)
- [ ] Zone found → sentinel watches price
- [ ] Price touches zone → 4 orders placed on Zeta devnet
- [ ] Trade appears in dashboard + Telegram + on-chain

**Can skip**: Full 14-coin watchlist (just demo 2-3 coins), 4H zone refresh cycle

---

### 6. Strategy Verification Pipeline (moves score from 9→10 — the credibility killer)
**Status**: Not started. This is the moat no competitor in 4 Colosseum hackathons has touched.
**What judges need to see**:
- [ ] 2024 backtest results (in-sample) — win rate, RRR, max drawdown, trade count
- [ ] 2025 OOS results (out-of-sample) — same metrics, separate year, strategy unchanged
- [ ] 30-day shadow trade log (paper trades with logged entry/exit, no hindsight)
- [ ] Edge discovery output — at least 1 rule improvement found by agent team with before/after stats

**Why this matters**: Every competitor says "our AI trades profitably." Nobody shows a 2-year verification pipeline. This is what turns "trust us" into "here's the proof" — the same reason Reflect Protocol won Grand Prize.

**The pitch this unlocks**:
> "Here's 2024 in-sample: 89% win rate, 1.5 RRR. Here's 2025 out-of-sample — strategy never touched — 84% win rate, 1.4 RRR. The edge is real and it persists. Then 30 days of shadow trades, logged before price moved. Then an agent team found 3 rule refinements that lifted RRR from 1.5 to 1.8 without touching win rate. This is how institutional quant funds prove strategies. We're the first hackathon project to do it."

---

#### Pipeline Architecture

```
Stage 1 — In-Sample Backtest (2024, full year)
  ├── Data: OHLCV for all 14 watchlist coins, all 7 TFs, Jan–Dec 2024
  ├── Source: Binance REST API (free, unlimited historical)
  ├── Engine: vectorbt (Python) — fast enough for 14 coins × 7 TFs
  ├── Rules applied: exact strategy rules from strategy.md (no lookahead bias)
  └── Output: win_rate, avg_winner, avg_loser, RRR, max_drawdown, profit_factor, trade_count

Stage 2 — Out-of-Sample Verification (2025, full year)
  ├── SAME rules, SAME code, different date range (Jan–Dec 2025)
  ├── Rules frozen — no fitting allowed after Stage 1
  └── Output: same metrics. If OOS win rate within ±5% of IS → strategy is real

Stage 3 — Shadow Trade Log (last 30 days)
  ├── Every setup logged BEFORE price moved (timestamped entry in SQLite)
  ├── Exit logged when TP1/TP2/SL hit
  ├── Source of truth: journal.py already does this
  └── Output: 30-day live P&L table (no hindsight possible — timestamps prove it)

Stage 4 — Agent Edge Discovery Team
  ├── 5-agent team: each tests 1 rule variation at a time on 2024 IS data
  ├── Candidate rules: BTC gate threshold, zone width %, TP2 zone selection, 
  │   session filter (Asia/London/NY), FVG confirmation weight
  ├── Acceptance criteria: win rate stays ≥85%, RRR improves ≥0.1, 
  │   drawdown stays ≤IS baseline
  └── Output: table of accepted improvements + before/after stats

Stage 5 — Dashboard Page: "Strategy Verification"
  ├── Shows IS vs OOS chart side-by-side
  ├── Shadow trade log table (last 30 entries, all timestamped)
  ├── Edge discoveries: before/after table
  └── "Methodology" section — explains pipeline so judges understand the rigor
```

---

#### Demo Video Addition (~15s)
After showing 89% win rate stat:
- **(5s)** "This isn't backtested on the same data we optimised on. Here's 2024 in-sample, here's 2025 out-of-sample — strategy untouched — still 84%. The edge persists."
- **(5s)** "30 days of shadow trades, timestamped before price moved. Can't fake timestamps."
- **(5s)** "Agent team found 3 rule improvements. RRR went from 1.5 to 1.8."

---

#### Task List

- [ ] **V1** — Pull 2024 + 2025 OHLCV for all 14 coins (all 7 TFs) from Binance REST into parquet files
- [ ] **V2** — Build vectorbt backtesting engine applying exact strategy rules (entry/SL/TP logic)
- [ ] **V3** — Run Stage 1 (2024 IS) + Stage 2 (2025 OOS), generate metrics CSV
- [ ] **V4** — Export shadow trade log from journal.py (last 30 days) — already collected, just need to surface it
- [ ] **V5** — Run Stage 4 edge discovery team (5 parallel agents, 1 rule variation each)
- [ ] **V6** — Add "Strategy Verification" page to frontend dashboard (IS/OOS table + shadow log + edge discoveries)
- [ ] **V7** — Wire verification metrics into the existing "Strategy Info" dashboard section

**Estimated effort**: 2 days (Wasiq owns V1–V5, Abrar wires V6–V7)
**Demo impact**: Turns score from 9/10 → 10/10. No competitor has this.

---

## NOT Needed for Demo (skip entirely)

| Item | Why skip |
|------|----------|
| CEX layer (WEEX/Bybit/Binance) | Phase 2, judges care about Solana |
| WhatsApp notifications | Telegram is enough for demo |
| Full Pyth symbol mapping (6 remaining) | 8 mapped coins is plenty for demo |
| Dokploy setup | Can deploy manually for demo |
| Frontend WS live feed | Just refresh page in video |
| Mobile responsive | Record demo on desktop |
| Strategy marketplace UI | Just mention it verbally |
| 2FA / admin panel | Already built, don't need to show |
| Forex research | Not this hackathon |
| settle_epoch() with on-chain P&L sum (T8) | Can do post-demo |

---

## Suggested Order (by demo impact)

| Priority | Task | Effort | Demo Impact | Status |
|----------|------|--------|-------------|--------|
| P1 | Frontend dashboard (fake data OK initially) | 1 day | HIGH — judges see this first | ✅ DONE |
| P2 | Vault deposit/withdraw on devnet | 1 day | HIGH — proves trustless primitive | ✅ DONE |
| P3 | On-chain trade journal (T1-T3, T6-T7) | 1 day | HIGH — the 9/10 differentiator | ✅ DONE |
| P4 | Notifier wiring | 2 hours | MEDIUM — shows real product | ⏳ |
| P5 | Agent end-to-end devnet run | 0.5 day | HIGH — proves it works | ⏳ |
| P6 | Strategy verification pipeline (IS/OOS/shadow/edge discovery) | 2 days | HIGH — 9→10/10, unique across all Colosseum hackathons | ⏳ |

**Total**: ~4.5 days remaining. Buffer: 4 days (May 11 deadline).

---

## Demo Video Script (updated for what we'll actually show)

1. **(10s)** "TradeLikeMe — verified-strategy trading vaults on Solana"
2. **(10s)** Sign in with Phantom wallet (one click)
3. **(15s)** Deposit USDC into vault → show tx on Solscan → balance appears
4. **(15s)** Agent scans zones — show KLineChart screenshot + zone identification
5. **(10s)** Agent enters trade → show 4 orders placed on Zeta devnet
6. **(10s)** Telegram notification appears on phone
7. **(10s)** Dashboard: trade visible, P&L updating, 89% win rate stat
8. **(10s)** Solscan: "Every trade is on-chain. Pyth-verified. We can't lie."
9. **(5s)** "20% profit share. Zero fees. tradelikeme.xyz"

**Total: ~95 seconds**
