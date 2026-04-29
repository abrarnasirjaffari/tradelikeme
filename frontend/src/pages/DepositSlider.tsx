import { labelStyle, fieldWrap } from './formStyles'

interface Props {
  value: number
  onChange: (v: number) => void
}

export default function DepositSlider({ value, onChange }: Props) {
  const pct = ((value - 100) / (10000 - 100)) * 100

  return (
    <div style={fieldWrap}>
      <label style={labelStyle}>Starting deposit amount</label>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: '1.9rem', letterSpacing: '-1px' }}>
          ${value.toLocaleString()}
        </span>
        <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
          you can change this anytime
        </span>
      </div>

      <div style={{ position: 'relative', height: 6, borderRadius: 9999, background: 'rgba(255,255,255,0.1)', margin: '0.25rem 0' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 9999, background: 'linear-gradient(90deg,#0052FF,#22C55E)', width: `${pct}%`, pointerEvents: 'none' }} />
        <input type="range" min={100} max={10000} step={100} value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', margin: 0 }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>$100</span>
        <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>$10,000</span>
      </div>

      {value >= 10000 && (
        <div style={{ background: 'rgba(0,82,255,0.1)', border: '1px solid rgba(0,82,255,0.3)', borderRadius: '0.75rem', padding: '0.875rem 1rem', marginTop: '0.25rem' }}>
          <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '13px', color: '#fff', margin: '0 0 3px' }}>
            Looking to invest more than $10,000?
          </p>
          <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.55 }}>
            Connect with our team for institutional access — lower fees, higher leverage, higher margin, and dedicated support.
          </p>
        </div>
      )}
    </div>
  )
}
