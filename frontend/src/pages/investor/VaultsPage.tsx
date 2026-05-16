import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, ExternalLink } from 'lucide-react'
import FadingVideo from '../../components/FadingVideo'
import { useAuth } from '../../context/AuthContext'

type ActivityType = 'Deposit' | 'Withdrawal' | 'Profit Share'

interface VaultActivity {
  date: string
  type: ActivityType
  amount: string
  status: 'Confirmed' | 'Pending' | 'Processing'
}

const ACTIVITY: VaultActivity[] = [
  { date: 'May 14, 2026', type: 'Deposit', amount: '+$2,500.00 USDC', status: 'Confirmed' },
  { date: 'May 10, 2026', type: 'Profit Share', amount: '-$152.80 USDC', status: 'Confirmed' },
  { date: 'May 08, 2026', type: 'Deposit', amount: '+$1,780.00 USDT', status: 'Confirmed' },
  { date: 'May 03, 2026', type: 'Withdrawal', amount: '-$420.00 USDC', status: 'Confirmed' },
  { date: 'Apr 29, 2026', type: 'Profit Share', amount: '-$96.00 USDT', status: 'Confirmed' },
]

const STATUS_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  Confirmed: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)' },
  Pending: { color: '#eab308', bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.25)' },
  Processing: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)' },
}

const TYPE_COLORS: Record<ActivityType, string> = {
  Deposit: '#22c55e',
  Withdrawal: '#ef4444',
  'Profit Share': '#8b5cf6',
}

function TierBadge() {
  return (
    <span style={{
      fontFamily: "'Barlow', sans-serif",
      fontWeight: 700,
      fontSize: 10,
      letterSpacing: '0.06em',
      color: '#8b5cf6',
      background: 'rgba(139,92,246,0.15)',
      border: '1px solid rgba(139,92,246,0.3)',
      borderRadius: 9999,
      padding: '2px 8px',
    }}>S-tier</span>
  )
}

function StatusDot({ label }: { label: string }) {
  const c = STATUS_COLORS[label] ?? STATUS_COLORS['Confirmed']
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      fontFamily: "'Barlow', sans-serif",
      fontWeight: 600,
      fontSize: 11,
      color: c.color,
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: 9999,
      padding: '3px 10px',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
      {label}
    </span>
  )
}

export default function VaultsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [_hoveredVault, setHoveredVault] = useState<string | null>(null)

  const displayName = user?.name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'User'

  return (
    <div style={{ background: '#000', minHeight: '100vh', fontFamily: "'Barlow', sans-serif", position: 'relative' }}>

      {/* Background video */}
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
        style={{ position: 'fixed', top: 0, left: '-10%', width: '120%', height: '120%', objectFit: 'cover', objectPosition: 'center top', zIndex: 0 }}
      />

      {/* Dark overlay */}
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1 }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, minHeight: '100vh' }}>

        {/* Sticky top bar */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          padding: '0 clamp(1.25rem, 4vw, 5rem)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 62,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <h1 style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 800, fontSize: 18, color: '#fff', margin: 0 }}>
              My Vaults
            </h1>
            <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
              Welcome, {displayName}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 500,
                fontSize: 13,
                color: 'rgba(255,255,255,0.4)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
            >
              <ArrowLeft size={14} /> Dashboard
            </button>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 600,
                fontSize: 13,
                color: '#fff',
                background: '#3b82f6',
                border: 'none',
                borderRadius: 9999,
                padding: '8px 18px',
                cursor: 'pointer',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              <Plus size={14} /> Connect New Vault
            </button>
          </div>
        </div>

        {/* Main content */}
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px 80px' }}>

          {/* Vault cards row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 32 }}>

            {/* Vault 1 — Solana */}
            <div
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 14,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
                backdropFilter: 'blur(12px)',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={() => setHoveredVault('solana')}
              onMouseLeave={() => setHoveredVault(null)}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#9945FF', flexShrink: 0 }} />
                <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: 15, color: '#fff' }}>Solana Vault</span>
              </div>

              {/* Strategy */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Strategy:</span>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: 13, color: '#fff' }}>S/D Zone Scalper</span>
                <TierBadge />
              </div>

              {/* Balance */}
              <div>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Balance</span>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 800, fontSize: 28, color: '#fff', margin: '4px 0 0', lineHeight: 1 }}>
                  $4,280.00
                  <span style={{ fontWeight: 400, fontSize: 14, color: 'rgba(255,255,255,0.4)', marginLeft: 6 }}>USDC</span>
                </p>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />

              {/* Meta */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Status</span>
                  <StatusDot label="Delegated" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Delegation</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: 12, color: 'rgba(255,255,255,0.6)', fontVariantNumeric: 'tabular-nums' }}>
                    HgcX7tJ...wP7F
                    <ExternalLink size={11} color="rgba(255,255,255,0.3)" />
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Profit Share</span>
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                    You <strong style={{ color: '#22c55e' }}>80%</strong> / Platform <strong style={{ color: '#8b5cf6' }}>20%</strong>
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button style={{
                  flex: 1,
                  fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: 13,
                  color: '#fff', background: '#3b82f6', border: 'none',
                  borderRadius: 8, padding: '10px 0', cursor: 'pointer',
                  transition: 'opacity 0.2s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >Deposit</button>
                <button style={{
                  flex: 1,
                  fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: 13,
                  color: 'rgba(255,255,255,0.7)', background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '10px 0',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
                >Withdraw</button>
                <button style={{
                  flex: 1,
                  fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: 13,
                  color: '#ef4444', background: 'transparent',
                  border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 0',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.07)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)' }}
                >Revoke</button>
              </div>
            </div>

            {/* Vault 2 — CEX */}
            <div
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 14,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
                backdropFilter: 'blur(12px)',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={() => setHoveredVault('cex')}
              onMouseLeave={() => setHoveredVault(null)}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f97316', flexShrink: 0 }} />
                <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: 15, color: '#fff' }}>WEEX CEX Vault</span>
              </div>

              {/* Strategy */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Strategy:</span>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: 13, color: '#fff' }}>S/D Zone Scalper</span>
                <TierBadge />
              </div>

              {/* Balance */}
              <div>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Balance</span>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 800, fontSize: 28, color: '#fff', margin: '4px 0 0', lineHeight: 1 }}>
                  $1,840.00
                  <span style={{ fontWeight: 400, fontSize: 14, color: 'rgba(255,255,255,0.4)', marginLeft: 6 }}>USDT</span>
                </p>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />

              {/* Meta */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Status</span>
                  <StatusDot label="API Connected" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Exchange</span>
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: 12, color: '#f97316' }}>WEEX</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>API Key</span>
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.5)', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em' }}>
                    ••••••••••••A3F2
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Profit Share</span>
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Manual monthly settlement</span>
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button style={{
                  flex: 1,
                  fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: 13,
                  color: '#fff', background: '#3b82f6', border: 'none',
                  borderRadius: 8, padding: '10px 0', cursor: 'pointer',
                  transition: 'opacity 0.2s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >Deposit Guide</button>
                <button style={{
                  flex: 1,
                  fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: 13,
                  color: '#ef4444', background: 'transparent',
                  border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 0',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.07)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)' }}
                >Disconnect</button>
              </div>
            </div>

          </div>

          {/* Vault Activity */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 14,
            overflow: 'hidden',
            backdropFilter: 'blur(12px)',
          }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: 14, color: '#fff' }}>Vault Activity</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Date', 'Type', 'Amount', 'Status'].map((h) => (
                      <th key={h} style={{
                        fontFamily: "'Barlow', sans-serif",
                        fontWeight: 600,
                        fontSize: 11,
                        color: 'rgba(255,255,255,0.3)',
                        textAlign: 'left',
                        padding: '11px 24px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ACTIVITY.map((row, i) => (
                    <tr
                      key={i}
                      style={{ borderBottom: i < ACTIVITY.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.4)', padding: '13px 24px', whiteSpace: 'nowrap' }}>{row.date}</td>
                      <td style={{ padding: '13px 24px' }}>
                        <span style={{
                          fontFamily: "'Barlow', sans-serif",
                          fontWeight: 600,
                          fontSize: 13,
                          color: TYPE_COLORS[row.type],
                        }}>{row.type}</span>
                      </td>
                      <td style={{
                        fontFamily: "'Barlow', sans-serif",
                        fontWeight: 700,
                        fontSize: 13,
                        color: row.amount.startsWith('+') ? '#22c55e' : row.amount.startsWith('-') ? '#ef4444' : '#fff',
                        padding: '13px 24px',
                        fontVariantNumeric: 'tabular-nums',
                        whiteSpace: 'nowrap',
                      }}>{row.amount}</td>
                      <td style={{ padding: '13px 24px' }}>
                        <StatusDot label={row.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
