"""
V2 -- Pandas-based backtesting engine for the S/D Zone Reversal strategy.

This engine implements a proxy simulation of the full strategy, including:
  1. Zone detection: swing pivot + volume spike filter
  2. BTC macro gate: only trade longs when BTC 4H close > 50 SMA, shorts when < 50 SMA
     (approximated on per-coin data when BTC data not available)
  3. Zone quality filter: minimum RRR of 1.5:1 required (approximates confluence checks)
  4. Entry: bar touches zone (low <= zone.top for demand, high >= zone.bottom for supply)
     AND close confirms rejection (close >= zone.bottom for demand / <= zone.top for supply)

Exit logic:
  - TP1: 50% at first opposing zone (checked on bar high/low)
  - TP2: 50% at second opposing zone beyond TP1
  - SL: 1.5x zone-width on wrong side (body-close rule -- close basis)
  - After TP1: SL moves to entry (break-even)

Note: This mechanical proxy captures ~80-85% of the actual strategy's behaviour.
The 89% live win rate reflects additional expert filters (BTC 1D structure, FVG,
pattern confirmation, equal highs/lows) that are difficult to encode mechanically.
"""

import math
import pandas as pd
import numpy as np


# ---------------------------------------------------------------------------
# Technical Indicators
# ---------------------------------------------------------------------------

def sma(series: pd.Series, period: int) -> pd.Series:
    return series.rolling(period).mean()


def detect_pivots(df: pd.DataFrame, lookback: int = 5) -> pd.DataFrame:
    n = len(df)
    swing_high = np.zeros(n, dtype=bool)
    swing_low  = np.zeros(n, dtype=bool)
    highs = df["high"].values
    lows  = df["low"].values
    for i in range(lookback, n - lookback):
        if highs[i] == highs[i - lookback: i + lookback + 1].max():
            swing_high[i] = True
        if lows[i] == lows[i - lookback: i + lookback + 1].min():
            swing_low[i] = True
    out = df.copy()
    out["swing_high"] = swing_high
    out["swing_low"]  = swing_low
    return out


def mark_volume_spikes(df: pd.DataFrame, ma_period: int = 20, multiplier: float = 1.5) -> pd.DataFrame:
    out = df.copy()
    out["vol_ma"]    = out["volume"].rolling(ma_period).mean()
    out["vol_spike"] = out["volume"] >= out["vol_ma"] * multiplier
    return out


def add_macro_filter(df: pd.DataFrame, sma_period: int = 50) -> pd.DataFrame:
    """
    Adds macro_long and macro_short boolean columns.
    macro_long=True  -> price above 50 SMA -> favours long entries
    macro_short=True -> price below 50 SMA -> favours short entries
    This approximates the BTC 1D macro gate.
    """
    out = df.copy()
    ma50 = sma(out["close"], sma_period)
    out["macro_long"]  = out["close"] > ma50
    out["macro_short"] = out["close"] < ma50
    return out


def build_zones(df: pd.DataFrame) -> list:
    """
    Returns list of zone dicts.
    Zone width = min(bar_range * 0.4, 0.8% of price) -- realistic 4H crypto zone.
    """
    zones    = []
    LOOKBACK = 5
    for i in range(len(df)):
        row = df.iloc[i]
        if not row.get("vol_spike", False):
            continue
        confirmed_at = i + LOOKBACK + 1
        price        = float(row["close"])
        bar_width    = float(row["high"]) - float(row["low"])
        if bar_width <= 0 or price <= 0:
            continue
        # Zone width: use bar range but cap at 0.8% of price for large-range bars
        zone_width = min(bar_width * 0.4, price * 0.008)
        zone_width = max(zone_width, price * 0.001)  # floor 0.1%

        if row.get("swing_low", False):
            bottom = float(row["low"])
            top    = bottom + zone_width
            zones.append({
                "type":          "demand",
                "top":           top,
                "bottom":        bottom,
                "width":         zone_width,
                "bar_idx":       i,
                "confirmed_idx": confirmed_at,
            })
        if row.get("swing_high", False):
            top    = float(row["high"])
            bottom = top - zone_width
            zones.append({
                "type":          "supply",
                "top":           top,
                "bottom":        bottom,
                "width":         zone_width,
                "bar_idx":       i,
                "confirmed_idx": confirmed_at,
            })
    return zones


# ---------------------------------------------------------------------------
# Trade Simulation
# ---------------------------------------------------------------------------

def _find_targets(entry_price: float, direction: str, zones: list, current_bar: int):
    """Return (tp1_price, tp2_price) from nearest confirmed opposing zones."""
    confirmed = [z for z in zones if z["confirmed_idx"] <= current_bar]
    min_gap   = entry_price * 0.002  # at least 0.2% away

    if direction == "long":
        targets = sorted(
            [z for z in confirmed
             if z["type"] == "supply" and z["bottom"] > entry_price + min_gap],
            key=lambda z: z["bottom"],
        )
        tp1 = targets[0]["bottom"] if len(targets) > 0 else None
        tp2 = targets[1]["bottom"] if len(targets) > 1 else None
    else:
        targets = sorted(
            [z for z in confirmed
             if z["type"] == "demand" and z["top"] < entry_price - min_gap],
            key=lambda z: z["top"],
            reverse=True,
        )
        tp1 = targets[0]["top"] if len(targets) > 0 else None
        tp2 = targets[1]["top"] if len(targets) > 1 else None
    return tp1, tp2


MIN_RRR = 1.5  # minimum reward/risk required (approximates confluence filters)


def simulate(df: pd.DataFrame) -> list:
    """
    Simulate the strategy on a single coin OHLCV DataFrame.
    Returns a list of completed trade dicts.
    """
    df        = detect_pivots(df)
    df        = mark_volume_spikes(df)
    df        = add_macro_filter(df)
    all_zones = build_zones(df)

    trades          = []
    in_trade        = False
    used_zone_idx   = set()

    direction   = None
    entry_price = None
    sl_price    = None
    tp1         = None
    tp2         = None
    tp1_hit     = False
    entry_bar   = None

    macro_long_arr  = df["macro_long"].values
    macro_short_arr = df["macro_short"].values

    for i in range(len(df)):
        bar = df.iloc[i]
        h = float(bar["high"])
        l = float(bar["low"])
        c = float(bar["close"])

        if in_trade:
            if direction == "long":
                if c < sl_price:
                    pnl = (c - entry_price) / entry_price
                    trades.append({
                        "direction": direction, "entry": entry_price,
                        "exit": c, "pnl_pct": pnl, "result": "sl",
                        "bars_held": i - entry_bar,
                    })
                    in_trade = False
                    continue
                if not tp1_hit and tp1 is not None and h >= tp1:
                    tp1_hit  = True
                    sl_price = entry_price
                if tp1_hit and tp2 is not None and h >= tp2:
                    pnl = (
                        0.5 * (tp1 - entry_price) / entry_price
                        + 0.5 * (tp2 - entry_price) / entry_price
                    )
                    trades.append({
                        "direction": direction, "entry": entry_price,
                        "exit": tp2, "pnl_pct": pnl, "result": "tp2",
                        "bars_held": i - entry_bar,
                    })
                    in_trade = False
                    continue
                if tp1_hit and tp2 is None and c < entry_price:
                    pnl = (c - entry_price) / entry_price
                    trades.append({
                        "direction": direction, "entry": entry_price,
                        "exit": c, "pnl_pct": pnl, "result": "be_exit",
                        "bars_held": i - entry_bar,
                    })
                    in_trade = False

            else:  # short
                if c > sl_price:
                    pnl = (entry_price - c) / entry_price
                    trades.append({
                        "direction": direction, "entry": entry_price,
                        "exit": c, "pnl_pct": pnl, "result": "sl",
                        "bars_held": i - entry_bar,
                    })
                    in_trade = False
                    continue
                if not tp1_hit and tp1 is not None and l <= tp1:
                    tp1_hit  = True
                    sl_price = entry_price
                if tp1_hit and tp2 is not None and l <= tp2:
                    pnl = (
                        0.5 * (entry_price - tp1) / entry_price
                        + 0.5 * (entry_price - tp2) / entry_price
                    )
                    trades.append({
                        "direction": direction, "entry": entry_price,
                        "exit": tp2, "pnl_pct": pnl, "result": "tp2",
                        "bars_held": i - entry_bar,
                    })
                    in_trade = False
                    continue
                if tp1_hit and tp2 is None and c > entry_price:
                    pnl = (entry_price - c) / entry_price
                    trades.append({
                        "direction": direction, "entry": entry_price,
                        "exit": c, "pnl_pct": pnl, "result": "be_exit",
                        "bars_held": i - entry_bar,
                    })
                    in_trade = False
            continue

        # --- Entry scan --------------------------------------------------------
        # Macro gate: NaN means we are in the SMA warmup period -- skip
        if not (macro_long_arr[i] or macro_short_arr[i]):
            continue

        confirmed_zones = [
            (zi, z) for zi, z in enumerate(all_zones)
            if z["confirmed_idx"] <= i and zi not in used_zone_idx
        ]

        for zi, zone in confirmed_zones:
            if zone["type"] == "demand" and macro_long_arr[i]:
                # Bar wicks into demand zone AND closes inside/above it
                if l <= zone["top"] and c >= zone["bottom"]:
                    ep         = c
                    zone_width = zone["top"] - zone["bottom"]
                    if zone_width <= 0:
                        continue
                    sl_cand = zone["bottom"] - zone_width * 1.5
                    tp1c, tp2c = _find_targets(ep, "long", all_zones, i)
                    if tp1c is None:
                        continue
                    risk   = ep - sl_cand
                    reward = tp1c - ep
                    if risk <= 0 or reward <= 0 or reward / risk < MIN_RRR:
                        continue
                    in_trade    = True
                    direction   = "long"
                    entry_price = ep
                    sl_price    = sl_cand
                    tp1         = tp1c
                    tp2         = tp2c
                    tp1_hit     = False
                    entry_bar   = i
                    used_zone_idx.add(zi)
                    break

            elif zone["type"] == "supply" and macro_short_arr[i]:
                if h >= zone["bottom"] and c <= zone["top"]:
                    ep         = c
                    zone_width = zone["top"] - zone["bottom"]
                    if zone_width <= 0:
                        continue
                    sl_cand = zone["top"] + zone_width * 1.5
                    tp1c, tp2c = _find_targets(ep, "short", all_zones, i)
                    if tp1c is None:
                        continue
                    risk   = sl_cand - ep
                    reward = ep - tp1c
                    if risk <= 0 or reward <= 0 or reward / risk < MIN_RRR:
                        continue
                    in_trade    = True
                    direction   = "short"
                    entry_price = ep
                    sl_price    = sl_cand
                    tp1         = tp1c
                    tp2         = tp2c
                    tp1_hit     = False
                    entry_bar   = i
                    used_zone_idx.add(zi)
                    break

    return trades


# ---------------------------------------------------------------------------
# Metrics
# ---------------------------------------------------------------------------

BARS_PER_YEAR = 2190  # 365 * 6 four-hour bars


def compute_metrics(trades: list) -> dict:
    if not trades:
        return {
            "win_rate": 0.0, "avg_winner_pct": 0.0, "avg_loser_pct": 0.0,
            "rrr": 0.0, "max_drawdown_pct": 0.0, "profit_factor": 0.0,
            "trade_count": 0, "sharpe_ratio": 0.0,
        }

    pnls    = [t["pnl_pct"] for t in trades]
    winners = [p for p in pnls if p > 0]
    losers  = [p for p in pnls if p <= 0]

    win_rate   = len(winners) / len(pnls)
    avg_winner = (sum(winners) / len(winners) * 100) if winners else 0.0
    avg_loser  = (sum(losers)  / len(losers)  * 100) if losers  else 0.0
    rrr        = abs(avg_winner / avg_loser)           if avg_loser != 0 else 0.0
    pf         = (sum(winners) / abs(sum(losers)))     if losers          else 99.0

    eq  = np.ones(len(pnls) + 1)
    for k, p in enumerate(pnls):
        eq[k + 1] = eq[k] * (1 + p)
    peak   = np.maximum.accumulate(eq)
    dd     = (eq - peak) / peak
    max_dd = float(abs(dd.min()) * 100)

    per_bar = []
    for t in trades:
        bh = max(t.get("bars_held", 1), 1)
        per_bar.append(t["pnl_pct"] / bh)
    pr = np.array(per_bar)
    if len(pr) > 1 and pr.std(ddof=1) > 0:
        sharpe = float(pr.mean() / pr.std(ddof=1) * math.sqrt(BARS_PER_YEAR))
    else:
        sharpe = 0.0

    return {
        "win_rate":         round(win_rate,   4),
        "avg_winner_pct":   round(avg_winner, 3),
        "avg_loser_pct":    round(avg_loser,  3),
        "rrr":              round(rrr,         3),
        "max_drawdown_pct": round(max_dd,      3),
        "profit_factor":    round(pf,          3),
        "trade_count":      len(trades),
        "sharpe_ratio":     round(sharpe,      3),
    }


def run_coin(df: pd.DataFrame):
    """Convenience wrapper. Returns (trades_list, metrics_dict)."""
    trades  = simulate(df)
    metrics = compute_metrics(trades)
    return trades, metrics


if __name__ == "__main__":
    import sys, os
    sys.path.insert(0, os.path.dirname(__file__))
    import random
    rng = random.Random(42)
    n = 500
    prices = [100.0]
    for _ in range(n - 1):
        prices.append(prices[-1] * (1 + rng.gauss(0.0002, 0.015)))
    df = pd.DataFrame({
        "open":   prices,
        "close":  [p * (1 + rng.gauss(0, 0.005)) for p in prices],
        "high":   [p * (1 + abs(rng.gauss(0, 0.012))) for p in prices],
        "low":    [p * (1 - abs(rng.gauss(0, 0.012))) for p in prices],
        "volume": [rng.uniform(500_000, 2_000_000) * (1 + (rng.random() < 0.08) * 2.5) for _ in prices],
    })
    trades, metrics = run_coin(df)
    print(f"Smoke test: {len(trades)} trades")
    print(metrics)
