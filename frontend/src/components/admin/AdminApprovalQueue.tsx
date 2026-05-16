import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

type Tier = 'S' | 'A' | 'B' | 'C'

interface PendingStrategy {
  id: string
  name: string
  submittedBy: string
  submittedDate: string
  winRate: string
  totalTrades: number
  verifiedTrades: number
  proposedTier: Tier
  description: string
}

interface ReviewedStrategy {
  id: string
  name: string
  submittedBy: string
  reviewedDate: string
  outcome: 'approved' | 'rejected'
  tier?: Tier
  reason: string
}

const PENDING: PendingStrategy[] = [
  {
    id: 'p1',
    name: 'Momentum Scalper Pro',
    submittedBy: '@alex_torres',
    submittedDate: 'May 10, 2026',
    winRate: '77.4%',
    totalTrades: 84,
    verifiedTrades: 50,
    proposedTier: 'A',
    description: 'High-frequency scalping on 5M chart using EMA crossover + RSI divergence. Targets 1.5-2% moves on SOL, BTC, ETH.',
  },
  {
    id: 'p2',
    name: 'BTC Swing Breakout',
    submittedBy: '@priya_trades',
    submittedDate: 'May 12, 2026',
    winRate: '68.2%',
    totalTrades: 66,
    verifiedTrades: 38,
    proposedTier: 'B',
    description: 'Daily breakout strategy on BTC. Uses volume-confirmed breakouts above key resistance zones with 3-5% targets.',
  },
  {
    id: 'p3',
    name: 'Altseason Swing',
    submittedBy: '@marco_r',
    submittedDate: 'May 14, 2026',
    winRate: '61.9%',
    totalTrades: 52,
    verifiedTrades: 30,
    proposedTier: 'C',
    description: 'Alt-season rotation strategy. Enters when BTC dominance drops and alts show volume + S/D zone bounce. 4H TF.',
  },
]

const REVIEWED: ReviewedStrategy[] = [
  {
    id: 'r1',
    name: 'ETH Grid Bot',
    submittedBy: '@eth_gridder',
    reviewedDate: 'May 8, 2026',
    outcome: 'approved',
    tier: 'B',
    reason: 'Verified 60 trades on TradingView. Consistent 68% win rate. Added as B-tier.',
  },
  {
    id: 'r2',
    name: 'NFT Pump Alerts',
    submittedBy: '@nft_caller_99',
    reviewedDate: 'May 7, 2026',
    outcome: 'rejected',
    reason: 'Only 23 verified trades (minimum 50 required). Win rate 52% below 55% threshold. No clear SL rules documented.',
  },
]

const TIER_COLORS: Record<Tier, { color: string; bg: string }> = {
  S: { color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
  A: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  B: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  C: { color: 'rgba(255,255,255,0.5)', bg: 'rgba(255,255,255,0.06)' },
}

function TierBadge({ tier }: { tier: Tier }) {
  const c = TIER_COLORS[tier]
  return (
    <span style={{
      fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '11px',
      color: c.color, background: c.bg,
      borderRadius: 6, padding: '3px 9px',
    }}>{tier}-tier</span>
  )
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 9999, height: 6, overflow: 'hidden' }}>
      <div style={{
        width: `${pct}%`, height: '100%', borderRadius: 9999,
        background: pct >= 100 ? '#22c55e' : '#3b82f6',
        transition: 'width 0.3s',
      }} />
    </div>
  )
}

function PendingCard({ s }: { s: PendingStrategy }) {
  const [expanded, setExpanded] = useState(false)
  const [selectedTier, setSelectedTier] = useState<Tier>(s.proposedTier)
  const [notes, setNotes] = useState('')

  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      {/* Header row */}
      <button
        onClick={() => setExpanded(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', background: 'transparent', border: 'none', cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <TierBadge tier={s.proposedTier} />
          <div>
            <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '14px', color: '#fff', margin: 0 }}>{s.name}</p>
            <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>
              by {s.submittedBy} · submitted {s.submittedDate}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '16px', color: '#22c55e', margin: 0 }}>{s.winRate}</p>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '10px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>win rate</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '16px', color: '#fff', margin: 0 }}>{s.totalTrades}</p>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '10px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>trades</p>
            </div>
          </div>
          {expanded ? <ChevronUp size={16} color="rgba(255,255,255,0.4)" /> : <ChevronDown size={16} color="rgba(255,255,255,0.4)" />}
        </div>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div style={{ padding: '0 20px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '13px', color: 'rgba(255,255,255,0.55)', margin: '16px 0 16px' }}>
            {s.description}
          </p>

          {/* Verification progress */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Trade verification</span>
              <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '12px', color: s.verifiedTrades >= 50 ? '#22c55e' : '#f97316' }}>
                {s.verifiedTrades} / 50 verified
              </span>
            </div>
            <ProgressBar value={s.verifiedTrades} max={50} />
          </div>

          {/* Tier selector */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: 10, marginTop: 0 }}>Assign tier:</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['S', 'A', 'B', 'C'] as Tier[]).map(t => (
                <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name={`tier-${s.id}`}
                    value={t}
                    checked={selectedTier === t}
                    onChange={() => setSelectedTier(t)}
                    style={{ accentColor: TIER_COLORS[t].color }}
                  />
                  <span style={{
                    fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '12px',
                    color: selectedTier === t ? TIER_COLORS[t].color : 'rgba(255,255,255,0.4)',
                  }}>{t}-tier</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: 6, marginTop: 0 }}>Notes:</p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add review notes…"
              rows={3}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, padding: '10px 12px', resize: 'vertical',
                fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '13px',
                color: '#fff', outline: 'none',
              }}
            />
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{
              fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '13px',
              color: '#fff', background: '#22c55e', border: 'none',
              borderRadius: 8, padding: '9px 20px', cursor: 'pointer',
            }}>Approve</button>
            <button style={{
              fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '13px',
              color: '#fff', background: '#3b82f6', border: 'none',
              borderRadius: 8, padding: '9px 20px', cursor: 'pointer',
            }}>Request Changes</button>
            <button style={{
              fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '13px',
              color: '#fff', background: '#ef4444', border: 'none',
              borderRadius: 8, padding: '9px 20px', cursor: 'pointer',
            }}>Reject</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminApprovalQueue() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{
          fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '13px',
          color: '#f97316', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)',
          borderRadius: 9999, padding: '4px 12px',
        }}>{PENDING.length} pending</span>
        <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
          Strategies awaiting review
        </span>
      </div>

      {/* Pending queue */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {PENDING.map(s => <PendingCard key={s.id} s={s} />)}
      </div>

      {/* Recently reviewed */}
      <div>
        <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '14px', color: '#fff', margin: '0 0 12px' }}>
          Recently Reviewed
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {REVIEWED.map(r => (
            <div key={r.id} style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${r.outcome === 'approved' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`,
              borderRadius: 10,
              padding: '14px 18px',
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{
                    fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '11px',
                    color: r.outcome === 'approved' ? '#22c55e' : '#ef4444',
                    background: r.outcome === 'approved' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                    borderRadius: 9999, padding: '2px 10px', textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>{r.outcome}</span>
                  <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '13px', color: '#fff', margin: 0 }}>{r.name}</p>
                  {r.tier && <TierBadge tier={r.tier} />}
                </div>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
                  {r.reason}
                </p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '11.5px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>{r.reviewedDate}</p>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '11.5px', color: 'rgba(255,255,255,0.3)', margin: '2px 0 0' }}>by {r.submittedBy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
