// Retention % per month (6 months)
const RETENTION = [94, 91, 93, 88, 90, 92]
const RETENTION_MONTHS = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May']

const STRATEGY_REVENUE = [
  { name: 'S/D Zones Agent', tier: 'S', aum: '$1,820,000', fee: '15%', monthly: '$10,920', status: 'Active' },
  { name: 'ETH Grid Bot', tier: 'B', aum: '$640,000', fee: '10%', monthly: '$5,120', status: 'Active' },
  { name: 'Momentum Scalper', tier: 'A', aum: '$387,320', fee: '12%', monthly: '$2,324', status: 'Active' },
]

const PERFORMANCE = [
  { strategy: 'S/D Zones Agent', tier: 'S' as const, winRate: '89%', totalTrades: 210, aum: '$1,820,000', monthly: '$10,920', status: 'Active' },
  { strategy: 'ETH Grid Bot', tier: 'B' as const, winRate: '68%', totalTrades: 134, aum: '$640,000', monthly: '$5,120', status: 'Active' },
  { strategy: 'Momentum Scalper', tier: 'A' as const, winRate: '77%', totalTrades: 84, aum: '$387,320', monthly: '$2,324', status: 'Active' },
]

const TIER_COLORS: Record<string, { color: string; bg: string }> = {
  S: { color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
  A: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  B: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  C: { color: 'rgba(255,255,255,0.5)', bg: 'rgba(255,255,255,0.06)' },
}

function TierBadge({ tier }: { tier: string }) {
  const c = TIER_COLORS[tier] ?? TIER_COLORS['C']
  return (
    <span style={{
      fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '11px',
      color: c.color, background: c.bg,
      borderRadius: 6, padding: '3px 9px',
    }}>{tier}-tier</span>
  )
}

function RetentionChart() {
  const W = 340
  const H = 160
  const pad = { t: 10, r: 10, b: 24, l: 34 }
  const chartW = W - pad.l - pad.r
  const chartH = H - pad.t - pad.b
  const barW = Math.floor(chartW / RETENTION.length) - 6
  const minV = 80
  const maxV = 100

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      {/* Grid lines */}
      {[80, 85, 90, 95, 100].map((v, i) => {
        const y = pad.t + chartH - ((v - minV) / (maxV - minV)) * chartH
        return (
          <g key={i}>
            <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <text x={pad.l - 4} y={y + 4} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="Barlow, sans-serif">{v}%</text>
          </g>
        )
      })}

      {/* Bars */}
      {RETENTION.map((v, i) => {
        const barH = ((v - minV) / (maxV - minV)) * chartH
        const spacing = chartW / RETENTION.length
        const x = pad.l + i * spacing + (spacing - barW) / 2
        const y = pad.t + chartH - barH
        return (
          <g key={i}>
            <rect
              x={x} y={y} width={barW} height={barH}
              rx={3}
              fill={v >= 92 ? '#22c55e' : v >= 88 ? '#3b82f6' : '#f97316'}
              opacity="0.8"
            />
            <text x={x + barW / 2} y={y - 4} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="Barlow, sans-serif">{v}%</text>
            <text x={x + barW / 2} y={H - 6} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="Barlow, sans-serif">{RETENTION_MONTHS[i]}</text>
          </g>
        )
      })}
    </svg>
  )
}

export default function AdminAnalytics() {
  const metrics = [
    { label: 'Revenue MoM', value: '+23%', sub: 'vs last month', color: '#22c55e' },
    { label: 'New Users', value: '147', sub: 'this month', color: '#3b82f6' },
    { label: 'Churn Rate', value: '2.1%', sub: 'last 30 days', color: '#f97316' },
    { label: 'Avg AUM / User', value: '$2,284', sub: 'per investor', color: '#8b5cf6' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {metrics.map(m => (
          <div key={m.label} style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12,
            padding: 24,
          }}>
            <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: '0 0 8px' }}>
              {m.label}
            </p>
            <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '28px', color: m.color, margin: '0 0 4px' }}>
              {m.value}
            </p>
            <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
              {m.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

        {/* Revenue by strategy table */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          padding: 24,
        }}>
          <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '14px', color: '#fff', margin: '0 0 18px' }}>
            Revenue by Strategy
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Strategy', 'AUM', 'Fee', 'Monthly Rev'].map(col => (
                  <th key={col} style={{
                    fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '10px',
                    color: 'rgba(255,255,255,0.35)', textAlign: 'left',
                    paddingBottom: 10,
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                  }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STRATEGY_REVENUE.map((s, i) => (
                <tr key={s.name} style={{ borderBottom: i < STRATEGY_REVENUE.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <td style={{ padding: '10px 0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '12.5px', color: '#fff' }}>{s.name}</span>
                      <TierBadge tier={s.tier} />
                    </div>
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{s.aum}</span>
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '12px', color: '#f97316' }}>{s.fee}</span>
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '13px', color: '#22c55e' }}>{s.monthly}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{
            marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', justifyContent: 'space-between',
          }}>
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Total</span>
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '14px', color: '#22c55e' }}>$18,364 / mo</span>
          </div>
        </div>

        {/* Retention bar chart */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          padding: 24,
        }}>
          <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '14px', color: '#fff', margin: '0 0 4px' }}>
            User Retention
          </p>
          <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '0 0 16px' }}>
            Monthly retention rate (%)
          </p>
          <RetentionChart />
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            {[
              { color: '#22c55e', label: '≥ 92%' },
              { color: '#3b82f6', label: '88–91%' },
              { color: '#f97316', label: '< 88%' },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: l.color, display: 'block', flexShrink: 0 }} />
                <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Strategy Performance Comparison */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        padding: 24,
      }}>
        <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '14px', color: '#fff', margin: '0 0 18px' }}>
          Strategy Performance Comparison
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Strategy', 'Tier', 'Win Rate', 'Trades', 'AUM', 'Monthly Rev', 'Status'].map(col => (
                  <th key={col} style={{
                    fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '10px',
                    color: 'rgba(255,255,255,0.35)', textAlign: 'left',
                    padding: '0 12px 10px',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                  }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERFORMANCE.map((p, i) => (
                <tr key={p.strategy} style={{ borderBottom: i < PERFORMANCE.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <td style={{ padding: '12px 12px' }}>
                    <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '13px', color: '#fff' }}>{p.strategy}</span>
                  </td>
                  <td style={{ padding: '12px 12px' }}>
                    <TierBadge tier={p.tier} />
                  </td>
                  <td style={{ padding: '12px 12px' }}>
                    <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '13px', color: '#22c55e' }}>{p.winRate}</span>
                  </td>
                  <td style={{ padding: '12px 12px' }}>
                    <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{p.totalTrades}</span>
                  </td>
                  <td style={{ padding: '12px 12px' }}>
                    <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{p.aum}</span>
                  </td>
                  <td style={{ padding: '12px 12px' }}>
                    <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '13px', color: '#22c55e' }}>{p.monthly}</span>
                  </td>
                  <td style={{ padding: '12px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'block' }} />
                      <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '12.5px', color: '#22c55e' }}>{p.status}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
