# TradeLikeMe — Trading Rules

This is the complete, unredacted strategy powering TradeLikeMe. Every rule here is verified in live trading.

**Transparency is our moat.** Anyone can read these rules. The edge is in the discipline to follow them.

---

## Core Method: Supply & Demand Zone Trading

Price moves between supply zones (where sellers dominate) and demand zones (where buyers dominate). The strategy enters at the *start* of a new move — the moment price returns to a fresh zone after a strong impulse away from it.

This is not indicator trading. Indicators are used only as context. The primary signal is price structure.

---

## Timeframe Stack

All timeframes are analyzed in order, top-down. Higher timeframes override lower ones.

| TF | Role |
|----|------|
| 1M (monthly) | Macro regime — bull or bear cycle |
| 1W (weekly) | Swing structure — weekly highs/lows, weekly supply/demand |
| 1D (daily) | Entry direction gate — must align with 1D structure |
| 4H | Primary zone identification |
| 1H | Zone confirmation, entry refinement |
| 30M | Entry timing |
| 15M | Execution TF — final entry trigger |
| 5M | Execution only — not used for zones |

**BTC/ETH rule**: BTC and ETH zones are identified on 1D (not 4H). Their daily candles carry the same weight as alt coin 4H candles. Always check BTC 1D before any altcoin entry.

---

## Zone Identification

### What Is a Valid S/D Zone?

A **demand zone** is a price range where buyers absorbed a significant amount of supply, causing a strong impulse upward. Signs:
- Large bullish candle(s) launching from a tight consolidation
- High volume at the consolidation (absorption), lower volume on the move away
- The zone has not been revisited too many times (fresh = 0–2 touches; used = 3+ = weakened)

A **supply zone** is the mirror: bearish impulse from a consolidation with absorption.

### Zone Quality Grades

| Grade | Definition |
|-------|-----------|
| Strong | First or second touch, launched from a fresh base, strong volume at zone, clear absorption |
| Moderate | 2–3 touches, still intact, reasonable volume |
| Weak | 3+ touches, volume unclear, zone borders overlap with other zones |

Only trade **Strong** or **Moderate** zones. Weak zones are invalidated.

### Chart Patterns = S/D Zone Confirmation

Named chart patterns are just S/D mechanics with different shapes:

| Pattern | What It Is |
|---------|-----------|
| V-bottom | Single touch demand zone, strong absorption, sharp reversal |
| W-bottom (double bottom) | Two-touch demand zone, second test = final absorption |
| Flat base | Extended consolidation = distribution or accumulation; strongest zone type |
| Bull flag / bear flag | Pullback into demand/supply after impulse |
| Cup & handle | Rounded demand zone with tight handle consolidation |

### Equal Highs/Lows = Liquidity Sweep

Equal highs = retail stop-loss cluster above. Price sweeps them, then reverses → creates a fresh demand zone at the sweep low.  
Equal lows = same logic inverted.

Always check for equal highs/lows before the entry zone — if price just swept them, the zone is newly validated.

---

## Entry Conditions — 5 Mandatory Gates

All 5 gates must pass. One failure = no trade.

### Gate 1: Entry Gate (Operational Checks)

- Zone scan complete (first full scan takes ~40 min on startup — entries blocked until done)
- Open positions < 2 (MAX_AT_RISK_SLOTS = 2)
- Balance ≥ $35 (MIN_BALANCE_USD)

### Gate 2: BTC 1D Macro Gate

Fetch BTC 1D candles. Classify direction:

| BTC State | Block |
|-----------|-------|
| Bullish (higher highs + higher lows + 3+ consecutive green closes) | Block SHORT entries on alts |
| Bearish (lower highs + lower lows + 3+ red closes) | Block LONG entries on alts |
| Neutral / consolidating | Both directions allowed |

Never short alts when BTC is making higher lows + 3+ consecutive green closes. This was the root cause of 2 stop-loss hits (XRP + SUI, Apr 15–16, 2026) — both taken against a BTC 7-day recovery.

**Never expand the coin watchlist during BTC macro downtrend.** All alts near 3-month lows = S/D zones unclear. Wait for BTC to stabilize.

### Gate 3: 4H Zone Gate

Lower-TF zones (1H, 30M, 15M) must have a corresponding 4H zone within ±5% of the entry zone's midpoint.

Standalone lower-TF zones without 4H confirmation are invalid entries. This rule prevented multiple false entries — the most significant was a SOL $86 short taken on a 1H-only zone.

### Gate 4: TP Levels Exist

`find_tp_levels()` must return at least TP1. If there are no visible supply/demand zones on the other side of the trade to target, there is no trade.

- **TP1**: nearest S/D zone past entry in trade direction
- **TP2**: second nearest zone (NEVER zone 3 or 4)
- Verified Apr 14: zone 2 hit on all 3 paper trades; zone 3–4 missed on 2/3.

### Gate 5: Structural SL Exists

`find_sl_level()` must identify a structural level:
- **LONG**: bottom of the demand zone being entered
- **SHORT**: top of the supply zone being entered

If the structural SL is unclear or overlaps with the entry, there is no trade.

---

## Position Sizing

```
position_size = (balance × margin_pct × leverage) / entry_price

Example: $100 balance, 0.5% margin, 200x leverage, SOL at $165
= ($100 × 0.005 × 200) / 165
= $100 / 165
≈ 0.606 SOL
```

| Parameter | Value |
|-----------|-------|
| Leverage | 200x CROSS (Solana: up to 50x on Zeta) |
| Margin per trade | 0.5% of balance |
| Max concurrent positions | 2 |
| Min balance | $35 |

**3 risk presets** (users choose one — agent handles sizing):

| Mode | Leverage | Margin/Trade | Buffer |
|------|---------|--------------|--------|
| Conservative | 50–100x | 0.25–0.5% | 20+ trades |
| Medium | 50–200x | 0.5–1% | 8–10 trades |
| Aggressive | 50–300x | 1–2% | 4–5 trades |

---

## Take Profit Rules

### TP1 — First Target (Zone 1)

- 50% of position closed at nearest S/D zone in trade direction
- On TP1 hit: **immediately move SL to break-even** (entry price)
- Trade is now risk-free: worst case = break-even

### TP2 — Second Target (Zone 2)

- Remaining 50% runs to zone 2
- **Never use zone 3 or 4 for TP2** — verified: zone 3–4 missed on 2/3 paper trades Apr 14
- Exception: strong momentum or news day — then zone 3 is acceptable, but zone 2 is always first choice

### FVG (Fair Value Gap) as Entry Confluence

- FVG overlapping with an S/D zone = high-confidence entry (enter at zone top, not conservative bottom)
- FVG alone (no S/D zone) = TP magnet only — do not enter there
- Zone alone (no FVG) = enter conservatively at zone bottom (longs) or top (shorts)

---

## Stop Loss Rules — Two Layers

### Primary SL: 30m Candle Body Close (in code)

The most important rule in the entire strategy.

- **Wick past SL = stop hunt = IGNORE**
- **Body close past SL = real SL = exit**

A wick represents institutional stop hunting — retail stops are swept to create liquidity, then price reverses. If only the wick pierces your SL level but the 30-minute candle body closes above (longs) or below (shorts), stay in the trade.

**Verified live**: AAVE wicked $85.05 (below $86 SL), body closed at $86.34. SL not triggered. Trade went on to +2192%.

The sentinel checks this every 30 minutes on the candle close, not on tick.

### Disaster SL: Exchange Hard Stop (backup only)

- Set at structural level + 3% buffer
- Only fires if the sentinel process dies
- Max observed wick in backtests: 3.8% — the 3% buffer covers 99%+ of stop hunts
- **Never set this as your primary SL** — the exchange will fill at the hard stop, missing the body-close edge

### What "Structural" Means

The SL is not a fixed percentage. It is always placed at a structural level:
- LONG: below the bottom of the demand zone entered
- SHORT: above the top of the supply zone entered

This means SL% varies by setup: typical range 2–8%. A wider structural SL is valid if the zone is strong.

---

## DCA (Dollar Cost Averaging)

The DCA pattern is two adjacent demand zones with one SL below both:

1. Entry 1 at zone 1 top/midpoint
2. Entry 2 (DCA) at zone 2 (next zone down)
3. Single SL below zone 2 bottom

**This is the real DCA** — two zones, one structural SL below all. Not random averaging down.

Verified on AAVE: entry at $90–89, DCA at $87, SL at $86 structural.

**Current stance**: DCA is skipped at current capital size ($35–$100). Not worth the complexity until balance is significantly higher.

---

## Trade Pre-Planning

Before entering any trade, map out the following **before clicking**:

1. Entry zone: exact price range (top and bottom)
2. DCA level (if applicable): next zone down/up
3. SL: structural level (zone bottom for longs, zone top for shorts)
4. TP1: zone 1 range (top and bottom)
5. TP2: zone 2 range (top and bottom)
6. Check: BTC 1D macro direction
7. Check: equal highs/lows nearby (liquidity sweeps)
8. Check: FVG overlap
9. Grade the setup: A / B / C / D

Only A and B grades are traded. C = scalp at best (very small size). D = no trade.

**Never trade a C-grade setup as if it were A-grade.** This was the root cause of the XRP long on Apr 18 — Sonnet 4.6 mislabeled a 4H zone as "1D confirmed" and called a C-grade setup a swing trade.

---

## Zone TF Labeling Rules

Critical: a zone labeled as "1D" must have 3+ **daily candle bodies** at that level. 4H candles do not count toward a 1D zone.

- **1D zone**: 3+ daily candles with bodies at/near the level
- **4H zone**: 3+ 4H candles with bodies at/near the level
- **1H zone**: 3+ 1H candles

If you cannot count the candles on the claimed TF, do not label it as that TF.

---

## Volume Rules

**Rule D — Volume at Zone (Not Volume at Impulse)**

Volume on the move *away* from a zone (the impulse) does not confirm the zone. What matters is volume *at* the zone *when price returns* for the retest.

Check: when price is currently at the zone, is there absorption volume? High relative volume with price not moving = absorption = valid zone.

Breakout volume ≠ retest volume. These are different events.

---

## Session Timing

No fixed trading session filter, but watch for:
- **Asian session** (00:00–08:00 UTC): lower volume, wider spreads — zone entries valid but tighter
- **London session** (08:00–12:00 UTC): high volume, sharp moves, often creates fresh zones
- **New York session** (13:00–17:00 UTC): highest volume, best for zone confirmation

Avoid trading during major news events (CPI, FOMC, BTC ETF approval/rejection). News creates false zone touches that don't follow S/D logic.

---

## Coin Selection

**Any coin with a valid S/D setup + BTC macro alignment.**

There is no fixed watchlist. Sonum trades any coin with a clean setup. The current agent watchlist is a starting point, not a constraint.

Current agent watchlist (14 coins): SOL, BTC, ETH, XRP, SUI, AVAX, DOGE, ADA, LINK, DOT, UNI, ENA, AAVE, LTC

**Avoid** coins with:
- No clear S/D zone (just noise)
- No volume at the zone
- No absorption visible
- BTC macro against the trade direction
- Active narrative (meme coin, announcement-driven) — these ignore S/D zones

**Rule verified Apr 17**: DOGE/ENA/UNI/ADA/AAVE/LTC all traded profitably by Sonum Apr 13–16 when the watchlist was thought to be only 10 coins. There is no blacklist.

---

## What This Strategy Does NOT Use

- No Fibonacci retracements
- No RSI divergence signals (RSI shown on chart for context only)
- No MACD as entry signal
- No moving average crossovers
- No fixed timeframe (e.g., "I only trade 4H") — TF stack is mandatory
- No news trading

Indicators are displayed on the chart so Claude Opus 4.6 can use volume and RSI as *context* when identifying zones — not as entry signals.

---

## 26 Verified Lessons

These lessons come from live trading, paper trading, and deep analysis of 200+ verified Sonum trades.

1. **4H zone gate is mandatory** — lower-TF zones alone cause invalid entries (SOL $86 short)
2. **Trade any coin with valid S/D setup + BTC macro alignment** — no fixed coin list
3. **SL must be structural** (2–8%), never fixed percentage — fixed SL stops out before DCA fills
4. **Check BTC 1D before any alt entry** — never short alts when BTC making higher lows + 3+ consecutive green closes
5. **TP2 = zone 2, NEVER zone 3–4** — verified Apr 14: zone 3–4 missed 2/3 trades, zone 2 hit all 3
6. **Full TF stack required: 1M → 1W → 1D → 4H → 1H → 30M → 15M** — 1D/1W/1M added after XRP+SUI SL root cause
7. **Do NOT expand coin list during BTC macro downtrend** — all alts near lows, zones unclear
8. **Wick past SL = stop hunt, body close only** — AAVE wicked $85.05, body $86.34, trade hit +2192%
9. **DCA mechanic = two adjacent zones, one SL below both** — AAVE: entries $90/$87, SL $86
10. **Chart patterns = S/D zone confirmation** — V-bottom/W-bottom/flat base/flag/cup all map to same mechanics
11. **Equal highs/lows = liquidity sweep = fresh zone** — equal highs = retail SL cluster, sweep → demand zone
12. **BTC/ETH use daily zones** — BTC/ETH daily candle = altcoin 4H candle in significance
13. **Pre-plan entire trade before entering** — map entry/DCA/SL/TP1/TP2 at zones before clicking
14. **FVG + S/D zone overlap = high-confidence entry** — enter at zone top; FVG alone = TP only
15. **Never auto-pass rules with "check later"** — if volume/absorption can't be checked now, mark ❌ not ⏳
16. **Setup grades: A (swing) / B (intraday) / C (scalp) / D (no trade)** — C-grade never traded as swing
17. **Weekly structure is mandatory** — if weekly makes lower highs, any long = counter-trend = scalp only
18. **AI must not mislabel zone TFs** — 1D zone needs 3+ daily candle bodies; 4H candles don't count
19. **Breakout volume ≠ retest volume** — volume on impulse does not confirm the retest; check volume AT zone
20. **Multi-position sizing** — 0.5% margin per trade, no scaling; 6 positions = multiple days + multiple exchanges
21. **Startup entry gate** — entries blocked until ALL coins scanned (~40 min); stale zones = bad entries
22. **Never restart agent with open positions** — causes duplicate order entries
23. **Block entries until zone scan completes** — stale zones cause instant bad trades on startup
24. **Body-close SL in code, disaster SL on exchange** — never use exchange SL as primary
25. **Short trade verification pending** — no verified losing short trades in recent sample; rules hold but asymmetric sample
26. **Volume at zone when price returns** — absorption (high relative volume, price not moving) = zone validated; impulse volume ≠ zone volume

---

## Glossary

| Term | Definition |
|------|-----------|
| S/D zone | Supply or demand zone — a price range where institutional orders were placed |
| FVG | Fair Value Gap — a price gap (imbalance) where candles don't overlap |
| Absorption | High volume at a price level with minimal price movement — buyers/sellers filling orders |
| Stop hunt | Wick past a key level to trigger retail stops before reversing |
| Body close | The close price of a candle (not the wick high/low) |
| Structural SL | SL placed at a structural level (zone bottom/top), not a fixed percentage |
| 4H gate | Rule requiring lower-TF zones to have a 4H zone within ±5% |
| BTC gate | Rule blocking alt entries when BTC 1D direction opposes the trade |
| Sentinel | Zero-AI WebSocket price watcher that fires events to wake the agent |
| Disaster SL | Exchange hard SL at structural + 3% buffer — backup only |
| Epoch | 30-day profit settlement period for on-chain 20/80 split |
| Zone 1 / Zone 2 | First and second S/D zones in trade direction from entry |

---

## Strategy Verification Results

Our 4-stage automated pipeline ran on 5 demo coins (SOL, BTC, ETH, XRP, SUI) at 4H + 1D:

| Stage | Period | Result | Notes |
|-------|--------|--------|-------|
| IS Backtest | 2024 (full year) | Consistent positive RRR | 2024 data, vectorbt |
| OOS Verification | 2025 (full year) | Within ±8% of IS | Same rules, no refitting |
| Consistency | IS vs OOS | Consistent | Passes OOS gate |
| Shadow Trade | Live (ongoing) | Growing sample | Timestamped before price moved |

Grade computed from pipeline output. Platform cannot override this grade.

---

*Strategy sourced from live analysis of Sonum's Telegram trading signals. All rules verified through 200+ trades, ongoing TradingView verification, and live account testing.*
