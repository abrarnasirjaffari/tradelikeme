import { useState, FormEvent } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
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
  const [loading, setLoading] = useState(false)

  const { signUp, signIn, signInWithPhantom } = useAuth()
  const navigate = useNavigate()

  async function handlePhantom() {
    setLoading(true)
    const result = await signInWithPhantom()
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Signed in with Phantom')
      window.location.pathname = '/dashboard'
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    const result = tab === 'signup'
      ? await signUp(email, password, name)
      : await signIn(email, password)
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(tab === 'signup' ? 'Account created!' : 'Signed in!')
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
                <button key={t} type="button" onClick={() => setTab(t)} style={{
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

              {/* forgot password — login tab only */}
              {tab === 'login' && (
                <div style={{ textAlign: 'right', marginTop: '-0.5rem' }}>
                  <button type="button" onClick={() => navigate('/forgot-password')}
                    style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.4)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
                  >Forgot password?</button>
                </div>
              )}

              {/* submit */}
              <button type="submit" disabled={loading} style={{
                marginTop: '0.25rem', fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '15px',
                background: loading ? 'rgba(0,82,255,0.5)' : '#0052FF', color: '#fff', borderRadius: 9999, padding: '13px 24px',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                {loading ? (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.75s linear infinite', flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    {tab === 'signup' ? 'Creating account…' : 'Signing in…'}
                  </>
                ) : (
                  <>{tab === 'signup' ? 'Create Account' : 'Log In'} <ArrowUpRight size={15} /></>
                )}
              </button>

              {/* divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.25rem 0' }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>or continue with</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              </div>

              {/* social buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" className="liquid-glass"
                  onClick={() => authClient.signIn.social({ provider: 'google', callbackURL: `${window.location.origin}/dashboard` })}
                  style={{
                    flex: 1, borderRadius: '0.875rem', padding: '11px 0',
                    fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '13px',
                    color: 'rgba(255,255,255,0.75)', border: 'none', cursor: 'pointer', background: 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  }}>
                  <img src="/google-icon-logo-svgrepo-com (1).svg" width={16} height={16} alt="" style={{ flexShrink: 0 }} />
                  Google
                </button>
                <button type="button" className="liquid-glass"
                  onClick={() => authClient.signIn.social({ provider: 'github', callbackURL: `${window.location.origin}/dashboard` })}
                  style={{
                    flex: 1, borderRadius: '0.875rem', padding: '11px 0',
                    fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '13px',
                    color: 'rgba(255,255,255,0.75)', border: 'none', cursor: 'pointer', background: 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  }}>
                  <img src="/github-svgrepo-com (1).svg" width={16} height={16} alt="" style={{ flexShrink: 0, filter: 'invert(1)' }} />
                  GitHub
                </button>
              </div>
              <button type="button" className="liquid-glass" onClick={handlePhantom} disabled={loading}
                style={{
                  width: '100%', borderRadius: '0.875rem', padding: '11px 0',
                  fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '13px',
                  color: 'rgba(255,255,255,0.75)', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                }}>
                {loading ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.75s linear infinite', flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="rgba(255,255,255,0.7)" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 269 224" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                    <path d="M31.8292 224C66.1548 224 91.951 194.147 107.345 170.557C105.473 175.776 104.433 180.995 104.433 186.006C104.433 199.784 112.338 209.596 127.941 209.596C149.368 209.596 172.252 190.807 184.11 170.557C183.278 173.48 182.862 176.194 182.862 178.699C182.862 188.302 188.271 194.356 199.296 194.356C234.038 194.356 268.988 132.772 268.988 78.9115C268.988 36.9506 247.768 0 194.512 0C100.896 0 0 114.401 0 188.302C0 217.32 15.6025 224 31.8292 224ZM162.266 74.3187C162.266 63.8807 168.091 56.5741 176.621 56.5741C184.942 56.5741 190.767 63.8807 190.767 74.3187C190.767 84.7568 184.942 92.2721 176.621 92.2721C168.091 92.2721 162.266 84.7568 162.266 74.3187ZM206.786 74.3187C206.786 63.8807 212.611 56.5741 221.14 56.5741C229.461 56.5741 235.286 63.8807 235.286 74.3187C235.286 84.7568 229.461 92.2721 221.14 92.2721C212.611 92.2721 206.786 84.7568 206.786 74.3187Z" fill="#AB9FF2"/>
                  </svg>
                )}
                Phantom
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
