import type { Mode, Exchange } from './investorFormState'
import { EXCHANGES } from './investorFormState'
import { labelStyle, fieldWrap, chipBase } from './formStyles'

interface Props {
  mode: Mode
  exchanges: Exchange[]
  otherExchange: string
  onMode: (m: Mode) => void
  onToggleExchange: (e: Exchange) => void
  onOther: (v: string) => void
}

const modeCards: { val: Mode; label: string; sub: string }[] = [
  { val: 'solana', label: 'Solana Vault',  sub: 'Connect Phantom Wallet — trustless, on-chain' },
  { val: 'cex',    label: 'CEX API',       sub: 'Connect your exchange — Binance, Bybit, etc.' },
]

export default function ModePicker({ mode, exchanges, otherExchange, onMode, onToggleExchange, onOther }: Props) {
  return (
    <div style={fieldWrap}>
      <label style={labelStyle}>How would you like to trade?</label>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        {modeCards.map(({ val, label, sub }) => (
          <button key={val} type="button" onClick={() => onMode(val)}
            style={{
              borderRadius: '0.875rem', padding: '1rem', textAlign: 'left', cursor: 'pointer',
              border: 'none', background: mode === val ? 'rgba(0,82,255,0.15)' : 'rgba(255,255,255,0.04)',
              outline: mode === val ? '1.5px solid #0052FF' : '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.15s',
            }}
          >
            <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '14px', color: '#fff', margin: 0 }}>{label}</p>
            <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '3px 0 0' }}>{sub}</p>
          </button>
        ))}
      </div>

      {mode === 'cex' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginTop: '0.5rem' }}>
          <label style={{ ...labelStyle, fontSize: '10px' }}>Which exchange(s) do you use?</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {EXCHANGES.map(({ val, label }) => (
              <button key={val} type="button"
                onClick={() => onToggleExchange(val)}
                style={chipBase(exchanges.includes(val))}
              >{label}</button>
            ))}
          </div>
          {exchanges.includes('other') && (
            <input type="text" placeholder="Exchange name" value={otherExchange}
              onChange={e => onOther(e.target.value)}
              className="liquid-glass"
              style={{ borderRadius: '0.75rem', padding: '10px 14px', fontFamily: "'Barlow', sans-serif", fontSize: '13px', color: '#fff', border: 'none', outline: 'none', background: 'transparent', marginTop: '0.25rem' }}
            />
          )}
        </div>
      )}
    </div>
  )
}
