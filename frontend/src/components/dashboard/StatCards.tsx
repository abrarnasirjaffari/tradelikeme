import { motion } from 'framer-motion'
import type { PnlSummary, Vault } from '../../services/api'

interface Props {
  pnl: PnlSummary
  vault: Vault
}

interface CardDef {
  label: string
  value: string
  color: string
  sub?: string
  subColor?: string
}

function fmtUsd(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtPct(n: number, forceSign = true): string {
  const sign = forceSign && n >= 0 ? '+' : ''
  return `${sign}${n.toFixed(2)}%`
}

export default function StatCards({ pnl }: Props) {
  const green = '#22c55e'
  const red = '#ef4444'
  const white = '#fff'

  const rawCards: (CardDef | null)[] = [
    pnl.vaultValue != null
      ? {
          label: 'Vault Value',
          value: fmtUsd(pnl.vaultValue),
          color: white,
          sub:
            pnl.totalPnl != null && pnl.totalPnlPct != null
              ? `${pnl.totalPnl >= 0 ? '+' : '-'}${fmtUsd(Math.abs(pnl.totalPnl))} (${fmtPct(pnl.totalPnlPct)})`
              : undefined,
          subColor: pnl.totalPnl != null ? (pnl.totalPnl >= 0 ? green : red) : 'rgba(255,255,255,0.45)',
        }
      : null,

    pnl.totalPnlPct != null
      ? {
          label: 'Total Return',
          value: fmtPct(pnl.totalPnlPct),
          color: pnl.totalPnlPct >= 0 ? green : red,
        }
      : null,

    pnl.activePositions != null
      ? {
          label: 'Active Positions',
          value: String(pnl.activePositions),
          color: white,
        }
      : null,

    pnl.avgDuration != null
      ? {
          label: 'Avg Duration',
          value: pnl.avgDuration,
          color: white,
        }
      : null,

    pnl.bestTrade != null
      ? {
          label: 'Best Trade',
          value: `+${fmtUsd(pnl.bestTrade)}`,
          color: green,
        }
      : null,

    pnl.worstTrade != null
      ? {
          label: 'Worst Trade',
          value: `-${fmtUsd(Math.abs(pnl.worstTrade))}`,
          color: red,
        }
      : null,

    pnl.profitFactor != null
      ? {
          label: 'Profit Factor',
          value: `${pnl.profitFactor.toFixed(1)}x`,
          color: pnl.profitFactor >= 1 ? green : red,
        }
      : null,

    pnl.monthlyReturn != null
      ? {
          label: 'Monthly Return',
          value: fmtPct(pnl.monthlyReturn),
          color: pnl.monthlyReturn >= 0 ? green : red,
        }
      : null,

    pnl.weeklyReturn != null
      ? {
          label: 'Weekly Return',
          value: fmtPct(pnl.weeklyReturn),
          color: pnl.weeklyReturn >= 0 ? green : red,
        }
      : null,

    pnl.streak != null
      ? {
          label: 'Current Streak',
          value: `${pnl.streak} ${pnl.streakType === 'win' ? 'wins' : 'losses'}`,
          color: pnl.streakType === 'win' ? green : red,
        }
      : null,
  ]

  const cards = rawCards.filter((c): c is CardDef => c !== null)

  if (cards.length === 0) return null

  return (
    <motion.div
      className="liquid-glass"
      style={{ borderRadius: '1.75rem', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
    >
      <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '15px', color: '#fff' }}>
        Portfolio Stats
      </span>

      <div
        className="statcards-grid"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}
      >
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.05 * i }}
            style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '1rem',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.3rem',
            }}
          >
            <span style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 300,
              fontSize: '11px',
              color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}>
              {card.label}
            </span>
            <span style={{
              fontFamily: "'Instrument Serif', serif",
              fontStyle: 'italic',
              fontSize: '1.6rem',
              color: card.color,
              letterSpacing: '-1px',
              lineHeight: 1,
            }}>
              {card.value}
            </span>
            {card.sub != null && (
              <span style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 400,
                fontSize: '12px',
                color: card.subColor ?? 'rgba(255,255,255,0.45)',
              }}>
                {card.sub}
              </span>
            )}
          </motion.div>
        ))}
      </div>

      <style>{`
        @media (min-width: 640px) {
          .statcards-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
      `}</style>
    </motion.div>
  )
}
