import { DocPage, DocSection, DocBadge, DocH1, DocH2, DocP, DocDivider } from '../DocComponents'

const faqs = [
  {
    q: 'Is there a minimum deposit?',
    a: 'No. However, with very small deposits (under $100), the number of trades before hitting the $35 minimum balance floor is limited. We recommend at least $200 for meaningful trading activity with the Medium risk mode.',
  },
  {
    q: 'How often does the agent trade?',
    a: 'It depends on market conditions. The agent only trades when a valid S/D zone setup appears AND all confirmation rules pass. This might be 2 trades in a day, or 0 trades in a week. Quality over frequency.',
  },
  {
    q: 'What is the expected monthly return?',
    a: 'Based on verified historical performance, the strategy averages approximately 8% per month. This is not guaranteed — past performance does not guarantee future results. The strategy has a proven win rate with an average winner of +4.2% and average loser of -2.8%.',
  },
  {
    q: 'Can I lose more than I deposit?',
    a: 'No. CROSS leverage means you can lose your margin, but you cannot go into negative balance. The minimum balance floor ($35) stops the agent from trading before your account is fully depleted.',
  },
  {
    q: 'What happens if BTC crashes suddenly?',
    a: 'The disaster SL on the exchange fires automatically if the sentinel is overwhelmed. The body-close SL protects against false stops during high volatility. Rule A (BTC 1D gate) prevents entries during unfavorable macro conditions.',
  },
  {
    q: 'Can I follow multiple strategies?',
    a: 'Yes. Each strategy has its own vault (Mode A) or exchange connection (Mode B). Position counts are per-strategy — you can have up to 2 open positions per strategy concurrently.',
  },
  {
    q: 'Can I pause the agent without withdrawing?',
    a: 'Yes. Go to your dashboard and click "Pause Entries". The agent stops placing new trades, but all open positions continue to be managed until they close.',
  },
  {
    q: 'How are profits taxed?',
    a: 'TradeLikeMe does not provide tax advice. Your jurisdiction determines how crypto trading profits are taxed. We provide a full trade history export from your dashboard for your accountant.',
  },
  {
    q: 'What if I want to withdraw while there are open positions?',
    a: 'In Mode A, you can withdraw up to your available balance minus margin held in open positions. In Mode B, your exchange balance is yours to withdraw at any time — open positions are independent.',
  },
  {
    q: 'Is the win rate real?',
    a: 'Yes. It is verified on TradingView charts — not self-reported screenshots, not backtests, but live chart verification of real trades. The sample is ongoing and growing. You can view the verification data in the Strategy Proof section.',
  },
]

export default function InvestorFaq() {
  return (
    <DocPage>
      <DocSection>
        <DocBadge color="#0052FF">Investors</DocBadge>
        <DocH1>Investor FAQ</DocH1>
        <DocP>Common questions from investors before and after signing up.</DocP>
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
