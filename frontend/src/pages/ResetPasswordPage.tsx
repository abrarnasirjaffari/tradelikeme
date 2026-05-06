import { useState, type FormEvent } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate, useSearchParams } from 'react-router-dom'
import FadingVideo from '../components/FadingVideo'
import ScrollProgress from '../components/ScrollProgress'
import WaitlistNavbar from './WaitlistNavbar'
import Footer from '../components/Footer'
import { inputStyle, labelStyle, fieldWrap } from './formStyles'
import { authClient } from '../lib/auth-client'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    const { error } = await authClient.resetPassword({ newPassword: password, token })
    setLoading(false)
    if (error) {
      toast.error(error.message ?? 'Failed to reset password')
    } else {
      setDone(true)
      toast.success('Password updated — please log in')
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

            <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: '1.25rem', letterSpacing: '-0.5px' }}>TradeLikeMe</span>

            {!token ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                  Invalid or missing reset link. Please request a new one.
                </p>
                <button type="button" onClick={() => navigate('/forgot-password')}
                  style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '14px', background: '#0052FF', color: '#fff', borderRadius: 9999, padding: '12px 24px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  Request Reset Link <ArrowUpRight size={14} />
                </button>
              </div>
            ) : done ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '15px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, margin: 0 }}>
                  Your password has been updated.
                </p>
                <button type="button" onClick={() => navigate('/login')}
                  style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '14px', background: '#0052FF', color: '#fff', borderRadius: 9999, padding: '12px 24px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  Log In <ArrowUpRight size={14} />
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <h2 style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: '#fff', margin: 0 }}>Set a new password</h2>
                  <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
                    Choose a strong password for your account.
                  </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div style={fieldWrap}>
                    <label style={labelStyle}>New Password</label>
                    <input type="password" placeholder="••••••••" className="liquid-glass" style={inputStyle}
                      value={password} onChange={e => setPassword(e.target.value)} required autoFocus minLength={8} />
                  </div>

                  <div style={fieldWrap}>
                    <label style={labelStyle}>Confirm Password</label>
                    <input type="password" placeholder="••••••••" className="liquid-glass" style={inputStyle}
                      value={confirm} onChange={e => setConfirm(e.target.value)} required minLength={8} />
                  </div>

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
                        Updating…
                      </>
                    ) : (
                      <>Update Password <ArrowUpRight size={15} /></>
                    )}
                  </button>
                </form>
              </>
            )}

          </div>
        </div>
        <Footer />
      </div>
    </div>
  )
}
