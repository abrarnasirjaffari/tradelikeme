import { useState } from 'react'
import { CheckCircle, ShieldCheck, AlertTriangle, ChevronDown, ChevronUp, Clock, Users, RefreshCw } from 'lucide-react'
import FadingVideo from '../../components/FadingVideo'
import TraderSidebar from '../../components/trader/TraderSidebar'
import type { TraderPage } from '../../components/trader/TraderSidebar'
import { useAuth } from '../../context/AuthContext'

const VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4'

// ── Coin watchlist ───────────────────────────────────────────────────────────
const COINS = ['SOL', 'ETH', 'BTC', 'TAO', 'SUI', 'XRP', 'DOT', 'LINK']

// ── Types ───────────────────────────────────────────────────────────────────
type RiskMode = 'conservative' | 'medium' | 'aggressive'

interface RiskConfig {
  leverage: string
  marginPct: string
  maxPositions: string
}

const defaultRiskConfig: Record<RiskMode, RiskConfig> = {
  conservative: { leverage: '50-100x',  marginPct: '0.25-0.5%', maxPositions: '2' },
  medium:        { leverage: '50-200x',  marginPct: '0.5-1%',    maxPositions: '2' },
  aggressive:    { leverage: '50-300x',  marginPct: '1-2%',      maxPositions: '3' },
}

// ── Shared primitives ────────────────────────────────────────────────────────
const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '1.25rem',
  padding: '1.5rem',
}

const labelStyle: React.CSSProperties = {
  fontFamily: "'Barlow', sans-serif",
  fontWeight: 400,
  fontSize: '12px',
  color: 'rgba(255,255,255,0.45)',
  marginBottom: '0.4rem',
  display: 'block',
}

const inputStyle: React.CSSProperties = {
  fontFamily: "'Barlow', sans-serif",
  fontWeight: 400,
  fontSize: '13.5px',
  color: '#fff',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '0.6rem',
  padding: '0.6rem 0.85rem',
  width: '100%',
  outline: 'none',
  boxSizing: 'border-box' as const,
}

const readOnlyInputStyle: React.CSSProperties = {
  ...inputStyle,
  color: 'rgba(255,255,255,0.5)',
  background: 'rgba(255,255,255,0.02)',
  cursor: 'not-allowed',
}

const sectionHeader: React.CSSProperties = {
  fontFamily: "'Barlow', sans-serif",
  fontWeight: 600,
  fontSize: '14.5px',
  color: '#fff',
  marginBottom: '1rem',
}

// ── Save button ──────────────────────────────────────────────────────────────
function SaveButton({ label, onClick, saved }: { label: string; onClick: () => void; saved: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: "'Barlow', sans-serif",
        fontWeight: 500,
        fontSize: '13px',
        color: saved ? '#22c55e' : 'rgba(255,255,255,0.8)',
        background: saved ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.06)',
        border: `1px solid ${saved ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.12)'}`,
        borderRadius: '0.6rem',
        padding: '0.55rem 1.2rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
      }}
    >
      {saved ? <CheckCircle size={13} /> : null}
      {saved ? 'Saved' : label}
    </button>
  )
}

// ── Risk mode card ────────────────────────────────────────────────────────────
function RiskModeCard({
  mode,
  config,
  onChange,
  onSave,
  saved,
}: {
  mode: RiskMode
  config: RiskConfig
  onChange: (field: keyof RiskConfig, val: string) => void
  onSave: () => void
  saved: boolean
}) {
  const labels: Record<RiskMode, { title: string; color: string; bg: string }> = {
    conservative: { title: 'Conservative', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)'   },
    medium:        { title: 'Medium',       color: '#a78bfa', bg: 'rgba(167,139,250,0.1)'  },
    aggressive:    { title: 'Aggressive',   color: '#f87171', bg: 'rgba(248,113,113,0.1)'  },
  }
  const { title, color, bg } = labels[mode]

  return (
    <div style={{ ...card, borderColor: `${color}33` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '13px',
            color, background: bg, borderRadius: 9999, padding: '3px 12px',
          }}>
            {title}
          </span>
        </div>
        <SaveButton label="Save" onClick={onSave} saved={saved} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div>
          <label style={labelStyle}>Leverage Range</label>
          <input
            style={inputStyle}
            value={config.leverage}
            onChange={e => onChange('leverage', e.target.value)}
            placeholder="e.g. 50-200x"
          />
        </div>
        <div>
          <label style={labelStyle}>Margin Per Trade</label>
          <input
            style={inputStyle}
            value={config.marginPct}
            onChange={e => onChange('marginPct', e.target.value)}
            placeholder="e.g. 0.5-1%"
          />
        </div>
        <div>
          <label style={labelStyle}>Max Concurrent Positions</label>
          <input
            style={inputStyle}
            value={config.maxPositions}
            onChange={e => onChange('maxPositions', e.target.value)}
            placeholder="e.g. 2"
            type="number"
            min={1}
            max={10}
          />
        </div>
      </div>
    </div>
  )
}

// ── Max positions visual slider ───────────────────────────────────────────────
function PositionsSlider({ value, max }: { value: number; max: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        {Array.from({ length: max }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 6,
              borderRadius: 3,
              background: i < value ? '#0052FF' : 'rgba(255,255,255,0.1)',
              transition: 'background 0.2s',
            }}
          />
        ))}
      </div>
      <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '13px', color: '#fff' }}>
        {value} of {max} slots active
      </span>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function TraderStrategyPage() {
  const { user } = useAuth()
  const [activePage, setActivePage] = useState<TraderPage>('strategy')

  // Basic info
  const [description, setDescription] = useState(
    'Supply & demand zone trading strategy. Entry on 4H zone confirmation with 15M execution. 89% win rate verified on TradingView. Body-close stop loss — wicks ignored. TP1 at zone 1, TP2 at zone 2. BTC 1D gate mandatory.'
  )
  const [descSaved, setDescSaved] = useState(false)

  // Risk mode configs
  const [riskConfigs, setRiskConfigs] = useState<Record<RiskMode, RiskConfig>>({ ...defaultRiskConfig })
  const [riskSaved, setRiskSaved] = useState<Record<RiskMode, boolean>>({
    conservative: false, medium: false, aggressive: false,
  })

  // De-listing confirm state
  const [delistConfirm, setDelistConfirm] = useState(false)

  function handleNavigate(page: TraderPage) {
    setActivePage(page)
  }

  function handleDescSave() {
    setDescSaved(true)
    setTimeout(() => setDescSaved(false), 2000)
  }

  function handleRiskChange(mode: RiskMode, field: keyof RiskConfig, val: string) {
    setRiskConfigs(prev => ({ ...prev, [mode]: { ...prev[mode], [field]: val } }))
    setRiskSaved(prev => ({ ...prev, [mode]: false }))
  }

  function handleRiskSave(mode: RiskMode) {
    setRiskSaved(prev => ({ ...prev, [mode]: true }))
    setTimeout(() => setRiskSaved(prev => ({ ...prev, [mode]: false })), 2000)
  }

  return (
    <div style={{ background: '#000', minHeight: '100vh', display: 'flex' }}>
      <style>{`
        @media (max-width: 767px) {
          .trader-content { margin-left: 0 !important; padding-bottom: 70px !important; }
          .risk-grid { grid-template-columns: 1fr !important; }
          .basic-grid { grid-template-columns: 1fr !important; }
        }
        input:focus { border-color: rgba(255,255,255,0.25) !important; outline: none; }
        textarea:focus { border-color: rgba(255,255,255,0.25) !important; outline: none; }
      `}</style>

      {/* Background video */}
      <FadingVideo
        src={VIDEO_SRC}
        style={{
          position: 'fixed', top: 0, left: '-10%', width: '120%', height: '120%',
          objectFit: 'cover', objectPosition: 'center top', zIndex: 0,
        }}
      />
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'rgba(0,0,0,0.60)', pointerEvents: 'none' }} />

      {/* Sidebar */}
      <TraderSidebar activePage={activePage} onNavigate={handleNavigate} user={user} />

      {/* Main content */}
      <div
        className="trader-content"
        style={{ position: 'relative', zIndex: 1, marginLeft: 220, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
      >
        {/* Sticky header */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 40,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '0 2rem', height: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        }}>
          <div>
            <h2 style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '15px', color: '#fff', margin: 0 }}>
              Strategy Settings
            </h2>
            <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
              Configure your strategy parameters
            </p>
          </div>
          <span style={{
            fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '11px',
            color: '#22c55e', background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: 9999, padding: '4px 12px',
          }}>
            Active
          </span>
        </div>

        {/* Page body */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* ── Approval status banner ── */}
            <div style={{
              background: 'rgba(34,197,94,0.08)',
              border: '1px solid rgba(34,197,94,0.25)',
              borderRadius: '0.9rem',
              padding: '0.85rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}>
              <CheckCircle size={16} color="#22c55e" />
              <div style={{ flex: 1 }}>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '13.5px', color: '#22c55e' }}>
                  Strategy Active
                </span>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '13px', color: 'rgba(255,255,255,0.55)', marginLeft: '0.5rem' }}>
                  — Approved Apr 28, 2026 · S-tier
                </span>
              </div>
              <span style={{
                fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '11px',
                color: '#f97316', background: 'rgba(249,115,22,0.12)',
                border: '1px solid rgba(249,115,22,0.25)',
                borderRadius: 9999, padding: '3px 10px',
              }}>
                S-tier
              </span>
            </div>

            {/* ── Basic info ── */}
            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{ ...sectionHeader, margin: 0 }}>Basic Info</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={13} color="#22c55e" />
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '12px', color: '#22c55e' }}>
                    Verified
                  </span>
                </div>
              </div>
              <div className="basic-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={labelStyle}>Strategy Name</label>
                  <input style={readOnlyInputStyle} value="SD Zones v1" readOnly />
                </div>
                <div>
                  <label style={labelStyle}>Tier</label>
                  <div style={{
                    ...inputStyle,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    cursor: 'default',
                  }}>
                    <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '13.5px', color: '#f97316' }}>
                      S-tier
                    </span>
                    <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '11.5px', color: 'rgba(255,255,255,0.35)' }}>
                      89% win rate
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Description</label>
                <textarea
                  style={{
                    ...inputStyle,
                    minHeight: '90px',
                    resize: 'vertical',
                    lineHeight: 1.55,
                  } as React.CSSProperties}
                  value={description}
                  onChange={e => { setDescription(e.target.value); setDescSaved(false) }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <SaveButton label="Save Description" onClick={handleDescSave} saved={descSaved} />
              </div>
            </div>

            {/* ── Risk Modes ── */}
            <div>
              <h3 style={sectionHeader}>Risk Modes</h3>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '12.5px', color: 'rgba(255,255,255,0.4)', margin: '0 0 1rem' }}>
                Define the leverage, margin, and position limits for each risk preset. Users choose a mode — they cannot override individual parameters.
              </p>
              <div className="risk-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {(['conservative', 'medium', 'aggressive'] as RiskMode[]).map((mode) => (
                  <RiskModeCard
                    key={mode}
                    mode={mode}
                    config={riskConfigs[mode]}
                    onChange={(field, val) => handleRiskChange(mode, field, val)}
                    onSave={() => handleRiskSave(mode)}
                    saved={riskSaved[mode]}
                  />
                ))}
              </div>
            </div>

            {/* ── Trading Parameters ── */}
            <div style={card}>
              <h3 style={sectionHeader}>Trading Parameters</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Coin watchlist */}
                <div>
                  <label style={labelStyle}>Coin Watchlist</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                    {COINS.map(coin => (
                      <span
                        key={coin}
                        style={{
                          fontFamily: "'Barlow', sans-serif",
                          fontWeight: 500,
                          fontSize: '12px',
                          color: '#60a5fa',
                          background: 'rgba(96,165,250,0.12)',
                          border: '1px solid rgba(96,165,250,0.25)',
                          borderRadius: 9999,
                          padding: '4px 14px',
                        }}
                      >
                        {coin}
                      </span>
                    ))}
                    <span style={{
                      fontFamily: "'Barlow', sans-serif",
                      fontWeight: 300,
                      fontSize: '11.5px',
                      color: 'rgba(255,255,255,0.3)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '4px 8px',
                    }}>
                      + any coin with valid S/D setup
                    </span>
                  </div>
                </div>

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

                {/* Max concurrent positions */}
                <div>
                  <label style={labelStyle}>Max Concurrent Positions</label>
                  <PositionsSlider value={2} max={5} />
                </div>

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

                {/* Info row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.1rem' }}>
                      <Clock size={14} color="rgba(255,255,255,0.4)" />
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '12.5px', color: '#fff', marginBottom: '0.2rem' }}>
                        Trading Hours
                      </div>
                      <div style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                        24/7 — All day, every day
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.1rem' }}>
                      <RefreshCw size={14} color="rgba(255,255,255,0.4)" />
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '12.5px', color: '#fff', marginBottom: '0.2rem' }}>
                        Withdrawal Window
                      </div>
                      <div style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                        30 days minimum
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.1rem' }}>
                      <Users size={14} color="rgba(255,255,255,0.4)" />
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '12.5px', color: '#fff', marginBottom: '0.2rem' }}>
                        Active Subscribers
                      </div>
                      <div style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                        31 users following
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* ── Danger Zone ── */}
            <div style={{
              ...card,
              border: '1px solid rgba(239,68,68,0.25)',
              background: 'rgba(239,68,68,0.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <AlertTriangle size={15} color="#ef4444" />
                <h3 style={{ ...sectionHeader, margin: 0, color: '#ef4444' }}>Danger Zone</h3>
              </div>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '13px', color: 'rgba(255,255,255,0.45)', margin: '0 0 1rem', lineHeight: 1.6 }}>
                Requesting de-listing will remove your strategy from the marketplace. All 31 current subscribers will be notified and their funds returned within the withdrawal window (30 days). This action cannot be undone.
              </p>

              {!delistConfirm ? (
                <button
                  onClick={() => setDelistConfirm(true)}
                  style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontWeight: 500,
                    fontSize: '13px',
                    color: '#ef4444',
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    borderRadius: '0.6rem',
                    padding: '0.6rem 1.4rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.14)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)' }}
                >
                  <ChevronDown size={13} />
                  Request De-listing
                </button>
              ) : (
                <div style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}>
                  <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '13px', color: '#ef4444', margin: 0 }}>
                    Are you sure? This will de-list SD Zones v1 and notify all 31 subscribers.
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      onClick={() => { window.alert('De-listing request submitted. Our team will review within 48 hours.'); setDelistConfirm(false) }}
                      style={{
                        fontFamily: "'Barlow', sans-serif",
                        fontWeight: 600,
                        fontSize: '13px',
                        color: '#fff',
                        background: '#ef4444',
                        border: 'none',
                        borderRadius: '0.6rem',
                        padding: '0.6rem 1.2rem',
                        cursor: 'pointer',
                        transition: 'opacity 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                    >
                      Yes, Request De-listing
                    </button>
                    <button
                      onClick={() => setDelistConfirm(false)}
                      style={{
                        fontFamily: "'Barlow', sans-serif",
                        fontWeight: 500,
                        fontSize: '13px',
                        color: 'rgba(255,255,255,0.6)',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '0.6rem',
                        padding: '0.6rem 1.2rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
                    >
                      <ChevronUp size={13} />
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
