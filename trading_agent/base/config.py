"""
Platform-wide configuration.
All env vars are loaded here once. Import constants directly from this module.
"""
import logging
import os
from dotenv import load_dotenv

load_dotenv()

_logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# CF2 — Environment variables
# ---------------------------------------------------------------------------


def _require_env(key: str, default: str = "") -> str:
    """Get env var with fallback. Log a warning if a critical var is missing."""
    value = os.getenv(key, default)
    if not value:
        _logger.warning("Environment variable %s is not set — using empty default", key)
    return value


# Helius RPC
HELIUS_RPC_URL: str = _require_env("HELIUS_RPC_URL")

# Solana
SOLANA_NETWORK: str = os.getenv("SOLANA_NETWORK", "devnet")
PHANTOM_PRIVATE_KEY: str = _require_env("PHANTOM_PRIVATE_KEY")
DEVNET_AGENT_KEYPAIR_PATH: str = os.getenv(
    "DEVNET_AGENT_KEYPAIR_PATH", "~/.config/solana/devnet-agent.json"
)
DEVNET_AGENT_PUBKEY: str = os.getenv("DEVNET_AGENT_PUBKEY", "")
PLATFORM_WALLET_PUBKEY: str = os.getenv("PLATFORM_WALLET_PUBKEY", "")
PROGRAM_ID: str = os.getenv("PROGRAM_ID", "")
USDC_MINT_DEVNET: str = os.getenv(
    "USDC_MINT_DEVNET", "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
)

# AWS Bedrock (Claude Opus 4.6)
AWS_ACCESS_KEY_ID: str = _require_env("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY: str = _require_env("AWS_SECRET_ACCESS_KEY")
AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")

# Telegram
TELEGRAM_BOT_TOKEN: str = _require_env("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID: str = _require_env("TELEGRAM_CHAT_ID")

# WEEX (Phase 2 — CEX)
WEEX_API_KEY: str = os.getenv("WEEX_API_KEY", "")
WEEX_SECRET: str = os.getenv("WEEX_SECRET", "")
WEEX_PASSPHRASE: str = os.getenv("WEEX_PASSPHRASE", "")

# Bybit / BingX / Binance / Bitget (Phase 2)
BYBIT_API_KEY: str = os.getenv("BYBIT_API_KEY", "")
BYBIT_SECRET: str = os.getenv("BYBIT_SECRET", "")
BINGX_API_KEY: str = os.getenv("BINGX_API_KEY", "")
BINGX_SECRET: str = os.getenv("BINGX_SECRET", "")
BINANCE_API_KEY: str = os.getenv("BINANCE_API_KEY", "")
BINANCE_SECRET: str = os.getenv("BINANCE_SECRET", "")
BITGET_API_KEY: str = os.getenv("BITGET_API_KEY", "")
BITGET_SECRET: str = os.getenv("BITGET_SECRET", "")
BITGET_PASSPHRASE: str = os.getenv("BITGET_PASSPHRASE", "")

# Pyth
PYTH_WS_URL: str = os.getenv(
    f"PYTH_WS_URL_{SOLANA_NETWORK.upper()}", "wss://hermes.pyth.network/ws"
)
PYTH_REST_URL: str = os.getenv(
    f"PYTH_REST_URL_{SOLANA_NETWORK.upper()}", "https://hermes.pyth.network"
)

# ---------------------------------------------------------------------------
# CF3 — Supported exchanges
# ---------------------------------------------------------------------------

SUPPORTED_EXCHANGES: list[str] = ["zeta", "jupiter"]  # CEX added in Phase 2

# ---------------------------------------------------------------------------
# CF4 — Supported notification channels
# ---------------------------------------------------------------------------

SUPPORTED_NOTIFICATION_CHANNELS: list[str] = ["telegram"]  # whatsapp added post-hackathon

# ---------------------------------------------------------------------------
# CF5 — Max concurrent at-risk positions
# ---------------------------------------------------------------------------

MAX_AT_RISK_SLOTS: int = 2

# ---------------------------------------------------------------------------
# CF6 — Minimum account balance before entries are blocked
# ---------------------------------------------------------------------------

MIN_BALANCE_USD: float = 35.0

# ---------------------------------------------------------------------------
# CF7 — Timeframe stack (ordered coarse → fine)
# ---------------------------------------------------------------------------

TF_STACK: list[str] = ["1M", "1W", "1D", "4H", "1H", "30M", "15M"]

# ---------------------------------------------------------------------------
# CF8 — 4H zone gate tolerance: lower-TF zone must have a 4H zone within ±5%
# ---------------------------------------------------------------------------

ZONE_GATE_PCT: float = 0.05

# ---------------------------------------------------------------------------
# CF9 — Disaster SL buffer above/below structural SL (exchange hard stop)
# ---------------------------------------------------------------------------

DISASTER_SL_BUFFER: float = 0.03

# ---------------------------------------------------------------------------
# CF10 — Profit epoch settlement interval
# ---------------------------------------------------------------------------

EPOCH_INTERVAL_DAYS: int = 30
