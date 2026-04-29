import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { defaultInvestorFields, FRUSTRATIONS } from './investorFormState'
import type { InvestorFields, Exchange, Notification } from './investorFormState'
import { inputStyle, labelStyle, fieldWrap, chipBase } from './formStyles'
import DepositSlider from './DepositSlider'
import ModePicker from './ModePicker'
import NotificationPicker from './NotificationPicker'

const fadeIn = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' },
}

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

  function toggleNotif(n: Notification) {
    setF(prev => ({
      ...prev,
      notifications: prev.notifications.includes(n)
        ? prev.notifications.filter(x => x !== n)
        : [...prev.notifications, n],
    }))
  }

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!f.email.trim()) return
    setSubmitting(true)
    setSubmitError(null)
    const { error } = await supabase.from('waitlist').insert({
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
    setSubmitting(false)
    if (error) {
      setSubmitError('Something went wrong. Please try again.')
      console.error('Waitlist insert error:', error)
      return
    }
    onDone({ name: f.name, email: f.email, whatsapp: f.whatsapp, telegram: f.telegram, heardFrom: f.heardFrom })
  }

  // progressive reveal
  const showEmail    = f.name.trim().length > 0
  const showContact  = showEmail && f.email.trim().length > 0
  const showDeposit  = showContact
  const showMode     = showDeposit
  const showNotif    = showMode && f.mode !== ''
  const showHeard    = showNotif
  const showFrust    = f.heardFrom !== ''
  const showCountry  = f.frustration !== ''
  const emailValid   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)
  const canSubmit    = emailValid

  return (
    <div className="liquid-glass"
      style={{ borderRadius: '1.75rem', padding: '2.75rem 3rem', width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
    >
      {/* header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button type="button" onClick={onBack}
          style={{ alignSelf: 'flex-start', fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >← Back</button>
        <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, background: badgeColor ?? '#0052FF', color: '#fff', borderRadius: 9999, padding: '3px 10px', fontSize: '11px', alignSelf: 'flex-start' }}>{badgeLabel ?? 'Investor'}</span>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: '1.9rem', lineHeight: 1.05, letterSpacing: '-1px', margin: 0 }}>
          Join the waitlist.
        </h2>
        <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, margin: 0 }}>
          Be first when TradeLikeMe launches. You can change all of this anytime.
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
        <AnimatePresence>
          {showEmail && (
            <motion.div key="email" {...fadeIn} style={fieldWrap}>
              <label style={labelStyle}>Email <span style={{ color: '#0052FF' }}>*</span></label>
              <input type="email" placeholder="your@email.com" required value={f.email}
                onChange={e => set('email', e.target.value)}
                className="liquid-glass" style={{ ...inputStyle, outline: f.email && !emailValid ? '1.5px solid #ef4444' : undefined }}
              />
              {f.email && !emailValid && (
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: '#ef4444', margin: 0 }}>Enter a valid email address.</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* community contact */}
        <AnimatePresence>
          {showContact && (
            <motion.div key="contact" {...fadeIn} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={labelStyle}>Join our community</label>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                  We'll add you to our group and send trade alerts. Optional.
                </p>
              </div>
              {/* channel toggle */}
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
              {/* input reveals on selection */}
              <AnimatePresence>
                {contactChannel === 'whatsapp' && (
                  <motion.input key="wa" {...fadeIn} type="text"
                    placeholder="+1234567890"
                    value={f.whatsapp}
                    onChange={e => set('whatsapp', e.target.value)}
                    className="liquid-glass" style={inputStyle}
                  />
                )}
                {contactChannel === 'telegram' && (
                  <motion.input key="tg" {...fadeIn} type="text"
                    placeholder="username (without @) or +1234567890"
                    value={f.telegram}
                    onChange={e => set('telegram', e.target.value)}
                    className="liquid-glass" style={inputStyle}
                  />
                )}
              </AnimatePresence>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* deposit */}
        <AnimatePresence>
          {showDeposit && (
            <motion.div key="deposit" {...fadeIn}>
              <DepositSlider value={f.depositAmount} onChange={v => set('depositAmount', v)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* mode */}
        <AnimatePresence>
          {showMode && (
            <motion.div key="mode" {...fadeIn}>
              <ModePicker
                mode={f.mode}
                exchanges={f.exchanges}
                otherExchange={f.otherExchange}
                onMode={m => set('mode', m)}
                onToggleExchange={toggleExchange}
                onOther={v => set('otherExchange', v)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* notifications */}
        <AnimatePresence>
          {showNotif && (
            <motion.div key="notif" {...fadeIn}>
              <NotificationPicker
                selected={f.notifications}
                onToggle={toggleNotif}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* heard from */}
        <AnimatePresence>
          {showHeard && (
            <motion.div key="heard" {...fadeIn} style={fieldWrap}>
              <label style={labelStyle}>How did you hear about us?</label>
              <input type="text" placeholder="Twitter, friend, Telegram…" value={f.heardFrom}
                onChange={e => set('heardFrom', e.target.value)}
                className="liquid-glass" style={inputStyle}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* frustration */}
        <AnimatePresence>
          {showFrust && (
            <motion.div key="frust" {...fadeIn} style={fieldWrap}>
              <label style={labelStyle}>Biggest frustration with trading?</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {FRUSTRATIONS.map(opt => (
                  <button key={opt} type="button" onClick={() => set('frustration', opt)}
                    style={chipBase(f.frustration === opt)}
                  >{opt}</button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* country */}
        <AnimatePresence>
          {showCountry && (
            <motion.div key="country" {...fadeIn} style={fieldWrap}>
              <label style={labelStyle}>Country</label>
              <input type="text" placeholder="Your country" value={f.country}
                onChange={e => set('country', e.target.value)}
                className="liquid-glass" style={inputStyle}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {submitError && (
          <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '13px', color: '#ef4444', margin: 0, textAlign: 'center' }}>{submitError}</p>
        )}

        {/* submit */}
        <AnimatePresence>
          {canSubmit && (
            <motion.button key="submit" {...fadeIn} type="submit" disabled={submitting}
              style={{
                marginTop: '0.25rem', fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '15px',
                background: '#0052FF', color: '#fff', borderRadius: 9999, padding: '13px 24px',
                border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              {submitting ? 'Joining…' : <>'Join Waitlist' <ArrowUpRight size={15} /></>}
            </motion.button>
          )}
        </AnimatePresence>

      </form>

      <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.2)', textAlign: 'center', margin: 0 }}>
        No credit card. No commitment. Just early access.
      </p>
    </div>
  )
}
