import { motion, type Transition } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import BlurText from '../components/BlurText'

const fadeUp = (delay: number) => ({
  initial: { filter: 'blur(10px)', opacity: 0, y: 20 } as const,
  animate: { filter: 'blur(0px)', opacity: 1, y: 0 } as const,
  transition: { duration: 0.6, delay, ease: 'easeOut' } as Transition,
})

const PAD = '0 clamp(1.25rem, 5vw, 5rem)'

export default function WaitlistHero() {
  return (
    <>
    <section id="waitlist" style={{ position: 'relative', height: '100vh', background: 'transparent', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '65%', background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 65%, transparent 100%)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, padding: PAD, paddingBottom: 'max(1.5rem, min(3rem, 3vh))', display: 'flex', flexDirection: 'column', gap: 'min(1.25rem, 2vh)' }}>

        <BlurText
          text="The first verified-strategy trading platform."
          className="text-white leading-[0.9] tracking-[-2px] md:tracking-[-3px]"
          style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', justifyContent: 'flex-start', maxWidth: '16ch', fontSize: 'clamp(3.5rem, 10vh, 5.5rem)' }}
        />

        <motion.p {...fadeUp(0.8)} style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '0.95rem', color: 'rgba(255,255,255,0.65)', maxWidth: '48ch', lineHeight: 1.56 }}>
          We're launching TradeLikeMe — a marketplace where proven traders share their strategies and our agent automates them for you. No monthly fees. We only earn when you profit.
        </motion.p>


        <motion.div {...fadeUp(0.95)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', display: 'inline-block', boxShadow: '0 0 8px #22C55E', flexShrink: 0 }} />
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '14px', color: '#fff', letterSpacing: '0.01em' }}>
              Launching Soon
            </span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'inline-block', flexShrink: 0 }} />
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>
              Fully open source on GitHub
            </span>
          </div>
        </motion.div>

        <motion.div {...fadeUp(1.1)}>
          <button
            onClick={() => { window.history.pushState({}, '', '/join-waitlist'); window.scrollTo(0, 0); window.dispatchEvent(new PopStateEvent('popstate')) }}
            style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '14px', background: '#0052FF', color: '#fff', borderRadius: 9999, padding: '12px 28px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            Join Waitlist <ArrowUpRight size={15} />
          </button>
        </motion.div>


      </div>
    </section>

    <section style={{ background: 'rgba(2,4,12,0.92)', backdropFilter: 'blur(2px)', padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.25rem, 5vw, 5rem)' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.7, ease: 'easeOut' }}
        className="liquid-glass"
        style={{ borderRadius: '1.5rem', padding: 'clamp(2rem, 4vw, 3.5rem)', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: 720 }}
      >
        <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '11px', color: '#22C55E', letterSpacing: '0.12em', textTransform: 'uppercase' }}>VERIFIED RESULTS</span>
        <p style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 'clamp(2rem, 4.5vw, 3.25rem)', color: '#fff', lineHeight: 1.05, letterSpacing: '-1.5px', margin: 0 }}>
          We cloned a real trader's strategy that turned{' '}
          <span style={{ color: '#22C55E' }}>$100 into $500,000</span>{' '}
          in 3 years.
        </p>
        <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '0.9rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, margin: 0, maxWidth: '52ch' }}>
          The same strategy now runs as an automated agent — for you.
        </p>
      </motion.div>
    </section>
    </>
  )
}
