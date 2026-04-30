import logging

from trading_agent.base.exchange_base import ExchangeBase
from trading_agent.exchanges.solana.zeta_client import ZetaClient, SUPPORTED_SYMBOLS as ZETA_SYMBOLS
from trading_agent.exchanges.solana.jupiter_client import JupiterClient, SUPPORTED_SYMBOLS as JUPITER_SYMBOLS

logger = logging.getLogger(__name__)


class SolanaRouter(ExchangeBase):
    """
    Routes calls to ZetaClient (primary) or JupiterClient (fallback).

    Routing rules:
    - Symbol only on Zeta (APT, ARB): Zeta only, no fallback.
    - Symbol on both (SOL, BTC, ETH): try Zeta first; if Zeta raises, retry on Jupiter.
    - Symbol only on Jupiter: Jupiter directly (edge case, currently none).

    Usage:
        router = SolanaRouter("devnet")
        await router.initialise()
        balance = await router.get_balance()
        await router.close()
    """

    def __init__(self, network: str = "devnet") -> None:
        self._zeta = ZetaClient(network)
        self._jupiter = JupiterClient()
        self._zeta_up = True  # flips False on repeated failures

    async def initialise(self) -> None:
        """Initialise both clients. Jupiter failure is non-fatal (mainnet only)."""
        await self._zeta.initialise()
        try:
            await self._jupiter.initialise()
        except Exception as exc:
            logger.warning("JupiterClient init failed (non-fatal): %s", exc)
            self._zeta_up = True  # Zeta still usable

    async def close(self) -> None:
        await self._zeta.close()
        await self._jupiter.close()

    # ------------------------------------------------------------------
    # Routing helpers
    # ------------------------------------------------------------------

    def _zeta_only(self, symbol: str) -> bool:
        return symbol in ZETA_SYMBOLS and symbol not in JUPITER_SYMBOLS

    def _jupiter_only(self, symbol: str) -> bool:
        return symbol in JUPITER_SYMBOLS and symbol not in ZETA_SYMBOLS

    def _on_both(self, symbol: str) -> bool:
        return symbol in ZETA_SYMBOLS and symbol in JUPITER_SYMBOLS

    async def _call_with_fallback(self, symbol: str, zeta_coro, jupiter_coro):
        """Try Zeta; fall back to Jupiter for symbols available on both."""
        if self._zeta_only(symbol):
            return await zeta_coro()

        if self._jupiter_only(symbol):
            return await jupiter_coro()

        # Symbol on both — try Zeta first
        if self._zeta_up:
            try:
                result = await zeta_coro()
                return result
            except Exception as exc:
                logger.warning(
                    "Zeta call failed for %s (%s) — falling back to Jupiter", symbol, exc
                )
                self._zeta_up = False

        logger.info("Routing %s → Jupiter (Zeta down)", symbol)
        return await jupiter_coro()

    # ------------------------------------------------------------------
    # ExchangeBase implementation
    # ------------------------------------------------------------------

    async def get_balance(self) -> float:
        """Return balance from Zeta (primary). Falls back to Jupiter if Zeta down."""
        if self._zeta_up:
            try:
                return await self._zeta.get_balance()
            except Exception as exc:
                logger.warning("Zeta get_balance failed (%s) — trying Jupiter", exc)
                self._zeta_up = False
        return await self._jupiter.get_balance()

    async def get_price(self, symbol: str) -> float:
        return await self._call_with_fallback(
            symbol,
            lambda: self._zeta.get_price(symbol),
            lambda: self._jupiter.get_price(symbol),
        )

    async def open_position(self, symbol: str, side: str, size: float, leverage: int) -> dict:
        return await self._call_with_fallback(
            symbol,
            lambda: self._zeta.open_position(symbol, side, size, leverage),
            lambda: self._jupiter.open_position(symbol, side, size, leverage),
        )

    async def close_position(self, symbol: str) -> dict:
        return await self._call_with_fallback(
            symbol,
            lambda: self._zeta.close_position(symbol),
            lambda: self._jupiter.close_position(symbol),
        )

    async def set_sl(self, symbol: str, price: float) -> dict:
        return await self._call_with_fallback(
            symbol,
            lambda: self._zeta.set_sl(symbol, price),
            lambda: self._jupiter.set_sl(symbol, price),
        )

    async def set_tp(self, symbol: str, price: float, qty: float) -> dict:
        return await self._call_with_fallback(
            symbol,
            lambda: self._zeta.set_tp(symbol, price, qty),
            lambda: self._jupiter.set_tp(symbol, price, qty),
        )

    async def get_position(self, symbol: str) -> dict | None:
        return await self._call_with_fallback(
            symbol,
            lambda: self._zeta.get_position(symbol),
            lambda: self._jupiter.get_position(symbol),
        )
