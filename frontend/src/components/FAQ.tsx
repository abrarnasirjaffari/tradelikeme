import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import { investorFAQs, traderFAQs } from './faqData'
import { VIEW, fadeUp, stagger } from '../lib/animate'

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <button type="button" onClick={() => setOpen(p => !p)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', padding: '1.25rem 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '15px', color: '#fff', lineHeight: 1.4 }}>{q}</span>
        <span style={{ flexShrink: 0, color: 'rgba(255,255,255,0.4)' }}>
          {open ? <Minus size={16} /> : <Plus size={16} />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="ans"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, paddingBottom: '1.25rem', margin: 0 }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function FAQGroup({ badge, badgeColor, badgeBg, title, sub, faqs }: {
  badge: string; badgeColor: string; badgeBg: string
  title: string; sub: string
  faqs: { q: string; a: string }[]
}) {
  return (
    <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={stagger(0.07)}
      style={{ display: 'flex', flexDirection: 'column', gap: '0' }}
    >
      <motion.div variants={fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
        <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '11px', color: badgeColor, background: badgeBg, borderRadius: 9999, padding: '4px 12px', alignSelf: 'flex-start', letterSpacing: '0.05em' }}>{badge}</span>
        <h3 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', letterSpacing: '-1px', lineHeight: 1.05, margin: 0 }}>{title}</h3>
        <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, margin: 0, maxWidth: '44ch' }}>{sub}</p>
      </motion.div>
      <motion.div variants={stagger(0.05)}>
        {faqs.map(item => (
          <motion.div key={item.q} variants={fadeUp}>
            <FAQItem q={item.q} a={item.a} />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}

export default function FAQ() {
  return (
    <section className="sec sec-v-lg" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={fadeUp}
        style={{ marginBottom: '3rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
      >
        <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase', margin: 0 }}>FAQ</p>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 0.95, letterSpacing: '-2px', margin: 0 }}>
          Everything<br />answered.
        </h2>
      </motion.div>

      <div className="grid-2" style={{ alignItems: 'start', gap: 'clamp(2rem, 5vw, 5rem)' }}>
        <FAQGroup
          badge="FOR INVESTORS"
          badgeColor="#0052FF"
          badgeBg="rgba(0,82,255,0.12)"
          title="Investing with TradeLikeMe"
          sub="Questions about deposits, safety, fees, and how the agent works for you."
          faqs={investorFAQs}
        />
        <FAQGroup
          badge="FOR TRADERS"
          badgeColor="#22C55E"
          badgeBg="rgba(34,197,94,0.12)"
          title="Joining as a trader"
          sub="Questions about strategy submission, earnings, and how the marketplace works."
          faqs={traderFAQs}
        />
      </div>
    </section>
  )
}
