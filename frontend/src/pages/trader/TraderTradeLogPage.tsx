import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, ChevronDown, ChevronUp } from 'lucide-react'
import FadingVideo from '../../components/FadingVideo'
import TraderSidebar from '../../components/trader/TraderSidebar'
import type { TraderPage } from '../../components/trader/TraderSidebar'

const VIDEO_SRC = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4'
const MOCK_USER = { name: 'Sonum Sharma', email: 'sonum@tradelikeme.xyz' }

type TradeStatus = 'Won' | 'Lost' | 'Open'
type Direction = 'LONG' | 'SHORT'
type Filter = 'All' | TradeStatus

interface TradeRow {
  id: number
  date: string
  coin: string
  dir: Direction
  entry: string
  exit: string
  pnlUsd: string
  pnlPct: string
  status: TradeStatus
  duration: string
  reason: string
  zoneTf: string
  tp1: string
  tp2: string
  sl: string
  notes: string
}

const TRADES: TradeRow[] = [
  { id: 1,  date: 'May 10, 2026', coin: 'SOLUSDT',   dir: 'LONG',  entry: '$187.40', exit: '$193.20', pnlUsd: '+$580',  pnlPct: '+3.1%', status: 'Won',  duration: '8h 22m',  reason: '4H demand zone retest after absorption base. Volume confirmed at zone bottom.', zoneTf: '4H', tp1: '$191.00', tp2: '$195.50', sl: '$183.00', notes: 'TP1 hit in 3h. Moved SL to entry. TP2 hit next session.' },
  { id: 2,  date: 'May 9, 2026',  coin: 'BTCUSDT',   dir: 'LONG',  entry: '$95,200', exit: '$98,750', pnlUsd: '+$3,550', pnlPct: '+3.7%', status: 'Won',  duration: '1d 4h',  reason: '1D demand zone + FVG confluence. BTC weekly bullish structure.', zoneTf: '1D', tp1: '$97,500', tp2: '$99,800', sl: '$92,100', notes: 'Perfect zone retest. Body-close SL triggered once (wick only, held).' },
  { id: 3,  date: 'May 8, 2026',  coin: 'ETHUSDT',   dir: 'SHORT', entry: '$3,820',  exit: '$3,710',  pnlUsd: '+$220',  pnlPct: '+2.9%', status: 'Won',  duration: '6h 15m', reason: '4H supply zone. BTC rejected at daily resistance simultaneously.', zoneTf: '4H', tp1: '$3,750', tp2: '$3,680', sl: '$3,910', notes: 'Clean short. Both TPs hit same day.' },
  { id: 4,  date: 'May 7, 2026',  coin: 'SUIUSDT',   dir: 'LONG',  entry: '$1.184',  exit: '$1.148',  pnlUsd: '-$72',   pnlPct: '-3.0%', status: 'Lost', duration: '2h 40m', reason: '30M demand zone inside 4H zone. Pattern: V-bottom.', zoneTf: '4H', tp1: '$1.210', tp2: '$1.240', sl: '$1.145', notes: 'BTC dropped unexpectedly. Body closed below SL. Closed per rules.' },
  { id: 5,  date: 'May 6, 2026',  coin: 'TAOUSDT',   dir: 'LONG',  entry: '$448.00', exit: '$467.50', pnlUsd: '+$195',  pnlPct: '+4.3%', status: 'Won',  duration: '12h 5m', reason: '4H demand zone. Equal lows sweep (liquidity). Absorption visible on 15M.', zoneTf: '4H', tp1: '$460.00', tp2: '$472.00', sl: '$435.00', notes: 'Equal lows sweep exactly at zone. Textbook setup.' },
  { id: 6,  date: 'May 5, 2026',  coin: 'XRPUSDT',   dir: 'SHORT', entry: '$2.146',  exit: '$2.089',  pnlUsd: '+$114',  pnlPct: '+2.7%', status: 'Won',  duration: '5h 30m', reason: '4H supply zone. BTC at daily resistance. XRP weekly bearish structure.', zoneTf: '4H', tp1: '$2.110', tp2: '$2.065', sl: '$2.200', notes: 'Both TPs hit. Clean momentum down.' },
  { id: 7,  date: 'May 4, 2026',  coin: 'WIFUSDT',   dir: 'LONG',  entry: '$2.310',  exit: '$2.398',  pnlUsd: '+$176',  pnlPct: '+3.8%', status: 'Won',  duration: '9h 12m', reason: '1H demand zone + 4H zone within 3%. Cup pattern on 4H.', zoneTf: '1H', tp1: '$2.370', tp2: '$2.420', sl: '$2.240', notes: 'TP1 hit fast. TP2 wicked but body confirmed.' },
  { id: 8,  date: 'May 3, 2026',  coin: 'DOTUSDT',   dir: 'LONG',  entry: '$8.72',   exit: '$9.14',   pnlUsd: '+$84',   pnlPct: '+4.8%', status: 'Won',  duration: '1d 2h',  reason: '4H demand zone. W-bottom pattern. Strong volume at zone.', zoneTf: '4H', tp1: '$9.00', tp2: '$9.30', sl: '$8.40', notes: 'Held through minor pullback. Clean W-bottom played out.' },
  { id: 9,  date: 'May 2, 2026',  coin: 'LINKUSDT',  dir: 'SHORT', entry: '$18.42',  exit: '$17.80',  pnlUsd: '+$124',  pnlPct: '+3.4%', status: 'Won',  duration: '7h 55m', reason: '4H supply zone. BTC 1D bearish. LINK equal highs swept.', zoneTf: '4H', tp1: '$18.00', tp2: '$17.60', sl: '$19.00', notes: 'Equal highs swept right at supply. Perfect reversal.' },
  { id: 10, date: 'May 1, 2026',  coin: 'AAVEUSDT',  dir: 'LONG',  entry: '$89.50',  exit: '$91.20',  pnlUsd: '+$170',  pnlPct: '+1.9%', status: 'Won',  duration: '4h 44m', reason: '4H demand. FVG + zone confluence. Flat base pattern.', zoneTf: '4H', tp1: '$91.00', tp2: '$93.50', sl: '$85.50', notes: 'Wick past SL ($85.05) ignored — body closed $86.34. Held. TP1 hit.' },
  { id: 11, date: 'Apr 30, 2026', coin: 'ENALUSDT',  dir: 'LONG',  entry: '$1.048',  exit: '$1.122',  pnlUsd: '+$148',  pnlPct: '+7.1%', status: 'Won',  duration: '18h 20m', reason: '4H demand. Post-news accumulation zone. BTC green 1D.', zoneTf: '4H', tp1: '$1.090', tp2: '$1.130', sl: '$1.005', notes: 'News catalyst pushed it faster. Zone still valid.' },
  { id: 12, date: 'Apr 29, 2026', coin: 'UNIUSDT',   dir: 'LONG',  entry: '$11.24',  exit: '$10.92',  pnlUsd: '-$64',   pnlPct: '-2.8%', status: 'Lost', duration: '3h 10m', reason: '4H demand zone. Volume present. BTC neutral 1D.', zoneTf: '4H', tp1: '$11.70', tp2: '$12.10', sl: '$10.90', notes: 'BTC reversed unexpectedly. Body closed below SL. Exited cleanly.' },
  { id: 13, date: 'Apr 28, 2026', coin: 'ADAUSDT',   dir: 'LONG',  entry: '$0.872',  exit: '$0.914',  pnlUsd: '+$84',   pnlPct: '+4.8%', status: 'Won',  duration: '10h 30m', reason: '1D demand zone. BTC 1D bullish. ADA weekly structure intact.', zoneTf: '1D', tp1: '$0.900', tp2: '$0.930', sl: '$0.840', notes: 'Daily zone. Held overnight. Both TPs hit.' },
  { id: 14, date: 'Apr 27, 2026', coin: 'LTCUSDT',   dir: 'SHORT', entry: '$94.50',  exit: '$91.30',  pnlUsd: '+$64',   pnlPct: '+3.4%', status: 'Won',  duration: '6h 40m', reason: '4H supply. BTC 1D rejected at resistance. LTC equal highs swept.', zoneTf: '4H', tp1: '$92.50', tp2: '$90.00', sl: '$97.50', notes: 'Clean entry. TP1 fast. TP2 slightly overshot, wick only.' },
  { id: 15, date: 'Apr 26, 2026', coin: 'DOGEUSDT',  dir: 'LONG',  entry: '$0.1820', exit: '$0.1905', pnlUsd: '+$85',   pnlPct: '+4.7%', status: 'Won',  duration: '8h 15m', reason: '4H demand. Absorption base on 15M. BTC 1D green.', zoneTf: '4H', tp1: '$0.1880', tp2: '$0.1940', sl: '$0.1760', notes: 'Both TPs hit same session.' },
  { id: 16, date: 'Apr 25, 2026', coin: 'SOLUSDT',   dir: 'SHORT', entry: '$178.50', exit: '$171.20', pnlUsd: '+$365',  pnlPct: '+4.1%', status: 'Won',  duration: '11h 5m', reason: '4H supply zone. BTC 1D rejection. SOL weekly lower high.', zoneTf: '4H', tp1: '$173.00', tp2: '$169.00', sl: '$184.00', notes: 'Strong momentum. TP2 hit in single move.' },
  { id: 17, date: 'Apr 24, 2026', coin: 'BRETTUSDT', dir: 'LONG',  entry: '$0.1124', exit: '$-',      pnlUsd: '+$80',   pnlPct: '+2.1%', status: 'Open', duration: '—',      reason: '4H demand zone. Absorption visible. BTC 1D neutral-bullish.', zoneTf: '4H', tp1: '$0.1180', tp2: '$0.1240', sl: '$0.1065', notes: 'Currently holding. TP1 nearly reached.' },
  { id: 18, date: 'Apr 23, 2026', coin: 'BTCUSDT',   dir: 'SHORT', entry: '$88,400', exit: '$85,200', pnlUsd: '+$3,200', pnlPct: '+3.6%', status: 'Won', duration: '16h 40m', reason: '1D supply zone. BTC 1W lower high. FVG present above entry.', zoneTf: '1D', tp1: '$86,000', tp2: '$84,000', sl: '$91,500', notes: 'Textbook daily supply play. Clean.' },
  { id: 19, date: 'Apr 22, 2026', coin: 'ETHUSDT',   dir: 'LONG',  entry: '$3,450',  exit: '$3,510',  pnlUsd: '+$120',  pnlPct: '+1.7%', status: 'Won',  duration: '5h 20m', reason: '4H demand. FVG + zone overlap. BTC 1D bullish.', zoneTf: '4H', tp1: '$3,500', tp2: '$3,560', sl: '$3,380', notes: 'FVG entry. Conservative TP2. TP1 hit, moved SL to entry. TP2 near miss.' },
  { id: 20, date: 'Apr 21, 2026', coin: 'XRPUSDT',   dir: 'LONG',  entry: '$1.382',  exit: '$1.330',  pnlUsd: '-$52',   pnlPct: '-3.8%', status: 'Lost', duration: '1h 55m', reason: '30M demand inside 4H zone. Fast reversal expected.', zoneTf: '30M', tp1: '$1.420', tp2: '$1.460', sl: '$1.330', notes: 'Body close below SL confirmed. Exited. BTC macro was against.' },
]

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 16,
  padding: '1.25rem 1.5rem',
}

const dirBadge = (dir: Direction): React.CSSProperties => ({
  display: 'inline-block',
  fontSize: '10.5px',
  fontWeight: 700,
  letterSpacing: '0.06em',
  padding: '3px 9px',
  borderRadius: 6,
  color: dir === 'LONG' ? '#22c55e' : '#ef4444',
  background: dir === 'LONG' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
  border: `1px solid ${dir === 'LONG' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
})

const statusBadge = (status: TradeStatus): React.CSSProperties => ({
  display: 'inline-block',
  fontSize: '10.5px',
  fontWeight: 700,
  letterSpacing: '0.06em',
  padding: '3px 9px',
  borderRadius: 6,
  color: status === 'Won' ? '#22c55e' : status === 'Lost' ? '#ef4444' : '#f97316',
  background: status === 'Won' ? 'rgba(34,197,94,0.1)' : status === 'Lost' ? 'rgba(239,68,68,0.1)' : 'rgba(249,115,22,0.1)',
  border: `1px solid ${status === 'Won' ? 'rgba(34,197,94,0.2)' : status === 'Lost' ? 'rgba(239,68,68,0.2)' : 'rgba(249,115,22,0.2)'}`,
})

export default function TraderTradeLogPage() {
  const navigate = useNavigate()
  const [activePage, setActivePage] = useState<TraderPage>('trades')
  const [filter, setFilter] = useState<Filter>('All')
  const [expandedId, setExpandedId] = useState<number | null>(null)

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

  const filtered = filter === 'All' ? TRADES : TRADES.filter(t => t.status === filter)

  const totalPnlNum = TRADES.reduce((acc, t) => {
    if (t.status === 'Open') return acc
    const n = parseFloat(t.pnlUsd.replace(/[^0-9.-]/g, ''))
    return acc + (t.pnlUsd.startsWith('+') ? n : -n)
  }, 0)

  const wonCount = TRADES.filter(t => t.status === 'Won').length
  const lostCount = TRADES.filter(t => t.status === 'Lost').length
  const totalClosed = wonCount + lostCount
  const winRate = totalClosed > 0 ? ((wonCount / totalClosed) * 100).toFixed(1) : '0'

  const FILTERS: Filter[] = ['All', 'Won', 'Lost', 'Open']

  return (
    <div style={{ minHeight: '100vh', background: '#000', fontFamily: "'Barlow', sans-serif" }}>
      <FadingVideo
        src={VIDEO_SRC}
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', zIndex: 0 }}
      />
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', zIndex: 1 }} />

      <TraderSidebar activePage={activePage} onNavigate={handleNav} user={MOCK_USER} />

      <div style={{ position: 'relative', zIndex: 2, marginLeft: 220, minHeight: '100vh' }}>
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
            Trade Log
          </h1>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
            All verified trades — click any row to expand details
          </p>
        </div>

        <div style={{ padding: '2rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Filter row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '0.45rem 1rem',
                    borderRadius: 8,
                    border: filter === f ? '1px solid rgba(249,115,22,0.5)' : '1px solid rgba(255,255,255,0.1)',
                    background: filter === f ? 'rgba(249,115,22,0.12)' : 'rgba(255,255,255,0.04)',
                    color: filter === f ? '#f97316' : 'rgba(255,255,255,0.5)',
                    fontFamily: "'Barlow', sans-serif",
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.3)' }}>Apr 1 – May 16, 2026</span>
              <button
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '0.45rem 1rem',
                  borderRadius: 8,
                  border: '1px solid rgba(249,115,22,0.4)',
                  background: 'rgba(249,115,22,0.1)',
                  color: '#f97316',
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                <Download size={13} />
                Export CSV
              </button>
            </div>
          </div>

          {/* Table */}
          <div style={card}>
            {/* Table header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '110px 90px 80px 70px 90px 90px 72px 62px 80px 80px',
              gap: '0.5rem',
              padding: '0 0 0.75rem',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}>
              {['Date', 'Coin', 'Dir', 'Zone TF', 'Entry', 'Exit', 'P&L ($)', 'P&L (%)', 'Status', 'Duration'].map(h => (
                <span key={h} style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase' as const,
                  color: 'rgba(255,255,255,0.3)',
                }}>{h}</span>
              ))}
            </div>

            {/* Rows */}
            {filtered.map((t, i) => {
              const isExpanded = expandedId === t.id
              const pnlPositive = t.pnlUsd.startsWith('+')
              return (
                <div key={t.id}>
                  {/* Main row */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : t.id)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '110px 90px 80px 70px 90px 90px 72px 62px 80px 80px',
                      gap: '0.5rem',
                      padding: '0.7rem 0',
                      borderBottom: isExpanded ? 'none' : (i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'),
                      cursor: 'pointer',
                      transition: 'background 0.12s',
                      borderRadius: 8,
                      alignItems: 'center',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.025)'}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
                  >
                    <span style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.5)' }}>{t.date}</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{t.coin.replace('USDT', '')}</span>
                    <span style={dirBadge(t.dir)}>{t.dir}</span>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{t.zoneTf}</span>
                    <span style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.7)' }}>{t.entry}</span>
                    <span style={{ fontSize: '12.5px', color: t.status === 'Open' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.7)' }}>{t.exit}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: pnlPositive ? '#22c55e' : '#ef4444' }}>{t.pnlUsd}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: pnlPositive ? '#22c55e' : '#ef4444' }}>{t.pnlPct}</span>
                    <span style={statusBadge(t.status)}>{t.status}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{t.duration}</span>
                      {isExpanded ? <ChevronUp size={12} color="rgba(255,255,255,0.3)" /> : <ChevronDown size={12} color="rgba(255,255,255,0.3)" />}
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 10,
                      padding: '1rem 1.25rem',
                      marginBottom: i < filtered.length - 1 ? 0 : undefined,
                      borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                      marginTop: 0,
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 2rem' }}>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.3)', marginBottom: '0.3rem' }}>Entry Reason</div>
                          <div style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{t.reason}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.3)', marginBottom: '0.3rem' }}>Trade Notes</div>
                          <div style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{t.notes}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '2rem' }}>
                          {[{ k: 'TP1', v: t.tp1, c: '#22c55e' }, { k: 'TP2', v: t.tp2, c: '#22c55e' }, { k: 'SL', v: t.sl, c: '#ef4444' }].map(lv => (
                            <div key={lv.k}>
                              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.3)', marginBottom: '0.2rem' }}>{lv.k}</div>
                              <div style={{ fontSize: '13px', fontWeight: 600, color: lv.c }}>{lv.v}</div>
                            </div>
                          ))}
                        </div>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.3)', marginBottom: '0.2rem' }}>Zone Timeframe</div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#f97316' }}>{t.zoneTf} Supply/Demand Zone</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.35)' }}>
              Showing 1–{filtered.length} of 47 trades
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[1, 2, 3].map(pg => (
                <button
                  key={pg}
                  style={{
                    width: 32, height: 32,
                    borderRadius: 8,
                    border: pg === 1 ? '1px solid rgba(249,115,22,0.5)' : '1px solid rgba(255,255,255,0.1)',
                    background: pg === 1 ? 'rgba(249,115,22,0.12)' : 'rgba(255,255,255,0.04)',
                    color: pg === 1 ? '#f97316' : 'rgba(255,255,255,0.4)',
                    fontFamily: "'Barlow', sans-serif",
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  {pg}
                </button>
              ))}
            </div>
          </div>

          {/* Summary row */}
          <div style={{
            ...card,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.5rem',
            padding: '1rem 1.5rem',
          }}>
            {[
              { label: 'Total Trades', value: '47', color: '#fff' },
              { label: 'Win Rate',     value: `${winRate}%`,   color: '#22c55e' },
              { label: 'Won / Lost',   value: `${wonCount} / ${lostCount}`, color: '#fff' },
              { label: 'Total P&L',    value: `${totalPnlNum >= 0 ? '+' : ''}$${Math.abs(totalPnlNum).toLocaleString()}`, color: totalPnlNum >= 0 ? '#22c55e' : '#ef4444' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.3)' }}>
                  {s.label}
                </span>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '1.35rem', fontWeight: 700, color: s.color, lineHeight: 1 }}>
                  {s.value}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
