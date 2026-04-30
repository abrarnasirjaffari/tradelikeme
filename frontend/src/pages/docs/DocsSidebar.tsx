import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { DOC_SECTIONS, type DocSection } from './docsNav'

function navigate(id: string) {
  window.history.pushState({}, '', `/docs/${id}`)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

const AUDIENCE_COLORS: Record<DocSection['audience'], string> = {
  investor: '#4d8aff',
  trader:   '#22C55E',
  shared:   'rgba(255,255,255,0.45)',
}

export default function DocsSidebar({ activeId }: { activeId: string }) {
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    for (const s of DOC_SECTIONS) {
      const hasActive = s.items.some(i => i.id === activeId)
      init[s.id] = hasActive || s.id === 'platform'
    }
    return init
  })

  const toggle = (id: string) => setOpen(prev => ({ ...prev, [id]: !prev[id] }))

  return (
    <aside style={{
      width: 272,
      flexShrink: 0,
      borderRight: '1px solid rgba(255,255,255,0.07)',
      padding: '2rem 0 4rem',
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
    }}>
      {DOC_SECTIONS.map((section, si) => {
        const isOpen = open[section.id]
        const color = AUDIENCE_COLORS[section.audience]
        return (
          <div key={section.id} style={{ marginBottom: isOpen ? '0.5rem' : 0 }}>
            {/* Section divider (not before first) */}
            {si > 0 && (
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0.75rem 1.5rem' }} />
            )}

            {/* Section header */}
            <button
              onClick={() => toggle(section.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem 1.5rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                gap: '0.5rem',
                marginBottom: '0.25rem',
              }}
            >
              <span style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 700,
                fontSize: '11px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color,
              }}>
                {section.label}
              </span>
              {isOpen
                ? <ChevronDown size={12} color="rgba(255,255,255,0.25)" />
                : <ChevronRight size={12} color="rgba(255,255,255,0.25)" />
              }
            </button>

            {/* Items */}
            {isOpen && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {section.items.map(item => {
                  const isActive = item.id === activeId
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.id)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.5rem 1.5rem 0.5rem 1.75rem',
                        background: isActive ? 'rgba(0,82,255,0.12)' : 'transparent',
                        borderLeft: 'none',
                        borderRight: 'none',
                        borderTop: 'none',
                        borderBottom: 'none',
                        outline: 'none',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'background 0.12s',
                      }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <span style={{
                          position: 'absolute',
                          left: 0,
                          top: '20%',
                          bottom: '20%',
                          width: 2,
                          background: '#0052FF',
                          borderRadius: 2,
                        }} />
                      )}
                      <span style={{
                        fontFamily: "'Barlow', sans-serif",
                        fontWeight: isActive ? 500 : 400,
                        fontSize: '13.5px',
                        color: isActive ? '#fff' : 'rgba(255,255,255,0.48)',
                        lineHeight: 1.45,
                        transition: 'color 0.12s',
                        display: 'block',
                      }}>
                        {item.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </aside>
  )
}
