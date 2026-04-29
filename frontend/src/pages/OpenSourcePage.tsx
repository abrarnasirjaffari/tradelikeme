import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import FadingVideo from '../components/FadingVideo'
import ScrollProgress from '../components/ScrollProgress'
import WaitlistNavbar from './WaitlistNavbar'
import WaitlistFinalCTA from './WaitlistFinalCTA'
import Footer from '../components/Footer'
import { VIEW, fadeUp, fadeLeft, fadeRight, stagger } from '../lib/animate'

const HR = <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.07)', margin: '0 clamp(1.25rem, 5vw, 10rem)' }} />

const codeLines = [
  { text: '# TradeLikeMe — Open Source', dim: true },
  { text: '├── agent/         # trading agent', dim: false },
  { text: '├── sentinel/      # price watcher', dim: false },
  { text: '├── api/           # FastAPI backend', dim: false },
  { text: '├── frontend/      # Next.js app', dim: false },
  { text: '├── drift/         # Solana integration', dim: false },
  { text: '└── strategies/    # private (trader IP)', dim: true },
]


export default function OpenSourcePage() {
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
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', display: 'inline-block', boxShadow: '0 0 6px #22C55E' }} />
                <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '13px', color: '#fff' }}>Releasing 9 May 2026</span>
              </div>
            </motion.div>
            <motion.h1 variants={fadeUp}
              style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 1.05, letterSpacing: '-2px', maxWidth: '20ch', textAlign: 'center' }}
            >
              Built in public. Free forever.
            </motion.h1>
            <motion.p variants={fadeUp}
              style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '1.1rem', color: 'rgba(255,255,255,0.55)', maxWidth: '54ch', lineHeight: 1.65 }}
            >
              The platform is MIT licensed — inspect every line, fork it, build on it. Full source code drops on launch day.
            </motion.p>
            <motion.div variants={fadeUp}>
              <button
                onClick={() => { window.history.pushState({}, '', '/join-waitlist'); window.scrollTo(0, 0); window.dispatchEvent(new PopStateEvent('popstate')) }}
                style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '14px', background: '#0052FF', color: '#fff', borderRadius: 9999, padding: '12px 24px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                Join the waitlist <ArrowUpRight size={15} />
              </button>
            </motion.div>
          </motion.div>
        </div>

        <div style={{ background: 'rgba(2,4,12,0.92)', backdropFilter: 'blur(2px)' }}>

          {/* Code tree + story */}
          <section className="sec sec-v feature-row">
            <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={fadeLeft}
              className="feature-text"
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', lineHeight: 1.1, letterSpacing: '-1px' }}>
                Open source. Fully transparent.
              </h2>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '1rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>
                Our platform code is open source. Inspect the agent logic, verify how trades are executed, and audit the profit-sharing calculations yourself. The only thing that stays private is the trader's strategy rules — because that's their intellectual property.
              </p>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '0.95rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.65 }}>
                GitHub link goes live on 9 May 2026 alongside the full platform launch.
              </p>
            </motion.div>

            <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={stagger(0.07)}
              className="liquid-glass feature-card"
              style={{ borderRadius: '1.5rem', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', overflow: 'hidden', minWidth: 0 }}
            >
              {codeLines.map((line) => (
                <motion.span key={line.text} variants={fadeUp}
                  style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 'clamp(11px, 3vw, 13px)', color: line.dim ? 'rgba(255,255,255,0.28)' : '#fff', lineHeight: 1.6, wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}
                >{line.text}</motion.span>
              ))}
              <motion.div variants={fadeUp}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(34,197,94,0.12)', borderRadius: 9999, padding: '5px 12px', marginTop: '0.5rem', alignSelf: 'flex-start' }}
              >
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E' }} />
                <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '11px', color: '#22C55E' }}>MIT License</span>
              </motion.div>
            </motion.div>
          </section>

          {HR}

          {/* Our story */}
          <section className="sec sec-v feature-row" style={{ alignItems: 'flex-start' }}>
            <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={fadeLeft}
              className="feature-text"
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '11px', color: '#F59E0B', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Our story</p>
              <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: 'clamp(1.75rem, 5vw, 2.75rem)', lineHeight: 1.05, letterSpacing: '-1px' }}>
                Built with $0. Seriously.
              </h2>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '1rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>
                We connected with a real profitable trader, spent weeks understanding their strategy deeply, backtested it, ran out-of-sample verification, then automated every rule into a live agent — and shipped a dual-mode platform, all without spending a dollar.
              </p>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '1rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>
                We coded through nights, debugged at 3am, and rage-quit at least twice. But we came back — because when the strategy works, it really works. And we built something we're genuinely proud of.
              </p>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '1rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.65 }}>
                At some point the bills show up. Servers, APIs, infrastructure — none of it stays free forever. If this platform adds value to you, supporting it keeps it alive and open for everyone.
              </p>
            </motion.div>

            <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={fadeRight}
              className="feature-card"
              style={{ borderRadius: '1.5rem', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(0,82,255,0.06)', border: '1px solid rgba(0,82,255,0.2)' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '11px', color: '#0052FF', letterSpacing: '0.12em' }}>LAUNCHING 9 MAY 2026</span>
                <h3 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: '1.6rem', letterSpacing: '-0.5px', lineHeight: 1.1, margin: 0 }}>
                  Be the first to access the code.
                </h3>
              </div>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, margin: 0 }}>
                Join the waitlist and get notified the moment the platform and full source code go live. Fork it, inspect it, build on it.
              </p>
              {[
                'Full MIT source code on day one',
                'Agent logic, Drift integration, profit tracking',
                'Strategy rules stay private — everything else is open',
              ].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(0,82,255,0.15)', border: '1px solid rgba(0,82,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3l2 2 4-4" stroke="#0052FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
              <button
                onClick={() => { window.history.pushState({}, '', '/join-waitlist'); window.scrollTo(0, 0); window.dispatchEvent(new PopStateEvent('popstate')) }}
                style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '14px', background: '#0052FF', color: '#fff', borderRadius: 9999, padding: '12px 24px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: '0.25rem' }}
              >
                Join Waitlist <ArrowUpRight size={15} />
              </button>
            </motion.div>
          </section>


        </div>

        <WaitlistFinalCTA />
        <Footer />
      </div>
    </div>
  )
}
