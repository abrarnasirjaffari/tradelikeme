import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { VIEW, fadeUp, stagger } from '../lib/animate'

const plan1Features = ['You keep 80% of all profits', '$0 monthly fees, $0 subscriptions, $0 hidden costs', 'Drift vault or CEX API — your choice', 'Revoke access anytime']
const plan2Features = ['S-tier (85%+ win rate): 15% fee', 'A-tier (75–84%): 12% fee', 'B-tier (65–74%): 10% fee', 'Below 55%: Rejected. Quality only.']

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
          No monthly charges. No hidden fees. Our strategy takes 20% of profits. Marketplace strategies vary by quality tier (5–15%). You pay nothing unless you profit. Ever.
        </p>
      </motion.div>

      <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={stagger(0.12)}
        className="grid-2"
        style={{ width: '100%' }}
      >
        {[
          { badge: 'OUR FLAGSHIP', badgeColor: '#0052FF', num: '20%', sub: 'of profits only', desc: 'Our flagship strategy runs pure price action. No indicators. Backtested and out-of-sample verified. You keep 80% of every dollar earned.', features: plan1Features, checkColor: '#0052FF' },
          { badge: 'MARKETPLACE', badgeColor: 'rgba(255,255,255,0.3)', num: '5–15%', sub: 'quality-based fee', desc: 'Browse verified strategies from other traders. Fee depends on win rate tier. Better strategies cost more — because they earn you more. You pay nothing unless you profit.', features: plan2Features, checkColor: 'rgba(255,255,255,0.22)' },
        ].map((plan) => (
          <motion.div key={plan.badge} variants={fadeUp} className="liquid-glass"
            style={{ borderRadius: '1.5rem', padding: '2.25rem', display: 'flex', flexDirection: 'column', gap: '1.125rem' }}
          >
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '11px', color: plan.badgeColor, letterSpacing: '0.05em' }}>{plan.badge}</span>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
              <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: '3.25rem', lineHeight: 1 }}>{plan.num}</span>
              <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '15px', color: 'rgba(255,255,255,0.38)', paddingBottom: '0.3rem' }}>{plan.sub}</span>
            </div>
            <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '0.9rem', color: 'rgba(255,255,255,0.48)', lineHeight: 1.65 }}>{plan.desc}</p>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.08)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {plan.features.map((f) => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <Check size={15} color={plan.checkColor} strokeWidth={2.5} />
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '13.5px', color: '#fff' }}>{f}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
