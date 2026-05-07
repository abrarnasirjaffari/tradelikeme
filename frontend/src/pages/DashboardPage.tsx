import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import FadingVideo from '../components/FadingVideo'
import EmailVerificationBanner from '../components/EmailVerificationBanner'
import { useAuth } from '../context/AuthContext'
import VaultCard from '../components/dashboard/VaultCard'
import DepositModal from '../components/dashboard/DepositModal'
import WithdrawModal from '../components/dashboard/WithdrawModal'
import StrategyStats from '../components/dashboard/StrategyStats'
import TradeHistory from '../components/dashboard/TradeHistory'
import ModeSelector from '../components/dashboard/ModeSelector'
import StatCards from '../components/dashboard/StatCards'
import OpenPositions from '../components/dashboard/OpenPositions'
import StrategyInfo from '../components/dashboard/StrategyInfo'
import RiskModeSelector from '../components/dashboard/RiskModeSelector'
import AgentStatus from '../components/dashboard/AgentStatus'
import AccountSettings from '../components/dashboard/AccountSettings'
import OnChainVerification from '../components/dashboard/OnChainVerification'
import VaultHistory from '../components/dashboard/VaultHistory'
import StrategyVerification from '../components/dashboard/StrategyVerification'
import DashboardSidebar from '../components/dashboard/DashboardSidebar'
import type { DashboardPage } from '../components/dashboard/DashboardSidebar'
import {
  getVaults,
  getTrades,
  getPnl,
  getPositions,
  getAgentStatus,
  getStrategyInfo,
  getVaultHistory,
  getRiskMode,
  setRiskMode,
  MOCK_VAULTS,
  MOCK_TRADES,
  MOCK_PNL,
  MOCK_POSITIONS,
  MOCK_AGENT_STATUS,
  MOCK_STRATEGY_INFO,
  MOCK_VAULT_HISTORY,
} from '../services/api'
import type { Vault, Trade, PnlSummary, Position, AgentStatusData, StrategyInfoData, VaultHistoryItem, RiskMode } from '../services/api'

const PAGE_TITLES: Record<DashboardPage, string> = {
  overview: 'Overview',
  positions: 'Open Positions',
  trades: 'Trade History',
  strategy: 'Strategy',
  agent: 'Agent Status',
  vault: 'Vault',
  settings: 'Settings',
  verification: 'Strategy Verification',
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const twoFactorEnabled = user?.twoFactorEnabled ?? true

  const [activePage, setActivePage] = useState<DashboardPage>('overview')
  const [mode, setMode] = useState<'solana' | 'cex'>('solana')
  const [vaults, setVaults] = useState<Vault[]>(MOCK_VAULTS)
  const [trades, setTrades] = useState<Trade[]>(MOCK_TRADES)
  const [pnl, setPnl] = useState<PnlSummary>(MOCK_PNL)
  const [positions, setPositions] = useState<Position[]>(MOCK_POSITIONS)
  const [agentStatus, setAgentStatus] = useState<AgentStatusData>(MOCK_AGENT_STATUS)
  const [strategyInfo, setStrategyInfo] = useState<StrategyInfoData>(MOCK_STRATEGY_INFO)
  const [vaultHistory, setVaultHistory] = useState<VaultHistoryItem[]>(MOCK_VAULT_HISTORY)
  const [riskMode, setRiskModeState] = useState<RiskMode>('medium')
  const [riskLoading, setRiskLoading] = useState(false)
  const [depositOpen, setDepositOpen] = useState(false)
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    setLoading(true)
    Promise.all([
      getVaults(user.id),
      getTrades(user.id),
      getPnl(user.id),
    ]).then(([v, t, p]) => {
      setVaults(v.length ? v : MOCK_VAULTS)
      setTrades(t.length ? t : MOCK_TRADES)
      setPnl(p)
    }).catch(() => {}).finally(() => setLoading(false))

    getPositions(user.id).then(p => { if (p.length) setPositions(p) }).catch(() => {})
    getAgentStatus().then(s => setAgentStatus(s)).catch(() => {})
    getStrategyInfo('sd-zones-v1').then(s => setStrategyInfo(s)).catch(() => {})
    getRiskMode(user.id).then(m => setRiskModeState(m)).catch(() => {})
  }, [user])

  useEffect(() => {
    if (!user?.id || !vaults[0]?.id) return
    getVaultHistory(vaults[0].id).then(h => { if (h.length) setVaultHistory(h) }).catch(() => {})
  }, [user, vaults])

  void loading

  async function handleRiskModeChange(newMode: RiskMode) {
    if (!user?.id) return
    setRiskLoading(true)
    try {
      await setRiskMode(user.id, newMode)
      setRiskModeState(newMode)
    } catch {
      setRiskModeState(newMode)
    } finally {
      setRiskLoading(false)
    }
  }

  function handleClosePosition(positionId: string) {
    setPositions(prev => prev.filter(p => p.id !== positionId))
  }

  function renderPage() {
    switch (activePage) {
      case 'overview':
        return (
          <>
            <ModeSelector mode={mode} onModeChange={setMode} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <VaultCard vault={vaults[0]} onDeposit={() => setDepositOpen(true)} onWithdraw={() => setWithdrawOpen(true)} />
              <StrategyStats pnl={pnl} />
            </div>
            <StatCards pnl={pnl} vault={vaults[0]} />
          </>
        )
      case 'positions':
        return <OpenPositions positions={positions} onClose={handleClosePosition} />
      case 'trades':
        return <TradeHistory trades={trades} />
      case 'strategy':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <StrategyInfo strategy={strategyInfo} />
            <RiskModeSelector mode={riskMode} onChange={handleRiskModeChange} loading={riskLoading} />
          </div>
        )
      case 'agent':
        return <AgentStatus agentStatus={agentStatus} />
      case 'vault':
        return (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <VaultCard vault={vaults[0]} onDeposit={() => setDepositOpen(true)} onWithdraw={() => setWithdrawOpen(true)} />
              <OnChainVerification vaultAddress={vaults[0]?.address} strategyTxHash={null} tradeCount={pnl.totalTrades} winRate={pnl.winRate} />
            </div>
            <VaultHistory history={vaultHistory} />
          </>
        )
      case 'settings':
        return (
          <AccountSettings
            user={user}
            walletAddress={null}
            oauthProvider={null}
            onLogout={() => navigate('/login')}
          />
        )
      case 'verification':
        return <StrategyVerification />
      default:
        return null
    }
  }

  return (
    <div style={{ background: '#000', minHeight: '100vh', display: 'flex' }}>
      <style>{`@media (max-width: 767px) { .dash-content { margin-left: 0 !important; padding-bottom: 70px !important; } }`}</style>
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
        style={{ position: 'fixed', top: 0, left: '-10%', width: '120%', height: '120%', objectFit: 'cover', objectPosition: 'center top', zIndex: 0 }}
      />
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'rgba(0,0,0,0.55)', pointerEvents: 'none' }} />

      <DashboardSidebar
        activePage={activePage}
        onNavigate={setActivePage}
        user={user}
        agentStatus={agentStatus.status}
        openPositionCount={positions.length}
      />

      <div className="dash-content" style={{ position: 'relative', zIndex: 1, marginLeft: 220, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        <div style={{
          position: 'sticky', top: 0, zIndex: 40,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '0 2rem',
          height: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <h2 style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '15px', color: '#fff', margin: 0 }}>
              {PAGE_TITLES[activePage]}
            </h2>
            <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
              Welcome back, {user?.name ?? user?.email?.split('@')[0] ?? 'trader'}
            </p>
          </div>
          {!twoFactorEnabled && (
            <button
              onClick={() => navigate('/2fa-setup')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '12.5px',
                color: 'rgba(255,255,255,0.6)',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 9999, padding: '7px 16px', cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
            >
              <ShieldCheck size={14} /> Enable 2FA
            </button>
          )}
        </div>

        <EmailVerificationBanner />

        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {renderPage()}
          </div>
        </main>

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
      {withdrawOpen && vaults[0] && (
        <WithdrawModal
          vaultId={vaults[0].id}
          maxAmount={vaults[0].balance}
          onClose={() => setWithdrawOpen(false)}
          onSuccess={(amount) => {
            setWithdrawOpen(false)
            setVaults(prev => prev.map((v, i) => i === 0 ? { ...v, balance: v.balance - amount } : v))
          }}
        />
      )}
    </div>
  )
}
