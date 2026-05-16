import { motion } from 'framer-motion'
import { VIEW, fadeLeft, fadeRight } from '../lib/animate'

export default function FeatureResults() {
  return (
    <section className="sec sec-v feature-row">
      <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={fadeLeft}
        className="liquid-glass feature-card"
        style={{ borderRadius: '1.5rem', padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center' }}
      >
        <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: '2.5rem', letterSpacing: '-1px', lineHeight: 1, textAlign: 'center' }}>$100 → $1,000+</span>
        <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '16px', color: '#0052FF' }}>in one month</span>
        <div style={{ width: '100%', height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.08)' }}>
          <motion.div
            initial={{ width: 0 }} whileInView={{ width: '89%' }} viewport={VIEW}
            transition={{ duration: 1.4, delay: 0.2, ease: 'easeOut' }}
            style={{ height: '100%', borderRadius: 4, background: 'linear-gradient(90deg, #0052FF 0%, #22C55E 100%)' }}
          />
        </div>
        <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '13px', color: '#22C55E' }}>942% growth · Proven win rate</span>
      </motion.div>

      <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={fadeRight}
        className="feature-text"
        style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
      >
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', lineHeight: 1.1, letterSpacing: '-1px' }}>
          Results that speak for themselves.
        </h2>
        <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '1rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>
          Our flagship strategy turned a $100 test account into $1,000+ in a single month. Proven win rate. Pure price action. No indicators. Verified on TradingView — not a simulation.
        </p>
        <button className="liquid-glass" style={{ alignSelf: 'flex-start', borderRadius: 9999, padding: '0.75rem 1.5rem', fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '14px', color: '#fff', cursor: 'pointer', border: 'none', background: 'transparent' }}>
          View results →
        </button>
      </motion.div>
    </section>
  )
}
