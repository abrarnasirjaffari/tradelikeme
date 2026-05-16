import { Gift, Users, DollarSign, ArrowRight } from 'lucide-react'

interface Props {
  onFullPage: () => void
}

const PHASES = [
  { label: 'Months 1–3', rate: '1%', color: '#22c55e' },
  { label: 'Months 4–9', rate: '0.5%', color: '#3b82f6' },
  { label: 'Month 10+', rate: '0.25%', color: '#8b5cf6' },
]

export default function ReferralCard({ onFullPage }: Props) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12,
      padding: 24,
      fontFamily: "'Barlow', sans-serif",
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'rgba(249,115,22,0.12)',
            border: '1px solid rgba(249,115,22,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Gift size={15} color="#f97316" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Referral Program</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Earn commission on every referral's profit</div>
          </div>
        </div>
        <button
          onClick={onFullPage}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: 'none', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 7, padding: '6px 12px', cursor: 'pointer',
            color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 500,
            fontFamily: "'Barlow', sans-serif", transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
        >
          View Full Program <ArrowRight size={12} />
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { icon: <Users size={14} />, label: 'Total Referrals', value: '12', color: '#3b82f6' },
          { icon: <Users size={14} />, label: 'Active Investors', value: '8', color: '#22c55e' },
          { icon: <DollarSign size={14} />, label: 'Total Earned', value: '$102.26', color: '#f97316' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 8, padding: '12px 14px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: s.color, marginBottom: 6 }}>
              {s.icon}
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
                {s.label}
              </span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Commission phases */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 10 }}>
          Your Commission Rate Per Referral
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {PHASES.map((p, i) => (
            <div key={p.label} style={{
              flex: 1, textAlign: 'center',
              background: `${p.color}08`,
              border: `1px solid ${p.color}25`,
              borderRadius: 8, padding: '10px 8px',
            }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: p.color }}>{p.rate}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>{p.label}</div>
              {i < PHASES.length - 1 && (
                <div style={{ position: 'absolute' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(249,115,22,0.08), rgba(249,115,22,0.04))',
        border: '1px solid rgba(249,115,22,0.15)',
        borderRadius: 8, padding: '12px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Invite friends to TradeLikeMe</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
            tradelikeme.xyz/ref/abrar2026
          </div>
        </div>
        <button
          onClick={onFullPage}
          style={{
            background: '#f97316', border: 'none', borderRadius: 7,
            padding: '8px 16px', cursor: 'pointer',
            color: '#fff', fontSize: 12, fontWeight: 700,
            fontFamily: "'Barlow', sans-serif",
            display: 'inline-flex', alignItems: 'center', gap: 5,
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
        >
          <Gift size={12} /> Share Link
        </button>
      </div>
    </div>
  )
}
