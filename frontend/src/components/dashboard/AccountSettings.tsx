import { motion } from 'framer-motion'
import { Copy, LogOut, Moon } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  user: {
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
    twoFactorEnabled?: boolean
  } | null
  walletAddress?: string | null
  oauthProvider?: string | null
  onLogout: () => void
}

function ProviderBadge({ provider }: { provider: string | null | undefined }) {
  if (!provider) {
    return (
      <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
        Email / Password
      </span>
    )
  }

  const configs: Record<string, { bg: string; text: string; label: string }> = {
    google: { bg: '#EA4335', text: '#fff', label: 'Google' },
    github: { bg: '#24292e', text: '#fff', label: 'GitHub' },
    phantom: { bg: '#AB9FF2', text: '#1a1230', label: 'Phantom' },
  }

  const cfg = configs[provider.toLowerCase()] ?? { bg: 'rgba(255,255,255,0.15)', text: '#fff', label: provider }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: cfg.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '10px', color: cfg.text, lineHeight: 1 }}>
          {cfg.label.charAt(0).toUpperCase()}
        </span>
      </div>
      <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
        {cfg.label}
      </span>
    </div>
  )
}

const divider = { borderTop: '1px solid rgba(255,255,255,0.06)', margin: '0' }
const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.75rem 0',
}
const labelStyle: React.CSSProperties = {
  fontFamily: "'Barlow', sans-serif",
  fontWeight: 300,
  fontSize: '12px',
  color: 'rgba(255,255,255,0.4)',
}

export default function AccountSettings({ user, walletAddress, oauthProvider, onLogout }: Props) {
  const twoFactorEnabled = user?.twoFactorEnabled ?? true

  function handleCopyWallet() {
    if (!walletAddress) return
    navigator.clipboard.writeText(walletAddress)
    toast.success('Address copied')
  }

  return (
    <motion.div
      className="liquid-glass"
      style={{ borderRadius: '1.75rem', padding: '1.75rem', display: 'flex', flexDirection: 'column' }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '15px', color: '#fff', marginBottom: '0.25rem' }}>
        Account
      </span>

      <div style={divider} />

      <div style={rowStyle}>
        <span style={labelStyle}>Wallet</span>
        {walletAddress ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontFeatureSettings: '"tnum"' }}>
              {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
            </span>
            <button
              onClick={handleCopyWallet}
              title="Copy address"
              style={{ display: 'inline-flex', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', color: 'rgba(255,255,255,0.3)', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
            >
              <Copy size={12} />
            </button>
          </div>
        ) : (
          <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '13px', color: 'rgba(255,255,255,0.25)' }}>
            No wallet connected
          </span>
        )}
      </div>

      <div style={divider} />

      <div style={rowStyle}>
        <span style={labelStyle}>Connected via</span>
        <ProviderBadge provider={oauthProvider} />
      </div>

      <div style={divider} />

      <div style={rowStyle}>
        <span style={labelStyle}>2FA</span>
        <span style={{
          fontFamily: "'Barlow', sans-serif",
          fontWeight: 500,
          fontSize: '13px',
          color: twoFactorEnabled ? '#22c55e' : '#ef4444',
        }}>
          {twoFactorEnabled ? 'Enabled ✓' : 'Disabled'}
        </span>
      </div>

      <div style={divider} />

      <div style={rowStyle}>
        <span style={labelStyle}>Theme</span>
        <button
          disabled
          title="Dark mode only"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 400,
            fontSize: '13px',
            color: 'rgba(255,255,255,0.5)',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 9999,
            padding: '5px 14px',
            cursor: 'default',
            opacity: 0.5,
          }}
        >
          <Moon size={13} />
          Dark Mode
        </button>
      </div>

      <div style={{ ...divider, marginBottom: '0.75rem' }} />

      <button
        onClick={onLogout}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          width: '100%',
          fontFamily: "'Barlow', sans-serif",
          fontWeight: 500,
          fontSize: '14px',
          color: 'rgba(239,68,68,0.7)',
          background: 'transparent',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 9999,
          padding: '10px 24px',
          cursor: 'pointer',
          transition: 'border-color 0.15s, color 0.15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = '#ef4444'
          e.currentTarget.style.color = '#ef4444'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'
          e.currentTarget.style.color = 'rgba(239,68,68,0.7)'
        }}
      >
        <LogOut size={15} />
        Log out
      </button>
    </motion.div>
  )
}
