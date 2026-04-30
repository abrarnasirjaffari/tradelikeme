import { useState } from 'react'
import { ChevronDown, ArrowUpRight } from 'lucide-react'
import { DOC_SECTIONS, type DocSection } from './docsNav'

function navigate(path: string) {
  window.history.pushState({}, '', path)
  window.scrollTo(0, 0)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

function navigateDoc(id: string) {
  navigate(`/docs/${id}`)
}

const AUDIENCE_COLORS: Record<DocSection['audience'], string> = {
  investor: '#0052FF',
  trader:   '#22C55E',
  shared:   'rgba(255,255,255,0.55)',
}

export default function DocsHeader({ activeId }: { activeId: string }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  // Find active label for mobile dropdown
  let activeLabel = 'Select page'
  for (const s of DOC_SECTIONS) {
    const item = s.items.find(i => i.id === activeId)
    if (item) { activeLabel = item.label; break }
  }

  return (
    <>
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: 64,
        background: 'rgba(8,12,24,0.97)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
      }}>
        {/* Logo column — exactly 272px wide, matching sidebar width */}
        <div style={{
          width: 272,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '1.5rem',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          height: '100%',
        }}>
          <button
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: '1.1rem', letterSpacing: '-0.5px' }}>TradeLikeMe</span>
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '13px', color: 'rgba(255,255,255,0.25)' }}>/</span>
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>Docs</span>
          </button>
        </div>

        {/* Content column — aligned with main content area */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem' }}>
          {/* Desktop: section nav — starts exactly at content left edge */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: '0.125rem' }}>
            {DOC_SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => navigateDoc(s.items[0].id)}
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 500,
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.5)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '5px 14px',
                  borderRadius: 9999,
                  transition: 'color 0.15s, background 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#fff'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
                  e.currentTarget.style.background = 'none'
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: AUDIENCE_COLORS[s.audience], flexShrink: 0, display: 'inline-block' }} />
                {s.label}
              </button>
            ))}
          </div>

          {/* Right: back to site */}
          <button
            onClick={() => navigate('/')}
            style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 500,
              fontSize: '13px',
              color: 'rgba(255,255,255,0.4)',
              background: 'none',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 9999,
              padding: '5px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              flexShrink: 0,
              transition: 'color 0.15s, border-color 0.15s',
              marginLeft: 'auto',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#fff'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.4)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
            }}
          >
            Back to site <ArrowUpRight size={13} />
          </button>
        </div>
      </header>

      {/* Mobile: top bar dropdown (below header, fixed) */}
      <div className="flex md:hidden" style={{
        position: 'fixed',
        top: 64,
        left: 0,
        right: 0,
        zIndex: 49,
        background: 'rgba(2,4,12,0.98)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '0.75rem 1.25rem',
      }}>
        <button
          onClick={() => setMobileOpen(v => !v)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '0.625rem',
            padding: '0.6rem 1rem',
            cursor: 'pointer',
          }}
        >
          <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '14px', color: '#fff' }}>{activeLabel}</span>
          <ChevronDown size={15} color="rgba(255,255,255,0.4)" style={{ transform: mobileOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>

        {mobileOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '1.25rem',
            right: '1.25rem',
            background: 'rgba(8,10,24,0.98)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '0.875rem',
            padding: '0.75rem 0',
            maxHeight: '70vh',
            overflowY: 'auto',
            boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
          }}>
            {DOC_SECTIONS.map(section => (
              <div key={section.id}>
                <div style={{ padding: '0.35rem 1rem 0.25rem', fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: AUDIENCE_COLORS[section.audience] }}>
                  {section.label}
                </div>
                {section.items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { navigateDoc(item.id); setMobileOpen(false) }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.55rem 1rem 0.55rem 1.5rem',
                      background: item.id === activeId ? 'rgba(0,82,255,0.1)' : 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '14px', color: item.id === activeId ? '#fff' : 'rgba(255,255,255,0.6)' }}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
