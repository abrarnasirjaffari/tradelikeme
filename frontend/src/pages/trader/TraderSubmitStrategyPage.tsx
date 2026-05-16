import { useState } from 'react'
import { CheckCircle2, Upload, Link, AlertCircle, ChevronRight, ChevronLeft, Info } from 'lucide-react'
import FadingVideo from '../../components/FadingVideo'
import TraderSidebar from '../../components/trader/TraderSidebar'
import type { TraderPage } from '../../components/trader/TraderSidebar'
import { useAuth } from '../../context/AuthContext'

// ── types ──────────────────────────────────────────────────────────────────────

type EntryMethod = 'sd_zones' | 'ema_cross' | 'order_flow' | 'other'

interface RiskModeConfig {
  leverage: string
  margin: string
  maxPositions: string
}

interface FormState {
  // Step 1
  name: string
  description: string
  coins: string[]
  entryMethod: EntryMethod
  // Step 2
  conservative: RiskModeConfig
  medium: RiskModeConfig
  aggressive: RiskModeConfig
  // Step 3
  tradeHistoryFile: File | null
  tradingviewUrl: string
  tradeCount: string
  strategyRules: string
}

const ALL_COINS = ['SOL', 'ETH', 'BTC', 'TAO', 'SUI', 'XRP', 'DOT', 'LINK', 'DOGE', 'ADA']

const ENTRY_METHODS: { id: EntryMethod; label: string; desc: string }[] = [
  { id: 'sd_zones',   label: 'S/D Zones',   desc: 'Supply & demand zone reversal with structural SL' },
  { id: 'ema_cross',  label: 'EMA Cross',   desc: 'Exponential moving average crossover signals' },
  { id: 'order_flow', label: 'Order Flow',  desc: 'Delta, absorption, and footprint analysis' },
  { id: 'other',      label: 'Other',       desc: 'Custom entry methodology (describe in rules)' },
]

const RISK_MODES: { id: keyof Pick<FormState, 'conservative' | 'medium' | 'aggressive'>; label: string; color: string; desc: string }[] = [
  { id: 'conservative', label: 'Conservative', color: '#60a5fa', desc: 'Long-term holders, large deposits' },
  { id: 'medium',       label: 'Medium',       color: '#f97316', desc: 'Balanced risk/reward approach' },
  { id: 'aggressive',   label: 'Aggressive',   color: '#f43f5e', desc: 'Higher return, higher volatility' },
]

// ── shared input styles ────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  fontFamily: "'Barlow', sans-serif",
  fontWeight: 400,
  fontSize: '13.5px',
  color: '#fff',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10,
  padding: '0.65rem 0.85rem',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
}

const labelStyle: React.CSSProperties = {
  fontFamily: "'Barlow', sans-serif",
  fontWeight: 500,
  fontSize: '12px',
  color: 'rgba(255,255,255,0.5)',
  display: 'block',
  marginBottom: '0.4rem',
}

// ── step indicator ─────────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  const STEPS = ['Strategy Info', 'Risk Configuration', 'Verification']
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: '2rem' }}>
      {STEPS.map((label, i) => {
        const step = i + 1
        const done = current > step
        const active = current === step
        return (
          <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < total - 1 ? '1' : undefined }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '12px',
                background: done ? '#22c55e' : active ? '#f97316' : 'rgba(255,255,255,0.06)',
                border: `1.5px solid ${done ? '#22c55e' : active ? '#f97316' : 'rgba(255,255,255,0.12)'}`,
                color: done || active ? '#fff' : 'rgba(255,255,255,0.3)',
                flexShrink: 0,
                transition: 'all 0.2s',
              }}>
                {done ? <CheckCircle2 size={14} /> : step}
              </div>
              <span style={{
                fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '10.5px',
                color: done ? '#22c55e' : active ? '#fff' : 'rgba(255,255,255,0.3)',
                whiteSpace: 'nowrap',
              }}>
                {label}
              </span>
            </div>
            {i < total - 1 && (
              <div style={{
                flex: 1, height: 1.5, marginBottom: 18,
                background: done ? '#22c55e' : 'rgba(255,255,255,0.08)',
                transition: 'background 0.3s',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── main component ─────────────────────────────────────────────────────────────

export default function TraderSubmitStrategyPage() {
  const { user } = useAuth()
  const [activePage, setActivePage] = useState<TraderPage>('submit')
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const [form, setForm] = useState<FormState>({
    name: '',
    description: '',
    coins: [],
    entryMethod: 'sd_zones',
    conservative: { leverage: '75', margin: '0.25', maxPositions: '2' },
    medium:       { leverage: '150', margin: '0.5', maxPositions: '3' },
    aggressive:   { leverage: '200', margin: '1', maxPositions: '4' },
    tradeHistoryFile: null,
    tradingviewUrl: '',
    tradeCount: '',
    strategyRules: '',
  })

  function toggleCoin(coin: string) {
    setForm(f => ({
      ...f,
      coins: f.coins.includes(coin) ? f.coins.filter(c => c !== coin) : [...f.coins, coin],
    }))
  }

  function updateRisk(mode: 'conservative' | 'medium' | 'aggressive', field: keyof RiskModeConfig, val: string) {
    setForm(f => ({ ...f, [mode]: { ...f[mode], [field]: val } }))
  }

  const tradeCountNum = parseInt(form.tradeCount) || 0
  const tradeCountOk = tradeCountNum >= 50

  // ── Step 1 ──────────────────────────────────────────────────────────────────

  function Step1() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Strategy name */}
        <div>
          <label style={labelStyle}>Strategy Name</label>
          <input
            type="text"
            placeholder="e.g. S/D Zone Swing Trading"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            style={inputStyle}
            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(249,115,22,0.5)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
          />
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}>Description</label>
          <textarea
            placeholder="Describe your strategy in 2–3 sentences. What edge does it exploit? What markets does it work best in?"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={4}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(249,115,22,0.5)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
          />
        </div>

        {/* Coin selection */}
        <div>
          <label style={labelStyle}>Coins Traded</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {ALL_COINS.map(coin => {
              const selected = form.coins.includes(coin)
              return (
                <button
                  key={coin}
                  type="button"
                  onClick={() => toggleCoin(coin)}
                  style={{
                    fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '12px',
                    padding: '5px 14px', borderRadius: 9999, cursor: 'pointer',
                    border: `1.5px solid ${selected ? '#f97316' : 'rgba(255,255,255,0.1)'}`,
                    background: selected ? 'rgba(249,115,22,0.12)' : 'rgba(255,255,255,0.04)',
                    color: selected ? '#fb923c' : 'rgba(255,255,255,0.4)',
                    transition: 'all 0.15s',
                  }}
                >
                  {coin}
                </button>
              )
            })}
          </div>
          {form.coins.length > 0 && (
            <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: '0.5rem 0 0' }}>
              {form.coins.length} coin{form.coins.length !== 1 ? 's' : ''} selected
            </p>
          )}
        </div>

        {/* Entry method */}
        <div>
          <label style={labelStyle}>Entry Method</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {ENTRY_METHODS.map(em => {
              const selected = form.entryMethod === em.id
              return (
                <label
                  key={em.id}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                    padding: '0.85rem 1rem', borderRadius: 10, cursor: 'pointer',
                    border: `1.5px solid ${selected ? '#f97316' : 'rgba(255,255,255,0.08)'}`,
                    background: selected ? 'rgba(249,115,22,0.06)' : 'rgba(255,255,255,0.02)',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{
                    marginTop: 2, width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${selected ? '#f97316' : 'rgba(255,255,255,0.2)'}`,
                    background: selected ? '#f97316' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}>
                    {selected && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff' }} />}
                  </div>
                  <input
                    type="radio"
                    name="entryMethod"
                    value={em.id}
                    checked={selected}
                    onChange={() => setForm(f => ({ ...f, entryMethod: em.id }))}
                    style={{ display: 'none' }}
                  />
                  <div>
                    <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '13px', color: selected ? '#fff' : 'rgba(255,255,255,0.6)', margin: '0 0 2px' }}>
                      {em.label}
                    </p>
                    <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '11.5px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
                      {em.desc}
                    </p>
                  </div>
                </label>
              )
            })}
          </div>
        </div>

      </div>
    )
  }

  // ── Step 2 ──────────────────────────────────────────────────────────────────

  function Step2() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.75rem 1rem',
          background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: 10,
        }}>
          <Info size={14} style={{ color: '#60a5fa', flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.5 }}>
            These parameters define how subscribers experience your strategy at each risk level. You set leverage and margin — users cannot override them.
          </p>
        </div>

        {RISK_MODES.map(({ id, label, color, desc }) => {
          const cfg = form[id]
          return (
            <div key={id} style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid rgba(255,255,255,0.08)`,
              borderLeft: `3px solid ${color}`,
              borderRadius: 12,
              padding: '1.1rem 1.25rem',
            }}>
              <div style={{ marginBottom: '0.85rem' }}>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '13.5px', color, margin: '0 0 2px' }}>{label}</p>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '11.5px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>{desc}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ ...labelStyle, fontSize: '11px' }}>Leverage (x)</label>
                  <input
                    type="number"
                    min="1" max="500"
                    value={cfg.leverage}
                    onChange={e => updateRisk(id, 'leverage', e.target.value)}
                    style={{ ...inputStyle, fontSize: '13px' }}
                    onFocus={e => (e.currentTarget.style.borderColor = color + '80')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                  />
                </div>
                <div>
                  <label style={{ ...labelStyle, fontSize: '11px' }}>Margin per Trade (%)</label>
                  <input
                    type="number"
                    min="0.1" max="5" step="0.1"
                    value={cfg.margin}
                    onChange={e => updateRisk(id, 'margin', e.target.value)}
                    style={{ ...inputStyle, fontSize: '13px' }}
                    onFocus={e => (e.currentTarget.style.borderColor = color + '80')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                  />
                </div>
                <div>
                  <label style={{ ...labelStyle, fontSize: '11px' }}>Max Concurrent Positions</label>
                  <input
                    type="number"
                    min="1" max="10"
                    value={cfg.maxPositions}
                    onChange={e => updateRisk(id, 'maxPositions', e.target.value)}
                    style={{ ...inputStyle, fontSize: '13px' }}
                    onFocus={e => (e.currentTarget.style.borderColor = color + '80')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // ── Step 3 ──────────────────────────────────────────────────────────────────

  function Step3() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* File upload */}
        <div>
          <label style={labelStyle}>Trade History</label>
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => {
              e.preventDefault()
              setDragOver(false)
              const file = e.dataTransfer.files[0]
              if (file) setForm(f => ({ ...f, tradeHistoryFile: file }))
            }}
            onClick={() => document.getElementById('trade-file-input')?.click()}
            style={{
              border: `2px dashed ${dragOver ? '#f97316' : form.tradeHistoryFile ? '#22c55e' : 'rgba(255,255,255,0.12)'}`,
              borderRadius: 12,
              padding: '2rem',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              cursor: 'pointer',
              background: dragOver ? 'rgba(249,115,22,0.05)' : form.tradeHistoryFile ? 'rgba(34,197,94,0.05)' : 'rgba(255,255,255,0.02)',
              transition: 'all 0.15s',
              textAlign: 'center',
            }}
          >
            {form.tradeHistoryFile ? (
              <>
                <CheckCircle2 size={22} style={{ color: '#22c55e' }} />
                <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '13px', color: '#22c55e', margin: 0 }}>
                  {form.tradeHistoryFile.name}
                </p>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                  Click to replace
                </p>
              </>
            ) : (
              <>
                <Upload size={22} style={{ color: 'rgba(255,255,255,0.3)' }} />
                <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                  Drop your trade history here
                </p>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11.5px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                  CSV, XLSX, or exchange export — click to browse
                </p>
              </>
            )}
          </div>
          <input
            id="trade-file-input"
            type="file"
            accept=".csv,.xlsx,.xls,.json"
            style={{ display: 'none' }}
            onChange={e => {
              const file = e.target.files?.[0]
              if (file) setForm(f => ({ ...f, tradeHistoryFile: file }))
            }}
          />
        </div>

        {/* TradingView URL */}
        <div>
          <label style={labelStyle}>TradingView Profile URL</label>
          <div style={{ position: 'relative' }}>
            <Link size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
            <input
              type="url"
              placeholder="https://www.tradingview.com/u/yourhandle/"
              value={form.tradingviewUrl}
              onChange={e => setForm(f => ({ ...f, tradingviewUrl: e.target.value }))}
              style={{ ...inputStyle, paddingLeft: '2.25rem' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(249,115,22,0.5)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
          </div>
          <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: '0.4rem 0 0' }}>
            We verify your published trade ideas and chart analysis on TradingView.
          </p>
        </div>

        {/* Trade count */}
        <div>
          <label style={labelStyle}>Number of Verified Trades</label>
          <div style={{ position: 'relative', maxWidth: 200 }}>
            <input
              type="number"
              min="0"
              placeholder="e.g. 87"
              value={form.tradeCount}
              onChange={e => setForm(f => ({ ...f, tradeCount: e.target.value }))}
              style={{
                ...inputStyle,
                borderColor: form.tradeCount === '' ? 'rgba(255,255,255,0.1)' : tradeCountOk ? 'rgba(34,197,94,0.4)' : 'rgba(244,63,94,0.4)',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(249,115,22,0.5)')}
              onBlur={e => {
                if (form.tradeCount === '') { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; return }
                e.currentTarget.style.borderColor = tradeCountOk ? 'rgba(34,197,94,0.4)' : 'rgba(244,63,94,0.4)'
              }}
            />
          </div>

          {/* Requirement note */}
          {form.tradeCount !== '' && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem',
              padding: '0.6rem 0.85rem', borderRadius: 8,
              background: tradeCountOk ? 'rgba(34,197,94,0.08)' : 'rgba(244,63,94,0.08)',
              border: `1px solid ${tradeCountOk ? 'rgba(34,197,94,0.2)' : 'rgba(244,63,94,0.2)'}`,
            }}>
              {tradeCountOk
                ? <CheckCircle2 size={13} style={{ color: '#22c55e', flexShrink: 0 }} />
                : <AlertCircle size={13} style={{ color: '#f43f5e', flexShrink: 0 }} />
              }
              <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: tradeCountOk ? '#22c55e' : '#f43f5e' }}>
                {tradeCountOk
                  ? `${tradeCountNum} trades — meets the 50-trade minimum requirement`
                  : `${tradeCountNum} trades — minimum 50 required. Add ${50 - tradeCountNum} more trades to qualify.`}
              </span>
            </div>
          )}
          {form.tradeCount === '' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Info size={12} style={{ color: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
              <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11.5px', color: 'rgba(255,255,255,0.3)' }}>
                Minimum 50 verified trades required for submission
              </span>
            </div>
          )}
        </div>

        {/* Strategy rules */}
        <div>
          <label style={labelStyle}>Strategy Rules (Brief)</label>
          <textarea
            placeholder={`Describe your entry, exit, and risk rules in plain language.\n\nExample:\n- Entry: 4H supply zone retest with 15M confirmation\n- TP1: 50% at nearest demand zone\n- TP2: Remaining at second zone\n- SL: Structural body close below zone\n- BTC macro filter: No shorts during BTC recovery`}
            value={form.strategyRules}
            onChange={e => setForm(f => ({ ...f, strategyRules: e.target.value }))}
            rows={7}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(249,115,22,0.5)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
          />
          <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: '0.4rem 0 0' }}>
            Our team will use these rules to build your agent instance. Be specific — vague rules cause incorrect agent behaviour.
          </p>
        </div>

      </div>
    )
  }

  // ── success state ─────────────────────────────────────────────────────────────

  function SuccessState() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center', gap: '1rem' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '0.5rem',
        }}>
          <CheckCircle2 size={28} style={{ color: '#22c55e' }} />
        </div>
        <h3 style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '22px', color: '#fff', margin: 0 }}>
          Strategy Submitted for Review
        </h3>
        <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: 0, maxWidth: 440, lineHeight: 1.6 }}>
          We'll reach out within 48 hours to schedule a 30-minute strategy interview and begin the TradingView verification process.
        </p>
        <div style={{
          marginTop: '0.5rem', padding: '1rem 1.5rem',
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12,
          display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', maxWidth: 380, textAlign: 'left',
        }}>
          {[
            '✓ Trade history received',
            '✓ Risk configuration saved',
            '✓ Strategy rules on file',
            '⏳ TradingView verification — pending',
            '⏳ Strategy interview — pending',
          ].map((item, i) => (
            <p key={i} style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12.5px', color: item.startsWith('✓') ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.3)', margin: 0 }}>
              {item}
            </p>
          ))}
        </div>
        <button
          onClick={() => { setSubmitted(false); setStep(1) }}
          style={{
            marginTop: '1rem',
            fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '13px',
            padding: '0.65rem 1.5rem', borderRadius: 9999,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
          }}
        >
          Submit Another Strategy
        </button>
      </div>
    )
  }

  // ── nav buttons ────────────────────────────────────────────────────────────

  function NavButtons() {
    const isLast = step === 3
    const canSubmit = tradeCountOk && form.tradeHistoryFile !== null && form.tradingviewUrl.trim() !== '' && form.strategyRules.trim() !== ''

    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={() => setStep(s => Math.max(1, s - 1))}
          disabled={step === 1}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '13px',
            padding: '0.65rem 1.25rem', borderRadius: 9999,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: step === 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)',
            cursor: step === 1 ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
          }}
        >
          <ChevronLeft size={14} /> Back
        </button>

        <button
          onClick={() => {
            if (isLast) {
              setSubmitted(true)
            } else {
              setStep(s => s + 1)
            }
          }}
          disabled={isLast && !canSubmit}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '13px',
            padding: '0.65rem 1.5rem', borderRadius: 9999,
            background: isLast
              ? canSubmit ? '#f97316' : 'rgba(255,255,255,0.06)'
              : '#f97316',
            border: 'none',
            color: isLast
              ? canSubmit ? '#fff' : 'rgba(255,255,255,0.25)'
              : '#fff',
            cursor: isLast && !canSubmit ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
            opacity: isLast && !canSubmit ? 0.7 : 1,
          }}
        >
          {isLast ? 'Submit Strategy' : 'Next'} {!isLast && <ChevronRight size={14} />}
        </button>
      </div>
    )
  }

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ background: '#000', minHeight: '100vh', display: 'flex' }}>
      <style>{`
        @media (max-width: 767px) { .trader-content { margin-left: 0 !important; padding-bottom: 70px !important; } }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { opacity: 0.3; }
      `}</style>

      {/* Background video */}
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
        style={{ position: 'fixed', top: 0, left: '-10%', width: '120%', height: '120%', objectFit: 'cover', objectPosition: 'center top', zIndex: 0 }}
      />
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'rgba(0,0,0,0.6)', pointerEvents: 'none' }} />

      <TraderSidebar activePage={activePage} onNavigate={setActivePage} user={user} />

      <div className="trader-content" style={{ position: 'relative', zIndex: 1, marginLeft: 220, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* Sticky header */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 40,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '0 2rem',
          height: 60,
          display: 'flex', alignItems: 'center',
          flexShrink: 0,
        }}>
          <div>
            <h2 style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '15px', color: '#fff', margin: 0 }}>
              Submit New Strategy
            </h2>
            <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
              Add another strategy to your portfolio
            </p>
          </div>
        </div>

        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <div style={{ maxWidth: 680, margin: '0 auto' }}>

            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              padding: '2rem',
            }}>
              {submitted ? (
                <SuccessState />
              ) : (
                <>
                  <StepIndicator current={step} total={3} />

                  {/* Step title */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '17px', color: '#fff', margin: '0 0 4px' }}>
                      {step === 1 && 'Strategy Info'}
                      {step === 2 && 'Risk Configuration'}
                      {step === 3 && 'Verification'}
                    </h3>
                    <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '12.5px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                      {step === 1 && 'Tell us what your strategy trades and how it enters positions.'}
                      {step === 2 && 'Define risk parameters for each subscriber risk mode.'}
                      {step === 3 && 'Upload your trade history so we can verify your win rate.'}
                    </p>
                  </div>

                  {step === 1 && <Step1 />}
                  {step === 2 && <Step2 />}
                  {step === 3 && <Step3 />}

                  <NavButtons />
                </>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
