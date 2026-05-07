# Setup Guide

This guide covers running TradeLikeMe locally for development, running the agent on Solana devnet, and deploying the full stack.

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Python | 3.11+ | Required for trading agent + backend |
| Node.js | 18+ | Required for frontend, auth, KLineChart MCP |
| Rust | stable (1.70+) | Required only if rebuilding the Anchor program |
| Anchor CLI | 0.32.1 | Required only for smart contract development |
| Solana CLI | 1.18+ | Required for devnet wallet operations |
| Docker | 24+ | Required for full-stack Docker Compose run |
| Git | any | |

---

## 1. Clone the Repo

```bash
git clone https://github.com/abrarnasirjaffari/tradelikeme
cd tradelikeme
```

---

## 2. Python Environment

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Install Playwright browser (used by KLineChart zone scanner)
playwright install chromium
```

---

## 3. Node.js Dependencies

```bash
# Frontend (React 19 + Vite)
cd frontend && npm install && cd ..

# Auth service (BetterAuth + Hono)
cd auth && npm install && cd ..

# KLineChart MCP server (Playwright + TypeScript)
cd infra/klinechart-mcp && npm install && npm run build && cd ../..
```

---

## 4. Environment Variables

```bash
cp .env.example .env
```

Open `.env` and fill in the values. The sections below explain what's needed for each component.

### Minimum — Agent on Devnet (trading only)

```env
# Solana
HELIUS_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_KEY
SOLANA_NETWORK=devnet
PHANTOM_PRIVATE_KEY=YOUR_BASE58_PRIVATE_KEY

# AWS Bedrock (Claude Opus 4.6 for zone analysis)
AWS_ACCESS_KEY_ID=YOUR_KEY
AWS_SECRET_ACCESS_KEY=YOUR_SECRET
AWS_REGION=us-east-1

# Telegram notifications
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN
TELEGRAM_CHAT_ID=YOUR_CHAT_ID

# On-chain program
PROGRAM_ID=rGMTq8sS5GUJ7q1ei9x75dnZ3kM2QCn5YRKYGHbwdSd
USDC_MINT_DEVNET=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
```

### Additional — Full Stack (backend + auth + frontend)

```env
# BetterAuth
BETTER_AUTH_SECRET=any-random-32-char-string
BETTER_AUTH_URL=http://localhost:3001
TRUSTED_ORIGINS=http://localhost:5173

# Database
SUPABASE_DB_URL=postgresql://user:pass@host:5432/dbname
# (Or for local dev use SQLite: just comment out SUPABASE_DB_URL and init_db() creates SQLite)

# OAuth (optional for local dev — can skip, use email/password)
GOOGLE_CLIENT_ID=YOUR_ID
GOOGLE_CLIENT_SECRET=YOUR_SECRET
GITHUB_CLIENT_ID=YOUR_ID
GITHUB_CLIENT_SECRET=YOUR_SECRET

# Frontend
FRONTEND_URL=http://localhost:5173
ADMIN_EMAILS=you@example.com
```

### Getting Required Credentials

**Helius RPC** (free):
1. Go to [helius.dev](https://helius.dev)
2. Sign up → create a project → copy the devnet API key

**Solana devnet keypair**:
```bash
# Generate a new devnet keypair
solana-keygen new --outfile ~/.config/solana/devnet-agent.json

# Get the public key
solana-keygen pubkey ~/.config/solana/devnet-agent.json

# Fund with devnet SOL (for transaction fees)
solana airdrop 2 <your-pubkey> --url https://api.devnet.solana.com

# Export as base58 private key for .env
python -c "
import json, base58
with open('$HOME/.config/solana/devnet-agent.json') as f:
    key = json.load(f)
print(base58.b58encode(bytes(key)).decode())
"
```

**AWS Bedrock** (for Claude Opus 4.6 zone analysis):
1. AWS Console → IAM → Users → Create user (`claude-code-bedrock`)
2. Attach policy: `AmazonBedrockFullAccess`
3. Create access key → copy to `.env`
4. Enable Claude 3 Opus model access in AWS Bedrock console (us-east-1)

**Telegram bot**:
1. Message [@BotFather](https://t.me/botfather) on Telegram → `/newbot`
2. Copy the token to `TELEGRAM_BOT_TOKEN`
3. Add the bot to your channel, send a message
4. Get chat ID: `curl https://api.telegram.org/bot<TOKEN>/getUpdates`

---

## 5. Running the Trading Agent (Devnet)

### Quick Start — Dry Run (no real orders)

Tests the full pipeline without placing any Solana transactions:

```bash
DRY_RUN=1 bash run_demo.sh
```

This injects a synthetic zone touch after the zone scan completes, showing the full flow (zone scan → Telegram notification → 4-order entry → TP/SL logging) with mock responses.

### Real Devnet Agent (3-coin watchlist)

```bash
bash run_agent.sh
```

This runs with `DEVNET_MODE=1` and a 3-coin watchlist (SOL, BTC, ETH). Startup sequence:

1. Loads configuration and initializes Zeta Markets client
2. Connects to Pyth WebSocket for real-time prices
3. Starts zone scan across 3 coins × 7 timeframes (takes ~10–15 minutes)
4. Entries are **blocked** until the full scan completes
5. Sentinel starts watching price levels from scan results
6. First zone touch fires → 4 orders placed on Zeta devnet

### Production Agent (14-coin watchlist)

```bash
python -m trading_agent.main
```

Use `DEVNET_MODE=0` and fill in all 14 coins in `trading_agent/strategies/sd_zones/config.py`.

---

## 6. Running the Full Stack (Docker Compose)

Starts the FastAPI backend, BetterAuth service, and trading agent together:

```bash
docker compose -f infra/docker-compose.yml up --build
```

Services started:

| Service | Port | Description |
|---------|------|-------------|
| `backend` | 8001 | FastAPI REST API + WebSocket |
| `auth` | 3002 | BetterAuth (Hono) auth server |
| `agent` | — | Trading agent (no external port) |

To run only the API + auth (without the agent):

```bash
docker compose -f infra/docker-compose.yml up backend auth --build
```

### Persistent Data

The agent writes to a persistent Docker volume (`agent_data`):
- SQLite trade journal (`strategy_sd.db`)
- Zone screenshots (`/app/data/screenshots/`)

To inspect data between restarts:
```bash
docker compose exec agent ls /app/data/
```

---

## 7. Running the Frontend

```bash
cd frontend
npm run dev
```

Opens at `http://localhost:5173`. The Vite proxy forwards `/api/auth/*` to the auth service at `http://localhost:3001`.

Environment variables for the frontend (create `frontend/.env.local`):
```env
VITE_AUTH_URL=http://localhost:3001
VITE_API_URL=http://localhost:8001
```

---

## 8. Running the Auth Service Standalone

```bash
cd auth
npm run dev
```

Opens at `http://localhost:3001`. All auth routes are at `/api/auth/*`.

Test that it's working:
```bash
curl http://localhost:3001/api/auth/get-session
# Returns: {"session":null}
```

---

## 9. Running the KLineChart MCP Server

The KLineChart MCP server is used by the zone scanner. It serves a headless chart page via HTTP and exposes 8 Playwright-based MCP tools.

```bash
cd infra/klinechart-mcp
npm run build
node dist/index.js
```

Server starts at `http://localhost:8765`. The chart is available at:
```
http://localhost:8765/klinechart-mcp/chart/index.html?symbol=SOLUSDT&tf=4H
```

The zone scanner (`zones.py`) connects to this server automatically when `KLINECHART_URL` is not set — it defaults to `http://localhost:8765`.

---

## 10. Running Tests

```bash
# All tests (requires .env with devnet credentials)
pytest tests/ -v

# Skip devnet tests (no credentials needed)
pytest tests/ -v -k "not devnet and not mainnet"

# Individual test suites
pytest tests/test_strategies_api.py -v          # FastAPI routes
pytest tests/test_sentinel_zone_touch.py -v     # Sentinel logic
pytest tests/test_min_balance_gate.py -v        # Entry gate

# Devnet tests (requires funded devnet wallet)
pytest tests/test_zeta_open_position.py -v
pytest tests/test_vault_deposit_devnet.py -v
pytest tests/test_settle_epoch_devnet.py -v
```

---

## 11. Solana Devnet Setup (Smart Contracts)

The Anchor vault program is already deployed at:
```
Program ID: rGMTq8sS5GUJ7q1ei9x75dnZ3kM2QCn5YRKYGHbwdSd
Network: devnet
```

You don't need to rebuild it for local development. But if you want to make changes:

```bash
# Install Anchor CLI
cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked

# Build the program
cd trading_agent/exchanges/solana/anchor_vault
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Run Anchor tests
anchor test --provider.cluster devnet
```

**Fund your devnet wallet** before running any on-chain tests:
```bash
solana airdrop 2 <YOUR_PUBKEY> --url https://api.devnet.solana.com
```

USDC devnet mint for testing: `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`

---

## 12. Common Issues

### Playwright: "Executable doesn't exist"

```bash
playwright install chromium --with-deps
```

### Zeta Markets: "Program not found" on devnet

Zeta Markets is deployed on devnet. If you see this error, your RPC URL may be incorrect or Helius rate-limited. Try:
```bash
# Test your RPC
curl "$HELIUS_RPC_URL" -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
```

### AWS Bedrock: "AccessDeniedException"

The Claude Opus model must be explicitly enabled in the AWS Console:
1. Go to AWS Bedrock → Model access (us-east-1 region)
2. Enable "Anthropic Claude 3 Opus"
3. Wait ~1 minute for activation

### SQLAlchemy: "no module named psycopg2"

```bash
pip install psycopg2-binary
```

If using SQLite locally instead of Supabase, comment out `SUPABASE_DB_URL` in `.env` and the `init_db()` call will create a local SQLite file.

### Helius RPC Rate Limit (429)

Free tier: 10 RPS, 1M credits/month. The agent averages ~1 RPS. If you hit rate limits during the zone scan:
- Add `ZONE_SCAN_DELAY_SECS=2` to slow down scans
- Or upgrade to Helius Developer tier

### Solana: "insufficient funds for transaction"

```bash
solana airdrop 2 <YOUR_PUBKEY> --url https://api.devnet.solana.com
```

If devnet faucet is dry, try [solfaucet.com](https://solfaucet.com).

---

## 13. Project-Wide Environment Variables Reference

Complete list — see `.env.example` for all values.

| Variable | Used By | Required |
|----------|---------|----------|
| `HELIUS_RPC_URL` | Agent, vault tests | Yes |
| `SOLANA_NETWORK` | Agent | Yes (`devnet` or `mainnet`) |
| `PHANTOM_PRIVATE_KEY` | Agent (Zeta Markets signing) | Yes |
| `DEVNET_AGENT_KEYPAIR_PATH` | Tests | Optional |
| `PROGRAM_ID` | Vault client | Yes |
| `USDC_MINT_DEVNET` | Vault deposits | Yes (devnet) |
| `PLATFORM_WALLET_PUBKEY` | Epoch settlement | Yes |
| `AWS_ACCESS_KEY_ID` | Zone scanner (Bedrock) | Yes |
| `AWS_SECRET_ACCESS_KEY` | Zone scanner (Bedrock) | Yes |
| `AWS_REGION` | Zone scanner | Yes (`us-east-1`) |
| `TELEGRAM_BOT_TOKEN` | Notifier | Yes |
| `TELEGRAM_CHAT_ID` | Notifier | Yes |
| `BETTER_AUTH_SECRET` | Auth service | Yes |
| `BETTER_AUTH_URL` | Auth service | Yes |
| `TRUSTED_ORIGINS` | Auth service CORS | Yes |
| `SUPABASE_DB_URL` | Backend, auth | Yes (or SQLite fallback) |
| `ADMIN_EMAILS` | Auth admin plugin | Optional |
| `GOOGLE_CLIENT_ID` | OAuth | Optional |
| `GOOGLE_CLIENT_SECRET` | OAuth | Optional |
| `GITHUB_CLIENT_ID` | OAuth | Optional |
| `GITHUB_CLIENT_SECRET` | OAuth | Optional |
| `FRONTEND_URL` | Backend CORS | Yes |
| `PYTH_WS_URL_DEVNET` | Pyth price feed | Optional (defaults set in code) |
| `PYTH_FEED_SOL_USD` | Sentinel | Optional (defaults set in code) |

CEX API keys (WEEX, Bybit, BingX, Binance, Bitget) are Phase 2 — leave blank for now.

---

## 14. Deployment (Production)

The full stack deploys via Docker Compose. See the Dokploy section in `CLAUDE.md` for the Traefik + auto-SSL setup.

Live endpoints:
- `https://tradelikeme.xyz` → React frontend
- `https://api.tradelikeme.xyz` → FastAPI backend
- `https://auth.tradelikeme.xyz` → BetterAuth service

SSH to the EC2 instance:
```bash
ssh -i "telegram-windows-key.pem" ubuntu@54.179.141.76
```

Restart services:
```bash
docker compose -f infra/docker-compose.yml restart backend
docker compose -f infra/docker-compose.yml logs -f agent
```
