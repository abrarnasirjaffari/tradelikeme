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

- [ ] V1 — Install Rust via rustup
- [ ] V2 — Install Solana CLI tools
- [ ] V3 — Install Anchor CLI via avm
- [ ] V4 — Run `anchor init vault` to scaffold the program
- [ ] V5 — Define `Vault` account struct (user_pubkey, strategy_id, balance, opening_balance, epoch_profit, platform_wallet)
- [ ] V6 — Define PDA seeds: `[b"vault", user_pubkey, strategy_id]`
- [ ] V7 — Write `deposit()` instruction — user sends USDC/CASH to vault PDA
- [ ] V8 — Write `withdraw()` instruction — user pulls their balance from vault
- [ ] V9 — Write `delegate_to_protocol()` instruction — vault authorizes agent to trade
- [ ] V10 — Write `settle_epoch()` instruction — calculate profit, split 20/80, send 20% to platform wallet
- [ ] V11 — Add access control to `settle_epoch()` — only agent keypair can call it
- [ ] V12 — Add access control to `delegate_to_protocol()` — only vault owner can call it
- [ ] V13 — Write unit tests for `deposit()`
- [ ] V14 — Write unit tests for `withdraw()`
- [ ] V15 — Write unit tests for `settle_epoch()` — verify 20/80 split math
- [ ] V16 — Build program: `anchor build`
- [ ] V17 — Deploy to devnet: `anchor deploy --provider.cluster devnet`
- [ ] V18 — Note deployed program ID, add to config
- [ ] V19 — Run `anchor test` on devnet — all tests pass
- [ ] V20 — Verify vault PDA is unique per (user × strategy) on devnet

---

## PYTH PRICE FEED (pyth_ws.py)

- [ ] PY1 — Research Pyth WebSocket endpoint for devnet
- [ ] PY2 — Create trading_agent/exchanges/solana/pyth_ws.py
- [ ] PY3 — Write `connect()` — open WebSocket to Pyth
- [ ] PY4 — Write `subscribe(symbol)` — subscribe to a price feed
- [ ] PY5 — Write `get_price(symbol)` — return latest mid price
- [ ] PY6 — Write `disconnect()` — clean WebSocket close
- [ ] PY7 — Write auto-reconnect with exponential backoff on disconnect
- [ ] PY8 — Test pyth_ws.py on devnet — confirm prices streaming for SOL/BTC/ETH
- [ ] PY9 — Add REST fallback `get_price_rest(symbol)` — poll Pyth HTTP API if WS down

---

## RAYDIUM PERPS CLIENT (raydium_client.py)

- [ ] RC1 — Research Raydium Perps SDK / API docs
- [ ] RC2 — Create trading_agent/exchanges/solana/raydium_client.py
- [ ] RC3 — Write `__init__()` — load keypair, connect to Helius RPC
- [ ] RC4 — Write `get_balance()` — return USDC balance from vault
- [ ] RC5 — Write `get_price(symbol)` — fetch from Pyth feed
- [ ] RC6 — Write `open_position(symbol, side, size, leverage)` — place market order
- [ ] RC7 — Write `close_position(symbol)` — full close
- [ ] RC8 — Write `set_sl(symbol, price)` — place stop loss order
- [ ] RC9 — Write `set_tp(symbol, price, qty)` — place take profit order
- [ ] RC10 — Write `get_position(symbol)` — return current position size + entry
- [ ] RC11 — Test open_position on devnet
- [ ] RC12 — Test close_position on devnet
- [ ] RC13 — Test set_sl + set_tp on devnet

---

## JUPITER PERPS CLIENT (jupiter_client.py)

- [ ] JC1 — Research Jupiter Perps SDK (`@jup-ag/perps-sdk`) Python bindings or REST API
- [ ] JC2 — Create trading_agent/exchanges/solana/jupiter_client.py
- [ ] JC3 — Write `__init__()` — load keypair, connect to Helius RPC
- [ ] JC4 — Write `get_balance()` — return USDC balance
- [ ] JC5 — Write `open_position(symbol, side, size, leverage)`
- [ ] JC6 — Write `close_position(symbol)`
- [ ] JC7 — Write `set_sl(symbol, price)`
- [ ] JC8 — Write `set_tp(symbol, price, qty)`
- [ ] JC9 — Write `get_position(symbol)`
- [ ] JC10 — Test all methods on devnet

---

## EXCHANGE ABSTRACTION (exchange_base.py)

- [ ] EB1 — Create trading_agent/base/exchange_base.py
- [ ] EB2 — Define abstract base class `ExchangeBase`
- [ ] EB3 — Define abstract method `get_balance()`
- [ ] EB4 — Define abstract method `get_price(symbol)`
- [ ] EB5 — Define abstract method `open_position(symbol, side, size, leverage)`
- [ ] EB6 — Define abstract method `close_position(symbol)`
- [ ] EB7 — Define abstract method `set_sl(symbol, price)`
- [ ] EB8 — Define abstract method `set_tp(symbol, price, qty)`
- [ ] EB9 — Define abstract method `get_position(symbol)`
- [ ] EB10 — Make RaydiumClient inherit ExchangeBase
- [ ] EB11 — Make JupiterClient inherit ExchangeBase
- [ ] EB12 — Write router logic: try Raydium → fallback Jupiter if symbol not available

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
- [ ] KC38 — Test `screenshot` tool — returns valid base64 PNG
- [ ] KC39 — Test `set_timeframe` + `screenshot` — confirm different TF candles render
- [ ] KC40 — Test `toggle_indicator` — RSI appears/disappears on chart
- [ ] KC41 — Add MCP server to `claude_desktop_config.json` (or project MCP settings) for local use
- [ ] KC42 — Full zone scan test: Claude calls open_chart + screenshot 7 times (7 TFs) for SOLUSDT, identifies zones

---

## ZONE SCANNER (zones.py)

- [ ] ZS1 — Create trading_agent/strategies/sd_zones/zones.py
- [ ] ZS2 — Write `fetch_ohlcv(symbol, tf)` — get candle data from Pyth/exchange REST
- [ ] ZS3 — Write `render_chart(symbol, tf)` — open `infra/chart_server/index.html?symbol=X&tf=Y` via Playwright, wait for `data-ready` attribute
- [ ] ZS4 — Confirm chart server is running before zone scan starts (health check in `scan_tf_stack`)
- [ ] ZS5 — Install Playwright: `playwright install chromium`
- [ ] ZS6 — Write `screenshot_chart(html_path)` — Playwright headless screenshot → PNG
- [ ] ZS7 — Write `analyze_zones(png_path, symbol, tf)` — send screenshot to Claude Opus 4.6 via AWS Bedrock
- [ ] ZS8 — Write Claude prompt for zone identification (S/D zones, FVG, structure)
- [ ] ZS9 — Parse Claude response → structured zone list `[{type, top, bottom, tf, strength}]`
- [ ] ZS10 — Write `scan_tf_stack(symbol)` — loop all 7 TFs, collect zones
- [ ] ZS11 — Write `apply_4h_gate(zones)` — filter out lower-TF zones with no 4H zone within ±5%
- [ ] ZS12 — Write `apply_btc_gate(direction)` — check BTC 1D structure, block entries against it
- [ ] ZS13 — Write `find_tp_levels(entry, direction, zones)` — return TP1 (zone 1) and TP2 (zone 2)
- [ ] ZS14 — Write `find_sl_level(entry, direction, zones)` — structural SL below/above entry
- [ ] ZS15 — Add TradingView MCP as fallback in `scan_tf_stack()` if KLineChart fails
- [ ] ZS16 — Test zone scan on SOL devnet — verify zones returned correctly

---

## SENTINEL (sentinel.py)

- [ ] SE1 — Create trading_agent/strategies/sd_zones/sentinel.py
- [ ] SE2 — Write `__init__()` — load watchlist, connect Pyth WS
- [ ] SE3 — Write `add_watch(symbol, zone_top, zone_bottom, watch_type)` — add to watchlist
- [ ] SE4 — Write `remove_watch(symbol)` — remove from watchlist
- [ ] SE5 — Write `_on_price_tick(symbol, price)` — called on every WS tick
- [ ] SE6 — Write zone touch detection — price enters zone → fire event
- [ ] SE7 — Write TP1 hit detection — price hits TP1 level → fire event
- [ ] SE8 — Write 30m candle body-close SL check — runs every 30 min
- [ ] SE9 — Wick logic: if candle wicks past SL but body closes above → ignore
- [ ] SE10 — Write `start()` — launch all 3 watchers as asyncio tasks
- [ ] SE11 — Write `stop()` — graceful shutdown of all watchers
- [ ] SE12 — Test sentinel zone touch detection on devnet with mock prices

---

## TRADE AGENT (trade_agent.py)

- [ ] TA1 — Create trading_agent/strategies/sd_zones/trade_agent.py
- [ ] TA2 — Write `enter_trade(symbol, side, entry, sl, tp1, tp2)` — place 4 orders at once
- [ ] TA3 — Place market entry order via exchange_base
- [ ] TA4 — Place TP1 limit order (50% qty) via exchange_base
- [ ] TA5 — Place TP2 limit order (50% qty) via exchange_base
- [ ] TA6 — Place disaster SL order (structural + 3% buffer) via exchange_base
- [ ] TA7 — Write `on_tp1_hit(symbol)` — move SL to entry (break-even)
- [ ] TA8 — Write `on_sl_hit(symbol)` — log trade, update journal
- [ ] TA9 — Write `on_tp2_hit(symbol)` — log trade complete, update journal
- [ ] TA10 — Write `on_body_close_sl(symbol)` — close position, log trade
- [ ] TA11 — Write `get_open_trades()` — return list of active trades
- [ ] TA12 — Test enter_trade on devnet — verify all 4 orders placed correctly

---

## LOOP ORCHESTRATOR (loop.py)

- [ ] LO1 — Create trading_agent/strategies/sd_zones/loop.py
- [ ] LO2 — Write `startup()` — load config, init exchange, start sentinel
- [ ] LO3 — Write zone refresh cycle — rescan all coins every 4H
- [ ] LO4 — Write entry gate — block entries until first full scan completes
- [ ] LO5 — Write `check_entry(symbol, zones)` — validate setup, check all gates
- [ ] LO6 — Write MAX_AT_RISK_SLOTS enforcement — max 2 concurrent positions
- [ ] LO7 — Write MIN_BALANCE check — stop trading if balance below threshold
- [ ] LO8 — Write compound cycle — every 72H recalculate position sizing
- [ ] LO9 — Write `shutdown()` — graceful stop, close all watchers
- [ ] LO10 — Test loop startup + zone scan on devnet

---

## JOURNAL & STATE (journal.py / state.py)

- [ ] JS1 — Create trading_agent/strategies/sd_zones/journal.py
- [ ] JS2 — Define trades table (id, symbol, side, entry, sl, tp1, tp2, status, open_time, close_time, pnl)
- [ ] JS3 — Define positions table (id, symbol, side, size, entry, current_sl, tp1, tp2, strategy_id)
- [ ] JS4 — Define epochs table (id, strategy_id, user_id, open_balance, close_balance, profit, platform_fee, timestamp)
- [ ] JS5 — Write `log_trade_open(trade)` — insert trade row
- [ ] JS6 — Write `log_trade_close(trade_id, exit_price, pnl)` — update trade row
- [ ] JS7 — Write `get_open_trades()` — query open trades
- [ ] JS8 — Write `log_epoch(epoch)` — insert epoch settlement row
- [ ] JS9 — Create trading_agent/strategies/sd_zones/state.py
- [ ] JS10 — Define in-memory state: open_trades dict, watchlist dict, last_scan_time, scan_complete flag

---

## BASE STRATEGY CLASS (base_strategy.py)

- [ ] BS1 — Create trading_agent/base/base_strategy.py
- [ ] BS2 — Define abstract class `BaseStrategy`
- [ ] BS3 — Define abstract method `scan_zones(symbol)`
- [ ] BS4 — Define abstract method `check_entry(symbol, zones)`
- [ ] BS5 — Define abstract method `get_config()` — return strategy params from DB
- [ ] BS6 — Define abstract method `on_event(event_type, data)`
- [ ] BS7 — Write `load_params(strategy_id)` — read params row from strategy DB
- [ ] BS8 — Make SDZoneStrategy inherit BaseStrategy

---

## PLATFORM CONFIG (config.py)

- [ ] CF1 — Create trading_agent/base/config.py
- [ ] CF2 — Load all env vars (AWS, Telegram, Twilio, Helius, Solana keys)
- [ ] CF3 — Define SUPPORTED_EXCHANGES list
- [ ] CF4 — Define SUPPORTED_NOTIFICATION_CHANNELS list
- [ ] CF5 — Define MAX_AT_RISK_SLOTS = 2
- [ ] CF6 — Define MIN_BALANCE_USD = 35
- [ ] CF7 — Define TF_STACK = [1M, 1W, 1D, 4H, 1H, 30M, 15M]
- [ ] CF8 — Define ZONE_GATE_PCT = 0.05 (4H gate ±5%)
- [ ] CF9 — Define DISASTER_SL_BUFFER = 0.03 (structural + 3%)
- [ ] CF10 — Define EPOCH_INTERVAL_DAYS = 30

---

## NOTIFICATIONS (notifier.py + channels)

- [ ] N1 — Create trading_agent/base/notifier.py
- [ ] N2 — Write `send(user_id, event, data)` — dispatcher
- [ ] N3 — Write `asyncio.gather()` across all enabled channels
- [ ] N4 — Create trading_agent/channels/telegram.py
- [ ] N5 — Write `send_telegram(chat_id, message)` — send via Bot API
- [ ] N6 — Write `send_photo_telegram(chat_id, image_path, caption)` — send chart screenshot
- [ ] N9 — Define all event types: ZONE_TOUCH, TRADE_ENTERED, TP1_HIT, TP2_HIT, SL_HIT, BALANCE_LOW, AGENT_DOWN, DAILY_SUMMARY
- [ ] N10 — Write message templates for each event type
- [ ] N11 — Test Telegram send on real bot

---

## DATABASE — PLATFORM (platform.db)

- [ ] DB1 — Create backend/models/user.py — users table (id, email, wallet_pubkey, risk_mode, created_at)
- [ ] DB2 — Create backend/models/strategy.py — strategies table (id, name, tier, win_rate, monthly_return, status)
- [ ] DB3 — Create backend/models/subscription.py — subscriptions table (user_id, strategy_id, vault_address, status)
- [ ] DB4 — Create backend/models/notification_config.py — notification prefs table
- [ ] DB5 — Write `init_db()` — create all tables if not exist
- [ ] DB6 — Test DB init — all tables created correctly

---

## FASTAPI BACKEND (main.py + routes)

- [ ] FA1 — Create backend/main.py — FastAPI app, CORS, startup/shutdown hooks
- [ ] FA2 — Create backend/routes/strategies.py — GET /strategies, GET /strategies/{id}
- [ ] FA3 — Create backend/routes/subscriptions.py — POST/DELETE /subscriptions
- [ ] FA4 — Create backend/routes/vaults.py — GET /vaults, POST /deposit, POST /withdraw
- [ ] FA5 — Create backend/routes/trades.py — GET /trades, GET /pnl
- [ ] FA6 — Create backend/routes/notifications.py — GET/POST /notifications/config, POST /test
- [ ] FA7 — Create backend/routes/users.py — GET/POST /users/{id}/risk-mode
- [ ] FA8 — Create backend/routes/admin.py — POST /strategies (add new), GET /admin/revenue
- [ ] FA9 — Create backend/routes/agent.py — POST /agent/start, POST /agent/stop, GET /agent/status
- [ ] FA10 — Add JWT validation middleware — verify BetterAuth token on every request
- [ ] FA11 — Add WebSocket endpoint `WS /ws/live` — push live updates to website
- [ ] FA12 — Test GET /strategies returns correct data
- [ ] FA13 — Test POST /subscriptions creates vault record
- [ ] FA14 — Test WS /ws/live delivers price update

---

## DOCKER & DEPLOYMENT (infra/)

- [ ] DO1 — Create infra/docker-compose.yml
- [ ] DO2 — Add FastAPI backend service to docker-compose
- [ ] DO3 — Add sd_zones agent service to docker-compose
- [ ] DO4 — Add SQLite volume mount to docker-compose
- [ ] DO5 — Create Dockerfile for Python agent
- [ ] DO6 — Create Dockerfile for FastAPI backend
- [ ] DO7 — Install Dokploy on EC2 (`curl -sSL https://dokploy.com/install.sh | bash`)
- [ ] DO8 — Configure Traefik routing in Dokploy (`api.tradelikeme.xyz` → FastAPI)
- [ ] DO9 — Deploy via Dokploy — all services running
- [ ] DO10 — Verify auto-SSL cert issued for api.tradelikeme.xyz

---

## END-TO-END TESTING (devnet)

- [ ] ET1 — Full flow test: deposit USDC into vault on devnet
- [ ] ET2 — Full flow test: agent detects zone, enters trade on Raydium devnet
- [ ] ET3 — Full flow test: sentinel fires TP1 hit, agent moves SL to entry
- [ ] ET4 — Full flow test: sentinel fires 30m body-close SL, agent closes position
- [ ] ET5 — Full flow test: settle_epoch() runs, 20% goes to platform wallet on-chain
- [ ] ET6 — Full flow test: user calls withdraw(), receives 80% share
- [ ] ET7 — Test Telegram notification received on all 9 event types
- [ ] ET9 — Test 2 simultaneous strategies — verify zero overlap in state/positions
- [ ] ET10 — Test MIN_BALANCE gate — trading stops below threshold

---

## COLOSSEUM SUBMISSION

- [ ] CS1 — Record demo video (~90 seconds)
- [ ] CS2 — Write project description for Colosseum submission form
- [ ] CS3 — Screenshot strategy dashboard with 89% win rate visible
- [ ] CS4 — Screenshot Phantom Connect sign-in flow
- [ ] CS5 — Screenshot vault deposit + delegation on devnet
- [ ] CS6 — Submit on colosseum.com before May 11, 2026

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
