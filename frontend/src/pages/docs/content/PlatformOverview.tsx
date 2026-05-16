import { DocPage, DocSection, DocBadge, DocH1, DocH2, DocH3, DocP, DocUl, DocDivider, DocCallout, DocTable } from '../DocComponents'

export default function PlatformOverview() {
  return (
    <DocPage>
      <DocSection>
        <DocBadge>Platform</DocBadge>
        <DocH1>Platform Overview</DocH1>
        <DocP>
          TradeLikeMe is a verified-strategy trading marketplace. Users deposit funds, a proven automated agent trades on their behalf, and profits are split automatically. No subscriptions. No fixed fees. You only pay when you earn.
        </DocP>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>The problem we solve</DocH2>
        <DocP>
          Over 43 "AI trading" projects have been launched on Solana. Every single one claims their AI picks trades — none show verified win rates, live P&L, or real risk rules. Users deposit into black boxes with no accountability.
        </DocP>
        <DocUl items={[
          'No proven results — demos only, no live trading history',
          'No defined strategy — "AI picks trades" is not a strategy',
          'No risk management — leverage, margin, and SL rules undocumented',
          'Copy trading exposes the strategy and requires manual work from traders',
        ]} />
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Two modes, one platform</DocH2>
        <DocP>Every user chooses how they want to connect. Both modes use the same verified agent brain.</DocP>
        <DocTable
          headers={['Mode', 'How it works', 'Best for']}
          rows={[
            ['Mode A — Solana Vault', 'Deposit USDC or CASH into a Drift vault. Delegate trade authority via Phantom. Agent trades on your behalf — can never withdraw.', 'DeFi-native users, Phantom wallet holders'],
            ['Mode B — CEX API', 'Paste a trade-only API key from WEEX, Bybit, or Binance. Agent routes trades to the right exchange.', 'Web2 users, existing CEX accounts'],
          ]}
        />
        <DocCallout type="success">
          Both modes use the same strategy, the same agent, and the same risk rules. The only difference is where your funds sit and how the agent executes.
        </DocCallout>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Our edge</DocH2>
        <DocUl items={[
          'Proven win rate — verified on TradingView charts, growing sample',
          'Human-cloned strategy — exact rules from a real profitable trader, not AI guessing',
          'Body-close stop loss — wicks past SL are ignored (70% wick survival rate)',
          'Multi-timeframe analysis — 7 timeframes from monthly down to 15-minute',
          'Structural risk management — zone-based TP, 0.5% margin, max 2 concurrent positions',
        ]} />
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Business model</DocH2>
        <DocP>Two revenue streams, both performance-based.</DocP>

        <DocH3>Stream 1 — Our strategy (20% profit share)</DocH3>
        <DocP>User keeps 80%. We earn only when they earn. No fees on principal, no monthly subscription.</DocP>
        <DocTable
          headers={['Deposit', 'Monthly return (8%)', 'User keeps (80%)', 'Platform earns (20%)']}
          rows={[
            ['$10,000', '$800', '$640', '$160'],
            ['$100,000', '$8,000', '$6,400', '$1,600'],
            ['$500,000', '$40,000', '$32,000', '$8,000'],
          ]}
        />

        <DocH3>Stream 2 — Marketplace (30% of trader fee)</DocH3>
        <DocP>External traders submit strategies. We verify them, build the agent, and list them. Fee tier is set by win rate.</DocP>
        <DocTable
          headers={['Grade', 'Win rate', 'Total fee', 'Trader gets', 'Platform gets', 'User keeps']}
          rows={[
            ['S-tier', '85%+', '15%', '10.5%', '4.5%', '85%'],
            ['A-tier', '75–84%', '12%', '8.4%', '3.6%', '88%'],
            ['B-tier', '65–74%', '10%', '7.0%', '3.0%', '90%'],
            ['C-tier', '55–64%', '8%', '5.6%', '2.4%', '92%'],
            ['Below 55%', '—', 'Rejected', '—', '—', '—'],
          ]}
        />
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>What this documentation covers</DocH2>
        <DocUl items={[
          'For Investors — how to get started, deposit, manage risk, read your dashboard',
          'For Traders — how to submit and monetise your strategy',
          'Platform — how the agent, sentinel, and vault work under the hood',
        ]} />
        <DocCallout type="info">
          Strategy rules are proprietary and not published in these docs. The agent architecture section explains how the system works at a high level without exposing the edge.
        </DocCallout>
      </DocSection>
    </DocPage>
  )
}
