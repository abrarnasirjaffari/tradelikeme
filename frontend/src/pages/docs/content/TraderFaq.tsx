import { DocPage, DocSection, DocBadge, DocH1, DocH2, DocP, DocDivider } from '../DocComponents'

const faqs = [
  {
    q: 'Do I need to know how to code?',
    a: 'No. You provide the rules in plain language. Our team handles all the Python code. You review behavior, not code.',
  },
  {
    q: 'Do I need to put in any capital?',
    a: 'No capital from you, ever. Users deposit their own funds. You earn from user profits without risking a single dollar of your own money.',
  },
  {
    q: 'What if my strategy has a losing month?',
    a: 'You earn nothing that month from users who lost money. The fee is performance-only — it only applies to profitable epochs. Your listing remains active and continues running.',
  },
  {
    q: 'Can I list more than one strategy?',
    a: 'Yes, after your first strategy has been live for at least 60 days with consistent performance. Each strategy goes through the full verification and devnet trial process independently.',
  },
  {
    q: 'What if my win rate drops below 55%?',
    a: 'Your strategy is suspended and we contact you for a review. If the drop is temporary and market-condition-related, we may resume after a 2-week paper trial showing recovery. If the drop is structural, the listing closes.',
  },
  {
    q: 'Can I see which users are following my strategy?',
    a: 'No. User privacy is protected — you see aggregate AUM and aggregate P&L only. Individual user balances and identities are not disclosed.',
  },
  {
    q: 'How quickly does my tier change if my win rate improves?',
    a: 'Tier reviews happen every 30 days on the trailing 90-day window. If your win rate crosses a tier boundary, the new tier applies on the next epoch.',
  },
  {
    q: 'What if users lose money and blame my strategy?',
    a: 'Users agree to our terms of service before depositing, which include full risk disclosure. Trading involves risk — past performance does not guarantee future results. Users are warned of this explicitly during onboarding.',
  },
  {
    q: 'Can users see my strategy rules?',
    a: 'Never. Users see performance metrics only — win rate, return history, trade P&L without entry logic. Your rules, zones, indicators, and parameters are never disclosed.',
  },
  {
    q: 'What happens if TradeLikeMe shuts down?',
    a: 'Your strategy is your IP — you can take your rules and trade them yourself. Users in Mode A can withdraw directly from Drift. We would provide 60 days notice before any shutdown.',
  },
  {
    q: 'Can I restrict which countries my strategy is available to?',
    a: 'Not currently. TradeLikeMe complies with standard financial regulations — users from sanctioned jurisdictions are blocked at the platform level, regardless of strategy.',
  },
]

export default function TraderFaq() {
  return (
    <DocPage>
      <DocSection>
        <DocBadge color="#22C55E">Traders</DocBadge>
        <DocH1>Trader FAQ</DocH1>
        <DocP>Common questions from traders considering or already on the marketplace.</DocP>
      </DocSection>

      <DocDivider />

      {faqs.map((faq, i) => (
        <div key={i}>
          <DocSection>
            <DocH2>{faq.q}</DocH2>
            <DocP>{faq.a}</DocP>
          </DocSection>
          {i < faqs.length - 1 && <DocDivider />}
        </div>
      ))}
    </DocPage>
  )
}
