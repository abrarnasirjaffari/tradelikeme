import { motion } from 'framer-motion'
import { ArrowUpRight, Star, GitFork, Scale } from 'lucide-react'

function GithubIcon({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z"/>
    </svg>
  )
}
import FadingVideo from '../components/FadingVideo'
import ScrollProgress from '../components/ScrollProgress'
import WaitlistNavbar from './WaitlistNavbar'
import WaitlistFinalCTA from './WaitlistFinalCTA'
import Footer from '../components/Footer'
import { VIEW, fadeUp, fadeLeft, fadeRight, stagger } from '../lib/animate'

const HR = <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.07)', margin: '0 clamp(1.25rem, 5vw, 10rem)' }} />

const repoTree = [
  { name: 'trading_agent/', desc: 'Async trading agent + sentinel', private: false },
  { name: 'backend/', desc: 'FastAPI REST API + WebSocket', private: false },
  { name: 'frontend/', desc: 'React 19 + Vite app', private: false },
  { name: 'auth/', desc: 'BetterAuth service (Hono)', private: false },
  { name: 'infra/', desc: 'Docker, KLineChart MCP, deploy', private: false },
  { name: 'mobile/', desc: 'React Native (Expo)', private: false },
  { name: 'strategies/', desc: 'Private — trader IP', private: true },
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
                <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '13px', color: '#fff' }}>Live on GitHub</span>
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
              The platform is MIT licensed — inspect every line, fork it, build on it.
            </motion.p>
            <motion.div variants={fadeUp} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <a
                href="https://github.com/abrarnasirjaffari/tradelikeme"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '14px', background: '#fff', color: '#000', borderRadius: 9999, padding: '12px 24px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
              >
                <GithubIcon size={16} /> View on GitHub
              </a>
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
              <a href="https://github.com/abrarnasirjaffari/tradelikeme" target="_blank" rel="noopener noreferrer"
                style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '0.95rem', color: '#58A6FF', lineHeight: 1.65, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <GithubIcon size={15} /> View repository on GitHub <ArrowUpRight size={13} />
              </a>
            </motion.div>

            <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={stagger(0.05)}
              className="feature-card"
              style={{ borderRadius: '0.75rem', overflow: 'hidden', minWidth: 0, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(13,17,23,0.95)' }}
            >
              {/* Repo header */}
              <motion.div variants={fadeUp} style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <a href="https://github.com/abrarnasirjaffari/tradelikeme" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.5)', transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = '#fff')} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}>
                  <GithubIcon size={18} />
                </a>
                <a href="https://github.com/abrarnasirjaffari/tradelikeme" target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '14px', color: '#58A6FF', textDecoration: 'none', fontWeight: 600 }}>
                  abrarnasirjaffari/tradelikeme
                </a>
                <span style={{ marginLeft: 'auto', fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 9999, padding: '2px 8px' }}>Public</span>
              </motion.div>

              {/* Description */}
              <motion.div variants={fadeUp} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '13px', color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.5 }}>
                  Verified-strategy trading vaults on Solana. Deposit, our agent trades. 20% profit share, zero fees.
                </p>
              </motion.div>

              {/* File tree */}
              <div style={{ padding: '0' }}>
                {repoTree.map((item, i) => (
                  <motion.div key={item.name} variants={fadeUp}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1.5rem', borderBottom: i < repoTree.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill={item.private ? '#848D97' : '#54AEFF'}>
                      <path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-8.5A1.75 1.75 0 0 0 14.25 3H7.5a.25.25 0 0 1-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75Z" />
                    </svg>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '13px', color: item.private ? 'rgba(255,255,255,0.3)' : '#fff', minWidth: 0 }}>{item.name}</span>
                    <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginLeft: 'auto', whiteSpace: 'nowrap' }}>{item.desc}</span>
                  </motion.div>
                ))}
              </div>

              {/* Footer stats */}
              <motion.div variants={fadeUp} style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Scale size={13} color="rgba(255,255,255,0.4)" />
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>MIT License</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Star size={13} color="rgba(255,255,255,0.4)" />
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Star</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <GitFork size={13} color="rgba(255,255,255,0.4)" />
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Fork</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginLeft: 'auto' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#3572A5', display: 'inline-block' }} />
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Python</span>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#3178C6', display: 'inline-block', marginLeft: '0.5rem' }} />
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>TypeScript</span>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#DEA584', display: 'inline-block', marginLeft: '0.5rem' }} />
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Rust</span>
                </div>
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
                <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '11px', color: '#0052FF', letterSpacing: '0.12em' }}>OPEN SOURCE — LIVE NOW</span>
                <h3 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: '1.6rem', letterSpacing: '-0.5px', lineHeight: 1.1, margin: 0 }}>
                  The code is live. Go explore.
                </h3>
              </div>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, margin: 0 }}>
                Full source code is on GitHub. Fork it, inspect it, build on it.
              </p>
              {[
                'Full MIT source code',
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
