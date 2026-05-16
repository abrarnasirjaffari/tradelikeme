const STATS = [
  { label: 'Total AUM', value: '$2,847,320', change: '+12.4%', changeUp: true },
  { label: 'Total Users', value: '1,247', change: '+147 this month', changeUp: true },
  { label: 'Active Agents', value: '3', change: 'All healthy', changeUp: true },
  { label: 'Monthly Revenue', value: '$18,420', change: '+23% MoM', changeUp: true },
]

const AGENTS = [
  { name: 'S/D Zones Agent', status: 'running', lastScan: '2 min ago', uptime: '99.8%' },
  { name: 'BTC Long Agent', status: 'scanning', lastScan: '14 min ago', uptime: '97.2%' },
  { name: 'SOL Swing Agent', status: 'running', lastScan: '5 min ago', uptime: '98.5%' },
]

const ACTIVITY = [
  { type: 'signup', msg: 'New user signed up', detail: 'james.k@gmail.com', time: '3 min ago' },
  { type: 'trade', msg: 'Trade completed', detail: 'SOL LONG +4.2% · S/D Zones', time: '11 min ago' },
  { type: 'approval', msg: 'Strategy approved', detail: 'Momentum Scalper by @alex_t', time: '1h ago' },
  { type: 'deposit', msg: 'Deposit received', detail: '$5,000 USDC · Vault #0x8A2f', time: '2h ago' },
  { type: 'sl', msg: 'Stop loss hit', detail: 'BTC SHORT -2.3% · BTC Long Agent', time: '3h ago' },
]

// Revenue data: 6 months of monthly revenue ($k)
const REVENUE_POINTS = [8.2, 9.7, 11.4, 13.1, 15.8, 18.42]

function RevenueChart() {
  const W = 520
  const H = 100
  const pad = { t: 10, r: 10, b: 24, l: 40 }
  const chartW = W - pad.l - pad.r
  const chartH = H - pad.t - pad.b
  const minV = 0
  const maxV = 22
  const months = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May']

  const pts = REVENUE_POINTS.map((v, i) => ({
    x: pad.l + (i / (REVENUE_POINTS.length - 1)) * chartW,
    y: pad.t + chartH - ((v - minV) / (maxV - minV)) * chartH,
  }))

  const polyline = pts.map(p => `${p.x},${p.y}`).join(' ')
  // Area fill path
  const areaPath = `M${pts[0].x},${pts[0].y} ${pts.map(p => `L${p.x},${p.y}`).join(' ')} L${pts[pts.length - 1].x},${pad.t + chartH} L${pts[0].x},${pad.t + chartH} Z`

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const y = pad.t + t * chartH
        const val = Math.round(maxV - t * (maxV - minV))
        return (
          <g key={i}>
            <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <text x={pad.l - 6} y={y + 4} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="Barlow, sans-serif">${val}k</text>
          </g>
        )
      })}
      {/* Area */}
      <path d={areaPath} fill="url(#revGrad)" />
      {/* Line */}
      <polyline points={polyline} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {/* Dots */}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#3b82f6" stroke="rgba(0,0,0,0.6)" strokeWidth="1.5" />
      ))}
      {/* Month labels */}
      {months.map((m, i) => {
        const x = pad.l + (i / (months.length - 1)) * chartW
        return <text key={i} x={x} y={H - 4} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="Barlow, sans-serif">{m}</text>
      })}
    </svg>
  )
}

const statusDotColor = (s: string) => s === 'running' ? '#22c55e' : s === 'scanning' ? '#60a5fa' : 'rgba(255,255,255,0.3)'

const activityIcon: Record<string, string> = {
  signup: '👤', trade: '📈', approval: '✅', deposit: '💰', sl: '🔴',
}

export default function AdminOverview() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {STATS.map((s) => (
          <div key={s.label} style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12,
            padding: 24,
          }}>
            <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: '0 0 8px' }}>
              {s.label}
            </p>
            <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '26px', color: '#fff', margin: '0 0 6px' }}>
              {s.value}
            </p>
            <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '12px', color: s.changeUp ? '#22c55e' : '#ef4444', margin: 0 }}>
              {s.change}
            </p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        padding: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '14px', color: '#fff', margin: 0 }}>Revenue</p>
            <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>Monthly platform revenue (USD)</p>
          </div>
          <span style={{
            fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '11px',
            color: '#22c55e', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: 9999, padding: '3px 10px',
          }}>+23% MoM</span>
        </div>
        <RevenueChart />
      </div>

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

        {/* Agent status table */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          padding: 24,
        }}>
          <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '14px', color: '#fff', margin: '0 0 16px' }}>
            Agent Status
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {AGENTS.map((a, i) => (
              <div key={a.name} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 0',
                borderBottom: i < AGENTS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: statusDotColor(a.status),
                    boxShadow: a.status === 'running' ? '0 0 6px #22c55e' : a.status === 'scanning' ? '0 0 6px #60a5fa' : 'none',
                    display: 'block',
                  }} />
                  <div>
                    <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '13px', color: '#fff', margin: 0 }}>{a.name}</p>
                    <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>
                      Last scan: {a.lastScan}
                    </p>
                  </div>
                </div>
                <span style={{
                  fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '12px',
                  color: '#22c55e',
                }}>{a.uptime}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity feed */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          padding: 24,
        }}>
          <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '14px', color: '#fff', margin: '0 0 16px' }}>
            Recent Activity
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {ACTIVITY.map((a, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '10px 0',
                borderBottom: i < ACTIVITY.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              }}>
                <span style={{ fontSize: '14px', flexShrink: 0, marginTop: 1 }}>{activityIcon[a.type]}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '12.5px', color: '#fff', margin: 0 }}>{a.msg}</p>
                  <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '11.5px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.detail}</p>
                </div>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '11px', color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>{a.time}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
