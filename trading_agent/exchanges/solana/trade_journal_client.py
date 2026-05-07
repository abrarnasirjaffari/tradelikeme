"""
TradeJournalClient — anchorpy client for the TradeLikeMe vault trade journal instructions.

Wraps three on-chain instructions added in P3:
  - record_trade   : write a new trade entry to the chain when the agent opens a position
  - close_trade    : update the trade record with exit price / PnL / outcome when closed
  - register_strategy : publish strategy metadata (name, fee tier, rules hash) on-chain

The agent keypair is held server-side — this client is called from within the trading agent
process (loop.py / trade_agent.py), NOT from the frontend.

After `anchor build` on EC2 the IDL lives at:
  trading_agent/exchanges/solana/anchor_vault/target/idl/vault.json

Program ID: rGMTq8sS5GUJ7q1ei9x75dnZ3kM2QCn5YRKYGHbwdSd
Price precision: all prices / quantities stored as u64 with 6 decimal places
                 (e.g. $1.50 → 1_500_000)

PnL note: realized_pnl is stored as i64 on-chain (can be negative).
"""

import json
import logging
import struct
import time
from pathlib import Path
from typing import Optional

from anchorpy import Idl, Program, Provider, Wallet
from solana.rpc.async_api import AsyncClient
from solders.keypair import Keypair
from solders.pubkey import Pubkey
from solders.system_program import ID as SYSTEM_PROGRAM_ID

logger = logging.getLogger(__name__)

# ── Program constants ──────────────────────────────────────────────────────────

VAULT_PROGRAM_ID = Pubkey.from_string("rGMTq8sS5GUJ7q1ei9x75dnZ3kM2QCn5YRKYGHbwdSd")

# Outcome constants — must match the Rust `TradeOutcome` enum order
OUTCOME_NONE = 0
OUTCOME_TP1 = 1
OUTCOME_TP2 = 2
OUTCOME_SL = 3
OUTCOME_MANUAL = 4

# Direction constants — must match the Rust `TradeDirection` enum order
DIRECTION_LONG = 0
DIRECTION_SHORT = 1

# Price precision: 6 decimal places (same as USDC)
_PRICE_FACTOR = 1_000_000


# ── Client ────────────────────────────────────────────────────────────────────

class TradeJournalClient:
    """
    Agent-side anchorpy client for the TradeLikeMe vault trade journal.

    Usage:
        client = TradeJournalClient(keypair, rpc_url)
        await client.initialise()

        vault_pda = TradeJournalClient.derive_vault_pda(user_pubkey, strategy_id_bytes)
        tx_sig, trade_id = await client.record_trade(vault_pda, "SOL", DIRECTION_LONG, 150.0, 10.0,
                                                     145.0, 160.0, 175.0, strategy_id_bytes,
                                                     int(time.time()))
        tx_sig = await client.close_trade(vault_pda, trade_id=0, exit_price=160.0,
                                          realized_pnl=100.0, outcome=OUTCOME_TP1,
                                          closed_at=int(time.time()))
        await client.close()
    """

    def __init__(self, keypair: Keypair, rpc_url: str, network: str = "devnet") -> None:
        self._keypair = keypair
        self._rpc_url = rpc_url
        self._network = network
        self._program: Optional[Program] = None
        self._provider: Optional[Provider] = None

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    async def initialise(self) -> None:
        """Load the vault IDL and connect to the Anchor program via anchorpy."""
        idl_path = (
            Path(__file__).parent
            / "anchor_vault"
            / "target"
            / "idl"
            / "vault.json"
        )
        if not idl_path.exists():
            raise FileNotFoundError(
                f"Vault IDL not found at {idl_path}. "
                "Run 'anchor build' inside trading_agent/exchanges/solana/anchor_vault/ first."
            )

        with open(idl_path) as f:
            raw_idl = json.load(f)

        idl = Idl.from_json(json.dumps(raw_idl))
        connection = AsyncClient(self._rpc_url)
        wallet = Wallet(self._keypair)
        self._provider = Provider(connection, wallet)
        self._program = Program(idl, VAULT_PROGRAM_ID, self._provider)

        logger.info(
            "TradeJournalClient initialised — program=%s network=%s pubkey=%s",
            VAULT_PROGRAM_ID,
            self._network,
            self._keypair.pubkey(),
        )

    async def close(self) -> None:
        """Close the underlying RPC connection."""
        if self._provider is not None:
            await self._provider.connection.close()
            self._provider = None
            self._program = None

    def _require_init(self) -> Program:
        """Return the Program instance, raising if initialise() was not called."""
        if self._program is None:
            raise RuntimeError(
                "TradeJournalClient not initialised — call await initialise() first."
            )
        return self._program

    # ------------------------------------------------------------------
    # PDA derivation (static — usable before initialise())
    # ------------------------------------------------------------------

    @staticmethod
    def derive_vault_pda(user_pubkey: Pubkey, strategy_id: bytes) -> Pubkey:
        """Derive vault PDA.  Seeds: [b"vault", user_pubkey_bytes, strategy_id]."""
        pda, _ = Pubkey.find_program_address(
            [b"vault", bytes(user_pubkey), strategy_id],
            VAULT_PROGRAM_ID,
        )
        return pda

    @staticmethod
    def derive_trade_pda(vault_pubkey: Pubkey, trade_id: int) -> Pubkey:
        """Derive trade record PDA.  Seeds: [b"trade", vault_pubkey_bytes, trade_id_le_u64]."""
        trade_id_bytes = struct.pack("<Q", trade_id)  # little-endian u64 — matches Rust to_le_bytes
        pda, _ = Pubkey.find_program_address(
            [b"trade", bytes(vault_pubkey), trade_id_bytes],
            VAULT_PROGRAM_ID,
        )
        return pda

    @staticmethod
    def derive_strategy_pda(trader_pubkey: Pubkey, strategy_id: bytes) -> Pubkey:
        """Derive strategy record PDA.  Seeds: [b"strategy", trader_pubkey_bytes, strategy_id]."""
        pda, _ = Pubkey.find_program_address(
            [b"strategy", bytes(trader_pubkey), strategy_id],
            VAULT_PROGRAM_ID,
        )
        return pda

    # ------------------------------------------------------------------
    # Encoding helpers
    # ------------------------------------------------------------------

    @staticmethod
    def encode_symbol(symbol: str) -> list[int]:
        """Encode a symbol string into a [u8; 16] as a Python list of ints.

        Truncates to 16 bytes if longer; zero-pads if shorter.
        """
        raw = symbol.encode("ascii")[:16].ljust(16, b"\x00")
        return list(raw)

    @staticmethod
    def pad_32(data: bytes) -> list[int]:
        """Zero-pad or truncate bytes to 32 bytes and return as list[int]."""
        return list(data[:32].ljust(32, b"\x00"))

    @staticmethod
    def pad_64(data: bytes) -> list[int]:
        """Zero-pad or truncate bytes to 64 bytes and return as list[int]."""
        return list(data[:64].ljust(64, b"\x00"))

    @staticmethod
    def _to_native(price: float) -> int:
        """Convert a float USD price to u64 with 6 decimal places."""
        return int(price * _PRICE_FACTOR)

    # ------------------------------------------------------------------
    # On-chain reads
    # ------------------------------------------------------------------

    async def get_trade_count(self, vault_pda: Pubkey) -> int:
        """Fetch the current trade_count from the vault account.

        trade_count is the next trade_id to use — it increments after each record_trade.
        """
        program = self._require_init()
        vault = await program.account["Vault"].fetch(vault_pda)
        return int(vault.trade_count)

    async def get_trade_record(self, vault_pda: Pubkey, trade_id: int) -> dict:
        """Fetch a TradeRecord account from chain and return a human-readable dict.

        Prices are converted back to float USD.  Enums are decoded to strings.
        """
        program = self._require_init()
        trade_pda = self.derive_trade_pda(vault_pda, trade_id)
        rec = await program.account["TradeRecord"].fetch(trade_pda)

        outcome_names = ["NONE", "TP1", "TP2", "SL", "MANUAL"]

        return {
            "trade_id": rec.trade_id,
            "symbol": bytes(rec.symbol).decode("ascii").rstrip("\x00"),
            "direction": "LONG" if rec.direction == DIRECTION_LONG else "SHORT",
            "entry_price": rec.entry_price / _PRICE_FACTOR,
            "qty": rec.qty / _PRICE_FACTOR,
            "sl_price": rec.sl_price / _PRICE_FACTOR,
            "tp1_price": rec.tp1_price / _PRICE_FACTOR,
            "tp2_price": rec.tp2_price / _PRICE_FACTOR,
            "status": "OPEN" if rec.status == 0 else "CLOSED",
            "exit_price": rec.exit_price / _PRICE_FACTOR,
            "realized_pnl": rec.realized_pnl / _PRICE_FACTOR,
            "outcome": outcome_names[rec.outcome] if 0 <= rec.outcome < len(outcome_names) else str(rec.outcome),
            "opened_at": rec.opened_at,
            "closed_at": rec.closed_at,
            "pda": str(trade_pda),
        }

    # ------------------------------------------------------------------
    # Instruction callers
    # ------------------------------------------------------------------

    async def record_trade(
        self,
        vault_pda: Pubkey,
        symbol: str,
        direction: int,
        entry_price: float,
        qty: float,
        sl_price: float,
        tp1_price: float,
        tp2_price: float,
        strategy_id: bytes,
        opened_at: int,
    ) -> tuple[str, int]:
        """Record a new trade entry on-chain when the agent opens a position.

        Reads the current trade_count from the vault to determine trade_id,
        derives the TradeRecord PDA, then calls the `record_trade` instruction.

        Args:
            vault_pda:    Vault PDA for this (user × strategy) pair.
            symbol:       Base asset symbol, e.g. "SOL".  Truncated to 16 chars.
            direction:    DIRECTION_LONG (0) or DIRECTION_SHORT (1).
            entry_price:  Fill price in USD (e.g. 150.25).
            qty:          Base asset quantity (e.g. 10.0 for 10 SOL).
            sl_price:     Stop-loss level in USD.  Pass 0.0 if not yet known.
            tp1_price:    Take-profit 1 level in USD.  Pass 0.0 if not yet known.
            tp2_price:    Take-profit 2 level in USD.  Pass 0.0 if not yet known.
            strategy_id:  32-byte strategy identifier.
            opened_at:    Unix timestamp (seconds) when the trade was opened.

        Returns:
            Tuple of (transaction_signature, trade_id).
            trade_id is the sequential ID written on-chain (vault.trade_count before increment).
            Callers should store trade_id to pass to close_trade() later.
        """
        program = self._require_init()

        # Read trade_count BEFORE submitting — this is the trade_id used on-chain.
        # Returning it avoids a second RPC round-trip in the caller.
        trade_id = await self.get_trade_count(vault_pda)
        trade_pda = self.derive_trade_pda(vault_pda, trade_id)

        symbol_bytes = self.encode_symbol(symbol)
        strategy_id_list = self.pad_32(strategy_id)

        tx_sig = await (
            program.methods
            .record_trade(
                trade_id,
                symbol_bytes,
                direction,
                self._to_native(entry_price),
                self._to_native(qty),
                self._to_native(sl_price),
                self._to_native(tp1_price),
                self._to_native(tp2_price),
                strategy_id_list,
                opened_at,
            )
            .accounts({
                "vault": vault_pda,
                "trade_record": trade_pda,
                "agent": self._keypair.pubkey(),
                "system_program": SYSTEM_PROGRAM_ID,
            })
            .rpc()
        )

        logger.info(
            "record_trade on-chain — trade_id=%d symbol=%s direction=%s "
            "entry=%.4f qty=%.4f tx=%s",
            trade_id,
            symbol,
            "LONG" if direction == DIRECTION_LONG else "SHORT",
            entry_price,
            qty,
            tx_sig,
        )
        return str(tx_sig), trade_id

    async def close_trade(
        self,
        vault_pda: Pubkey,
        trade_id: int,
        exit_price: float,
        realized_pnl: float,
        outcome: int,
        closed_at: int,
    ) -> str:
        """Update a trade record on-chain when the agent closes a position.

        Args:
            vault_pda:    Vault PDA for this (user × strategy) pair.
            trade_id:     The trade_id returned / used when record_trade was called.
            exit_price:   Fill price of the closing order in USD.
            realized_pnl: Profit or loss in USD.  Negative for a losing trade.
            outcome:      OUTCOME_TP1, OUTCOME_TP2, OUTCOME_SL, or OUTCOME_MANUAL.
            closed_at:    Unix timestamp (seconds) when the trade was closed.

        Returns:
            Transaction signature as a hex string.
        """
        program = self._require_init()
        trade_pda = self.derive_trade_pda(vault_pda, trade_id)

        # realized_pnl is i64 on-chain — Python int handles negatives naturally
        pnl_native = int(realized_pnl * _PRICE_FACTOR)

        tx_sig = await (
            program.methods
            .close_trade(
                self._to_native(exit_price),
                pnl_native,
                closed_at,
                outcome,
            )
            .accounts({
                "vault": vault_pda,
                "trade_record": trade_pda,
                "agent": self._keypair.pubkey(),
            })
            .rpc()
        )

        outcome_names = {
            OUTCOME_NONE: "NONE",
            OUTCOME_TP1: "TP1",
            OUTCOME_TP2: "TP2",
            OUTCOME_SL: "SL",
            OUTCOME_MANUAL: "MANUAL",
        }
        logger.info(
            "close_trade on-chain — trade_id=%d exit=%.4f pnl=%.4f outcome=%s tx=%s",
            trade_id,
            exit_price,
            realized_pnl,
            outcome_names.get(outcome, str(outcome)),
            tx_sig,
        )
        return str(tx_sig)

    async def register_strategy(
        self,
        strategy_id: bytes,
        strategy_name: str,
        fee_tier: int,
        rules_hash: bytes,
        min_win_rate: int,
    ) -> str:
        """Publish strategy metadata on-chain.

        The agent keypair acts as the trader/signer.  The StrategyRecord PDA is
        derived from (trader_pubkey, strategy_id).

        Args:
            strategy_id:   32-byte strategy identifier.
            strategy_name: Human-readable name.  Truncated to 64 ASCII chars.
            fee_tier:      Platform fee tier (0 = S, 1 = A, 2 = B, 3 = C).
            rules_hash:    SHA-256 hash of the strategy rules document (32 bytes).
            min_win_rate:  Minimum declared win rate as integer 0–100.

        Returns:
            Transaction signature as a hex string.
        """
        program = self._require_init()
        trader_pubkey = self._keypair.pubkey()

        strategy_id_list = self.pad_32(strategy_id)
        strategy_pda = self.derive_strategy_pda(trader_pubkey, bytes(strategy_id_list))
        name_list = self.pad_64(strategy_name.encode("ascii"))
        rules_hash_list = self.pad_32(rules_hash)

        tx_sig = await (
            program.methods
            .register_strategy(
                strategy_id_list,
                name_list,
                fee_tier,
                rules_hash_list,
                min_win_rate,
            )
            .accounts({
                "strategy_record": strategy_pda,
                "trader": trader_pubkey,
                "system_program": SYSTEM_PROGRAM_ID,
            })
            .rpc()
        )

        logger.info(
            "register_strategy on-chain — name=%r fee_tier=%d win_rate=%d tx=%s",
            strategy_name,
            fee_tier,
            min_win_rate,
            tx_sig,
        )
        return str(tx_sig)
