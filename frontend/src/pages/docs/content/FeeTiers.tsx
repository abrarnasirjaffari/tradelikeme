import { DocPage, DocSection, DocBadge, DocH1, DocH2, DocP, DocUl, DocDivider, DocCallout, DocTable } from '../DocComponents'

export default function FeeTiers() {
  return (
    <DocPage>
      <DocSection>
        <DocBadge color="#22C55E">Traders</DocBadge>
        <DocH1>Fee Tiers & Earnings</DocH1>
        <DocP>
          Your fee tier is determined by your verified win rate. Higher win rate means a higher fee percentage — and since users keep more at lower tiers, every tier attracts users.
        </DocP>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Fee structure</DocH2>
        <DocTable
          headers={['Grade', 'Win rate', 'Total fee', 'You earn (70%)', 'Platform earns (30%)', 'User keeps']}
          rows={[
            ['S-tier', '85%+', '15%', '10.5%', '4.5%', '85%'],
            ['A-tier', '75–84%', '12%', '8.4%', '3.6%', '88%'],
            ['B-tier', '65–74%', '10%', '7.0%', '3.0%', '90%'],
            ['C-tier', '55–64%', '8%', '5.6%', '2.4%', '92%'],
          ]}
        />
        <DocCallout type="info">
          The fee is applied to profits only — not to user deposits. If a user's balance doesn't grow, no fee is charged.
        </DocCallout>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Earnings examples</DocH2>
        <DocTable
          headers={['Tier', 'User deposits', 'Monthly profit (8%)', 'Your earnings']}
          rows={[
            ['C-tier (5.6%)', '$100,000', '$8,000', '$448/mo'],
            ['B-tier (7.0%)', '$100,000', '$8,000', '$560/mo'],
            ['A-tier (8.4%)', '$100,000', '$8,000', '$672/mo'],
            ['S-tier (10.5%)', '$100,000', '$8,000', '$840/mo'],
            ['S-tier (10.5%)', '$1,000,000', '$80,000', '$8,400/mo'],
            ['S-tier (10.5%)', '$2,000,000', '$160,000', '$16,800/mo'],
          ]}
        />
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Tier reviews</DocH2>
        <DocUl items={[
          'Tier is reviewed every 30 days based on the trailing 90-day win rate',
          'If win rate crosses a tier boundary, fee adjusts on the next epoch',
          'Tier upgrades apply immediately to new deposits',
          'Tier downgrades apply immediately — users and platform adjust',
          'If win rate drops below 55%, strategy is suspended pending review',
        ]} />
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Payment</DocH2>
        <DocUl items={[
          'Earnings paid monthly on the 5th of each month',
          'Payment in USDT to your specified wallet address',
          'Minimum payout: $10 (smaller amounts accumulate)',
          'Payment receipt emailed with full breakdown',
        ]} />
        <DocCallout type="success">
          Your earnings are calculated and paid automatically — no manual invoicing, no chasing. The profit tracker records every trade and calculates your share at epoch close.
        </DocCallout>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>No earnings on losses</DocH2>
        <DocP>
          If a user's monthly P&L is flat or negative, you earn nothing from that user that month. The fee is performance-only. This aligns your incentives directly with user success.
        </DocP>
      </DocSection>
    </DocPage>
  )
}
