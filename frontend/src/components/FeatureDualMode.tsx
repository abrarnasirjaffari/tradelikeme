import { motion } from 'framer-motion'
import { VIEW, fadeLeft, fadeRight } from '../lib/animate'

export default function FeatureDualMode() {
  return (
    <section className="sec sec-v feature-row">
      <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={fadeLeft}
        className="feature-text"
        style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
      >
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', lineHeight: 1.1, letterSpacing: '-1px' }}>
          Trade on Solana or your favourite exchange.
        </h2>
        <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '1rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>
          Deposit into a trustless Drift vault on Solana — or connect a trade-only API key from WEEX, Bybit, or Bitget. Same agent brain, same strategy. Two ways to trade.
        </p>
        <button className="liquid-glass" style={{ alignSelf: 'flex-start', borderRadius: 9999, padding: '0.75rem 1.5rem', fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '14px', color: '#fff', cursor: 'pointer', border: 'none', background: 'transparent' }}>
          Start trading →
        </button>
      </motion.div>

      <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={fadeRight}
        className="feature-card"
        style={{ display: 'flex', gap: '1rem' }}
      >
        {[
          { title: 'Solana Vault', desc: 'Drift Protocol', badge: 'Trustless' },
          { title: 'CEX API',      desc: 'WEEX / Bybit / Bitget', badge: '600+ Pairs' },
        ].map(({ title, desc, badge }) => (
          <div key={title} className="liquid-glass" style={{ flex: 1, borderRadius: '1rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '15px', color: '#fff', marginTop: '0.25rem' }}>{title}</span>
            <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.38)' }}>{desc}</span>
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '11px', color: '#22C55E' }}>{badge}</span>
          </div>
        ))}
      </motion.div>
    </section>
  )
}
