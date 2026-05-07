"""Solana exchange clients for TradeLikeMe."""

from trading_agent.exchanges.solana.anchor_vault_client import AnchorVaultClient
from trading_agent.exchanges.solana.trade_journal_client import (
    TradeJournalClient,
    DIRECTION_LONG,
    DIRECTION_SHORT,
    OUTCOME_NONE,
    OUTCOME_TP1,
    OUTCOME_TP2,
    OUTCOME_SL,
    OUTCOME_MANUAL,
)
from trading_agent.exchanges.solana.zeta_client import ZetaClient
from trading_agent.exchanges.solana.jupiter_client import JupiterClient
from trading_agent.exchanges.solana.solana_router import SolanaRouter
from trading_agent.exchanges.solana.pyth_ws import PythPriceFeed

__all__ = [
    # Deposit/withdraw tx builder (P2 — unsigned txs for frontend)
    "AnchorVaultClient",
    # On-chain trade journal (P3 — signed by agent keypair)
    "TradeJournalClient",
    "DIRECTION_LONG",
    "DIRECTION_SHORT",
    "OUTCOME_NONE",
    "OUTCOME_TP1",
    "OUTCOME_TP2",
    "OUTCOME_SL",
    "OUTCOME_MANUAL",
    # Exchange clients
    "ZetaClient",
    "JupiterClient",
    "SolanaRouter",
    "PythPriceFeed",
]
