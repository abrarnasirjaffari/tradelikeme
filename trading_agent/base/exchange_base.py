from abc import ABC, abstractmethod


class ExchangeBase(ABC):

    @abstractmethod
    async def get_balance(self) -> float:
        """Return available USDC/CASH margin balance."""

    @abstractmethod
    async def get_price(self, symbol: str) -> float:
        """Return latest mid price for symbol."""

    @abstractmethod
    async def open_position(self, symbol: str, side: str, size: float, leverage: int) -> dict:
        """Place market order. side = 'long' | 'short'. Returns order details."""

    @abstractmethod
    async def close_position(self, symbol: str) -> dict:
        """Full close of open position for symbol."""

    @abstractmethod
    async def set_sl(self, symbol: str, price: float) -> dict:
        """Place or update stop loss order at price."""

    @abstractmethod
    async def set_tp(self, symbol: str, price: float, qty: float) -> dict:
        """Place take profit order at price for qty."""

    @abstractmethod
    async def get_position(self, symbol: str) -> dict | None:
        """Return current position or None. Keys: size, side, entry_price."""
