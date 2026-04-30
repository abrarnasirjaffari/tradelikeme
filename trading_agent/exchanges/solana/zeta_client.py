import logging
import os
from typing import Optional

from solders.keypair import Keypair
from solana.rpc.async_api import AsyncClient

logger = logging.getLogger(__name__)

# Symbols supported by Zeta Markets
SUPPORTED_SYMBOLS = {"SOL", "BTC", "ETH", "APT", "ARB"}

# Maximum leverage offered by Zeta Markets
MAX_LEVERAGE = 50


class ZetaClient:
    """
    Async client for Zeta Markets perpetuals (primary Solana perps protocol).
    Program ID: ZETAxsqBRPpep611126PjPNs6pCgB28B47v1vX61X6
    Pairs: SOL, BTC, ETH, APT, ARB  |  Max leverage: 50x
    """

    def __init__(self, network: str = "devnet"):
        # Populated in async initialise()
        self._network = network
        self._rpc_url: str = os.getenv("HELIUS_RPC_URL", "")
        self._keypair: Optional[Keypair] = None
        self._rpc: Optional[AsyncClient] = None
        self._zeta = None  # zetamarkets_py.Client, set in initialise()

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    async def initialise(self) -> None:
        """Load keypair, connect to Helius RPC, init Zeta client. (ZC4)"""
        raise NotImplementedError

    async def close(self) -> None:
        """Close RPC connection gracefully."""
        if self._rpc:
            await self._rpc.close()
            logger.info("ZetaClient RPC connection closed")

    # ------------------------------------------------------------------
    # Account
    # ------------------------------------------------------------------

    async def get_balance(self) -> float:
        """Return USDC margin balance (ZC5)."""
        raise NotImplementedError

    # ------------------------------------------------------------------
    # Price
    # ------------------------------------------------------------------

    async def get_price(self, symbol: str) -> float:
        """Return latest mid price for symbol via Pyth feed (ZC6)."""
        raise NotImplementedError

    # ------------------------------------------------------------------
    # Positions
    # ------------------------------------------------------------------

    async def open_position(
        self,
        symbol: str,
        side: str,          # "long" | "short"
        size: float,        # base asset quantity
        leverage: float,
    ) -> str:
        """Place a market order. Returns order/tx signature. (ZC7)"""
        raise NotImplementedError

    async def close_position(self, symbol: str) -> str:
        """Full close of open position for symbol. Returns tx signature. (ZC8)"""
        raise NotImplementedError

    async def set_sl(self, symbol: str, price: float) -> str:
        """Place stop-loss order. Returns order ID. (ZC9)"""
        raise NotImplementedError

    async def set_tp(self, symbol: str, price: float, qty: float) -> str:
        """Place take-profit order for qty. Returns order ID. (ZC10)"""
        raise NotImplementedError

    async def get_position(self, symbol: str) -> Optional[dict]:
        """
        Return current position or None if flat. (ZC11)
        Dict keys: symbol, side, size, entry_price, unrealised_pnl
        """
        raise NotImplementedError

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _assert_supported(self, symbol: str) -> None:
        if symbol not in SUPPORTED_SYMBOLS:
            raise ValueError(
                f"Symbol '{symbol}' not supported by Zeta Markets. "
                f"Supported: {SUPPORTED_SYMBOLS}"
            )
