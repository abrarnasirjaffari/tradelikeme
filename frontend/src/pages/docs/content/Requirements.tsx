import { DocPage, DocSection, DocBadge, DocH1, DocH2, DocP, DocUl, DocDivider, DocCallout, DocTable } from '../DocComponents'

export default function Requirements() {
  return (
    <DocPage>
      <DocSection>
        <DocBadge color="#22C55E">Traders</DocBadge>
        <DocH1>Requirements & Eligibility</DocH1>
        <DocP>
          TradeLikeMe only accepts strategies that have been verified to work in real market conditions. These requirements exist to protect users — and to maintain the platform's credibility.
        </DocP>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Minimum requirements</DocH2>
        <DocTable
          headers={['Requirement', 'Detail']}
          rows={[
            ['Trade count', '50+ verified trades (no exceptions)'],
            ['Win rate', '55%+ minimum for C-tier listing'],
            ['Verification method', 'On-chart verification via TradingView — no screenshots, no spreadsheets'],
            ['Rule clarity', 'Every entry/exit condition must be explicit and unambiguous'],
            ['Strategy type', 'Any style — price action, S/D zones, indicators, breakout, all accepted'],
            ['Asset class', 'Crypto perpetuals only (Phase 1). Forex and equities on hold.'],
          ]}
        />
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>What counts as a verified trade</DocH2>
        <DocUl items={[
          'Entry and exit are visible on a TradingView chart',
          'Trade was placed based on your stated rules (not ad hoc)',
          'P&L is calculable from chart data',
          'Minimum 1H timeframe for chart verification',
        ]} />
        <DocCallout type="warning">
          Trades that cannot be verified on charts — exchange-only records with no chart evidence — do not count toward the 50-trade requirement. This prevents fabricated track records.
        </DocCallout>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Strategy requirements</DocH2>
        <DocP>Your written rules must cover:</DocP>
        <DocUl items={[
          'Entry conditions — exact setup that triggers an entry',
          'Direction logic — what determines long vs short',
          'Stop loss placement — exact rule for SL level, not a fixed percentage',
          'Take profit targets — TP1 and TP2 levels with zone logic',
          'Timeframes used — primary and execution timeframes',
          'Coins/markets traded — which assets and why',
          'Filters and gates — what conditions prevent an entry',
          'Risk mode parameters — leverage and margin for each of the 3 risk modes',
        ]} />
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Automatic disqualifiers</DocH2>
        <DocUl items={[
          'Win rate below 55%',
          'Fewer than 50 verified trades',
          'Rules that require real-time judgment calls that cannot be codified',
          'Strategies that rely on unverifiable signals (proprietary data, non-public feeds)',
          'Martingale or averaging-down strategies with unlimited risk',
          'Strategies from sanctioned jurisdictions',
        ]} />
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Re-application</DocH2>
        <DocP>
          If your application is rejected, you can re-apply after 60 days with an updated track record. The rejection reason is provided in detail — we don't reject without explanation.
        </DocP>
      </DocSection>
    </DocPage>
  )
}
