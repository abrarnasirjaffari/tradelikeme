import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, MessageCircle, Send } from 'lucide-react'
import FadingVideo from '../../components/FadingVideo'

const VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4'

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  padding: 24,
}

type EventToggleState = {
  label: string
  enabled: boolean
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-checked={enabled}
      role="switch"
      style={{
        position: 'relative',
        width: 34,
        height: 18,
        borderRadius: 9999,
        background: enabled ? '#3b82f6' : 'rgba(255,255,255,0.15)',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        flexShrink: 0,
        transition: 'background 0.2s',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: enabled ? 19 : 3,
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 0.2s',
          display: 'block',
        }}
      />
    </button>
  )
}

export default function NotificationSettingsPage() {
  const navigate = useNavigate()
  const [telegramConnected, setTelegramConnected] = useState(true)
  const [chatIdInput, setChatIdInput] = useState('')
  const [events, setEvents] = useState<EventToggleState[]>([
    { label: 'Zone Touch Alert', enabled: true },
    { label: 'Trade Entered', enabled: true },
    { label: 'TP1 Hit', enabled: true },
    { label: 'TP2 Hit', enabled: true },
    { label: 'SL Hit', enabled: true },
    { label: 'Balance Low (< $35)', enabled: true },
    { label: 'Agent Down', enabled: true },
    { label: 'Daily Summary', enabled: false },
  ])

  function toggleEvent(i: number) {
    setEvents(prev => prev.map((e, idx) => (idx === i ? { ...e, enabled: !e.enabled } : e)))
  }

  function handleConnect() {
    if (!chatIdInput.trim()) {
      toast.error('Please enter your Telegram chat ID')
      return
    }
    setTelegramConnected(true)
    setChatIdInput('')
    toast.success('Telegram connected!')
  }

  function handleDisconnect() {
    setTelegramConnected(false)
    toast.success('Telegram disconnected')
  }

  function handleTestNotification() {
    toast.success('Test notification sent to Telegram!')
  }

  return (
    <div style={{ background: '#000', minHeight: '100vh', fontFamily: "'Barlow', sans-serif" }}>
      <FadingVideo
        src={VIDEO_SRC}
        style={{
          position: 'fixed',
          top: 0,
          left: '-10%',
          width: '120%',
          height: '120%',
          objectFit: 'cover',
          objectPosition: 'center top',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.55)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Sticky top bar */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 40,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            padding: '0 2rem',
            height: 60,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 400,
              fontSize: '13px',
              color: 'rgba(255,255,255,0.5)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
          >
            <ArrowLeft size={15} />
            Dashboard
          </button>
          <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '14px' }}>/</span>
          <h2
            style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 600,
              fontSize: '15px',
              color: '#fff',
              margin: 0,
            }}
          >
            Notification Settings
          </h2>
        </div>

        {/* Main content */}
        <main style={{ padding: '2rem', maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Section 1 — Connect Channels */}
          <section>
            <p
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 600,
                fontSize: '13px',
                color: 'rgba(255,255,255,0.5)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginTop: 0,
                marginBottom: '0.75rem',
              }}
            >
              Connect Channels
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {/* Telegram card */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'rgba(44,165,224,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Send size={16} color="#2CA5E0" />
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '14px', color: '#fff', margin: 0 }}>
                      Connect Telegram
                    </p>
                    {telegramConnected ? (
                      <span
                        style={{
                          fontFamily: "'Barlow', sans-serif",
                          fontWeight: 500,
                          fontSize: '11px',
                          color: '#22c55e',
                          background: 'rgba(34,197,94,0.12)',
                          borderRadius: 9999,
                          padding: '1px 8px',
                        }}
                      >
                        Connected
                      </span>
                    ) : (
                      <span
                        style={{
                          fontFamily: "'Barlow', sans-serif",
                          fontWeight: 400,
                          fontSize: '11px',
                          color: 'rgba(255,255,255,0.35)',
                          background: 'rgba(255,255,255,0.06)',
                          borderRadius: 9999,
                          padding: '1px 8px',
                        }}
                      >
                        Not Connected
                      </span>
                    )}
                  </div>
                </div>

                {telegramConnected ? (
                  <div>
                    <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.45)', margin: '0 0 0.75rem 0' }}>
                      Sending alerts to{' '}
                      <span style={{ color: '#2CA5E0', fontWeight: 500 }}>@abrar_trades</span>
                    </p>
                    <button
                      type="button"
                      onClick={handleDisconnect}
                      style={{
                        fontFamily: "'Barlow', sans-serif",
                        fontWeight: 500,
                        fontSize: '12px',
                        color: 'rgba(239,68,68,0.7)',
                        background: 'transparent',
                        border: '1px solid rgba(239,68,68,0.25)',
                        borderRadius: 8,
                        padding: '6px 14px',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#ef4444' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'rgba(239,68,68,0.7)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)' }}
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <div>
                    <ol style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.45)', margin: '0 0 0.75rem 0', paddingLeft: '1.25rem' }}>
                      <li>Open @TradeLikeMeBot</li>
                      <li>Send /start</li>
                      <li>Copy your chat ID</li>
                    </ol>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        value={chatIdInput}
                        onChange={e => setChatIdInput(e.target.value)}
                        placeholder="Chat ID..."
                        style={{
                          flex: 1,
                          fontFamily: "'Barlow', sans-serif",
                          fontWeight: 400,
                          fontSize: '13px',
                          color: '#fff',
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: 8,
                          padding: '7px 12px',
                          outline: 'none',
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleConnect}
                        style={{
                          fontFamily: "'Barlow', sans-serif",
                          fontWeight: 600,
                          fontSize: '12px',
                          color: '#fff',
                          background: '#2CA5E0',
                          border: 'none',
                          borderRadius: 8,
                          padding: '7px 14px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'opacity 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                      >
                        Connect
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* WhatsApp card — disabled */}
              <div
                style={{
                  ...cardStyle,
                  opacity: 0.45,
                  cursor: 'not-allowed',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'rgba(37,211,102,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <MessageCircle size={16} color="#25D366" />
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '14px', color: '#fff', margin: 0 }}>
                      WhatsApp Alerts
                    </p>
                    <span
                      style={{
                        fontFamily: "'Barlow', sans-serif",
                        fontWeight: 500,
                        fontSize: '11px',
                        color: 'rgba(255,255,255,0.4)',
                        background: 'rgba(255,255,255,0.08)',
                        borderRadius: 9999,
                        padding: '1px 8px',
                      }}
                    >
                      Coming Soon
                    </span>
                  </div>
                </div>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                  WhatsApp notifications via Twilio will be available in a future update.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 — Event Toggles */}
          <section>
            <p
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 600,
                fontSize: '13px',
                color: 'rgba(255,255,255,0.5)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginTop: 0,
                marginBottom: '0.75rem',
              }}
            >
              Alert me when...
            </p>

            <div style={cardStyle}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {events.map((ev, i) => (
                  <div
                    key={ev.label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.7rem 0',
                      borderBottom: i < events.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Barlow', sans-serif",
                        fontWeight: 400,
                        fontSize: '13px',
                        color: ev.enabled ? '#fff' : 'rgba(255,255,255,0.4)',
                        transition: 'color 0.15s',
                      }}
                    >
                      {ev.label}
                    </span>
                    <Toggle enabled={ev.enabled} onChange={() => toggleEvent(i)} />
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                  type="button"
                  onClick={handleTestNotification}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontFamily: "'Barlow', sans-serif",
                    fontWeight: 500,
                    fontSize: '13px',
                    color: '#3b82f6',
                    background: 'transparent',
                    border: '1px solid rgba(59,130,246,0.4)',
                    borderRadius: 8,
                    padding: '8px 18px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.08)'; e.currentTarget.style.borderColor = '#3b82f6' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)' }}
                >
                  <Send size={14} />
                  Send Test Notification
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
