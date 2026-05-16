import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, ArrowLeft } from 'lucide-react'
import FadingVideo from '../../components/FadingVideo'

const VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4'

type TradeRow = {
  id: number
  date: string
  coin: string
  direction: 'LONG' | 'SHORT'
  entry: number
  exit: number
  pnl: number
  pnlPct: number
  duration: string
  strategy: string
  status: 'TP1 HIT' | 'TP2 HIT' | 'SL HIT' | 'CLOSED'
}

const TRADES: TradeRow[] = [
  { id: 1,  date: 'Apr 14 2026', coin: 'SOL',  direction: 'LONG',  entry: 178.40, exit: 184.20, pnl: 87.00,   pnlPct: 3.25,  duration: '4h 12m',  strategy: 'S/D Zones', status: 'TP2 HIT' },
  { id: 2,  date: 'Apr 14 2026', coin: 'BTC',  direction: 'LONG',  entry: 63240,  exit: 65800,  pnl: 128.00,  pnlPct: 4.05,  duration: '6h 30m',  strategy: 'S/D Zones', status: 'TP2 HIT' },
  { id: 3,  date: 'Apr 14 2026', coin: 'XRP',  direction: 'SHORT', entry: 1.392,  exit: 1.368,  pnl: 57.60,   pnlPct: 1.72,  duration: '2h 05m',  strategy: 'S/D Zones', status: 'TP1 HIT' },
  { id: 4,  date: 'Apr 15 2026', coin: 'ETH',  direction: 'LONG',  entry: 3142,   exit: 3280,   pnl: 110.40,  pnlPct: 4.39,  duration: '5h 48m',  strategy: 'S/D Zones', status: 'TP2 HIT' },
  { id: 5,  date: 'Apr 15 2026', coin: 'SUI',  direction: 'SHORT', entry: 0.9537, exit: 0.9750, pnl: -42.10,  pnlPct: -2.23, duration: '1h 22m',  strategy: 'S/D Zones', status: 'SL HIT'  },
  { id: 6,  date: 'Apr 16 2026', coin: 'WIF',  direction: 'LONG',  entry: 2.14,   exit: 2.28,   pnl: 84.00,   pnlPct: 6.54,  duration: '3h 17m',  strategy: 'S/D Zones', status: 'TP2 HIT' },
  { id: 7,  date: 'Apr 16 2026', coin: 'SOL',  direction: 'LONG',  entry: 183.20, exit: 188.60, pnl: 108.00,  pnlPct: 2.95,  duration: '7h 02m',  strategy: 'S/D Zones', status: 'TP2 HIT' },
  { id: 8,  date: 'Apr 17 2026', coin: 'BTC',  direction: 'SHORT', entry: 67420,  exit: 65800,  pnl: 162.00,  pnlPct: 2.40,  duration: '8h 44m',  strategy: 'S/D Zones', status: 'TP2 HIT' },
  { id: 9,  date: 'Apr 17 2026', coin: 'XRP',  direction: 'LONG',  entry: 1.346,  exit: 1.372,  pnl: 52.00,   pnlPct: 1.93,  duration: '3h 31m',  strategy: 'S/D Zones', status: 'TP1 HIT' },
  { id: 10, date: 'Apr 18 2026', coin: 'ETH',  direction: 'SHORT', entry: 3210,   exit: 3110,   pnl: 100.00,  pnlPct: 3.12,  duration: '4h 55m',  strategy: 'S/D Zones', status: 'TP2 HIT' },
  { id: 11, date: 'Apr 19 2026', coin: 'SOL',  direction: 'LONG',  entry: 185.00, exit: 191.40, pnl: 128.00,  pnlPct: 3.46,  duration: '6h 18m',  strategy: 'S/D Zones', status: 'TP2 HIT' },
  { id: 12, date: 'Apr 19 2026', coin: 'WIF',  direction: 'SHORT', entry: 2.36,   exit: 2.28,   pnl: 48.00,   pnlPct: 3.39,  duration: '2h 40m',  strategy: 'S/D Zones', status: 'TP1 HIT' },
  { id: 13, date: 'Apr 20 2026', coin: 'BTC',  direction: 'LONG',  entry: 64100,  exit: 66800,  pnl: 284.50,  pnlPct: 4.21,  duration: '11h 07m', strategy: 'S/D Zones', status: 'TP2 HIT' },
  { id: 14, date: 'Apr 21 2026', coin: 'SUI',  direction: 'LONG',  entry: 0.9120, exit: 0.9380, pnl: 57.20,   pnlPct: 2.85,  duration: '3h 52m',  strategy: 'S/D Zones', status: 'TP2 HIT' },
  { id: 15, date: 'Apr 22 2026', coin: 'ETH',  direction: 'LONG',  entry: 3095,   exit: 3030,   pnl: -27.00,  pnlPct: -2.10, duration: '1h 08m',  strategy: 'S/D Zones', status: 'SL HIT'  },
]

type DateRange = 'all' | '30d' | '7d'
type CoinFilter = 'all' | 'BTC' | 'SOL' | 'ETH' | 'XRP'
type DirFilter = 'all' | 'LONG' | 'SHORT'
type WLFilter = 'all' | 'wins' | 'losses'

const ff: React.CSSProperties = { fontFamily: "'Barlow', sans-serif" }

function DirBadge({ d }: { d: 'LONG' | 'SHORT' }) {
  return (
    <span style={{
      ...ff, fontWeight: 500, fontSize: 11,
      color: d === 'LONG' ? '#22c55e' : '#ef4444',
      background: d === 'LONG' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
      borderRadius: 9999, padding: '2px 8px', whiteSpace: 'nowrap',
    }}>{d}</span>
  )
}

function StatusBadge({ s }: { s: TradeRow['status'] }) {
  const map: Record<TradeRow['status'], { color: string; bg: string }> = {
    'TP1 HIT': { color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
    'TP2 HIT': { color: '#4ade80', bg: 'rgba(74,222,128,0.15)' },
    'SL HIT':  { color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
    'CLOSED':  { color: 'rgba(255,255,255,0.5)', bg: 'rgba(255,255,255,0.08)' },
  }
  const { color, bg } = map[s]
  return (
    <span style={{ ...ff, fontWeight: 500, fontSize: 11, color, background: bg, borderRadius: 9999, padding: '2px 8px', whiteSpace: 'nowrap' }}>{s}</span>
  )
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...ff, fontWeight: 500, fontSize: 12,
        color: active ? '#fff' : 'rgba(255,255,255,0.45)',
        background: active ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.06)',
        border: `1px solid ${active ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 9999, padding: '5px 14px', cursor: 'pointer', transition: 'all 0.15s',
      }}
    >{label}</button>
  )
}

const TH_STYLE: React.CSSProperties = {
  ...ff, fontWeight: 500, fontSize: 11, color: 'rgba(255,255,255,0.35)',
  textAlign: 'left', padding: '0 10px 10px',
  borderBottom: '1px solid rgba(255,255,255,0.06)', whiteSpace: 'nowrap',
}
const TD_STYLE: React.CSSProperties = {
  ...ff, fontSize: 13, color: '#fff',
  padding: '9px 10px', borderBottom: '1px solid rgba(255,255,255,0.04)', whiteSpace: 'nowrap',
}

export default function TradeHistoryPage() {
  const navigate = useNavigate()
  const [dateRange, setDateRange] = useState<DateRange>('all')
  const [coinFilter, setCoinFilter] = useState<CoinFilter>('all')
  const [dirFilter, setDirFilter] = useState<DirFilter>('all')
  const [wlFilter, setWlFilter] = useState<WLFilter>('all')

  const filtered = TRADES.filter(t => {
    if (coinFilter !== 'all' && t.coin !== coinFilter) return false
    if (dirFilter !== 'all' && t.direction !== dirFilter) return false
    if (wlFilter === 'wins' && t.pnl < 0) return false
    if (wlFilter === 'losses' && t.pnl >= 0) return false
    return true
  })

  const wins = filtered.filter(t => t.pnl >= 0).length
  const losses = filtered.filter(t => t.pnl < 0).length
  const totalPnl = filtered.reduce((s, t) => s + t.pnl, 0)

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
            <h2 style={{ ...ff, fontWeight: 600, fontSize: 15, color: '#fff', margin: 0 }}>Trade History</h2>
          </div>
          <button
            style={{
              ...ff, fontWeight: 500, fontSize: 12,
              color: 'rgba(255,255,255,0.6)',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 9999, padding: '7px 16px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
          >
            <Download size={13} /> Export CSV
          </button>
        </div>

        <main style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>
          {/* Summary chips */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {[
              { label: `Total: ${filtered.length} trades`, color: 'rgba(255,255,255,0.6)' },
              { label: `Wins: ${wins}`, color: '#22c55e' },
              { label: `Losses: ${losses}`, color: '#ef4444' },
              { label: `Total P&L: ${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`, color: totalPnl >= 0 ? '#22c55e' : '#ef4444' },
            ].map(({ label, color }) => (
              <span key={label} style={{
                ...ff, fontWeight: 500, fontSize: 12,
                color, background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 9999, padding: '5px 14px',
              }}>{label}</span>
            ))}
          </div>

          {/* Filter row */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {(['all', '30d', '7d'] as DateRange[]).map(v => (
                <Chip key={v} label={v === 'all' ? 'All Time' : `Last ${v}`} active={dateRange === v} onClick={() => setDateRange(v)} />
              ))}
            </div>
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', margin: '0 0.25rem' }} />
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {(['all', 'BTC', 'SOL', 'ETH', 'XRP'] as CoinFilter[]).map(v => (
                <Chip key={v} label={v === 'all' ? 'All Coins' : v} active={coinFilter === v} onClick={() => setCoinFilter(v)} />
              ))}
            </div>
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', margin: '0 0.25rem' }} />
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {(['all', 'LONG', 'SHORT'] as DirFilter[]).map(v => (
                <Chip key={v} label={v === 'all' ? 'All' : v} active={dirFilter === v} onClick={() => setDirFilter(v)} />
              ))}
            </div>
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', margin: '0 0.25rem' }} />
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {(['all', 'wins', 'losses'] as WLFilter[]).map(v => (
                <Chip key={v} label={v === 'all' ? 'All' : v.charAt(0).toUpperCase() + v.slice(1)} active={wlFilter === v} onClick={() => setWlFilter(v)} />
              ))}
            </div>
          </div>

          {/* Table */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12, padding: 24, overflowX: 'auto',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead>
                <tr>
                  {['#', 'Date', 'Coin', 'Direction', 'Entry', 'Exit', 'P&L', 'P&L%', 'Duration', 'Strategy', 'Status'].map(col => (
                    <th key={col} style={{ ...TH_STYLE, textAlign: col === 'P&L' || col === 'P&L%' ? 'right' : 'left' }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id}
                    style={{ transition: 'background 0.12s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ ...TD_STYLE, color: 'rgba(255,255,255,0.3)', fontWeight: 300, fontSize: 12 }}>{t.id}</td>
                    <td style={{ ...TD_STYLE, color: 'rgba(255,255,255,0.5)', fontWeight: 300, fontSize: 12 }}>{t.date}</td>
                    <td style={{ ...TD_STYLE, fontWeight: 600 }}>{t.coin}</td>
                    <td style={{ ...TD_STYLE }}><DirBadge d={t.direction} /></td>
                    <td style={{ ...TD_STYLE, color: 'rgba(255,255,255,0.7)', fontWeight: 400 }}>{t.coin === 'BTC' ? t.entry.toLocaleString() : t.entry.toFixed(t.coin === 'XRP' || t.coin === 'SUI' || t.coin === 'WIF' ? 4 : 2)}</td>
                    <td style={{ ...TD_STYLE, color: 'rgba(255,255,255,0.7)', fontWeight: 400 }}>{t.coin === 'BTC' ? t.exit.toLocaleString() : t.exit.toFixed(t.coin === 'XRP' || t.coin === 'SUI' || t.coin === 'WIF' ? 4 : 2)}</td>
                    <td style={{ ...TD_STYLE, textAlign: 'right' }}>
                      <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: 14, color: t.pnl >= 0 ? '#22c55e' : '#ef4444' }}>
                        {t.pnl >= 0 ? '+' : ''}${Math.abs(t.pnl).toFixed(2)}
                      </span>
                    </td>
                    <td style={{ ...TD_STYLE, textAlign: 'right' }}>
                      <span style={{ ...ff, fontWeight: 500, fontSize: 12, color: t.pnlPct >= 0 ? '#22c55e' : '#ef4444' }}>
                        {t.pnlPct >= 0 ? '+' : ''}{t.pnlPct.toFixed(2)}%
                      </span>
                    </td>
                    <td style={{ ...TD_STYLE, color: 'rgba(255,255,255,0.5)', fontWeight: 300, fontSize: 12 }}>{t.duration}</td>
                    <td style={{ ...TD_STYLE, color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{t.strategy}</td>
                    <td style={{ ...TD_STYLE }}><StatusBadge s={t.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.25)', ...ff, fontSize: 14 }}>
                No trades match the selected filters.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
