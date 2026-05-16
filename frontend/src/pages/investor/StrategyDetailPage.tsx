import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, TrendingDown, CheckCircle } from 'lucide-react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

type Tier = 'S' | 'A' | 'B' | 'C'
type RiskMode = 'conservative' | 'medium' | 'aggressive'

interface StrategyDetail {
  id: string
  name: string
  tier: Tier
  trader: string
  traderInitial: string
  traderJoined: string
  traderTrades: number
  winRate: number
  avgWinner: number
  avgLoser: number
  maxDrawdown: number
  rrr: number
  coins: string[]
  trades: TradeRow[]
}

interface TradeRow {
  date: string
  coin: string
  dir: 'LONG' | 'SHORT'
  entry: string
  exit: string
  pnlPct: number
}

const TIER_COLORS: Record<Tier, { bg: string; text: string; border: string }> = {
  S: { bg: 'rgba(139,92,246,0.15)', text: '#8b5cf6', border: 'rgba(139,92,246,0.3)' },
  A: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6', border: 'rgba(59,130,246,0.3)' },
  B: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e', border: 'rgba(34,197,94,0.3)' },
  C: { bg: 'rgba(249,115,22,0.15)', text: '#f97316', border: 'rgba(249,115,22,0.3)' },
}

const STRATEGY_DATA: Record<string, StrategyDetail> = {
  'sd-zone-scalper': {
    id: 'sd-zone-scalper',
    name: 'S/D Zone Scalper',
    tier: 'S',
    trader: 'Abrar Nasir',
    traderInitial: 'A',
    traderJoined: 'Mar 2026',
    traderTrades: 142,
    winRate: 89,
    avgWinner: 4.2,
    avgLoser: -2.8,
    maxDrawdown: -8.3,
    rrr: 1.5,
    coins: ['SOL', 'BTC', 'ETH', 'XRP'],
    trades: [
      { date: 'May 12', coin: 'SOL', dir: 'LONG', entry: '$148.20', exit: '$162.50', pnlPct: 9.65 },
      { date: 'May 10', coin: 'ETH', dir: 'SHORT', entry: '$3,120', exit: '$2,980', pnlPct: 4.49 },
      { date: 'May 08', coin: 'BTC', dir: 'LONG', entry: '$75,800', exit: '$77,200', pnlPct: 1.85 },
      { date: 'May 06', coin: 'TAO', dir: 'LONG', entry: '$320.00', exit: '$348.00', pnlPct: 8.75 },
      { date: 'May 04', coin: 'XRP', dir: 'SHORT', entry: '$1.390', exit: '$1.415', pnlPct: -1.80 },
      { date: 'May 02', coin: 'SUI', dir: 'LONG', entry: '$0.920', exit: '$0.975', pnlPct: 5.98 },
      { date: 'Apr 30', coin: 'DOGE', dir: 'LONG', entry: '$0.124', exit: '$0.136', pnlPct: 9.68 },
      { date: 'Apr 28', coin: 'AAVE', dir: 'LONG', entry: '$87.50', exit: '$95.80', pnlPct: 9.49 },
    ],
  },
  'btc-swing-trader': {
    id: 'btc-swing-trader',
    name: 'BTC Swing Trader',
    tier: 'A',
    trader: 'Sonum Kapoor',
    traderInitial: 'S',
    traderJoined: 'Feb 2026',
    traderTrades: 67,
    winRate: 78,
    avgWinner: 3.1,
    avgLoser: -2.2,
    maxDrawdown: -6.5,
    rrr: 1.4,
    coins: ['BTC', 'ETH'],
    trades: [
      { date: 'May 11', coin: 'BTC', dir: 'LONG', entry: '$76,200', exit: '$79,400', pnlPct: 4.20 },
      { date: 'May 09', coin: 'ETH', dir: 'LONG', entry: '$2,950', exit: '$3,080', pnlPct: 4.41 },
      { date: 'May 07', coin: 'BTC', dir: 'SHORT', entry: '$80,500', exit: '$78,200', pnlPct: 2.86 },
      { date: 'May 05', coin: 'ETH', dir: 'SHORT', entry: '$3,200', exit: '$3,280', pnlPct: -2.50 },
      { date: 'May 03', coin: 'BTC', dir: 'LONG', entry: '$74,000', exit: '$77,500', pnlPct: 4.73 },
      { date: 'Apr 29', coin: 'ETH', dir: 'LONG', entry: '$2,800', exit: '$2,920', pnlPct: 4.29 },
      { date: 'Apr 27', coin: 'BTC', dir: 'LONG', entry: '$71,200', exit: '$72,100', pnlPct: 1.26 },
      { date: 'Apr 25', coin: 'ETH', dir: 'SHORT', entry: '$3,100', exit: '$2,990', pnlPct: 3.55 },
    ],
  },
  'altcoin-momentum': {
    id: 'altcoin-momentum',
    name: 'Altcoin Momentum',
    tier: 'B',
    trader: 'Wei Zhang',
    traderInitial: 'W',
    traderJoined: 'Mar 2026',
    traderTrades: 53,
    winRate: 71,
    avgWinner: 2.8,
    avgLoser: -2.1,
    maxDrawdown: -7.2,
    rrr: 1.33,
    coins: ['SOL', 'DOGE', 'WIF', 'BRETT'],
    trades: [
      { date: 'May 13', coin: 'WIF', dir: 'LONG', entry: '$1.820', exit: '$1.970', pnlPct: 8.24 },
      { date: 'May 11', coin: 'DOGE', dir: 'LONG', entry: '$0.118', exit: '$0.126', pnlPct: 6.78 },
      { date: 'May 09', coin: 'SOL', dir: 'SHORT', entry: '$152.00', exit: '$155.50', pnlPct: -2.30 },
      { date: 'May 07', coin: 'BRETT', dir: 'LONG', entry: '$0.0840', exit: '$0.0910', pnlPct: 8.33 },
      { date: 'May 05', coin: 'DOGE', dir: 'LONG', entry: '$0.112', exit: '$0.119', pnlPct: 6.25 },
      { date: 'May 03', coin: 'WIF', dir: 'SHORT', entry: '$2.100', exit: '$2.050', pnlPct: 2.38 },
      { date: 'May 01', coin: 'SOL', dir: 'LONG', entry: '$145.00', exit: '$141.80', pnlPct: -2.21 },
      { date: 'Apr 29', coin: 'BRETT', dir: 'LONG', entry: '$0.0790', exit: '$0.0850', pnlPct: 7.59 },
    ],
  },
  'sol-zone-hunter': {
    id: 'sol-zone-hunter',
    name: 'SOL Zone Hunter',
    tier: 'A',
    trader: 'Maria Reyes',
    traderInitial: 'M',
    traderJoined: 'Mar 2026',
    traderTrades: 88,
    winRate: 76,
    avgWinner: 3.4,
    avgLoser: -2.4,
    maxDrawdown: -6.8,
    rrr: 1.42,
    coins: ['SOL', 'SUI', 'TAO'],
    trades: [
      { date: 'May 14', coin: 'SOL', dir: 'LONG', entry: '$151.00', exit: '$163.40', pnlPct: 8.21 },
      { date: 'May 12', coin: 'SUI', dir: 'SHORT', entry: '$1.040', exit: '$0.998', pnlPct: 4.04 },
      { date: 'May 10', coin: 'TAO', dir: 'LONG', entry: '$315.00', exit: '$336.00', pnlPct: 6.67 },
      { date: 'May 08', coin: 'SOL', dir: 'SHORT', entry: '$162.00', exit: '$165.80', pnlPct: -2.35 },
      { date: 'May 06', coin: 'SUI', dir: 'LONG', entry: '$0.970', exit: '$1.010', pnlPct: 4.12 },
      { date: 'May 04', coin: 'TAO', dir: 'LONG', entry: '$302.00', exit: '$318.00', pnlPct: 5.30 },
      { date: 'May 02', coin: 'SOL', dir: 'LONG', entry: '$142.00', exit: '$150.80', pnlPct: 6.20 },
      { date: 'Apr 30', coin: 'SUI', dir: 'SHORT', entry: '$1.080', exit: '$1.110', pnlPct: -2.78 },
    ],
  },
}

const DEFAULT_STRATEGY = STRATEGY_DATA['sd-zone-scalper']

const RISK_MODES: {
  key: RiskMode
  label: string
  leverage: string
  margin: string
  buffer: string
  accent: string
  border: string
}[] = [
  {
    key: 'conservative',
    label: 'Conservative',
    leverage: '50–100x',
    margin: '0.25–0.5%',
    buffer: '20+ trades before liquidation',
    accent: '#22c55e',
    border: 'rgba(34,197,94,0.4)',
  },
  {
    key: 'medium',
    label: 'Medium',
    leverage: '50–200x',
    margin: '0.5–1%',
    buffer: '8–10 buffer',
    accent: '#3b82f6',
    border: 'rgba(59,130,246,0.4)',
  },
  {
    key: 'aggressive',
    label: 'Aggressive',
    leverage: '50–300x',
    margin: '1–2%',
    buffer: '4–5 buffer',
    accent: '#f97316',
    border: 'rgba(249,115,22,0.4)',
  },
]

export default function StrategyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [selectedRisk, setSelectedRisk] = useState<RiskMode>('medium')

  const strategy = (id && STRATEGY_DATA[id]) ? STRATEGY_DATA[id] : DEFAULT_STRATEGY
  const tierC = TIER_COLORS[strategy.tier]

  return (
    <div style={{ background: '#000', minHeight: '100vh', fontFamily: "'Barlow', sans-serif" }}>
      <Navbar />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 24px 80px' }}>

        {/* Back button */}
        <button
          onClick={() => navigate('/strategies')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 500,
            fontSize: 14,
            color: 'rgba(255,255,255,0.45)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            marginBottom: 28,
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
        >
          <ArrowLeft size={15} /> Back to Strategies
        </button>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32, flexWrap: 'wrap' }}>
          <h1 style={{
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
            color: '#fff',
            margin: 0,
            lineHeight: 1.1,
          }}>{strategy.name}</h1>
          <span style={{
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 700,
            fontSize: 12,
            color: tierC.text,
            background: tierC.bg,
            border: `1px solid ${tierC.border}`,
            borderRadius: 9999,
            padding: '4px 12px',
            letterSpacing: '0.05em',
          }}>{strategy.tier}-tier</span>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 600,
            fontSize: 12,
            color: '#22c55e',
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: 9999,
            padding: '4px 12px',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
            Live
          </span>
        </div>

        {/* Stats row — 5 cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12,
          marginBottom: 32,
        }}>
          {[
            { label: 'Win Rate', value: `${strategy.winRate}%`, color: '#22c55e' },
            { label: 'Avg Winner', value: `+${strategy.avgWinner}%`, color: '#22c55e' },
            { label: 'Avg Loser', value: `${strategy.avgLoser}%`, color: '#ef4444' },
            { label: 'Max Drawdown', value: `${strategy.maxDrawdown}%`, color: '#ef4444' },
            { label: 'RRR', value: `${strategy.rrr}:1`, color: '#3b82f6' },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10,
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}>
              <span style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 400,
                fontSize: 11,
                color: 'rgba(255,255,255,0.4)',
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
              }}>{stat.label}</span>
              <span style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 700,
                fontSize: 22,
                color: stat.color,
                lineHeight: 1,
              }}>{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>

          {/* Left: Trade history */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12,
            overflow: 'hidden',
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <span style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                color: '#fff',
              }}>Trade History</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Date', 'Coin', 'Dir', 'Entry', 'Exit', 'P&L %'].map((h) => (
                      <th key={h} style={{
                        fontFamily: "'Barlow', sans-serif",
                        fontWeight: 600,
                        fontSize: 11,
                        color: 'rgba(255,255,255,0.3)',
                        textAlign: 'left',
                        padding: '10px 20px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {strategy.trades.map((t, i) => (
                    <tr
                      key={i}
                      style={{ borderBottom: i < strategy.trades.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.4)', padding: '12px 20px', whiteSpace: 'nowrap' }}>{t.date}</td>
                      <td style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: 13, color: '#fff', padding: '12px 20px' }}>{t.coin}</td>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{
                          fontFamily: "'Barlow', sans-serif",
                          fontWeight: 700,
                          fontSize: 11,
                          color: t.dir === 'LONG' ? '#22c55e' : '#ef4444',
                          background: t.dir === 'LONG' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                          border: `1px solid ${t.dir === 'LONG' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
                          borderRadius: 6,
                          padding: '2px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                          width: 'fit-content',
                        }}>
                          {t.dir === 'LONG' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                          {t.dir}
                        </span>
                      </td>
                      <td style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.6)', padding: '12px 20px', whiteSpace: 'nowrap' }}>{t.entry}</td>
                      <td style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.6)', padding: '12px 20px', whiteSpace: 'nowrap' }}>{t.exit}</td>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{
                          fontFamily: "'Barlow', sans-serif",
                          fontWeight: 700,
                          fontSize: 13,
                          color: t.pnlPct >= 0 ? '#22c55e' : '#ef4444',
                        }}>
                          {t.pnlPct >= 0 ? '+' : ''}{t.pnlPct.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Risk mode cards */}
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              overflow: 'hidden',
            }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: 13, color: '#fff' }}>Select Risk Mode</span>
              </div>
              <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {RISK_MODES.map((mode) => (
                  <button
                    key={mode.key}
                    onClick={() => setSelectedRisk(mode.key)}
                    style={{
                      fontFamily: "'Barlow', sans-serif",
                      background: selectedRisk === mode.key ? `${mode.accent}0A` : 'rgba(255,255,255,0.02)',
                      border: selectedRisk === mode.key ? `1.5px solid ${mode.border}` : '1.5px solid rgba(255,255,255,0.07)',
                      borderRadius: 10,
                      padding: '12px 14px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                    }}
                  >
                    <div style={{ marginTop: 2, flexShrink: 0 }}>
                      {selectedRisk === mode.key ? (
                        <CheckCircle size={15} color={mode.accent} />
                      ) : (
                        <div style={{ width: 15, height: 15, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.2)' }} />
                      )}
                    </div>
                    <div>
                      <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: 13, color: selectedRisk === mode.key ? mode.accent : '#fff', margin: 0 }}>{mode.label}</p>
                      <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '3px 0 0' }}>
                        {mode.leverage} leverage · {mode.margin} margin
                      </p>
                      <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '2px 0 0' }}>{mode.buffer}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Trader profile */}
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 800, fontSize: 18, color: '#fff' }}>{strategy.traderInitial}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: 14, color: '#fff', margin: 0 }}>{strategy.trader}</p>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: 12, color: '#22c55e', margin: '2px 0 0' }}>Verified Trader</p>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '2px 0 0' }}>
                  {strategy.traderTrades} trades · Joined {strategy.traderJoined}
                </p>
              </div>
            </div>

            {/* CTA card */}
            <div style={{
              background: 'rgba(59,130,246,0.07)',
              border: '1px solid rgba(59,130,246,0.2)',
              borderRadius: 12,
              padding: '20px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: 15, color: '#fff', margin: 0 }}>
                Subscribe to This Strategy
              </p>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.5 }}>
                You keep 80% of profits. We earn 20% only when you profit.
              </p>
              <button style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                color: '#fff',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                border: 'none',
                borderRadius: 9,
                padding: '13px 20px',
                cursor: 'pointer',
                width: '100%',
                transition: 'opacity 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Subscribe Now
              </button>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: 0, textAlign: 'center' }}>
                No fees if you're in drawdown or at a loss
              </p>
            </div>

          </div>
        </div>

      </div>

      <Footer />
    </div>
  )
}
