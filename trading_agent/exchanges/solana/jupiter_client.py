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

# Doves oracle accounts (price feed source used by Jupiter Perps on-chain)
_DOVES_ORACLE_PUBKEYS = {
    "SOL": "Gnt27xtC473ZT2Mw5u8wZ68Z3gULkSTb5DuxJy7eJotD",
    "BTC": "8SXvChNYFhRq4EZuZvnhjrB3jJRQCv4k3P4W6hesH3Ew",
    "ETH": "2Cjg6kZDQJkSqjkrYXQhJJxTEGKr4k4F7EkLJ9Z6Z7Yd",
}

# Pythnet price accounts (secondary oracle used by createDecreasePositionRequest2)
_PYTHNET_ORACLE_PUBKEYS = {
    "SOL": "H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG",
    "BTC": "GVXRSBjFk6e6J3NbVPXohDJetcTjaeeuykUpbQF8UoMU",
    "ETH": "JBu1AL4obBcCMqKBBxhpWCNUt136ijcuMZLFvTP7iWdB",
}

# USDC collateral custody (same for all perp positions — collateral is always USDC)
_USDC_CUSTODY_PUBKEY = "G18jKKXQwBbrHeiK3C9MRXhkHsLHf7XgCSisykV46EZa"
_USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"

# Perpetuals state PDA — seeds: [b"perpetuals"]
_PERPETUALS_PUBKEY = "H4ND9aYttUVLFmNypZqLjZ52FYiGvdEB45GmwNoKEjTj"

# Event authority PDA — seeds: [b"__event_authority"] under the program
_EVENT_AUTHORITY_PUBKEY = "37cnMPXZ1S7rH7dBhQpjYoEZ2JVr5iuUeFsXcX3G2N7k"

# Associated token program
_ASSOCIATED_TOKEN_PROGRAM = "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe1bai"


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

    async def close_position(self, symbol: str) -> str:
        """Full close of open position for symbol via instantDecreasePosition. Returns tx signature. (JC6)

        Tries long PDA first, then short PDA. Reads sizeUsd + collateralUsd from
        on-chain position account so the decrease instruction gets exact amounts.
        Raises RuntimeError if no open position exists.
        """
        program = self._require_init()
        self._assert_supported(symbol)

        from solana.transaction import Transaction
        from solders.compute_budget import set_compute_unit_limit, set_compute_unit_price

        pool = _get_pool_pubkey()
        custody = _get_custody_pubkey(symbol)
        owner = program.provider.wallet.public_key

        # Find which side has an open position
        position_pda = None
        side_byte = None
        position_account = None
        for _side_byte, _side_label in [(b"\x00", "long"), (b"\x01", "short")]:
            pda, _ = Pubkey.find_program_address(
                [b"position", bytes(owner), bytes(pool), bytes(custody), _side_byte],
                JUPITER_PERPS_PROGRAM_ID,
            )
            try:
                acct = await program.account["Position"].fetch(pda)
                if acct.size_usd > 0:
                    position_pda = pda
                    side_byte = _side_byte
                    position_account = acct
                    break
            except Exception:
                continue

        if position_pda is None:
            raise RuntimeError(f"No open position for {symbol} — nothing to close.")

        size_usd = position_account.size_usd           # already in native u64 (6 dp)
        collateral_usd = position_account.collateral_usd

        ix = program.instruction["instantDecreasePosition"](
            {"sizeUsd": size_usd, "collateralUsd": collateral_usd},
            ctx=program.context(accounts={
                "owner": owner,
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

        logger.info(
            "close_position %s sizeUsd=%d collateralUsd=%d tx=%s",
            symbol, size_usd, collateral_usd, tx_sig,
        )
        return tx_sig

    async def get_position(self, symbol: str) -> Optional[dict]:
        """Return current position for symbol, or None if no open position. (JC9)

        Returns:
            {
                "symbol": str,
                "side": "long" | "short",
                "size_usd": float,       # USD notional
                "collateral_usd": float, # margin in USD
                "entry_price": float,    # average entry price
            }
            or None if no position.
        """
        program = self._require_init()
        self._assert_supported(symbol)

        pool = _get_pool_pubkey()
        custody = _get_custody_pubkey(symbol)
        owner = program.provider.wallet.public_key

        for side_byte, side_label in [(b"\x00", "long"), (b"\x01", "short")]:
            pda, _ = Pubkey.find_program_address(
                [b"position", bytes(owner), bytes(pool), bytes(custody), side_byte],
                JUPITER_PERPS_PROGRAM_ID,
            )
            try:
                acct = await program.account["Position"].fetch(pda)
                if acct.size_usd > 0:
                    return {
                        "symbol": symbol,
                        "side": side_label,
                        "size_usd": acct.size_usd / 1_000_000,
                        "collateral_usd": acct.collateral_usd / 1_000_000,
                        "entry_price": acct.price / 1_000_000,
                    }
            except Exception:
                continue

        return None

    async def set_sl(self, symbol: str, price: float) -> str:
        """Place a stop-loss trigger request for the full open position. Returns tx signature. (JC7)

        Uses createDecreasePositionRequest2 with requestType=Trigger.
        Jupiter's on-chain keeper fires the decrease when mark price crosses the trigger.

        - Long SL: triggerAboveThreshold=False (fires when price drops to or below sl_price)
        - Short SL: triggerAboveThreshold=True  (fires when price rises to or above sl_price)

        The positionRequest PDA is derived from seeds [b"position_request", owner, counter]
        where counter is read from the on-chain Position account (bump field used as counter
        seed in Jupiter's implementation — counter increments per request).
        """
        program = self._require_init()
        self._assert_supported(symbol)

        from solana.transaction import Transaction
        from solders.compute_budget import set_compute_unit_limit, set_compute_unit_price

        pool = _get_pool_pubkey()
        custody = _get_custody_pubkey(symbol)
        owner = program.provider.wallet.public_key

        # Locate the open position PDA
        position_pda = None
        position_account = None
        position_side = None
        for side_byte, side_label in [(b"\x00", "long"), (b"\x01", "short")]:
            pda, _ = Pubkey.find_program_address(
                [b"position", bytes(owner), bytes(pool), bytes(custody), side_byte],
                JUPITER_PERPS_PROGRAM_ID,
            )
            try:
                acct = await program.account["Position"].fetch(pda)
                if acct.size_usd > 0:
                    position_pda = pda
                    position_account = acct
                    position_side = side_label
                    break
            except Exception:
                continue

        if position_pda is None:
            raise RuntimeError(f"No open position for {symbol} — cannot set SL.")

        size_usd = position_account.size_usd
        collateral_usd = position_account.collateral_usd

        # counter is used as a nonce for the positionRequest PDA seed
        # Jupiter uses the position's bump field as the counter seed for trigger requests
        counter = int(position_account.bump)

        # SL fires when price moves against position
        trigger_above = position_side == "short"  # short: SL above current price

        # Prices stored as u64 with 6 decimal places
        trigger_price_native = int(price * 1_000_000)

        position_request_pda, _ = Pubkey.find_program_address(
            [b"position_request", bytes(owner), counter.to_bytes(8, "little")],
            JUPITER_PERPS_PROGRAM_ID,
        )

        usdc_custody = Pubkey.from_string(_USDC_CUSTODY_PUBKEY)
        usdc_mint = Pubkey.from_string(_USDC_MINT)
        perpetuals = Pubkey.from_string(_PERPETUALS_PUBKEY)
        event_authority = Pubkey.from_string(_EVENT_AUTHORITY_PUBKEY)
        assoc_token_program = Pubkey.from_string(_ASSOCIATED_TOKEN_PROGRAM)
        token_program = Pubkey.from_string("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
        system_program = Pubkey.from_string("11111111111111111111111111111111")

        # Derive receiving ATA for USDC (where collateral is returned on close)
        from spl.token.instructions import get_associated_token_address
        receiving_account = get_associated_token_address(owner, usdc_mint)

        # Derive positionRequestAta — ATA of the positionRequest PDA for USDC
        position_request_ata = get_associated_token_address(position_request_pda, usdc_mint)

        doves_oracle = Pubkey.from_string(_DOVES_ORACLE_PUBKEYS[symbol])
        pythnet_oracle = Pubkey.from_string(_PYTHNET_ORACLE_PUBKEYS[symbol])

        ix = program.instruction["createDecreasePositionRequest2"](
            {
                "params": {
                    "collateralUsdDelta": collateral_usd,
                    "sizeUsdDelta": size_usd,
                    "requestType": {"trigger": {}},
                    "priceSlippage": None,
                    "jupiterMinimumOut": None,
                    "triggerPrice": trigger_price_native,
                    "triggerAboveThreshold": trigger_above,
                    "entirePosition": True,
                    "counter": counter,
                }
            },
            ctx=program.context(accounts={
                "owner": owner,
                "receivingAccount": receiving_account,
                "perpetuals": perpetuals,
                "pool": pool,
                "position": position_pda,
                "positionRequest": position_request_pda,
                "positionRequestAta": position_request_ata,
                "custody": custody,
                "custodyDovesPriceAccount": doves_oracle,
                "custodyPythnetPriceAccount": pythnet_oracle,
                "collateralCustody": usdc_custody,
                "desiredMint": usdc_mint,
                "referral": None,
                "tokenProgram": token_program,
                "associatedTokenProgram": assoc_token_program,
                "systemProgram": system_program,
                "eventAuthority": event_authority,
                "program": JUPITER_PERPS_PROGRAM_ID,
            }),
        )

        tx = Transaction()
        tx.add(set_compute_unit_limit(_COMPUTE_UNIT_LIMIT))
        tx.add(set_compute_unit_price(_PRIORITY_FEE_MICROLAMPORTS))
        tx.add(ix)

        resp = await program.provider.send(tx)
        tx_sig = str(resp)

        logger.info(
            "set_sl %s side=%s price=%.4f tx=%s",
            symbol, position_side, price, tx_sig,
        )
        return tx_sig

    async def set_tp(self, symbol: str, price: float, qty: float) -> str:
        """Place a take-profit trigger request for qty (USD notional) at price. Returns tx signature. (JC8)

        Uses createDecreasePositionRequest2 with requestType=Trigger.
        Jupiter's on-chain keeper fires the decrease when mark price crosses the trigger.

        - Long TP: triggerAboveThreshold=True  (fires when price rises to or above tp_price)
        - Short TP: triggerAboveThreshold=False (fires when price drops to or below tp_price)

        qty is USD notional (same unit Jupiter uses for sizeUsd). collateralUsdDelta
        is proportional to the fraction of the position being closed.
        Counter is bumped by 1 vs set_sl so the positionRequest PDA doesn't collide.
        """
        program = self._require_init()
        self._assert_supported(symbol)

        from solana.transaction import Transaction
        from solders.compute_budget import set_compute_unit_limit, set_compute_unit_price

        pool = _get_pool_pubkey()
        custody = _get_custody_pubkey(symbol)
        owner = program.provider.wallet.public_key

        # Locate the open position PDA
        position_pda = None
        position_account = None
        position_side = None
        for side_byte, side_label in [(b"\x00", "long"), (b"\x01", "short")]:
            pda, _ = Pubkey.find_program_address(
                [b"position", bytes(owner), bytes(pool), bytes(custody), side_byte],
                JUPITER_PERPS_PROGRAM_ID,
            )
            try:
                acct = await program.account["Position"].fetch(pda)
                if acct.size_usd > 0:
                    position_pda = pda
                    position_account = acct
                    position_side = side_label
                    break
            except Exception:
                continue

        if position_pda is None:
            raise RuntimeError(f"No open position for {symbol} — cannot set TP.")

        total_size_usd = position_account.size_usd        # native u64, 6 dp
        total_collateral_usd = position_account.collateral_usd

        # qty is in USD notional (6 dp native)
        size_usd_delta = int(qty * 1_000_000)
        if size_usd_delta > total_size_usd:
            size_usd_delta = total_size_usd

        # Release collateral proportional to the fraction of position being closed
        fraction = size_usd_delta / total_size_usd if total_size_usd > 0 else 1.0
        collateral_usd_delta = int(total_collateral_usd * fraction)

        entire = size_usd_delta >= total_size_usd

        # TP fires when price moves in the profit direction
        trigger_above = position_side == "long"  # long: TP above current price

        trigger_price_native = int(price * 1_000_000)

        # counter + 1 so this PDA is distinct from the SL positionRequest PDA
        counter = int(position_account.bump) + 1

        position_request_pda, _ = Pubkey.find_program_address(
            [b"position_request", bytes(owner), counter.to_bytes(8, "little")],
            JUPITER_PERPS_PROGRAM_ID,
        )

        usdc_custody = Pubkey.from_string(_USDC_CUSTODY_PUBKEY)
        usdc_mint = Pubkey.from_string(_USDC_MINT)
        perpetuals = Pubkey.from_string(_PERPETUALS_PUBKEY)
        event_authority = Pubkey.from_string(_EVENT_AUTHORITY_PUBKEY)
        assoc_token_program = Pubkey.from_string(_ASSOCIATED_TOKEN_PROGRAM)
        token_program = Pubkey.from_string("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
        system_program = Pubkey.from_string("11111111111111111111111111111111")

        from spl.token.instructions import get_associated_token_address
        receiving_account = get_associated_token_address(owner, usdc_mint)
        position_request_ata = get_associated_token_address(position_request_pda, usdc_mint)

        doves_oracle = Pubkey.from_string(_DOVES_ORACLE_PUBKEYS[symbol])
        pythnet_oracle = Pubkey.from_string(_PYTHNET_ORACLE_PUBKEYS[symbol])

        ix = program.instruction["createDecreasePositionRequest2"](
            {
                "params": {
                    "collateralUsdDelta": collateral_usd_delta,
                    "sizeUsdDelta": size_usd_delta,
                    "requestType": {"trigger": {}},
                    "priceSlippage": None,
                    "jupiterMinimumOut": None,
                    "triggerPrice": trigger_price_native,
                    "triggerAboveThreshold": trigger_above,
                    "entirePosition": entire,
                    "counter": counter,
                }
            },
            ctx=program.context(accounts={
                "owner": owner,
                "receivingAccount": receiving_account,
                "perpetuals": perpetuals,
                "pool": pool,
                "position": position_pda,
                "positionRequest": position_request_pda,
                "positionRequestAta": position_request_ata,
                "custody": custody,
                "custodyDovesPriceAccount": doves_oracle,
                "custodyPythnetPriceAccount": pythnet_oracle,
                "collateralCustody": usdc_custody,
                "desiredMint": usdc_mint,
                "referral": None,
                "tokenProgram": token_program,
                "associatedTokenProgram": assoc_token_program,
                "systemProgram": system_program,
                "eventAuthority": event_authority,
                "program": JUPITER_PERPS_PROGRAM_ID,
            }),
        )

        tx = Transaction()
        tx.add(set_compute_unit_limit(_COMPUTE_UNIT_LIMIT))
        tx.add(set_compute_unit_price(_PRIORITY_FEE_MICROLAMPORTS))
        tx.add(ix)

        resp = await program.provider.send(tx)
        tx_sig = str(resp)

        logger.info(
            "set_tp %s side=%s price=%.4f qty_usd=%.2f tx=%s",
            symbol, position_side, price, qty, tx_sig,
        )
        return tx_sig
