import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import type { StrategyInfoData } from '../../services/api'

interface Props {
  strategy: StrategyInfoData
}

const PRIMARY_TFS = new Set(['4H', '15M'])

const GRADE_COLORS: Record<StrategyInfoData['grade'], { text: string; bg: string }> = {
  S: { text: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  A: { text: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  B: { text: '#60a5fa', bg: 'rgba(96,165,250,0.15)' },
  C: { text: 'rgba(255,255,255,0.5)', bg: 'rgba(255,255,255,0.08)' },
}

const LABEL_STYLE: React.CSSProperties = {
  fontFamily: "'Barlow', sans-serif",
  fontWeight: 300,
  fontSize: '11px',
  color: 'rgba(255,255,255,0.35)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: '0.5rem',
}

const DIVIDER_STYLE: React.CSSProperties = {
  height: '1px',
  background: 'rgba(255,255,255,0.06)',
  flexShrink: 0,
}

function formatStartDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default function StrategyInfo({ strategy }: Props) {
  const grade = GRADE_COLORS[strategy.grade]

  return (
    <motion.div
      className="liquid-glass"
      style={{ borderRadius: '1.75rem', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
        <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '1.1rem', color: '#fff' }}>
          {strategy.name}
        </span>
        <span style={{
          fontFamily: "'Barlow', sans-serif",
          fontWeight: 600,
          fontSize: '12px',
          color: grade.text,
          background: grade.bg,
          borderRadius: 9999,
          padding: '3px 12px',
          flexShrink: 0,
        }}>
          {strategy.grade}-tier
        </span>
      </div>

      <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>
        {strategy.description}
      </p>

      <div style={DIVIDER_STYLE} />

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={LABEL_STYLE}>Strategy Rules</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          {strategy.rules.map((rule, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
              <span style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 500,
                fontSize: '11px',
                color: '#0052FF',
                background: 'rgba(0,82,255,0.15)',
                borderRadius: 9999,
                padding: '1px 7px',
                minWidth: '20px',
                textAlign: 'center',
                flexShrink: 0,
                lineHeight: '18px',
              }}>
                {i + 1}
              </span>
              <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                {rule}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={DIVIDER_STYLE} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <span style={LABEL_STYLE}>Verified Trader</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <CheckCircle2 size={13} color="#22c55e" strokeWidth={2.5} style={{ flexShrink: 0 }} />
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '13px', color: '#fff' }}>
              {strategy.trader}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <span style={LABEL_STYLE}>Fee</span>
          <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '13px', color: '#fff' }}>
            {strategy.fee}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <span style={LABEL_STYLE}>Max Positions</span>
          <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '13px', color: '#fff' }}>
            {strategy.maxPositions} concurrent
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <span style={LABEL_STYLE}>Active Since</span>
          <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '13px', color: '#fff' }}>
            {formatStartDate(strategy.startDate)}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', gridColumn: '1 / -1' }}>
          <span style={LABEL_STYLE}>Total AUM</span>
          <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '13px', color: '#fff' }}>
            ${strategy.aum.toLocaleString()} USDC
          </span>
        </div>
      </div>

      <div style={DIVIDER_STYLE} />

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={LABEL_STYLE}>Coins Traded</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {strategy.coins.map((coin) => (
            <span key={coin} style={{
              fontFamily: "'Barlow', sans-serif",
              fontSize: '11px',
              color: '#fff',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 9999,
              padding: '3px 10px',
            }}>
              {coin}
            </span>
          ))}
        </div>
      </div>

      <div style={DIVIDER_STYLE} />

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={LABEL_STYLE}>Timeframes</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {strategy.timeframes.map((tf) => (
            <span key={tf} style={{
              fontFamily: "'Barlow', sans-serif",
              fontSize: '11px',
              color: PRIMARY_TFS.has(tf) ? '#60a5fa' : '#fff',
              background: PRIMARY_TFS.has(tf) ? 'rgba(0,82,255,0.15)' : 'rgba(255,255,255,0.08)',
              borderRadius: 9999,
              padding: '3px 10px',
            }}>
              {tf}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
