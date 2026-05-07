import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useWallet } from '@solana/wallet-adapter-react'
import { buildWithdrawTx, confirmWithdraw } from '../../services/api'
import { signAndSubmitTx } from '../../services/solana'

interface Props {
  vaultId: string
  maxAmount: number
  onClose: () => void
  onSuccess: (amount: number) => void
}

type Step = 'idle' | 'building' | 'signing' | 'confirming'

const QUICK_AMOUNTS = [100, 250, 500]

const STEP_LABEL: Record<Step, string> = {
  idle: '',
  building: 'Building transaction...',
  signing: 'Approve in Phantom wallet...',
  confirming: 'Confirming on-chain...',
}

export default function WithdrawModal({ vaultId, maxAmount, onClose, onSuccess }: Props) {
  const [raw, setRaw] = useState('')
  const [step, setStep] = useState<Step>('idle')
  const wallet = useWallet()

  const amount = parseFloat(raw) || 0
  const loading = step !== 'idle'

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  async function handleConfirm() {
    if (amount <= 0) {
      toast.error('Enter a valid amount')
      return
    }
    if (amount > maxAmount) {
      toast.error(`Maximum available: $${maxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
      return
    }
    if (!wallet.publicKey) {
      toast.error('Connect your Phantom wallet first')
      return
    }

    try {
      // Step 1: Get unsigned tx from backend
      setStep('building')
      const { serialized_tx } = await buildWithdrawTx(
        vaultId,
        amount,
        wallet.publicKey.toString()
      )

      // Step 2: Sign with Phantom + submit to network
      setStep('signing')
      const txSignature = await signAndSubmitTx(wallet, serialized_tx)

      // Step 3: Confirm with backend
      setStep('confirming')
      await confirmWithdraw(vaultId, txSignature, amount)

      toast.success(`Withdrew $${amount.toLocaleString()} USDC — tx: ${txSignature.slice(0, 8)}...`)
      onSuccess(amount)
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Withdrawal failed')
    } finally {
      setStep('idle')
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <h2 style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '1.25rem', color: '#fff', margin: 0 }}>
              Withdraw USDC
            </h2>
            <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.5 }}>
              Funds are released from your vault to your connected wallet.
            </p>
          </div>

          <div
            className="liquid-glass"
            style={{ borderRadius: '1rem', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '11px', color: 'rgba(255,255,255,0.35)', paddingLeft: '0.25rem' }}>
              Available: ${maxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC
            </span>
          </div>

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
                  background: raw === String(q) ? 'rgba(234,179,8,0.2)' : 'rgba(255,255,255,0.06)',
                  border: raw === String(q) ? '1px solid rgba(234,179,8,0.45)' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 9999,
                  padding: '5px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                ${q.toLocaleString()}
              </button>
            ))}
            <button
              onClick={() => setRaw(String(maxAmount))}
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 500,
                fontSize: '12px',
                color: raw === String(maxAmount) ? '#fff' : 'rgba(255,255,255,0.55)',
                background: raw === String(maxAmount) ? 'rgba(234,179,8,0.2)' : 'rgba(255,255,255,0.06)',
                border: raw === String(maxAmount) ? '1px solid rgba(234,179,8,0.45)' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: 9999,
                padding: '5px 14px',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              Max
            </button>
          </div>

          <button
            onClick={handleConfirm}
            disabled={loading || amount <= 0}
            style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 600,
              fontSize: '14px',
              background: amount > 0 ? 'rgba(234,179,8,0.85)' : 'rgba(234,179,8,0.3)',
              color: amount > 0 ? '#0a0a0a' : 'rgba(255,255,255,0.4)',
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
                <span style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#0a0a0a', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block', flexShrink: 0 }} />
                {STEP_LABEL[step]}
              </>
            ) : (
              `Withdraw${amount > 0 ? ` $${amount.toLocaleString()}` : ''} USDC`
            )}
          </button>

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
