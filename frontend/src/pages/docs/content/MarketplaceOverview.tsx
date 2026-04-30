import { DocPage, DocSection, DocBadge, DocH1, DocH2, DocP, DocUl, DocDivider, DocCallout, DocTable } from '../DocComponents'

export default function MarketplaceOverview() {
  return (
    <DocPage>
      <DocSection>
        <DocBadge>Platform</DocBadge>
        <DocH1>Marketplace Overview</DocH1>
        <DocP>
          The TradeLikeMe marketplace lets verified external traders list their strategies alongside ours. Users browse strategies, see live win rates and P&L, and subscribe. Traders earn a percentage of profits generated — passively, with zero capital at risk.
        </DocP>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>How it works</DocH2>
        <DocUl items={[
          'Traders submit their strategy rules — entry, exit, SL, TP, coins, timeframes',
          'We verify the track record (50+ trades, 55%+ win rate minimum)',
          'If approved, we build and run the agent instance ourselves',
          'The strategy lists on the marketplace with a live win rate badge',
          'Users deposit and follow the strategy',
          'Profits are split automatically each month — user keeps majority, trader earns a fee cut',
        ]} />
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Fee tiers</DocH2>
        <DocP>Fee tier is determined by verified win rate. Higher win rate = higher fee = trader earns more.</DocP>
        <DocTable
          headers={['Grade', 'Win rate', 'Total fee charged', 'Trader earns', 'Platform earns', 'User keeps']}
          rows={[
            ['S-tier', '85%+', '15%', '10.5%', '4.5%', '85%'],
            ['A-tier', '75–84%', '12%', '8.4%', '3.6%', '88%'],
            ['B-tier', '65–74%', '10%', '7.0%', '3.0%', '90%'],
            ['C-tier', '55–64%', '8%', '5.6%', '2.4%', '92%'],
            ['Below 55%', '—', 'Rejected', '—', '—', '—'],
          ]}
        />
        <DocCallout type="info">
          Fee tiers are reviewed every 30 days. If a strategy's win rate crosses a tier boundary, the fee adjusts automatically on the next epoch.
        </DocCallout>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Why traders join</DocH2>
        <DocP>
          A trader making $5,000/month from their own $50,000 capital works 8–12 hours per day. Their income stops the moment they stop. With TradeLikeMe:
        </DocP>
        <DocUl items={[
          'Zero trading hours — the agent runs their strategy 24/7',
          'Zero capital at risk — they trade nothing of their own money',
          'Income scales with user deposits, not their own capital',
          'Example: B-tier, $500k user deposits = $3,500/month for zero work',
          'At $2M user deposits = $14,000/month passively',
        ]} />
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Strategy privacy</DocH2>
        <DocCallout type="success">
          Unlike copy trading platforms, your strategy rules are never exposed to users. Users see performance stats — win rate, return %, trade history — but not your entry logic, zones, or indicators. Your edge stays yours.
        </DocCallout>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Listing requirements</DocH2>
        <DocUl items={[
          '50+ verified trades (no screenshots — we verify on charts)',
          '55%+ win rate minimum',
          'Clear written rules — entry, exit, SL, TP must be explicit',
          'TradingView verification call with our team',
          'Strategy interview — 30-minute call',
          '2-week paper trial on devnet before going live',
        ]} />
        <DocP>
          See the Trader docs section for the full submission process.
        </DocP>
      </DocSection>
    </DocPage>
  )
}
