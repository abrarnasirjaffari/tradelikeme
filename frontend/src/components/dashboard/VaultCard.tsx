import { motion } from 'framer-motion'
import { Copy, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import type { Vault } from '../../services/api'

interface Props {
  vault: Vault
  onDeposit: () => void
  onWithdraw: () => void
}

export default function VaultCard({ vault, onDeposit, onWithdraw }: Props) {
  const isActive = vault.status === 'active'
  const isPaused = vault.status === 'paused'

  return (
    <motion.div
      className="liquid-glass"
      style={{ borderRadius: '1.75rem', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
        <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.3px' }}>
          {vault.strategyName}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
          <div style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: isActive ? '#22c55e' : isPaused ? '#eab308' : 'rgba(255,255,255,0.3)',
            boxShadow: isActive ? '0 0 6px #22c55e' : isPaused ? '0 0 6px #eab308' : 'none',
          }} />
          <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '12px', color: isActive ? '#22c55e' : isPaused ? '#eab308' : 'rgba(255,255,255,0.4)' }}>
            {isActive ? 'Active' : isPaused ? 'Paused' : 'Closed'}
          </span>
        </div>
      </div>

      {/* Balance */}
      <div>
        <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '2.5rem', color: '#fff', letterSpacing: '-1.5px', lineHeight: 1 }}>
          {vault.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginLeft: '0.5rem' }}>
          {vault.currency}
        </span>
      </div>

      {/* Vault address row */}
      {vault.address && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFeatureSettings: '"tnum"' }}>
            {vault.address.slice(0, 4)}...{vault.address.slice(-4)}
          </span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(vault.address!)
              toast.success('Address copied')
            }}
            style={{ display: 'inline-flex', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', color: 'rgba(255,255,255,0.3)', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
          >
            <Copy size={12} />
          </button>
          <a
            href={`https://solscan.io/account/${vault.address}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '12px', color: 'rgba(255,255,255,0.35)', textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
          >
            View on Solscan
            <ExternalLink size={11} />
          </a>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          onClick={onDeposit}
          style={{
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 500,
            fontSize: '14px',
            background: '#0052FF',
            color: '#fff',
            borderRadius: 9999,
            padding: '10px 24px',
            border: 'none',
            cursor: 'pointer',
            transition: 'opacity 0.2s, transform 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          Deposit
        </button>
        <button
          onClick={onWithdraw}
          style={{
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 500,
            fontSize: '14px',
            background: 'transparent',
            color: 'rgba(255,255,255,0.7)',
            borderRadius: 9999,
            padding: '10px 24px',
            border: '1px solid rgba(255,255,255,0.2)',
            cursor: 'pointer',
            transition: 'opacity 0.2s, transform 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
        >
          Withdraw
        </button>
      </div>
    </motion.div>
  )
}
