function navigate(path: string) {
  window.history.pushState({}, '', path)
  window.scrollTo(0, 0)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

type FooterItem =
  | { label: string; path: string }
  | { label: string; href: string }
  | { label: string; soon: true }

const COLS: { heading: string; links: FooterItem[] }[] = [
  {
    heading: 'Product',
    links: [
      { label: 'Marketplace',   soon: true },
      { label: 'Pricing',       path: '/pricing' },
      { label: 'How It Works',  path: '/how-it-works' },
      { label: 'Open Source',   path: '/open-source' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Blog',           path: '/blog' },
      { label: 'Docs',           path: '/docs' },
      { label: 'Strategy Proof', soon: true },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About',   soon: true },
      { label: 'Sponsor', soon: true },
      { label: 'GitHub',  soon: true },
    ],
  },
]

const SOON_LABEL = '9 May 2026'

export default function Footer() {
  return (
    <footer style={{
      position: 'relative',
      background: 'rgba(0,0,0,0.92)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '3rem clamp(1.25rem, 5vw, 10rem)',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
        {/* brand */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: 200 }}>
          <button
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
          >
            <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: '1.25rem', letterSpacing: '-0.5px' }}>
              TradeLikeMe
            </span>
          </button>
          <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '13px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
            The verified-strategy trading marketplace.
          </span>
        </div>

        {/* columns */}
        <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
          {COLS.map((col) => (
            <div key={col.heading} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '13px', color: '#fff' }}>
                {col.heading}
              </span>
              {col.links.map((item) => {
                if ('soon' in item && item.soon) {
                  return (
                    <span
                      key={item.label}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
                    >
                      <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '13px', color: 'rgba(255,255,255,0.2)' }}>
                        {item.label}
                      </span>
                      <span style={{
                        fontFamily: "'Barlow', sans-serif",
                        fontWeight: 600,
                        fontSize: '10px',
                        color: 'rgba(255,255,255,0.35)',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 9999,
                        padding: '1px 7px',
                        whiteSpace: 'nowrap',
                      }}>
                        {SOON_LABEL}
                      </span>
                    </span>
                  )
                }

                if ('href' in item) {
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '13px', color: 'rgba(255,255,255,0.35)', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
                    >
                      {item.label}
                    </a>
                  )
                }

                const pathItem = item as { label: string; path: string }
                return (
                  <button
                    key={item.label}
                    onClick={() => navigate(pathItem.path)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left', fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '13px', color: 'rgba(255,255,255,0.35)', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>
          © 2026 TradeLikeMe. All rights reserved.
        </span>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {[
            { label: 'Privacy Policy', path: '/privacy' },
            { label: 'Terms of Service', path: '/terms' },
          ].map(({ label, path }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '12px', color: 'rgba(255,255,255,0.25)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </footer>
  )
}
