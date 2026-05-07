#!/bin/bash
# Run the devnet demo (with synthetic zone touch for video)
set -e
cd "$(dirname "$0")"
source .env 2>/dev/null || true
export DEVNET_MODE=1
export PYTHONPATH="$(pwd)"
python trading_agent/devnet_demo.py
