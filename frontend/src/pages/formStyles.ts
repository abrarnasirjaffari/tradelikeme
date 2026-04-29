import type { CSSProperties } from 'react'

export const inputStyle: CSSProperties = {
  borderRadius: '0.75rem',
  padding: '12px 16px',
  fontFamily: "'Barlow', sans-serif",
  fontSize: '14px',
  color: '#fff',
  border: 'none',
  outline: 'none',
  background: 'transparent',
  width: '100%',
  boxSizing: 'border-box',
}

export const labelStyle: CSSProperties = {
  fontFamily: "'Barlow', sans-serif",
  fontWeight: 600,
  fontSize: '11px',
  color: 'rgba(255,255,255,0.45)',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
}

export const fieldWrap: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.35rem',
}

export const chipBase = (active: boolean): CSSProperties => ({
  borderRadius: '0.625rem',
  padding: '0.6rem 1rem',
  fontFamily: "'Barlow', sans-serif",
  fontWeight: 500,
  fontSize: '13px',
  cursor: 'pointer',
  border: 'none',
  transition: 'all 0.15s',
  background: active ? 'rgba(0,82,255,0.18)' : 'rgba(255,255,255,0.05)',
  color: active ? '#fff' : 'rgba(255,255,255,0.5)',
  outline: active ? '1.5px solid #0052FF' : '1px solid rgba(255,255,255,0.1)',
})
