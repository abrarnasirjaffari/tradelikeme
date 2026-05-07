import { motion } from 'framer-motion'
import { ExternalLink, ArrowUpDown } from 'lucide-react'
import type { VaultHistoryItem } from '../../services/api'

interface Props {
  history: VaultHistoryItem[]
}

export default function VaultHistory({ history }: Props) {
  return (
    <motion.div
      className="liquid-glass"
      style={{ borderRadius: '1.75rem', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
    >
      <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '15px', color: '#fff', letterSpacing: '-0.2px' }}>
        Transaction History
      </span>

      {history.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '2rem 0' }}>
          <ArrowUpDown size={28} color="rgba(255,255,255,0.2)" />
          <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>
            No transactions yet
          </span>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Date', 'Type', 'Amount', 'Tx'].map(col => (
                  <th
                    key={col}
                    style={{
                      fontFamily: "'Barlow', sans-serif",
                      fontWeight: 500,
                      fontSize: '11px',
                      color: 'rgba(255,255,255,0.35)',
                      textAlign: 'left',
                      paddingBottom: '0.75rem',
                      paddingRight: col !== 'Tx' ? '1.5rem' : 0,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((item, i) => {
                const isDeposit = item.type === 'deposit'
                const date = new Date(item.createdAt)
                const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })
                const timeStr = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })

                return (
                  <tr
                    key={item.id}
                    style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <td style={{ paddingTop: '0.875rem', paddingBottom: '0.875rem', paddingRight: '1.5rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '13px', color: 'rgba(255,255,255,0.75)', whiteSpace: 'nowrap' }}>
                          {dateStr}
                        </span>
                        <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                          {timeStr}
                        </span>
                      </div>
                    </td>

                    <td style={{ paddingTop: '0.875rem', paddingBottom: '0.875rem', paddingRight: '1.5rem' }}>
                      <span style={{
                        fontFamily: "'Barlow', sans-serif",
                        fontWeight: 500,
                        fontSize: '11px',
                        color: isDeposit ? '#22c55e' : '#eab308',
                        background: isDeposit ? 'rgba(34,197,94,0.12)' : 'rgba(234,179,8,0.15)',
                        borderRadius: 9999,
                        padding: '3px 10px',
                        whiteSpace: 'nowrap',
                        textTransform: 'capitalize',
                      }}>
                        {item.type}
                      </span>
                    </td>

                    <td style={{ paddingTop: '0.875rem', paddingBottom: '0.875rem', paddingRight: '1.5rem' }}>
                      <span style={{
                        fontFamily: "'Instrument Serif', serif",
                        fontStyle: 'italic',
                        fontSize: '14px',
                        color: isDeposit ? '#22c55e' : '#f97316',
                        whiteSpace: 'nowrap',
                      }}>
                        {isDeposit ? '+' : '-'}${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        <span style={{ fontFamily: "'Barlow', sans-serif", fontStyle: 'normal', fontWeight: 300, fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginLeft: '0.35rem' }}>
                          {item.currency}
                        </span>
                      </span>
                    </td>

                    <td style={{ paddingTop: '0.875rem', paddingBottom: '0.875rem' }}>
                      {item.txSignature ? (
                        <a
                          href={`https://solscan.io/tx/${item.txSignature}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.15s' }}
                          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
                        >
                          <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '12px' }}>
                            {item.txSignature.slice(0, 4)}...{item.txSignature.slice(-4)}
                          </span>
                          <ExternalLink size={11} />
                        </a>
                      ) : (
                        <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  )
}
