"""
AnchorVaultClient — builds unsigned Solana transactions for the TradeLikeMe vault program.

Design:
  Backend builds an unsigned tx → returns base64 → frontend (Phantom) signs → submits →
  sends tx signature back to backend for confirmation.

No user keypairs are ever held in the backend.

Program ID: rGMTq8sS5GUJ7q1ei9x75dnZ3kM2QCn5YRKYGHbwdSd
USDC decimals: 6  (1 USDC = 1_000_000 lamports)
"""

import base64
import hashlib
import logging
import os
import struct
from typing import Optional

from solana.rpc.async_api import AsyncClient
from solders.hash import Hash
from solders.instruction import AccountMeta, Instruction
from solders.message import Message
from solders.pubkey import Pubkey
from solders.system_program import ID as SYS_PROGRAM_ID
from solders.transaction import Transaction
from spl.token.constants import TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID
from spl.token.instructions import create_associated_token_account, get_associated_token_address

logger = logging.getLogger(__name__)

# ── Program constants ──────────────────────────────────────────────────────────

PROGRAM_ID = Pubkey.from_string(
    os.getenv("PROGRAM_ID", "rGMTq8sS5GUJ7q1ei9x75dnZ3kM2QCn5YRKYGHbwdSd")
)
USDC_MINT = Pubkey.from_string(
    os.getenv("USDC_MINT_DEVNET", "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU")
)
PLATFORM_WALLET = Pubkey.from_string(
    os.getenv("PLATFORM_WALLET_PUBKEY", "HgcX7tJLhHTBUXmWskaohFcr4J1NR66FMwR7iAPawP7F")
)

USDC_DECIMALS = 6  # 1 USDC = 1_000_000


# ── Discriminator helper ───────────────────────────────────────────────────────

def _discriminator(instruction_name: str) -> bytes:
    """Return the 8-byte Anchor instruction discriminator for a global instruction."""
    return hashlib.sha256(f"global:{instruction_name}".encode()).digest()[:8]


# Pre-computed discriminators (verified against deployed program)
DISC_CREATE_VAULT = _discriminator("create_vault")       # 1dedf7d0c1523687
DISC_DEPOSIT = _discriminator("deposit")                  # f223c68952e1f2b6
DISC_WITHDRAW = _discriminator("withdraw")                # b712469c946da122


# ── Main client class ──────────────────────────────────────────────────────────

class AnchorVaultClient:
    """
    Builds unsigned Solana transactions for the TradeLikeMe Anchor vault program.

    All build_* methods return a base64-encoded serialized Transaction.
    The transaction has a recent blockhash set and fee_payer = user, but no signatures.
    Phantom (or any Solana wallet) can sign and submit it directly.
    """

    def __init__(self, rpc_url: str):
        self.client = AsyncClient(rpc_url)

    # ── PDA + ATA helpers ──────────────────────────────────────────────────────

    def derive_vault_pda(self, user_pubkey: str, strategy_id_bytes: bytes) -> tuple[Pubkey, int]:
        """
        Derive the vault PDA from (user_pubkey, strategy_id_bytes).

        Seeds: [b"vault", user_pubkey_bytes, strategy_id_bytes]
        Returns (pda_pubkey, bump).
        """
        user = Pubkey.from_string(user_pubkey)
        pda, bump = Pubkey.find_program_address(
            [b"vault", bytes(user), strategy_id_bytes],
            PROGRAM_ID,
        )
        return pda, bump

    @staticmethod
    def strategy_id_to_bytes(strategy_id: str) -> bytes:
        """
        Convert a UUID string (with or without hyphens) to a 32-byte array.

        UUID hex is 16 bytes; zero-padded to 32 bytes to fill the [u8; 32] field.
        """
        clean = strategy_id.replace("-", "")
        b = bytes.fromhex(clean)          # 16 bytes
        return b.ljust(32, b"\x00")[:32]  # pad/truncate to 32 bytes

    def _vault_token_account(self, vault_pda: Pubkey) -> Pubkey:
        """ATA of the vault PDA for USDC — this is where deposited funds live."""
        return get_associated_token_address(vault_pda, USDC_MINT)

    def _user_token_account(self, user_pubkey: Pubkey) -> Pubkey:
        """ATA of the user for USDC — source on deposit, destination on withdraw."""
        return get_associated_token_address(user_pubkey, USDC_MINT)

    # ── On-chain existence checks ──────────────────────────────────────────────

    async def vault_exists(self, vault_pda: Pubkey) -> bool:
        """Return True if the vault PDA account exists on-chain."""
        resp = await self.client.get_account_info(vault_pda)
        return resp.value is not None

    async def token_account_exists(self, token_account: Pubkey) -> bool:
        """Return True if a token account exists on-chain."""
        resp = await self.client.get_account_info(token_account)
        return resp.value is not None

    async def _get_recent_blockhash(self) -> Hash:
        resp = await self.client.get_latest_blockhash()
        return resp.value.blockhash

    # ── Instruction builders ───────────────────────────────────────────────────

    def _ix_create_vault(
        self,
        user: Pubkey,
        vault_pda: Pubkey,
        strategy_id_bytes: bytes,
    ) -> Instruction:
        """
        Build the `create_vault` instruction.

        Anchor struct: InitializeVault { vault (mut, PDA init), user (signer, mut), system_program }
        Args: strategy_id: [u8; 32], platform_wallet: Pubkey
        """
        # Data: discriminator(8) + strategy_id(32) + platform_wallet(32)
        data = DISC_CREATE_VAULT + strategy_id_bytes + bytes(PLATFORM_WALLET)

        accounts = [
            AccountMeta(vault_pda, is_signer=False, is_writable=True),
            AccountMeta(user, is_signer=True, is_writable=True),
            AccountMeta(SYS_PROGRAM_ID, is_signer=False, is_writable=False),
        ]
        return Instruction(PROGRAM_ID, data, accounts)

    def _ix_deposit(
        self,
        user: Pubkey,
        vault_pda: Pubkey,
        vault_token_account: Pubkey,
        user_token_account: Pubkey,
        amount: int,
    ) -> Instruction:
        """
        Build the `deposit` instruction.

        Anchor struct: Deposit {
            vault (mut, PDA),
            vault_token_account (mut),
            user_token_account (mut),
            user (signer, mut),
            user_pubkey (read — must equal vault.user_pubkey),
            token_program,
        }
        Args: amount: u64
        """
        # Data: discriminator(8) + amount_u64_le(8)
        data = DISC_DEPOSIT + struct.pack("<Q", amount)

        accounts = [
            AccountMeta(vault_pda, is_signer=False, is_writable=True),
            AccountMeta(vault_token_account, is_signer=False, is_writable=True),
            AccountMeta(user_token_account, is_signer=False, is_writable=True),
            AccountMeta(user, is_signer=True, is_writable=True),
            # has_one = user_pubkey — Anchor resolves this via the user_pubkey AccountInfo
            AccountMeta(user, is_signer=False, is_writable=False),
            AccountMeta(TOKEN_PROGRAM_ID, is_signer=False, is_writable=False),
        ]
        return Instruction(PROGRAM_ID, data, accounts)

    def _ix_withdraw(
        self,
        user: Pubkey,
        vault_pda: Pubkey,
        vault_token_account: Pubkey,
        user_token_account: Pubkey,
        amount: int,
    ) -> Instruction:
        """
        Build the `withdraw` instruction.

        Anchor struct: Withdraw {
            vault (mut, PDA),
            vault_token_account (mut),
            user_token_account (mut),
            user (signer, mut),
            user_pubkey (read — must equal vault.user_pubkey),
            token_program,
        }
        Args: amount: u64
        """
        # Data: discriminator(8) + amount_u64_le(8)
        data = DISC_WITHDRAW + struct.pack("<Q", amount)

        accounts = [
            AccountMeta(vault_pda, is_signer=False, is_writable=True),
            AccountMeta(vault_token_account, is_signer=False, is_writable=True),
            AccountMeta(user_token_account, is_signer=False, is_writable=True),
            AccountMeta(user, is_signer=True, is_writable=True),
            # has_one = user_pubkey
            AccountMeta(user, is_signer=False, is_writable=False),
            AccountMeta(TOKEN_PROGRAM_ID, is_signer=False, is_writable=False),
        ]
        return Instruction(PROGRAM_ID, data, accounts)

    # ── Public transaction builders ────────────────────────────────────────────

    async def build_create_vault_tx(
        self,
        user_pubkey: str,
        strategy_id: str,
    ) -> str:
        """
        Build an unsigned `create_vault` transaction.

        Returns base64-encoded serialized Transaction ready for Phantom to sign.
        """
        user = Pubkey.from_string(user_pubkey)
        sid_bytes = self.strategy_id_to_bytes(strategy_id)
        vault_pda, _ = self.derive_vault_pda(user_pubkey, sid_bytes)

        ix = self._ix_create_vault(user, vault_pda, sid_bytes)
        blockhash = await self._get_recent_blockhash()

        msg = Message.new_with_blockhash([ix], user, blockhash)
        tx = Transaction.new_unsigned(msg)

        return base64.b64encode(bytes(tx)).decode()

    async def build_deposit_tx(
        self,
        user_pubkey: str,
        strategy_id: str,
        amount_lamports: int,
    ) -> dict:
        """
        Build an unsigned deposit transaction.

        Prepends `create_vault` if the vault PDA does not exist yet.
        Prepends `create_associated_token_account` for the vault's token account if it
        doesn't exist yet (first deposit).

        Returns:
            {
                "serialized_tx": str,       # base64 unsigned tx
                "vault_address": str,        # vault PDA as base58 string
                "requires_vault_init": bool, # True if create_vault was prepended
            }
        """
        user = Pubkey.from_string(user_pubkey)
        sid_bytes = self.strategy_id_to_bytes(strategy_id)
        vault_pda, _ = self.derive_vault_pda(user_pubkey, sid_bytes)
        vault_token_account = self._vault_token_account(vault_pda)
        user_token_account = self._user_token_account(user)

        instructions: list[Instruction] = []
        requires_vault_init = False

        # 1. Create vault PDA if it doesn't exist
        if not await self.vault_exists(vault_pda):
            requires_vault_init = True
            instructions.append(self._ix_create_vault(user, vault_pda, sid_bytes))
            logger.info("Vault PDA %s doesn't exist — prepending create_vault ix", vault_pda)

        # 2. Create vault token account (ATA) if it doesn't exist
        if not await self.token_account_exists(vault_token_account):
            instructions.append(
                create_associated_token_account(
                    payer=user,
                    owner=vault_pda,
                    mint=USDC_MINT,
                )
            )
            logger.info(
                "Vault token account %s doesn't exist — prepending create_ata ix",
                vault_token_account,
            )

        # 3. Deposit instruction
        instructions.append(
            self._ix_deposit(user, vault_pda, vault_token_account, user_token_account, amount_lamports)
        )

        blockhash = await self._get_recent_blockhash()
        msg = Message.new_with_blockhash(instructions, user, blockhash)
        tx = Transaction.new_unsigned(msg)

        return {
            "serialized_tx": base64.b64encode(bytes(tx)).decode(),
            "vault_address": str(vault_pda),
            "requires_vault_init": requires_vault_init,
        }

    async def build_withdraw_tx(
        self,
        user_pubkey: str,
        strategy_id: str,
        amount_lamports: int,
    ) -> dict:
        """
        Build an unsigned withdraw transaction.

        Vault must already exist (user can only withdraw from an existing vault).

        Returns:
            {
                "serialized_tx": str,  # base64 unsigned tx
                "vault_address": str,  # vault PDA as base58 string
            }
        """
        user = Pubkey.from_string(user_pubkey)
        sid_bytes = self.strategy_id_to_bytes(strategy_id)
        vault_pda, _ = self.derive_vault_pda(user_pubkey, sid_bytes)
        vault_token_account = self._vault_token_account(vault_pda)
        user_token_account = self._user_token_account(user)

        if not await self.vault_exists(vault_pda):
            raise ValueError(f"Vault PDA {vault_pda} does not exist — cannot withdraw")

        ix = self._ix_withdraw(
            user, vault_pda, vault_token_account, user_token_account, amount_lamports
        )
        blockhash = await self._get_recent_blockhash()
        msg = Message.new_with_blockhash([ix], user, blockhash)
        tx = Transaction.new_unsigned(msg)

        return {
            "serialized_tx": base64.b64encode(bytes(tx)).decode(),
            "vault_address": str(vault_pda),
        }

    async def close(self) -> None:
        """Close the underlying RPC connection."""
        await self.client.close()
