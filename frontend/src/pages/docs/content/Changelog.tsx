import { DocPage, DocSection, DocBadge, DocH1, DocH2, DocH3, DocP, DocUl, DocDivider, DocCallout } from '../DocComponents'

export default function Changelog() {
  return (
    <DocPage>
      <DocSection>
        <DocBadge>Platform</DocBadge>
        <DocH1>Changelog</DocH1>
        <DocP>Platform updates, new features, and strategy rule changes. Most recent first.</DocP>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>v0.1.0 — April 30, 2026</DocH2>
        <DocH3>Initial platform release</DocH3>
        <DocUl items={[
          'Docs site launched',
          'Waitlist live at tradelikeme.xyz',
          'Anchor vault program deployed to Solana devnet',
          'KLineChart Pro self-hosted chart server operational on EC2',
          'Telegram bot (@tradelikeme_alerts_bot) live',
          'BetterAuth session management configured',
          'Helius RPC integrated',
        ]} />
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Strategy rules — April 2026</DocH2>
        <DocH3>Rule A — BTC 1D gate (added April 16)</DocH3>
        <DocP>
          No alt-coin entries when BTC daily structure is against trade direction. Triggered after XRP and SUI SL hits — both caused by BTC being in active recovery (7 consecutive green daily closes) at entry time.
        </DocP>

        <DocH3>Rule B — 1D zone confirmation (added April 16)</DocH3>
        <DocP>
          Any entry must have a confirmed zone on the daily timeframe. Lower-timeframe zone setups without 1D backing are scalp-grade only (Grade C or D).
        </DocP>

        <DocH3>Rule C — Near lows/highs filter (added April 16)</DocH3>
        <DocP>
          No short entries when coin is near a 3-month low. No long entries when coin is near a 3-month high. Context zones only.
        </DocP>

        <DocH3>Body-close SL verified live (April 16)</DocH3>
        <DocP>
          AAVE trade: wick to $85.05 (below $86 SL), body closed at $86.34. Trade continued. Final result +2192%. Body-close rule confirmed as core edge.
        </DocP>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Upcoming</DocH2>
        <DocCallout type="info">
          Items below are planned for future releases and are not yet live.
        </DocCallout>
        <DocUl items={[
          'Mainnet Drift vault deployment',
          'Mode B: Bybit and Binance CEX clients',
          'FastAPI backend and dashboard',
          'WhatsApp notifications via Twilio',
          'Strategy marketplace (open for trader applications)',
          'Backtesting pipeline and verification dashboard',
        ]} />
      </DocSection>
    </DocPage>
  )
}
