import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { VIEW, fadeUp } from '../lib/animate'

const features = [
  'You keep 80% of all profits',
  '$0 monthly fees, $0 subscriptions, $0 hidden costs',
  'Drift vault or CEX API — your choice',
  'Revoke access anytime',
  'Applies to every strategy — ours and the marketplace',
]

export default function Pricing() {
  return (
    <section className="sec sec-v" style={{ display: 'flex', flexDirection: 'column', gap: '3rem', alignItems: 'center' }}>
      <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={fadeUp}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', textAlign: 'center' }}
      >
        <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '11px', color: '#0052FF', letterSpacing: '0.12em', textTransform: 'uppercase' }}>PRICING</span>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', lineHeight: 1.05, letterSpacing: '-1px', maxWidth: '20ch' }}>
          Zero fees. Zero subscriptions. We earn only when you do.
        </h2>
        <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '1rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, maxWidth: '50ch' }}>
          No monthly charges. No hidden fees. Every strategy takes 20% of profits. You pay nothing unless you profit. Ever.
        </p>
      </motion.div>

      <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={fadeUp}
        className="liquid-glass"
        style={{ borderRadius: '1.5rem', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '560px' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
          <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: '4rem', lineHeight: 1 }}>20%</span>
          <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '15px', color: 'rgba(255,255,255,0.38)', paddingBottom: '0.5rem' }}>of profits only</span>
        </div>
        <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '0.9rem', color: 'rgba(255,255,255,0.48)', lineHeight: 1.65 }}>
          Our flagship strategy and every marketplace strategy run on the same simple model — pure price action, no indicators, verified results. You keep 80% of every dollar earned.
        </p>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {features.map((f) => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <Check size={15} color="#0052FF" strokeWidth={2.5} />
              <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '13.5px', color: '#fff' }}>{f}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
