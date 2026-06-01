import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { pb } from '../lib/pocketbase'
import { defaultTraderFields, TRADER_EXCHANGES, STRATEGY_TYPES, POPULAR_COINS, EXPERIENCE_OPTIONS, RR_OPTIONS, TRADER_NOTIFICATIONS } from './traderFormState'
import type { TraderFields, TraderExchange, StrategyType, Experience, RR } from './traderFormState'
import { inputStyle, labelStyle, fieldWrap, chipBase } from './formStyles'

const fadeIn = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' as const },
}

interface SharedData { name: string; email: string; whatsapp: string; telegram: string; heardFrom: string }
interface Props { onBack: () => void; onDone: () => void; badgeLabel?: string; badgeColor?: string; roleOverride?: string; sharedData?: SharedData }

export default function TraderForm({ onBack, onDone, badgeLabel, badgeColor, roleOverride, sharedData }: Props) {
  const [f, setF] = useState<TraderFields>(defaultTraderFields)
  const [contactChannel, setContactChannel] = useState<'whatsapp' | 'telegram' | null>(null)

  const set = <K extends keyof TraderFields>(k: K, v: TraderFields[K]) =>
    setF(prev => ({ ...prev, [k]: v }))

  function toggleExchange(e: TraderExchange) {
    setF(prev => ({ ...prev, exchanges: prev.exchanges.includes(e) ? prev.exchanges.filter(x => x !== e) : [...prev.exchanges, e] }))
  }
  function toggleCoin(c: string) {
    setF(prev => ({ ...prev, coins: prev.coins.includes(c) ? prev.coins.filter(x => x !== c) : [...prev.coins, c] }))
  }
  function toggleNotif(n: string) {
    setF(prev => ({ ...prev, notifications: prev.notifications.includes(n) ? prev.notifications.filter(x => x !== n) : [...prev.notifications, n] }))
  }
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const name = sharedData ? sharedData.name : f.name
    const email = sharedData ? sharedData.email : f.email
    if (!email.trim()) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      await pb.collection('waitlist').create({
        role: roleOverride ?? 'trader',
        name,
        email,
        whatsapp: (sharedData ? sharedData.whatsapp : f.whatsapp) || null,
        telegram: (sharedData ? sharedData.telegram : f.telegram) || null,
        experience: f.experience || null,
        win_rate: f.winRate,
        trade_count: f.tradeCount,
        strategy: f.strategy || null,
        trader_exchanges: f.exchanges.length ? f.exchanges : null,
        coins: f.coins.length ? f.coins : null,
        rr: f.rr || null,
        unique_edge: f.uniqueEdge || null,
        trader_notifications: f.notifications.length ? f.notifications : null,
        heard_from: (sharedData ? sharedData.heardFrom : f.heardFrom) || null,
      })
    } catch (err) {
      setSubmitting(false)
      setSubmitError('Something went wrong. Please try again.')
      console.error('Waitlist insert error:', err)
      return
    }
    setSubmitting(false)
    onDone()
  }

  // progressive reveal — skip name/email/contact/heard when sharedData provided
  const showEmail      = !sharedData && f.name.trim().length > 0
  const showContact    = !sharedData && showEmail && f.email.trim().length > 0
  const showExperience = sharedData ? true : showContact
  const showWinRate    = f.experience !== ''
  const showTradeCount = showWinRate
  const showStrategy   = showTradeCount
  const showExchanges  = f.strategy !== ''
  const showCoins      = showExchanges
  const showRR         = showCoins
  const showEdge       = f.rr !== ''
  const showNotif      = showEdge
  const showHeard      = !sharedData && showNotif
  const emailValid     = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sharedData ? sharedData.email : f.email)
  const canSubmit      = sharedData ? true : emailValid

  return (
    <div className="liquid-glass" style={{ borderRadius: '1.75rem', padding: '2.75rem 3rem', width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button type="button" onClick={onBack} style={{ alignSelf: 'flex-start', fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>← Back</button>
        <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, background: badgeColor ?? '#22C55E', color: '#fff', borderRadius: 9999, padding: '3px 10px', fontSize: '11px', alignSelf: 'flex-start' }}>{badgeLabel ?? 'Trader'}</span>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: '1.9rem', lineHeight: 1.05, letterSpacing: '-1px', margin: 0 }}>Join the waitlist.</h2>
        <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, margin: 0 }}>
          This is just the start — we'll reach out to discuss your strategy in detail.
        </p>
      </div>
      <div style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* name — hidden in both flow */}
        {!sharedData && (
          <div style={fieldWrap}>
            <label style={labelStyle}>Name</label>
            <input type="text" placeholder="Your name" value={f.name} autoFocus onChange={e => set('name', e.target.value)} className="liquid-glass" style={inputStyle} />
          </div>
        )}

        {/* email */}
        <AnimatePresence>
          {showEmail && (
            <motion.div key="email" {...fadeIn} style={fieldWrap}>
              <label style={labelStyle}>Email <span style={{ color: '#22C55E' }}>*</span></label>
              <input type="email" placeholder="your@email.com" required value={f.email} onChange={e => set('email', e.target.value)} className="liquid-glass" style={{ ...inputStyle, outline: f.email && !emailValid ? '1.5px solid #ef4444' : undefined }} />
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
              <div>
                <label style={labelStyle}>Join our community</label>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: '2px 0 0' }}>We'll add you to our trader group. Optional.</p>
              </div>
              <div style={{ display: 'flex', gap: '0.625rem' }}>
                {(['whatsapp', 'telegram'] as const).map(ch => (
                  <button key={ch} type="button"
                    onClick={() => { setContactChannel(prev => prev === ch ? null : ch); set(ch === 'whatsapp' ? 'telegram' : 'whatsapp', '') }}
                    style={{ flex: 1, borderRadius: '0.875rem', padding: '0.75rem 1rem', cursor: 'pointer', border: 'none', textAlign: 'center', transition: 'all 0.15s', background: contactChannel === ch ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.04)', outline: contactChannel === ch ? '1.5px solid #22C55E' : '1px solid rgba(255,255,255,0.1)', fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '13px', color: '#fff' }}
                  >{ch === 'whatsapp' ? 'WhatsApp' : 'Telegram'}</button>
                ))}
              </div>
              <AnimatePresence>
                {contactChannel === 'whatsapp' && <motion.input key="wa" {...fadeIn} type="text" placeholder="+1234567890" value={f.whatsapp} onChange={e => set('whatsapp', e.target.value)} className="liquid-glass" style={inputStyle} />}
                {contactChannel === 'telegram' && <motion.input key="tg" {...fadeIn} type="text" placeholder="username (without @) or +1234567890" value={f.telegram} onChange={e => set('telegram', e.target.value)} className="liquid-glass" style={inputStyle} />}
              </AnimatePresence>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* experience */}
        <AnimatePresence>
          {showExperience && (
            <motion.div key="exp" {...fadeIn} style={fieldWrap}>
              <label style={labelStyle}>Trading experience</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {EXPERIENCE_OPTIONS.map(({ val, label }) => (
                  <button key={val} type="button" onClick={() => set('experience', val as Experience)}
                    style={{ borderRadius: '0.875rem', padding: '0.75rem 1rem', cursor: 'pointer', border: 'none', transition: 'all 0.15s', background: f.experience === val ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.04)', outline: f.experience === val ? '1.5px solid #22C55E' : '1px solid rgba(255,255,255,0.1)', fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '13px', color: '#fff' }}
                  >{label}</button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* win rate */}
        <AnimatePresence>
          {showWinRate && (
            <motion.div key="wr" {...fadeIn} style={fieldWrap}>
              <label style={labelStyle}>Approximate win rate</label>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: '1.9rem', letterSpacing: '-1px' }}>{f.winRate}%</span>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>self-reported</span>
              </div>
              <div style={{ position: 'relative', height: 6, borderRadius: 9999, background: 'rgba(255,255,255,0.1)', margin: '0.25rem 0' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 9999, background: 'linear-gradient(90deg,#22C55E,#0052FF)', width: `${((f.winRate - 25) / 75) * 100}%`, pointerEvents: 'none' }} />
                <input type="range" min={25} max={100} step={1} value={f.winRate} onChange={e => set('winRate', Number(e.target.value))} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', margin: 0 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>25%</span>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>100%</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* trade count */}
        <AnimatePresence>
          {showTradeCount && (
            <motion.div key="tc" {...fadeIn} style={fieldWrap}>
              <label style={labelStyle}>Verified trades</label>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: '1.9rem', letterSpacing: '-1px' }}>{f.tradeCount >= 200 ? '200+' : f.tradeCount}</span>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>min 50 required</span>
              </div>
              <div style={{ position: 'relative', height: 6, borderRadius: 9999, background: 'rgba(255,255,255,0.1)', margin: '0.25rem 0' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 9999, background: 'linear-gradient(90deg,#22C55E,#0052FF)', width: `${((f.tradeCount - 50) / 150) * 100}%`, pointerEvents: 'none' }} />
                <input type="range" min={50} max={200} step={10} value={f.tradeCount} onChange={e => set('tradeCount', Number(e.target.value))} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', margin: 0 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>50</span>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>200+</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* strategy */}
        <AnimatePresence>
          {showStrategy && (
            <motion.div key="strat" {...fadeIn} style={fieldWrap}>
              <label style={labelStyle}>Strategy type</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {STRATEGY_TYPES.map(({ val, label }) => (
                  <button key={val} type="button" onClick={() => set('strategy', val as StrategyType)}
                    style={chipBase(f.strategy === val)}
                  >{label}</button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* exchanges */}
        <AnimatePresence>
          {showExchanges && (
            <motion.div key="exch" {...fadeIn} style={fieldWrap}>
              <label style={labelStyle}>Exchanges you trade on</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {TRADER_EXCHANGES.map(({ val, label }) => (
                  <button key={val} type="button" onClick={() => toggleExchange(val)}
                    style={chipBase(f.exchanges.includes(val))}
                  >{label}</button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* coins */}
        <AnimatePresence>
          {showCoins && (
            <motion.div key="coins" {...fadeIn} style={fieldWrap}>
              <label style={labelStyle}>Most traded coins</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {POPULAR_COINS.map(c => (
                  <button key={c} type="button" onClick={() => toggleCoin(c)}
                    style={chipBase(f.coins.includes(c))}
                  >{c}</button>
                ))}
              </div>
              <input type="text" placeholder="Add another coin and press Enter" value={f.customCoin}
                onChange={e => set('customCoin', e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && f.customCoin.trim()) { e.preventDefault(); toggleCoin(f.customCoin.trim().toUpperCase()); set('customCoin', '') } }}
                className="liquid-glass" style={{ ...inputStyle, marginTop: '0.25rem' }}
              />
              {f.coins.length > 0 && (
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                  Selected: {f.coins.join(', ')}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* RR */}
        <AnimatePresence>
          {showRR && (
            <motion.div key="rr" {...fadeIn} style={fieldWrap}>
              <label style={labelStyle}>Average risk/reward ratio</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {RR_OPTIONS.map(r => (
                  <button key={r} type="button" onClick={() => set('rr', r as RR)}
                    style={{ ...chipBase(f.rr === r), flex: 1, textAlign: 'center' }}
                  >{r}</button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* unique edge */}
        <AnimatePresence>
          {showEdge && (
            <motion.div key="edge" {...fadeIn} style={fieldWrap}>
              <label style={labelStyle}>What makes your strategy unique?</label>
              <textarea placeholder="Keep it brief — we'll discuss details in our call." value={f.uniqueEdge}
                onChange={e => set('uniqueEdge', e.target.value)} rows={3}
                className="liquid-glass"
                style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
              />
              <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.25)', margin: 0 }}>
                This is just the waitlist — we'll connect with you soon to go through everything.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* notifications */}
        <AnimatePresence>
          {showNotif && (
            <motion.div key="notif" {...fadeIn} style={fieldWrap}>
              <label style={labelStyle}>How should we notify you?</label>
              <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
                {TRADER_NOTIFICATIONS.map(({ val, label, sub }) => {
                  const active = f.notifications.includes(val)
                  return (
                    <button key={val} type="button" onClick={() => toggleNotif(val)}
                      style={{ borderRadius: '0.875rem', padding: '0.75rem 1rem', cursor: 'pointer', border: 'none', textAlign: 'left', transition: 'all 0.15s', background: active ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.04)', outline: active ? '1.5px solid #22C55E' : '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '13px', color: '#fff', margin: 0 }}>{label}</p>
                      <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: '2px 0 0' }}>{sub}</p>
                    </button>
                  )
                })}
              </div>
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

        {submitError && (
          <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '13px', color: '#ef4444', margin: 0, textAlign: 'center' }}>{submitError}</p>
        )}

        {/* submit */}
        <AnimatePresence>
          {canSubmit && (
            <motion.button key="submit" {...fadeIn} type="submit" disabled={submitting}
              style={{ marginTop: '0.25rem', fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '15px', background: '#22C55E', color: '#fff', borderRadius: 9999, padding: '13px 24px', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              {submitting ? 'Joining…' : <>'Join Waitlist' <ArrowUpRight size={15} /></>}
            </motion.button>
          )}
        </AnimatePresence>
      </form>
      <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.2)', textAlign: 'center', margin: 0 }}>No credit card. No commitment. Just early access.</p>
    </div>
  )
}
