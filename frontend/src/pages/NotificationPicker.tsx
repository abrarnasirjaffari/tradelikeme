import type { Notification } from './investorFormState'
import { NOTIFICATIONS } from './investorFormState'
import { labelStyle, fieldWrap } from './formStyles'

interface Props {
  selected: Notification[]
  onToggle: (n: Notification) => void
}

export default function NotificationPicker({ selected, onToggle }: Props) {
  return (
    <div style={fieldWrap}>
      <label style={labelStyle}>How should we notify you?</label>
      <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
        {NOTIFICATIONS.map(({ val, label, sub }) => {
          const active = selected.includes(val)
          return (
            <button key={val} type="button" onClick={() => onToggle(val)}
              style={{
                borderRadius: '0.875rem', padding: '0.75rem 1rem', cursor: 'pointer',
                border: 'none', textAlign: 'left', transition: 'all 0.15s',
                background: active ? 'rgba(0,82,255,0.15)' : 'rgba(255,255,255,0.04)',
                outline: active ? '1.5px solid #0052FF' : '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '13px', color: '#fff', margin: 0 }}>{label}</p>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: '2px 0 0' }}>{sub}</p>
            </button>
          )
        })}
      </div>
      <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.25)', margin: '0.25rem 0 0' }}>
        Pick all that apply — we'll notify you on every channel you select.
      </p>
    </div>
  )
}
