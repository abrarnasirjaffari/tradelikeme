import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { deposit } from '../../services/api'

interface Props {
  vaultId: string
  onClose: () => void
  onSuccess: (amount: number) => void
}

const QUICK_AMOUNTS = [100, 500, 1000, 5000]

export default function DepositModal({ vaultId, onClose, onSuccess }: Props) {
  const [raw, setRaw] = useState('')
  const [loading, setLoading] = useState(false)

  const amount = parseFloat(raw) || 0

  async function handleConfirm() {
    if (amount <= 0) {
      toast.error('Enter a valid amount')
      return
    }
    setLoading(true)
    try {
      await deposit(vaultId, amount)
      toast.success('Deposit submitted')
      onSuccess(amount)
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Deposit failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <motion.div
          className="liquid-glass"
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={e => e.stopPropagation()}
          style={{ borderRadius: '1.75rem', padding: '2rem', maxWidth: 400, width: '90%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
        >
          {/* Header */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <h2 style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '1.25rem', color: '#fff', margin: 0 }}>
              Deposit USDC
            </h2>
            <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.5 }}>
              Funds are deposited to your Solana vault and delegated to the agent.
            </p>
          </div>

          {/* Amount input */}
          <div
            className="liquid-glass"
            style={{ borderRadius: '1rem', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '1.5rem', color: 'rgba(255,255,255,0.4)' }}>$</span>
            <input
              type="number"
              value={raw}
              onChange={e => setRaw(e.target.value)}
              placeholder="0"
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: 'italic',
                fontSize: '1.5rem',
                color: '#fff',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                flex: 1,
                width: '100%',
                minWidth: 0,
              }}
            />
          </div>

          {/* Quick amount chips */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {QUICK_AMOUNTS.map(q => (
              <button
                key={q}
                onClick={() => setRaw(String(q))}
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 500,
                  fontSize: '12px',
                  color: raw === String(q) ? '#fff' : 'rgba(255,255,255,0.55)',
                  background: raw === String(q) ? 'rgba(0,82,255,0.25)' : 'rgba(255,255,255,0.06)',
                  border: raw === String(q) ? '1px solid rgba(0,82,255,0.5)' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 9999,
                  padding: '5px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                ${q.toLocaleString()}
              </button>
            ))}
          </div>

          {/* Confirm button */}
          <button
            onClick={handleConfirm}
            disabled={loading || amount <= 0}
            style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 600,
              fontSize: '14px',
              background: amount > 0 ? '#0052FF' : 'rgba(0,82,255,0.35)',
              color: '#fff',
              borderRadius: 9999,
              padding: '12px 24px',
              border: 'none',
              cursor: amount > 0 && !loading ? 'pointer' : 'not-allowed',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'opacity 0.2s',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <>
                <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block', flexShrink: 0 }} />
                Processing...
              </>
            ) : (
              `Deposit${amount > 0 ? ` $${amount.toLocaleString()}` : ''} USDC`
            )}
          </button>

          {/* Cancel */}
          <button
            onClick={onClose}
            style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 400,
              fontSize: '13px',
              color: 'rgba(255,255,255,0.4)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
          >
            Cancel
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
