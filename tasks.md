# TradeLikeMe — Task List

> Very granular. Every task is one small action. Check off as done.

---

## ACCOUNTS & API KEYS

- [x] A1 — Create Helius account at helius.dev
- [x] A2 — Create new Helius project, copy RPC URL
- [x] A3 — Create Phantom wallet (fresh — for agent sub-account)
- [x] A4 — Save Phantom wallet private key (base58) to .env
- [x] A5 — Create Solana devnet account via `solana-keygen new` (pubkey: 35Jt4Uz9NDXAZcwUaNHqr1TMtpdgvtHKHW3NnrRRi6p4, on EC2)
- [x] A6 — Airdrop devnet SOL for testing — 2.5 SOL confirmed on devnet
- [x] A9 — Create Telegram bot via @BotFather — @tradelikeme_alerts_bot, token saved to .env
- [x] A10 — Get Telegram chat ID for notifications — 6398964627 saved to .env
- [x] A11 — Verify AWS Bedrock access for Claude Opus 4.6 in us-east-1 — model ACTIVE, invoke test pending next session
- [x] A12 — Create dedicated IAM user + keys for Bedrock Claude Opus 4.6, save to .env — IAM user: claude-code-bedrock, keys saved
- [x] A13 — Create WEEX account, generate trade-only API key
- [x] A18 — Create Colosseum account, register TradeLikeMe for Solana Frontier hackathon (deadline May 4)
- [x] A19 — Verify tradelikeme.xyz domain is active and pointing to EC2 (54.179.141.76 ✓)
- [x] A20 — Create .env file in Platform/ with all keys filled in

---

## REPO & PROJECT SETUP

- [x] R1 — Create .gitignore in Platform/
- [x] R2 — Create .env.example with all variable names (no values)
- [x] R3 — Create top-level folder structure (trading_agent/, backend/, infra/, frontend/)
- [x] R4 — Create trading_agent/base/ folder
- [x] R5 — Create trading_agent/strategies/sd_zones/ folder
- [x] R6 — Create trading_agent/exchanges/solana/ folder
- [x] R7 — Create trading_agent/exchanges/cex/ folder
- [x] R8 — Create trading_agent/channels/ folder
- [x] R9 — Create backend/routes/ folder
- [x] R10 — Create backend/models/ folder

---

## PYTHON ENVIRONMENT

- [x] P1 — Create requirements.txt
- [x] P2 — Add fastapi to requirements.txt
- [x] P3 — Add uvicorn to requirements.txt
- [x] P4 — Add websockets to requirements.txt
- [x] P5 — Add httpx to requirements.txt
- [x] P6 — Add sqlalchemy to requirements.txt
- [x] P7 — Add python-dotenv to requirements.txt
- [x] P8 — Add boto3 to requirements.txt (AWS Bedrock)
- [x] P10 — Add python-telegram-bot to requirements.txt
- [x] P11 — Add playwright to requirements.txt (KLineChart screenshots)
- [x] P12 — Add anchorpy to requirements.txt (Anchor vault interaction)
- [x] P13 — Add solders to requirements.txt (Solana primitives)
- [x] P14 — Add solana-py to requirements.txt
- [x] P15 — Create venv and run pip install -r requirements.txt

---

## ANCHOR VAULT PROGRAM (Rust — Solana smart contract)

- [x] V1 — Install Rust via rustup
- [x] V2 — Install Solana CLI tools
- [x] V3 — Install Anchor CLI via avm
- [x] V4 — Run `anchor init vault` to scaffold the program
- [x] V5 — Define `Vault` account struct (user_pubkey, strategy_id, balance, opening_balance, epoch_profit, platform_wallet)
- [x] V6 — Define PDA seeds: `[b"vault", user_pubkey, strategy_id]`
- [x] V7 — Write `deposit()` instruction — user sends USDC/CASH to vault PDA
- [x] V8 — Write `withdraw()` instruction — user pulls their balance from vault
- [x] V9 — Write `delegate_to_protocol()` instruction — vault authorizes agent to trade
- [x] V10 — Write `settle_epoch()` instruction — calculate profit, split 20/80, send 20% to platform wallet
- [x] V11 — Add access control to `settle_epoch()` — only agent keypair can call it
- [x] V12 — Add access control to `delegate_to_protocol()` — only vault owner can call it
- [x] V13 — Write unit tests for `deposit()`
- [x] V14 — Write unit tests for `withdraw()`
- [x] V15 — Write unit tests for `settle_epoch()` — verify 20/80 split math
- [x] V16 — Build program: `anchor build`
- [x] V17 — Deploy to devnet: `anchor deploy --provider.cluster devnet`
- [x] V18 — Note deployed program ID, add to config — Program ID: `rGMTq8sS5GUJ7q1ei9x75dnZ3kM2QCn5YRKYGHbwdSd` (devnet, slot 459047601)
- [x] V19 — Run `anchor test` on devnet — all tests pass
- [x] V20 — Verify vault PDA is unique per (user × strategy) on devnet — all 3 sub-tests pass (V20-1, V20-2, V20-3)

---

## PYTH PRICE FEED (pyth_ws.py)

- [x] PY1 — Research Pyth WebSocket endpoint for devnet — Hermes WS: wss://hermes-beta.pyth.network/ws (devnet), wss://hermes.pyth.network/ws (mainnet). Same feed IDs both networks.
- [x] PY2 — Create trading_agent/exchanges/solana/pyth_ws.py
- [x] PY3 — Write `connect()` — open WebSocket to Pyth
- [x] PY4 — Write `subscribe(symbol)` — subscribe to a price feed
- [x] PY5 — Write `get_price(symbol)` — return latest mid price
- [x] PY6 — Write `disconnect()` — clean WebSocket close
- [x] PY7 — Write auto-reconnect with exponential backoff on disconnect
- [x] PY8 — Test pyth_ws.py on devnet — confirm prices streaming for SOL/BTC/ETH
- [x] PY9 — Add REST fallback `get_price_rest(symbol)` — poll Pyth HTTP API if WS down

---

## ZETA MARKETS CLIENT (zeta_client.py) — PRIMARY SOLANA PERPS

> Zeta Markets is the primary Solana perps protocol.
> Official Python SDK: `zetamarkets-py` (PyPI). REST API + WebSocket. Anchor IDL published.
> Program ID: ZETAxsqBRPpep611126PjPNs6pCgB28B47v1vX61X6
> Pairs: SOL, BTC, ETH, APT, ARB. Max leverage: 50x.

- [x] ZC1 — Research Zeta Markets Python SDK (`zetamarkets-py`) — docs, GitHub, examples
- [x] ZC2 — Add `zetamarkets-py` to requirements.txt, run `pip install` — added to requirements.txt; local Windows install blocked (MSVC required for zstandard wheel). Installs cleanly on EC2 Ubuntu.
- [x] ZC3 — Create trading_agent/exchanges/solana/zeta_client.py
- [x] ZC4 — Write `__init__()` — load keypair, connect to Helius RPC, init Zeta client
- [x] ZC5 — Write `get_balance()` — return USDC margin balance
- [x] ZC6 — Write `get_price(symbol)` — fetch from Pyth feed via zeta or pyth_ws
- [x] ZC7 — Write `open_position(symbol, side, size, leverage)` — place market order
- [x] ZC8 — Write `close_position(symbol)` — full close
- [x] ZC9 — Write `set_sl(symbol, price)` — place stop loss order
- [x] ZC10 — Write `set_tp(symbol, price, qty)` — place take profit order
- [x] ZC11 — Write `get_position(symbol)` — return current position size + entry price
- [x] ZC12 — Test open_position on devnet
- [x] ZC13 — Test close_position on devnet
- [x] ZC14 — Test set_sl + set_tp on devnet

## RAYDIUM PERPS — REMOVED

> Raydium does NOT have its own on-chain perps engine.
> perps.raydium.io routes to other protocols. No program ID, no IDL, no Python path.
> Removed from build plan. Revisit post-hackathon if they publish an IDL.

---

## JUPITER PERPS CLIENT (jupiter_client.py) — FALLBACK SOLANA PERPS

> Jupiter Perps is the fallback protocol (higher leverage: 100x vs Zeta's 50x).
> No official Python SDK — uses anchorpy + on-chain IDL directly.
> Program ID: PERPHjGBqRHArX4DySjwM6UJHiR3sWAatqfdBS2qQJu
> Pairs: SOL, BTC, ETH only. REST API available via Jupiter station.
> Python reference: github.com/lukatavcer/jupiter_perpetuals

- [x] JC1 — Research Jupiter Perps anchorpy integration — study lukatavcer/jupiter_perpetuals repo. Program ID confirmed. Keeper/Request model verified. No devnet — mainnet only. instantIncreasePosition path bypasses keeper wait. IDL in julianfssen/jupiter-perps-anchor-idl-parsing.
- [x] JC2 — Create trading_agent/exchanges/solana/jupiter_client.py
- [x] JC3 — Write `__init__()` — load keypair, connect to Helius RPC, load IDL
- [x] JC4 — Write `get_balance()` — return USDC balance from custody pool
- [x] JC5 — Write `open_position(symbol, side, size, leverage)` — increasePosition instruction
- [x] JC6 — Write `close_position(symbol)` — decreasePosition instruction (full)
- [x] JC7 — Write `set_sl(symbol, price)` — place stop loss
- [x] JC8 — Write `set_tp(symbol, price, qty)` — place take profit
- [x] JC9 — Write `get_position(symbol)` — fetch position from on-chain state
- [x] JC10 — Test all methods on mainnet with minimal real funds (Jupiter Perps has no devnet deployment)

---

## EXCHANGE ABSTRACTION (exchange_base.py)

- [x] EB1 — Create trading_agent/base/exchange_base.py
- [x] EB2 — Define abstract base class `ExchangeBase`
- [x] EB3 — Define abstract method `get_balance()`
- [x] EB4 — Define abstract method `get_price(symbol)`
- [x] EB5 — Define abstract method `open_position(symbol, side, size, leverage)`
- [x] EB6 — Define abstract method `close_position(symbol)`
- [x] EB7 — Define abstract method `set_sl(symbol, price)`
- [x] EB8 — Define abstract method `set_tp(symbol, price, qty)`
- [x] EB9 — Define abstract method `get_position(symbol)`
- [x] EB10 — Make ZetaClient inherit ExchangeBase
- [x] EB11 — Make JupiterClient inherit ExchangeBase
- [x] EB12 — Write router logic: try Zeta → fallback Jupiter if symbol not available or Zeta down

---

## KLINECHART MCP SERVER (TradingView replacement — Claude controls chart directly)

> KLineChart + KLineChart Pro combined into a single MCP server.
> Claude calls tools (open_chart, screenshot, toggle_indicator etc) like a human using a chart.
> No Python middleman. One MCP server reused by all strategies forever.
> Keep ALL indicators for now — remove/tune later once zone analysis is validated.

- [x] KC1 — Clone KLineChart into `infra/klinechart/`
- [x] KC2 — Clone KLineChart Pro into `infra/klinechart-pro/`
- [x] KC3 — Review KLineChart Pro source — architecture understood, datafeed interface identified, outdated deps catalogued
- [x] KC4 — `cd infra/klinechart && pnpm install` — installed 967 packages (requires pnpm, not npm)
- [x] KC5 — `cd infra/klinechart-pro && npm install` — installed 590 packages
- [x] KC6 — Fix peer dep in `infra/klinechart-pro/package.json`: bumped `"klinecharts": ">=9.0.0"` → `">=10.0.0"`
- [x] KC7 — `npm run build` in `infra/klinechart-pro/` — clean build, 331 modules, dist generated
### Phase 2 — MCP Server Scaffold

- [x] KC8 — Create `infra/klinechart-mcp/` folder
- [x] KC9 — Create `infra/klinechart-mcp/package.json` — deps: `@modelcontextprotocol/sdk`, `playwright`, `typescript`
- [x] KC10 — Run `npm install` in `infra/klinechart-mcp/`
- [x] KC11 — Create `infra/klinechart-mcp/tsconfig.json` — target ES2022, module NodeNext
- [x] KC12 — Create `infra/klinechart-mcp/src/index.ts` — empty MCP server skeleton (McpServer init, stdio transport, no tools yet)
- [x] KC13 — Confirm `npx ts-node src/index.ts` runs without error

### Phase 3 — Chart Page

- [x] KC14 — Create `infra/klinechart-mcp/chart/` folder
- [x] KC15 — Create `infra/klinechart-mcp/chart/index.html` — loads KLineChart + KLineChart Pro from local `infra/` paths, fixed 1400×700px, no toolbar
- [x] KC16 — Create `infra/klinechart-mcp/chart/datafeed.ts` — `getHistoryKLineData()` fetches OHLCV from exchange REST API
- [x] KC17 — Add Pyth HTTP fallback to `datafeed.ts` — if exchange REST fails, fetch from Pyth
- [x] KC18 — Wire `datafeed.ts` into the chart page — replace default Polygon.io datafeed
- [x] KC19 — Add `data-ready="true"` to chart DOM element once candles finish loading
- [x] KC20 — Manual test: open `chart/index.html?symbol=SOLUSDT&tf=4H` in browser — candles render

### Phase 4 — Playwright Browser Manager

- [x] KC21 — Create `infra/klinechart-mcp/src/browser.ts`
- [x] KC22 — Write `launch()` — start Playwright Chromium headless, open chart page
- [x] KC23 — Write `navigate(symbol, tf)` — set URL params + wait for `data-ready`
- [x] KC24 — Write `close()` — graceful browser shutdown
- [x] KC25 — Test `launch()` + `navigate("SOLUSDT", "4H")` — confirm page loads

### Phase 5 — MCP Tools (one task per tool)

- [x] KC26 — Create `src/tools/` folder
- [x] KC27 — Write tool `open_chart` — calls `browser.navigate(symbol, tf)`, returns "ok"
- [x] KC28 — Write tool `set_symbol` — changes symbol, waits for data-ready
- [x] KC29 — Write tool `set_timeframe` — changes tf, waits for data-ready
- [x] KC30 — Write tool `screenshot` — Playwright screenshot → base64 PNG string returned
- [x] KC31 — Write tool `toggle_indicator` — evaluate JS in page to show/hide indicator by name
- [x] KC32 — Write tool `get_ohlcv` — return raw candle JSON from datafeed cache
- [x] KC33 — Write tool `scroll_chart` — evaluate JS to scroll N bars back
- [x] KC34 — Write tool `get_price` — return latest close price from datafeed cache
- [x] KC35 — Register all 8 tools in `src/index.ts`

### Phase 6 — Build + Test

- [x] KC36 — `npm run build` in `infra/klinechart-mcp/` — confirm clean TypeScript compile
- [x] KC37 — Test `open_chart` tool via MCP Inspector — chart loads
- [x] KC38 — Test `screenshot` tool — returns valid base64 PNG
- [x] KC39 — Test `set_timeframe` + `screenshot` — confirm different TF candles render
- [x] KC40 — Test `toggle_indicator` — RSI appears/disappears on chart
- [x] KC41 — Add MCP server to `claude_desktop_config.json` (or project MCP settings) for local use
- [x] KC42 — Full zone scan test: Claude calls open_chart + screenshot 7 times (7 TFs) for SOLUSDT, identifies zones

---

## ZONE SCANNER (zones.py)

- [x] ZS1 — Create trading_agent/strategies/sd_zones/zones.py
- [x] ZS2 — Write `fetch_ohlcv(symbol, tf)` — get candle data from Pyth/exchange REST
- [x] ZS3 — Write `render_chart(symbol, tf)` — open `infra/chart_server/index.html?symbol=X&tf=Y` via Playwright, wait for `data-ready` attribute
- [x] ZS4 — Confirm chart server is running before zone scan starts (health check in `scan_tf_stack`)
- [x] ZS5 — Install Playwright: `playwright install chromium`
- [x] ZS6 — Write `screenshot_chart(html_path)` — Playwright headless screenshot → PNG
- [x] ZS7 — Write `analyze_zones(png_path, symbol, tf)` — send screenshot to Claude Opus 4.6 via AWS Bedrock
- [x] ZS8 — Write Claude prompt for zone identification (S/D zones, FVG, structure)
- [x] ZS9 — Parse Claude response → structured zone list `[{type, top, bottom, tf, strength}]`
- [x] ZS10 — Write `scan_tf_stack(symbol)` — loop all 7 TFs, collect zones
- [x] ZS11 — Write `apply_4h_gate(zones)` — filter out lower-TF zones with no 4H zone within ±5%
- [x] ZS12 — Write `apply_btc_gate(direction)` — check BTC 1D structure, block entries against it
- [x] ZS13 — Write `find_tp_levels(entry, direction, zones)` — return TP1 (zone 1) and TP2 (zone 2)
- [x] ZS14 — Write `find_sl_level(entry, direction, zones)` — structural SL below/above entry
- [x] ZS16 — Test zone scan on SOL devnet — verify zones returned correctly

---

## SENTINEL (sentinel.py)

- [x] SE1 — Create trading_agent/strategies/sd_zones/sentinel.py
- [x] SE2 — Write `__init__()` — load watchlist, connect Pyth WS
- [x] SE3 — Write `add_watch(symbol, zone_top, zone_bottom, watch_type)` — add to watchlist
- [x] SE4 — Write `remove_watch(symbol)` — remove from watchlist
- [x] SE5 — Write `_on_price_tick(symbol, price)` — called on every WS tick
- [x] SE6 — Write zone touch detection — price enters zone → fire event
- [x] SE7 — Write TP1 hit detection — price hits TP1 level → fire event
- [x] SE8 — Write 30m candle body-close SL check — runs every 30 min
- [x] SE9 — Wick logic: if candle wicks past SL but body closes above → ignore
- [x] SE10 — Write `start()` — launch all 3 watchers as asyncio tasks
- [x] SE11 — Write `stop()` — graceful shutdown of all watchers
- [x] SE12 — Test sentinel zone touch detection on devnet with mock prices

---

## TRADE AGENT (trade_agent.py)

- [x] TA1 — Create trading_agent/strategies/sd_zones/trade_agent.py
- [x] TA2 — Write `enter_trade(symbol, side, entry, sl, tp1, tp2)` — place 4 orders at once
- [x] TA3 — Place market entry order via exchange_base
- [x] TA4 — Place TP1 limit order (50% qty) via exchange_base
- [x] TA5 — Place TP2 limit order (50% qty) via exchange_base
- [x] TA6 — Place disaster SL order (structural + 3% buffer) via exchange_base
- [x] TA7 — Write `on_tp1_hit(symbol)` — move SL to entry (break-even)
- [x] TA8 — Write `on_sl_hit(symbol)` — log trade, update journal
- [x] TA9 — Write `on_tp2_hit(symbol)` — log trade complete, update journal
- [x] TA10 — Write `on_body_close_sl(symbol)` — close position, log trade
- [x] TA11 — Write `get_open_trades()` — return list of active trades
- [x] TA12 — Test enter_trade on devnet — verify all 4 orders placed correctly

---

## LOOP ORCHESTRATOR (loop.py)

- [x] LO1 — Create trading_agent/strategies/sd_zones/loop.py
- [x] LO2 — Write `startup()` — load config, init exchange, start sentinel
- [x] LO3 — Write zone refresh cycle — rescan all coins every 4H
- [x] LO4 — Write entry gate — block entries until first full scan completes
- [x] LO5 — Write `check_entry(symbol, zones)` — validate setup, check all gates
- [x] LO6 — Write MAX_AT_RISK_SLOTS enforcement — max 2 concurrent positions
- [x] LO7 — Write MIN_BALANCE check — stop trading if balance below threshold
- [x] LO8 — Write compound cycle — every 72H recalculate position sizing
- [x] LO9 — Write `shutdown()` — graceful stop, close all watchers
- [x] LO10 — Test loop startup + zone scan on devnet

---

## JOURNAL & STATE (journal.py / state.py)

- [x] JS1 — Create trading_agent/strategies/sd_zones/journal.py
- [x] JS2 — Define trades table (id, symbol, side, entry, sl, tp1, tp2, status, open_time, close_time, pnl)
- [x] JS3 — Define positions table (id, symbol, side, size, entry, current_sl, tp1, tp2, strategy_id)
- [x] JS4 — Define epochs table (id, strategy_id, user_id, open_balance, close_balance, profit, platform_fee, timestamp)
- [x] JS5 — Write `log_trade_open(trade)` — insert trade row
- [x] JS6 — Write `log_trade_close(trade_id, exit_price, pnl)` — update trade row
- [x] JS7 — Write `get_open_trades()` — query open trades
- [x] JS8 — Write `log_epoch(epoch)` — insert epoch settlement row
- [x] JS9 — Create trading_agent/strategies/sd_zones/state.py
- [x] JS10 — Define in-memory state: open_trades dict, watchlist dict, last_scan_time, scan_complete flag

---

## BASE STRATEGY CLASS (base_strategy.py)

- [x] BS1 — Create trading_agent/base/base_strategy.py
- [x] BS2 — Define abstract class `BaseStrategy`
- [x] BS3 — Define abstract method `scan_zones(symbol)`
- [x] BS4 — Define abstract method `check_entry(symbol, zones)`
- [x] BS5 — Define abstract method `get_config()` — return strategy params from DB
- [x] BS6 — Define abstract method `on_event(event_type, data)`
- [x] BS7 — Write `load_params(strategy_id)` — read params row from strategy DB
- [x] BS8 — Make SDZoneStrategy inherit BaseStrategy

---

## PLATFORM CONFIG (config.py)

- [x] CF1 — Create trading_agent/base/config.py
- [x] CF2 — Load all env vars (AWS, Telegram, Twilio, Helius, Solana keys)
- [x] CF3 — Define SUPPORTED_EXCHANGES list
- [x] CF4 — Define SUPPORTED_NOTIFICATION_CHANNELS list
- [x] CF5 — Define MAX_AT_RISK_SLOTS = 2
- [x] CF6 — Define MIN_BALANCE_USD = 35
- [x] CF7 — Define TF_STACK = [1M, 1W, 1D, 4H, 1H, 30M, 15M]
- [x] CF8 — Define ZONE_GATE_PCT = 0.05 (4H gate ±5%)
- [x] CF9 — Define DISASTER_SL_BUFFER = 0.03 (structural + 3%)
- [x] CF10 — Define EPOCH_INTERVAL_DAYS = 30

---

## NOTIFICATIONS (notifier.py + channels)

- [x] N1 — Create trading_agent/base/notifier.py
- [x] N2 — Write `send(user_id, event, data)` — dispatcher
- [x] N3 — Write `asyncio.gather()` across all enabled channels
- [x] N4 — Create trading_agent/channels/telegram.py
- [x] N5 — Write `send_telegram(chat_id, message)` — send via Bot API
- [x] N6 — Write `send_photo_telegram(chat_id, image_path, caption)` — send chart screenshot
- [x] N9 — Define all event types: ZONE_TOUCH, TRADE_ENTERED, TP1_HIT, TP2_HIT, SL_HIT, BALANCE_LOW, AGENT_DOWN, DAILY_SUMMARY
- [x] N10 — Write message templates for each event type
- [x] N11 — Test Telegram send on real bot

---

## DATABASE — PLATFORM (Supabase Postgres)

> Database changed from SQLite to Supabase (hosted Postgres). Using SQLAlchemy + psycopg2 for ORM consistency.

- [x] DB0 — Create Supabase project, copy Postgres connection string, add SUPABASE_DATABASE_URL to .env — self-hosted on EC2, password from /opt/supabase/docker/.env
- [x] DB0b — Add psycopg2-binary to requirements.txt, run pip install
- [x] DB1 — Create backend/models/user.py — users table (id, email, wallet_pubkey, risk_mode, created_at)
- [x] DB2 — Create backend/models/strategy.py — strategies table (id, name, tier, win_rate, monthly_return, status)
- [x] DB3 — Create backend/models/subscription.py — subscriptions table (user_id, strategy_id, vault_address, status)
- [x] DB4 — Create backend/models/notification_config.py — notification prefs table
- [x] DB5 — Create backend/models/base.py — SQLAlchemy declarative base + engine using SUPABASE_DATABASE_URL
- [x] DB6 — Write `init_db()` in backend/models/base.py — create all tables if not exist
- [x] DB7 — Test DB init — all tables created in Supabase dashboard (users, strategies, subscriptions, notification_configs verified)

---

## FASTAPI BACKEND (main.py + routes)

- [x] FA1 — Create backend/main.py — FastAPI app, CORS, startup/shutdown hooks
- [x] FA2 — Create backend/routes/strategies.py — GET /strategies, GET /strategies/{id}
- [x] FA3 — Create backend/routes/subscriptions.py — POST/DELETE /subscriptions
- [x] FA4 — Create backend/routes/vaults.py — GET /vaults, POST /deposit, POST /withdraw
- [x] FA5 — Create backend/routes/trades.py — GET /trades, GET /pnl
- [x] FA6 — Create backend/routes/notifications.py — GET/POST /notifications/config, POST /test
- [x] FA7 — Create backend/routes/users.py — GET/POST /users/{id}/risk-mode
- [x] FA8 — Create backend/routes/admin.py — POST /strategies (add new), GET /admin/revenue
- [x] FA9 — Create backend/routes/agent.py — POST /agent/start, POST /agent/stop, GET /agent/status
- [x] FA10 — Add JWT validation middleware — verify BetterAuth token on every request
- [x] FA11 — Add WebSocket endpoint `WS /ws/live` — push live updates to website
- [x] FA12 — Test GET /strategies returns correct data
- [x] FA13 — Test POST /subscriptions creates vault record
- [x] FA14 — Test WS /ws/live delivers price update

---

## DOCKER & DEPLOYMENT (infra/)

- [x] DO1 — Create infra/docker-compose.yml
- [x] DO2 — Add FastAPI backend service to docker-compose
- [x] DO3 — Add sd_zones agent service to docker-compose
- [x] DO4 — Add SQLite volume mount to docker-compose
- [x] DO5 — Create Dockerfile for Python agent
- [x] DO6 — Create Dockerfile for FastAPI backend
- [x] DO7 — Install Dokploy on EC2 (`curl -sSL https://dokploy.com/install.sh | bash`) — already running v0.29.2, dokploy-traefik owns ports 80+443
- [x] DO8 — Configure Traefik routing in Dokploy (`api.tradelikeme.xyz` → FastAPI) — dynamic config written to /etc/dokploy/traefik/dynamic/tradelikeme-api.yml on EC2
- [x] DO9 — Deploy via Dokploy — all services running (backend on :8001, agent running, DB via supabase_default network)
- [x] DO10 — Verify auto-SSL cert issued for api.tradelikeme.xyz — Let's Encrypt R13 cert active, Verify OK

---

## END-TO-END TESTING (devnet)

- [x] ET1 — Full flow test: deposit USDC into vault on devnet
- [x] ET2 — Full flow test: agent detects zone, enters trade on Zeta Markets devnet
- [x] ET3 — Full flow test: sentinel fires TP1 hit, agent moves SL to entry
- [x] ET4 — Full flow test: sentinel fires 30m body-close SL, agent closes position
- [x] ET5 — Full flow test: settle_epoch() runs, 20% goes to platform wallet on-chain
- [x] ET6 — Full flow test: user calls withdraw(), receives 80% share
- [x] ET7 — Test Telegram notification received on all 9 event types
- [x] ET9 — Test 2 simultaneous strategies — verify zero overlap in state/positions
- [x] ET10 — Test MIN_BALANCE gate — trading stops below threshold

---

## REPO MERGE & FRONTEND (DEFERRED — do after main platform is complete)

> Do NOT start these until Python backend + Solana is fully working and tested.
> `tradelikeme-website` stays as a separate repo until then.

### Merge
- [x] M1 — Pull latest from `tradelikeme-website` GitHub repo
- [x] M2 — Create `frontend/` folder in this repo
- [x] M3 — Copy all files from tradelikeme-website into `frontend/` (React/Vite, not Next.js)
- [ ] M4 — Verify `frontend/` builds: `cd frontend && npm install && npm run build`
- [x] M5 — `frontend/node_modules` + `dist/` covered by root `.gitignore` (`node_modules/`, `dist/`)
- [ ] M6 — Add frontend service to `infra/docker-compose.yml` (Vite/React container)
- [ ] M7 — Update Traefik routing: `tradelikeme.xyz` → frontend container
- [x] M8 — Push merged repo to GitHub (`abrarnasirjaffari/tradelikeme`)
- [ ] M9 — Archive `tradelikeme-website` repo on GitHub after confirming merge is clean

### Frontend Wiring
- [x] FE1 — Audit existing tradelikeme-website pages — React/Vite app: landing page, waitlist, trader/investor/contributor forms, pricing, how-it-works, open-source, privacy, terms, deposit slider, mode picker
- [ ] FE2 — Set `NEXT_PUBLIC_API_URL=https://api.tradelikeme.xyz` in frontend `.env`
- [ ] FE3 — Wire Phantom Connect sign-in → BetterAuth session
- [ ] FE4 — Wire `POST /vaults/{id}/deposit` into deposit UI
- [ ] FE5 — Wire `POST /vaults/{id}/withdraw` into withdrawal UI
- [ ] FE6 — Wire `GET /users/{id}/trades` into trade history page
- [ ] FE7 — Wire `GET /users/{id}/pnl` into P&L dashboard
- [ ] FE8 — Wire `WS /ws/live` into dashboard for real-time updates
- [ ] FE9 — Add/update pages as user specifies (TBD — user will direct)
- [ ] FE10 — Mobile responsive check across all pages

---

## ON HOLD (post-hackathon)

### Accounts
- [⏸] A7 — Create Twilio account at twilio.com (WhatsApp)
- [⏸] A8 — Enable Twilio WhatsApp sandbox, copy Account SID + Auth Token
- [⏸] A14 — Create Bybit account, generate trade-only API key (Phase 2)
- [⏸] A15 — Create BingX account, generate trade-only API key (Phase 2)
- [⏸] A16 — Create Binance account, generate trade-only API key (Phase 2)
- [⏸] A17 — Create Bitget account, generate trade-only API key (Phase 2)

### Python Deps
- [⏸] P9 — Add twilio to requirements.txt (WhatsApp)

### Notifications
- [⏸] N7 — Create trading_agent/channels/whatsapp.py
- [⏸] N8 — Write `send_whatsapp(phone, message)` via Twilio sandbox
- [⏸] N12 — Test WhatsApp send via Twilio sandbox

### Testing
- [⏸] ET8 — Test WhatsApp notification on zone touch + TP hit

### Zone Scanner
- [⏸] ZS15 — Add TradingView MCP as fallback in `scan_tf_stack()` if KLineChart fails
