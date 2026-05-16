import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowRight, TrendingUp, Users, BarChart2 } from 'lucide-react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

type Tier = 'S' | 'A' | 'B' | 'C'
type FilterOption = 'All' | 'S-tier' | 'A-tier' | 'B-tier'

interface StrategyItem {
  id: string
  name: string
  tier: Tier
  status: 'Live'
  trader: string
  winRate: number
  avgReturn: number
  totalTrades: number
  coins: string[]
}

const STRATEGIES: StrategyItem[] = [
  {
    id: 'sd-zone-scalper',
    name: 'S/D Zone Scalper',
    tier: 'S',
    status: 'Live',
    trader: 'Abrar N.',
    winRate: 89,
    avgReturn: 4.2,
    totalTrades: 142,
    coins: ['SOL', 'BTC', 'ETH', 'XRP'],
  },
  {
    id: 'btc-swing-trader',
    name: 'BTC Swing Trader',
    tier: 'A',
    status: 'Live',
    trader: 'Sonum K.',
    winRate: 78,
    avgReturn: 3.1,
    totalTrades: 67,
    coins: ['BTC', 'ETH'],
  },
  {
    id: 'altcoin-momentum',
    name: 'Altcoin Momentum',
    tier: 'B',
    status: 'Live',
    trader: 'Wei Z.',
    winRate: 71,
    avgReturn: 2.8,
    totalTrades: 53,
    coins: ['SOL', 'DOGE', 'WIF', 'BRETT'],
  },
  {
    id: 'sol-zone-hunter',
    name: 'SOL Zone Hunter',
    tier: 'A',
    status: 'Live',
    trader: 'Maria R.',
    winRate: 76,
    avgReturn: 3.4,
    totalTrades: 88,
    coins: ['SOL', 'SUI', 'TAO'],
  },
]

const TIER_COLORS: Record<Tier, { bg: string; text: string; border: string }> = {
  S: { bg: 'rgba(139,92,246,0.15)', text: '#8b5cf6', border: 'rgba(139,92,246,0.3)' },
  A: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6', border: 'rgba(59,130,246,0.3)' },
  B: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e', border: 'rgba(34,197,94,0.3)' },
  C: { bg: 'rgba(249,115,22,0.15)', text: '#f97316', border: 'rgba(249,115,22,0.3)' },
}

const FILTER_OPTIONS: FilterOption[] = ['All', 'S-tier', 'A-tier', 'B-tier']

function TierBadge({ tier }: { tier: Tier }) {
  const c = TIER_COLORS[tier]
  return (
    <span style={{
      fontFamily: "'Barlow', sans-serif",
      fontWeight: 700,
      fontSize: '11px',
      letterSpacing: '0.06em',
      color: c.text,
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: 9999,
      padding: '3px 10px',
    }}>
      {tier}-tier
    </span>
  )
}

function StatusBadge() {
  return (
    <span style={{
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      fontFamily: "'Barlow', sans-serif",
      fontWeight: 600,
      fontSize: '11px',
      color: '#22c55e',
      background: 'rgba(34,197,94,0.1)',
      border: '1px solid rgba(34,197,94,0.25)',
      borderRadius: 9999,
      padding: '3px 10px',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
      Live
    </span>
  )
}

function StrategyCard({ strategy }: { strategy: StrategyItem }) {
  const navigate = useNavigate()

  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12,
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      minWidth: 280,
      transition: 'border-color 0.2s',
    }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TierBadge tier={strategy.tier} />
          <StatusBadge />
        </div>
      </div>

      {/* Name + trader */}
      <div>
        <p style={{
          fontFamily: "'Barlow', sans-serif",
          fontWeight: 700,
          fontSize: 18,
          color: '#fff',
          margin: 0,
          lineHeight: 1.2,
        }}>{strategy.name}</p>
        <p style={{
          fontFamily: "'Barlow', sans-serif",
          fontWeight: 400,
          fontSize: 13,
          color: 'rgba(255,255,255,0.5)',
          margin: '4px 0 0',
        }}>Trader: {strategy.trader}</p>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 0, justifyContent: 'space-between' }}>
        {[
          { label: 'Win Rate', value: `${strategy.winRate}%`, icon: <TrendingUp size={12} /> },
          { label: 'Avg Return', value: `+${strategy.avgReturn}%`, icon: <BarChart2 size={12} /> },
          { label: 'Total Trades', value: String(strategy.totalTrades), icon: <Users size={12} /> },
        ].map((stat) => (
          <div key={stat.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.3)' }}>
              {stat.icon}
              <span style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 400,
                fontSize: 11,
                color: 'rgba(255,255,255,0.3)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>{stat.label}</span>
            </div>
            <span style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 700,
              fontSize: 16,
              color: stat.label === 'Win Rate' ? '#22c55e' : '#fff',
            }}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />

      {/* Coins */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{
          fontFamily: "'Barlow', sans-serif",
          fontSize: 12,
          color: 'rgba(255,255,255,0.3)',
        }}>Coins:</span>
        {strategy.coins.map((coin) => (
          <span key={coin} style={{
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 600,
            fontSize: 11,
            color: 'rgba(255,255,255,0.6)',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 6,
            padding: '2px 8px',
          }}>{coin}</span>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <button
          onClick={() => navigate(`/strategies/${strategy.id}`)}
          style={{
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 600,
            fontSize: 13,
            color: '#3b82f6',
            background: 'transparent',
            border: '1px solid rgba(59,130,246,0.35)',
            borderRadius: 8,
            padding: '8px 14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            transition: 'background 0.2s, border-color 0.2s',
            flex: 1,
            justifyContent: 'center',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.08)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.6)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.35)' }}
        >
          View Strategy <ArrowRight size={13} />
        </button>
        <button
          style={{
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 600,
            fontSize: 13,
            color: '#fff',
            background: '#3b82f6',
            border: 'none',
            borderRadius: 8,
            padding: '8px 14px',
            cursor: 'pointer',
            transition: 'opacity 0.2s',
            flex: 1,
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          Subscribe
        </button>
      </div>
    </div>
  )
}

export default function StrategiesPage() {
  const [activeFilter, setActiveFilter] = useState<FilterOption>('All')
  const [_searchValue, setSearchValue] = useState('')

  const filtered = STRATEGIES.filter((s) => {
    if (activeFilter === 'All') return true
    const tierLetter = activeFilter.replace('-tier', '') as Tier
    return s.tier === tierLetter
  })

  return (
    <div style={{ background: '#000', minHeight: '100vh', fontFamily: "'Barlow', sans-serif" }}>
      <Navbar />

      <div style={{ paddingTop: 100, paddingBottom: 80, maxWidth: 1100, margin: '0 auto', padding: '100px 24px 80px' }}>

        {/* Page header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(2rem, 4vw, 2.75rem)',
            color: '#fff',
            margin: 0,
            lineHeight: 1.1,
          }}>Strategy Marketplace</h1>
          <p style={{
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 400,
            fontSize: 16,
            color: 'rgba(255,255,255,0.5)',
            margin: '8px 0 0',
          }}>Browse verified trading strategies</p>
        </div>

        {/* Filter + search row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
          {/* Filter chips */}
          <div style={{ display: 'flex', gap: 8 }}>
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setActiveFilter(opt)}
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 600,
                  fontSize: 13,
                  padding: '7px 16px',
                  borderRadius: 9999,
                  border: activeFilter === opt ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.12)',
                  background: activeFilter === opt ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)',
                  color: activeFilter === opt ? '#3b82f6' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 9999,
            padding: '7px 16px',
            minWidth: 220,
          }}>
            <Search size={14} color="rgba(255,255,255,0.3)" />
            <input
              type="text"
              placeholder="Search strategies..."
              onChange={(e) => setSearchValue(e.target.value)}
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontSize: 13,
                color: '#fff',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                width: '100%',
              }}
            />
          </div>
        </div>

        {/* Strategy grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 20,
        }}>
          {filtered.map((s) => (
            <StrategyCard key={s.id} strategy={s} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.3)', fontFamily: "'Barlow', sans-serif", fontSize: 15 }}>
            No strategies match the selected filter.
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
