import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { defaultContributorFields, ROLES, EXPERIENCE_OPTIONS, AREAS } from './contributorFormState'
import type { ContributorFields } from './contributorFormState'
import { inputStyle, labelStyle, fieldWrap, chipBase } from './formStyles'
import { supabase } from '../lib/supabase'

const fadeIn = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' },
}

interface Props { onBack: () => void; onDone: () => void }

export default function ContributorForm({ onBack, onDone }: Props) {
  const [f, setF] = useState<ContributorFields>(defaultContributorFields)
  const [contactChannel, setContactChannel] = useState<'whatsapp' | 'telegram' | null>(null)

  const set = <K extends keyof ContributorFields>(k: K, v: ContributorFields[K]) =>
    setF(prev => ({ ...prev, [k]: v }))

  function toggleArea(a: string) {
    setF(prev => ({
      ...prev,
      areas: prev.areas.includes(a) ? prev.areas.filter(x => x !== a) : [...prev.areas, a],
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
      role: 'contributor',
      name: f.name,
      email: f.email,
      github: f.github || null,
      contributor_role: f.role === 'other' ? (f.customRole || 'other') : (f.role || null),
      experience: f.experience || null,
      contribution_areas: f.areas.length ? f.areas : null,
      anything_else: f.anythingElse || null,
      open_source_before: f.openSource || null,
      whatsapp: f.whatsapp || null,
      telegram: f.telegram || null,
      heard_from: f.heardFrom || null,
    })
    setSubmitting(false)
    if (error) {
      setSubmitError('Something went wrong. Please try again.')
      console.error('Waitlist insert error:', error)
      return
    }
    onDone()
  }

  // progressive reveal
  const showEmail      = f.name.trim().length > 0
  const emailValid     = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)
  const showGithub     = showEmail && emailValid
  const showRole       = showGithub
  const showCustomRole = f.role === 'other'
  const roleComplete   = f.role !== '' && (f.role !== 'other' || f.customRole.trim().length > 0)
  const showExperience = roleComplete
  const showAreas      = f.experience !== ''
  const showOpenSource = showAreas
  const showAnything   = f.openSource !== ''
  const showContact    = showAnything
  const showHeard      = showContact
  const canSubmit      = emailValid

  return (
    <div className="liquid-glass"
      style={{ borderRadius: '1.75rem', padding: '2.75rem 3rem', width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
    >
      {/* header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button type="button" onClick={onBack}
          style={{ alignSelf: 'flex-start', fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >← Back</button>
        <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, background: '#F59E0B', color: '#000', borderRadius: 9999, padding: '3px 10px', fontSize: '11px', alignSelf: 'flex-start' }}>Contributor</span>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: '1.9rem', lineHeight: 1.05, letterSpacing: '-1px', margin: 0 }}>
          Join the waitlist.
        </h2>
        <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, margin: 0 }}>
          Code drops on 9 May 2026. Be first to know and start contributing from day one.
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
              <label style={labelStyle}>Email <span style={{ color: '#F59E0B' }}>*</span></label>
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

        {/* github */}
        <AnimatePresence>
          {showGithub && (
            <motion.div key="github" {...fadeIn} style={fieldWrap}>
              <label style={labelStyle}>GitHub username</label>
              <input type="text" placeholder="@username" value={f.github}
                onChange={e => set('github', e.target.value)}
                className="liquid-glass" style={inputStyle}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* role */}
        <AnimatePresence>
          {showRole && (
            <motion.div key="role" {...fadeIn} style={fieldWrap}>
              <label style={labelStyle}>What do you do?</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {ROLES.map(({ val, label }) => (
                  <button key={val} type="button" onClick={() => set('role', val)}
                    style={chipBase(f.role === val)}
                  >{label}</button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* custom role — only when Other is selected */}
        <AnimatePresence>
          {showCustomRole && (
            <motion.div key="customrole" {...fadeIn} style={fieldWrap}>
              <label style={labelStyle}>Your job title</label>
              <input type="text" placeholder="e.g. Quant Researcher, Trading Engineer…" value={f.customRole}
                onChange={e => set('customRole', e.target.value)}
                autoFocus
                className="liquid-glass" style={inputStyle}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* experience */}
        <AnimatePresence>
          {showExperience && (
            <motion.div key="experience" {...fadeIn} style={fieldWrap}>
              <label style={labelStyle}>Years of experience</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {EXPERIENCE_OPTIONS.map(({ val, label }) => (
                  <button key={val} type="button" onClick={() => set('experience', val)}
                    style={{ ...chipBase(f.experience === val), flex: 1, textAlign: 'center' }}
                  >{label}</button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* contribution areas */}
        <AnimatePresence>
          {showAreas && (
            <motion.div key="areas" {...fadeIn} style={fieldWrap}>
              <label style={labelStyle}>What do you want to work on?</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {AREAS.map(({ val, label }) => (
                  <button key={val} type="button" onClick={() => toggleArea(val)}
                    style={chipBase(f.areas.includes(val))}
                  >{label}</button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* open source before */}
        <AnimatePresence>
          {showOpenSource && (
            <motion.div key="opensource" {...fadeIn} style={fieldWrap}>
              <label style={labelStyle}>Contributed to open source before?</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[{ val: 'yes', label: 'Yes' }, { val: 'no', label: 'No, first time' }].map(({ val, label }) => (
                  <button key={val} type="button" onClick={() => set('openSource', val)}
                    style={{ ...chipBase(f.openSource === val), flex: 1, textAlign: 'center' }}
                  >{label}</button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* anything else */}
        <AnimatePresence>
          {showAnything && (
            <motion.div key="anything" {...fadeIn} style={fieldWrap}>
              <label style={labelStyle}>Anything else we should know?</label>
              <textarea placeholder="Past projects, ideas, what excites you about this — anything." value={f.anythingElse}
                onChange={e => set('anythingElse', e.target.value)} rows={3}
                className="liquid-glass"
                style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* contact */}
        <AnimatePresence>
          {showContact && (
            <motion.div key="contact" {...fadeIn} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />
              <div>
                <label style={labelStyle}>Join our contributor group</label>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: '2px 0 0' }}>We'll add you to our builder chat. Optional.</p>
              </div>
              <div style={{ display: 'flex', gap: '0.625rem' }}>
                {(['whatsapp', 'telegram'] as const).map(ch => (
                  <button key={ch} type="button"
                    onClick={() => {
                      setContactChannel(prev => prev === ch ? null : ch)
                      set(ch === 'whatsapp' ? 'telegram' : 'whatsapp', '')
                    }}
                    style={{ flex: 1, borderRadius: '0.875rem', padding: '0.75rem 1rem', cursor: 'pointer', border: 'none', textAlign: 'center', transition: 'all 0.15s', background: contactChannel === ch ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)', outline: contactChannel === ch ? '1.5px solid #F59E0B' : '1px solid rgba(255,255,255,0.1)', fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '13px', color: '#fff' }}
                  >{ch === 'whatsapp' ? 'WhatsApp' : 'Telegram'}</button>
                ))}
              </div>
              <AnimatePresence>
                {contactChannel === 'whatsapp' && (
                  <motion.input key="wa" {...fadeIn} type="text" placeholder="+1234567890" value={f.whatsapp} onChange={e => set('whatsapp', e.target.value)} className="liquid-glass" style={inputStyle} />
                )}
                {contactChannel === 'telegram' && (
                  <motion.input key="tg" {...fadeIn} type="text" placeholder="username (without @) or +1234567890" value={f.telegram} onChange={e => set('telegram', e.target.value)} className="liquid-glass" style={inputStyle} />
                )}
              </AnimatePresence>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />
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
              style={{ marginTop: '0.25rem', fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '15px', background: '#F59E0B', color: '#000', borderRadius: 9999, padding: '13px 24px', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              {submitting ? 'Joining…' : <>'Join Waitlist' <ArrowUpRight size={15} /></>}
            </motion.button>
          )}
        </AnimatePresence>

      </form>

      <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.2)', textAlign: 'center', margin: 0 }}>
        No commitment. Code drops 9 May 2026.
      </p>
    </div>
  )
}
