import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, Award } from 'lucide-react'
import FadingVideo from '../../components/FadingVideo'
import TraderSidebar from '../../components/trader/TraderSidebar'
import type { TraderPage } from '../../components/trader/TraderSidebar'

const VIDEO_SRC = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4'
const MOCK_USER = { name: 'Sonum Sharma', email: 'sonum@tradelikeme.xyz' }

const PERF_CARDS = [
  { label: 'Total Return',  value: '+34.2%', color: '#22c55e', sub: 'since inception' },
  { label: 'Avg Winner',   value: '+4.1%',  color: '#22c55e', sub: 'per winning trade' },
  { label: 'Avg Loser',    value: '-2.6%',  color: '#ef4444', sub: 'per losing trade' },
  { label: 'RRR',          value: '1.58:1', color: '#f97316', sub: 'risk/reward ratio' },
  { label: 'Max Drawdown', value: '-8.3%',  color: '#ef4444', sub: 'peak to trough' },
  { label: 'Sharpe Ratio', value: '2.4',    color: '#a78bfa', sub: 'annualized' },
]

// 30-point equity curve: 100k → ~134k with realistic noise
const EQUITY_POINTS = [
  100000, 100400, 101200, 100800, 102100, 103500, 102900, 104200, 105800, 104600,
  106100, 107400, 106800, 108300, 109700, 111200, 110400, 112000, 113500, 112800,
  114200, 115900, 117300, 116400, 118100, 120000, 121500, 123200, 128000, 134000,
]

// Monthly returns (Jan–Dec)
const MONTHLY = [
  { month: 'Jan', pct: 3.2 },
  { month: 'Feb', pct: -1.1 },
  { month: 'Mar', pct: 5.4 },
  { month: 'Apr', pct: 2.8 },
  { month: 'May', pct: 4.1 },
  { month: 'Jun', pct: -0.7 },
  { month: 'Jul', pct: 3.9 },
  { month: 'Aug', pct: 2.1 },
  { month: 'Sep', pct: -2.3 },
  { month: 'Oct', pct: 6.2 },
  { month: 'Nov', pct: 4.5 },
  { month: 'Dec', pct: 3.1 },
]

const STRATEGY_RULES = [
  { label: 'Entry Method',   value: 'Supply & Demand zone reversal' },
  { label: 'TF Stack',       value: '1M → 1W → 1D → 4H → 1H → 30M → 15M' },
  { label: 'SL Type',        value: '30m candle body close (wick = stop hunt)' },
  { label: 'TP Method',      value: 'TP1 at zone 1 (50%), TP2 at zone 2 (50%)' },
  { label: 'Leverage',       value: '200x CROSS, 0.5% margin per trade' },
  { label: 'Max Concurrent', value: '2 positions' },
  { label: 'BTC Gate',       value: 'No alt entry against BTC 1D structure' },
  { label: '4H Zone Gate',   value: 'Lower-TF zone needs 4H zone within ±5%' },
]

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 16,
  padding: '1.25rem 1.5rem',
}

const labelStyle: React.CSSProperties = {
  fontFamily: "'Barlow', sans-serif",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.35)',
}

// --- SVG Equity Curve ---
function EquityCurve() {
  const W = 580, H = 130, PAD = 12
  const min = Math.min(...EQUITY_POINTS)
  const max = Math.max(...EQUITY_POINTS)
  const n = EQUITY_POINTS.length

  function x(i: number) { return PAD + (i / (n - 1)) * (W - PAD * 2) }
  function y(v: number) { return PAD + (1 - (v - min) / (max - min)) * (H - PAD * 2) }

  const linePath = EQUITY_POINTS.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`).join(' ')
  const fillPath = `${linePath} L ${x(n - 1)} ${H} L ${x(0)} ${H} Z`

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="eq-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill="url(#eq-fill)" />
      <path d={linePath} fill="none" stroke="#f97316" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

// --- SVG Monthly Bar Chart ---
function MonthlyBars() {
  const W = 580, H = 110, PAD_H = 14, PAD_V = 10
  const maxAbs = Math.max(...MONTHLY.map(m => Math.abs(m.pct)))
  const barW = (W - PAD_H * 2) / MONTHLY.length - 4
  const zeroY = PAD_V + (H - PAD_V * 2) / 2

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      {/* Zero line */}
      <line x1={PAD_H} y1={zeroY} x2={W - PAD_H} y2={zeroY} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />

      {MONTHLY.map((m, i) => {
        const cx = PAD_H + i * ((W - PAD_H * 2) / MONTHLY.length) + barW / 2 + 2
        const barH = Math.abs(m.pct) / maxAbs * ((H - PAD_V * 2) / 2 - 4)
        const positive = m.pct >= 0
        const barY = positive ? zeroY - barH : zeroY
        const fill = positive ? '#22c55e' : '#ef4444'

        return (
          <g key={m.month}>
            <rect
              x={cx - barW / 2}
              y={barY}
              width={barW}
              height={barH}
              fill={fill}
              opacity={0.75}
              rx={2}
            />
            {/* Month label */}
            <text x={cx} y={H - 2} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.35)" fontFamily="'Barlow', sans-serif">
              {m.month}
            </text>
            {/* Value label */}
            <text
              x={cx}
              y={positive ? barY - 3 : barY + barH + 10}
              textAnchor="middle"
              fontSize={7.5}
              fill={fill}
              fontFamily="'Barlow', sans-serif"
              fontWeight="600"
            >
              {positive ? '+' : ''}{m.pct}%
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function TraderPerformancePage() {
  const navigate = useNavigate()
  const [activePage, setActivePage] = useState<TraderPage>('performance')

  function handleNav(p: TraderPage) {
    setActivePage(p)
    const routes: Record<TraderPage, string> = {
      overview:    '/trader',
      performance: '/trader/performance',
      trades:      '/trader/trades',
      earnings:    '/trader/earnings',
      strategy:    '/trader/strategy',
      subscribers: '/trader/subscribers',
      submit:      '/trader/submit',
    }
    navigate(routes[p])
  }

  const wins = 42, losses = 5, breakeven = 0
  const total = wins + losses + breakeven

  return (
    <div style={{ minHeight: '100vh', background: '#000', fontFamily: "'Barlow', sans-serif" }}>
      <FadingVideo
        src={VIDEO_SRC}
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', zIndex: 0 }}
      />
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', zIndex: 1 }} />

      <TraderSidebar activePage={activePage} onNavigate={handleNav} user={MOCK_USER} />

      <div style={{ position: 'relative', zIndex: 2, marginLeft: 220, minHeight: '100vh' }}>
        {/* Header */}
        <div style={{
          padding: '2rem 2.5rem 1.25rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}>
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>
            Performance
          </h1>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
            Full strategy analytics and verified trade statistics
          </p>
        </div>

        <div style={{ padding: '2rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.875rem' }}>
            {PERF_CARDS.map((c) => (
              <div key={c.label} style={{ ...card, padding: '1rem 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <span style={labelStyle}>{c.label}</span>
                <div style={{ fontSize: '1.45rem', fontWeight: 700, color: c.color, lineHeight: 1 }}>{c.value}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{c.sub}</div>
              </div>
            ))}
          </div>

          {/* Equity curve */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={16} color="#f97316" />
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>Equity Curve</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['$100k → $134k', '+34.2%', '47 trades'].map(t => (
                  <span key={t} style={{
                    fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.45)',
                    background: 'rgba(255,255,255,0.06)', borderRadius: 6, padding: '3px 8px',
                  }}>{t}</span>
                ))}
              </div>
            </div>
            <EquityCurve />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem' }}>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>Jan 2026</span>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>May 2026</span>
            </div>
          </div>

          {/* Monthly returns + Trade analysis side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1rem' }}>

            {/* Monthly bars */}
            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Award size={16} color="#f97316" />
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>Monthly Returns</span>
              </div>
              <MonthlyBars />
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem' }}>
                <span style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.4)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: '#22c55e', display: 'inline-block' }} />
                  Positive month
                </span>
                <span style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.4)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: '#ef4444', display: 'inline-block' }} />
                  Negative month
                </span>
              </div>
            </div>

            {/* Trade analysis */}
            <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>Trade Analysis</span>

              {/* Big stats */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { label: 'Won',       val: wins,      pct: ((wins / total) * 100).toFixed(1), color: '#22c55e' },
                  { label: 'Lost',      val: losses,    pct: ((losses / total) * 100).toFixed(1), color: '#ef4444' },
                  { label: 'Breakeven', val: breakeven, pct: ((breakeven / total) * 100).toFixed(1), color: 'rgba(255,255,255,0.4)' },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>{r.label}</span>
                      <span style={{ fontSize: '1.4rem', fontWeight: 700, color: r.color, lineHeight: 1 }}>{r.val}</span>
                    </div>
                    {/* Mini bar */}
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${r.pct}%`, background: r.color, borderRadius: 99, opacity: 0.75 }} />
                    </div>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{r.pct}% of {total} trades</span>
                  </div>
                ))}
              </div>

              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

              {/* Extra stats */}
              {[
                { k: 'Avg Hold Time',   v: '14.2 hrs' },
                { k: 'Best Trade',      v: '+18.4%' },
                { k: 'Worst Trade',     v: '-3.1%' },
                { k: 'Profit Factor',   v: '2.8' },
              ].map(r => (
                <div key={r.k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.4)' }}>{r.k}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Strategy rules */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.1rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>Strategy Rules Summary</span>
              <span style={{
                fontSize: '10px', fontWeight: 600, color: '#22c55e',
                background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                borderRadius: 6, padding: '2px 7px', letterSpacing: '0.05em',
              }}>S/D ZONES</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0' }}>
              {STRATEGY_RULES.map((r, i) => (
                <div key={r.label} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.2rem',
                  padding: '0.7rem 0',
                  borderBottom: i < STRATEGY_RULES.length - 2 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  paddingRight: i % 2 === 0 ? '2rem' : 0,
                  paddingLeft: i % 2 === 1 ? '2rem' : 0,
                  borderLeft: i % 2 === 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}>
                  <span style={labelStyle}>{r.label}</span>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
