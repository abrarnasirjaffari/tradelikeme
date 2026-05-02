import { useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import WaitlistNavbar from './WaitlistNavbar'
import Footer from '../components/Footer'
import FadingVideo from '../components/FadingVideo'
import ScrollProgress from '../components/ScrollProgress'
import EmailVerificationBanner from '../components/EmailVerificationBanner'
import { useAuth } from '../context/AuthContext'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const twoFactorEnabled = (user as any)?.twoFactorEnabled ?? false

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
        <EmailVerificationBanner />
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8rem 2rem 4rem' }}>
          <div className="liquid-glass" style={{ borderRadius: '1.75rem', padding: '3rem', textAlign: 'center', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: '1.25rem', letterSpacing: '-0.5px', display: 'block' }}>TradeLikeMe</span>
            <div>
              <h1 style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '1.5rem', color: '#fff', margin: '0 0 0.75rem' }}>Dashboard</h1>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '1rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Coming soon — your trading dashboard will live here.</p>
            </div>

            {/* 2FA prompt */}
            {!twoFactorEnabled && (
              <button onClick={() => navigate('/2fa-setup')}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '13.5px',
                  color: 'rgba(255,255,255,0.6)',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 9999, padding: '9px 20px', cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
              >
                <ShieldCheck size={14} /> Enable two-factor auth
              </button>
            )}

            {twoFactorEnabled && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontFamily: "'Barlow', sans-serif", fontSize: '13px', color: '#22c55e' }}>
                <ShieldCheck size={14} /> Two-factor auth enabled
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </div>
  )
}
