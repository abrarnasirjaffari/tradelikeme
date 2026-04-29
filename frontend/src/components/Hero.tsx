import { motion, type Transition } from 'framer-motion'
import { ArrowUpRight, Play } from 'lucide-react'
import BlurText from './BlurText'

const fadeUp = (delay: number) => ({
  initial: { filter: 'blur(10px)', opacity: 0, y: 20 } as const,
  animate: { filter: 'blur(0px)', opacity: 1, y: 0 } as const,
  transition: { duration: 0.6, delay, ease: 'easeOut' } as Transition,
})

const PAD = '0 clamp(1.25rem, 5vw, 5rem)'

export default function Hero() {
  return (
    <section style={{ position: 'relative', height: '100vh', background: 'transparent', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '65%', background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 65%, transparent 100%)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, padding: PAD, paddingBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Badge */}
        <motion.div {...fadeUp(0.4)} style={{ display: 'flex' }}>
          <div className="liquid-glass" style={{ borderRadius: 9999, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '4px 4px' }}>
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, background: '#0052FF', color: '#fff', borderRadius: 9999, padding: '4px 12px', fontSize: '11px' }}>New</span>
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '13px', color: 'rgba(255,255,255,0.88)', paddingRight: '0.75rem' }}>89% Win Rate — Pure Price Action — Now on Solana</span>
          </div>
        </motion.div>

        {/* Headline */}
        <BlurText
          text="Verified strategies. Automated for you."
          className="text-5xl md:text-6xl lg:text-[5.5rem] text-white leading-[0.85] tracking-[-3px]"
          style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', justifyContent: 'flex-start', maxWidth: '16ch' }}
        />

        {/* Subtext */}
        <motion.p {...fadeUp(0.8)} style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '0.95rem', color: 'rgba(255,255,255,0.65)', maxWidth: '48ch', lineHeight: 1.56 }}>
          A marketplace where proven traders share their strategies. We automate them. You choose, deposit, and trade — hands-free. No monthly fees. We only earn when you profit.
        </motion.p>

        {/* CTAs + stat cards */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap', rowGap: '1.5rem' }}>
          <motion.div {...fadeUp(1.1)} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '14px', background: '#0052FF', color: '#fff', borderRadius: 9999, padding: '11px 24px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Start Trading <ArrowUpRight size={16} />
            </button>
            <button style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '13px', color: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', border: 'none', background: 'transparent' }}>
              View Live Trades <Play size={14} style={{ fill: 'currentColor' }} />
            </button>
          </motion.div>

          <motion.div {...fadeUp(1.3)} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {[
              { value: '89%', label: 'Verified Win Rate' },
              { value: '$0 Fees', label: '20% Profit Share Only' },
              { value: '24/7', label: 'Agent Runs Non-Stop' },
            ].map((s) => (
              <div key={s.label} className="liquid-glass" style={{ borderRadius: '1rem', padding: '0.875rem 1rem', minWidth: '110px', flex: '1 1 100px' }}>
                <p style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: '1.8rem', letterSpacing: '-1px', lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Partners */}
        <motion.div {...fadeUp(1.5)} className="partners-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.1)', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Executing on</span>
          <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.12)' }} />
          {['Drift', 'Jupiter', 'Raydium', 'Pyth', 'Phantom'].map((name, i) => (
            <span key={name} style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: 'rgba(255,255,255,0.5)', fontSize: '1.15rem', letterSpacing: '-0.5px' }}>{name}</span>
              {i < 4 && <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: '0.65rem' }}>●</span>}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
