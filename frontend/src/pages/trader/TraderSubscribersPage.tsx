import { useState } from 'react'
import { Users, DollarSign, TrendingUp, ChevronUp, ChevronDown } from 'lucide-react'
import FadingVideo from '../../components/FadingVideo'
import TraderSidebar from '../../components/trader/TraderSidebar'
import type { TraderPage } from '../../components/trader/TraderSidebar'
import { useAuth } from '../../context/AuthContext'

// ── mock data ─────────────────────────────────────────────────────────────────

const GROWTH_POINTS = [8, 9, 9, 10, 12, 13, 14, 15, 17, 19, 21, 23]
const MONTHS = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May']

const SUBSCRIBERS = [
  { id: 1, email: 'j***@gmail.com',   mode: 'Solana', aum: 28400, joined: 'Oct 12 2025', monthlyProfit: 2272,  commission: 454,  status: 'Active' },
  { id: 2, email: 'a***@yahoo.com',   mode: 'CEX',    aum: 15000, joined: 'Nov 3 2025',  monthlyProfit: 1200,  commission: 240,  status: 'Active' },
  { id: 3, email: 'm***@icloud.com',  mode: 'Solana', aum: 42000, joined: 'Nov 20 2025', monthlyProfit: 3360,  commission: 672,  status: 'Active' },
  { id: 4, email: 'r***@proton.me',   mode: 'CEX',    aum: 8500,  joined: 'Dec 1 2025',  monthlyProfit: 680,   commission: 136,  status: 'Paused' },
  { id: 5, email: 'k***@outlook.com', mode: 'Solana', aum: 50000, joined: 'Dec 18 2025', monthlyProfit: 4000,  commission: 800,  status: 'Active' },
  { id: 6, email: 't***@gmail.com',   mode: 'CEX',    aum: 12000, joined: 'Jan 5 2026',  monthlyProfit: 960,   commission: 192,  status: 'Active' },
  { id: 7, email: 'n***@hotmail.com', mode: 'Solana', aum: 31600, joined: 'Jan 22 2026', monthlyProfit: 2528,  commission: 505,  status: 'Active' },
  { id: 8, email: 's***@gmail.com',   mode: 'CEX',    aum: 9800,  joined: 'Feb 14 2026', monthlyProfit: 784,   commission: 157,  status: 'Paused' },
  { id: 9, email: 'w***@duck.com',    mode: 'Solana', aum: 67200, joined: 'Mar 3 2026',  monthlyProfit: 5376,  commission: 1075, status: 'Active' },
  { id: 10,email: 'e***@gmail.com',   mode: 'CEX',    aum: 20000, joined: 'Apr 10 2026', monthlyProfit: 1600,  commission: 320,  status: 'Active' },
]

const RISK_DIST = [
  { label: 'Conservative', count: 5,  color: '#60a5fa' },
  { label: 'Medium',       count: 14, color: '#f97316' },
  { label: 'Aggressive',   count: 4,  color: '#f43f5e' },
]

// ── chart helpers ─────────────────────────────────────────────────────────────

function GrowthChart() {
  const W = 180, H = 80, PAD = 4
  const minV = 7, maxV = 24
  const pts = GROWTH_POINTS.map((v, i) => {
    const x = PAD + (i / (GROWTH_POINTS.length - 1)) * (W - PAD * 2)
    const y = H - PAD - ((v - minV) / (maxV - minV)) * (H - PAD * 2)
    return `${x},${y}`
  })
  const polyline = pts.join(' ')
  // area fill: close below
  const first = pts[0]
  const last = pts[pts.length - 1]
  const area = `M ${first} L ${polyline.replace(`${first} `, '')} L ${last.split(',')[0]},${H - PAD} L ${PAD},${H - PAD} Z`

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#growthFill)" />
      <polyline points={polyline} fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {/* last point dot */}
      <circle cx={pts[pts.length - 1].split(',')[0]} cy={pts[pts.length - 1].split(',')[1]} r="3" fill="#f97316" />
    </svg>
  )
}

// ── card component ─────────────────────────────────────────────────────────────

function SummaryCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 14,
      padding: '1.25rem 1.5rem',
      display: 'flex', alignItems: 'flex-start', gap: '1rem',
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10,
        background: 'rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, color: 'rgba(255,255,255,0.5)',
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '11.5px', color: 'rgba(255,255,255,0.4)', margin: '0 0 4px' }}>{label}</p>
        <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '22px', color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>{value}</p>
        {sub && <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: '3px 0 0' }}>{sub}</p>}
      </div>
    </div>
  )
}

// ── sort helpers ──────────────────────────────────────────────────────────────

type SortKey = 'email' | 'aum' | 'joined' | 'monthlyProfit' | 'commission' | 'status'

// ── main component ────────────────────────────────────────────────────────────

export default function TraderSubscribersPage() {
  const { user } = useAuth()
  const [activePage, setActivePage] = useState<TraderPage>('subscribers')
  const [sortKey, setSortKey] = useState<SortKey>('aum')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const maxRiskCount = Math.max(...RISK_DIST.map(r => r.count))

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sorted = [...SUBSCRIBERS].sort((a, b) => {
    let av: string | number = a[sortKey]
    let bv: string | number = b[sortKey]
    if (typeof av === 'string' && typeof bv === 'string') {
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    }
    return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number)
  })

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ChevronUp size={11} style={{ opacity: 0.2 }} />
    return sortDir === 'asc'
      ? <ChevronUp size={11} style={{ opacity: 0.7 }} />
      : <ChevronDown size={11} style={{ opacity: 0.7 }} />
  }

  function thBtn(k: SortKey, label: string, align: 'left' | 'right' = 'left') {
    return (
      <th
        onClick={() => handleSort(k)}
        style={{
          fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '11px',
          color: 'rgba(255,255,255,0.4)', textAlign: align,
          padding: '0 0.75rem 0.75rem', cursor: 'pointer', userSelect: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
          {label} <SortIcon k={k} />
        </span>
      </th>
    )
  }

  return (
    <div style={{ background: '#000', minHeight: '100vh', display: 'flex' }}>
      <style>{`
        @media (max-width: 767px) { .trader-content { margin-left: 0 !important; padding-bottom: 70px !important; } }
        .sub-row:hover td { background: rgba(255,255,255,0.02); }
        .sub-row td { transition: background 0.12s; }
      `}</style>

      {/* Background video */}
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
        style={{ position: 'fixed', top: 0, left: '-10%', width: '120%', height: '120%', objectFit: 'cover', objectPosition: 'center top', zIndex: 0 }}
      />
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'rgba(0,0,0,0.6)', pointerEvents: 'none' }} />

      <TraderSidebar activePage={activePage} onNavigate={setActivePage} user={user} />

      <div className="trader-content" style={{ position: 'relative', zIndex: 1, marginLeft: 220, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* Sticky header */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 40,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '0 2rem',
          height: 60,
          display: 'flex', alignItems: 'center',
          flexShrink: 0,
        }}>
          <div>
            <h2 style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '15px', color: '#fff', margin: 0 }}>
              Subscribers
            </h2>
            <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
              Active investors following your strategy
            </p>
          </div>
        </div>

        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Summary cards row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <SummaryCard icon={<Users size={18} />} label="Total Subscribers" value="23" sub="+3 this month" />
              <SummaryCard icon={<DollarSign size={18} />} label="Total AUM" value="$284,500" sub="Across all risk modes" />
              <SummaryCard icon={<TrendingUp size={18} />} label="Avg Deposit" value="$12,370" sub="Per active subscriber" />
            </div>

            {/* Growth chart + Risk dist side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

              {/* Growth chart */}
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14,
                padding: '1.25rem 1.5rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div>
                    <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '13px', color: '#fff', margin: '0 0 2px' }}>
                      Subscriber Growth
                    </p>
                    <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '11.5px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
                      Last 12 months
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 5px #22c55e', display: 'inline-block' }} />
                    <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '11px', color: '#22c55e' }}>+187%</span>
                  </div>
                </div>

                {/* Chart area */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0' }}>
                  <GrowthChart />
                </div>

                {/* Month labels */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem' }}>
                  {MONTHS.map((m, i) => (
                    <span key={i} style={{ fontFamily: "'Barlow', sans-serif", fontSize: '9px', color: 'rgba(255,255,255,0.2)' }}>{m}</span>
                  ))}
                </div>
              </div>

              {/* Risk mode distribution */}
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14,
                padding: '1.25rem 1.5rem',
              }}>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '13px', color: '#fff', margin: '0 0 0.25rem' }}>
                  Risk Mode Distribution
                </p>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '11.5px', color: 'rgba(255,255,255,0.35)', margin: '0 0 1.25rem' }}>
                  How subscribers have configured their risk
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {RISK_DIST.map((r) => (
                    <div key={r.label}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '12.5px', color: r.color }}>
                          {r.label}
                        </span>
                        <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '12.5px', color: '#fff' }}>
                          {r.count}
                        </span>
                      </div>
                      <div style={{ height: 5, borderRadius: 9999, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${(r.count / maxRiskCount) * 100}%`,
                          background: r.color,
                          borderRadius: 9999,
                          transition: 'width 0.4s ease',
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Subscriber table */}
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14,
              overflow: 'hidden',
            }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '13px', color: '#fff', margin: 0 }}>
                  All Subscribers
                </p>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {thBtn('email', 'User')}
                      <th style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '11px', color: 'rgba(255,255,255,0.4)', textAlign: 'left', padding: '0 0.75rem 0.75rem' }}>
                        Vault Mode
                      </th>
                      {thBtn('aum', 'AUM', 'right')}
                      {thBtn('joined', 'Joined')}
                      {thBtn('monthlyProfit', 'Monthly Profit', 'right')}
                      {thBtn('commission', 'Your Commission', 'right')}
                      {thBtn('status', 'Status')}
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((sub) => (
                      <tr key={sub.id} className="sub-row">
                        <td style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', padding: '0.7rem 0.75rem', borderTop: '1px solid rgba(255,255,255,0.04)', whiteSpace: 'nowrap' }}>
                          {sub.email}
                        </td>
                        <td style={{ padding: '0.7rem 0.75rem', borderTop: '1px solid rgba(255,255,255,0.04)', whiteSpace: 'nowrap' }}>
                          <span style={{
                            fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '10.5px',
                            padding: '3px 9px', borderRadius: 9999,
                            background: sub.mode === 'Solana' ? 'rgba(153,69,255,0.15)' : 'rgba(249,115,22,0.15)',
                            color: sub.mode === 'Solana' ? '#c084fc' : '#fb923c',
                            border: `1px solid ${sub.mode === 'Solana' ? 'rgba(153,69,255,0.3)' : 'rgba(249,115,22,0.3)'}`,
                          }}>
                            {sub.mode}
                          </span>
                        </td>
                        <td style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '13px', color: '#fff', padding: '0.7rem 0.75rem', borderTop: '1px solid rgba(255,255,255,0.04)', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          ${sub.aum.toLocaleString()}
                        </td>
                        <td style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.45)', padding: '0.7rem 0.75rem', borderTop: '1px solid rgba(255,255,255,0.04)', whiteSpace: 'nowrap' }}>
                          {sub.joined}
                        </td>
                        <td style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '13px', color: '#22c55e', padding: '0.7rem 0.75rem', borderTop: '1px solid rgba(255,255,255,0.04)', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          +${sub.monthlyProfit.toLocaleString()}
                        </td>
                        <td style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '13px', color: '#f97316', padding: '0.7rem 0.75rem', borderTop: '1px solid rgba(255,255,255,0.04)', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          ${sub.commission.toLocaleString()}
                        </td>
                        <td style={{ padding: '0.7rem 0.75rem', borderTop: '1px solid rgba(255,255,255,0.04)', whiteSpace: 'nowrap' }}>
                          <span style={{
                            fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '11px',
                            padding: '3px 9px', borderRadius: 9999,
                            background: sub.status === 'Active' ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.06)',
                            color: sub.status === 'Active' ? '#22c55e' : 'rgba(255,255,255,0.35)',
                            border: `1px solid ${sub.status === 'Active' ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.1)'}`,
                          }}>
                            {sub.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
