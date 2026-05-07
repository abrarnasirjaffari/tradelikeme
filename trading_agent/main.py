"""
TradeLikeMe — S/D Zone Strategy Agent Entry Point.

Starts the S/D zone strategy on Solana devnet (or mainnet when NETWORK=mainnet).

Usage:
    python -m trading_agent.main
    DEVNET_MODE=1 python -m trading_agent.main
"""
import asyncio
import logging
import os

from dotenv import load_dotenv

# Load .env from repo root before importing any modules that read env vars.
load_dotenv()

from trading_agent.exchanges.solana.zeta_client import ZetaClient
from trading_agent.exchanges.solana.pyth_ws import PythPriceFeed
from trading_agent.strategies.sd_zones.agent import SDZoneStrategy

# ---------------------------------------------------------------------------
# Logging setup
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("trading_agent.main")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

async def main() -> None:
    network = os.getenv("NETWORK", "devnet").lower()
    logger.info("TradeLikeMe agent starting — network=%s", network)

    client = ZetaClient(network)
    pyth = PythPriceFeed(network)
    strategy = SDZoneStrategy(client, pyth)

    try:
        logger.info("Initialising ZetaClient…")
        await client.initialise()

        logger.info("Starting strategy…")
        await strategy.run()  # blocks until shutdown() or KeyboardInterrupt

    except KeyboardInterrupt:
        logger.info("KeyboardInterrupt received — shutting down gracefully…")

    except Exception:
        logger.exception("Unhandled exception in agent main loop — shutting down")

    finally:
        logger.info("Stopping strategy…")
        try:
            await strategy.shutdown()
        except Exception:
            logger.exception("Error during strategy.shutdown()")

        logger.info("Closing ZetaClient…")
        try:
            await client.close()
        except Exception:
            logger.exception("Error during client.close()")

        logger.info("Agent stopped cleanly.")


if __name__ == "__main__":
    asyncio.run(main())
