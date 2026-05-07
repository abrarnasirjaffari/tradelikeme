import { motion } from 'framer-motion'
import { Shield, BarChart2, Zap } from 'lucide-react'
import type { RiskMode } from '../../services/api'

interface Props {
  mode: RiskMode
  onChange: (mode: RiskMode) => void
  loading?: boolean
}

const MODES: {
  key: RiskMode
  label: string
  icon: React.ReactNode
  color: string
  selectedBg: string
  leverage: string
  margin: string
  description: string
}[] = [
  {
    key: 'conservative',
    label: 'Conservative',
    icon: <Shield size={18} color="#60a5fa" strokeWidth={1.8} />,
    color: '#60a5fa',
    selectedBg: 'rgba(96,165,250,0.12)',
    leverage: '50-100x',
    margin: '0.25-0.5% per trade',
    description: '20+ trades before liquidation risk. Best for large deposits.',
  },
  {
    key: 'medium',
    label: 'Medium',
    icon: <BarChart2 size={18} color="#a78bfa" strokeWidth={1.8} />,
    color: '#a78bfa',
    selectedBg: 'rgba(167,139,250,0.12)',
    leverage: '50-200x',
    margin: '0.5-1% per trade',
    description: '8-10 trade buffer. Balanced for experienced traders.',
  },
  {
    key: 'aggressive',
    label: 'Aggressive',
    icon: <Zap size={18} color="#f59e0b" strokeWidth={1.8} />,
    color: '#f59e0b',
    selectedBg: 'rgba(245,158,11,0.12)',
    leverage: '50-300x',
    margin: '1-2% per trade',
    description: '4-5 trade buffer. High reward, for risk-tolerant traders.',
  },
]

const BADGE_COLORS: Record<RiskMode, { bg: string; color: string }> = {
  conservative: { bg: 'rgba(96,165,250,0.15)', color: '#60a5fa' },
  medium: { bg: 'rgba(167,139,250,0.15)', color: '#a78bfa' },
  aggressive: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
}

export default function RiskModeSelector({ mode, onChange, loading }: Props) {
  const badge = BADGE_COLORS[mode]

  return (
    <>
      <style>{`
        @media (max-width: 639px) {
          .risk-cards { flex-direction: column !important; }
        }
      `}</style>
      <motion.div
        className="liquid-glass"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ borderRadius: '1.75rem', padding: '1.75rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <span style={{
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 600,
            fontSize: '15px',
            color: '#fff',
          }}>Risk Mode</span>
          <span style={{
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 500,
            fontSize: '12px',
            color: badge.color,
            background: badge.bg,
            borderRadius: '999px',
            padding: '3px 10px',
            textTransform: 'capitalize',
          }}>{mode}</span>
        </div>

        <div
          className="risk-cards"
          style={{ display: 'flex', flexDirection: 'row', gap: '0.75rem' }}
        >
          {MODES.map(m => (
            <button
              key={m.key}
              type="button"
              onClick={() => !loading && onChange(m.key)}
              style={{
                flex: 1,
                borderRadius: '1rem',
                padding: '1.25rem 1.5rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                background: mode === m.key ? m.selectedBg : 'rgba(255,255,255,0.04)',
                outline: mode === m.key ? `1.5px solid ${m.color}` : '1px solid rgba(255,255,255,0.1)',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.15s',
              }}
            >
              <div>{m.icon}</div>
              <p style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 600,
                fontSize: '14px',
                color: '#fff',
                margin: 0,
              }}>{m.label}</p>
              <p style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 300,
                fontSize: '11px',
                color: 'rgba(255,255,255,0.4)',
                margin: 0,
              }}>{m.leverage} · {m.margin}</p>
              <p style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 300,
                fontSize: '12px',
                color: 'rgba(255,255,255,0.5)',
                margin: 0,
              }}>{m.description}</p>
            </button>
          ))}
        </div>
      </motion.div>
    </>
  )
}
