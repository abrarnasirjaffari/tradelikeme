import { motion, type Transition } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import BlurText from '../components/BlurText'

const LAUNCH = new Date('2026-05-09T12:00:00Z') // 5PM PKT = UTC+5

function useCountdown() {
  const calc = () => {
    const diff = Math.max(0, LAUNCH.getTime() - Date.now())
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    }
  }
  const [t, setT] = useState(calc)
  useEffect(() => { const id = setInterval(() => setT(calc()), 1000); return () => clearInterval(id) }, [])
  return t
}

function useLocalLaunchTime() {
  const [label, setLabel] = useState('')
  useEffect(() => {
    const time = LAUNCH.toLocaleString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit',
      timeZoneName: 'short',
    })
    setLabel(time)
  }, [])
  return label
}

const fadeUp = (delay: number) => ({
  initial: { filter: 'blur(10px)', opacity: 0, y: 20 } as const,
  animate: { filter: 'blur(0px)', opacity: 1, y: 0 } as const,
  transition: { duration: 0.6, delay, ease: 'easeOut' } as Transition,
})

const PAD = '0 clamp(1.25rem, 5vw, 5rem)'

export default function WaitlistHero() {
  const { d, h, m, s } = useCountdown()
  const localLaunchTime = useLocalLaunchTime()
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
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

        {/* countdown */}
        <motion.div {...fadeUp(0.95)} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', display: 'inline-block', boxShadow: '0 0 8px #22C55E', flexShrink: 0 }} />
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '14px', color: '#fff', letterSpacing: '0.01em' }}>
              {localLaunchTime ? `Launching ${localLaunchTime}` : 'Launching 9 May 2026'}
            </span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'inline-block', flexShrink: 0 }} />
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>
              Full open source release on the same day
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.375rem' }}>
            {[{ val: d, label: 'Days' }, { val: h, label: 'Hours' }, { val: m, label: 'Min' }, { val: s, label: 'Sec' }].map((unit, i) => (
              <div key={unit.label} style={{ display: 'flex', alignItems: 'flex-end', gap: '0.375rem' }}>
                <div className="liquid-glass countdown-box" style={{ borderRadius: '0.875rem', padding: '0.875rem 1.375rem', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px' }}>
                  <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 'clamp(1.75rem, 4vh, 3rem)', color: '#fff', lineHeight: 1, letterSpacing: '-2px' }}>{pad(unit.val)}</span>
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: '5px' }}>{unit.label}</span>
                </div>
                {i < 3 && <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '2rem', lineHeight: 1, marginBottom: '1.75rem' }}>:</span>}
              </div>
            ))}
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
  )
}
