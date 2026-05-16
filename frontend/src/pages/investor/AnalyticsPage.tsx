import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react'
import FadingVideo from '../../components/FadingVideo'

const VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4'

const ff: React.CSSProperties = { fontFamily: "'Barlow', sans-serif" }

type TimeRange = '7d' | '30d' | '90d' | 'all'

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

// Equity curve points — x: 0-100%, y: 0-100% (inverted for SVG)
const EQUITY_POINTS = [
  { x: 0,   y: 860 },
  { x: 80,  y: 820 },
  { x: 150, y: 750 },
  { x: 200, y: 770 },
  { x: 270, y: 680 },
  { x: 330, y: 640 },
  { x: 380, y: 590 },
  { x: 420, y: 610 },
  { x: 480, y: 520 },
  { x: 540, y: 480 },
  { x: 580, y: 440 },
  { x: 620, y: 460 },
  { x: 660, y: 380 },
  { x: 710, y: 310 },
  { x: 760, y: 260 },
  { x: 810, y: 210 },
  { x: 860, y: 160 },
  { x: 920, y: 120 },
  { x: 980, y: 80  },
  { x: 1040, y: 60 },
  { x: 1100, y: 20 },
]

function buildLinePath(pts: { x: number; y: number }[]) {
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
}

function buildAreaPath(pts: { x: number; y: number }[], height: number) {
  const line = buildLinePath(pts)
  return `${line} L ${pts[pts.length - 1].x} ${height} L ${pts[0].x} ${height} Z`
}

const MONTHLY_RETURNS = [
  { month: 'Jan', pct: 3.2 },
  { month: 'Feb', pct: 2.1 },
  { month: 'Mar', pct: 4.8 },
  { month: 'Apr', pct: -1.2 },
  { month: 'May', pct: 3.7 },
  { month: 'Jun', pct: 2.9 },
]

const COIN_BREAKDOWN = [
  { coin: 'SOL', trades: 42, winRate: 91, avgPnl: '+3.8%', totalPnl: '+$312.40' },
  { coin: 'BTC', trades: 28, winRate: 86, avgPnl: '+3.1%', totalPnl: '+$198.20' },
  { coin: 'ETH', trades: 19, winRate: 89, avgPnl: '+2.9%', totalPnl: '+$142.80' },
  { coin: 'XRP', trades: 31, winRate: 90, avgPnl: '+2.4%', totalPnl: '+$193.80' },
]

const STAT_CARDS = [
  { label: 'Total P&L',   value: '+$847.20', sub: '+18.4%',      color: '#22c55e' },
  { label: 'Win Rate',    value: '89%',       sub: '107 / 120',   color: '#3b82f6' },
  { label: 'Best Trade',  value: '+$284.50',  sub: 'BTC LONG',    color: '#22c55e' },
  { label: 'Worst Trade', value: '-$42.10',   sub: 'SUI SHORT',   color: '#ef4444' },
]

const SVG_W = 1100
const SVG_H = 160
const Y_MIN = 0
const Y_MAX = 900

const X_LABELS = ['Apr 14', 'Apr 19', 'Apr 24', 'Apr 29', 'May 4', 'May 9']
const Y_LABELS = [900, 600, 300, 0]

export default function AnalyticsPage() {
  const navigate = useNavigate()
  const [range, setRange] = useState<TimeRange>('all')

  const linePath = buildLinePath(EQUITY_POINTS)
  const areaPath = buildAreaPath(EQUITY_POINTS, SVG_H)

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
            <h2 style={{ ...ff, fontWeight: 600, fontSize: 15, color: '#fff', margin: 0 }}>P&L Analytics</h2>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {(['7d', '30d', '90d', 'all'] as TimeRange[]).map(v => (
              <Chip key={v} label={v === 'all' ? 'All' : v} active={range === v} onClick={() => setRange(v)} />
            ))}
          </div>
        </div>

        <main style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Section 1 — Equity Curve */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12, padding: 24,
          }}>
            <div style={{ ...ff, fontWeight: 600, fontSize: 14, color: '#fff', marginBottom: '1rem' }}>Equity Curve</div>
            <div style={{ position: 'relative' }}>
              {/* Y-axis labels */}
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
                {Y_LABELS.map(v => (
                  <span key={v} style={{ ...ff, fontSize: 10, color: 'rgba(255,255,255,0.25)', lineHeight: 1 }}>
                    ${v}
                  </span>
                ))}
              </div>
              <div style={{ marginLeft: 36 }}>
                <svg
                  viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                  width="100%"
                  height={SVG_H}
                  preserveAspectRatio="none"
                  style={{ display: 'block' }}
                >
                  <defs>
                    <linearGradient id="equity-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                    {/* Horizontal grid lines */}
                  </defs>
                  {/* Grid lines */}
                  {[0.25, 0.5, 0.75].map(f => (
                    <line
                      key={f}
                      x1={0} y1={SVG_H * f}
                      x2={SVG_W} y2={SVG_H * f}
                      stroke="rgba(255,255,255,0.05)" strokeWidth={1}
                    />
                  ))}
                  {/* Area fill */}
                  <path d={areaPath} fill="url(#equity-fill)" />
                  {/* Line */}
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  {/* Last point dot */}
                  <circle cx={EQUITY_POINTS[EQUITY_POINTS.length - 1].x} cy={EQUITY_POINTS[EQUITY_POINTS.length - 1].y} r={4} fill="#3b82f6" />
                </svg>
                {/* X-axis labels */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  {X_LABELS.map(l => (
                    <span key={l} style={{ ...ff, fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>{l}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 — 4 stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {STAT_CARDS.map(({ label, value, sub, color }) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12, padding: 20,
              }}>
                <div style={{ ...ff, fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>{label}</div>
                <div style={{ ...ff, fontWeight: 700, fontSize: 22, color, marginBottom: 4 }}>{value}</div>
                <div style={{ ...ff, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* Section 3 — Two columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Monthly returns heatmap */}
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12, padding: 24,
            }}>
              <div style={{ ...ff, fontWeight: 600, fontSize: 14, color: '#fff', marginBottom: '1.25rem' }}>Monthly Returns</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
                {MONTHLY_RETURNS.map(({ month, pct }) => {
                  const isPos = pct >= 0
                  return (
                    <div key={month} style={{
                      background: isPos ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                      border: `1px solid ${isPos ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
                      borderRadius: 8, padding: '10px 6px', textAlign: 'center',
                    }}>
                      <div style={{ ...ff, fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 5 }}>{month}</div>
                      <div style={{ ...ff, fontWeight: 600, fontSize: 13, color: isPos ? '#22c55e' : '#ef4444' }}>
                        {isPos ? '+' : ''}{pct}%
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Coin breakdown table */}
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12, padding: 24,
            }}>
              <div style={{ ...ff, fontWeight: 600, fontSize: 14, color: '#fff', marginBottom: '1.25rem' }}>Coin Breakdown</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Coin', 'Trades', 'Win Rate', 'Avg P&L', 'Total P&L'].map(col => (
                      <th key={col} style={{
                        ...ff, fontWeight: 500, fontSize: 11,
                        color: 'rgba(255,255,255,0.35)',
                        textAlign: col === 'Total P&L' || col === 'Avg P&L' ? 'right' : 'left',
                        padding: '0 8px 10px',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                      }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COIN_BREAKDOWN.map(({ coin, trades, winRate, avgPnl, totalPnl }) => (
                    <tr key={coin}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      style={{ transition: 'background 0.12s' }}
                    >
                      <td style={{ ...ff, fontWeight: 700, fontSize: 14, color: '#fff', padding: '9px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{coin}</td>
                      <td style={{ ...ff, fontSize: 13, color: 'rgba(255,255,255,0.6)', padding: '9px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{trades}</td>
                      <td style={{ ...ff, fontWeight: 500, fontSize: 13, color: '#3b82f6', padding: '9px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{winRate}%</td>
                      <td style={{ ...ff, fontWeight: 500, fontSize: 13, color: '#22c55e', padding: '9px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)', textAlign: 'right' }}>{avgPnl}</td>
                      <td style={{ ...ff, fontWeight: 600, fontSize: 14, color: '#22c55e', padding: '9px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)', textAlign: 'right' }}>{totalPnl}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4 — Best / Worst trades */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Best trade */}
            <div style={{
              background: 'rgba(34,197,94,0.05)',
              border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: 12, padding: 24,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <TrendingUp size={16} color="#22c55e" />
                <span style={{ ...ff, fontWeight: 600, fontSize: 13, color: '#22c55e' }}>Best Trade</span>
              </div>
              <div style={{ ...ff, fontWeight: 700, fontSize: 28, color: '#22c55e', marginBottom: 6 }}>+$284.50</div>
              <div style={{ ...ff, fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>+12.4% return</div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: 12 }}>
                <span style={{
                  ...ff, fontWeight: 600, fontSize: 13, color: '#fff',
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: 9999, padding: '4px 12px',
                }}>BTC</span>
                <span style={{
                  ...ff, fontWeight: 500, fontSize: 11, color: '#22c55e',
                  background: 'rgba(34,197,94,0.12)',
                  borderRadius: 9999, padding: '4px 12px',
                }}>LONG</span>
                <span style={{
                  ...ff, fontSize: 12, color: 'rgba(255,255,255,0.35)',
                  padding: '4px 0',
                }}>Apr 14 2026</span>
              </div>
            </div>

            {/* Worst trade */}
            <div style={{
              background: 'rgba(239,68,68,0.05)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 12, padding: 24,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <TrendingDown size={16} color="#ef4444" />
                <span style={{ ...ff, fontWeight: 600, fontSize: 13, color: '#ef4444' }}>Worst Trade</span>
              </div>
              <div style={{ ...ff, fontWeight: 700, fontSize: 28, color: '#ef4444', marginBottom: 6 }}>-$42.10</div>
              <div style={{ ...ff, fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>-2.3% return</div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: 12 }}>
                <span style={{
                  ...ff, fontWeight: 600, fontSize: 13, color: '#fff',
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: 9999, padding: '4px 12px',
                }}>XRP</span>
                <span style={{
                  ...ff, fontWeight: 500, fontSize: 11, color: '#ef4444',
                  background: 'rgba(239,68,68,0.12)',
                  borderRadius: 9999, padding: '4px 12px',
                }}>SHORT</span>
                <span style={{
                  ...ff, fontSize: 12, color: 'rgba(255,255,255,0.35)',
                  padding: '4px 0',
                }}>Apr 16 2026</span>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}
