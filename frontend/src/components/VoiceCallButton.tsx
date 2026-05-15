import { useState, useEffect, useCallback } from 'react'
import { Mic, MicOff, X, PhoneCall } from 'lucide-react'

const DOGRAH_URL = import.meta.env.VITE_DOGRAH_URL ?? 'http://localhost:3010'

type CallStatus = 'idle' | 'connecting' | 'connected' | 'ended'

interface VoiceCallButtonProps {
  variant: 'navbar' | 'floating'
}

export default function VoiceCallButton({ variant }: VoiceCallButtonProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [status, setStatus] = useState<CallStatus>('idle')

  const closeModal = useCallback(() => {
    setModalOpen(false)
    setStatus('idle')
  }, [])

  // ESC key closes modal
  useEffect(() => {
    if (!modalOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [modalOpen, closeModal])

  async function handleStartCall() {
    if (status === 'connecting' || status === 'connected') {
      // End call
      setStatus('ended')
      setTimeout(() => setStatus('idle'), 2000)
      return
    }

    setStatus('connecting')

    try {
      const res = await fetch(`${DOGRAH_URL}/session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'tradelikeme-support' }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()
      const sessionUrl: string = data.url ?? data.session_url ?? DOGRAH_URL

      setStatus('connected')
      window.open(sessionUrl, '_blank', 'noopener,noreferrer')
    } catch {
      // Service not running or CORS — open root URL directly
      setStatus('connected')
      window.open(DOGRAH_URL, '_blank', 'noopener,noreferrer')
    }
  }

  const statusLabel: Record<CallStatus, string> = {
    idle: 'Ready to connect',
    connecting: 'Connecting...',
    connected: 'Connected — speak now',
    ended: 'Call ended',
  }

  const isPulsing = status === 'connecting' || status === 'connected'

  // ── Navbar variant ────────────────────────────────────────────
  if (variant === 'navbar') {
    return (
      <>
        <button
          className="liquid-glass"
          onClick={() => setModalOpen(true)}
          title="AI Voice Support"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 9999,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.8)',
            fontFamily: "'Barlow', sans-serif",
            fontSize: '14px',
            fontWeight: 400,
            whiteSpace: 'nowrap',
            flexShrink: 0,
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
        >
          <PhoneCall size={14} />
          Support
        </button>

        {modalOpen && <VoiceModal status={status} statusLabel={statusLabel} isPulsing={isPulsing} onStartCall={handleStartCall} onClose={closeModal} />}
      </>
    )
  }

  // ── Floating variant ──────────────────────────────────────────
  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        title="AI Voice Support"
        style={{
          position: 'fixed',
          bottom: 28,
          right: 28,
          zIndex: 9998,
          width: 56,
          height: 56,
          borderRadius: '50%',
          border: 'none',
          background: '#0052FF',
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 24px rgba(0,82,255,0.45)',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.08)'
          e.currentTarget.style.boxShadow = '0 6px 32px rgba(0,82,255,0.6)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,82,255,0.45)'
        }}
      >
        <Mic size={22} />
        {/* Floating pulse ring */}
        <span
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2px solid rgba(0,82,255,0.5)',
            animation: 'voicePulseRing 2s ease-out infinite',
            pointerEvents: 'none',
          }}
        />
      </button>

      {modalOpen && <VoiceModal status={status} statusLabel={statusLabel} isPulsing={isPulsing} onStartCall={handleStartCall} onClose={closeModal} />}

      <style>{`
        @keyframes voicePulseRing {
          0%   { transform: scale(1);   opacity: 0.7; }
          100% { transform: scale(1.7); opacity: 0; }
        }
        @keyframes voicePulseMic {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0,82,255,0.6); }
          50%       { box-shadow: 0 0 0 16px rgba(0,82,255,0); }
        }
        @keyframes voiceDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </>
  )
}

// ── Shared modal ──────────────────────────────────────────────────
interface ModalProps {
  status: CallStatus
  statusLabel: Record<CallStatus, string>
  isPulsing: boolean
  onStartCall: () => void
  onClose: () => void
}

function VoiceModal({ status, statusLabel, isPulsing, onStartCall, onClose }: ModalProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      />

      {/* Modal card */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10000,
          width: 'clamp(300px, 90vw, 420px)',
          background: 'rgba(10,10,20,0.95)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20,
          boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
          padding: '36px 32px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'rgba(255,255,255,0.08)',
            border: 'none',
            borderRadius: '50%',
            width: 30,
            height: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.5)',
            transition: 'color 0.2s, background 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#fff'
            e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
          }}
        >
          <X size={15} />
        </button>

        {/* Branding */}
        <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: '1rem', letterSpacing: '-0.3px', marginBottom: 4 }}>
          TradeLikeMe
        </span>

        <h2 style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '1.35rem', color: '#fff', margin: '0 0 10px', textAlign: 'center' }}>
          AI Voice Support
        </h2>

        <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '14px', color: 'rgba(255,255,255,0.55)', textAlign: 'center', lineHeight: 1.6, margin: '0 0 32px' }}>
          Ask anything about TradeLikeMe.<br />Our AI assistant answers instantly.
        </p>

        {/* Big mic button */}
        <button
          onClick={onStartCall}
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            border: 'none',
            background: status === 'ended' ? 'rgba(255,255,255,0.1)' : '#0052FF',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
            transition: 'background 0.3s',
            animation: isPulsing ? 'voicePulseMic 1.5s ease-in-out infinite' : 'none',
            flexShrink: 0,
          }}
        >
          {status === 'connected' ? <MicOff size={30} /> : <Mic size={30} />}
        </button>

        {/* Status text */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 24 }}>
          {status === 'connecting' && (
            <span style={{ display: 'flex', gap: 4 }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#0052FF', display: 'inline-block', animation: `voiceDot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </span>
          )}
          <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '13px', color: status === 'connected' ? '#4ade80' : status === 'ended' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.6)' }}>
            {statusLabel[status]}
          </span>
        </div>

        {/* Hint */}
        {status === 'idle' && (
          <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 16, lineHeight: 1.5 }}>
            Press the mic to start · ESC to close
          </p>
        )}
        {(status === 'connecting' || status === 'connected') && (
          <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 16 }}>
            Voice session opening in a new tab
          </p>
        )}
      </div>

      <style>{`
        @keyframes voicePulseMic {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0,82,255,0.6); }
          50%       { box-shadow: 0 0 0 18px rgba(0,82,255,0); }
        }
        @keyframes voiceDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </>
  )
}
