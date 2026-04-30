import { DocPage, DocSection, DocBadge, DocH1, DocH2, DocP, DocUl, DocDivider, DocCallout, DocTable } from '../DocComponents'

export default function DevnetTrial() {
  return (
    <DocPage>
      <DocSection>
        <DocBadge color="#22C55E">Traders</DocBadge>
        <DocH1>Devnet Paper Trial</DocH1>
        <DocP>
          Before your strategy goes live, the agent runs for 2 weeks on Solana devnet — real market conditions, real zones, real timing, but simulated money. You monitor every trade and must approve the trial before mainnet deployment.
        </DocP>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>What devnet trial means</DocH2>
        <DocUl items={[
          'Agent runs your strategy in live market conditions',
          'All orders execute on Solana devnet (free testnet tokens)',
          'Zone scanning uses real price data from production feeds',
          'Trade decisions are made exactly as they would be on mainnet',
          'P&L is simulated — no real money at risk',
        ]} />
        <DocCallout type="info">
          Devnet trial is not a backtest. It runs forward in real time with real tick data. The only difference from mainnet is that orders settle on devnet rather than real money markets.
        </DocCallout>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>What you monitor</DocH2>
        <DocUl items={[
          'Every trade entry — does it match your rules?',
          'Every trade exit — TP hit, SL hit, or body-close triggered correctly?',
          'Trades the agent did NOT take — were valid setups correctly ignored?',
          'Agent behavior at rule boundaries — does it handle edge cases correctly?',
          'Telegram notifications — are alerts clear and timely?',
        ]} />
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Pass/fail criteria</DocH2>
        <DocTable
          headers={['Criteria', 'Pass', 'Fail']}
          rows={[
            ['Rule adherence', 'All entries match written rules', 'Any entry that violates stated conditions'],
            ['Exit logic', 'TP/SL/body-close triggers correctly', 'Wrong exit level or missed exit'],
            ['False entries', '0 entries on clearly invalid setups', 'Any entry on a setup that fails your gates'],
            ['Missed entries', 'Valid setups entered within 1 candle', 'Consistent misses on qualifying setups'],
          ]}
        />
        <DocCallout type="warning">
          A single critical failure (entry against stated rules, missed SL) requires rebuilding and restarting the trial. This is deliberate — live user money depends on the agent doing exactly what you specified.
        </DocCallout>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Timeline</DocH2>
        <DocUl items={[
          'Day 1: Agent deployed to devnet, begins scanning',
          'Days 1–14: You monitor daily via Telegram and dashboard',
          'Day 14: Review call — walk through every trade',
          'Pass: we schedule mainnet deployment for the following week',
          'Fail: we identify root cause, fix, restart 2-week trial',
        ]} />
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Your responsibilities during trial</DocH2>
        <DocUl items={[
          'Check Telegram alerts at least once per day',
          'Flag any trade that feels wrong immediately — don\'t wait until the review call',
          'Be available for a 30-minute mid-trial check-in (Day 7)',
          'Complete the final Day 14 review call',
        ]} />
      </DocSection>
    </DocPage>
  )
}
