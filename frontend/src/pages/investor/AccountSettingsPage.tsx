import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Lock, Download, Trash2 } from 'lucide-react'
import FadingVideo from '../../components/FadingVideo'
import { useAuth } from '../../context/AuthContext'

const VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4'

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  padding: 24,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  fontFamily: "'Barlow', sans-serif",
  fontWeight: 400,
  fontSize: '13px',
  color: '#fff',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  padding: '9px 12px',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  fontFamily: "'Barlow', sans-serif",
  fontWeight: 300,
  fontSize: '12px',
  color: 'rgba(255,255,255,0.4)',
  display: 'block',
  marginBottom: '0.35rem',
}

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: "'Barlow', sans-serif",
  fontWeight: 600,
  fontSize: '13px',
  color: 'rgba(255,255,255,0.5)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  marginTop: 0,
  marginBottom: '0.75rem',
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.75rem 0',
  borderBottom: '1px solid rgba(255,255,255,0.05)',
}

const btnPrimary: React.CSSProperties = {
  fontFamily: "'Barlow', sans-serif",
  fontWeight: 600,
  fontSize: '13px',
  color: '#fff',
  background: '#3b82f6',
  border: 'none',
  borderRadius: 8,
  padding: '8px 18px',
  cursor: 'pointer',
  transition: 'background 0.15s',
  whiteSpace: 'nowrap' as const,
}

const btnOutline: React.CSSProperties = {
  fontFamily: "'Barlow', sans-serif",
  fontWeight: 500,
  fontSize: '13px',
  color: 'rgba(255,255,255,0.6)',
  background: 'transparent',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 8,
  padding: '8px 18px',
  cursor: 'pointer',
  transition: 'all 0.15s',
  whiteSpace: 'nowrap' as const,
}

const btnDanger: React.CSSProperties = {
  fontFamily: "'Barlow', sans-serif",
  fontWeight: 500,
  fontSize: '13px',
  color: '#ef4444',
  background: 'transparent',
  border: '1px solid rgba(239,68,68,0.4)',
  borderRadius: 8,
  padding: '8px 18px',
  cursor: 'pointer',
  transition: 'all 0.15s',
  whiteSpace: 'nowrap' as const,
}

export default function AccountSettingsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [name, setName] = useState(user?.name ?? 'Abrar Nasir')
  const email = user?.email ?? 'abrar@tradelikeme.xyz'

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [twoFAEnabled, setTwoFAEnabled] = useState(user?.twoFactorEnabled ?? true)

  const googleConnected = true
  const phantomAddress = 'HgcX7tJLhHTBUXmWskaohFcr4J1NR66FMwR7iAPawP7F'

  function handleSaveProfile() {
    toast.success('Profile updated')
  }

  function handleUpdatePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    toast.success('Password updated')
  }

  function handleToggle2FA() {
    setTwoFAEnabled(prev => !prev)
    toast.success(twoFAEnabled ? '2FA disabled' : '2FA enabled')
  }

  function handleSignOutAll() {
    toast.success('All other sessions signed out')
  }

  function handleDisconnectGoogle() {
    toast.success('Google account disconnected')
  }

  function handleConnectGithub() {
    toast.info('GitHub OAuth coming soon')
  }

  function handleDisconnectPhantom() {
    toast.success('Phantom wallet disconnected')
  }

  function handleExportData() {
    toast.success('Export started — check your email shortly')
  }

  function handleDeleteAccount() {
    toast.error('Account deletion requires email confirmation. Check your inbox.')
  }

  const initials = (name || 'U').charAt(0).toUpperCase()

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
            Account Settings
          </h2>
        </div>

        {/* Main content */}
        <main
          style={{
            padding: '2rem',
            maxWidth: 800,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >

          {/* Section 1 — Profile */}
          <section>
            <p style={sectionTitleStyle}>Profile</p>
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    background: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Barlow', sans-serif",
                      fontWeight: 700,
                      fontSize: '20px',
                      color: '#fff',
                    }}
                  >
                    {initials}
                  </span>
                </div>
                <div>
                  <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '15px', color: '#fff', margin: 0 }}>
                    {name || 'User'}
                  </p>
                  <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                    {email}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={labelStyle}>Display Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      value={email}
                      disabled
                      style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed', paddingRight: 38 }}
                    />
                    <Lock
                      size={13}
                      color="rgba(255,255,255,0.3)"
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveProfile}
                style={btnPrimary}
                onMouseEnter={e => (e.currentTarget.style.background = '#2563eb')}
                onMouseLeave={e => (e.currentTarget.style.background = '#3b82f6')}
              >
                Save Profile
              </button>
            </div>
          </section>

          {/* Section 2 — Security */}
          <section>
            <p style={sectionTitleStyle}>Security</p>
            <div style={cardStyle}>
              {/* Change password */}
              <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '14px', color: '#fff', marginTop: 0, marginBottom: '1rem' }}>
                  Change Password
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Current password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>New password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Confirm new password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      style={inputStyle}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleUpdatePassword}
                  style={btnPrimary}
                  onMouseEnter={e => (e.currentTarget.style.background = '#2563eb')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#3b82f6')}
                >
                  Update Password
                </button>
              </div>

              {/* 2FA row */}
              <div style={{ ...rowStyle }}>
                <div>
                  <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '14px', color: '#fff', margin: 0 }}>
                    Two-Factor Authentication
                  </p>
                  <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: '2px 0 0 0' }}>
                    TOTP via authenticator app
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span
                    style={{
                      fontFamily: "'Barlow', sans-serif",
                      fontWeight: 500,
                      fontSize: '12px',
                      color: twoFAEnabled ? '#22c55e' : '#ef4444',
                      background: twoFAEnabled ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)',
                      borderRadius: 9999,
                      padding: '2px 10px',
                    }}
                  >
                    {twoFAEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <button
                    type="button"
                    onClick={handleToggle2FA}
                    style={btnOutline}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; e.currentTarget.style.color = '#fff' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
                  >
                    {twoFAEnabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>

              {/* Active sessions row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0' }}>
                <div>
                  <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '14px', color: '#fff', margin: 0 }}>
                    Active Sessions
                  </p>
                  <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: '2px 0 0 0' }}>
                    1 session active
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSignOutAll}
                  style={btnOutline}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
                >
                  Sign out all others
                </button>
              </div>
            </div>
          </section>

          {/* Section 3 — Connected Accounts */}
          <section>
            <p style={sectionTitleStyle}>Connected Accounts</p>
            <div style={cardStyle}>
              {/* Google */}
              <div style={rowStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: '#EA4335',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '12px', color: '#fff' }}>G</span>
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '14px', color: '#fff', margin: 0 }}>
                      Google
                    </p>
                    {googleConnected && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                        <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                          abrar@tradelikeme.xyz
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {googleConnected ? (
                  <button
                    type="button"
                    onClick={handleDisconnectGoogle}
                    style={btnOutline}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; e.currentTarget.style.color = '#fff' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
                  >
                    Disconnect
                  </button>
                ) : null}
              </div>

              {/* GitHub */}
              <div style={rowStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: '#24292e',
                      border: '1px solid rgba(255,255,255,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '12px', color: '#fff' }}>G</span>
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '14px', color: '#fff', margin: 0 }}>
                      GitHub
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
                      <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
                        Not connected
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleConnectGithub}
                  style={btnPrimary}
                  onMouseEnter={e => (e.currentTarget.style.background = '#2563eb')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#3b82f6')}
                >
                  Connect
                </button>
              </div>

              {/* Phantom */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: '#AB9FF2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '12px', color: '#1a1230' }}>P</span>
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '14px', color: '#fff', margin: 0 }}>
                      Phantom Wallet
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#8b5cf6' }} />
                      <span
                        style={{
                          fontFamily: "'Barlow', sans-serif",
                          fontWeight: 300,
                          fontSize: '12px',
                          color: 'rgba(255,255,255,0.4)',
                          fontFeatureSettings: '"tnum"',
                        }}
                      >
                        {phantomAddress.slice(0, 4)}...{phantomAddress.slice(-3)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDisconnectPhantom}
                  style={btnOutline}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
                >
                  Disconnect
                </button>
              </div>
            </div>
          </section>

          {/* Section 4 — Danger Zone */}
          <section>
            <p style={sectionTitleStyle}>Danger Zone</p>
            <div
              style={{
                ...cardStyle,
                border: '1px solid rgba(239,68,68,0.3)',
              }}
            >
              {/* Delete account */}
              <div style={{ ...rowStyle, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ flex: 1, marginRight: '1rem' }}>
                  <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '14px', color: '#fff', margin: 0 }}>
                    Delete Account
                  </p>
                  <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: '3px 0 0 0' }}>
                    Permanently delete your account and all data. This cannot be undone.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  style={{ ...btnDanger, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = '#ef4444' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)' }}
                >
                  <Trash2 size={13} />
                  Delete Account
                </button>
              </div>

              {/* Export data */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0' }}>
                <div style={{ flex: 1, marginRight: '1rem' }}>
                  <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '14px', color: '#fff', margin: 0 }}>
                    Export Data
                  </p>
                  <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: '3px 0 0 0' }}>
                    Download all your trade history and account data.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportData}
                  style={{ ...btnOutline, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
                >
                  <Download size={13} />
                  Export
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
