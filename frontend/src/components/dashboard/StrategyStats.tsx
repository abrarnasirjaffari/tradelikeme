import { motion } from 'framer-motion'
import type { PnlSummary } from '../../services/api'

interface Props {
  pnl: PnlSummary
}

interface StatItem {
  label: string
  value: string
  color: string
}

export default function StrategyStats({ pnl }: Props) {
  const stats: StatItem[] = [
    {
      label: 'Win Rate',
      value: `${pnl.winRate}%`,
      color: pnl.winRate >= 55 ? '#22c55e' : '#ef4444',
    },
    {
      label: 'Total Trades',
      value: `${pnl.totalTrades}`,
      color: '#fff',
    },
    {
      label: 'Avg Return',
      value: `+${pnl.avgReturn}%`,
      color: '#22c55e',
    },
    {
      label: 'Max Drawdown',
      value: `-${pnl.maxDrawdown}%`,
      color: '#ef4444',
    },
    {
      label: 'RRR',
      value: `${pnl.rrr}:1`,
      color: '#fff',
    },
    {
      label: 'Total P&L',
      value: `${pnl.totalPnl >= 0 ? '+' : ''}$${pnl.totalPnl.toFixed(2)}`,
      color: pnl.totalPnl >= 0 ? '#22c55e' : '#ef4444',
    },
  ]

  return (
    <motion.div
      className="liquid-glass"
      style={{ borderRadius: '1.75rem', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '1rem', color: '#fff' }}>
          Strategy Performance
        </span>
        <div style={{
          fontFamily: "'Barlow', sans-serif",
          fontWeight: 600,
          fontSize: '11px',
          color: '#fff',
          background: '#0052FF',
          borderRadius: 9999,
          padding: '4px 12px',
          letterSpacing: '0.01em',
          flexShrink: 0,
        }}>
          Proven Win Rate
        </div>
      </div>

      {/* Stats grid — 2 cols mobile, 3 cols desktop */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1.25rem',
      }}
        className="stats-grid"
      >
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.15 + i * 0.05 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}
          >
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {stat.label}
            </span>
            <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '1.8rem', color: stat.color, letterSpacing: '-1px', lineHeight: 1 }}>
              {stat.value}
            </span>
          </motion.div>
        ))}
      </div>

      <style>{`
        @media (min-width: 640px) {
          .stats-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>
    </motion.div>
  )
}
