import { motion } from 'framer-motion'
import FadingVideo from '../components/FadingVideo'
import ScrollProgress from '../components/ScrollProgress'
import WaitlistNavbar from './WaitlistNavbar'
import WaitlistFinalCTA from './WaitlistFinalCTA'
import Footer from '../components/Footer'
import { VIEW, fadeUp, stagger } from '../lib/animate'

const HR = <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.07)', margin: '0 clamp(1.25rem, 5vw, 10rem)' }} />

const invSteps = [
  { n: '01', title: 'Connect your wallet or exchange', desc: 'Sign in with Phantom (email or wallet) for Solana vaults. Or paste a trade-only API key from WEEX, Bybit, or Bitget.' },
  { n: '02', title: 'Browse verified strategies',      desc: 'Every strategy is verified — 50+ trades, 55%+ win rate minimum. See live P&L, risk mode, and trade history before you commit.' },
  { n: '03', title: 'Deposit and delegate',            desc: 'Deposit USDC or CASH into a Drift vault. The agent can trade on your behalf but can never withdraw. Trustless by design.' },
  { n: '04', title: 'Agent trades 24/7. You watch.',   desc: 'The agent scans zones, enters trades, manages risk, and takes profit — all automated. Check your dashboard anytime. Revoke access anytime.' },
]

const trSteps = [
  { n: '01', title: 'Submit your strategy rules', desc: 'Write out your entry, exit, SL, and TP rules. Any style — supply/demand, price action, indicators. If it\'s clear and repeatable, it qualifies.' },
  { n: '02', title: 'We verify your track record', desc: '50+ trades minimum. We verify every trade on charts — no screenshots, no self-reporting. Real data only. Consistent profitability required.' },
  { n: '03', title: 'We build your agent',         desc: 'Our team clones your strategy into an automated agent. You review it, paper trade on devnet for 2 weeks, and approve before going live.' },
  { n: '04', title: 'Earn from every follower',    desc: 'Users deposit into your strategy. You earn 12% of all profits generated — automatically, every month, for zero hours of trading.' },
]

export default function HowItWorksPage() {
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
                <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '13px', color: '#0052FF' }}>Simple by design</span>
              </div>
            </motion.div>
            <motion.h1 variants={fadeUp}
              style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 1.05, letterSpacing: '-2px', maxWidth: '18ch' }}
            >
              How TradeLikeMe works.
            </motion.h1>
            <motion.p variants={fadeUp}
              style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '1.1rem', color: 'rgba(255,255,255,0.55)', maxWidth: '54ch', lineHeight: 1.65 }}
            >
              Two paths, one platform. Whether you're an investor looking for hands-free returns or a trader who wants to monetise your strategy — here's exactly how it works.
            </motion.p>
          </motion.div>
        </div>

        <div style={{ background: 'rgba(2,4,12,0.92)', backdropFilter: 'blur(2px)' }}>

          {/* For Investors */}
          <section className="sec sec-v" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3.5rem' }}>
            <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={stagger(0.08)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}
            >
              <motion.p variants={fadeUp} style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '11px', color: '#0052FF', letterSpacing: '0.15em', textTransform: 'uppercase' }}>For Investors</motion.p>
              <motion.h2 variants={fadeUp} style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: 'clamp(2.75rem, 5vw, 4rem)', lineHeight: 1.0, letterSpacing: '-2px' }}>
                Deposit. Pick a strategy. Earn.
              </motion.h2>
              <motion.p variants={fadeUp} style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '1.1rem', color: 'rgba(255,255,255,0.5)', maxWidth: '52ch', lineHeight: 1.65 }}>
                No trading knowledge needed. Verified agents trade 24/7 using proven strategies. You just pick one and deposit.
              </motion.p>
            </motion.div>
            <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={stagger(0.1)}
              className="grid-2"
              style={{ gap: '1.5rem', width: '100%' }}
            >
              {invSteps.map((s) => (
                <motion.div key={s.n} variants={fadeUp} className="liquid-glass"
                  style={{ borderRadius: '1.5rem', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
                >
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '12px', color: '#0052FF', letterSpacing: '0.08em' }}>{s.n}</span>
                  <h3 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: '1.6rem', lineHeight: 1.15, letterSpacing: '-0.5px' }}>{s.title}</h3>
                  <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>{s.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </section>

          {HR}

          {/* For Traders */}
          <section className="sec sec-v" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3.5rem' }}>
            <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={stagger(0.08)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}
            >
              <motion.p variants={fadeUp} style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '11px', color: '#22C55E', letterSpacing: '0.15em', textTransform: 'uppercase' }}>For Traders</motion.p>
              <motion.h2 variants={fadeUp} style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: 'clamp(2.75rem, 5vw, 4rem)', lineHeight: 1.0, letterSpacing: '-2px' }}>
                Share your strategy.<br />Earn from every user.
              </motion.h2>
              <motion.p variants={fadeUp} style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '1.1rem', color: 'rgba(255,255,255,0.5)', maxWidth: '54ch', lineHeight: 1.65 }}>
                Stop trading 12 hours a day. Submit your rules, we automate them. You earn a cut from every deposit that follows your strategy — zero work, zero risk, zero capital needed.
              </motion.p>
            </motion.div>
            <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={stagger(0.1)}
              className="grid-2"
              style={{ gap: '1.5rem', width: '100%' }}
            >
              {trSteps.map((s) => (
                <motion.div key={s.n} variants={fadeUp}
                  style={{ borderRadius: '1.5rem', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '12px', color: '#22C55E', letterSpacing: '0.08em' }}>{s.n}</span>
                  <h3 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: '1.6rem', lineHeight: 1.15, letterSpacing: '-0.5px' }}>{s.title}</h3>
                  <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>{s.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </section>

          {HR}

          {/* Investor vs Trader comparison */}
          <section className="sec sec-v" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3rem' }}>
            <motion.h2 initial="hidden" whileInView="show" viewport={VIEW} variants={fadeUp}
              style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: 'clamp(2.75rem, 5vw, 4rem)', lineHeight: 1.0, letterSpacing: '-2px', textAlign: 'center' }}
            >
              Which path is yours?
            </motion.h2>
            <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={stagger(0.1)}
              className="grid-2"
              style={{ width: '100%' }}
            >
              {[
                {
                  label: 'INVESTOR', labelColor: '#0052FF', border: 'rgba(0,82,255,0.25)', bg: 'rgba(0,82,255,0.06)',
                  title: 'I want my money to grow',
                  items: ['No trading knowledge required', 'Pick a verified strategy in minutes', 'Deposit from $10 — no minimum', 'Agent runs 24/7, you check the dashboard', 'Revoke access anytime, instantly'],
                },
                {
                  label: 'TRADER', labelColor: '#22C55E', border: 'rgba(34,197,94,0.25)', bg: 'rgba(34,197,94,0.04)',
                  title: 'I want to monetise my edge',
                  items: ['Turn your rules into a 24/7 agent', 'Earn from every user deposit', 'You get 12% of all profits generated', 'Zero capital at risk — you trade nothing', 'Scale without lifting a finger'],
                },
              ].map((p) => (
                <motion.div key={p.label} variants={fadeUp}
                  style={{ borderRadius: '1.5rem', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: p.bg, border: `1px solid ${p.border}` }}
                >
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '11px', color: p.labelColor, letterSpacing: '0.1em' }}>{p.label}</span>
                  <h3 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: '1.5rem', lineHeight: 1.1, letterSpacing: '-0.5px' }}>{p.title}</h3>
                  <div style={{ height: 1, background: `${p.border}` }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    {p.items.map((item) => (
                      <span key={item} style={{ fontFamily: "'Barlow', sans-serif", fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>→ {item}</span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </section>

        </div>

        <WaitlistFinalCTA />
        <Footer />
      </div>
    </div>
  )
}
