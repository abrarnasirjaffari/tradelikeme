import WaitlistNavbar from './WaitlistNavbar'
import Footer from '../components/Footer'
import ScrollProgress from '../components/ScrollProgress'
import FadingVideo from '../components/FadingVideo'

const LAST_UPDATED = 'April 27, 2026'

const s = {
  section: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  h2: {
    fontFamily: "'Instrument Serif', serif",
    fontStyle: 'italic' as const,
    color: '#fff',
    fontSize: '1.35rem',
    letterSpacing: '-0.5px',
    margin: 0,
    lineHeight: 1.2,
  },
  p: {
    fontFamily: "'Barlow', sans-serif",
    fontWeight: 300,
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 1.75,
    margin: 0,
  },
  li: {
    fontFamily: "'Barlow', sans-serif",
    fontWeight: 300,
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 1.75,
  },
  divider: {
    height: 1,
    background: 'rgba(255,255,255,0.07)',
  },
}

export default function PrivacyPage() {
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
          {/* header */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '3rem' }}>
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', borderRadius: 9999, padding: '3px 12px', fontSize: '11px', alignSelf: 'flex-start', border: '1px solid rgba(255,255,255,0.1)' }}>
              Legal
            </span>
            <h1 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: 'clamp(2rem, 4vw, 2.75rem)', lineHeight: 1.05, letterSpacing: '-1.5px', margin: 0 }}>
              Privacy Policy
            </h1>
            <p style={{ ...s.p, color: 'rgba(255,255,255,0.35)' }}>Last updated: {LAST_UPDATED}</p>
          </div>

          <div className="liquid-glass" style={{ borderRadius: '1.75rem', padding: '2.75rem 3rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            <div style={s.section}>
              <p style={s.p}>
                TradeLikeMe ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our platform at tradelikeme.xyz and use our services. By using TradeLikeMe, you agree to the collection and use of information in accordance with this policy.
              </p>
            </div>

            <div style={s.divider} />

            <div style={s.section}>
              <h2 style={s.h2}>1. Information We Collect</h2>
              <p style={s.p}>We collect information you provide directly to us, including:</p>
              <ul style={{ paddingLeft: '1.5rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {[
                  'Name and email address (waitlist and account registration)',
                  'WhatsApp or Telegram handle (optional, for community notifications)',
                  'Exchange API keys (trade-only, stored encrypted — CEX mode only)',
                  'Solana wallet address (for vault delegation — Mode A only)',
                  'Trading preferences, strategy details, and self-reported statistics',
                  'Country and how you heard about us',
                ].map(item => <li key={item} style={s.li}>{item}</li>)}
              </ul>
              <p style={s.p}>We also collect certain information automatically when you use our platform, including IP address, browser type, device information, and pages visited, via standard server logs and analytics tools.</p>
            </div>

            <div style={s.divider} />

            <div style={s.section}>
              <h2 style={s.h2}>2. How We Use Your Information</h2>
              <p style={s.p}>We use the information we collect to:</p>
              <ul style={{ paddingLeft: '1.5rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {[
                  'Operate, maintain, and improve our services',
                  'Send waitlist notifications and product updates',
                  'Execute trades on your behalf (when you delegate authority)',
                  'Calculate and distribute profit share',
                  'Verify trader strategies and onboard marketplace contributors',
                  'Prevent fraud and comply with legal obligations',
                  'Respond to your inquiries and provide customer support',
                ].map(item => <li key={item} style={s.li}>{item}</li>)}
              </ul>
              <p style={s.p}>We do not sell your personal information to third parties.</p>
            </div>

            <div style={s.divider} />

            <div style={s.section}>
              <h2 style={s.h2}>3. Exchange API Keys</h2>
              <p style={s.p}>
                If you use CEX mode (Mode B), you provide trade-only API keys. These keys are encrypted at rest using AES-256 and are never used for withdrawals. You can revoke access at any time by deleting your API key from the exchange and from your TradeLikeMe account. We do not store plaintext credentials.
              </p>
            </div>

            <div style={s.divider} />

            <div style={s.section}>
              <h2 style={s.h2}>4. Solana Wallet & Drift Delegation</h2>
              <p style={s.p}>
                If you use the Solana Vault (Mode A), you sign a delegation transaction via Phantom Connect that grants our agent the ability to open and close perpetual positions on Drift Protocol on your behalf. This delegation does not grant withdrawal rights. Your funds remain in your wallet — the agent can trade, never withdraw. You can revoke delegation at any time through Drift's interface.
              </p>
            </div>

            <div style={s.divider} />

            <div style={s.section}>
              <h2 style={s.h2}>5. Data Sharing & Third Parties</h2>
              <p style={s.p}>We may share your information with:</p>
              <ul style={{ paddingLeft: '1.5rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {[
                  'Drift Protocol, Jupiter Perps, Raydium Perps — for on-chain trade execution',
                  'WEEX, Bybit, Binance — for CEX trade execution (API key usage only)',
                  'Supabase — our database and authentication provider',
                  'AWS — cloud infrastructure hosting',
                  'Helius — Solana RPC provider',
                  'Law enforcement or regulatory bodies if required by law',
                ].map(item => <li key={item} style={s.li}>{item}</li>)}
              </ul>
              <p style={s.p}>All third parties are bound by their own privacy policies and applicable law.</p>
            </div>

            <div style={s.divider} />

            <div style={s.section}>
              <h2 style={s.h2}>6. Data Retention</h2>
              <p style={s.p}>
                We retain your personal information for as long as your account is active or as needed to provide services. Waitlist data is retained for 12 months. You may request deletion of your data at any time by contacting us at privacy@tradelikeme.xyz. API keys are deleted immediately upon your request.
              </p>
            </div>

            <div style={s.divider} />

            <div style={s.section}>
              <h2 style={s.h2}>7. Security</h2>
              <p style={s.p}>
                We implement industry-standard security measures including TLS encryption in transit, AES-256 encryption at rest for sensitive data, and rate limiting on all API endpoints. No method of transmission over the internet is 100% secure. We cannot guarantee absolute security but are committed to protecting your data.
              </p>
            </div>

            <div style={s.divider} />

            <div style={s.section}>
              <h2 style={s.h2}>8. Your Rights</h2>
              <p style={s.p}>Depending on your jurisdiction, you may have the right to:</p>
              <ul style={{ paddingLeft: '1.5rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {[
                  'Access the personal data we hold about you',
                  'Request correction of inaccurate data',
                  'Request deletion of your data ("right to be forgotten")',
                  'Object to or restrict processing of your data',
                  'Data portability — receive your data in a structured format',
                ].map(item => <li key={item} style={s.li}>{item}</li>)}
              </ul>
              <p style={s.p}>To exercise any of these rights, contact us at privacy@tradelikeme.xyz.</p>
            </div>

            <div style={s.divider} />

            <div style={s.section}>
              <h2 style={s.h2}>9. Cookies</h2>
              <p style={s.p}>
                We use essential cookies for session management and authentication. We do not use advertising or tracking cookies. You can disable cookies in your browser settings, though this may affect platform functionality.
              </p>
            </div>

            <div style={s.divider} />

            <div style={s.section}>
              <h2 style={s.h2}>10. Children's Privacy</h2>
              <p style={s.p}>
                TradeLikeMe is not directed to individuals under 18 years of age. We do not knowingly collect personal information from minors. If you believe a minor has provided us with personal information, contact us immediately at privacy@tradelikeme.xyz.
              </p>
            </div>

            <div style={s.divider} />

            <div style={s.section}>
              <h2 style={s.h2}>11. Changes to This Policy</h2>
              <p style={s.p}>
                We may update this Privacy Policy from time to time. We will notify you of material changes by email or by a prominent notice on our platform. Continued use of TradeLikeMe after changes constitutes your acceptance of the updated policy.
              </p>
            </div>

            <div style={s.divider} />

            <div style={s.section}>
              <h2 style={s.h2}>12. Contact Us</h2>
              <p style={s.p}>
                If you have any questions about this Privacy Policy, please contact us at:{' '}
                <a href="mailto:privacy@tradelikeme.xyz" style={{ color: '#0052FF', textDecoration: 'none' }}>
                  privacy@tradelikeme.xyz
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
