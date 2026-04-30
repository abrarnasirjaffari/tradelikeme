import { DocPage, DocSection, DocBadge, DocH1, DocH2, DocP, DocUl, DocDivider, DocCallout } from '../DocComponents'

export default function BuildAgent() {
  return (
    <DocPage>
      <DocSection>
        <DocBadge color="#22C55E">Traders</DocBadge>
        <DocH1>How We Build Your Agent</DocH1>
        <DocP>
          You provide the rules. We write the code. You don't need to touch a line of Python — our team handles the full implementation, and you review and approve the result before it goes live.
        </DocP>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>What we build</DocH2>
        <DocUl items={[
          'A Python asyncio agent process for your specific strategy',
          'A zone scanner configured for your timeframes and entry logic',
          'A sentinel configured for your TP1, TP2, and SL levels',
          'An isolated SQLite database for your strategy\'s trade journal',
          'A Docker container that runs independently on EC2',
          'Telegram notification integration with your strategy\'s event labels',
        ]} />
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>What you provide</DocH2>
        <DocUl items={[
          'Your written strategy document (from the submission process)',
          'Answers to our clarification questions during build',
          'Review and approval of each build iteration',
          'Final sign-off before devnet deployment',
        ]} />
        <DocCallout type="info">
          Expect 3–5 clarification questions per build round. We usually need edge cases spelled out — "what if price is at the zone but BTC is moving against?" etc.
        </DocCallout>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>The build process</DocH2>
        <DocUl items={[
          '1. We read your strategy document and break it into discrete conditions',
          '2. We code the entry scanner (zone identification + confirmation gates)',
          '3. We code the trade monitor (TP1, TP2, body-close SL, break-even)',
          '4. We configure the sentinel with your specific levels',
          '5. We run a simulated backtest on 30 days of data',
          '6. You review the simulation — every trade, entry reason, exit reason',
          '7. We adjust based on your feedback',
          '8. Final build delivered for devnet trial',
        ]} />
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Your strategy IP remains yours</DocH2>
        <DocCallout type="success">
          The agent code we write is specific to your strategy, but the strategy rules themselves remain your intellectual property. We do not share, sell, or reuse your rules for any other agent. Your edge stays yours.
        </DocCallout>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Strategy updates</DocH2>
        <DocP>
          If you refine your rules after the agent goes live, contact us at traders@tradelikeme.xyz. We will rebuild the relevant components, run another devnet trial, and deploy the update. Minor updates (threshold changes) typically take 1–2 days. Major logic changes require a new devnet trial.
        </DocP>
      </DocSection>
    </DocPage>
  )
}
