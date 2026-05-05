import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

function navigate(path: string) {
  window.history.pushState({}, '', path)
  window.scrollTo(0, 0)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export default function FinalCTA() {
  return (
    <section style={{ position: 'relative', overflow: 'hidden', background: '#0052FF' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 60% 50%, rgba(255,255,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div className="sec sec-v-lg" style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', textAlign: 'center' }}>
        <motion.h2
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.6 }}
          style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: 'clamp(2.5rem, 5vw, 3.75rem)', lineHeight: 1.05, letterSpacing: '-2px', maxWidth: '18ch' }}
        >
          Your money should work harder than you do.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
          style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '1.125rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.56, maxWidth: '52ch' }}
        >
          Pick a verified strategy. Deposit. Let proven agents compound your capital 24/7. No fees unless you profit. Or submit your own winning strategy and earn from every user who follows it.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
          style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <button style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '16px', background: '#fff', color: '#0052FF', borderRadius: 9999, padding: '1rem 2rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            Start Trading <ArrowUpRight size={16} />
          </button>
          <button onClick={() => navigate('/submit-strategy')} style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '16px', background: 'transparent', color: '#fff', borderRadius: 9999, padding: '1rem 2rem', border: '1px solid rgba(255,255,255,0.4)', cursor: 'pointer' }}>
            Submit Your Strategy
          </button>
        </motion.div>
      </div>
    </section>
  )
}
