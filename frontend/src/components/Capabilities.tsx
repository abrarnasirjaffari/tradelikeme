import { motion } from 'framer-motion'
import { VIEW, fadeUp, stagger } from '../lib/animate'

const cards = [
  { title: 'Zone Analysis', body: 'AI scans 7 timeframes from Monthly to 15-minute. S/D zones with 4H gate and BTC macro filter.', tags: ['Multi-TF', 'S/D Zones', '4H Gate', 'BTC Filter'] },
  { title: 'Smart Risk Management', body: 'Structural stop losses, zone-based take profits, and a 0.5% margin per trade. Maximum 2 positions at a time. We protect capital first.', tags: ['Structural SL', 'Zone-Based TP', '0.5% Margin', 'Capital First'] },
  { title: 'Dual Execution', body: 'Drift vault for trustless Solana trading. WEEX, Bybit, Binance for CEX. Same agent brain, best routing per coin.', tags: ['Drift', 'Jupiter', 'Raydium', 'Trustless'] },
]

export default function Capabilities() {
  return (
    <section className="sec" style={{ paddingTop: 'clamp(3rem, 7vw, 5rem)', paddingBottom: 'clamp(4rem, 8vw, 6rem)' }}>
      <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={fadeUp} style={{ marginBottom: '3rem' }}>
        <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Capabilities</p>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: 'clamp(3rem, 6vw, 5rem)', lineHeight: 0.88, letterSpacing: '-3px' }}>
          Strategy<br />evolved
        </h2>
      </motion.div>

      <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={stagger(0.12)}
        className="grid-3"
      >
        {cards.map((c) => (
          <motion.div key={c.title} variants={fadeUp} className="liquid-glass"
            style={{ borderRadius: '1.25rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
              {c.tags.map((tag) => (
                <span key={tag} className="liquid-glass" style={{ fontFamily: "'Barlow', sans-serif", fontSize: '10px', color: 'rgba(255,255,255,0.6)', borderRadius: 9999, padding: '3px 9px', whiteSpace: 'nowrap' }}>{tag}</span>
              ))}
            </div>
            <div>
              <h3 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: '1.5rem', letterSpacing: '-0.5px', lineHeight: 1, marginBottom: '0.5rem' }}>{c.title}</h3>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{c.body}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
