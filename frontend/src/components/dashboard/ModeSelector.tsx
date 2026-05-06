import { useState } from 'react'
import { Layers, KeyRound } from 'lucide-react'

interface Props {
  mode: 'solana' | 'cex'
  onModeChange: (m: 'solana' | 'cex') => void
}

export default function ModeSelector({ mode, onModeChange }: Props) {
  const [apiKey, setApiKey] = useState('')
  const [apiSecret, setApiSecret] = useState('')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '0.75rem' }}>
        {/* Solana Vault card */}
        <button
          type="button"
          onClick={() => onModeChange('solana')}
          style={{
            flex: 1,
            borderRadius: '1rem',
            padding: '1.25rem 1.5rem',
            cursor: 'pointer',
            textAlign: 'left',
            background: mode === 'solana' ? 'rgba(0,82,255,0.12)' : 'rgba(255,255,255,0.04)',
            outline: mode === 'solana' ? '1.5px solid #0052FF' : '1px solid rgba(255,255,255,0.1)',
            border: 'none',
            transition: 'all 0.15s',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} color="#AB9FF2" strokeWidth={1.8} />
          </div>
          <p style={{
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 600,
            fontSize: '14px',
            color: '#fff',
            margin: 0,
          }}>Solana Vault</p>
          <p style={{
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 300,
            fontSize: '12px',
            color: 'rgba(255,255,255,0.4)',
            margin: 0,
          }}>Phantom wallet · trustless on-chain</p>
        </button>

        {/* CEX API card */}
        <button
          type="button"
          onClick={() => onModeChange('cex')}
          style={{
            flex: 1,
            borderRadius: '1rem',
            padding: '1.25rem 1.5rem',
            cursor: 'pointer',
            textAlign: 'left',
            background: mode === 'cex' ? 'rgba(0,82,255,0.12)' : 'rgba(255,255,255,0.04)',
            outline: mode === 'cex' ? '1.5px solid #0052FF' : '1px solid rgba(255,255,255,0.1)',
            border: 'none',
            transition: 'all 0.15s',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <KeyRound size={18} color="#0052FF" strokeWidth={1.8} />
          </div>
          <p style={{
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 600,
            fontSize: '14px',
            color: '#fff',
            margin: 0,
          }}>CEX API</p>
          <p style={{
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 300,
            fontSize: '12px',
            color: 'rgba(255,255,255,0.4)',
            margin: 0,
          }}>Connect exchange API key</p>
        </button>
      </div>

      {mode === 'cex' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
          <input
            type="text"
            placeholder="API Key"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            className="liquid-glass"
            style={{
              borderRadius: '0.75rem',
              padding: '10px 14px',
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 400,
              fontSize: '13px',
              color: '#fff',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              width: '100%',
            }}
          />
          <input
            type="password"
            placeholder="API Secret"
            value={apiSecret}
            onChange={e => setApiSecret(e.target.value)}
            className="liquid-glass"
            style={{
              borderRadius: '0.75rem',
              padding: '10px 14px',
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 400,
              fontSize: '13px',
              color: '#fff',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              width: '100%',
            }}
          />
          <button
            type="button"
            style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 600,
              fontSize: '13px',
              color: '#fff',
              background: '#0052FF',
              border: 'none',
              borderRadius: 9999,
              padding: '10px 24px',
              cursor: 'pointer',
              alignSelf: 'flex-start',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1a6aff' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#0052FF' }}
          >
            Connect
          </button>
          <p style={{
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 300,
            fontSize: '11px',
            color: 'rgba(255,255,255,0.3)',
            margin: 0,
          }}>Trade-only keys · we never withdraw</p>
        </div>
      )}
    </div>
  )
}
