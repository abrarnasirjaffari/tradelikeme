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

### 4. On-Chain Trade Journal (moves score from 8→9)
**Status**: Plan exists in colosseum_winners.md (T1–T11). Zero code written.
**What judges need to see**:
- [ ] Agent enters trade → `record_trade()` writes to Solana
- [ ] Trade closes → `close_trade()` updates on-chain
- [ ] Show trade on Solscan in video ("every trade is verifiable")
- [ ] Pyth price verification (agent can't fake entry prices)

**Can skip**: `register_strategy()`, `set_risk_mode()` on-chain (nice but not demo-critical)

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
| P3 | On-chain trade journal (T1-T3, T6-T7) | 1 day | HIGH — the 9/10 differentiator | ⏳ |
| P4 | Notifier wiring | 2 hours | MEDIUM — shows real product | ⏳ |
| P5 | Agent end-to-end devnet run | 0.5 day | HIGH — proves it works | ⏳ |

**Total**: ~2.5 days remaining (dashboard done).

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
