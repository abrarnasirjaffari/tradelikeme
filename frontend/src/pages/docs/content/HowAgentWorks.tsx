import { DocPage, DocSection, DocBadge, DocH1, DocH2, DocP, DocUl, DocDivider, DocCallout, DocTable, DocCodeBlock } from '../DocComponents'

export default function HowAgentWorks() {
  return (
    <DocPage>
      <DocSection>
        <DocBadge>Platform</DocBadge>
        <DocH1>How the Agent Works</DocH1>
        <DocP>
          The TradeLikeMe agent is a Python asyncio process that runs 24/7 on AWS EC2. It scans markets, identifies trade setups, executes orders, and monitors positions — all without human input. This page explains the architecture at a high level.
        </DocP>
        <DocCallout type="info">
          The specific entry/exit rules, zone identification logic, and strategy parameters are proprietary and not documented here. This page covers the system architecture only.
        </DocCallout>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Core components</DocH2>
        <DocTable
          headers={['Component', 'File', 'Role']}
          rows={[
            ['Orchestrator', 'loop.py', 'Entry scanner (WebSocket tick), zone refresh every 4H, compound every 72H'],
            ['Trade monitor', 'trade_agent.py', 'Per-trade lifecycle — TP1, TP2, body-close SL, break-even move'],
            ['Sentinel', 'sentinel.py', 'Zero-token WebSocket price watcher. Wakes agent on events only.'],
            ['Zone scanner', 'zones.py', 'Multi-timeframe zone identification via KLineChart + Claude Opus 4.6'],
            ['State', 'state.py', 'In-memory runtime state (positions, watchlist, scan timestamps)'],
            ['Journal', 'journal.py', 'SQLite persistence — trades, P&L, epochs'],
          ]}
        />
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Trade lifecycle</DocH2>
        <DocP>Every trade goes through the same sequence:</DocP>
        <DocUl items={[
          '1. Zone scanner identifies a valid Supply/Demand zone across 7 timeframes',
          '2. Setup added to sentinel watchlist — agent goes idle, burns zero AI tokens',
          '3. Sentinel detects price touching the zone via WebSocket',
          '4. Agent wakes — places 4 exchange orders simultaneously (market entry, TP1, TP2, disaster SL)',
          '5. Sentinel watches for TP1 hit',
          '6. On TP1 hit — agent wakes, moves SL to break-even entry price',
          '7. Sentinel continues watching. On 30-minute body close below SL — agent closes position',
          '8. Trade closed, journal updated, agent returns to idle',
        ]} />
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Zone scanning pipeline</DocH2>
        <DocP>
          The agent uses KLineChart Pro — a self-hosted charting engine — to render candlestick charts with indicators. Playwright takes screenshots of each timeframe. Claude Opus 4.6 (via AWS Bedrock) analyzes the screenshots and identifies Supply/Demand zones.
        </DocP>
        <DocUl items={[
          'Primary: KLineChart Pro + Playwright (headless, EC2)',
          'Fallback: TradingView MCP (triggered on chart server timeout)',
          'Timeframes scanned: 1M, 1W, 1D, 4H, 1H, 30M, 15M',
          '4H zone gate — lower-timeframe zones require a 4H zone within ±5%',
        ]} />
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Exchange layer</DocH2>
        <DocP>
          All exchange clients implement a common abstract interface. The agent brain calls the same methods regardless of whether it's trading on Solana or a CEX.
        </DocP>
        <DocTable
          headers={['Method', 'Description']}
          rows={[
            ['open_position(symbol, side, qty)', 'Place a market order'],
            ['close_position(symbol)', 'Close full position at market'],
            ['place_tp_sl(order_id, tp, sl)', 'Place take-profit and stop-loss orders'],
            ['modify_sl(order_id, new_sl)', 'Move stop-loss (used on TP1 hit)'],
            ['get_position(symbol)', 'Fetch current open position'],
            ['get_balance()', 'Fetch available balance'],
          ]}
        />
        <DocCallout type="info">
          Mode A (Solana) routes through Raydium Perps → Jupiter Perps as fallback. Mode B (CEX) routes to WEEX, Bybit, or Binance based on coin availability.
        </DocCallout>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Safety constraints</DocH2>
        <DocUl items={[
          'MAX_AT_RISK_SLOTS = 2 — never more than 2 concurrent open positions',
          'MIN_BALANCE = $35 — agent stops trading if balance falls below floor',
          '0.5% margin per trade — position sizing is fixed, not variable',
          'Entries blocked on startup until full zone scan completes (~40 min)',
          'Agent never restarts with open positions — causes duplicate order prevention',
          'BTC 1D gate — no alt entries if BTC macro is against trade direction',
        ]} />
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Multi-strategy isolation</DocH2>
        <DocP>Each strategy on the marketplace runs in complete isolation:</DocP>
        <DocCodeBlock label="Container layout">{`tradelikeme/
├── strategy_sd/          ← S/D Zone strategy (our strategy)
│   ├── agent process     ← own Python asyncio process
│   ├── strategy_sd.db    ← own SQLite database
│   └── docker container  ← own Docker container
│
├── strategy_b/           ← future marketplace strategy
│   ├── agent process
│   ├── strategy_b.db
│   └── docker container`}</DocCodeBlock>
        <DocP>FastAPI routes requests by strategy_id and user_id. Zero cross-strategy data access.</DocP>
      </DocSection>
    </DocPage>
  )
}
