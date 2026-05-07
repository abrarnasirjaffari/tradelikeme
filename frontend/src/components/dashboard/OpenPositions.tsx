import { motion } from 'framer-motion'
import { Target } from 'lucide-react'
import type { Position } from '../../services/api'

interface Props {
  positions: Position[]
  onClose?: (positionId: string) => void
}

function formatDuration(isoStart: string): string {
  const ms = Date.now() - new Date(isoStart).getTime()
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h`
  return `${h}h ${m}m`
}

function DirBadge({ direction }: { direction: 'LONG' | 'SHORT' }) {
  const isLong = direction === 'LONG'
  return (
    <span style={{
      fontFamily: "'Barlow', sans-serif",
      fontWeight: 500,
      fontSize: '11px',
      color: isLong ? '#22c55e' : '#ef4444',
      background: isLong ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
      borderRadius: 9999,
      padding: '2px 8px',
      whiteSpace: 'nowrap' as const,
    }}>{direction}</span>
  )
}

const HEADERS = [
  { label: 'Coin',    mobile: true  },
  { label: 'Dir',     mobile: true  },
  { label: 'Entry',   mobile: true  },
  { label: 'Current', mobile: true  },
  { label: 'P&L $',   mobile: true  },
  { label: 'P&L %',   mobile: true  },
  { label: 'Qty',     mobile: false },
  { label: 'Lev',     mobile: false },
  { label: 'SL',      mobile: false },
  { label: 'TP1',     mobile: false },
  { label: 'TP2',     mobile: false },
  { label: 'Open',    mobile: false },
  { label: 'Margin',  mobile: false },
  { label: 'Liq',     mobile: false },
  { label: '',        mobile: true  },
]

function fmt(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })
}

export default function OpenPositions({ positions, onClose }: Props) {
  return (
    <div
      className="liquid-glass"
      style={{ borderRadius: '1.75rem', padding: '1.75rem', overflowX: 'auto' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <span style={{
          fontFamily: "'Barlow', sans-serif",
          fontWeight: 600,
          fontSize: '15px',
          color: '#fff',
        }}>Open Positions</span>
        <span style={{
          fontFamily: "'Barlow', sans-serif",
          fontWeight: 500,
          fontSize: '11px',
          color: 'rgba(255,255,255,0.5)',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: 9999,
          padding: '2px 10px',
        }}>{positions.length}</span>
      </div>

      {positions.length === 0 ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          padding: '3rem 1rem',
          color: 'rgba(255,255,255,0.25)',
        }}>
          <Target size={32} strokeWidth={1.2} />
          <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '14px' }}>
            No open positions
          </span>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
          <thead>
            <tr>
              {HEADERS.map((h, idx) => (
                <th
                  key={idx}
                  className={h.mobile ? '' : 'hide-mobile'}
                  style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontWeight: 500,
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.35)',
                    textAlign: (h.label === 'P&L $' || h.label === 'P&L %') ? 'right' : 'left',
                    padding: '0 8px 10px',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    whiteSpace: 'nowrap',
                    textTransform: 'uppercase',
                  }}
                >{h.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {positions.map((pos, i) => (
              <motion.tr
                key={pos.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.012, duration: 0.2 }}
                style={{ background: 'transparent', cursor: 'default' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.02)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'
                }}
              >
                <td style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#fff',
                  padding: '9px 8px',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  whiteSpace: 'nowrap',
                }}>{pos.coin}</td>

                <td style={{ padding: '9px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <DirBadge direction={pos.direction} />
                </td>

                <td style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 400,
                  fontSize: '13px',
                  color: '#fff',
                  padding: '9px 8px',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  whiteSpace: 'nowrap',
                }}>{fmt(pos.entryPrice)}</td>

                <td style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 600,
                  fontSize: '13px',
                  color: '#fff',
                  padding: '9px 8px',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  whiteSpace: 'nowrap',
                }}>{fmt(pos.currentPrice)}</td>

                <td style={{
                  padding: '9px 8px',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  textAlign: 'right',
                  whiteSpace: 'nowrap',
                }}>
                  <span style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontStyle: 'italic',
                    fontSize: '1rem',
                    color: pos.unrealizedPnl >= 0 ? '#22c55e' : '#ef4444',
                  }}>
                    {pos.unrealizedPnl >= 0 ? '+' : ''}{pos.unrealizedPnl.toFixed(2)}
                  </span>
                </td>

                <td style={{
                  padding: '9px 8px',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  textAlign: 'right',
                  whiteSpace: 'nowrap',
                }}>
                  <span style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontStyle: 'italic',
                    fontSize: '1rem',
                    color: pos.unrealizedPnlPct >= 0 ? '#22c55e' : '#ef4444',
                  }}>
                    {pos.unrealizedPnlPct >= 0 ? '+' : ''}{pos.unrealizedPnlPct.toFixed(2)}%
                  </span>
                </td>

                <td
                  className="hide-mobile"
                  style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontWeight: 400,
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.7)',
                    padding: '9px 8px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    whiteSpace: 'nowrap',
                  }}>{pos.qty}</td>

                <td
                  className="hide-mobile"
                  style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontWeight: 500,
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.7)',
                    padding: '9px 8px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    whiteSpace: 'nowrap',
                  }}>{pos.leverage}x</td>

                <td
                  className="hide-mobile"
                  style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontWeight: 400,
                    fontSize: '13px',
                    color: '#ef4444',
                    padding: '9px 8px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    whiteSpace: 'nowrap',
                  }}>{fmt(pos.slPrice)}</td>

                <td
                  className="hide-mobile"
                  style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontWeight: 400,
                    fontSize: '13px',
                    color: '#22c55e',
                    padding: '9px 8px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    whiteSpace: 'nowrap',
                  }}>{fmt(pos.tp1Price)}</td>

                <td
                  className="hide-mobile"
                  style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontWeight: 400,
                    fontSize: '13px',
                    color: '#4ade80',
                    padding: '9px 8px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    whiteSpace: 'nowrap',
                  }}>{fmt(pos.tp2Price)}</td>

                <td
                  className="hide-mobile"
                  style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontWeight: 300,
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.5)',
                    padding: '9px 8px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    whiteSpace: 'nowrap',
                  }}>{formatDuration(pos.openedAt)}</td>

                <td
                  className="hide-mobile"
                  style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontWeight: 400,
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.7)',
                    padding: '9px 8px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    whiteSpace: 'nowrap',
                  }}>${pos.margin.toFixed(2)}</td>

                <td
                  className="hide-mobile"
                  style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontWeight: 400,
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.5)',
                    padding: '9px 8px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    whiteSpace: 'nowrap',
                  }}>{fmt(pos.liquidationPrice)}</td>

                <td style={{
                  padding: '9px 8px',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  whiteSpace: 'nowrap',
                }}>
                  {onClose && (
                    <button
                      onClick={() => onClose(pos.id)}
                      style={{
                        fontFamily: "'Barlow', sans-serif",
                        fontWeight: 500,
                        fontSize: '11px',
                        color: '#ef4444',
                        background: 'rgba(239,68,68,0.15)',
                        border: 'none',
                        borderRadius: 9999,
                        padding: '3px 10px',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(239,68,68,0.28)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(239,68,68,0.15)'
                      }}
                    >Close</button>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      )}

      <style>{`
        @media (max-width: 639px) {
          .hide-mobile { display: none !important; }
        }
      `}</style>
    </div>
  )
}
