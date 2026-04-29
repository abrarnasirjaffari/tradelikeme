import { motion } from 'framer-motion'
import { VIEW, stagger, fadeUp } from '../lib/animate'

const stats = [
  { value: '89%',   label: 'Win Rate' },
  { value: '100%',  label: 'Pure Price Action' },
  { value: '24/7',  label: 'Agent Runs Non-Stop' },
  { value: '20%',   label: 'Our Strategy Fee' },
]

export default function StatsBar() {
  return (
    <motion.section
      initial="hidden" whileInView="show" viewport={VIEW}
      variants={stagger(0.08)}
      className="sec"
      style={{ paddingTop: '2.5rem', paddingBottom: '2.5rem', display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '2rem', borderTop: '1px solid rgba(255,255,255,0.07)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
    >
      {stats.map((s) => (
        <motion.div key={s.label} variants={fadeUp}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}
        >
          <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: '2.75rem', lineHeight: 1, letterSpacing: '-1px' }}>{s.value}</span>
          <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</span>
        </motion.div>
      ))}
    </motion.section>
  )
}
