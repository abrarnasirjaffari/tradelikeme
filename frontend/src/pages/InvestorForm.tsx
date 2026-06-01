import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { pb } from '../lib/pocketbase'
import { defaultInvestorFields, FRUSTRATIONS } from './investorFormState'
import type { InvestorFields, Exchange } from './investorFormState'
import { inputStyle, labelStyle, fieldWrap, chipBase } from './formStyles'
import DepositSlider from './DepositSlider'
import ModePicker from './ModePicker'

interface SharedData { name: string; email: string; whatsapp: string; telegram: string; heardFrom: string }
interface Props {
  onBack: () => void
  onDone: (shared?: SharedData) => void
  badgeLabel?: string
  badgeColor?: string
  roleOverride?: string
}

export default function InvestorForm({ onBack, onDone, badgeLabel, badgeColor, roleOverride }: Props) {
  const [f, setF] = useState<InvestorFields>(defaultInvestorFields)
  const [contactChannel, setContactChannel] = useState<'whatsapp' | 'telegram' | null>(null)

  const set = <K extends keyof InvestorFields>(k: K, v: InvestorFields[K]) =>
    setF(prev => ({ ...prev, [k]: v }))

  function toggleExchange(e: Exchange) {
    setF(prev => ({
      ...prev,
      exchanges: prev.exchanges.includes(e)
        ? prev.exchanges.filter(x => x !== e)
        : [...prev.exchanges, e],
    }))
  }


  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!f.email.trim()) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      await pb.collection('waitlist').create({
        role: roleOverride ?? 'investor',
        name: f.name,
        email: f.email,
        whatsapp: f.whatsapp || null,
        telegram: f.telegram || null,
        deposit_amount: f.depositAmount,
        mode: f.mode || null,
        exchanges: f.exchanges.length ? f.exchanges : null,
        other_exchange: f.otherExchange || null,
        notifications: f.notifications.length ? f.notifications : null,
        heard_from: f.heardFrom || null,
        frustration: f.frustration || null,
        country: f.country || null,
      })
    } catch (err) {
      setSubmitting(false)
      setSubmitError('Something went wrong. Please try again.')
      console.error('Waitlist insert error:', err)
      return
    }
    setSubmitting(false)
    onDone({ name: f.name, email: f.email, whatsapp: f.whatsapp, telegram: f.telegram, heardFrom: f.heardFrom })
  }

  const emailValid   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)
  const canSubmit    = emailValid

  return (
    <div className="liquid-glass"
      style={{ borderRadius: '1.75rem', padding: '2.75rem 3rem', width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
    >
      {/* header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: '1.9rem', lineHeight: 1.05, letterSpacing: '-1px', margin: 0 }}>
          Join the waitlist.
        </h2>
        <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, margin: 0 }}>
          We're launching soon. You can change all of this anytime.
        </p>
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* name */}
        <div style={fieldWrap}>
          <label style={labelStyle}>Name</label>
          <input type="text" placeholder="Your name" value={f.name} autoFocus
            onChange={e => set('name', e.target.value)}
            className="liquid-glass" style={inputStyle}
          />
        </div>

        {/* email */}
        <div style={fieldWrap}>
          <label style={labelStyle}>Email <span style={{ color: '#0052FF' }}>*</span></label>
          <input type="email" placeholder="your@email.com" required value={f.email}
            onChange={e => set('email', e.target.value)}
            className="liquid-glass" style={{ ...inputStyle, outline: f.email && !emailValid ? '1.5px solid #ef4444' : undefined }}
          />
          {f.email && !emailValid && (
            <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: '#ef4444', margin: 0 }}>Enter a valid email address.</p>
          )}
        </div>

        {/* community contact */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={labelStyle}>Join our community</label>
            <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
              We'll add you to our group and send trade alerts. Optional.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.625rem' }}>
            {(['whatsapp', 'telegram'] as const).map(ch => (
              <button key={ch} type="button"
                onClick={() => {
                  setContactChannel(prev => prev === ch ? null : ch)
                  set(ch === 'whatsapp' ? 'telegram' : 'whatsapp', '')
                }}
                style={{
                  flex: 1, borderRadius: '0.875rem', padding: '0.75rem 1rem',
                  cursor: 'pointer', border: 'none', textAlign: 'center',
                  transition: 'all 0.15s',
                  background: contactChannel === ch ? 'rgba(0,82,255,0.15)' : 'rgba(255,255,255,0.04)',
                  outline: contactChannel === ch ? '1.5px solid #0052FF' : '1px solid rgba(255,255,255,0.1)',
                  fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '13px', color: '#fff',
                }}
              >
                {ch === 'whatsapp' ? 'WhatsApp' : 'Telegram'}
              </button>
            ))}
          </div>
          {contactChannel === 'whatsapp' && (
            <input type="text" placeholder="+1234567890" value={f.whatsapp}
              onChange={e => set('whatsapp', e.target.value)}
              className="liquid-glass" style={inputStyle}
            />
          )}
          {contactChannel === 'telegram' && (
            <input type="text" placeholder="username (without @) or +1234567890" value={f.telegram}
              onChange={e => set('telegram', e.target.value)}
              className="liquid-glass" style={inputStyle}
            />
          )}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />
        </div>

        {/* deposit */}
        <DepositSlider value={f.depositAmount} onChange={v => set('depositAmount', v)} />

        {/* mode */}
        <ModePicker
          mode={f.mode}
          exchanges={f.exchanges}
          otherExchange={f.otherExchange}
          onMode={m => set('mode', m)}
          onToggleExchange={toggleExchange}
          onOther={v => set('otherExchange', v)}
        />

        {/* heard from */}
        <div style={fieldWrap}>
          <label style={labelStyle}>How did you hear about us?</label>
          <input type="text" placeholder="Twitter, friend, Telegram…" value={f.heardFrom}
            onChange={e => set('heardFrom', e.target.value)}
            className="liquid-glass" style={inputStyle}
          />
        </div>

        {/* frustration */}
        <div style={fieldWrap}>
          <label style={labelStyle}>Biggest frustration with trading?</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {FRUSTRATIONS.map(opt => (
              <button key={opt} type="button" onClick={() => set('frustration', opt)}
                style={chipBase(f.frustration === opt)}
              >{opt}</button>
            ))}
          </div>
        </div>

        {/* country */}
        <div style={fieldWrap}>
          <label style={labelStyle}>Country</label>
          <input type="text" placeholder="Your country" value={f.country}
            onChange={e => set('country', e.target.value)}
            className="liquid-glass" style={inputStyle}
          />
        </div>

        {submitError && (
          <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '13px', color: '#ef4444', margin: 0, textAlign: 'center' }}>{submitError}</p>
        )}

        {/* submit */}
        <button type="submit" disabled={submitting || !canSubmit}
          style={{
            marginTop: '0.25rem', fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '15px',
            background: '#0052FF', color: '#fff', borderRadius: 9999, padding: '13px 24px',
            border: 'none', cursor: submitting || !canSubmit ? 'not-allowed' : 'pointer', opacity: submitting || !canSubmit ? 0.5 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          {submitting ? 'Joining…' : <>'Join Waitlist' <ArrowUpRight size={15} /></>}
        </button>

      </form>

      <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.2)', textAlign: 'center', margin: 0 }}>
        No credit card. No commitment. Just early access.
      </p>
    </div>
  )
}
