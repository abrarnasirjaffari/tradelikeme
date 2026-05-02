import { useState, FormEvent } from 'react'
import { ArrowUpRight } from 'lucide-react'
import FadingVideo from '../components/FadingVideo'
import ScrollProgress from '../components/ScrollProgress'
import WaitlistNavbar from './WaitlistNavbar'
import Footer from '../components/Footer'
import { inputStyle, labelStyle, fieldWrap } from './formStyles'
import { useAuth } from '../context/AuthContext'
import { authClient } from '../lib/auth-client'

export default function SignupPage() {
  const [tab, setTab] = useState<'signup' | 'login'>(window.location.pathname === '/login' ? 'login' : 'signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { signUp, signIn } = useAuth()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = tab === 'signup'
      ? await signUp(email, password, name)
      : await signIn(email, password)
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      window.location.pathname = '/dashboard'
    }
  }

  return (
    <div style={{ background: '#000' }}>
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
        style={{ position: 'fixed', top: 0, left: '-10%', width: '120%', height: '120%', objectFit: 'cover', objectPosition: 'center top', zIndex: 0 }}
      />
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'rgba(0,0,0,0.55)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <ScrollProgress />
        <WaitlistNavbar />
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8rem 2rem 4rem' }}>
          <div className="liquid-glass" style={{ borderRadius: '1.75rem', padding: '2.75rem 3rem', width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

            {/* logo */}
            <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: '1.25rem', letterSpacing: '-0.5px' }}>TradeLikeMe</span>

            {/* tab switcher */}
            <div className="liquid-glass" style={{ borderRadius: 9999, padding: '4px', display: 'flex', gap: '4px' }}>
              {(['signup', 'login'] as const).map(t => (
                <button key={t} type="button" onClick={() => { setTab(t); setError('') }} style={{
                  flex: 1, borderRadius: 9999, padding: '8px 0',
                  fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '13px',
                  border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                  background: tab === t ? '#0052FF' : 'transparent',
                  color: tab === t ? '#fff' : 'rgba(255,255,255,0.4)',
                }}>
                  {t === 'signup' ? 'Sign Up' : 'Log In'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

              {/* name — signup only */}
              {tab === 'signup' && (
                <div style={fieldWrap}>
                  <label style={labelStyle}>Full Name</label>
                  <input type="text" placeholder="Your name" className="liquid-glass" style={inputStyle}
                    value={name} onChange={e => setName(e.target.value)} required />
                </div>
              )}

              {/* email */}
              <div style={fieldWrap}>
                <label style={labelStyle}>Email</label>
                <input type="email" placeholder="your@email.com" className="liquid-glass" style={inputStyle}
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>

              {/* password */}
              <div style={fieldWrap}>
                <label style={labelStyle}>Password</label>
                <input type="password" placeholder="••••••••" className="liquid-glass" style={inputStyle}
                  value={password} onChange={e => setPassword(e.target.value)} required />
              </div>

              {/* error message */}
              {error && (
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '13px', color: '#ff4d4f', margin: 0 }}>
                  {error}
                </p>
              )}

              {/* submit */}
              <button type="submit" disabled={loading} style={{
                marginTop: '0.25rem', fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '15px',
                background: loading ? 'rgba(0,82,255,0.5)' : '#0052FF', color: '#fff', borderRadius: 9999, padding: '13px 24px',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                {loading ? 'Please wait…' : <>{tab === 'signup' ? 'Create Account' : 'Log In'} <ArrowUpRight size={15} /></>}
              </button>

              {/* divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.25rem 0' }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>or continue with</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              </div>

              {/* social buttons */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" className="liquid-glass"
                  onClick={() => authClient.signIn.social({ provider: 'google', callbackURL: '/dashboard' })}
                  style={{
                    flex: 1, borderRadius: '0.875rem', padding: '11px 0',
                    fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '13px',
                    color: 'rgba(255,255,255,0.75)', border: 'none', cursor: 'pointer', background: 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  }}>
                  <span style={{ fontWeight: 700 }}>G</span> Google
                </button>
                <button type="button" className="liquid-glass"
                  onClick={() => authClient.signIn.social({ provider: 'github', callbackURL: '/dashboard' })}
                  style={{
                    flex: 1, borderRadius: '0.875rem', padding: '11px 0',
                    fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '13px',
                    color: 'rgba(255,255,255,0.75)', border: 'none', cursor: 'pointer', background: 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  }}>
                  <span style={{ fontWeight: 700 }}>⌥</span> GitHub
                </button>
              </div>

            </form>

          </div>
        </div>
        <Footer />
      </div>
    </div>
  )
}
