import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Shield, BarChart2, Zap, ArrowLeft } from 'lucide-react'
import FadingVideo from '../../components/FadingVideo'

const VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4'

type RiskMode = 'conservative' | 'medium' | 'aggressive'

const MODES: {
  key: RiskMode
  label: string
  subtitle: string
  icon: React.ReactNode
  borderColor: string
  selectedBg: string
  leverage: string
  margin: string
  buffer: string
  bestFor: string
}[] = [
  {
    key: 'conservative',
    label: 'Conservative',
    subtitle: 'For new users and large deposits',
    icon: <Shield size={22} color="#22c55e" strokeWidth={1.8} />,
    borderColor: '#22c55e',
    selectedBg: 'rgba(34,197,94,0.08)',
    leverage: '50–100x',
    margin: '0.25–0.5%',
    buffer: '20+',
    bestFor: 'Capital preservation, steady growth',
  },
  {
    key: 'medium',
    label: 'Medium',
    subtitle: 'Balanced risk/reward',
    icon: <BarChart2 size={22} color="#3b82f6" strokeWidth={1.8} />,
    borderColor: '#3b82f6',
    selectedBg: 'rgba(59,130,246,0.08)',
    leverage: '50–200x',
    margin: '0.5–1%',
    buffer: '8–10',
    bestFor: 'Experienced users, medium deposits',
  },
  {
    key: 'aggressive',
    label: 'Aggressive',
    subtitle: 'Maximum returns, higher risk',
    icon: <Zap size={22} color="#f97316" strokeWidth={1.8} />,
    borderColor: '#f97316',
    selectedBg: 'rgba(249,115,22,0.08)',
    leverage: '50–300x',
    margin: '1–2%',
    buffer: '4–5',
    bestFor: 'Risk-tolerant, small deposits',
  },
]

const TABLE_ROWS: { label: string; conservative: string; medium: string; aggressive: string }[] = [
  { label: 'Max leverage', conservative: '100x', medium: '200x', aggressive: '300x' },
  { label: 'Margin/trade', conservative: '0.5%', medium: '1%', aggressive: '2%' },
  { label: 'Buffer trades', conservative: '20+', medium: '8–10', aggressive: '4–5' },
  { label: 'Suitable for', conservative: 'Large deposits', medium: 'Any', aggressive: 'Small deposits' },
]

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  padding: 24,
}

export default function RiskSettingsPage() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<RiskMode>('conservative')

  function handleSave() {
    toast.success(`Risk mode set to ${selected}`)
  }

  return (
    <div style={{ background: '#000', minHeight: '100vh', fontFamily: "'Barlow', sans-serif" }}>
      <FadingVideo
        src={VIDEO_SRC}
        style={{
          position: 'fixed',
          top: 0,
          left: '-10%',
          width: '120%',
          height: '120%',
          objectFit: 'cover',
          objectPosition: 'center top',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.55)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Sticky top bar */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 40,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            padding: '0 2rem',
            height: 60,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 400,
              fontSize: '13px',
              color: 'rgba(255,255,255,0.5)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
          >
            <ArrowLeft size={15} />
            Dashboard
          </button>
          <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '14px' }}>/</span>
          <h2
            style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 600,
              fontSize: '15px',
              color: '#fff',
              margin: 0,
            }}
          >
            Risk Mode Settings
          </h2>
        </div>

        {/* Main content */}
        <main style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
          <p
            style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 300,
              fontSize: '14px',
              color: 'rgba(255,255,255,0.5)',
              marginBottom: '2rem',
              marginTop: 0,
            }}
          >
            Your risk mode controls leverage and margin per trade. Changes take effect on the next
            trade entry.
          </p>

          {/* Mode cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            {MODES.map(m => {
              const isSelected = selected === m.key
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setSelected(m.key)}
                  style={{
                    background: isSelected ? m.selectedBg : 'rgba(255,255,255,0.04)',
                    border: isSelected
                      ? `1.5px solid ${m.borderColor}`
                      : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12,
                    padding: 24,
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    transition: 'all 0.15s',
                    borderLeft: isSelected ? `4px solid ${m.borderColor}` : '4px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div>{m.icon}</div>
                  <p
                    style={{
                      fontFamily: "'Barlow', sans-serif",
                      fontWeight: 600,
                      fontSize: '15px',
                      color: '#fff',
                      margin: 0,
                    }}
                  >
                    {m.label}
                  </p>
                  <p
                    style={{
                      fontFamily: "'Barlow', sans-serif",
                      fontWeight: 400,
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.45)',
                      margin: 0,
                    }}
                  >
                    {m.subtitle}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span
                        style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}
                      >
                        Leverage
                      </span>
                      <span
                        style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '12px', color: '#fff' }}
                      >
                        {m.leverage}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span
                        style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}
                      >
                        Margin/trade
                      </span>
                      <span
                        style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '12px', color: '#fff' }}
                      >
                        {m.margin}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span
                        style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}
                      >
                        Buffer trades
                      </span>
                      <span
                        style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '12px', color: '#fff' }}
                      >
                        {m.buffer}
                      </span>
                    </div>
                    <div
                      style={{
                        marginTop: '0.25rem',
                        paddingTop: '0.5rem',
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <span
                        style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}
                      >
                        Best for:{' '}
                      </span>
                      <span
                        style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}
                      >
                        {m.bestFor}
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Comparison table */}
          <div style={{ ...cardStyle, marginBottom: '2rem', overflowX: 'auto' }}>
            <p
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 600,
                fontSize: '13px',
                color: 'rgba(255,255,255,0.5)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginTop: 0,
                marginBottom: '1rem',
              }}
            >
              Comparison
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th
                    style={{
                      fontFamily: "'Barlow', sans-serif",
                      fontWeight: 400,
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.3)',
                      textAlign: 'left',
                      paddingBottom: '0.75rem',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    Feature
                  </th>
                  {(['conservative', 'medium', 'aggressive'] as RiskMode[]).map(k => {
                    const m = MODES.find(x => x.key === k)!
                    return (
                      <th
                        key={k}
                        style={{
                          fontFamily: "'Barlow', sans-serif",
                          fontWeight: 600,
                          fontSize: '12px',
                          color: selected === k ? m.borderColor : 'rgba(255,255,255,0.5)',
                          textAlign: 'center',
                          paddingBottom: '0.75rem',
                          borderBottom: '1px solid rgba(255,255,255,0.06)',
                          transition: 'color 0.15s',
                        }}
                      >
                        {m.label}
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map((row, i) => (
                  <tr key={i}>
                    <td
                      style={{
                        fontFamily: "'Barlow', sans-serif",
                        fontWeight: 300,
                        fontSize: '13px',
                        color: 'rgba(255,255,255,0.4)',
                        padding: '0.6rem 0',
                        borderBottom: i < TABLE_ROWS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      }}
                    >
                      {row.label}
                    </td>
                    {(['conservative', 'medium', 'aggressive'] as const).map(k => (
                      <td
                        key={k}
                        style={{
                          fontFamily: "'Barlow', sans-serif",
                          fontWeight: selected === k ? 500 : 300,
                          fontSize: '13px',
                          color: selected === k ? '#fff' : 'rgba(255,255,255,0.5)',
                          textAlign: 'center',
                          padding: '0.6rem 0',
                          borderBottom: i < TABLE_ROWS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                          transition: 'color 0.15s, font-weight 0.15s',
                        }}
                      >
                        {row[k]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Save button */}
          <button
            type="button"
            onClick={handleSave}
            style={{
              width: '100%',
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 600,
              fontSize: '14px',
              color: '#fff',
              background: '#3b82f6',
              border: 'none',
              borderRadius: 10,
              padding: '14px 0',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#2563eb')}
            onMouseLeave={e => (e.currentTarget.style.background = '#3b82f6')}
          >
            Save Changes
          </button>
        </main>
      </div>
    </div>
  )
}
