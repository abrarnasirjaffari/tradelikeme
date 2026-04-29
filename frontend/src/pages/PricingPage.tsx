import { motion } from 'framer-motion'
import FadingVideo from '../components/FadingVideo'
import ScrollProgress from '../components/ScrollProgress'
import WaitlistNavbar from './WaitlistNavbar'
import WaitlistFinalCTA from './WaitlistFinalCTA'
import Footer from '../components/Footer'
import { VIEW, fadeUp, stagger } from '../lib/animate'

const HR = <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.07)', margin: '0 clamp(1.25rem, 5vw, 10rem)' }} />

const card1Features = [
  'You keep 80% of every dollar earned',
  'We charge nobody — investors, traders, or platform costs are all covered from profit',
  'Drift vault or CEX API — your choice',
  'Revoke access anytime, instantly',
]
const card2Features = [
  'Zero fees while in drawdown',
  'Zero fees during recovery',
  'Fee only resumes at a new all-time high',
  'No double-dipping — ever',
]
const card3Features = [
  'Earn 12% of profits from every user who follows you',
  'Your strategy runs 24/7 — zero work after setup',
  'Scale beyond your own capital — earn from all deposits',
  'Apply with any strategy — we verify results together',
]

const themItems = [
  'Monthly subscriptions whether you profit or not',
  'Pay-per-trade commissions that eat into returns',
  'Locked-in contracts with exit fees',
  'Black-box AI with no verified track record',
]
const usItems = [
  '20% of profits only — zero if you\'re losing',
  'No commissions, no spreads, no hidden fees',
  'Revoke access anytime with one click',
  'All strategies verified — backtested + out-of-sample tested',
]

const hwm = [
  {
    step: '01',
    label: 'You deposit $10,000',
    amount: '$10,000',
    status: 'deposit',
    color: 'rgba(255,255,255,0.4)',
    tag: 'Starting point',
    desc: 'This is your baseline. No fee ever applies below this amount.',
  },
  {
    step: '02',
    label: 'Portfolio grows to $12,000',
    amount: '$12,000',
    status: 'high',
    color: '#22C55E',
    tag: 'New all-time high',
    desc: 'You made $2,000 profit. We take 20% = $400. You keep $1,600.',
  },
  {
    step: '03',
    label: 'Portfolio drops to $9,500',
    amount: '$9,500',
    status: 'recovery',
    color: '#F59E0B',
    tag: 'Recovery mode — fee paused',
    desc: 'We charge $0. Nothing. Not a penny — until you\'re back above $12,000.',
  },
  {
    step: '04',
    label: 'Portfolio recovers to $14,000',
    amount: '$14,000',
    status: 'high',
    color: '#22C55E',
    tag: 'New all-time high',
    desc: 'You gained $2,000 above the old high ($14k – $12k). We take 20% = $400. You keep $1,600.',
  },
]

export default function PricingPage() {
  return (
    <div style={{ background: '#000' }}>
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
        style={{ position: 'fixed', top: 0, left: '-10%', width: '120%', height: '120%', objectFit: 'cover', objectPosition: 'center top', zIndex: 0 }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <ScrollProgress />
        <WaitlistNavbar />

        {/* Hero */}
        <div style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.75) 100%)', paddingTop: '10rem', paddingBottom: '5rem' }}>
          <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={stagger(0.1)}
            className="sec"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', textAlign: 'center' }}
          >
            <motion.div variants={fadeUp}>
              <div className="liquid-glass" style={{ borderRadius: 9999, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '6px 16px' }}>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '13px', color: '#0052FF' }}>Simple, honest pricing</span>
              </div>
            </motion.div>
            <motion.h1 variants={fadeUp}
              style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 1.05, letterSpacing: '-2px', maxWidth: '18ch', textAlign: 'center' }}
            >
              Zero fees. You pay only when you profit.
            </motion.h1>
            <motion.p variants={fadeUp}
              style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '1.1rem', color: 'rgba(255,255,255,0.55)', maxWidth: '54ch', lineHeight: 1.65, textAlign: 'center' }}
            >
              No monthly subscriptions. No platform fees. No hidden charges. We earn 20% of your profits — and nothing else. If you're in recovery or at a loss, we charge absolutely nothing.
            </motion.p>
          </motion.div>
        </div>

        <div style={{ background: 'rgba(2,4,12,0.92)', backdropFilter: 'blur(2px)' }}>

          {/* Pricing cards */}
          <section className="sec sec-v">
            <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={stagger(0.1)}
              className="grid-3"
            >
              {[
                { badge: 'WHEN YOU PROFIT', badgeColor: '#22C55E', badgeBg: 'rgba(34,197,94,0.1)', num: '20%', sub: 'of profits only', features: card1Features, checkColor: '#22C55E', border: 'rgba(255,255,255,0.08)' },
                { badge: 'RECOVERY OR LOSS', badgeColor: '#0052FF', badgeBg: 'rgba(0,82,255,0.12)', num: '$0', sub: 'absolutely nothing', features: card2Features, checkColor: '#0052FF', border: '#0052FF', highlight: true },
                { badge: 'FOR TRADERS', badgeColor: '#F59E0B', badgeBg: 'rgba(245,158,11,0.1)', num: '12%', sub: 'of profits, per user, per month', features: card3Features, checkColor: 'rgba(255,255,255,0.3)', border: 'rgba(255,255,255,0.08)' },
              ].map((plan) => (
                <motion.div key={plan.badge} variants={fadeUp}
                  className={plan.highlight ? '' : 'liquid-glass'}
                  style={{
                    borderRadius: '1.5rem', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem',
                    ...(plan.highlight ? { background: 'linear-gradient(180deg, rgba(0,82,255,0.12) 0%, rgba(2,4,12,0.95) 40%)', border: `2px solid #0052FF` } : {}),
                  }}
                >
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '11px', color: plan.badgeColor, background: plan.badgeBg, borderRadius: 9999, padding: '4px 12px', alignSelf: 'flex-start', letterSpacing: '0.05em' }}>{plan.badge}</span>
                  <div>
                    <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: '4rem', lineHeight: 1, letterSpacing: '-2px' }}>{plan.num}</span>
                    <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '1rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>{plan.sub}</p>
                  </div>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.08)' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {plan.features.map((f) => (
                      <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                        <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '13.5px', color: '#fff', lineHeight: 1.5 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </section>

          {HR}

          {/* High water mark */}
          <section className="sec sec-v" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3rem' }}>
            <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={fadeUp}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' }}
            >
              <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', lineHeight: 1.05, letterSpacing: '-1px' }}>
                We only win when you win.
              </h2>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '1rem', color: 'rgba(255,255,255,0.5)', maxWidth: '54ch', lineHeight: 1.65, textAlign: 'center' }}>
                We remember your portfolio's best-ever value. If it drops, our fee is paused — completely. We charge nothing until you've passed that peak again and made fresh profit on top.
              </p>
            </motion.div>
            <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={stagger(0.1)}
              className="grid-2"
              style={{ gap: '1rem', width: '100%' }}
            >
              {hwm.map((h, i) => (
                <motion.div key={h.step} variants={fadeUp} className="liquid-glass"
                  style={{ borderRadius: '1.25rem', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', overflow: 'hidden' }}
                >
                  {/* step number */}
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '11px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>STEP {h.step}</span>

                  {/* amount */}
                  <div>
                    <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: h.color, fontSize: '2rem', letterSpacing: '-1px', lineHeight: 1 }}>{h.amount}</span>
                  </div>

                  {/* tag pill */}
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '10px', letterSpacing: '0.08em', color: h.color, background: `${h.color}18`, border: `1px solid ${h.color}40`, borderRadius: 9999, padding: '3px 10px', alignSelf: 'flex-start', lineHeight: 1.4 }}>
                    {h.tag}
                  </span>

                  <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

                  {/* label + desc */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '13px', color: '#fff', margin: 0 }}>{h.label}</p>
                    <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '12.5px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, margin: 0 }}>{h.desc}</p>
                  </div>

                  {/* connector arrow between cards except last */}
                  {i < hwm.length - 1 && (
                    <div style={{ position: 'absolute', right: -14, top: '50%', transform: 'translateY(-50%)', zIndex: 2, color: 'rgba(255,255,255,0.2)', fontSize: '18px', pointerEvents: 'none' }}>→</div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </section>

          {HR}

          {/* Comparison */}
          <section className="sec sec-v" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3rem' }}>
            <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={fadeUp}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' }}
            >
              <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', lineHeight: 1.05, letterSpacing: '-1px' }}>
                What everyone else charges.
              </h2>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '1rem', color: 'rgba(255,255,255,0.5)', maxWidth: '48ch', lineHeight: 1.65 }}>
                Every other platform takes money whether you win or lose. We don't.
              </p>
            </motion.div>
            <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={stagger(0.1)}
              className="grid-2"
              style={{ gap: '1.5rem', width: '100%' }}
            >
              {/* Them */}
              <motion.div variants={fadeUp} className="liquid-glass"
                style={{ borderRadius: '1.5rem', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444', flexShrink: 0 }} />
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em' }}>OTHER PLATFORMS</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {themItems.map((t, i) => (
                    <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 0', borderBottom: i < themItems.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <div style={{ width: 7, height: 1, background: '#EF4444', borderRadius: 1 }} />
                      </div>
                      <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{t}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Us */}
              <motion.div variants={fadeUp}
                style={{ borderRadius: '1.5rem', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.75rem', background: 'rgba(0,82,255,0.06)', border: '1px solid rgba(0,82,255,0.2)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0052FF', flexShrink: 0 }} />
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '11px', color: '#0052FF', letterSpacing: '0.12em' }}>TRADELIKEME</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {usItems.map((u, i) => (
                    <div key={u} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 0', borderBottom: i < usItems.length - 1 ? '1px solid rgba(0,82,255,0.1)' : 'none' }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(0,82,255,0.15)', border: '1px solid rgba(0,82,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                          <path d="M1 3l2 2 4-4" stroke="#0052FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '14px', color: '#fff', lineHeight: 1.5 }}>{u}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </section>

        </div>

        <WaitlistFinalCTA />
        <Footer />
      </div>
    </div>
  )
}
