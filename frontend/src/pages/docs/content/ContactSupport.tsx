import { DocPage, DocSection, DocBadge, DocH1, DocH2, DocP, DocUl, DocDivider, DocCallout } from '../DocComponents'

export default function ContactSupport() {
  return (
    <DocPage>
      <DocSection>
        <DocBadge>Platform</DocBadge>
        <DocH1>Contact & Support</DocH1>
        <DocP>Get help with your account, report issues, or reach out to the team.</DocP>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>General support</DocH2>
        <DocP>
          For account questions, deposit/withdrawal issues, or platform help — email us at support@tradelikeme.xyz. We aim to respond within 24 hours on business days.
        </DocP>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Security issues</DocH2>
        <DocP>
          Report security vulnerabilities to security@tradelikeme.xyz. Do not disclose publicly before we have had a chance to address it. We respond within 48 hours.
        </DocP>
        <DocCallout type="warning">
          Never share your API keys, private keys, or wallet seed phrase with anyone — including TradeLikeMe support. We will never ask for these.
        </DocCallout>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Trader applications</DocH2>
        <DocP>
          To submit your strategy for marketplace listing — email traders@tradelikeme.xyz with the subject line "Strategy Submission". Include your approximate win rate, number of verified trades, and a brief description of your approach.
        </DocP>
        <DocUl items={[
          'We review every submission manually',
          'If your strategy meets requirements, we will schedule a 30-minute verification call',
          'Timeline from submission to listing: approximately 3 weeks',
        ]} />
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Investor inquiries</DocH2>
        <DocP>
          For institutional or large-deposit inquiries — email invest@tradelikeme.xyz. We can discuss custom risk modes and direct onboarding.
        </DocP>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Privacy & data</DocH2>
        <DocP>
          For data deletion, access requests, or privacy policy questions — email privacy@tradelikeme.xyz. See our Privacy Policy for full details.
        </DocP>
      </DocSection>
    </DocPage>
  )
}
