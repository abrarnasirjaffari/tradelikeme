import json
import logging
import os
from typing import Optional

from anchorpy import Idl, Program, Provider, Wallet
from solana.rpc.async_api import AsyncClient
from solders.keypair import Keypair
from solders.pubkey import Pubkey

from trading_agent.exchanges.solana.pyth_ws import PythPriceFeed

logger = logging.getLogger(__name__)

JUPITER_PERPS_PROGRAM_ID = Pubkey.from_string("PERPHjGBqRHArX4DySjwM6UJHiR3sWAatqfdBS2qQJu")

# Jupiter Perps is mainnet-only — no devnet deployment
SUPPORTED_SYMBOLS = {"SOL", "BTC", "ETH"}

_SYMBOL_TO_FEED = {
    "SOL": "SOL/USD",
    "BTC": "BTC/USD",
    "ETH": "ETH/USD",
}

# Priority fee + compute budget — mandatory for Jupiter Perps (compute-heavy instructions)
_COMPUTE_UNIT_LIMIT = 200_000
_PRIORITY_FEE_MICROLAMPORTS = 50_000

# Mainnet Jupiter Perps pool + custody addresses (from julianfssen IDL repo constants)
_POOL_PUBKEY = "5BUwFW4nRbftYTDMbgxykoFWqWHPzahFSNAaaaJtVKsq"
_CUSTODY_PUBKEYS = {
    "SOL": "7xS2gz2bTp3fwCC7knJvUWTEU9Tycczu6VhJYKgi1wdz",
    "BTC": "AQCgjsLR5Z779esGBwGfCfFJjhbEMU2E9G7pJCqKFCBT",
    "ETH": "AzaHF8BNvMCkFd8vbSd5Rpr8dPGfGPkKJYfkSJFByGFp",
}
_ORACLE_PUBKEYS = {
    "SOL": "H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG",
    "BTC": "GVXRSBjFk6e6J3NbVPXohDJetcTjaeeuykUpbQF8UoMU",
    "ETH": "JBu1AL4obBcCMqKBBxhpWCNUt136ijcuMZLFvTP7iWdB",
}


def _get_pool_pubkey() -> Pubkey:
    return Pubkey.from_string(_POOL_PUBKEY)


def _get_custody_pubkey(symbol: str) -> Pubkey:
    return Pubkey.from_string(_CUSTODY_PUBKEYS[symbol])


def _get_oracle_pubkey(symbol: str) -> Pubkey:
    return Pubkey.from_string(_ORACLE_PUBKEYS[symbol])


def _load_keypair() -> Keypair:
    keypair_path = os.getenv("DEVNET_AGENT_KEYPAIR_PATH", "")
    if keypair_path:
        expanded = os.path.expanduser(keypair_path)
        if os.path.exists(expanded):
            with open(expanded) as f:
                return Keypair.from_bytes(bytes(json.load(f)))

    b58_key = os.getenv("PHANTOM_PRIVATE_KEY", "")
    if b58_key:
        import based58
        return Keypair.from_bytes(based58.b58decode(b58_key.encode()))

    raise EnvironmentError(
        "No keypair found. Set DEVNET_AGENT_KEYPAIR_PATH or PHANTOM_PRIVATE_KEY in .env."
    )


class JupiterClient:
    """
    Async client for Jupiter Perpetuals (fallback Solana perps protocol).
    Program ID: PERPHjGBqRHArX4DySjwM6UJHiR3sWAatqfdBS2qQJu (mainnet only)
    Pairs: SOL, BTC, ETH  |  Max leverage: 100x

    Usage:
        client = JupiterClient()
        await client.initialise()
        await client.close()
    """

    def __init__(self) -> None:
        self._rpc_url: str = os.getenv("HELIUS_RPC_URL", "")
        self._client: Optional[AsyncClient] = None
        self._program: Optional[Program] = None
        self._wallet: Optional[Wallet] = None
        self._pyth = PythPriceFeed("mainnet")

    async def initialise(self) -> None:
        """Load keypair, connect to Helius RPC, load Jupiter Perps IDL."""
        if not self._rpc_url:
            raise EnvironmentError("HELIUS_RPC_URL not set in environment.")

        idl_path = os.getenv(
            "JUPITER_PERPS_IDL_PATH",
            os.path.join(os.path.dirname(__file__), "../../../infra/jupiter_perps_idl.json"),
        )
        idl_path = os.path.abspath(idl_path)
        if not os.path.exists(idl_path):
            raise FileNotFoundError(
                f"Jupiter Perps IDL not found at {idl_path}. "
                "Download it from github.com/julianfssen/jupiter-perps-anchor-idl-parsing "
                "and save to infra/jupiter_perps_idl.json."
            )

        with open(idl_path) as f:
            raw_idl = f.read()

        keypair = _load_keypair()
        self._wallet = Wallet(keypair)
        self._client = AsyncClient(self._rpc_url)
        provider = Provider(self._client, self._wallet)
        idl = Idl.from_json(raw_idl)
        self._program = Program(idl, JUPITER_PERPS_PROGRAM_ID, provider)

        await self._pyth.connect()
        for feed in _SYMBOL_TO_FEED.values():
            await self._pyth.subscribe(feed)

        logger.info(
            "JupiterClient initialised — pubkey=%s", keypair.pubkey()
        )

    async def close(self) -> None:
        """Close RPC connection and Pyth feed."""
        if self._client is not None:
            await self._client.close()
            self._client = None
        await self._pyth.disconnect()
        logger.info("JupiterClient closed")

    def _require_init(self) -> Program:
        if self._program is None:
            raise RuntimeError("JupiterClient not initialised — call await initialise() first.")
        return self._program

    def _assert_supported(self, symbol: str) -> None:
        if symbol not in SUPPORTED_SYMBOLS:
            raise ValueError(
                f"'{symbol}' not supported by Jupiter Perps. Supported: {SUPPORTED_SYMBOLS}"
            )

    async def get_balance(self) -> float:
        """Return USDC balance from the Jupiter custody pool. (JC4)

        Fetches the USDC token account balance for the agent wallet on mainnet.
        Jupiter Perps uses USDC as collateral — this is the margin available.
        """
        program = self._require_init()
        usdc_mint = Pubkey.from_string("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")
        wallet_pubkey = program.provider.wallet.public_key

        # Derive the associated token account for USDC
        from spl.token.constants import TOKEN_PROGRAM_ID
        from spl.token.instructions import get_associated_token_address
        ata = get_associated_token_address(wallet_pubkey, usdc_mint)

        try:
            resp = await self._client.get_token_account_balance(ata)
            if resp.value is None:
                return 0.0
            return float(resp.value.ui_amount or 0.0)
        except Exception:
            # Token account doesn't exist yet — wallet has no USDC
            return 0.0

    async def open_position(
        self,
        symbol: str,
        side: str,      # "long" | "short"
        size: float,    # USD notional value
        leverage: float,
    ) -> str:
        """Open a position via instantIncreasePosition. Returns tx signature. (JC5)

        Uses the instant path (no keeper wait). Size is USD notional.
        Collateral = size / leverage, denominated in USDC (6 decimals).
        """
        program = self._require_init()
        self._assert_supported(symbol)

        if side not in ("long", "short"):
            raise ValueError(f"side must be 'long' or 'short', got '{side}'")

        from solana.transaction import Transaction
        from solders.compute_budget import set_compute_unit_limit, set_compute_unit_price

        collateral_usd = size / leverage
        # Jupiter stores USD amounts as u64 with 6 decimal places
        size_native = int(size * 1_000_000)
        collateral_native = int(collateral_usd * 1_000_000)

        side_arg = {"long": {}} if side == "long" else {"short": {}}

        # Derive position PDA: seeds = [b"position", owner, pool, custody, side_byte]
        pool = _get_pool_pubkey()
        custody = _get_custody_pubkey(symbol)
        side_byte = b"\x00" if side == "long" else b"\x01"
        position_pda, _ = Pubkey.find_program_address(
            [b"position", bytes(program.provider.wallet.public_key), bytes(pool), bytes(custody), side_byte],
            JUPITER_PERPS_PROGRAM_ID,
        )

        ix = program.instruction["instantIncreasePosition"](
            {"sizeUsd": size_native, "collateralUsd": collateral_native, "side": side_arg},
            ctx=program.context(accounts={
                "owner": program.provider.wallet.public_key,
                "position": position_pda,
                "pool": pool,
                "custody": custody,
                "custodyOracleAccount": _get_oracle_pubkey(symbol),
                "systemProgram": Pubkey.from_string("11111111111111111111111111111111"),
                "tokenProgram": Pubkey.from_string("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
            }),
        )

        tx = Transaction()
        tx.add(set_compute_unit_limit(_COMPUTE_UNIT_LIMIT))
        tx.add(set_compute_unit_price(_PRIORITY_FEE_MICROLAMPORTS))
        tx.add(ix)

        resp = await program.provider.send(tx)
        tx_sig = str(resp)

        logger.info("open_position %s %s size=$%.2f leverage=%.0fx tx=%s", side, symbol, size, leverage, tx_sig)
        return tx_sig
