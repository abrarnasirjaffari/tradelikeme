import { useState } from 'react'
import { ArrowUpRight, X, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'

function navigate(path: string) {
  window.history.pushState({}, '', path)
  window.scrollTo(0, 0)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

const NAV_LINKS = [
  { label: 'Home',        path: '/' },
  { label: 'Pricing',     path: '/pricing' },
  { label: 'Blog',        path: '/blog' },
  { label: 'Open Source', path: '/open-source' },
]

export default function WaitlistNavbar() {
  const [open, setOpen] = useState(false)
  const { user, walletAddress, signOut } = useAuth()

  const shortWallet = walletAddress
    ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
    : null

  const displayName = shortWallet
    ?? (user?.name ? user.name.split(' ')[0] : null)
    ?? (user?.email ? user.email.split('@')[0] : null)

  async function handleSignOut() {
    setOpen(false)
    await signOut()
    toast.success('Signed out')
    navigate('/')
  }

  return (
    <>
      <nav className="fixed top-4 left-0 right-0 z-50 flex items-center justify-between" style={{ padding: '0 clamp(1rem, 5vw, 5rem)' }}>
        <button onClick={() => navigate('/')}
          className="liquid-glass"
          style={{ borderRadius: 9999, padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: 'none', cursor: 'pointer', background: 'transparent' }}
        >
          <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: '1.1rem', letterSpacing: '-0.5px', lineHeight: 1, whiteSpace: 'nowrap' }}>TradeLikeMe</span>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center liquid-glass rounded-full gap-1" style={{ padding: '6px 6px 6px 8px' }}>
          {NAV_LINKS.map(({ label, path }) => (
            <button key={label} onClick={() => navigate(path)}
              style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, padding: '8px 18px', fontSize: '14px', color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap', borderRadius: 9999, border: 'none', background: 'transparent', cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
            >{label}</button>
          ))}
          {displayName ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="liquid-glass" style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '13px', color: shortWallet ? '#AB9FF2' : 'rgba(255,255,255,0.85)', padding: '8px 16px', borderRadius: 9999, letterSpacing: '0.01em' }}>
                {displayName}
              </span>
              <button onClick={handleSignOut} title="Sign out"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', padding: '8px 6px', borderRadius: 9999, transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <>
              <button onClick={() => navigate('/login')}
                style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, padding: '8px 18px', fontSize: '14px', color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap', borderRadius: 9999, border: 'none', background: 'transparent', cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
              >Log In</button>
              <button onClick={() => navigate('/signup')}
                style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '14px', background: '#0052FF', color: '#fff', borderRadius: 9999, padding: '8px 20px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                Sign Up <ArrowUpRight size={14} />
              </button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="liquid-glass nav-hamburger" style={{ borderRadius: '0.625rem' }} onClick={() => setOpen(true)} aria-label="Open menu">
          <span /><span /><span />
        </button>

        <div className="hidden md:block w-12 h-12 flex-shrink-0" />
      </nav>

      {/* Mobile menu overlay */}
      {open && (
        <div className="mobile-menu">
          <button onClick={() => setOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }}>
            <X size={24} />
          </button>
          <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: '1.5rem', letterSpacing: '-0.5px', marginBottom: '1rem' }}>TradeLikeMe</span>
          {NAV_LINKS.map(({ label, path }) => (
            <button key={label} onClick={() => { navigate(path); setOpen(false) }}
              style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '1.25rem', color: 'rgba(255,255,255,0.8)', background: 'none', border: 'none', cursor: 'pointer' }}
            >{label}</button>
          ))}
          <div style={{ width: 48, height: 1, background: 'rgba(255,255,255,0.1)', margin: '0.5rem 0' }} />
          {displayName ? (
            <button onClick={handleSignOut}
              style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '15px', color: 'rgba(255,255,255,0.6)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, marginTop: '0.5rem' }}
            >
              <LogOut size={15} /> Sign Out ({displayName})
            </button>
          ) : (
            <button onClick={() => { navigate('/signup'); setOpen(false) }}
              style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '15px', background: '#0052FF', color: '#fff', borderRadius: 9999, padding: '12px 32px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginTop: '0.5rem' }}
            >
              Sign Up <ArrowUpRight size={15} />
            </button>
          )}
        </div>
      )}
    </>
  )
}
