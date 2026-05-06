import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import WaitlistNavbar from './WaitlistNavbar'
import Footer from '../components/Footer'
import FadingVideo from '../components/FadingVideo'
import ScrollProgress from '../components/ScrollProgress'
import EmailVerificationBanner from '../components/EmailVerificationBanner'
import { useAuth } from '../context/AuthContext'
import VaultCard from '../components/dashboard/VaultCard'
import DepositModal from '../components/dashboard/DepositModal'
import StrategyStats from '../components/dashboard/StrategyStats'
import TradeHistory from '../components/dashboard/TradeHistory'
import ModeSelector from '../components/dashboard/ModeSelector'
import {
  getVaults,
  getTrades,
  getPnl,
  MOCK_VAULTS,
  MOCK_TRADES,
  MOCK_PNL,
} from '../services/api'
import type { Vault, Trade, PnlSummary } from '../services/api'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const twoFactorEnabled = user?.twoFactorEnabled ?? false

  const [mode, setMode] = useState<'solana' | 'cex'>('solana')
  const [vaults, setVaults] = useState<Vault[]>(MOCK_VAULTS)
  const [trades, setTrades] = useState<Trade[]>(MOCK_TRADES)
  const [pnl, setPnl] = useState<PnlSummary>(MOCK_PNL)
  const [depositOpen, setDepositOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    Promise.all([
      getVaults(user.id),
      getTrades(user.id),
      getPnl(user.id),
    ]).then(([v, t, p]) => {
      setVaults(v.length ? v : MOCK_VAULTS)
      setTrades(t.length ? t : MOCK_TRADES)
      setPnl(p)
    }).catch(() => {
    }).finally(() => setLoading(false))
  }, [user])

  void loading

  return (
    <div style={{ background: '#000' }}>
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
        style={{ position: 'fixed', top: 0, left: '-10%', width: '120%', height: '120%', objectFit: 'cover', objectPosition: 'center top', zIndex: 0 }}
      />
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'rgba(0,0,0,0.55)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <ScrollProgress />
        <WaitlistNavbar />
        <EmailVerificationBanner />
        <main style={{ minHeight: '100vh', padding: '8rem 2rem 4rem' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            <div>
              <h1 style={{
                fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                color: '#fff', fontSize: '2rem', letterSpacing: '-1px', margin: 0,
              }}>
                Dashboard
              </h1>
              <p style={{
                fontFamily: "'Barlow', sans-serif", fontWeight: 300,
                color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: '0.25rem 0 0',
              }}>
                Welcome back, {user?.name ?? user?.email?.split('@')[0] ?? 'trader'}
              </p>
            </div>

            {!twoFactorEnabled && (
              <button onClick={() => navigate('/2fa-setup')} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '13.5px',
                color: 'rgba(255,255,255,0.6)',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 9999, padding: '9px 20px', cursor: 'pointer', transition: 'all 0.15s',
                alignSelf: 'flex-start',
              }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
              >
                <ShieldCheck size={14} /> Enable two-factor auth
              </button>
            )}

            <ModeSelector mode={mode} onModeChange={setMode} />

            {mode === 'solana' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <VaultCard vault={vaults[0]} onDeposit={() => setDepositOpen(true)} />
                <StrategyStats pnl={pnl} />
              </div>
            )}
            {mode === 'cex' && (
              <StrategyStats pnl={pnl} />
            )}

            <TradeHistory trades={trades} />

          </div>
        </main>
        <Footer />
      </div>
      {depositOpen && vaults[0] && (
        <DepositModal
          vaultId={vaults[0].id}
          onClose={() => setDepositOpen(false)}
          onSuccess={(amount) => {
            setDepositOpen(false)
            setVaults(prev => prev.map((v, i) => i === 0 ? { ...v, balance: v.balance + amount } : v))
          }}
        />
      )}
    </div>
  )
}
