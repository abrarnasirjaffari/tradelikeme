# Contributing to TradeLikeMe

TradeLikeMe is open source (Apache 2.0). The platform code, infrastructure, and docs are all open for contributions. The trading strategy rules are also fully public — see [TRADING_RULES.md](TRADING_RULES.md).

---

## Where Help Is Most Needed

These areas have the highest impact and are actively in progress:

| Area | What's Needed | Files |
|------|--------------|-------|
| **Frontend wiring** | Wire `/vaults`, `/trades`, `/pnl`, `/positions` to real API (mock data currently) | `frontend/src/pages/DashboardPage.tsx`, `services/api.ts` |
| **WebSocket live feed** | Connect `/ws/live` events to dashboard (trade entered, TP hit, SL hit) | `frontend/src/pages/DashboardPage.tsx`, `backend/routes/ws.py` |
| **CEX layer** | Build WEEX + Bybit + Binance clients using `ExchangeBase` interface | `trading_agent/exchanges/cex/` (empty) |
| **Notifier wiring** | `notifier.send()` defined but not called in all event handlers | `trading_agent/strategies/sd_zones/loop.py` |
| **Pyth symbol mapping** | 6 of 14 watchlist coins not yet mapped to Pyth feed IDs | `trading_agent/strategies/sd_zones/config.py` |
| **settle_epoch() wiring** | On-chain monthly profit settlement not yet auto-called by agent | `trading_agent/exchanges/solana/trade_journal_client.py` |
| **Vault anchor client** | `POST /vaults/{id}/deposit|withdraw` need real `anchor_vault_client` integration | `backend/routes/vaults.py` |
| **Docs** | API reference, deployment guide, smart contract docs | `docs/` |

If you're new to the project, start with frontend wiring or Pyth symbol mapping — both are well-isolated and don't require Solana devnet credentials.

---

## Getting Started

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Python | 3.11+ | [python.org](https://python.org) |
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| Rust | stable | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |
| Anchor CLI | 0.32.1 | `cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked` |
| Solana CLI | 1.18+ | [docs.solana.com/cli/install](https://docs.solana.com/cli/install) |

### Fork & Clone

```bash
# Fork on GitHub, then:
git clone https://github.com/<your-username>/tradelikeme
cd tradelikeme
```

### Python Setup

```bash
python -m venv venv
source venv/bin/activate            # Windows: venv\Scripts\activate
pip install -r requirements.txt
playwright install chromium          # For KLineChart zone scanning
```

### Node.js Setup

```bash
# Frontend
cd frontend && npm install && cd ..

# Auth service
cd auth && npm install && cd ..

# KLineChart MCP server
cd infra/klinechart-mcp && npm install && npm run build && cd ../..
```

### Environment Variables

```bash
cp .env.example .env
```

Minimum required to run the agent on devnet:

```env
HELIUS_RPC_URL=https://devnet.helius-rpc.com/?api-key=<your-key>
SOLANA_NETWORK=devnet
PHANTOM_PRIVATE_KEY=<base58-encoded-private-key>
AWS_ACCESS_KEY_ID=<your-key>
AWS_SECRET_ACCESS_KEY=<your-secret>
AWS_REGION=us-east-1
TELEGRAM_BOT_TOKEN=<your-bot-token>
TELEGRAM_CHAT_ID=<your-chat-id>
BETTER_AUTH_SECRET=any-random-string-for-local-dev
SUPABASE_DB_URL=sqlite:///./local_dev.db   # use SQLite locally
```

See [SETUP.md](SETUP.md) for the full guide including Solana devnet wallet setup.

---

## Branch Conventions

| Branch | Purpose |
|--------|---------|
| `master` | Stable — always deployable |
| `feat/<short-description>` | New feature |
| `fix/<short-description>` | Bug fix |
| `docs/<short-description>` | Documentation only |
| `refactor/<short-description>` | Refactoring (no behaviour change) |

Examples: `feat/bybit-client`, `fix/sentinel-reconnect`, `docs/api-reference`

**Never commit directly to `master`.** All changes go through PRs.

---

## Making Changes

### Python (trading agent, backend)

Run tests before pushing:

```bash
# Unit/integration tests
pytest tests/ -v

# Type checking (if mypy configured)
mypy trading_agent/ backend/

# Format
black trading_agent/ backend/
```

### TypeScript (frontend, auth)

```bash
# Frontend
cd frontend && npm run lint && npm run build

# Auth
cd auth && npm run build
```

### Rust (Anchor vault program)

```bash
cd trading_agent/exchanges/solana/anchor_vault
anchor build
anchor test          # requires Solana devnet
```

---

## Submitting a Pull Request

1. **Create a branch** from `master`:
   ```bash
   git checkout -b feat/my-feature
   ```

2. **Write tests** for any new behavior. Matching test patterns:
   - Python agent code → `tests/test_<module_name>.py`
   - FastAPI routes → `tests/test_<route>_api.py`
   - Solana clients → `tests/test_<client>_devnet.py`

3. **Commit with a descriptive message**:
   ```
   feat(sentinel): add body-SL retry on Pyth WS disconnect
   fix(zeta): handle IOC rejection on low liquidity
   docs(setup): add Windows-specific venv instructions
   ```

4. **Open a PR** to `master`:
   - Describe what changed and why
   - Link any related issues
   - Include test output or screenshots for UI changes
   - For Solana changes: include devnet transaction signatures

5. **Wait for review** — PRs are reviewed within 48 hours during the hackathon period.

---

## Code Standards

### Python

- Follow existing patterns in the file you're editing
- Async everything in the trading agent — no blocking calls in the event loop
- One responsibility per function; sentinel watches stay separate from loop logic
- No bare `except:` — always catch specific exceptions
- Log at the right level: `DEBUG` for tick-by-tick, `INFO` for lifecycle events, `WARNING` for recoverable errors, `ERROR` for failures requiring attention
- Constants go in `config.py`, not inline in logic files

### TypeScript / React

- Components use functional style + hooks only
- Props interfaces defined with TypeScript types
- API calls go through `services/api.ts` — no raw `fetch()` in components
- Dashboard data falls back to mock data if API fails (pattern already established)
- Tailwind for layout; Framer Motion for animations

### Rust / Anchor

- All instructions validate signer constraints before any state mutation
- PDA derivation uses deterministic seeds — document the seeds in a comment above each PDA
- Error codes defined in `errors.rs` with descriptive messages
- Test every instruction with both success and failure cases

---

## Testing Guide

### Devnet Credentials Required

These tests need real devnet credentials in `.env`:

```
tests/test_zeta_*.py             # Zeta Markets devnet
tests/test_vault_*.py            # Anchor vault devnet
tests/test_settle_epoch_*.py     # On-chain settlement
tests/test_sentinel_tp1_devnet.py
tests/test_trade_agent_devnet.py
tests/test_zone_detection_devnet.py
```

### Mock/Local Tests (No Credentials)

```
tests/test_strategies_api.py     # FastAPI routes (mocked DB)
tests/test_sentinel_zone_touch.py # Sentinel logic (mocked prices)
tests/test_min_balance_gate.py   # Entry gate logic
tests/test_ws_live.py            # WebSocket (mocked auth)
tests/test_telegram_notifications.py
```

### Adding a New Test

```python
# tests/test_my_feature.py
import pytest
from trading_agent.strategies.sd_zones.my_module import my_function

@pytest.mark.asyncio
async def test_my_function_happy_path():
    result = await my_function(...)
    assert result.field == expected_value

@pytest.mark.asyncio
async def test_my_function_error_case():
    with pytest.raises(ValueError):
        await my_function(invalid_input)
```

---

## Architecture Decisions

Before making a significant structural change, check `plan.md` for the reasoning behind current decisions. Key ones:

| Decision | Why |
|----------|-----|
| SQLite per strategy, not shared Postgres | Single agent process, no horizontal scaling in v1 |
| WebSocket-first sentinel | Zero AI tokens watching prices 24/7 |
| Zeta Markets (not Raydium) as primary | Raydium Perps was in the plan but Zeta has better devnet support |
| KLineChart (not TradingView) | Self-hosted, no API keys, runs headlessly on EC2 |
| AWS Bedrock for Claude | IAM-based auth, no per-request API key management |
| BetterAuth not custom auth | 30+ auth features (2FA, admin, rate limiting) out of the box |
| No custom smart contract for trade execution | Drift/Zeta delegation handles custody trustlessly |

If your change contradicts one of these decisions, open an issue for discussion first rather than submitting a PR.

---

## Project Contacts

- **Lead / Solana**: Abrar Nasir Jaffari (GitHub: abrarnasirjaffari)
- **Data & Analytics**: Wasiq Amir

Issues and PRs are the preferred communication channel. For strategy questions, the full rules are in [TRADING_RULES.md](TRADING_RULES.md).

---

## License

By contributing, you agree that your contributions are licensed under MIT, the same as the rest of the project. See [LICENSE](LICENSE).
