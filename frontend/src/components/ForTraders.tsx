import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { VIEW, fadeUp, stagger } from '../lib/animate'

export default function ForTraders() {
  return (
    <section className="sec sec-v" style={{ display: 'flex', flexDirection: 'column', gap: '3rem', alignItems: 'center' }}>
      <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={fadeUp}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', textAlign: 'center' }}
      >
        <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '11px', color: '#0052FF', letterSpacing: '0.12em', textTransform: 'uppercase' }}>FOR TRADERS</span>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', lineHeight: 1.05, letterSpacing: '-1px', maxWidth: '16ch' }}>
          Got a winning strategy? Share it.
        </h2>
        <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '1rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, maxWidth: '52ch' }}>
          Submit your rules. If your strategy passes verification (55%+ win rate, 50+ trades), our agent automates it for thousands of users. You earn from every deposit — zero work, zero risk, zero cost.
        </p>
      </motion.div>

      <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={stagger(0.1)}
        style={{ display: 'flex', gap: '1rem', width: '100%', alignItems: 'stretch', maxWidth: 900, flexWrap: 'wrap' }}
      >
        <motion.div variants={fadeUp} className="liquid-glass"
          style={{ flex: 1, borderRadius: '1rem', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', textAlign: 'center' }}
        >
          <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: '2.25rem', lineHeight: 1 }}>$5k/mo</span>
          <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '13px', color: 'rgba(255,255,255,0.48)' }}>Trading alone ($50k capital)</span>
          <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.28)', marginTop: 2 }}>8–12 hrs/day, own money at risk</span>
        </motion.div>

        <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 48, flexShrink: 0 }}>
          <ArrowRight size={26} color="#0052FF" />
        </motion.div>

        <motion.div variants={fadeUp}
          style={{ flex: 1, borderRadius: '1rem', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', textAlign: 'center', background: 'rgba(0,82,255,0.08)', border: '1px solid rgba(0,82,255,0.22)' }}
        >
          <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#0052FF', fontSize: '2.25rem', lineHeight: 1 }}>$14k/mo</span>
          <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>On TradeLikeMe ($2M user deposits)</span>
          <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.38)', marginTop: 2 }}>0 hours/day, $0 risk, agent runs 24/7</span>
        </motion.div>
      </motion.div>
    </section>
  )
}
