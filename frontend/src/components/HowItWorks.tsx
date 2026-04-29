import { motion } from 'framer-motion'
import { Search, Download, TrendingUp } from 'lucide-react'
import { VIEW, fadeUp, stagger } from '../lib/animate'

const steps = [
  { Icon: Search,     num: '01', title: 'Pick a verified strategy', desc: 'Browse the marketplace. Every strategy shows win rate, trade count, and profit share. Only strategies above 55% are accepted.' },
  { Icon: Download,   num: '02', title: 'Deposit and delegate',     desc: 'Deposit USDC into a Drift vault or connect your CEX API key. The agent gets trade-only access — it can never withdraw your funds.' },
  { Icon: TrendingUp, num: '03', title: 'Agent trades 24/7',        desc: 'The agent runs your chosen strategy around the clock. You get Telegram alerts on every trade. Withdraw or revoke access anytime.' },
]

export default function HowItWorks() {
  return (
    <section className="sec sec-v" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={fadeUp}>
        <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>how it works</p>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 0.9, letterSpacing: '-2px' }}>
          Three steps.<br />Fully automated.
        </h2>
      </motion.div>

      <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={stagger(0.12)}
        className="grid-3"
      >
        {steps.map((s) => (
          <motion.div key={s.title} variants={fadeUp} className="liquid-glass"
            style={{ borderRadius: '1.25rem', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <div className="liquid-glass" style={{ width: 52, height: 52, borderRadius: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <s.Icon size={24} color="#0052FF" />
            </div>
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '11px', color: '#0052FF', letterSpacing: '0.05em' }}>{s.num}</span>
            <h3 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: '1.4rem', letterSpacing: '-0.5px', lineHeight: 1.1 }}>{s.title}</h3>
            <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{s.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
