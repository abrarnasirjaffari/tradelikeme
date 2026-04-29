import { motion } from 'framer-motion'
import { VIEW, fadeUp, stagger } from '../lib/animate'

const solanaFeatures = [
  { title: 'Your money stays with you', body: 'Your funds never leave your Phantom wallet. The agent can trade on your behalf, but can never move your money out.' },
  { title: 'Trades happen on-chain', body: 'Every trade is executed on Solana through trusted protocols. Nothing goes through our servers.' },
  { title: '70+ coins, up to 250x', body: 'Wide coin selection across Drift, Jupiter, and Raydium. The agent picks the best route automatically.' },
  { title: 'Stop anytime', body: 'One click in Phantom and the agent loses all access. No waiting, no process — instant.' },
]

const cexFeatures = [
  { title: 'Just paste an API key', body: 'Connect your exchange with a trade-only key. No deposit, no withdrawal access — the agent just places trades in your account.' },
  { title: 'Works across exchanges', body: 'WEEX, Bybit, Binance and more. The agent picks the right exchange for each trade automatically.' },
  { title: '600+ pairs, up to 250x', body: 'More coins, more exchanges. Same strategy and risk rules as the Solana mode.' },
  { title: 'Stop anytime', body: 'Delete the API key from your exchange and the agent stops immediately. Full control, always.' },
]

const SOLANA_COLOR = '#9945FF'
const CEX_COLOR = '#0052FF'

function ModeCard({ title, badge, badgeColor, description, features, accent }: {
  title: string; badge: string; badgeColor: string; description: string
  features: { title: string; body: string }[]; accent: string
}) {
  return (
    <motion.div variants={fadeUp} className="liquid-glass"
      style={{ borderRadius: '1.5rem', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
    >
      {/* mode header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '10px', color: badgeColor, letterSpacing: '0.1em', textTransform: 'uppercase' as const, background: `${badgeColor}18`, borderRadius: 9999, padding: '3px 10px', alignSelf: 'flex-start' }}>
          {badge}
        </span>
        <h3 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: '1.5rem', letterSpacing: '-0.5px', lineHeight: 1.1, margin: 0 }}>
          {title}
        </h3>
        <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '13.5px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, margin: 0 }}>
          {description}
        </p>
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />

      {/* feature rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {features.map(f => (
          <div key={f.title} style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent, flexShrink: 0, marginTop: 6 }} />
            <div>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '13.5px', color: '#fff', margin: 0 }}>{f.title}</p>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, margin: '2px 0 0' }}>{f.body}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export default function SolanaSection() {
  return (
    <section className="sec sec-v-lg" style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>

      {/* header */}
      <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={stagger(0.1)}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '52ch' }}
      >
        <motion.div variants={fadeUp}>
          <div className="liquid-glass" style={{ borderRadius: 9999, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '5px 14px' }}>
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '10px', color: SOLANA_COLOR, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Dual Mode</span>
          </div>
        </motion.div>
        <motion.h2 variants={fadeUp}
          style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', lineHeight: 1.05, letterSpacing: '-1.5px', margin: 0 }}
        >
          Semi-decentralized.<br />Your money never leaves your wallet.
        </motion.h2>
        <motion.p variants={fadeUp}
          style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '0.95rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, margin: 0 }}
        >
          Trade on Solana with your own wallet, or connect a crypto exchange account. Same strategy either way. Pick what works for you.
        </motion.p>
      </motion.div>

      {/* two cards side by side */}
      <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={stagger(0.12)}
        className="grid-2"
      >
        <ModeCard
          badge="Mode A — Solana"
          badgeColor={SOLANA_COLOR}
          title="Drift + Jupiter + Raydium"
          description="Deposit into your own Solana wallet and let the agent trade for you. Your money never leaves your wallet."
          features={solanaFeatures}
          accent={SOLANA_COLOR}
        />
        <ModeCard
          badge="Mode B — CEX"
          badgeColor={CEX_COLOR}
          title="WEEX · Bybit · Binance"
          description="Already have a Binance, Bybit, or WEEX account? Paste an API key and the agent starts trading in your existing account."
          features={cexFeatures}
          accent={CEX_COLOR}
        />
      </motion.div>

    </section>
  )
}
