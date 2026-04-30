import json
import logging
import os
from typing import Optional

import based58
from anchorpy import Wallet
from solders.keypair import Keypair
from zetamarkets_py.client import Client
from zetamarkets_py.types import Asset, Network, OrderArgs, OrderOptions, OrderType, Side

from trading_agent.exchanges.solana.pyth_ws import PythPriceFeed

logger = logging.getLogger(__name__)

# Symbols supported by Zeta Markets and their Asset enum mapping
SUPPORTED_SYMBOLS = {"SOL", "BTC", "ETH", "APT", "ARB"}
_SYMBOL_TO_ASSET: dict[str, Asset] = {
    "SOL": Asset.SOL,
    "BTC": Asset.BTC,
    "ETH": Asset.ETH,
    "APT": Asset.APT,
    "ARB": Asset.ARB,
}

# Map base symbol → Pyth feed key
_SYMBOL_TO_FEED: dict[str, str] = {
    "SOL": "SOL/USD",
    "BTC": "BTC/USD",
    "ETH": "ETH/USD",
    "APT": "APT/USD",
    "ARB": "ARB/USD",
}

# Maximum leverage offered by Zeta Markets
MAX_LEVERAGE = 50

# IOC slippage: price we send to guarantee a fill.
# Buy: ask × (1 + SLIPPAGE). Sell: bid × (1 - SLIPPAGE).
# Zeta has no native MARKET order type — IOC + aggressive price = market fill.
_MARKET_SLIPPAGE = 0.02  # 2% — covers wide spreads on thin devnet books


def _load_keypair() -> Keypair:
    """
    Load trading keypair from environment.
    Tries DEVNET_AGENT_KEYPAIR_PATH (JSON file) first,
    then PHANTOM_PRIVATE_KEY (base58 string).
    """
    keypair_path = os.getenv("DEVNET_AGENT_KEYPAIR_PATH", "")
    if keypair_path:
        expanded = os.path.expanduser(keypair_path)
        if os.path.exists(expanded):
            with open(expanded) as f:
                secret = bytes(json.load(f))
            return Keypair.from_bytes(secret)

    b58_key = os.getenv("PHANTOM_PRIVATE_KEY", "")
    if b58_key:
        secret = based58.b58decode(b58_key.encode())
        return Keypair.from_bytes(secret)

    raise EnvironmentError(
        "No keypair found. Set DEVNET_AGENT_KEYPAIR_PATH (path to JSON) "
        "or PHANTOM_PRIVATE_KEY (base58) in .env."
    )


def _network_enum(network: str) -> Network:
    mapping = {"devnet": Network.DEVNET, "mainnet": Network.MAINNET}
    n = mapping.get(network.lower())
    if n is None:
        raise ValueError(f"Unknown network '{network}'. Use 'devnet' or 'mainnet'.")
    return n


class ZetaClient:
    """
    Async client for Zeta Markets perpetuals (primary Solana perps protocol).
    Program ID: ZETAxsqBRek56DhiGXrn75yj2NHU3aYUnxvHXpkf3aD (mainnet)
                BG3oRikW8d16YjUEmX3ZxHm9SiJzrGtMhsSR8aCw1Cd7 (devnet)
    Pairs: SOL, BTC, ETH, APT, ARB  |  Max leverage: 50x

    Usage:
        client = ZetaClient("devnet")
        await client.initialise()
        balance = await client.get_balance()
        await client.close()
    """

    def __init__(self, network: str = "devnet"):
        self._network_str = network
        self._network: Network = _network_enum(network)
        self._rpc_url: str = os.getenv("HELIUS_RPC_URL", "")
        self._zeta: Optional[Client] = None  # zetamarkets_py.Client
        self._pyth = PythPriceFeed(network)

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    async def initialise(self) -> None:
        """Load keypair from env, connect to Helius RPC, init Zeta client."""
        if not self._rpc_url:
            raise EnvironmentError("HELIUS_RPC_URL not set in environment.")

        keypair = _load_keypair()
        wallet = Wallet(keypair)

        # Only load the assets we actually trade to reduce startup time
        assets = [_SYMBOL_TO_ASSET[s] for s in SUPPORTED_SYMBOLS]

        self._zeta = await Client.load(
            endpoint=self._rpc_url,
            wallet=wallet,
            network=self._network,
            assets=assets,
        )
        logger.info(
            "ZetaClient initialised — network=%s pubkey=%s",
            self._network_str,
            keypair.pubkey(),
        )

        # Connect Pyth and subscribe to all supported symbols
        await self._pyth.connect()
        for feed_key in _SYMBOL_TO_FEED.values():
            await self._pyth.subscribe(feed_key)
        logger.info("Pyth price feed connected — subscribed to %d symbols", len(_SYMBOL_TO_FEED))

    async def close(self) -> None:
        """Close the underlying RPC connection gracefully."""
        if self._zeta is not None:
            await self._zeta.connection.close()
            self._zeta = None
        await self._pyth.disconnect()
        logger.info("ZetaClient closed")

    def _require_init(self) -> Client:
        """Return the inner Client, raising if initialise() was not called."""
        if self._zeta is None:
            raise RuntimeError("ZetaClient not initialised — call await initialise() first.")
        return self._zeta

    # ------------------------------------------------------------------
    # Account
    # ------------------------------------------------------------------

    async def get_balance(self) -> float:
        """Return USDC margin balance from the cross-margin account."""
        zeta = self._require_init()
        balance, _ = await zeta.fetch_margin_state()
        return float(balance)

    # ------------------------------------------------------------------
    # Price
    # ------------------------------------------------------------------

    async def get_price(self, symbol: str) -> float:
        """Return latest mid price for symbol via Pyth oracle. (ZC6)

        Uses cached WebSocket price if available; falls back to Pyth REST if not.
        """
        self._assert_supported(symbol)
        feed_key = _SYMBOL_TO_FEED[symbol]

        price = self._pyth.get_price(feed_key)
        if price is not None:
            return price

        # WS price not yet received — hit REST fallback
        price = await self._pyth.get_price_rest(feed_key)
        if price is not None:
            return price

        raise RuntimeError(f"Could not fetch price for {symbol} — Pyth WS and REST both unavailable.")

    # ------------------------------------------------------------------
    # Positions
    # ------------------------------------------------------------------

    async def open_position(
        self,
        symbol: str,
        side: str,          # "long" | "short"
        size: float,        # base asset quantity (e.g. 1.5 for 1.5 SOL)
        leverage: float,    # informational only — Zeta uses cross-margin (implicit leverage)
    ) -> str:
        """Place a market order. Returns tx signature. (ZC7)

        Zeta Markets has no native MARKET order type. We use an
        IMMEDIATE_OR_CANCEL order with an aggressive price (±2% slippage)
        to guarantee a fill at the best available price.
        """
        zeta = self._require_init()
        self._assert_supported(symbol)

        if side not in ("long", "short"):
            raise ValueError(f"side must be 'long' or 'short', got '{side}'")

        asset = _SYMBOL_TO_ASSET[symbol]
        zeta_side = Side.Bid if side == "long" else Side.Ask

        # Fetch current price to compute aggressive IOC limit.
        # Zeta has no native MARKET order — IOC + aggressive price = guaranteed fill.
        current_price = await self.get_price(symbol)
        if side == "long":
            limit_price = current_price * (1 + _MARKET_SLIPPAGE)
        else:
            limit_price = current_price * (1 - _MARKET_SLIPPAGE)

        order = OrderArgs(
            price=limit_price,
            size=size,
            side=zeta_side,
            order_opts=OrderOptions(order_type=OrderType.ImmediateOrCancel),
        )

        tx_sig = await zeta.place_orders_for_market(asset=asset, orders=[order])

        logger.info(
            "open_position %s %s size=%.4f price=%.4f tx=%s",
            side, symbol, size, limit_price, tx_sig,
        )
        return tx_sig

    async def close_position(self, symbol: str) -> str:
        """Full close of open position for symbol. Returns tx signature. (ZC8)

        Fetches current position size and side, then places a reverse IOC order
        at an aggressive price to guarantee a fill (same pattern as open_position).
        Raises RuntimeError if no open position exists.
        """
        zeta = self._require_init()
        self._assert_supported(symbol)

        position = await self.get_position(symbol)
        if position is None:
            raise RuntimeError(f"No open position for {symbol} — nothing to close.")

        asset = _SYMBOL_TO_ASSET[symbol]
        size = abs(position["size"])
        # Reverse the side to close
        close_side = Side.Ask if position["side"] == "long" else Side.Bid

        current_price = await self.get_price(symbol)
        if close_side == Side.Bid:  # closing a short → buying back
            limit_price = current_price * (1 + _MARKET_SLIPPAGE)
        else:                        # closing a long → selling
            limit_price = current_price * (1 - _MARKET_SLIPPAGE)

        order = OrderArgs(
            price=limit_price,
            size=size,
            side=close_side,
            order_opts=OrderOptions(order_type=OrderType.ImmediateOrCancel),
        )

        tx_sig = await zeta.place_orders_for_market(asset=asset, orders=[order])

        logger.info(
            "close_position %s size=%.4f price=%.4f tx=%s",
            symbol, size, limit_price, tx_sig,
        )
        return tx_sig

    async def set_sl(self, symbol: str, price: float) -> str:
        """Place stop-loss trigger order. Returns order ID. (ZC9)"""
        raise NotImplementedError

    async def set_tp(self, symbol: str, price: float, qty: float) -> str:
        """Place take-profit trigger order for qty. Returns order ID. (ZC10)"""
        raise NotImplementedError

    async def get_position(self, symbol: str) -> Optional[dict]:
        """Return current position or None if flat. (ZC11)

        Returns dict with keys: symbol, side, size, entry_price, unrealised_pnl
        size is always positive; side is 'long' or 'short'.
        """
        zeta = self._require_init()
        self._assert_supported(symbol)

        _, positions = await zeta.fetch_margin_state()
        asset = _SYMBOL_TO_ASSET[symbol]
        pos = positions.get(asset)

        if pos is None or pos.size == 0:
            return None

        side = "long" if pos.size > 0 else "short"
        size = abs(pos.size)
        entry_price = pos.average_price

        mark_price = await self.get_price(symbol)
        if side == "long":
            unrealised_pnl = (mark_price - entry_price) * size
        else:
            unrealised_pnl = (entry_price - mark_price) * size

        return {
            "symbol": symbol,
            "side": side,
            "size": size,
            "entry_price": entry_price,
            "unrealised_pnl": unrealised_pnl,
        }

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _assert_supported(self, symbol: str) -> None:
        if symbol not in SUPPORTED_SYMBOLS:
            raise ValueError(
                f"Symbol '{symbol}' not supported by Zeta Markets. "
                f"Supported: {SUPPORTED_SYMBOLS}"
            )

    def _to_asset(self, symbol: str) -> Asset:
        self._assert_supported(symbol)
        return _SYMBOL_TO_ASSET[symbol]
