import WaitlistNavbar from './WaitlistNavbar'
import Footer from '../components/Footer'
import ScrollProgress from '../components/ScrollProgress'
import FadingVideo from '../components/FadingVideo'

const LAST_UPDATED = 'April 27, 2026'

const s = {
  section: { display: 'flex', flexDirection: 'column' as const, gap: '0.75rem' },
  h2: { fontFamily: "'Instrument Serif', serif", fontStyle: 'italic' as const, color: '#fff', fontSize: '1.35rem', letterSpacing: '-0.5px', margin: 0, lineHeight: 1.2 },
  p: { fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '0.9rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, margin: 0 },
  li: { fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '0.9rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75 },
  divider: { height: 1, background: 'rgba(255,255,255,0.07)' },
}

export default function TermsPage() {
  return (
    <div style={{ background: '#000' }}>
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
        style={{ position: 'fixed', top: 0, left: '-10%', width: '120%', height: '120%', objectFit: 'cover', objectPosition: 'center top', zIndex: 0 }}
      />
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'rgba(0,0,0,0.7)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <ScrollProgress />
        <WaitlistNavbar />

        <div style={{ maxWidth: 760, margin: '0 auto', padding: '10rem 2rem 6rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '3rem' }}>
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', borderRadius: 9999, padding: '3px 12px', fontSize: '11px', alignSelf: 'flex-start', border: '1px solid rgba(255,255,255,0.1)' }}>
              Legal
            </span>
            <h1 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: 'clamp(2rem, 4vw, 2.75rem)', lineHeight: 1.05, letterSpacing: '-1.5px', margin: 0 }}>
              Terms of Service
            </h1>
            <p style={{ ...s.p, color: 'rgba(255,255,255,0.35)' }}>Last updated: {LAST_UPDATED}</p>
          </div>

          <div className="liquid-glass" style={{ borderRadius: '1.75rem', padding: '2.75rem 3rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            <div style={s.section}>
              <p style={s.p}>
                These Terms of Service ("Terms") govern your access to and use of TradeLikeMe ("we", "us", "our"), operated at tradelikeme.xyz. By accessing or using TradeLikeMe, you agree to be bound by these Terms. If you do not agree, do not use the platform.
              </p>
            </div>

            <div style={s.divider} />

            <div style={s.section}>
              <h2 style={s.h2}>1. Eligibility</h2>
              <p style={s.p}>
                You must be at least 18 years old and legally permitted to trade derivatives and perpetual contracts in your jurisdiction. By using TradeLikeMe, you represent that you meet these requirements. Residents of countries subject to OFAC sanctions or where crypto derivatives are prohibited are not permitted to use this platform.
              </p>
            </div>

            <div style={s.divider} />

            <div style={s.section}>
              <h2 style={s.h2}>2. Not Financial Advice</h2>
              <p style={s.p}>
                TradeLikeMe is a technology platform that automates a trading strategy. Nothing on this platform constitutes financial advice, investment advice, or a recommendation to buy or sell any asset. Past performance — including the 89% win rate referenced — does not guarantee future results. Trading perpetual contracts involves significant risk of loss, including loss of your entire deposit. You are solely responsible for your trading decisions.
              </p>
            </div>

            <div style={s.divider} />

            <div style={s.section}>
              <h2 style={s.h2}>3. The Service</h2>
              <p style={s.p}>TradeLikeMe provides two modes of operation:</p>
              <ul style={{ paddingLeft: '1.5rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <li style={s.li}><strong style={{ color: 'rgba(255,255,255,0.75)' }}>Mode A (Solana Vault)</strong> — You deposit USDC or CASH into a Drift Protocol sub-account and delegate trading authority to our agent. The agent can open and close perpetual positions. It cannot withdraw funds to any address other than your own wallet.</li>
                <li style={s.li}><strong style={{ color: 'rgba(255,255,255,0.75)' }}>Mode B (CEX API)</strong> — You provide trade-only API keys from supported centralised exchanges. The agent executes trades on your behalf. API keys must have withdrawal permissions disabled.</li>
              </ul>
              <p style={s.p}>We reserve the right to pause, modify, or discontinue the service at any time with reasonable notice.</p>
            </div>

            <div style={s.divider} />

            <div style={s.section}>
              <h2 style={s.h2}>4. Fees & Profit Share</h2>
              <p style={s.p}>
                Our strategy charges a 20% profit share on net profits generated. Profit share is calculated per settlement period and deducted automatically (Mode A via smart contract, Mode B via month-end settlement). There are no subscription fees, deposit fees, or withdrawal fees charged by TradeLikeMe. Exchange and network fees are separate and charged by the respective protocol or exchange.
              </p>
              <p style={s.p}>
                Marketplace strategies have their own fee tiers (8–15% total) as displayed on the platform. Fee structures may change with 30 days' notice.
              </p>
            </div>

            <div style={s.divider} />

            <div style={s.section}>
              <h2 style={s.h2}>5. Withdrawals & Lockup</h2>
              <p style={s.p}>
                Withdrawal windows are set by the strategy trader (minimum 3 days, maximum 30 days). TradeLikeMe's default withdrawal window is 30 days from request. This lockup exists to protect open positions from forced closure. You may request withdrawal at any time; execution occurs at the end of the window. No withdrawal fees are charged by TradeLikeMe.
              </p>
            </div>

            <div style={s.divider} />

            <div style={s.section}>
              <h2 style={s.h2}>6. Risk Acknowledgment</h2>
              <p style={s.p}>By using TradeLikeMe, you explicitly acknowledge:</p>
              <ul style={{ paddingLeft: '1.5rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {[
                  'Perpetual futures trading involves high leverage and the risk of total loss of deposited funds.',
                  'Smart contract bugs, oracle failures, exchange outages, and network congestion can result in losses.',
                  'Historical win rates are not indicative of future performance.',
                  'Macro market conditions can invalidate any trading strategy.',
                  'You are solely responsible for compliance with the laws of your jurisdiction.',
                ].map(item => <li key={item} style={s.li}>{item}</li>)}
              </ul>
            </div>

            <div style={s.divider} />

            <div style={s.section}>
              <h2 style={s.h2}>7. Trader Marketplace</h2>
              <p style={s.p}>
                Third-party traders who submit strategies to the marketplace are independent contributors, not employees or agents of TradeLikeMe. We verify strategies against our minimum standards (50+ trades, 55%+ win rate, clear written rules) but do not guarantee the performance of any marketplace strategy. TradeLikeMe is not liable for losses arising from marketplace strategies.
              </p>
            </div>

            <div style={s.divider} />

            <div style={s.section}>
              <h2 style={s.h2}>8. Prohibited Conduct</h2>
              <p style={s.p}>You agree not to:</p>
              <ul style={{ paddingLeft: '1.5rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {[
                  'Attempt to manipulate, reverse-engineer, or exploit the platform or its strategies',
                  'Share, sell, or disclose proprietary strategy details obtained through the platform',
                  'Use the platform for money laundering, sanctions evasion, or any illegal purpose',
                  'Create multiple accounts to circumvent restrictions or bans',
                  'Submit false or misleading information during trader onboarding',
                ].map(item => <li key={item} style={s.li}>{item}</li>)}
              </ul>
              <p style={s.p}>Violation of these terms may result in immediate account termination without refund.</p>
            </div>

            <div style={s.divider} />

            <div style={s.section}>
              <h2 style={s.h2}>9. Intellectual Property</h2>
              <p style={s.p}>
                The TradeLikeMe platform code is open source (MIT License). The underlying trading strategy — including all rules, zone identification methods, and entry/exit logic — is proprietary intellectual property of TradeLikeMe and may not be reproduced, distributed, or used commercially without written permission. Marketplace traders retain ownership of their own strategies.
              </p>
            </div>

            <div style={s.divider} />

            <div style={s.section}>
              <h2 style={s.h2}>10. Limitation of Liability</h2>
              <p style={s.p}>
                To the maximum extent permitted by applicable law, TradeLikeMe and its founders, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to trading losses, loss of profits, loss of data, or loss of goodwill. Our total aggregate liability shall not exceed the amount of profit share fees paid by you in the 3 months preceding the claim.
              </p>
            </div>

            <div style={s.divider} />

            <div style={s.section}>
              <h2 style={s.h2}>11. Indemnification</h2>
              <p style={s.p}>
                You agree to indemnify and hold harmless TradeLikeMe and its affiliates from any claims, damages, losses, or expenses (including legal fees) arising from your use of the platform, your violation of these Terms, or your violation of any applicable law or regulation.
              </p>
            </div>

            <div style={s.divider} />

            <div style={s.section}>
              <h2 style={s.h2}>12. Governing Law & Disputes</h2>
              <p style={s.p}>
                These Terms are governed by the laws of Singapore, without regard to its conflict of law provisions. Any disputes arising from these Terms shall first be attempted to be resolved through good-faith negotiation. If unresolved within 30 days, disputes shall be submitted to binding arbitration in Singapore under the SIAC rules.
              </p>
            </div>

            <div style={s.divider} />

            <div style={s.section}>
              <h2 style={s.h2}>13. Changes to These Terms</h2>
              <p style={s.p}>
                We may update these Terms at any time. We will provide 14 days' notice of material changes via email or platform notification. Continued use after notice constitutes acceptance of the updated Terms.
              </p>
            </div>

            <div style={s.divider} />

            <div style={s.section}>
              <h2 style={s.h2}>14. Contact</h2>
              <p style={s.p}>
                Questions about these Terms? Contact us at{' '}
                <a href="mailto:legal@tradelikeme.xyz" style={{ color: '#0052FF', textDecoration: 'none' }}>
                  legal@tradelikeme.xyz
                </a>
              </p>
            </div>

          </div>
        </div>

        <Footer />
      </div>
    </div>
  )
}
