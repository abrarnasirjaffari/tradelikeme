import { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart2, ExternalLink } from 'lucide-react'

type Trade = {
  id: string
  coin: string
  direction: 'LONG' | 'SHORT'
  entryPrice: number
  exitPrice: number | null
  pnl: number | null
  pnlPct: number | null
  txSignature: string | null
  status: 'open' | 'closed' | 'sl_hit' | 'tp1_hit' | 'tp2_hit'
  openedAt: string
  closedAt: string | null
}

interface Props {
  trades: Trade[]
}

const PAGE_SIZE = 20

function formatDuration(start: string, end: string | null): string {
  if (!end) return '—'
  const ms = new Date(end).getTime() - new Date(start).getTime()
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  if (h >= 24) return `${Math.floor(h/24)}d ${h%24}h`
  return `${h}h ${m}m`
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getRowTint(trade: Trade): string {
  if (trade.status === 'tp1_hit' || trade.status === 'tp2_hit') return 'rgba(34,197,94,0.04)'
  if (trade.status === 'sl_hit') return 'rgba(239,68,68,0.04)'
  if (trade.status === 'closed') {
    if (trade.pnl !== null && trade.pnl > 0) return 'rgba(34,197,94,0.04)'
    if (trade.pnl !== null && trade.pnl < 0) return 'rgba(239,68,68,0.04)'
  }
  return 'transparent'
}

function StatusBadge({ status }: { status: Trade['status'] }) {
  const map: Record<Trade['status'], { label: string; color: string; bg: string }> = {
    open:    { label: 'Open',   color: '#60a5fa', bg: 'rgba(96,165,250,0.15)' },
    tp1_hit: { label: 'TP1',    color: '#22c55e', bg: 'rgba(34,197,94,0.15)'  },
    tp2_hit: { label: 'TP2',    color: '#4ade80', bg: 'rgba(74,222,128,0.15)' },
    sl_hit:  { label: 'SL',     color: '#ef4444', bg: 'rgba(239,68,68,0.15)'  },
    closed:  { label: 'Closed', color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.08)' },
  }
  const { label, color, bg } = map[status]
  return (
    <span style={{
      fontFamily: "'Barlow', sans-serif",
      fontWeight: 500,
      fontSize: '11px',
      color,
      background: bg,
      borderRadius: 9999,
      padding: '2px 8px',
      whiteSpace: 'nowrap' as const,
    }}>{label}</span>
  )
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

export default function TradeHistory({ trades }: Props) {
  const [shown, setShown] = useState(PAGE_SIZE)
  const visible = trades.slice(0, shown)
  const hasMore = trades.length > shown

  return (
    <div
      className="liquid-glass"
      style={{ borderRadius: '1.75rem', padding: '1.75rem', overflowX: 'auto' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <span style={{
          fontFamily: "'Barlow', sans-serif",
          fontWeight: 600,
          fontSize: '15px',
          color: '#fff',
        }}>Trade History</span>
        <span style={{
          fontFamily: "'Barlow', sans-serif",
          fontWeight: 500,
          fontSize: '11px',
          color: 'rgba(255,255,255,0.5)',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: 9999,
          padding: '2px 10px',
        }}>{trades.length}</span>
      </div>

      {trades.length === 0 ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          padding: '3rem 1rem',
          color: 'rgba(255,255,255,0.25)',
        }}>
          <BarChart2 size={32} strokeWidth={1.2} />
          <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '14px' }}>
            No trades yet
          </span>
        </div>
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
            <thead>
              <tr>
                {(['Date', 'Closed', 'Coin', 'Dir', 'Entry', 'Exit', 'P&L$', 'P&L%', 'Duration', 'Status'] as const).map((col) => (
                  <th
                    key={col}
                    style={{
                      fontFamily: "'Barlow', sans-serif",
                      fontWeight: 500,
                      fontSize: '11px',
                      color: 'rgba(255,255,255,0.35)',
                      textAlign: col === 'P&L$' || col === 'P&L%' ? 'right' : 'left',
                      padding: '0 8px 10px',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                      whiteSpace: 'nowrap',
                    }}
                    className={col === 'Closed' || col === 'Entry' || col === 'Exit' || col === 'Duration' ? 'hide-mobile' : ''}
                  >{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((trade, i) => (
                <motion.tr
                  key={trade.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i < PAGE_SIZE ? i * 0.012 : 0, duration: 0.2 }}
                  style={{ background: getRowTint(trade), cursor: 'default' }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLTableRowElement
                    el.style.background = `rgba(255,255,255,0.02)`
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLTableRowElement
                    el.style.background = getRowTint(trade)
                  }}
                >
                  <td style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontWeight: 300,
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.5)',
                    padding: '9px 8px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    whiteSpace: 'nowrap',
                  }}>{formatDate(trade.openedAt)}</td>

                  <td className="hide-mobile" style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.5)', padding: '9px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)', whiteSpace: 'nowrap' }}>
                    {trade.closedAt ? formatDate(trade.closedAt) : <span style={{ color: 'rgba(255,255,255,0.3)' }}>—</span>}
                  </td>

                  <td style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#fff',
                    padding: '9px 8px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}>{trade.coin}</td>

                  <td style={{ padding: '9px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <DirBadge direction={trade.direction} />
                  </td>

                  <td
                    className="hide-mobile"
                    style={{
                      fontFamily: "'Barlow', sans-serif",
                      fontWeight: 400,
                      fontSize: '13px',
                      color: '#fff',
                      padding: '9px 8px',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                    }}>{trade.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</td>

                  <td
                    className="hide-mobile"
                    style={{
                      fontFamily: "'Barlow', sans-serif",
                      fontWeight: 400,
                      fontSize: '13px',
                      color: '#fff',
                      padding: '9px 8px',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                    }}>
                    {trade.exitPrice !== null
                      ? trade.exitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })
                      : <span style={{ color: 'rgba(255,255,255,0.3)' }}>—</span>}
                  </td>

                  <td style={{
                    padding: '9px 8px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    textAlign: 'right',
                    whiteSpace: 'nowrap',
                  }}>
                    {trade.pnl !== null ? (
                      <span style={{
                        fontFamily: "'Instrument Serif', serif",
                        fontStyle: 'italic',
                        fontSize: '1rem',
                        color: trade.pnl >= 0 ? '#22c55e' : '#ef4444',
                      }}>
                        {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                      </span>
                    ) : (
                      <span style={{ color: 'rgba(255,255,255,0.3)', fontFamily: "'Barlow', sans-serif", fontSize: '13px' }}>—</span>
                    )}
                  </td>

                  <td style={{ padding: '9px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {trade.pnlPct !== null ? (
                      <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '12px', color: trade.pnlPct >= 0 ? '#22c55e' : '#ef4444' }}>
                        {trade.pnlPct >= 0 ? '+' : ''}{trade.pnlPct.toFixed(2)}%
                      </span>
                    ) : <span style={{ color: 'rgba(255,255,255,0.3)', fontFamily: "'Barlow', sans-serif", fontSize: '13px' }}>—</span>}
                  </td>

                  <td className="hide-mobile" style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.5)', padding: '9px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)', whiteSpace: 'nowrap' }}>
                    {formatDuration(trade.openedAt, trade.closedAt)}
                  </td>

                  <td style={{ padding: '9px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <StatusBadge status={trade.status} />
                    {trade.txSignature && (
                      <a href={`https://solscan.io/tx/${trade.txSignature}`} target="_blank" rel="noopener noreferrer"
                        style={{ marginLeft: 6, color: 'rgba(255,255,255,0.3)', verticalAlign: 'middle', display: 'inline-flex' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
                        onClick={e => e.stopPropagation()}
                      >
                        <ExternalLink size={11} />
                      </a>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {hasMore && (
            <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
              <button
                onClick={() => setShown(s => s + PAGE_SIZE)}
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 500,
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.6)',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 9999,
                  padding: '8px 22px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#fff'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                }}
              >
                Show more ({trades.length - shown} remaining)
              </button>
            </div>
          )}
        </>
      )}

      <style>{`
        @media (max-width: 639px) {
          .hide-mobile { display: none !important; }
        }
      `}</style>
    </div>
  )
}
