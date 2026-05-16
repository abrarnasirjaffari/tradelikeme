import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DollarSign, Users, TrendingUp, Target, ShieldCheck, Bell, UserPlus, ArrowUpRight, CheckCircle2 } from 'lucide-react'
import FadingVideo from '../../components/FadingVideo'
import TraderSidebar from '../../components/trader/TraderSidebar'
import type { TraderPage } from '../../components/trader/TraderSidebar'

const VIDEO_SRC = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4'

const MOCK_USER = { name: 'Sonum Sharma', email: 'sonum@tradelikeme.xyz' }

const STAT_CARDS = [
  { label: 'Total AUM',          value: '$284,500',  sub: '+$12,400 this month', icon: <DollarSign size={18} />,  color: '#f97316' },
  { label: 'Monthly Earnings',   value: '$2,140',    sub: '20% profit share',    icon: <TrendingUp size={18} />,  color: '#22c55e' },
  { label: 'Active Subscribers', value: '23',         sub: '3 new this week',     icon: <Users size={18} />,       color: '#60a5fa' },
  { label: 'Win Rate',           value: '89%',        sub: '47 verified trades',  icon: <Target size={18} />,      color: '#a78bfa' },
]

const ACTIVITY = [
  { icon: <ArrowUpRight size={14} />, color: '#22c55e',  text: 'SOLUSDT LONG entered at $187.40',        time: '2 min ago' },
  { icon: <CheckCircle2 size={14} />, color: '#22c55e',  text: 'SOLUSDT TP1 hit — $190.20 (+1.5%)',      time: '1 hr ago' },
  { icon: <UserPlus size={14} />,     color: '#60a5fa',  text: 'New subscriber: alex.sol',                time: '3 hrs ago' },
  { icon: <DollarSign size={14} />,   color: '#f97316',  text: 'Payout sent: $428.00 to platform wallet', time: '2 days ago' },
  { icon: <ArrowUpRight size={14} />, color: '#a78bfa',  text: 'BTCUSDT LONG closed — TP2 hit (+4.8%)',   time: '3 days ago' },
]

const TOP_SUBSCRIBERS = [
  { name: 'alex.sol',     aum: '$48,200', joined: 'Apr 3, 2026',  earnings: '$386' },
  { name: 'vault_king',   aum: '$35,000', joined: 'Mar 18, 2026', earnings: '$280' },
  { name: 'cryptoJenny',  aum: '$22,500', joined: 'Apr 28, 2026', earnings: '$90' },
]

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 16,
  padding: '1.25rem 1.5rem',
}

const label: React.CSSProperties = {
  fontFamily: "'Barlow', sans-serif",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.35)',
  marginBottom: '0.35rem',
}

export default function TraderOverviewPage() {
  const navigate = useNavigate()
  const [activePage, setActivePage] = useState<TraderPage>('overview')

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

  return (
    <div style={{ minHeight: '100vh', background: '#000', fontFamily: "'Barlow', sans-serif" }}>
      {/* Background video */}
      <FadingVideo
        src={VIDEO_SRC}
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', zIndex: 0 }}
      />
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', zIndex: 1 }} />

      <TraderSidebar activePage={activePage} onNavigate={handleNav} user={MOCK_USER} />

      {/* Main content */}
      <div style={{ position: 'relative', zIndex: 2, marginLeft: 220, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
            Trader Dashboard
          </h1>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
            Your strategy performance at a glance
          </p>
        </div>

        <div style={{ padding: '2rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Stat row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            {STAT_CARDS.map((s) => (
              <div key={s.label} style={{ ...card, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={label}>{s.label}</span>
                  <span style={{ color: s.color, opacity: 0.85 }}>{s.icon}</span>
                </div>
                <div style={{ fontSize: '1.7rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.35)' }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Middle row: Strategy Health + Recent Activity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem' }}>

            {/* Strategy Health */}
            <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={16} color="#f97316" />
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>Strategy Health</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>Tier</span>
                  <span style={{
                    fontWeight: 700, fontSize: '12px',
                    color: '#22c55e',
                    background: 'rgba(34,197,94,0.12)',
                    border: '1px solid rgba(34,197,94,0.25)',
                    borderRadius: 6,
                    padding: '3px 10px',
                    letterSpacing: '0.05em',
                  }}>S-TIER</span>
                </div>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>Status</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px', color: '#22c55e', fontWeight: 600 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e', display: 'inline-block' }} />
                    Active
                  </span>
                </div>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>Last Verified</span>
                  <span style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>May 10, 2026</span>
                </div>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>Next Payout</span>
                  <span style={{ fontSize: '13px', color: '#f97316', fontWeight: 600 }}>Jun 1, 2026</span>
                </div>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>Verified Trades</span>
                  <span style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>47 trades</span>
                </div>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>Fee Rate</span>
                  <span style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>15% (S-tier)</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bell size={16} color="#f97316" />
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>Recent Activity</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {ACTIVITY.map((a, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.7rem 0',
                    borderBottom: i < ACTIVITY.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  }}>
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: `rgba(${a.color === '#22c55e' ? '34,197,94' : a.color === '#60a5fa' ? '96,165,250' : a.color === '#f97316' ? '249,115,22' : '167,139,250'},0.12)`,
                      border: `1px solid ${a.color}33`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      color: a.color,
                    }}>
                      {a.icon}
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                      <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>{a.text}</span>
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{a.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Subscribers */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.1rem' }}>
              <Users size={16} color="#f97316" />
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>Top Subscribers</span>
            </div>

            {/* Table header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr',
              gap: '1rem',
              padding: '0 0 0.6rem',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              marginBottom: '0.25rem',
            }}>
              {['Subscriber', 'AUM', 'Joined', 'Your Earnings'].map(h => (
                <span key={h} style={label}>{h}</span>
              ))}
            </div>

            {TOP_SUBSCRIBERS.map((sub, i) => (
              <div key={i} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr',
                gap: '1rem',
                padding: '0.75rem 0',
                borderBottom: i < TOP_SUBSCRIBERS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                alignItems: 'center',
              }}>
                <span style={{ fontWeight: 600, fontSize: '13.5px', color: '#fff' }}>{sub.name}</span>
                <span style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.7)' }}>{sub.aum}</span>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>{sub.joined}</span>
                <span style={{ fontSize: '13.5px', color: '#22c55e', fontWeight: 600 }}>{sub.earnings}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
