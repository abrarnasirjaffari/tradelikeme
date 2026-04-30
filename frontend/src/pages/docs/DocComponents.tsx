import type { ReactNode, CSSProperties } from 'react'

const body: CSSProperties = {
  fontFamily: "'Barlow', sans-serif",
  fontWeight: 300,
  fontSize: '0.975rem',
  color: 'rgba(255,255,255,0.62)',
  lineHeight: 1.85,
  margin: 0,
}

const mono: CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: '0.84rem',
}

export function DocBadge({ children, color = '#0052FF' }: { children: ReactNode; color?: string }) {
  return (
    <span style={{
      fontFamily: "'Barlow', sans-serif",
      fontWeight: 600,
      fontSize: '11px',
      letterSpacing: '0.1em',
      textTransform: 'uppercase' as const,
      color,
      background: `${color}18`,
      border: `1px solid ${color}30`,
      borderRadius: 9999,
      padding: '4px 12px',
      alignSelf: 'flex-start',
      display: 'inline-block',
    }}>{children}</span>
  )
}

export function DocH1({ children }: { children: ReactNode }) {
  return (
    <h1 style={{
      fontFamily: "'Instrument Serif', serif",
      fontStyle: 'italic',
      color: '#fff',
      fontSize: 'clamp(2.1rem, 4vw, 3rem)',
      lineHeight: 1.05,
      letterSpacing: '-1.5px',
      margin: 0,
    }}>{children}</h1>
  )
}

export function DocH2({ children }: { children: ReactNode }) {
  return (
    <h2 style={{
      fontFamily: "'Instrument Serif', serif",
      fontStyle: 'italic',
      color: '#fff',
      fontSize: '1.55rem',
      lineHeight: 1.15,
      letterSpacing: '-0.5px',
      margin: 0,
      paddingTop: '0.25rem',
    }}>{children}</h2>
  )
}

export function DocH3({ children }: { children: ReactNode }) {
  return (
    <h3 style={{
      fontFamily: "'Barlow', sans-serif",
      fontWeight: 600,
      color: 'rgba(255,255,255,0.85)',
      fontSize: '0.95rem',
      lineHeight: 1.4,
      margin: 0,
      letterSpacing: '0.01em',
    }}>{children}</h3>
  )
}

export function DocP({ children }: { children: ReactNode }) {
  return <p style={body}>{children}</p>
}

export function DocUl({ items }: { items: string[] }) {
  return (
    <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {items.map((item, i) => (
        <li key={i} style={{ ...body, color: 'rgba(255,255,255,0.58)' }}>{item}</li>
      ))}
    </ul>
  )
}

export function DocCode({ children }: { children: ReactNode }) {
  return (
    <code style={{
      ...mono,
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '0.3rem',
      padding: '2px 7px',
      color: 'rgba(255,255,255,0.88)',
    }}>{children}</code>
  )
}

export function DocCodeBlock({ children, label }: { children: string; label?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {label && (
        <span style={{
          fontFamily: "'Barlow', sans-serif",
          fontWeight: 600,
          fontSize: '11px',
          color: 'rgba(255,255,255,0.28)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>{label}</span>
      )}
      <pre style={{
        ...mono,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '0.875rem',
        padding: '1.5rem 1.75rem',
        color: 'rgba(255,255,255,0.72)',
        overflowX: 'auto',
        lineHeight: 1.75,
        whiteSpace: 'pre',
        margin: 0,
      }}>{children}</pre>
    </div>
  )
}

export function DocDivider() {
  return <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '0.25rem 0' }} />
}

export function DocCallout({ children, type = 'info' }: { children: ReactNode; type?: 'info' | 'warning' | 'success' }) {
  const colors = {
    info:    { bg: 'rgba(0,82,255,0.08)',   border: 'rgba(0,82,255,0.22)',   icon: 'ℹ',  text: '#5580ff' },
    warning: { bg: 'rgba(255,165,0,0.07)',  border: 'rgba(255,165,0,0.22)',  icon: '⚠',  text: '#e6a020' },
    success: { bg: 'rgba(34,197,94,0.07)',  border: 'rgba(34,197,94,0.22)', icon: '✓',  text: '#22C55E' },
  }
  const c = colors[type]
  return (
    <div style={{
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: '0.875rem',
      padding: '1rem 1.25rem',
      display: 'flex',
      gap: '0.875rem',
      alignItems: 'flex-start',
    }}>
      <span style={{ color: c.text, flexShrink: 0, fontSize: '15px', lineHeight: 1.85, fontWeight: 600 }}>{c.icon}</span>
      <span style={{ ...body, color: 'rgba(255,255,255,0.68)', fontSize: '0.92rem' }}>{children}</span>
    </div>
  )
}

export function DocTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div style={{
      overflowX: 'auto',
      borderRadius: '0.875rem',
      border: '1px solid rgba(255,255,255,0.08)',
    }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontFamily: "'Barlow', sans-serif",
        fontSize: '13.5px',
      }}>
        <thead>
          <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
            {headers.map((h, i) => (
              <th key={i} style={{
                textAlign: 'left',
                padding: '0.75rem 1.1rem',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.45)',
                fontWeight: 600,
                fontSize: '12px',
                letterSpacing: '0.05em',
                whiteSpace: 'nowrap',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{
              borderBottom: ri < rows.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              transition: 'background 0.1s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {row.map((cell, ci) => (
                <td key={ci} style={{
                  padding: '0.75rem 1.1rem',
                  color: ci === 0 ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.55)',
                  verticalAlign: 'top',
                  lineHeight: 1.65,
                  fontWeight: ci === 0 ? 500 : 300,
                }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function DocSection({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {children}
    </div>
  )
}

export function DocPage({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.75rem', paddingBottom: '2rem' }}>
      {children}
    </div>
  )
}
