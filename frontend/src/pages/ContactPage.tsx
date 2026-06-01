import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, Mail, MessageSquare, User, Check } from 'lucide-react'
import WaitlistNavbar from './WaitlistNavbar'
import Footer from '../components/Footer'
import FadingVideo from '../components/FadingVideo'
import ScrollProgress from '../components/ScrollProgress'
import { pb } from '../lib/pocketbase'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: 'easeOut' as const, delay },
})

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '0.875rem',
  padding: '0.875rem 1rem 0.875rem 2.75rem',
  fontFamily: "'Barlow', sans-serif",
  fontWeight: 400,
  fontSize: '14px',
  color: '#fff',
  outline: 'none',
  transition: 'border-color 0.2s, background 0.2s',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  fontFamily: "'Barlow', sans-serif",
  fontWeight: 600,
  fontSize: '12px',
  color: 'rgba(255,255,255,0.5)',
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
}

export default function ContactPage() {
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [message, setMessage] = useState('')
  const [focused, setFocused] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [error, setError]           = useState<string | null>(null)

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const canSubmit  = name.trim() && emailValid && message.trim().length >= 10

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      await pb.collection('contact').create({ name: name.trim(), email, message: message.trim() })
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function borderColor(field: string) {
    return focused === field ? 'rgba(0,82,255,0.6)' : 'rgba(255,255,255,0.1)'
  }

  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
        style={{ position: 'fixed', top: 0, left: '-10%', width: '120%', height: '120%', objectFit: 'cover', objectPosition: 'center top', zIndex: 0 }}
      />
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'rgba(0,0,0,0.6)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <ScrollProgress />
        <WaitlistNavbar />

        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8rem 1.25rem 5rem' }}>

          {/* Two-column layout on desktop */}
          <div style={{ width: '100%', maxWidth: 960, display: 'flex', gap: '4rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>

            {/* Left — copy */}
            <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '2rem', paddingTop: '0.5rem' }}>
              <motion.div {...fadeUp(0)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#0052FF' }}>
                  Get in touch
                </span>
                <h1 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: 'clamp(2.5rem, 6vw, 3.75rem)', lineHeight: 1.0, letterSpacing: '-2px', margin: 0 }}>
                  We'd love to hear from you.
                </h1>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '1rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, margin: 0, maxWidth: '38ch' }}>
                  Questions about the platform, partnerships, or strategy submissions — drop us a message and we'll get back to you within 24 hours.
                </p>
              </motion.div>

              <motion.div {...fadeUp(0.15)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { icon: Mail, label: 'Email', value: 'team@tradelikeme.xyz' },
                  { icon: MessageSquare, label: 'Telegram', value: '@tradelikeme' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div style={{ width: 38, height: 38, borderRadius: '0.75rem', background: 'rgba(0,82,255,0.12)', border: '1px solid rgba(0,82,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={16} color="#0052FF" />
                    </div>
                    <div>
                      <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>{label}</p>
                      <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '14px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>{value}</p>
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* Typical response badge */}
              <motion.div {...fadeUp(0.25)}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 9999, padding: '6px 14px' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', display: 'inline-block', boxShadow: '0 0 6px #22C55E' }} />
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '12px', color: '#22C55E' }}>Typically replies within 24h</span>
                </div>
              </motion.div>
            </div>

            {/* Right — form card */}
            <motion.div {...fadeUp(0.1)} style={{ flex: '1 1 380px' }}>
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="liquid-glass"
                    style={{ borderRadius: '1.75rem', padding: '3.5rem 2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', textAlign: 'center' }}
                  >
                    <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={28} color="#22C55E" />
                    </div>
                    <div>
                      <h3 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: '1.75rem', letterSpacing: '-1px', margin: '0 0 0.5rem' }}>Message sent.</h3>
                      <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, margin: 0 }}>
                        Thanks, {name.split(' ')[0]}. We'll get back to you at <span style={{ color: 'rgba(255,255,255,0.7)' }}>{email}</span> shortly.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="liquid-glass"
                    style={{ borderRadius: '1.75rem', padding: '2.5rem' }}
                  >
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                      {/* Name */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={labelStyle}>Name</label>
                        <div style={{ position: 'relative' }}>
                          <User size={15} color="rgba(255,255,255,0.25)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                          <input
                            type="text" placeholder="Your name" value={name} autoFocus
                            onChange={e => setName(e.target.value)}
                            onFocus={() => setFocused('name')}
                            onBlur={() => setFocused(null)}
                            style={{ ...inputStyle, borderColor: borderColor('name') }}
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={labelStyle}>Email <span style={{ color: '#0052FF' }}>*</span></label>
                        <div style={{ position: 'relative' }}>
                          <Mail size={15} color="rgba(255,255,255,0.25)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                          <input
                            type="email" placeholder="your@email.com" value={email} required
                            onChange={e => setEmail(e.target.value)}
                            onFocus={() => setFocused('email')}
                            onBlur={() => setFocused(null)}
                            style={{ ...inputStyle, borderColor: email && !emailValid ? '#ef4444' : borderColor('email') }}
                          />
                        </div>
                        {email && !emailValid && (
                          <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: '#ef4444', margin: 0 }}>Enter a valid email address.</p>
                        )}
                      </div>

                      {/* Message */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={labelStyle}>Message <span style={{ color: '#0052FF' }}>*</span></label>
                        <div style={{ position: 'relative' }}>
                          <MessageSquare size={15} color="rgba(255,255,255,0.25)" style={{ position: 'absolute', left: '1rem', top: '1.05rem', pointerEvents: 'none' }} />
                          <textarea
                            placeholder="What's on your mind? Strategy questions, partnerships, anything..." value={message}
                            onChange={e => setMessage(e.target.value)}
                            onFocus={() => setFocused('message')}
                            onBlur={() => setFocused(null)}
                            rows={5}
                            style={{ ...inputStyle, paddingLeft: '2.75rem', resize: 'none', lineHeight: 1.65, borderColor: borderColor('message') }}
                          />
                        </div>
                        <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.2)', margin: 0, textAlign: 'right' }}>
                          {message.length} chars {message.length < 10 && message.length > 0 && <span style={{ color: '#ef4444' }}>(min 10)</span>}
                        </p>
                      </div>

                      {error && (
                        <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '13px', color: '#ef4444', margin: 0, textAlign: 'center' }}>{error}</p>
                      )}

                      <button
                        type="submit" disabled={submitting || !canSubmit}
                        style={{
                          marginTop: '0.25rem',
                          fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '15px',
                          background: canSubmit ? '#0052FF' : 'rgba(255,255,255,0.08)',
                          color: canSubmit ? '#fff' : 'rgba(255,255,255,0.25)',
                          borderRadius: 9999, padding: '13px 24px', border: 'none',
                          cursor: submitting || !canSubmit ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          transition: 'background 0.2s, color 0.2s',
                        }}
                      >
                        {submitting ? 'Sending…' : <>'Send Message' <ArrowUpRight size={15} /></>}
                      </button>

                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  )
}
