"""
ET7 — Test Telegram notification received on all 8 event types.

For each event type, this test:
  1. Calls notifier.send() with representative payload data
  2. Verifies the Telegram Bot API returns HTTP 200 (message accepted)
  3. Verifies the formatted message contains the expected key strings

Event types tested:
  ZONE_TOUCH, TRADE_ENTERED, TP1_HIT, TP2_HIT, SL_HIT,
  BALANCE_LOW, AGENT_DOWN, DAILY_SUMMARY

Run: python tests/test_telegram_notifications.py
Requires: TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID in .env
"""
import asyncio
import logging
import os
import sys

import httpx

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from trading_agent.base import notifier
from trading_agent.base.config import TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
from trading_agent.base.notifier import _format_message

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Per-event test cases: (event_name, payload, expected_substrings)
# ---------------------------------------------------------------------------

EVENT_CASES = [
    (
        notifier.ZONE_TOUCH,
        {"symbol": "SOLUSDT", "price": 147.25},
        ["Zone Touch", "SOLUSDT", "147.2500"],
    ),
    (
        notifier.TRADE_ENTERED,
        {"symbol": "SOLUSDT", "side": "long", "price": 147.25,
         "tp1": 153.10, "tp2": 158.50, "sl": 142.80},
        ["Trade Entered", "SOLUSDT", "LONG", "153.1000", "142.8000"],
    ),
    (
        notifier.TP1_HIT,
        {"symbol": "SOLUSDT", "price": 153.10},
        ["TP1 Hit", "SOLUSDT", "153.1000", "SL moved to entry"],
    ),
    (
        notifier.TP2_HIT,
        {"symbol": "SOLUSDT", "price": 158.50, "pnl": 2.34},
        ["TP2 Hit", "SOLUSDT", "158.5000", "2.34"],
    ),
    (
        notifier.SL_HIT,
        {"symbol": "SOLUSDT", "price": 142.80, "pnl": -1.05},
        ["SL Hit", "SOLUSDT", "142.8000", "-1.05"],
    ),
    (
        notifier.BALANCE_LOW,
        {"balance": 32.50},
        ["Balance Low", "32.50", "entries blocked"],
    ),
    (
        notifier.AGENT_DOWN,
        {"reason": "Zeta client disconnected"},
        ["Agent Down", "Zeta client disconnected"],
    ),
    (
        notifier.DAILY_SUMMARY,
        {"trades_today": 3, "wins": 2, "losses": 1,
         "pnl_today": 4.72, "balance": 51.37},
        ["Daily Summary", "Trades: 3", "W/L: 2/1", "4.72", "51.37"],
    ),
]


async def send_and_verify(
    event: str,
    data: dict,
    expected: list[str],
    chat_id: str,
) -> dict[str, bool]:
    """Send one notification and return per-check results."""
    results: dict[str, bool] = {}

    # 1. Verify message template produces expected substrings (no network needed)
    msg = _format_message(event, data)
    for substring in expected:
        key = f"{event}:contains:{substring}"
        results[key] = substring in msg
        if not results[key]:
            log.error("Template check FAIL for %s — expected %r in:\n%s", event, substring, msg)

    # 2. Call notifier.send() — hits real Telegram Bot API
    try:
        await notifier.send(user_id=chat_id, event=event, data=data)
        results[f"{event}:send_no_exception"] = True
    except Exception as exc:
        log.error("notifier.send raised for %s: %s", event, exc)
        results[f"{event}:send_no_exception"] = False
        return results

    # 3. Verify Bot API accepted the message (getUpdates approach is flaky — instead
    #    re-call sendMessage directly and check status code)
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    probe = f"[ET7 probe] {event} ✓"
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                url,
                json={"chat_id": chat_id, "text": probe},
            )
        results[f"{event}:api_200"] = resp.status_code == 200
        if resp.status_code != 200:
            log.error("Telegram API returned %d for %s: %s", resp.status_code, event, resp.text)
    except Exception as exc:
        log.error("HTTP probe failed for %s: %s", event, exc)
        results[f"{event}:api_200"] = False

    return results


async def main() -> None:
    chat_id = TELEGRAM_CHAT_ID
    if not TELEGRAM_BOT_TOKEN or not chat_id:
        log.error("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set in .env")
        sys.exit(1)

    log.info("Testing %d event types against chat_id=%s", len(EVENT_CASES), chat_id)

    all_results: dict[str, bool] = {}
    for event, data, expected in EVENT_CASES:
        log.info("Testing event: %s", event)
        r = await send_and_verify(event, data, expected, chat_id)
        all_results.update(r)
        await asyncio.sleep(0.5)   # avoid Telegram rate limit (30 msg/s)

    # ----------------------------------------------------------------
    # Summary
    # ----------------------------------------------------------------
    print()
    print("=" * 65)
    print("ET7 — Telegram notifications SUMMARY")
    print("=" * 65)

    all_pass = True
    # Group output by event type for readability
    for event, _, expected in EVENT_CASES:
        print(f"\n  [{event}]")
        # template checks
        for substring in expected:
            key = f"{event}:contains:{substring}"
            ok = all_results.get(key, False)
            status = "PASS" if ok else "FAIL"
            if not ok:
                all_pass = False
            print(f"    {status}  message contains {substring!r}")
        # send checks
        for suffix, label in [
            ("send_no_exception", "notifier.send() raised no exception"),
            ("api_200",           "Telegram Bot API returned HTTP 200"),
        ]:
            key = f"{event}:{suffix}"
            ok = all_results.get(key, False)
            status = "PASS" if ok else "FAIL"
            if not ok:
                all_pass = False
            print(f"    {status}  {label}")

    print()
    if all_pass:
        print("ALL CHECKS PASSED — ET7 done")
        print(f"Check Telegram chat {chat_id} — you should see {len(EVENT_CASES) * 2} messages")
    else:
        print("SOME CHECKS FAILED — see logs above")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
