import { useState } from 'react'
import { motion, AnimatePresence, type Transition } from 'framer-motion'
import { ArrowUpRight, Check } from 'lucide-react'
import FadingVideo from '../components/FadingVideo'
import ScrollProgress from '../components/ScrollProgress'
import WaitlistNavbar from './WaitlistNavbar'
import Footer from '../components/Footer'
import InvestorForm from './InvestorForm'
import TraderForm from './TraderForm'
import ContributorForm from './ContributorForm'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24, filter: 'blur(8px)' } as const,
  animate: { opacity: 1, y: 0,  filter: 'blur(0px)' } as const,
  transition: { duration: 0.55, delay, ease: 'easeOut' } as Transition,
})

type Role = 'investor' | 'trader' | 'both' | 'contributor'

const roles = [
  { val: 'investor'    as Role, label: 'Investor',    sub: 'I want my money to grow' },
  { val: 'trader'      as Role, label: 'Trader',      sub: 'I have a winning strategy' },
  { val: 'both'        as Role, label: 'Investor + Trader', sub: 'I want to invest and share' },
  { val: 'contributor' as Role, label: 'Contributor', sub: 'I want to build with you' },
]

export default function JoinWaitlist() {
  const [role, setRole]           = useState<Role | null>(null)
  const [bothStep, setBothStep]   = useState<'investor' | 'trader'>('investor')
  const [submitted, setSubmitted] = useState(false)
  const [investorShared, setInvestorShared] = useState<{ name: string; email: string; whatsapp: string; telegram: string; heardFrom: string } | null>(null)

  const step = role === null ? 'pick' : 'form'

  function handleBackFromBoth() {
    if (bothStep === 'trader') { setBothStep('investor') } else { setRole(null) }
  }

  return (
    <div style={{ background: '#000' }}>
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
        style={{ position: 'fixed', top: 0, left: '-10%', width: '120%', height: '120%', objectFit: 'cover', objectPosition: 'center top', zIndex: 0 }}
      />
      {/* dark scrim so form is always readable over video */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'rgba(0,0,0,0.55)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <ScrollProgress />
        <WaitlistNavbar />

        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8rem 2rem 4rem' }}>
          <AnimatePresence mode="wait">

            {/* ── STEP 1: role picker ── */}
            {step === 'pick' && !submitted && (
              <motion.div key="pick" {...fadeUp(0.2)}
                style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', textAlign: 'center' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <h1 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: 'clamp(2rem, 4vw, 2.75rem)', lineHeight: 1.05, letterSpacing: '-1.5px', margin: 0 }}>
                    Join the waitlist.
                  </h1>
                  <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>
                    Tell us who you are to get started.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', width: '100%' }}>
                  {roles.map(({ val, label, sub }) => (
                    <button key={val} type="button" onClick={() => setRole(val)}
                      className="liquid-glass"
                      style={{
                        borderRadius: '1rem', padding: '1.25rem 1.5rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        border: 'none', cursor: 'pointer', background: 'transparent',
                        textAlign: 'left', width: '100%', transition: 'opacity 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                      <div>
                        <p style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: '1.25rem', letterSpacing: '-0.5px', margin: 0 }}>{label}</p>
                        <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>{sub}</p>
                      </div>
                      <ArrowUpRight size={18} color="rgba(255,255,255,0.3)" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: forms — each keyed uniquely so AnimatePresence swaps correctly ── */}
            {step === 'form' && !submitted && role === 'investor' && (
              <motion.div key="form-investor" {...fadeUp(0.1)} style={{ width: '100%', maxWidth: 520 }}>
                <InvestorForm onBack={() => setRole(null)} onDone={() => setSubmitted(true)} />
              </motion.div>
            )}
            {step === 'form' && !submitted && role === 'trader' && (
              <motion.div key="form-trader" {...fadeUp(0.1)} style={{ width: '100%', maxWidth: 520 }}>
                <TraderForm onBack={() => setRole(null)} onDone={() => setSubmitted(true)} />
              </motion.div>
            )}
            {step === 'form' && !submitted && role === 'both' && bothStep === 'investor' && (
              <motion.div key="form-both-investor" {...fadeUp(0.1)} style={{ width: '100%', maxWidth: 520 }}>
                <InvestorForm onBack={() => { setRole(null); setBothStep('investor') }} onDone={(shared) => { setInvestorShared(shared ?? null); setBothStep('trader') }} badgeLabel="Investor + Trader — Step 1 of 2" badgeColor="#7C3AED" roleOverride="both" />
              </motion.div>
            )}
            {step === 'form' && !submitted && role === 'both' && bothStep === 'trader' && (
              <motion.div key="form-both-trader" {...fadeUp(0.1)} style={{ width: '100%', maxWidth: 520 }}>
                <TraderForm onBack={handleBackFromBoth} onDone={() => setSubmitted(true)} badgeLabel="Investor + Trader — Step 2 of 2" badgeColor="#7C3AED" roleOverride="both" sharedData={investorShared ?? undefined} />
              </motion.div>
            )}
            {step === 'form' && !submitted && role === 'contributor' && (
              <motion.div key="form-contributor" {...fadeUp(0.1)} style={{ width: '100%', maxWidth: 520 }}>
                <ContributorForm onBack={() => setRole(null)} onDone={() => setSubmitted(true)} />
              </motion.div>
            )}

            {/* ── STEP 3: success ── */}
            {submitted && (
              <motion.div key="success" {...fadeUp(0.1)}
                className="liquid-glass"
                style={{ borderRadius: '1.75rem', padding: '3.5rem', maxWidth: 460, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', textAlign: 'center' }}
              >
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={26} color="#22C55E" />
                </div>
                <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: '2rem', letterSpacing: '-1px', lineHeight: 1.1, margin: 0 }}>
                  You're on the list.
                </h2>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, maxWidth: '36ch', margin: 0 }}>
                  We'll email you the moment TradeLikeMe goes live. In the meantime, explore what we're building.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
                  {[
                    { label: 'How It Works', path: '/how-it-works' },
                    { label: 'Pricing',      path: '/pricing' },
                  ].map(({ label, path }) => (
                    <button key={label}
                      onClick={() => { window.history.pushState({}, '', path); window.scrollTo(0, 0); window.dispatchEvent(new PopStateEvent('popstate')) }}
                      className="liquid-glass"
                      style={{ borderRadius: 9999, padding: '9px 20px', fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '13px', color: '#fff', border: 'none', cursor: 'pointer', background: 'transparent' }}
                    >{label}</button>
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        <Footer />
      </div>
    </div>
  )
}
