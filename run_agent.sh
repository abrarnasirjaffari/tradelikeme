#!/bin/bash
# Start trading agent on devnet
set -e
cd "$(dirname "$0")"
source .env 2>/dev/null || true
export DEVNET_MODE=1
export PYTHONPATH="$(pwd)"
python -m trading_agent.main
