import { useState } from 'react'
import { motion, AnimatePresence, type Transition } from 'framer-motion'
import { Check, Mail } from 'lucide-react'
import FadingVideo from '../components/FadingVideo'
import ScrollProgress from '../components/ScrollProgress'
import WaitlistNavbar from './WaitlistNavbar'
import Footer from '../components/Footer'
import InvestorForm from './InvestorForm'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24, filter: 'blur(8px)' } as const,
  animate: { opacity: 1, y: 0,  filter: 'blur(0px)' } as const,
  transition: { duration: 0.55, delay, ease: 'easeOut' } as Transition,
})

export default function JoinWaitlist() {
  const [submitted, setSubmitted] = useState(false)

  return (
    <div style={{ background: '#000' }}>
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
        style={{ position: 'fixed', top: 0, left: '-10%', width: '120%', height: '120%', objectFit: 'cover', objectPosition: 'center top', zIndex: 0 }}
      />
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'rgba(0,0,0,0.55)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <ScrollProgress />
        <WaitlistNavbar />

        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8rem 2rem 4rem' }}>
          <AnimatePresence mode="wait">

            {!submitted && (
              <motion.div key="form" {...fadeUp(0.1)} style={{ width: '100%', maxWidth: 520 }}>
                <InvestorForm onBack={() => {}} onDone={() => setSubmitted(true)} />
              </motion.div>
            )}

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
                  We're launching soon. We'll email you the moment we go live.
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Trader / Contributor contact */}
        <section style={{ background: 'rgba(2,4,12,0.92)', backdropFilter: 'blur(2px)', padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.25rem, 5vw, 5rem)' }}>
          <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '14px', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
              Are you a trader with a winning strategy, or want to contribute?
            </p>
            <a href="mailto:abrarnasir@tradelikeme.xyz" style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '15px', color: '#58A6FF', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={15} /> abrarnasir@tradelikeme.xyz
            </a>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  )
}
