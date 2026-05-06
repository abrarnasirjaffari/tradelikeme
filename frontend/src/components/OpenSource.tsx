import { motion } from 'framer-motion'
import { GitBranch } from 'lucide-react'
import { VIEW, fadeLeft, stagger, fadeUp } from '../lib/animate'

const codeLines = [
  { text: '# TradeLikeMe — Open Source', dim: true },
  { text: '├── agent/         # trading agent', dim: false },
  { text: '├── sentinel/      # price watcher', dim: false },
  { text: '├── api/           # FastAPI backend', dim: false },
  { text: '├── frontend/      # Next.js app', dim: false },
  { text: '├── drift/         # Solana integration', dim: false },
  { text: '└── strategies/    # private (trader IP)', dim: true },
]

export default function OpenSource() {
  return (
    <section className="sec sec-v feature-row">
      <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={fadeLeft}
        className="feature-text"
        style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
      >
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', lineHeight: 1.1, letterSpacing: '-1px' }}>
          Open source. Fully transparent.
        </h2>
        <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '1rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>
          Our platform code is open source. Inspect the agent logic, verify how trades are executed, and audit the profit-sharing calculations yourself. The only thing that stays private is the trader's strategy rules — because that's their intellectual property.
        </p>
        <button className="liquid-glass" style={{ alignSelf: 'flex-start', borderRadius: 9999, padding: '0.75rem 1.5rem', fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '14px', color: '#fff', cursor: 'pointer', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <GitBranch size={15} /> View on GitHub
        </button>
      </motion.div>

      <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={stagger(0.07)}
        className="liquid-glass feature-card"
        style={{ borderRadius: '1.5rem', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}
      >
        {codeLines.map((line) => (
          <motion.span key={line.text} variants={fadeUp}
            style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '13px', color: line.dim ? 'rgba(255,255,255,0.28)' : '#fff', lineHeight: 1.6 }}
          >{line.text}</motion.span>
        ))}
        <motion.div variants={fadeUp}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(34,197,94,0.12)', borderRadius: 9999, padding: '5px 12px', marginTop: '0.5rem', alignSelf: 'flex-start' }}
        >
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E' }} />
          <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '11px', color: '#22C55E' }}>MIT License</span>
        </motion.div>
      </motion.div>
    </section>
  )
}
