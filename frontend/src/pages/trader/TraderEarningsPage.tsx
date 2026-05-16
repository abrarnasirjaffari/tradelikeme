import { useState } from 'react'
import { DollarSign, Calendar, Users, TrendingUp, ChevronRight, Award } from 'lucide-react'
import FadingVideo from '../../components/FadingVideo'
import TraderSidebar from '../../components/trader/TraderSidebar'
import type { TraderPage } from '../../components/trader/TraderSidebar'
import { useAuth } from '../../context/AuthContext'

const VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4'

// ── Mock data ──────────────────────────────────────────────────────────────
const PAYOUT_HISTORY = [
  { id: 1, date: 'May 1, 2026',  amount: 2140, subscribers: 31, status: 'Pending' },
  { id: 2, date: 'Apr 1, 2026',  amount: 1980, subscribers: 28, status: 'Paid'    },
  { id: 3, date: 'Mar 1, 2026',  amount: 1760, subscribers: 24, status: 'Paid'    },
  { id: 4, date: 'Feb 1, 2026',  amount: 1540, subscribers: 21, status: 'Paid'    },
  { id: 5, date: 'Jan 1, 2026',  amount: 1320, subscribers: 17, status: 'Paid'    },
  { id: 6, date: 'Dec 1, 2025',  amount: 1100, subscribers: 14, status: 'Paid'    },
]

const SUBSCRIBER_BREAKDOWN = [
  { id: 'user_4a3f...', aum: 42000, monthlyProfit: 3360, commissionPct: 10.5, earnings: 352.80 },
  { id: 'user_8c12...', aum: 35000, monthlyProfit: 2800, commissionPct: 10.5, earnings: 294.00 },
  { id: 'user_1f9d...', aum: 28000, monthlyProfit: 2240, commissionPct: 10.5, earnings: 235.20 },
  { id: 'user_3b7e...', aum: 20000, monthlyProfit: 1600, commissionPct: 10.5, earnings: 168.00 },
  { id: 'user_6a2c...', aum: 15000, monthlyProfit: 1200, commissionPct: 10.5, earnings: 126.00 },
  { id: 'user_9f5b...', aum: 12000, monthlyProfit:  960, commissionPct: 10.5, earnings: 100.80 },
  { id: 'user_2d8a...', aum:  8000, monthlyProfit:  640, commissionPct: 10.5, earnings:  67.20 },
  { id: 'user_7e4f...', aum:  5000, monthlyProfit:  400, commissionPct: 10.5, earnings:  42.00 },
]

// ── Shared style primitives ─────────────────────────────────────────────────
const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '1.25rem',
  padding: '1.5rem',
}

const labelStyle: React.CSSProperties = {
  fontFamily: "'Barlow', sans-serif",
  fontWeight: 400,
  fontSize: '12px',
  color: 'rgba(255,255,255,0.4)',
  marginBottom: '0.35rem',
}

const valueStyle: React.CSSProperties = {
  fontFamily: "'Instrument Serif', serif",
  fontStyle: 'italic',
  fontSize: '1.75rem',
  color: '#fff',
  lineHeight: 1,
}

const thStyle: React.CSSProperties = {
  fontFamily: "'Barlow', sans-serif",
  fontWeight: 500,
  fontSize: '11px',
  color: 'rgba(255,255,255,0.35)',
  padding: '0 10px 10px',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  textAlign: 'left',
  whiteSpace: 'nowrap',
}

const tdStyle: React.CSSProperties = {
  fontFamily: "'Barlow', sans-serif",
  fontWeight: 400,
  fontSize: '13px',
  color: '#fff',
  padding: '10px 10px',
  borderBottom: '1px solid rgba(255,255,255,0.04)',
  whiteSpace: 'nowrap',
}

function StatusBadge({ status }: { status: string }) {
  const isPaid = status === 'Paid'
  return (
    <span style={{
      fontFamily: "'Barlow', sans-serif",
      fontWeight: 500,
      fontSize: '11px',
      color: isPaid ? '#f97316' : '#eab308',
      background: isPaid ? 'rgba(249,115,22,0.15)' : 'rgba(234,179,8,0.15)',
      borderRadius: 9999,
      padding: '2px 10px',
    }}>
      {status}
    </span>
  )
}

// ── Mini bar chart via SVG ──────────────────────────────────────────────────
function EarningsSparkline() {
  const months = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May']
  const values = [1100, 1320, 1540, 1760, 1980, 2140]
  const W = 340
  const H = 80
  const max = Math.max(...values)
  const barW = 36
  const gap = (W - months.length * barW) / (months.length + 1)

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + 28}`} preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
      {values.map((v, i) => {
        const x = gap + i * (barW + gap)
        const barH = (v / max) * H
        const y = H - barH
        const isLast = i === values.length - 1
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx={6}
              fill={isLast ? '#f97316' : 'rgba(255,255,255,0.08)'}
            />
            <text
              x={x + barW / 2}
              y={H + 16}
              textAnchor="middle"
              style={{ fontFamily: "'Barlow', sans-serif", fontSize: '10px', fill: 'rgba(255,255,255,0.35)' }}
            >
              {months[i]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function TraderEarningsPage() {
  const { user } = useAuth()
  const [activePage, setActivePage] = useState<TraderPage>('earnings')

  function handleNavigate(page: TraderPage) {
    setActivePage(page)
    // Navigation to other trader pages would use router in a full implementation
  }

  return (
    <div style={{ background: '#000', minHeight: '100vh', display: 'flex' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 767px) {
          .trader-content { margin-left: 0 !important; padding-bottom: 70px !important; }
          .earnings-grid { grid-template-columns: 1fr !important; }
          .hide-mobile { display: none !important; }
        }
      `}</style>

      {/* Background video */}
      <FadingVideo
        src={VIDEO_SRC}
        style={{
          position: 'fixed', top: 0, left: '-10%', width: '120%', height: '120%',
          objectFit: 'cover', objectPosition: 'center top', zIndex: 0,
        }}
      />
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'rgba(0,0,0,0.60)', pointerEvents: 'none' }} />

      {/* Sidebar */}
      <TraderSidebar activePage={activePage} onNavigate={handleNavigate} user={user} />

      {/* Main content */}
      <div
        className="trader-content"
        style={{ position: 'relative', zIndex: 1, marginLeft: 220, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
      >
        {/* Sticky header */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 40,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '0 2rem', height: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        }}>
          <div>
            <h2 style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '15px', color: '#fff', margin: 0 }}>
              Earnings &amp; Payouts
            </h2>
            <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
              Your commission history
            </p>
          </div>
          <span style={{
            fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '11px',
            color: '#f97316', background: 'rgba(249,115,22,0.12)',
            border: '1px solid rgba(249,115,22,0.25)',
            borderRadius: 9999, padding: '4px 12px',
          }}>
            S-tier · 10.5%
          </span>
        </div>

        {/* Page body */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* ── Top stat row ── */}
            <div
              className="earnings-grid"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}
            >
              {/* Total earned */}
              <div style={card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(249,115,22,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <DollarSign size={15} color="#f97316" />
                  </div>
                  <span style={labelStyle}>Total Earned All-Time</span>
                </div>
                <div style={valueStyle}>$12,840</div>
                <div style={{ marginTop: '0.5rem', fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
                  Across 6 payout months
                </div>
              </div>

              {/* This month */}
              <div style={card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <TrendingUp size={15} color="#22c55e" />
                  </div>
                  <span style={labelStyle}>This Month</span>
                </div>
                <div style={{ ...valueStyle, color: '#22c55e' }}>$2,140</div>
                <div style={{ marginTop: '0.5rem', fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
                  +8.1% vs last month
                </div>
              </div>

              {/* Next payout */}
              <div style={card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(96,165,250,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Calendar size={15} color="#60a5fa" />
                  </div>
                  <span style={labelStyle}>Next Payout</span>
                </div>
                <div style={{ ...valueStyle, fontSize: '1.4rem' }}>Jun 1, 2026</div>
                <div style={{ marginTop: '0.5rem', fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
                  16 days remaining
                </div>
              </div>
            </div>

            {/* ── Earnings trend sparkline + commission info row ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              {/* Sparkline */}
              <div style={card}>
                <div style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '14px', color: '#fff', marginBottom: '1rem' }}>
                  Monthly Earnings Trend
                </div>
                <EarningsSparkline />
              </div>

              {/* Commission rate card */}
              <div style={{ ...card, background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.18)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Award size={15} color="#f97316" />
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '14px', color: '#fff' }}>
                    Commission Rate
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '2.5rem', color: '#f97316', lineHeight: 1 }}>10.5%</span>
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>of platform fee</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Tier</span>
                    <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '12px', color: '#f97316' }}>S-tier (85%+ win rate)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Total fee charged</span>
                    <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '12px', color: '#fff' }}>15%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Your share (70%)</span>
                    <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '12px', color: '#22c55e' }}>10.5%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Platform share (30%)</span>
                    <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>4.5%</span>
                  </div>
                </div>
                <div style={{ height: '1px', background: 'rgba(249,115,22,0.15)', margin: '0.9rem 0' }} />
                <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '11.5px', color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.55 }}>
                  You earn only when your subscribers earn. 10.5% of all profits generated by users following your strategy.
                </p>
              </div>
            </div>

            {/* ── Payout History ── */}
            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '15px', color: '#fff' }}>
                  Payout History
                </span>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '11px', color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.08)', borderRadius: 9999, padding: '2px 10px' }}>
                  {PAYOUT_HISTORY.length} months
                </span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
                  <thead>
                    <tr>
                      {['Date', 'Amount', 'Subscribers', 'Status', ''].map((col) => (
                        <th key={col} style={{ ...thStyle, textAlign: col === 'Amount' ? 'right' : 'left' }}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PAYOUT_HISTORY.map((row) => (
                      <tr
                        key={row.id}
                        onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.02)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent' }}
                        style={{ cursor: 'default' }}
                      >
                        <td style={tdStyle}>{row.date}</td>
                        <td style={{ ...tdStyle, textAlign: 'right' }}>
                          <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '1rem', color: '#22c55e' }}>
                            +${row.amount.toLocaleString()}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.6)' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Users size={12} style={{ opacity: 0.5 }} />
                            {row.subscribers}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <StatusBadge status={row.status} />
                        </td>
                        <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.25)', textAlign: 'right' }}>
                          <ChevronRight size={14} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Per-Subscriber Breakdown ── */}
            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '15px', color: '#fff' }}>
                  Per-Subscriber Breakdown
                </span>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '11px', color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.08)', borderRadius: 9999, padding: '2px 10px' }}>
                  {SUBSCRIBER_BREAKDOWN.length} active
                </span>
              </div>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: '0 0 1.25rem' }}>
                Subscriber identities are masked for privacy. Showing May 2026 figures.
              </p>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
                  <thead>
                    <tr>
                      {['Subscriber', 'AUM', 'Monthly Profit', 'Commission', 'Your Earnings'].map((col) => (
                        <th
                          key={col}
                          style={{
                            ...thStyle,
                            textAlign: ['AUM', 'Monthly Profit', 'Commission', 'Your Earnings'].includes(col) ? 'right' : 'left',
                          }}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SUBSCRIBER_BREAKDOWN.map((row) => (
                      <tr
                        key={row.id}
                        onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.02)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent' }}
                        style={{ cursor: 'default' }}
                      >
                        <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.55)', fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '12px', letterSpacing: '0.03em' }}>
                          {row.id}
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'right', color: 'rgba(255,255,255,0.7)' }}>
                          ${row.aum.toLocaleString()}
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'right', color: '#22c55e' }}>
                          +${row.monthlyProfit.toLocaleString()}
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'right', color: 'rgba(255,255,255,0.5)' }}>
                          {row.commissionPct}%
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'right' }}>
                          <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '1rem', color: '#f97316' }}>
                            +${row.earnings.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={4} style={{ ...tdStyle, borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                        Total (May 2026)
                      </td>
                      <td style={{ ...tdStyle, borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none', textAlign: 'right' }}>
                        <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '1.1rem', color: '#f97316', fontWeight: 700 }}>
                          +$1,386.00
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
