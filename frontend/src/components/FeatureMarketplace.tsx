import { motion } from 'framer-motion'
import { VIEW, fadeLeft, fadeRight, fadeUp, stagger } from '../lib/animate'

const strategies = [
  { name: 'TradeLikeMe Strategy', type: 'Pure Price Action', wr: '89% WR', fee: '20% profit share' },
  { name: 'Alpha Scalper',        type: 'Momentum + Volume', wr: '76% WR', fee: '12% profit share' },
  { name: 'Swing Master',         type: 'Multi-TF Trend',    wr: '68% WR', fee: '10% profit share' },
]

export default function FeatureMarketplace() {
  return (
    <section className="sec sec-v feature-row">
      <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={stagger(0.1)}
        className="liquid-glass feature-card"
        style={{ borderRadius: '1.5rem', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}
      >
        <motion.p variants={fadeUp} style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Browse Strategies</motion.p>
        {strategies.map((s) => (
          <motion.div key={s.name} variants={fadeUp}
            style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '0.75rem', padding: '0.875rem 1.125rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div>
              <div style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '14px', color: '#fff' }}>{s.name}</div>
              <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.38)', marginTop: 2 }}>{s.type}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '14px', color: '#22C55E' }}>{s.wr}</div>
              <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.38)', marginTop: 2 }}>{s.fee}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={fadeRight}
        className="feature-text"
        style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
      >
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', lineHeight: 1.1, letterSpacing: '-1px' }}>
          A marketplace for verified trading strategies.
        </h2>
        <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '1rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>
          Proven traders submit their strategies. We verify every one — 55%+ win rate, 50+ trades minimum. Pick a strategy, deposit, and let the agent trade for you 24/7. No monthly fees. You only pay when you profit.
        </p>
        <button className="liquid-glass" style={{ alignSelf: 'flex-start', borderRadius: 9999, padding: '0.75rem 1.5rem', fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '14px', color: '#fff', cursor: 'pointer', border: 'none', background: 'transparent' }}>
          Explore strategies →
        </button>
      </motion.div>
    </section>
  )
}
