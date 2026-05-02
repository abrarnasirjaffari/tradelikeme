import { useState } from 'react'
import { Mail, X } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'
import { authClient } from '../lib/auth-client'

export default function EmailVerificationBanner() {
  const { user } = useAuth()
  const [dismissed, setDismissed] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  // Only show for email users who haven't verified yet
  if (!user || user.emailVerified || !user.email || dismissed) return null

  async function handleResend() {
    if (!user?.email) return
    setSending(true)
    const { error } = await authClient.sendVerificationEmail({
      email: user.email,
      callbackURL: '/dashboard',
    })
    setSending(false)
    if (error) {
      toast.error(error.message ?? 'Failed to send verification email')
    } else {
      setSent(true)
      toast.success('Verification email sent — check your inbox')
    }
  }

  return (
    <div style={{
      position: 'relative',
      zIndex: 10,
      margin: '5.5rem 1.5rem 0',
      borderRadius: '0.875rem',
      padding: '0.75rem 1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      background: 'rgba(255, 183, 0, 0.10)',
      border: '1px solid rgba(255, 183, 0, 0.22)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
    }}>
      <Mail size={15} style={{ color: '#FFB700', flexShrink: 0 }} />

      <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '13.5px', color: 'rgba(255,255,255,0.75)', flex: 1, lineHeight: 1.45 }}>
        {sent
          ? 'Verification email sent — check your inbox and click the link.'
          : `Please verify your email address (${user.email}) to unlock all features.`}
      </span>

      {!sent && (
        <button
          onClick={handleResend}
          disabled={sending}
          style={{
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 600,
            fontSize: '12.5px',
            color: '#FFB700',
            background: 'rgba(255, 183, 0, 0.12)',
            border: '1px solid rgba(255, 183, 0, 0.25)',
            borderRadius: 9999,
            padding: '5px 14px',
            cursor: sending ? 'not-allowed' : 'pointer',
            opacity: sending ? 0.6 : 1,
            whiteSpace: 'nowrap',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'opacity 0.15s',
          }}
        >
          {sending ? (
            <>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.75s linear infinite', flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" stroke="rgba(255,183,0,0.3)" strokeWidth="3" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="#FFB700" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Sending…
            </>
          ) : 'Resend email'}
        </button>
      )}

      <button
        onClick={() => setDismissed(true)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: '2px', display: 'flex', flexShrink: 0, transition: 'color 0.15s' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  )
}
