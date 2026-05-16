import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Copy, Share2, Gift, Users, DollarSign } from 'lucide-react'
import FadingVideo from '../../components/FadingVideo'

const VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4'

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  padding: 24,
  fontFamily: "'Barlow', sans-serif",
}

type ReferralStatus = 'Signed Up' | 'Deposited' | 'Active'

interface ReferralRow {
  date: string
  user: string
  status: ReferralStatus
  earnings: number
  phase: '1%' | '0.5%' | '0.25%'
}

// earnings reflect phase-based commission: 1% (mo 1-3), 0.5% (mo 4-9), 0.25% lifetime
const MOCK_REFERRALS: ReferralRow[] = [
  { date: 'May 14, 2026', user: 'user_a3f2...', status: 'Active', earnings: 32.40, phase: '1%' },
  { date: 'May 13, 2026', user: 'user_b8c1...', status: 'Active', earnings: 18.80, phase: '1%' },
  { date: 'May 12, 2026', user: 'user_d4e9...', status: 'Deposited', earnings: 0, phase: '1%' },
  { date: 'Feb 11, 2026', user: 'user_f7a0...', status: 'Active', earnings: 27.10, phase: '0.5%' },
  { date: 'Feb 10, 2026', user: 'user_2b3c...', status: 'Active', earnings: 6.30, phase: '0.5%' },
  { date: 'Nov 8, 2025', user: 'user_9d5f...', status: 'Active', earnings: 10.48, phase: '0.25%' },
  { date: 'May 6, 2026', user: 'user_e1c6...', status: 'Signed Up', earnings: 0, phase: '1%' },
  { date: 'Nov 3, 2025', user: 'user_7f8b...', status: 'Active', earnings: 7.18, phase: '0.25%' },
]

const STATUS_COLORS: Record<ReferralStatus, { bg: string; color: string }> = {
  Active: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e' },
  Deposited: { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' },
  'Signed Up': { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' },
}

const COMMISSION_PHASES = [
  {
    phase: 'Phase 1',
    duration: 'Months 1–3',
    rate: '1%',
    description: 'of referred user\'s monthly profit',
    color: '#22c55e',
    example: 'e.g. $1,000 profit → you earn $10/mo',
  },
  {
    phase: 'Phase 2',
    duration: 'Months 4–9',
    rate: '0.5%',
    description: 'of referred user\'s monthly profit',
    color: '#3b82f6',
    example: 'e.g. $1,000 profit → you earn $5/mo',
  },
  {
    phase: 'Lifetime',
    duration: 'Month 10+',
    rate: '0.25%',
    description: 'of referred user\'s total cumulative profit',
    color: '#8b5cf6',
    example: 'e.g. $10,000 total profit → you earn $25',
  },
]

const REFERRAL_LINK = 'https://tradelikeme.xyz/ref/abrar2026'
const TOTAL_REFERRALS = 12
const ACTIVE_INVESTORS = 8
const TOTAL_EARNED = 102.26

export default function ReferralPage() {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(REFERRAL_LINK).catch(() => {})
    setCopied(true)
    toast.success('Referral link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  function handleShareTwitter() {
    const text = encodeURIComponent(
      `I've been using @TradeLikeMe — verified 89% win rate trading strategy.\nJoin with my link and we both earn: ${REFERRAL_LINK}`
    )
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
  }

  const totalEarned = MOCK_REFERRALS.reduce((sum, r) => sum + r.earnings, 0)

  return (
    <div style={{ background: '#000', minHeight: '100vh', fontFamily: "'Barlow', sans-serif" }}>
      {/* Background video */}
      <FadingVideo
        src={VIDEO_SRC}
        style={{
          position: 'fixed', top: 0, left: '-10%',
          width: '120%', height: '120%',
          objectFit: 'cover', objectPosition: 'center top',
          zIndex: 0,
        }}
      />
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 0, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* Sticky top bar */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 40,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '0 2rem',
          height: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link
              to="/dashboard"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 13,
                fontFamily: "'Barlow', sans-serif",
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#fff' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.5)' }}
            >
              <ArrowLeft size={14} /> Dashboard
            </Link>
            <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 14 }}>|</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>Referral Program</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f97316', fontSize: 13, fontWeight: 600 }}>
            <Gift size={14} />
            <span>1% → 0.5% → 0.25% lifetime commission per referral</span>
          </div>
        </div>

        {/* Main content */}
        <main style={{ flex: 1, padding: '2rem', maxWidth: 900, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Section 1 — Your Referral Link */}
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 700, color: '#fff' }}>
                Your Referral Link
              </h2>
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                padding: '12px 16px',
                fontFamily: 'monospace',
                fontSize: 14,
                color: 'rgba(255,255,255,0.7)',
                marginBottom: 16,
                wordBreak: 'break-all',
                letterSpacing: '0.02em',
              }}>
                {REFERRAL_LINK}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={handleCopy}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: copied ? 'rgba(34,197,94,0.15)' : '#3b82f6',
                    border: copied ? '1px solid #22c55e' : 'none',
                    borderRadius: 8, padding: '9px 18px',
                    color: copied ? '#22c55e' : '#fff',
                    fontFamily: "'Barlow', sans-serif",
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <Copy size={13} />
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
                <button
                  onClick={handleShareTwitter}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: 'none',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 8, padding: '9px 18px',
                    color: 'rgba(255,255,255,0.7)',
                    fontFamily: "'Barlow', sans-serif",
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
                >
                  <Share2 size={13} />
                  Share on Twitter
                </button>
              </div>
            </div>

            {/* Section 2 — Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {[
                { icon: <Users size={18} />, label: 'Total Referrals', value: TOTAL_REFERRALS, color: '#3b82f6' },
                { icon: <Users size={18} />, label: 'Active Investors', value: ACTIVE_INVESTORS, color: '#22c55e' },
                { icon: <DollarSign size={18} />, label: 'Total Earned', value: `$${TOTAL_EARNED.toFixed(2)}`, color: '#f97316' },
              ].map(stat => (
                <div key={stat.label} style={cardStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: stat.color }}>
                    {stat.icon}
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      {stat.label}
                    </span>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Section 3 — Commission Schedule */}
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 6px 0', fontSize: 18, fontWeight: 700, color: '#fff' }}>
                Commission Schedule
              </h2>
              <p style={{ margin: '0 0 20px 0', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                Per referred user — commission auto-scales based on how long they've been active
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {COMMISSION_PHASES.map((p, i) => (
                  <div key={p.phase} style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    background: `${p.color}08`,
                    border: `1px solid ${p.color}25`,
                    borderRadius: 10, padding: '16px 20px',
                  }}>
                    {/* Step number */}
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                      background: `${p.color}18`, border: `1.5px solid ${p.color}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, color: p.color,
                    }}>
                      {i + 1}
                    </div>
                    {/* Labels */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{p.phase}</span>
                        <span style={{
                          fontSize: 11, fontWeight: 600, letterSpacing: '0.05em',
                          background: `${p.color}18`, color: p.color,
                          border: `1px solid ${p.color}30`,
                          borderRadius: 4, padding: '1px 7px',
                        }}>{p.duration}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{p.example}</div>
                    </div>
                    {/* Rate */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: p.color }}>{p.rate}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', maxWidth: 120, textAlign: 'right' }}>
                        {p.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Timeline connector visual */}
              <div style={{ margin: '20px 0 0 0', padding: '14px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 10, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Example — Referral with $500/mo profit
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                  {[
                    { label: 'Mo 1–3', value: '$5.00/mo', color: '#22c55e' },
                    { label: 'Mo 4–9', value: '$2.50/mo', color: '#3b82f6' },
                    { label: 'Mo 10+', value: '$1.25/mo', color: '#8b5cf6' },
                  ].map((seg, i, arr) => (
                    <>
                      <div key={seg.label} style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: seg.color }}>{seg.value}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{seg.label}</div>
                      </div>
                      {i < arr.length - 1 && (
                        <div key={`arr-${i}`} style={{ color: 'rgba(255,255,255,0.15)', fontSize: 18, padding: '0 4px' }}>→</div>
                      )}
                    </>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 4 — Referral History table */}
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 700, color: '#fff' }}>
                Referral History
              </h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Barlow', sans-serif" }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      {['Date', 'Referred User', 'Status', 'Phase', 'Your Earnings'].map(col => (
                        <th key={col} style={{
                          textAlign: 'left', padding: '8px 12px',
                          fontSize: 11, fontWeight: 600, letterSpacing: '0.07em',
                          color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase',
                        }}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_REFERRALS.map((row, i) => {
                      const colors = STATUS_COLORS[row.status]
                      return (
                        <tr
                          key={i}
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                        >
                          <td style={{ padding: '10px 12px', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                            {row.date}
                          </td>
                          <td style={{ padding: '10px 12px', fontSize: 13, color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace' }}>
                            {row.user}
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{
                              display: 'inline-block',
                              background: colors.bg, color: colors.color,
                              border: `1px solid ${colors.color}33`,
                              borderRadius: 5, padding: '2px 9px',
                              fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
                            }}>
                              {row.status}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{
                              display: 'inline-block',
                              background: row.phase === '1%' ? 'rgba(34,197,94,0.1)' : row.phase === '0.5%' ? 'rgba(59,130,246,0.1)' : 'rgba(139,92,246,0.1)',
                              color: row.phase === '1%' ? '#22c55e' : row.phase === '0.5%' ? '#3b82f6' : '#8b5cf6',
                              borderRadius: 5, padding: '2px 9px',
                              fontSize: 11, fontWeight: 700,
                            }}>
                              {row.phase}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', fontSize: 13, color: row.earnings > 0 ? '#22c55e' : 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
                            {row.earnings > 0 ? `+$${row.earnings.toFixed(2)}` : '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: '2px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                      <td colSpan={4} style={{ padding: '12px 12px', fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>
                        Total Earned
                      </td>
                      <td style={{ padding: '12px 12px', fontSize: 14, fontWeight: 800, color: '#22c55e' }}>
                        +${totalEarned.toFixed(2)}
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
