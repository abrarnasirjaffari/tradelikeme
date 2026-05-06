import { useState, useEffect, type FormEvent } from 'react'
import { ArrowUpRight, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import FadingVideo from '../components/FadingVideo'
import ScrollProgress from '../components/ScrollProgress'
import WaitlistNavbar from './WaitlistNavbar'
import Footer from '../components/Footer'
import { inputStyle, labelStyle, fieldWrap } from './formStyles'
import { authClient } from '../lib/auth-client'

type Step = 'password' | 'qr' | 'verify' | 'done'

export default function TwoFactorSetupPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('password')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // Generate QR image whenever we get a totpURI
  const [totpURI, setTotpURI] = useState('')
  useEffect(() => {
    if (!totpURI) return
    QRCode.toDataURL(totpURI, { width: 200, margin: 1, color: { dark: '#000', light: '#fff' } })
      .then(setQrDataUrl)
  }, [totpURI])

  async function handleEnable(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await authClient.twoFactor.enable({ password })
    setLoading(false)
    if (error) {
      toast.error(error.message ?? 'Failed to enable 2FA')
      return
    }
    setTotpURI(data!.totpURI)
    setBackupCodes(data!.backupCodes ?? [])
    setStep('qr')
  }

  async function handleVerify(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await authClient.twoFactor.verifyTotp({ code })
    setLoading(false)
    if (error) {
      toast.error(error.message ?? 'Invalid code — try again')
      return
    }
    toast.success('2FA enabled!')
    setStep('done')
  }

  const spinner = (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.75s linear infinite', flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )

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

            {/* ── Step 1: confirm password ── */}
            {step === 'password' && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <h2 style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: '#fff', margin: 0 }}>Set up two-factor auth</h2>
                  <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
                    Confirm your password to continue.
                  </p>
                </div>
                <form onSubmit={handleEnable} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div style={fieldWrap}>
                    <label style={labelStyle}>Password</label>
                    <input type="password" placeholder="••••••••" className="liquid-glass" style={inputStyle}
                      value={password} onChange={e => setPassword(e.target.value)} required autoFocus />
                  </div>
                  <button type="submit" disabled={loading} style={{
                    fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '15px',
                    background: loading ? 'rgba(0,82,255,0.5)' : '#0052FF', color: '#fff',
                    borderRadius: 9999, padding: '13px 24px', border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}>
                    {loading ? <>{spinner} Generating…</> : <>Continue <ArrowUpRight size={15} /></>}
                  </button>
                </form>
              </>
            )}

            {/* ── Step 2: scan QR ── */}
            {step === 'qr' && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <h2 style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: '#fff', margin: 0 }}>Scan with your authenticator</h2>
                  <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
                    Use Google Authenticator, Authy, or any TOTP app.
                  </p>
                </div>

                {qrDataUrl && (
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ background: '#fff', borderRadius: '0.75rem', padding: '0.75rem', display: 'inline-flex' }}>
                      <img src={qrDataUrl} alt="TOTP QR code" width={200} height={200} />
                    </div>
                  </div>
                )}

                {backupCodes.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '11px', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Backup codes — save these now</span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                      {backupCodes.map(c => (
                        <code key={c} style={{ fontFamily: 'monospace', fontSize: '12px', color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.06)', borderRadius: '0.5rem', padding: '5px 10px', textAlign: 'center' }}>{c}</code>
                      ))}
                    </div>
                  </div>
                )}

                <button onClick={() => setStep('verify')} style={{
                  fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '15px',
                  background: '#0052FF', color: '#fff', borderRadius: 9999, padding: '13px 24px',
                  border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                  I've scanned it <ArrowUpRight size={15} />
                </button>
              </>
            )}

            {/* ── Step 3: verify code ── */}
            {step === 'verify' && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <h2 style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: '#fff', margin: 0 }}>Enter the 6-digit code</h2>
                  <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
                    Open your authenticator app and enter the code shown.
                  </p>
                </div>
                <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div style={fieldWrap}>
                    <label style={labelStyle}>Verification Code</label>
                    <input type="text" inputMode="numeric" pattern="\d{6}" placeholder="000000" className="liquid-glass" style={{ ...inputStyle, letterSpacing: '0.3em', fontSize: '1.25rem', textAlign: 'center' }}
                      value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} required autoFocus maxLength={6} />
                  </div>
                  <button type="submit" disabled={loading || code.length < 6} style={{
                    fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '15px',
                    background: (loading || code.length < 6) ? 'rgba(0,82,255,0.5)' : '#0052FF', color: '#fff',
                    borderRadius: 9999, padding: '13px 24px', border: 'none',
                    cursor: (loading || code.length < 6) ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}>
                    {loading ? <>{spinner} Verifying…</> : <>Verify & Enable <ArrowUpRight size={15} /></>}
                  </button>
                </form>
              </>
            )}

            {/* ── Step 4: done ── */}
            {step === 'done' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', textAlign: 'center' }}>
                <ShieldCheck size={40} style={{ color: '#22c55e' }} />
                <div>
                  <h2 style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: '#fff', margin: '0 0 0.4rem' }}>2FA is active</h2>
                  <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
                    Your account is now protected with two-factor authentication.
                  </p>
                </div>
                <button onClick={() => navigate('/dashboard')} style={{
                  fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '15px',
                  background: '#0052FF', color: '#fff', borderRadius: 9999, padding: '13px 24px',
                  border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  Back to Dashboard <ArrowUpRight size={15} />
                </button>
              </div>
            )}

          </div>
        </div>
        <Footer />
      </div>
    </div>
  )
}
