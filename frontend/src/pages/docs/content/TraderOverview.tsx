import { DocPage, DocSection, DocBadge, DocH1, DocH2, DocP, DocUl, DocDivider, DocCallout, DocTable } from '../DocComponents'

export default function TraderOverview() {
  return (
    <DocPage>
      <DocSection>
        <DocBadge color="#22C55E">Traders</DocBadge>
        <DocH1>Trader Overview</DocH1>
        <DocP>
          TradeLikeMe turns your trading strategy into a 24/7 automated agent. Users deposit into your strategy. You earn a percentage of all profits generated — automatically, every month, with zero trading hours and zero capital at risk.
        </DocP>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>The trader proposition</DocH2>
        <DocP>
          Right now, you trade 8–12 hours a day. Your income stops when you stop. Your returns are limited by your own capital. With TradeLikeMe:
        </DocP>
        <DocUl items={[
          'You trade zero hours — the agent runs your rules 24/7',
          'Your income scales with user deposits, not your own capital',
          'You risk zero of your own money',
          'Your strategy stays private — users see performance, not rules',
        ]} />
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Example earnings</DocH2>
        <DocTable
          headers={['Your tier', 'User deposits', 'Monthly return (8%)', 'Your fee', 'Your monthly earnings']}
          rows={[
            ['B-tier (10%)', '$100,000', '$8,000', '7%', '$560'],
            ['B-tier (10%)', '$500,000', '$40,000', '7%', '$2,800'],
            ['A-tier (12%)', '$500,000', '$40,000', '8.4%', '$3,360'],
            ['S-tier (15%)', '$1,000,000', '$80,000', '10.5%', '$8,400'],
          ]}
        />
        <DocCallout type="info">
          Your fee is the trader's portion of the total strategy fee. See Fee Tiers for the full breakdown.
        </DocCallout>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>How it works end-to-end</DocH2>
        <DocUl items={[
          '1. You submit your strategy rules (entry, exit, SL, TP, coins, timeframes)',
          '2. We verify your track record — 50+ trades, 55%+ win rate minimum, on-chart verification',
          '3. We build your agent — you review it, we do the coding',
          '4. 2-week paper trial on devnet — you approve before going live',
          '5. Strategy lists on the marketplace with your verified win rate badge',
          '6. Users deposit and follow your strategy',
          '7. Agent runs 24/7 — you earn automatically each month',
        ]} />
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Your strategy stays private</DocH2>
        <DocCallout type="success">
          Unlike copy trading, your entry rules, zones, indicators, and parameters are never shown to users. Users see win rate, return history, and trade P&L — not your strategy logic. Your edge is protected.
        </DocCallout>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>What we need from you</DocH2>
        <DocUl items={[
          'Clear written rules — every condition that triggers an entry must be explicit',
          'Track record documentation — trade history we can verify on charts',
          '30 minutes for a verification call',
          '2 weeks to review the devnet paper trial',
          'Ongoing feedback — if market conditions change your rules, you notify us',
        ]} />
        <DocP>That's it. We handle everything else — building the agent, hosting it, managing users, profit settlement.</DocP>
      </DocSection>
    </DocPage>
  )
}
