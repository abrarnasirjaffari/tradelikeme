import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { inputStyle, labelStyle, fieldWrap, chipBase } from './formStyles'

const fade = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' as const },
}

const TIMEFRAMES = ['1m','5m','15m','30m','1H','4H','1D','1W']
const STRATEGY_TYPES = ['Supply & Demand','Support & Resistance','Price Action','Trend Following','Scalping','Swing Trading','Breakout','Mean Reversion','ICT / SMC','Other']
const EXCHANGES = ['Binance','Bybit','WEEX','OKX','Bitget','BingX','Kraken','Coinbase','Other']
const COINS = ['BTC','ETH','SOL','XRP','BNB','ADA','DOGE','DOT','LINK','UNI','AAVE','SUI','TAO','WIF','BRETT']
const RR_OPTIONS = ['1:1','1:1.5','1:2','1:2.5','1:3','1:3+']
const ASSET_CLASSES = ['Crypto Perps','Crypto Spot','Forex','Stocks','Indices','Commodities']
const SESSION_OPTIONS = ['Asia','London','New York','24/7 (no preference)']

type Fields = {
  name: string; username: string; email: string; telegram: string; whatsapp: string
  experience: string; winRate: number; tradeCount: number
  strategyType: string; timeframes: string[]; assetClasses: string[]
  exchanges: string[]; coins: string[]; customCoin: string
  rr: string; sessions: string[]; avgHoldTime: string
  entryRules: string; slRules: string; tpRules: string
  uniqueEdge: string; tvLink: string; heardFrom: string
}

const defaults: Fields = {
  name: '', username: '', email: '', telegram: '', whatsapp: '',
  experience: '', winRate: 60, tradeCount: 50,
  strategyType: '', timeframes: [], assetClasses: [],
  exchanges: [], coins: [], customCoin: '',
  rr: '', sessions: [], avgHoldTime: '',
  entryRules: '', slRules: '', tpRules: '',
  uniqueEdge: '', tvLink: '', heardFrom: '',
}

export default function SubmitStrategyForm() {
  const [f, setF] = useState<Fields>(defaults)
  const [contactChannels, setContactChannels] = useState<('telegram' | 'whatsapp')[]>([])
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'taken' | 'available'>('idle')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = <K extends keyof Fields>(k: K, v: Fields[K]) =>
    setF(p => ({ ...p, [k]: v }))

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleUsernameChange(val: string) {
    const cleaned = val.toLowerCase().replace(/[^a-z0-9_]/g, '')
    set('username', cleaned)
    setUsernameStatus('idle')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!/^[a-z0-9_]{3,20}$/.test(cleaned)) return
    setUsernameStatus('checking')
    debounceRef.current = setTimeout(async () => {
      const { data } = await supabase
        .from('strategy_submissions')
        .select('username')
        .eq('username', cleaned)
        .maybeSingle()
      setUsernameStatus(data ? 'taken' : 'available')
    }, 500)
  }

  function toggle(k: 'timeframes' | 'assetClasses' | 'exchanges' | 'coins' | 'sessions', val: string) {
    setF(p => ({ ...p, [k]: p[k].includes(val) ? p[k].filter(x => x !== val) : [...p[k], val] }))
  }

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!emailValid) return
    setSubmitting(true); setError(null)
    const { error: err } = await supabase.from('strategy_submissions').insert({
      name: f.name, username: f.username || null, email: f.email, telegram: f.telegram || null, whatsapp: f.whatsapp || null,
      experience: f.experience || null, win_rate: f.winRate, trade_count: f.tradeCount,
      strategy_type: f.strategyType || null, timeframes: f.timeframes.length ? f.timeframes : null,
      asset_classes: f.assetClasses.length ? f.assetClasses : null,
      exchanges: f.exchanges.length ? f.exchanges : null,
      coins: f.coins.length ? f.coins : null,
      rr: f.rr || null, sessions: f.sessions.length ? f.sessions : null,
      avg_hold_time: f.avgHoldTime || null,
      entry_rules: f.entryRules || null, sl_rules: f.slRules || null, tp_rules: f.tpRules || null,
      unique_edge: f.uniqueEdge || null, tv_link: f.tvLink || null,
      heard_from: f.heardFrom || null,
    })
    setSubmitting(false)
    if (err) { setError('Something went wrong. Please try again.'); return }
    setSubmitted(true)
  }

  if (submitted) return (
    <motion.div {...fade} className="liquid-glass"
      style={{ borderRadius: '1.75rem', padding: '3.5rem', maxWidth: 460, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', textAlign: 'center' }}
    >
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Check size={26} color="#22C55E" />
      </div>
      <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: '2rem', letterSpacing: '-1px', lineHeight: 1.1, margin: 0 }}>
        Application received.
      </h2>
      <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, maxWidth: '36ch', margin: 0 }}>
        We'll review your strategy and reach out within 3–5 days to schedule a verification call.
      </p>
    </motion.div>
  )

  // progressive reveal
  const show2 = f.name.trim().length > 0
  const usernameValid = /^[a-z0-9_]{3,20}$/.test(f.username) && usernameStatus !== 'taken'
  const show25 = show2 && usernameValid
  const show3 = show25 && emailValid
  const show4 = show3
  const show5 = f.experience !== ''
  const show6 = show5
  const show7 = show6
  const show8 = f.strategyType !== ''
  const show9 = show8
  const show10 = show9
  const show11 = show10
  const show12 = f.rr !== ''
  const show13 = show12
  const show14 = show13
  const show15 = show14
  const show16 = show15
  const hasContact = (contactChannels.includes('telegram') && f.telegram.trim().length > 0) ||
                     (contactChannels.includes('whatsapp') && f.whatsapp.trim().length > 0)
  const canSubmit = emailValid && hasContact && f.entryRules.trim().length > 10

  return (
    <div className="liquid-glass" style={{ borderRadius: '1.75rem', padding: '2.75rem 3rem', width: '100%', maxWidth: 540, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, background: '#0052FF', color: '#fff', borderRadius: 9999, padding: '3px 10px', fontSize: '11px', alignSelf: 'flex-start' }}>Strategy Submission</span>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: '1.9rem', lineHeight: 1.05, letterSpacing: '-1px', margin: 0 }}>Submit your strategy.</h2>
        <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, margin: 0 }}>
          We verify every strategy before listing it. 50+ trades and 55%+ win rate required.
        </p>
      </div>
      <div style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Name */}
        <div style={fieldWrap}>
          <label style={labelStyle}>Full name</label>
          <input autoFocus type="text" placeholder="Your name" value={f.name} onChange={e => set('name', e.target.value)} className="liquid-glass" style={inputStyle} />
        </div>

        {/* Username */}
        <AnimatePresence>
          {show2 && (
            <motion.div key="username" {...fade} style={fieldWrap}>
              <label style={labelStyle}>Username <span style={{ color: '#0052FF' }}>*</span></label>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: '0 0 4px' }}>Lowercase letters, numbers, underscores. 3–20 chars. This is your public trader handle.</p>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: 14, fontFamily: "'Barlow', sans-serif", fontSize: '14px', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }}>@</span>
                <input type="text" placeholder="your_handle" value={f.username}
                  onChange={e => handleUsernameChange(e.target.value)}
                  className="liquid-glass"
                  style={{ ...inputStyle, paddingLeft: 28, outline: usernameStatus === 'taken' ? '1.5px solid #ef4444' : usernameStatus === 'available' ? '1.5px solid #22C55E' : undefined }}
                />
                {usernameStatus === 'checking' && (
                  <span style={{ position: 'absolute', right: 14, fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>checking…</span>
                )}
                {usernameStatus === 'available' && (
                  <span style={{ position: 'absolute', right: 14, fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: '#22C55E' }}>✓ available</span>
                )}
                {usernameStatus === 'taken' && (
                  <span style={{ position: 'absolute', right: 14, fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: '#ef4444' }}>✗ taken</span>
                )}
              </div>
              {f.username && usernameStatus === 'taken' && (
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: '#ef4444', margin: 0 }}>That username is already taken. Try another.</p>
              )}
              {f.username && usernameStatus === 'idle' && !/^[a-z0-9_]{3,20}$/.test(f.username) && (
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: '#ef4444', margin: 0 }}>3–20 chars, lowercase letters/numbers/underscores only.</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email */}
        <AnimatePresence>
          {show25 && (
            <motion.div key="email" {...fade} style={fieldWrap}>
              <label style={labelStyle}>Email <span style={{ color: '#0052FF' }}>*</span></label>
              <input type="email" placeholder="your@email.com" value={f.email} onChange={e => set('email', e.target.value)} className="liquid-glass" style={{ ...inputStyle, outline: f.email && !emailValid ? '1.5px solid #ef4444' : undefined }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contact */}
        <AnimatePresence>
          {show3 && (
            <motion.div key="contact" {...fade} style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />
              <label style={labelStyle}>Contact <span style={{ color: '#0052FF' }}>*</span> <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— at least one required</span></label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {(['telegram', 'whatsapp'] as const).map(ch => {
                  const selected = contactChannels.includes(ch)
                  return (
                    <button key={ch} type="button"
                      onClick={() => setContactChannels(prev => prev.includes(ch) ? prev.filter(x => x !== ch) : [...prev, ch])}
                      style={{ flex: 1, borderRadius: '0.875rem', padding: '0.75rem 1rem', cursor: 'pointer', border: 'none', textAlign: 'center', transition: 'all 0.15s', background: selected ? 'rgba(0,82,255,0.15)' : 'rgba(255,255,255,0.04)', outline: selected ? '1.5px solid #0052FF' : '1px solid rgba(255,255,255,0.1)', fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '13px', color: selected ? '#fff' : 'rgba(255,255,255,0.5)' }}
                    >{ch === 'telegram' ? 'Telegram' : 'WhatsApp'}</button>
                  )
                })}
              </div>
              <AnimatePresence>
                {contactChannels.includes('telegram') && (
                  <motion.input key="tg" {...fade} type="text" placeholder="@username or +1234567890" value={f.telegram} onChange={e => set('telegram', e.target.value)} className="liquid-glass" style={inputStyle} />
                )}
                {contactChannels.includes('whatsapp') && (
                  <motion.input key="wa" {...fade} type="text" placeholder="+1234567890" value={f.whatsapp} onChange={e => set('whatsapp', e.target.value)} className="liquid-glass" style={inputStyle} />
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Experience */}
        <AnimatePresence>
          {show4 && (
            <motion.div key="exp" {...fade} style={fieldWrap}>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: '0.25rem' }} />
              <label style={labelStyle}>Years trading</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {['< 1 year','1–2 years','2–5 years','5+ years'].map(v => (
                  <button key={v} type="button" onClick={() => set('experience', v)} style={chipBase(f.experience === v)}>{v}</button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Win rate */}
        <AnimatePresence>
          {show5 && (
            <motion.div key="wr" {...fade} style={fieldWrap}>
              <label style={labelStyle}>Approximate win rate</label>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: '1.9rem', letterSpacing: '-1px' }}>{f.winRate}%</span>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>self-reported</span>
              </div>
              <div style={{ position: 'relative', height: 6, borderRadius: 9999, background: 'rgba(255,255,255,0.1)', margin: '0.25rem 0' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 9999, background: 'linear-gradient(90deg,#0052FF,#22C55E)', width: `${((f.winRate - 25) / 75) * 100}%`, pointerEvents: 'none' }} />
                <input type="range" min={25} max={100} step={1} value={f.winRate} onChange={e => set('winRate', Number(e.target.value))} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', margin: 0 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>25%</span>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>100%</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trade count */}
        <AnimatePresence>
          {show6 && (
            <motion.div key="tc" {...fade} style={fieldWrap}>
              <label style={labelStyle}>Verified trades</label>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: '1.9rem', letterSpacing: '-1px' }}>{f.tradeCount >= 300 ? '300+' : f.tradeCount}</span>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>min 50 required</span>
              </div>
              <div style={{ position: 'relative', height: 6, borderRadius: 9999, background: 'rgba(255,255,255,0.1)', margin: '0.25rem 0' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 9999, background: 'linear-gradient(90deg,#0052FF,#22C55E)', width: `${((f.tradeCount - 50) / 250) * 100}%`, pointerEvents: 'none' }} />
                <input type="range" min={50} max={300} step={10} value={f.tradeCount} onChange={e => set('tradeCount', Number(e.target.value))} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', margin: 0 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>50</span>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>300+</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Strategy type */}
        <AnimatePresence>
          {show7 && (
            <motion.div key="stype" {...fade} style={fieldWrap}>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: '0.25rem' }} />
              <label style={labelStyle}>Strategy type</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {STRATEGY_TYPES.map(v => (
                  <button key={v} type="button" onClick={() => set('strategyType', v)} style={chipBase(f.strategyType === v)}>{v}</button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timeframes */}
        <AnimatePresence>
          {show8 && (
            <motion.div key="tf" {...fade} style={fieldWrap}>
              <label style={labelStyle}>Timeframes used</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {TIMEFRAMES.map(v => (
                  <button key={v} type="button" onClick={() => toggle('timeframes', v)} style={chipBase(f.timeframes.includes(v))}>{v}</button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Asset classes */}
        <AnimatePresence>
          {show9 && (
            <motion.div key="assets" {...fade} style={fieldWrap}>
              <label style={labelStyle}>Asset classes</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {ASSET_CLASSES.map(v => (
                  <button key={v} type="button" onClick={() => toggle('assetClasses', v)} style={chipBase(f.assetClasses.includes(v))}>{v}</button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Exchanges */}
        <AnimatePresence>
          {show10 && (
            <motion.div key="exch" {...fade} style={fieldWrap}>
              <label style={labelStyle}>Exchanges you trade on</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {EXCHANGES.map(v => (
                  <button key={v} type="button" onClick={() => toggle('exchanges', v)} style={chipBase(f.exchanges.includes(v))}>{v}</button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Coins */}
        <AnimatePresence>
          {show10 && (
            <motion.div key="coins" {...fade} style={fieldWrap}>
              <label style={labelStyle}>Most traded coins</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {COINS.map(v => (
                  <button key={v} type="button" onClick={() => toggle('coins', v)} style={chipBase(f.coins.includes(v))}>{v}</button>
                ))}
              </div>
              <input type="text" placeholder="Add another and press Enter" value={f.customCoin}
                onChange={e => set('customCoin', e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && f.customCoin.trim()) { e.preventDefault(); toggle('coins', f.customCoin.trim().toUpperCase()); set('customCoin', '') } }}
                className="liquid-glass" style={{ ...inputStyle, marginTop: '0.25rem' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* RR */}
        <AnimatePresence>
          {show11 && (
            <motion.div key="rr" {...fade} style={fieldWrap}>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: '0.25rem' }} />
              <label style={labelStyle}>Average risk/reward ratio</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {RR_OPTIONS.map(v => (
                  <button key={v} type="button" onClick={() => set('rr', v)} style={{ ...chipBase(f.rr === v), flex: 1, textAlign: 'center' }}>{v}</button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sessions */}
        <AnimatePresence>
          {show12 && (
            <motion.div key="sess" {...fade} style={fieldWrap}>
              <label style={labelStyle}>Trading sessions</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {SESSION_OPTIONS.map(v => (
                  <button key={v} type="button" onClick={() => toggle('sessions', v)} style={chipBase(f.sessions.includes(v))}>{v}</button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hold time */}
        <AnimatePresence>
          {show13 && (
            <motion.div key="hold" {...fade} style={fieldWrap}>
              <label style={labelStyle}>Average hold time per trade</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {['< 1 hour','1–4 hours','4–24 hours','1–3 days','3–7 days','1 week+'].map(v => (
                  <button key={v} type="button" onClick={() => set('avgHoldTime', v)} style={chipBase(f.avgHoldTime === v)}>{v}</button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Entry rules */}
        <AnimatePresence>
          {show14 && (
            <motion.div key="entry" {...fade} style={fieldWrap}>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: '0.25rem' }} />
              <label style={labelStyle}>Entry rules <span style={{ color: '#0052FF' }}>*</span></label>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: '0 0 4px' }}>What exact conditions must be met to enter a trade?</p>
              <textarea rows={4} placeholder="e.g. Wait for price to return to 4H demand zone, confirm with 15m engulfing candle, BTC must be above 200 EMA…" value={f.entryRules} onChange={e => set('entryRules', e.target.value)} className="liquid-glass" style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* SL rules */}
        <AnimatePresence>
          {show15 && (
            <motion.div key="sl" {...fade} style={fieldWrap}>
              <label style={labelStyle}>Stop loss rules</label>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: '0 0 4px' }}>How and where do you place your stop loss?</p>
              <textarea rows={3} placeholder="e.g. SL below structural low. Body close only — wicks ignored. Hard SL at structural + 3% buffer on exchange." value={f.slRules} onChange={e => set('slRules', e.target.value)} className="liquid-glass" style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* TP rules */}
        <AnimatePresence>
          {show15 && (
            <motion.div key="tp" {...fade} style={fieldWrap}>
              <label style={labelStyle}>Take profit rules</label>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: '0 0 4px' }}>Where do you take profit and how do you scale out?</p>
              <textarea rows={3} placeholder="e.g. TP1 at zone 1 (50% qty), move SL to entry. TP2 at zone 2 (remaining). Never use zone 3–4." value={f.tpRules} onChange={e => set('tpRules', e.target.value)} className="liquid-glass" style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unique edge */}
        <AnimatePresence>
          {show16 && (
            <motion.div key="edge" {...fade} style={fieldWrap}>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: '0.25rem' }} />
              <label style={labelStyle}>What makes your strategy unique?</label>
              <textarea rows={3} placeholder="What's your edge that most traders miss?" value={f.uniqueEdge} onChange={e => set('uniqueEdge', e.target.value)} className="liquid-glass" style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* TradingView link */}
        <AnimatePresence>
          {show16 && (
            <motion.div key="tv" {...fade} style={fieldWrap}>
              <label style={labelStyle}>TradingView chart link (optional)</label>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: '0 0 4px' }}>Share a published chart or screenshot link showing your trades.</p>
              <input type="url" placeholder="https://tradingview.com/chart/…" value={f.tvLink} onChange={e => set('tvLink', e.target.value)} className="liquid-glass" style={inputStyle} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Heard from */}
        <AnimatePresence>
          {show16 && (
            <motion.div key="heard" {...fade} style={fieldWrap}>
              <label style={labelStyle}>How did you hear about us?</label>
              <input type="text" placeholder="Twitter, Telegram, friend…" value={f.heardFrom} onChange={e => set('heardFrom', e.target.value)} className="liquid-glass" style={inputStyle} />
            </motion.div>
          )}
        </AnimatePresence>

        {error && <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '13px', color: '#ef4444', margin: 0, textAlign: 'center' }}>{error}</p>}

        <AnimatePresence>
          {canSubmit && (
            <motion.button key="sub" {...fade} type="submit" disabled={submitting}
              style={{ marginTop: '0.25rem', fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '15px', background: '#0052FF', color: '#fff', borderRadius: 9999, padding: '13px 24px', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              {submitting ? 'Submitting…' : <>'Submit Strategy' <ArrowUpRight size={15} /></>}
            </motion.button>
          )}
        </AnimatePresence>
      </form>
      <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.2)', textAlign: 'center', margin: 0 }}>We review every submission within 3–5 days.</p>
    </div>
  )
}
