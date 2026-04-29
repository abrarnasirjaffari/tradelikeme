import { motion } from 'framer-motion'
import { VIEW, fadeUp, stagger } from '../lib/animate'

const stats = [
  { value: 'MIT',  label: 'Open Source License' },
  { value: '$0',   label: 'Monthly Fees, Ever' },
  { value: '24/7', label: 'Agent Runs Non-Stop' },
  { value: '20%',  label: 'Profit Share Only' },
]

export default function WaitlistSocialProof() {
  return (
    <section className="sec" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
      <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={stagger(0.08)}
        className="grid-2"
        style={{ gap: '1rem' }}
      >
        {stats.map((s) => (
          <motion.div key={s.label} variants={fadeUp} className="liquid-glass"
            style={{ borderRadius: '1.25rem', padding: '1.75rem 2rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}
          >
            <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: '2.75rem', lineHeight: 1, letterSpacing: '-2px' }}>{s.value}</span>
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '12px', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.04em' }}>{s.label}</span>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
