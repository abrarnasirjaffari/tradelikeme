"""Solana exchange clients for TradeLikeMe.

NOTE: ZetaClient, JupiterClient, SolanaRouter require zetamarkets_py which is
not available on all environments.  Import them directly from their modules
(e.g. `from trading_agent.exchanges.solana.zeta_client import ZetaClient`)
rather than via this package to avoid import-time failures in the FastAPI backend.
"""

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
    # Price feed (no zetamarkets_py dependency)
    "PythPriceFeed",
    # Exchange clients — import directly from their modules to avoid
    # zetamarkets_py dependency at package level:
    #   from trading_agent.exchanges.solana.zeta_client import ZetaClient
    #   from trading_agent.exchanges.solana.jupiter_client import JupiterClient
    #   from trading_agent.exchanges.solana.solana_router import SolanaRouter
]
