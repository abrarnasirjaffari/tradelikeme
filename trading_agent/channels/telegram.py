"""
Telegram notification channel.
Sends text messages and chart screenshots via the Bot API.
"""
import logging
import os
from pathlib import Path

import httpx

from trading_agent.base.config import TELEGRAM_BOT_TOKEN

logger = logging.getLogger(__name__)

_BASE = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}"

# M19 fix: shared httpx.AsyncClient — avoids creating a new client per request.
# Lazy singleton pattern: initialized on first use.
_http_client: httpx.AsyncClient | None = None


def _get_client(timeout: float = 10) -> httpx.AsyncClient:
    """Return the shared httpx.AsyncClient, creating it on first call."""
    global _http_client
    if _http_client is None or _http_client.is_closed:
        _http_client = httpx.AsyncClient(timeout=timeout)
    return _http_client


async def send_telegram(chat_id: str, message: str) -> None:
    """Send a plain-text message to chat_id via Telegram Bot API."""
    url = f"{_BASE}/sendMessage"
    payload = {"chat_id": chat_id, "text": message, "parse_mode": "HTML"}
    client = _get_client(timeout=10)
    resp = await client.post(url, json=payload)
    if not resp.is_success:
        logger.error("Telegram sendMessage failed: %s %s", resp.status_code, resp.text)
    else:
        logger.debug("Telegram message sent to %s", chat_id)


async def send_photo_telegram(chat_id: str, image_path: str, caption: str = "") -> None:
    """Send a chart screenshot (PNG) with an optional caption."""
    url = f"{_BASE}/sendPhoto"
    path = Path(image_path)
    if not path.exists():
        logger.error("send_photo_telegram: file not found: %s", image_path)
        return
    client = _get_client(timeout=20)
    with path.open("rb") as f:
        resp = await client.post(
            url,
            data={"chat_id": chat_id, "caption": caption, "parse_mode": "HTML"},
            files={"photo": (path.name, f, "image/png")},
        )
    if not resp.is_success:
        logger.error("Telegram sendPhoto failed: %s %s", resp.status_code, resp.text)
    else:
        logger.debug("Telegram photo sent to %s", chat_id)
