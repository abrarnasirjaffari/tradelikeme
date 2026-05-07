import { motion } from 'framer-motion'
import { Shield, ExternalLink, Copy, CreditCard } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  vaultAddress?: string | null
  strategyTxHash?: string | null
  tradeCount: number
  winRate: number
}

function truncAddr(addr: string | null | undefined, n = 6) {
  if (!addr) return '—'
  return `${addr.slice(0, n)}...${addr.slice(-n)}`
}

const divider = (
  <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '0.1rem 0' }} />
)

export default function OnChainVerification({ vaultAddress, strategyTxHash, tradeCount, winRate }: Props) {
  if (!vaultAddress) {
    return (
      <motion.div
        className="liquid-glass"
        style={{ borderRadius: '1.75rem', padding: '1.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', minHeight: '12rem' }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <CreditCard size={28} color="rgba(255,255,255,0.2)" />
        <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '13px', color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>
          Connect wallet to view on-chain records
        </span>
      </motion.div>
    )
  }

  const txsUrl = `https://solscan.io/account/${vaultAddress}?filter=txs`
  const accountUrl = `https://solscan.io/account/${vaultAddress}`

  return (
    <motion.div
      className="liquid-glass"
      style={{ borderRadius: '1.75rem', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '1rem', color: '#fff' }}>
            On-Chain Verification
          </span>
          <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
            Every trade is recorded on-chain. Trustless. Verifiable.
          </span>
        </div>
        <Shield size={16} color="#22c55e" style={{ flexShrink: 0 }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            All Trades
          </span>
          <a
            href={txsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
          >
            View all {tradeCount} trades on Solscan
            <ExternalLink size={12} />
          </a>
        </div>

        {divider}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Vault PDA
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontFeatureSettings: '"tnum"' }}>
              {truncAddr(vaultAddress)}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(vaultAddress)
                toast.success('Vault address copied')
              }}
              style={{ display: 'inline-flex', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', color: 'rgba(255,255,255,0.3)', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
            >
              <Copy size={12} />
            </button>
            <a
              href={accountUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', color: 'rgba(255,255,255,0.3)', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
            >
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {divider}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Strategy Registration
          </span>
          {strategyTxHash ? (
            <a
              href={`https://solscan.io/tx/${strategyTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontFeatureSettings: '"tnum"', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
            >
              {truncAddr(strategyTxHash)}
              <ExternalLink size={12} />
            </a>
          ) : (
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '13px', color: 'rgba(255,255,255,0.25)' }}>
              —
            </span>
          )}
        </div>
      </div>

      <a
        href={txsUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          width: '100%',
          fontFamily: "'Barlow', sans-serif",
          fontWeight: 600,
          fontSize: '14px',
          background: '#0052FF',
          color: '#fff',
          borderRadius: 9999,
          padding: '12px 24px',
          textDecoration: 'none',
          transition: 'opacity 0.2s, transform 0.15s',
          boxSizing: 'border-box',
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'translateY(-1px)' }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
      >
        Verify Our {winRate}% Win Rate
        <ExternalLink size={14} />
      </a>
    </motion.div>
  )
}
