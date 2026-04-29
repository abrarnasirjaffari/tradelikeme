import { useState } from 'react'
import { ArrowUpRight, X } from 'lucide-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <nav className="fixed top-4 left-0 right-0 z-50 flex items-center justify-between" style={{ padding: '0 clamp(1rem, 5vw, 5rem)' }}>
        <div className="liquid-glass" style={{ borderRadius: 9999, padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: '1.1rem', letterSpacing: '-0.5px', lineHeight: 1, whiteSpace: 'nowrap' }}>TradeLikeMe</span>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center liquid-glass rounded-full gap-1" style={{ padding: '6px 6px 6px 8px' }}>
          {['How It Works', 'Marketplace', 'Pricing', 'Sponsor'].map((link) => (
            <a key={link} href="#"
              style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, padding: '8px 18px', fontSize: '14px', color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap', borderRadius: 9999, textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
            >{link}</a>
          ))}
          <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.15)', margin: '0 6px', flexShrink: 0 }} />
          <a href="#" style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '14px', color: 'rgba(255,255,255,0.8)', padding: '8px 16px', textDecoration: 'none', whiteSpace: 'nowrap' }}>Log in</a>
          <button style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '14px', background: '#0052FF', color: '#fff', borderRadius: 9999, padding: '8px 20px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', flexShrink: 0 }}>
            Start Trading <ArrowUpRight size={14} />
          </button>
        </div>

        {/* Mobile hamburger (hidden on desktop via CSS) */}
        <button className="liquid-glass nav-hamburger" style={{ borderRadius: '0.625rem' }} onClick={() => setOpen(true)} aria-label="Open menu">
          <span /><span /><span />
        </button>

        {/* Desktop right-side spacer to balance logo position */}
        <div className="hidden md:block w-12 h-12 flex-shrink-0" />
      </nav>

      {/* Mobile menu overlay */}
      {open && (
        <div className="mobile-menu">
          <button onClick={() => setOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }}>
            <X size={24} />
          </button>
          <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: '1.5rem', letterSpacing: '-0.5px', marginBottom: '1rem' }}>TradeLikeMe</span>
          {['How It Works', 'Marketplace', 'Pricing', 'Sponsor'].map((link) => (
            <a key={link} href="#" onClick={() => setOpen(false)}
              style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '1.25rem', color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}
            >{link}</a>
          ))}
          <div style={{ width: 48, height: 1, background: 'rgba(255,255,255,0.1)', margin: '0.5rem 0' }} />
          <a href="#" style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '1.125rem', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Log in</a>
          <button style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '15px', background: '#0052FF', color: '#fff', borderRadius: 9999, padding: '12px 32px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginTop: '0.5rem' }}>
            Start Trading <ArrowUpRight size={15} />
          </button>
        </div>
      )}
    </>
  )
}
