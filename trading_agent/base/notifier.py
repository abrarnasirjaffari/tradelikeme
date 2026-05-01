"""
Notification dispatcher.

Usage:
    await notifier.send(user_id="6398964627", event="TRADE_ENTERED", data={...})

Channels are enabled by SUPPORTED_NOTIFICATION_CHANNELS in config.py.
Each send() call fires all enabled channels concurrently via asyncio.gather().
"""
import asyncio
import logging
from typing import Any

from trading_agent.base.config import SUPPORTED_NOTIFICATION_CHANNELS, TELEGRAM_CHAT_ID

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# N9 — Event type constants
# ---------------------------------------------------------------------------

ZONE_TOUCH      = "ZONE_TOUCH"
TRADE_ENTERED   = "TRADE_ENTERED"
TP1_HIT         = "TP1_HIT"
TP2_HIT         = "TP2_HIT"
SL_HIT          = "SL_HIT"
BALANCE_LOW     = "BALANCE_LOW"
AGENT_DOWN      = "AGENT_DOWN"
DAILY_SUMMARY   = "DAILY_SUMMARY"

# ---------------------------------------------------------------------------
# N10 — Message templates
# ---------------------------------------------------------------------------

def _format_message(event: str, data: dict[str, Any]) -> str:
    symbol   = data.get("symbol", "?")
    price    = data.get("price")
    side     = data.get("side", "").upper()
    tp1      = data.get("tp1")
    tp2      = data.get("tp2")
    sl       = data.get("sl")
    pnl      = data.get("pnl")
    balance  = data.get("balance")
    reason   = data.get("reason", "")

    def _p(v: float | None, digits: int = 4) -> str:
        return f"{v:.{digits}f}" if v is not None else "?"

    if event == ZONE_TOUCH:
        return (
            f"👁 <b>Zone Touch</b> — {symbol}\n"
            f"Price: <code>{_p(price)}</code>"
        )
    if event == TRADE_ENTERED:
        return (
            f"✅ <b>Trade Entered</b> — {symbol} {side}\n"
            f"Entry: <code>{_p(price)}</code>\n"
            f"TP1: <code>{_p(tp1)}</code>  TP2: <code>{_p(tp2)}</code>\n"
            f"SL:  <code>{_p(sl)}</code>"
        )
    if event == TP1_HIT:
        return (
            f"🎯 <b>TP1 Hit</b> — {symbol}\n"
            f"Price: <code>{_p(price)}</code>  →  SL moved to entry"
        )
    if event == TP2_HIT:
        return (
            f"🏆 <b>TP2 Hit</b> — {symbol}\n"
            f"Price: <code>{_p(price)}</code>\n"
            f"P&L: <code>{_p(pnl, 2)} USDC</code>"
        )
    if event == SL_HIT:
        return (
            f"🛑 <b>SL Hit</b> — {symbol}\n"
            f"Price: <code>{_p(price)}</code>\n"
            f"P&L: <code>{_p(pnl, 2)} USDC</code>"
        )
    if event == BALANCE_LOW:
        return (
            f"⚠️ <b>Balance Low</b>\n"
            f"Balance: <code>${_p(balance, 2)}</code> — entries blocked"
        )
    if event == AGENT_DOWN:
        return f"🔴 <b>Agent Down</b>\nReason: {reason}"
    if event == DAILY_SUMMARY:
        trades  = data.get("trades_today", 0)
        wins    = data.get("wins", 0)
        losses  = data.get("losses", 0)
        pnl_day = data.get("pnl_today", 0.0)
        return (
            f"📊 <b>Daily Summary</b>\n"
            f"Trades: {trades}  W/L: {wins}/{losses}\n"
            f"P&L: <code>${pnl_day:.2f} USDC</code>\n"
            f"Balance: <code>${_p(balance, 2)}</code>"
        )
    # fallback for unknown events
    return f"<b>{event}</b>\n{data}"


# ---------------------------------------------------------------------------
# N1-N3 — Dispatcher
# ---------------------------------------------------------------------------

async def send(user_id: str, event: str, data: dict[str, Any]) -> None:
    """
    Dispatch a notification to all enabled channels concurrently.

    user_id  — Telegram chat ID (or future multi-channel user identifier)
    event    — one of the event type constants above
    data     — event payload dict
    """
    message = _format_message(event, data)
    tasks = []

    if "telegram" in SUPPORTED_NOTIFICATION_CHANNELS:
        from trading_agent.channels.telegram import send_telegram
        chat_id = user_id or TELEGRAM_CHAT_ID
        tasks.append(send_telegram(chat_id, message))

    # whatsapp channel added post-hackathon (N7/N8 on hold)

    if not tasks:
        logger.warning("notifier.send: no channels enabled — message dropped (%s)", event)
        return

    results = await asyncio.gather(*tasks, return_exceptions=True)
    for i, result in enumerate(results):
        if isinstance(result, Exception):
            logger.error("Channel %d failed for event %s: %s", i, event, result)
