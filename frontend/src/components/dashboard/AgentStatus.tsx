import { motion } from 'framer-motion'
import type { AgentStatusData } from '../../services/api'

interface Props {
  agentStatus: AgentStatusData
}

function relativeTime(iso: string | null, future = false): string {
  if (!iso) return '—'
  const ms = future ? new Date(iso).getTime() - Date.now() : Date.now() - new Date(iso).getTime()
  const absMs = Math.abs(ms)
  const m = Math.floor(absMs / 60000)
  const h = Math.floor(absMs / 3600000)
  const d = Math.floor(absMs / 86400000)
  if (d > 0) return future ? `in ${d}d` : `${d}d ago`
  if (h > 0) return future ? `in ${h}h ${m % 60}m` : `${h}h ${m % 60}m ago`
  return future ? `in ${m}m` : `${m}m ago`
}

const STATUS_CONFIG = {
  running:  { dot: '#22c55e', text: 'Running',         textColor: '#22c55e', pulse: true },
  scanning: { dot: '#60a5fa', text: 'Scanning Zones…', textColor: '#60a5fa', pulse: true },
  stopped:  { dot: 'rgba(255,255,255,0.3)', text: 'Stopped', textColor: 'rgba(255,255,255,0.4)', pulse: false },
}

const WATCH_TYPE_CONFIG = {
  zone_touch: { label: 'Zone Touch', color: '#60a5fa', bg: 'rgba(96,165,250,0.15)' },
  tp1:        { label: 'TP1',        color: '#22c55e', bg: 'rgba(34,197,94,0.15)'  },
  sl:         { label: 'SL',         color: '#ef4444', bg: 'rgba(239,68,68,0.15)'  },
}

export default function AgentStatus({ agentStatus }: Props) {
  const cfg = STATUS_CONFIG[agentStatus.status]

  return (
    <motion.div
      className="liquid-glass"
      style={{ borderRadius: '1.75rem', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '15px', color: '#fff' }}>
          Agent Status
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
          <div
            className={cfg.pulse ? 'agent-dot-pulse' : undefined}
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: cfg.dot,
              boxShadow: cfg.pulse ? `0 0 6px ${cfg.dot}` : 'none',
              flexShrink: 0,
            }}
          />
          <span style={{
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 600,
            fontSize: '12px',
            color: cfg.textColor,
          }}>
            {cfg.text}
          </span>
        </div>
      </div>

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <span style={{
          fontFamily: "'Barlow', sans-serif",
          fontWeight: 500,
          fontSize: '11px',
          color: 'rgba(255,255,255,0.35)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: '0.15rem',
        }}>
          Scan Times
        </span>
        <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
          Last scan:{' '}
          <span style={{ color: '#fff', fontWeight: 500 }}>{relativeTime(agentStatus.lastScanAt)}</span>
        </span>
        <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
          Next scan:{' '}
          <span style={{ color: '#fff', fontWeight: 500 }}>{relativeTime(agentStatus.nextScanAt, true)}</span>
        </span>
      </div>

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <span style={{
          fontFamily: "'Barlow', sans-serif",
          fontWeight: 500,
          fontSize: '11px',
          color: 'rgba(255,255,255,0.35)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}>
          Watching {agentStatus.watchlist.length} coins
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {agentStatus.watchlist.map(coin => (
            <span
              key={coin}
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 500,
                fontSize: '11px',
                color: '#fff',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: 9999,
                padding: '2px 8px',
                whiteSpace: 'nowrap' as const,
              }}
            >
              {coin}
            </span>
          ))}
        </div>
      </div>

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <span style={{
          fontFamily: "'Barlow', sans-serif",
          fontWeight: 500,
          fontSize: '11px',
          color: 'rgba(255,255,255,0.35)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}>
          Sentinel Watches
        </span>

        {agentStatus.sentinelWatches.length === 0 ? (
          <span style={{
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 300,
            fontSize: '13px',
            color: 'rgba(255,255,255,0.3)',
          }}>
            No active watches
          </span>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {agentStatus.sentinelWatches.map((watch, i) => {
              const typeCfg = WATCH_TYPE_CONFIG[watch.type]
              return (
                <motion.div
                  key={`${watch.coin}-${watch.type}-${i}`}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut', delay: 0.05 * i }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}
                >
                  <span style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontWeight: 600,
                    fontSize: '13px',
                    color: '#fff',
                    minWidth: '3.5rem',
                  }}>
                    {watch.coin}
                  </span>
                  <span style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontWeight: 300,
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.55)',
                    flexShrink: 0,
                  }}>
                    @ ${watch.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                  </span>
                  <span style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontWeight: 500,
                    fontSize: '11px',
                    color: typeCfg.color,
                    background: typeCfg.bg,
                    borderRadius: 9999,
                    padding: '2px 8px',
                    whiteSpace: 'nowrap' as const,
                    marginLeft: 'auto',
                    flexShrink: 0,
                  }}>
                    {typeCfg.label}
                  </span>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes agent-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        .agent-dot-pulse {
          animation: agent-pulse 1.8s ease-in-out infinite;
        }
      `}</style>
    </motion.div>
  )
}
