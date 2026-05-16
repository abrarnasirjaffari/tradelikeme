import { DocPage, DocSection, DocBadge, DocH1, DocH2, DocP, DocUl, DocDivider, DocCallout, DocTable } from '../DocComponents'

export default function RiskModes() {
  return (
    <DocPage>
      <DocSection>
        <DocBadge color="#0052FF">Investors</DocBadge>
        <DocH1>Risk Modes</DocH1>
        <DocP>
          You do not choose leverage or margin manually. Instead, you select one of three risk presets. The trader who submitted the strategy defines the exact parameters for each mode — you just pick the level that fits your risk tolerance.
        </DocP>
        <DocCallout type="info">
          Risk modes are designed to give you meaningful control without requiring trading knowledge. Conservative suits large deposits and new users; Aggressive suits smaller deposits and risk-tolerant users.
        </DocCallout>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>The three modes</DocH2>
        <DocTable
          headers={['Mode', 'Leverage', 'Margin per trade', 'Buffer before liquidation', 'Best for']}
          rows={[
            ['Conservative', '50–100x', '0.25%–0.5%', '20+ trades', 'Large deposits, new users, lower risk tolerance'],
            ['Medium', '50–200x', '0.5%–1%', '8–10 trades', 'Experienced users, balanced risk/reward'],
            ['Aggressive', '50–300x', '1%–2%', '4–5 trades', 'Risk-tolerant users, smaller deposits, faster compounding'],
          ]}
        />
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>What "buffer" means</DocH2>
        <DocP>
          The buffer is the number of consecutive full losses your balance can absorb before approaching the $35 minimum floor. With a proven win rate, consecutive losses are rare — but the buffer gives you a safety margin for drawdown periods.
        </DocP>
        <DocUl items={[
          'Conservative (20+ buffer): extremely unlikely to hit the floor in any realistic drawdown',
          'Medium (8–10 buffer): sufficient for normal market conditions and strategy variance',
          'Aggressive (4–5 buffer): requires close monitoring during extended losing streaks',
        ]} />
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Changing your risk mode</DocH2>
        <DocP>
          You can change your risk mode from the dashboard at any time. Changes take effect on the next trade entry. Open positions are not affected.
        </DocP>
        <DocCallout type="warning">
          Switching from Conservative to Aggressive mid-drawdown increases exposure at the worst time. Risk mode changes are best made during periods of stable account performance.
        </DocCallout>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Our strategy's default mode</DocH2>
        <DocP>
          TradeLikeMe's native strategy (S/D Zone) uses the following parameters in each mode:
        </DocP>
        <DocTable
          headers={['Mode', 'Leverage', 'Margin per trade']}
          rows={[
            ['Conservative', '50x CROSS', '0.25%'],
            ['Medium', '100x CROSS', '0.5%'],
            ['Aggressive', '200x CROSS', '1%'],
          ]}
        />
        <DocP>
          Marketplace strategies define their own parameters per mode. These are visible on the strategy listing page before you follow.
        </DocP>
      </DocSection>
    </DocPage>
  )
}
