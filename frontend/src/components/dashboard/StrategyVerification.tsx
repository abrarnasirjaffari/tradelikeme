import { motion } from 'framer-motion'

// ─── Constants ────────────────────────────────────────────────────────────────

const BARLOW: React.CSSProperties = { fontFamily: "'Barlow', sans-serif" }

const LABEL: React.CSSProperties = {
  ...BARLOW,
  fontWeight: 300,
  fontSize: '11px',
  color: 'rgba(255,255,255,0.35)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const DIVIDER: React.CSSProperties = {
  height: '1px',
  background: 'rgba(255,255,255,0.06)',
  flexShrink: 0,
}

const SECTION_HEADER: React.CSSProperties = {
  ...BARLOW,
  fontWeight: 600,
  fontSize: '15px',
  color: '#fff',
  margin: 0,
}

const CARD: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '1.25rem',
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.9rem',
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const IS_STATS = {
  label: 'In-Sample (2024)',
  win_rate: 81,
  avg_winner: 4.2,
  avg_loser: 2.8,
  rrr: 1.52,
  drawdown: 8.3,
  trades: 142,
  sharpe: 1.82,
}

const OOS_STATS = {
  label: 'Out-of-Sample (2025)',
  win_rate: 78,
  avg_winner: 3.9,
  avg_loser: 2.9,
  rrr: 1.45,
  drawdown: 9.1,
  trades: 138,
  sharpe: 1.71,
}

type ShadowTrade = {
  id: number
  symbol: string
  side: 'LONG' | 'SHORT'
  entry: string
  signalTime: string
  outcome: 'TP1_HIT' | 'TP2_HIT' | 'SL_HIT' | 'OPEN'
  pnlPct: number
}

const SHADOW_TRADES: ShadowTrade[] = [
  { id: 1,  symbol: 'SOLUSDT',  side: 'LONG',  entry: '145.20',    signalTime: 'May 1 02:14',  outcome: 'TP1_HIT', pnlPct:  4.95 },
  { id: 2,  symbol: 'BTCUSDT',  side: 'SHORT', entry: '96,450',    signalTime: 'May 1 09:31',  outcome: 'TP1_HIT', pnlPct:  3.82 },
  { id: 3,  symbol: 'XRPUSDT',  side: 'LONG',  entry: '2.048',     signalTime: 'May 1 16:42',  outcome: 'SL_HIT',  pnlPct: -2.61 },
  { id: 4,  symbol: 'SOLUSDT',  side: 'SHORT', entry: '151.80',    signalTime: 'May 2 03:17',  outcome: 'TP1_HIT', pnlPct:  4.12 },
  { id: 5,  symbol: 'BTCUSDT',  side: 'LONG',  entry: '91,200',    signalTime: 'May 2 11:55',  outcome: 'TP2_HIT', pnlPct:  7.43 },
  { id: 6,  symbol: 'XRPUSDT',  side: 'SHORT', entry: '2.193',     signalTime: 'May 3 04:08',  outcome: 'TP1_HIT', pnlPct:  3.67 },
  { id: 7,  symbol: 'SOLUSDT',  side: 'LONG',  entry: '142.50',    signalTime: 'May 3 14:22',  outcome: 'TP1_HIT', pnlPct:  5.21 },
  { id: 8,  symbol: 'BTCUSDT',  side: 'SHORT', entry: '94,800',    signalTime: 'May 4 07:44',  outcome: 'SL_HIT',  pnlPct: -2.88 },
  { id: 9,  symbol: 'XRPUSDT',  side: 'LONG',  entry: '2.071',     signalTime: 'May 5 02:19',  outcome: 'TP1_HIT', pnlPct:  4.33 },
  { id: 10, symbol: 'SOLUSDT',  side: 'SHORT', entry: '148.20',    signalTime: 'May 6 09:51',  outcome: 'TP1_HIT', pnlPct:  3.94 },
]

type EdgeVariation = {
  rule: string
  variation: string
  winRateDelta: string
  rrrDelta: string
  accepted: boolean
  note?: string
}

const EDGE_VARIATIONS: EdgeVariation[] = [
  { rule: 'BTC Macro Gate',   variation: 'Strict (1D green + 50MA)',   winRateDelta: '+3%',  rrrDelta: '+0.08', accepted: true  },
  { rule: 'Zone Width',       variation: '±2% entry window',           winRateDelta: '+4%',  rrrDelta: '+0.12', accepted: true  },
  { rule: 'TP2 Selection',    variation: 'Zone 3 instead of zone 2',   winRateDelta: '−8%',  rrrDelta: '−0.21', accepted: false },
  { rule: 'Session Filter',   variation: 'London + NY only',           winRateDelta: '+2%',  rrrDelta: '+0.05', accepted: true, note: 'marginal' },
  { rule: 'FVG Confluence',   variation: 'Required at entry',          winRateDelta: '+5%',  rrrDelta: '+0.18', accepted: true  },
]

const GRADE_TABLE = [
  { grade: 'S', label: 'S-tier', threshold: '85%+',   color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  { grade: 'A', label: 'A-tier', threshold: '75–84%', color: '#22c55e', bg: 'rgba(34,197,94,0.15)'  },
  { grade: 'B', label: 'B-tier', threshold: '65–74%', color: '#60a5fa', bg: 'rgba(96,165,250,0.15)' },
  { grade: 'C', label: 'C-tier', threshold: '55–64%', color: 'rgba(255,255,255,0.5)', bg: 'rgba(255,255,255,0.08)' },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatRow({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem' }}>
      <span style={{ ...BARLOW, fontWeight: 300, fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{label}</span>
      <span style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
        <span style={{ ...BARLOW, fontWeight: 500, fontSize: '13px', color: '#fff' }}>{value}</span>
        {note && <span style={{ ...BARLOW, fontWeight: 300, fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{note}</span>}
      </span>
    </div>
  )
}

function BacktestCard({ data, isOOS }: { data: typeof IS_STATS | typeof OOS_STATS; isOOS?: boolean }) {
  return (
    <div style={CARD}>
      <div>
        <span style={LABEL}>{data.label}</span>
        <div style={{ marginTop: '0.6rem', display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
          <span style={{ ...BARLOW, fontWeight: 600, fontSize: '28px', color: isOOS ? '#60a5fa' : '#22c55e' }}>
            {data.win_rate}%
          </span>
          <span style={{ ...BARLOW, fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>win rate</span>
        </div>
      </div>

      <div style={DIVIDER} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
        <StatRow label="Avg winner"    value={`+${data.avg_winner}%`} />
        <StatRow label="Avg loser"     value={`−${data.avg_loser}%`}  />
        <StatRow label="RRR"           value={data.rrr.toFixed(2)}    />
        <StatRow label="Max drawdown"  value={`${data.drawdown}%`}    />
        <StatRow label="Trade count"   value={data.trades.toString()} />
        <StatRow label="Sharpe ratio"  value={data.sharpe.toFixed(2)} />
      </div>
    </div>
  )
}

function OutcomeBadge({ outcome }: { outcome: ShadowTrade['outcome'] }) {
  const map: Record<ShadowTrade['outcome'], { label: string; color: string; bg: string; bold?: boolean }> = {
    TP1_HIT: { label: 'TP1',  color: '#22c55e', bg: 'rgba(34,197,94,0.15)'  },
    TP2_HIT: { label: 'TP2',  color: '#4ade80', bg: 'rgba(74,222,128,0.15)', bold: true },
    SL_HIT:  { label: 'SL',   color: '#ef4444', bg: 'rgba(239,68,68,0.15)'  },
    OPEN:    { label: 'Open', color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.08)' },
  }
  const { label, color, bg, bold } = map[outcome]
  return (
    <span style={{
      ...BARLOW,
      fontWeight: bold ? 700 : 500,
      fontSize: '11px',
      color,
      background: bg,
      borderRadius: 9999,
      padding: '2px 8px',
      whiteSpace: 'nowrap' as const,
    }}>{label}</span>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StrategyVerification() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

      {/* ── Section 1: Backtest ─────────────────────────────────────────────── */}
      <motion.div
        className="liquid-glass"
        style={{ borderRadius: '1.75rem', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div>
            <span style={LABEL}>Stage 1 + 2</span>
            <h3 style={{ ...SECTION_HEADER, marginTop: '0.3rem' }}>In-Sample vs Out-of-Sample Backtest</h3>
          </div>
          <span style={{
            ...BARLOW,
            fontWeight: 600,
            fontSize: '12px',
            color: '#22c55e',
            background: 'rgba(34,197,94,0.15)',
            borderRadius: 9999,
            padding: '4px 14px',
            flexShrink: 0,
          }}>A-tier</span>
        </div>

        <div style={DIVIDER} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <BacktestCard data={IS_STATS} />
          <BacktestCard data={OOS_STATS} isOOS />
        </div>

        {/* OOS Delta row */}
        <div style={{
          background: 'rgba(34,197,94,0.06)',
          border: '1px solid rgba(34,197,94,0.15)',
          borderRadius: '0.9rem',
          padding: '0.9rem 1.1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}>
          <span style={{ ...BARLOW, fontWeight: 300, fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
            Win rate: <span style={{ color: '#22c55e', fontWeight: 500 }}>81%</span>
            {' '}→{' '}
            <span style={{ color: '#60a5fa', fontWeight: 500 }}>78%</span>
            {' '}
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>(−3%)</span>
          </span>
          <span style={{
            ...BARLOW,
            fontWeight: 600,
            fontSize: '11px',
            color: '#22c55e',
            background: 'rgba(34,197,94,0.2)',
            borderRadius: 9999,
            padding: '3px 12px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase' as const,
          }}>Consistent</span>
        </div>

        <p style={{ ...BARLOW, fontWeight: 300, fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.6 }}>
          Strategy holds on unseen data. Not overfit. A −3% slip from IS to OOS is within the acceptable 5% tolerance threshold.
        </p>
      </motion.div>

      {/* ── Section 2: Shadow Trade Log ─────────────────────────────────────── */}
      <motion.div
        className="liquid-glass"
        style={{ borderRadius: '1.75rem', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.08 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div>
            <span style={LABEL}>Stage 3</span>
            <h3 style={{ ...SECTION_HEADER, marginTop: '0.3rem' }}>Shadow Trade Log</h3>
          </div>
          {/* Live indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#22c55e',
              boxShadow: '0 0 6px #22c55e',
              animation: 'pulse-dot 1.6s ease-in-out infinite',
              flexShrink: 0,
            }} />
            <span style={{ ...BARLOW, fontWeight: 400, fontSize: '12px', color: 'rgba(255,255,255,0.55)' }}>
              LIVE — Shadow trade running since May 1, 2026
            </span>
          </div>
        </div>

        <style>{`
          @keyframes pulse-dot {
            0%, 100% { opacity: 1; box-shadow: 0 0 6px #22c55e; }
            50%       { opacity: 0.6; box-shadow: 0 0 12px #22c55e; }
          }
          @media (max-width: 639px) {
            .sv-hide-mobile { display: none !important; }
          }
        `}</style>

        <div style={DIVIDER} />

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
            <thead>
              <tr>
                {(['#', 'Symbol', 'Side', 'Entry', 'Signal Time', 'Outcome', 'P&L %'] as const).map((col) => (
                  <th
                    key={col}
                    className={col === 'Entry' || col === 'Signal Time' ? 'sv-hide-mobile' : ''}
                    style={{
                      ...BARLOW,
                      fontWeight: 500,
                      fontSize: '11px',
                      color: 'rgba(255,255,255,0.35)',
                      textAlign: col === 'P&L %' ? 'right' : 'left',
                      padding: '0 8px 10px',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                      whiteSpace: 'nowrap' as const,
                    }}
                  >{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SHADOW_TRADES.map((t, i) => {
                const isWin = t.outcome === 'TP1_HIT' || t.outcome === 'TP2_HIT'
                const rowBg = isWin ? 'rgba(34,197,94,0.04)' : t.outcome === 'SL_HIT' ? 'rgba(239,68,68,0.04)' : 'transparent'
                return (
                  <motion.tr
                    key={t.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.025, duration: 0.2 }}
                    style={{ background: rowBg }}
                  >
                    <td style={{ ...BARLOW, fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.3)', padding: '9px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      {t.id}
                    </td>
                    <td style={{ ...BARLOW, fontWeight: 600, fontSize: '13px', color: '#fff', padding: '9px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)', whiteSpace: 'nowrap' as const }}>
                      {t.symbol}
                    </td>
                    <td style={{ padding: '9px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{
                        ...BARLOW,
                        fontWeight: 500,
                        fontSize: '11px',
                        color: t.side === 'LONG' ? '#22c55e' : '#ef4444',
                        background: t.side === 'LONG' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                        borderRadius: 9999,
                        padding: '2px 8px',
                      }}>{t.side}</span>
                    </td>
                    <td className="sv-hide-mobile" style={{ ...BARLOW, fontWeight: 400, fontSize: '13px', color: '#fff', padding: '9px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)', whiteSpace: 'nowrap' as const }}>
                      {t.entry}
                    </td>
                    <td className="sv-hide-mobile" style={{ ...BARLOW, fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.5)', padding: '9px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)', whiteSpace: 'nowrap' as const }}>
                      {t.signalTime}
                    </td>
                    <td style={{ padding: '9px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <OutcomeBadge outcome={t.outcome} />
                    </td>
                    <td style={{ padding: '9px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)', textAlign: 'right', whiteSpace: 'nowrap' as const }}>
                      <span style={{
                        ...BARLOW,
                        fontWeight: 500,
                        fontSize: '13px',
                        color: t.pnlPct >= 0 ? '#22c55e' : '#ef4444',
                      }}>
                        {t.pnlPct >= 0 ? '+' : ''}{t.pnlPct.toFixed(2)}%
                      </span>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Summary bar */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '0.9rem',
          padding: '0.85rem 1.1rem',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.35rem 1rem',
        }}>
          <span style={{ ...BARLOW, fontWeight: 600, fontSize: '13px', color: '#22c55e' }}>8W</span>
          <span style={{ ...BARLOW, fontWeight: 300, fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>/</span>
          <span style={{ ...BARLOW, fontWeight: 600, fontSize: '13px', color: '#ef4444' }}>2L</span>
          <span style={{ ...BARLOW, fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>—</span>
          <span style={{ ...BARLOW, fontWeight: 500, fontSize: '13px', color: '#fff' }}>80% win rate</span>
          <span style={{ ...BARLOW, fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>—</span>
          <span style={{ ...BARLOW, fontWeight: 400, fontSize: '13px', color: '#22c55e' }}>Avg winner +4.7%</span>
          <span style={{ ...BARLOW, fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>—</span>
          <span style={{ ...BARLOW, fontWeight: 400, fontSize: '13px', color: '#ef4444' }}>Avg loser −2.7%</span>
        </div>
      </motion.div>

      {/* ── Section 3: Edge Discovery ────────────────────────────────────────── */}
      <motion.div
        className="liquid-glass"
        style={{ borderRadius: '1.75rem', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.16 }}
      >
        <div>
          <span style={LABEL}>Stage 4</span>
          <h3 style={{ ...SECTION_HEADER, marginTop: '0.3rem' }}>Edge Discovery</h3>
        </div>

        <div style={DIVIDER} />

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
            <thead>
              <tr>
                {(['Rule', 'Variation Tested', 'Win Rate Δ', 'RRR Δ', 'Decision'] as const).map((col) => (
                  <th
                    key={col}
                    style={{
                      ...BARLOW,
                      fontWeight: 500,
                      fontSize: '11px',
                      color: 'rgba(255,255,255,0.35)',
                      textAlign: col === 'Win Rate Δ' || col === 'RRR Δ' ? 'right' : 'left',
                      padding: '0 10px 10px',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                      whiteSpace: 'nowrap' as const,
                    }}
                  >{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {EDGE_VARIATIONS.map((row, i) => (
                <motion.tr
                  key={row.rule}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.04, duration: 0.2 }}
                  style={{ background: row.accepted ? 'rgba(34,197,94,0.03)' : 'rgba(239,68,68,0.03)' }}
                >
                  <td style={{ ...BARLOW, fontWeight: 500, fontSize: '13px', color: '#fff', padding: '10px 10px', borderBottom: '1px solid rgba(255,255,255,0.04)', whiteSpace: 'nowrap' as const }}>
                    {row.rule}
                  </td>
                  <td style={{ ...BARLOW, fontWeight: 300, fontSize: '13px', color: 'rgba(255,255,255,0.6)', padding: '10px 10px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {row.variation}
                    {row.note && <span style={{ ...BARLOW, fontWeight: 300, fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginLeft: '0.4rem' }}>({row.note})</span>}
                  </td>
                  <td style={{ ...BARLOW, fontWeight: 500, fontSize: '13px', padding: '10px 10px', borderBottom: '1px solid rgba(255,255,255,0.04)', textAlign: 'right', whiteSpace: 'nowrap' as const, color: row.winRateDelta.startsWith('+') ? '#22c55e' : '#ef4444' }}>
                    {row.winRateDelta}
                  </td>
                  <td style={{ ...BARLOW, fontWeight: 500, fontSize: '13px', padding: '10px 10px', borderBottom: '1px solid rgba(255,255,255,0.04)', textAlign: 'right', whiteSpace: 'nowrap' as const, color: row.rrrDelta.startsWith('+') ? '#22c55e' : '#ef4444' }}>
                    {row.rrrDelta}
                  </td>
                  <td style={{ padding: '10px 10px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{
                      ...BARLOW,
                      fontWeight: 600,
                      fontSize: '11px',
                      color: row.accepted ? '#22c55e' : '#ef4444',
                      background: row.accepted ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                      borderRadius: 9999,
                      padding: '2px 10px',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase' as const,
                    }}>
                      {row.accepted ? 'Accepted' : 'Rejected'}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{
          background: 'rgba(96,165,250,0.06)',
          border: '1px solid rgba(96,165,250,0.15)',
          borderRadius: '0.9rem',
          padding: '0.9rem 1.1rem',
          display: 'flex',
          flexDirection: 'column' as const,
          gap: '0.35rem',
        }}>
          <span style={{ ...BARLOW, fontWeight: 500, fontSize: '13px', color: '#60a5fa' }}>
            4 of 5 variations accepted
          </span>
          <span style={{ ...BARLOW, fontWeight: 300, fontSize: '13px', color: 'rgba(255,255,255,0.55)' }}>
            Top improvement: FVG confluence (+5% win rate, +0.18 RRR). Shared privately with trader — trader decides whether to adopt.
          </span>
        </div>
      </motion.div>

      {/* ── Section 4: On-Chain Grade ─────────────────────────────────────────── */}
      <motion.div
        className="liquid-glass"
        style={{ borderRadius: '1.75rem', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.24 }}
      >
        <div>
          <span style={LABEL}>Stage 5</span>
          <h3 style={{ ...SECTION_HEADER, marginTop: '0.3rem' }}>On-Chain Grade</h3>
        </div>

        <div style={DIVIDER} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {/* Grade card */}
          <div style={CARD}>
            <span style={LABEL}>Assigned Grade</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{
                ...BARLOW,
                fontWeight: 700,
                fontSize: '36px',
                color: '#22c55e',
                lineHeight: 1,
              }}>A</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <span style={{
                  ...BARLOW,
                  fontWeight: 600,
                  fontSize: '13px',
                  color: '#22c55e',
                  background: 'rgba(34,197,94,0.15)',
                  borderRadius: 9999,
                  padding: '3px 12px',
                  display: 'inline-block',
                }}>A-tier</span>
                <span style={{ ...BARLOW, fontWeight: 300, fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>75–84% win rate</span>
              </div>
            </div>
            <div style={DIVIDER} />
            <p style={{ ...BARLOW, fontWeight: 300, fontSize: '12.5px', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.6 }}>
              Grade is computed by the verification pipeline, not assigned by the platform. It cannot be manually overridden.
            </p>
          </div>

          {/* How grades work */}
          <div style={CARD}>
            <span style={LABEL}>How Grades Work</span>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {(['Grade', 'Win Rate', 'Platform Fee'] as const).map((col) => (
                    <th key={col} style={{
                      ...BARLOW,
                      fontWeight: 500,
                      fontSize: '11px',
                      color: 'rgba(255,255,255,0.35)',
                      textAlign: 'left',
                      padding: '0 8px 8px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                    }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {GRADE_TABLE.map((row) => (
                  <tr key={row.grade}>
                    <td style={{ padding: '7px 8px 7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{
                        ...BARLOW,
                        fontWeight: 600,
                        fontSize: '12px',
                        color: row.color,
                        background: row.bg,
                        borderRadius: 9999,
                        padding: '2px 10px',
                      }}>{row.label}</span>
                    </td>
                    <td style={{ ...BARLOW, fontWeight: 400, fontSize: '13px', color: '#fff', padding: '7px 8px 7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', whiteSpace: 'nowrap' as const }}>
                      {row.threshold}
                    </td>
                    <td style={{ ...BARLOW, fontWeight: 300, fontSize: '13px', color: 'rgba(255,255,255,0.55)', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      {row.grade === 'S' ? '15%' : row.grade === 'A' ? '12%' : row.grade === 'B' ? '10%' : '8%'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ ...BARLOW, fontWeight: 300, fontSize: '11.5px', color: 'rgba(255,255,255,0.35)', margin: 0, lineHeight: 1.55 }}>
              Below 55% win rate → not listed. Grade re-evaluated every 50 new trades.
            </p>
          </div>
        </div>
      </motion.div>

    </div>
  )
}
