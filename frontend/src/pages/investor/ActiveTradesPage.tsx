import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, RefreshCw, X } from 'lucide-react'
import FadingVideo from '../../components/FadingVideo'

const VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4'

const ff: React.CSSProperties = { fontFamily: "'Barlow', sans-serif" }

type Position = {
  id: string
  coin: string
  pair: string
  dotColor: string
  direction: 'LONG' | 'SHORT'
  leverage: string
  entry: number
  current: number
  unrealizedPnl: number
  unrealizedPct: number
  size: string
  margin: number
  tp1: number
  tp1Progress: number
  tp2: number
  tp2Progress: number
  sl: number
  slDistance: number
  openedAgo: string
}

const POSITIONS: Position[] = [
  {
    id: 'sol-long',
    coin: 'SOL', pair: 'SOL/USDT', dotColor: '#9945FF',
    direction: 'LONG', leverage: '200x',
    entry: 182.40, current: 186.20,
    unrealizedPnl: 124.80, unrealizedPct: 2.09,
    size: '10 SOL', margin: 0.91,
    tp1: 188.50, tp1Progress: 65,
    tp2: 192.00, tp2Progress: 30,
    sl: 178.00, slDistance: -2.41,
    openedAgo: '2h 14m ago',
  },
  {
    id: 'btc-short',
    coin: 'BTC', pair: 'BTC/USDT', dotColor: '#f97316',
    direction: 'SHORT', leverage: '200x',
    entry: 67420, current: 66980,
    unrealizedPnl: 88.00, unrealizedPct: 1.30,
    size: '0.002 BTC', margin: 0.67,
    tp1: 65800, tp1Progress: 50,
    tp2: 64200, tp2Progress: 20,
    sl: 69000, slDistance: -2.34,
    openedAgo: '45m ago',
  },
]

function DirBadge({ d }: { d: 'LONG' | 'SHORT' }) {
  return (
    <span style={{
      ...ff, fontWeight: 600, fontSize: 11,
      color: d === 'LONG' ? '#22c55e' : '#ef4444',
      background: d === 'LONG' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
      borderRadius: 9999, padding: '3px 10px',
    }}>{d}</span>
  )
}

function LeverageBadge({ label }: { label: string }) {
  return (
    <span style={{
      ...ff, fontWeight: 500, fontSize: 11,
      color: 'rgba(255,255,255,0.5)',
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 9999, padding: '3px 10px',
    }}>{label}</span>
  )
}

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 9999, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 9999, transition: 'width 0.3s' }} />
    </div>
  )
}

function PositionCard({ pos, onClose }: { pos: Position; onClose: (id: string) => void }) {
  const isLong = pos.direction === 'LONG'
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12, padding: 24,
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: pos.dotColor, flexShrink: 0 }} />
          <span style={{ ...ff, fontWeight: 700, fontSize: 16, color: '#fff' }}>{pos.pair}</span>
          <DirBadge d={pos.direction} />
          <LeverageBadge label={pos.leverage} />
        </div>
        <span style={{ ...ff, fontWeight: 300, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Opened {pos.openedAgo}</span>
      </div>

      {/* Price row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
        {[
          { label: 'Entry Price', value: pos.entry.toLocaleString() },
          { label: 'Current Price', value: pos.current.toLocaleString() },
          { label: 'Unrealized P&L', value: `+$${pos.unrealizedPnl.toFixed(2)} (+${pos.unrealizedPct.toFixed(1)}%)`, isGain: true },
        ].map(({ label, value, isGain }) => (
          <div key={label}>
            <div style={{ ...ff, fontWeight: 400, fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>{label}</div>
            <div style={{ ...ff, fontWeight: 600, fontSize: 15, color: isGain ? '#22c55e' : '#fff' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Size + margin row */}
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ ...ff, fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 3 }}>Size</div>
          <div style={{ ...ff, fontWeight: 500, fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>{pos.size}</div>
        </div>
        <div>
          <div style={{ ...ff, fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 3 }}>Margin</div>
          <div style={{ ...ff, fontWeight: 500, fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>${pos.margin.toFixed(2)}</div>
        </div>
      </div>

      {/* TP1 */}
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ ...ff, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
            TP1 — {isLong ? '$' : '$'}{pos.tp1.toLocaleString()}
          </span>
          <span style={{ ...ff, fontSize: 11, color: '#3b82f6' }}>{pos.tp1Progress}%</span>
        </div>
        <ProgressBar pct={pos.tp1Progress} color="#3b82f6" />
      </div>

      {/* TP2 */}
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ ...ff, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
            TP2 — ${pos.tp2.toLocaleString()}
          </span>
          <span style={{ ...ff, fontSize: 11, color: 'rgba(59,130,246,0.6)' }}>{pos.tp2Progress}%</span>
        </div>
        <ProgressBar pct={pos.tp2Progress} color="rgba(59,130,246,0.5)" />
      </div>

      {/* SL */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ ...ff, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
            SL — ${pos.sl.toLocaleString()}
          </span>
          <span style={{ ...ff, fontSize: 11, color: '#ef4444' }}>{pos.slDistance.toFixed(1)}%</span>
        </div>
        <div style={{ height: 5, background: 'rgba(239,68,68,0.12)', borderRadius: 9999 }}>
          <div style={{ width: '100%', height: '100%', background: 'rgba(239,68,68,0.25)', borderRadius: 9999 }} />
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={() => onClose(pos.id)}
        style={{
          ...ff, fontWeight: 500, fontSize: 13,
          color: '#ef4444',
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 9999, padding: '8px 20px',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)' }}
      >
        <X size={13} /> Close Position
      </button>
    </div>
  )
}

export default function ActiveTradesPage() {
  const navigate = useNavigate()
  const [spinning, setSpinning] = useState(false)
  const [positions, setPositions] = useState<Position[]>(POSITIONS)

  const totalUnrealized = positions.reduce((s, p) => s + p.unrealizedPnl, 0)
  const totalMargin = positions.reduce((s, p) => s + p.margin, 0)

  function handleRefresh() {
    setSpinning(true)
    setTimeout(() => setSpinning(false), 800)
  }

  function handleClose(id: string) {
    setPositions(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div style={{ background: '#000', minHeight: '100vh', fontFamily: "'Barlow', sans-serif" }}>
      <FadingVideo
        src={VIDEO_SRC}
        style={{ position: 'fixed', top: 0, left: '-10%', width: '120%', height: '120%', objectFit: 'cover', objectPosition: 'center top', zIndex: 0 }}
      />
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 0, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
        {/* Sticky header */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 40,
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '0 2rem', height: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                ...ff, fontWeight: 400, fontSize: 13,
                color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                padding: 0, transition: 'color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
            >
              <ArrowLeft size={14} /> Dashboard
            </button>
            <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 14 }}>/</span>
            <h2 style={{ ...ff, fontWeight: 600, fontSize: 15, color: '#fff', margin: 0 }}>Active Positions</h2>
          </div>
          <button
            onClick={handleRefresh}
            style={{
              ...ff, fontWeight: 500, fontSize: 12,
              color: 'rgba(255,255,255,0.6)',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 9999, padding: '7px 12px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
          >
            <RefreshCw size={13} style={{ transition: 'transform 0.6s', transform: spinning ? 'rotate(360deg)' : 'rotate(0deg)' }} />
          </button>
        </div>

        <main style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>
          {/* Ticker summary bar */}
          <div style={{
            display: 'flex', gap: '1.5rem', flexWrap: 'wrap',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 10, padding: '12px 20px',
            marginBottom: '1.5rem',
          }}>
            {[
              { label: 'Total Unrealized P&L', value: `+$${totalUnrealized.toFixed(2)}`, color: '#22c55e' },
              { label: 'Open Positions', value: String(positions.length), color: '#fff' },
              { label: 'Margin Used', value: `$${totalMargin.toFixed(2)}`, color: 'rgba(255,255,255,0.7)' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ ...ff, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{label}:</span>
                <span style={{ ...ff, fontWeight: 600, fontSize: 13, color }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Position cards */}
          {positions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {positions.map(pos => (
                <PositionCard key={pos.id} pos={pos} onClose={handleClose} />
              ))}
            </div>
          ) : (
            <div style={{
              ...ff, fontSize: 14, color: 'rgba(255,255,255,0.25)',
              textAlign: 'center', padding: '4rem 0',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12,
            }}>
              No more active positions
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
