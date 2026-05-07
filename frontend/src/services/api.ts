const API_BASE = import.meta.env.VITE_API_URL ?? 'https://api.tradelikeme.xyz'

export type Vault = {
  id: string
  strategyId: string
  strategyName: string
  balance: number
  currency: string
  status: 'active' | 'paused' | 'closed'
  address?: string
}

export type Trade = {
  id: string
  coin: string
  direction: 'LONG' | 'SHORT'
  entryPrice: number
  exitPrice: number | null
  pnl: number | null
  pnlPct: number | null
  status: 'open' | 'closed' | 'sl_hit' | 'tp1_hit' | 'tp2_hit'
  openedAt: string
  closedAt: string | null
  txSignature: string | null
}

export type PnlSummary = {
  totalPnl: number
  winRate: number
  totalTrades: number
  avgReturn: number
  maxDrawdown: number
  rrr: number
  vaultValue?: number
  totalPnlPct?: number
  activePositions?: number
  avgDuration?: string
  bestTrade?: number
  worstTrade?: number
  profitFactor?: number
  monthlyReturn?: number
  weeklyReturn?: number
  streak?: number
  streakType?: 'win' | 'loss'
}

export type Position = {
  id: string
  coin: string
  direction: 'LONG' | 'SHORT'
  entryPrice: number
  currentPrice: number
  unrealizedPnl: number
  unrealizedPnlPct: number
  qty: number
  leverage: number
  slPrice: number
  tp1Price: number
  tp2Price: number
  margin: number
  liquidationPrice: number
  openedAt: string
}

export type AgentStatusData = {
  status: 'running' | 'stopped' | 'scanning'
  lastScanAt: string | null
  nextScanAt: string | null
  watchlist: string[]
  sentinelWatches: Array<{ coin: string; price: number; type: 'zone_touch' | 'tp1' | 'sl' }>
}

export type StrategyInfoData = {
  id: string
  name: string
  description: string
  rules: string[]
  trader: string
  grade: 'S' | 'A' | 'B' | 'C'
  fee: string
  coins: string[]
  timeframes: string[]
  maxPositions: number
  startDate: string
  aum: number
}

export type VaultHistoryItem = {
  id: string
  type: 'deposit' | 'withdraw'
  amount: number
  currency: string
  txSignature: string | null
  createdAt: string
}

export type RiskMode = 'conservative' | 'medium' | 'aggressive'

export type Strategy = {
  id: string
  name: string
  winRate: number
  totalTrades: number
  avgReturn: number
  status: 'active' | 'paused'
}

export async function fetchApi(path: string, options: RequestInit = {}): Promise<Response> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`)
  return res
}

export async function getVaults(userId: string): Promise<Vault[]> {
  const res = await fetchApi(`/users/${userId}/vaults`)
  return res.json()
}

export async function getTrades(userId: string): Promise<Trade[]> {
  const res = await fetchApi(`/users/${userId}/trades`)
  return res.json()
}

export async function getPnl(userId: string): Promise<PnlSummary> {
  const res = await fetchApi(`/users/${userId}/pnl`)
  return res.json()
}

export async function deposit(vaultId: string, amount: number): Promise<{ success: boolean; txSignature?: string }> {
  const res = await fetchApi(`/vaults/${vaultId}/deposit`, {
    method: 'POST',
    body: JSON.stringify({ amount }),
  })
  return res.json()
}

export async function withdraw(vaultId: string, amount: number): Promise<{ success: boolean; txSignature?: string }> {
  const res = await fetchApi(`/vaults/${vaultId}/withdraw`, {
    method: 'POST',
    body: JSON.stringify({ amount }),
  })
  return res.json()
}

// ── 2-step Solana vault flows ──────────────────────────────────────────────

export async function buildDepositTx(
  vaultId: string,
  amount: number,
  userWalletPubkey: string
): Promise<{ serialized_tx: string; vault_address: string }> {
  const res = await fetchApi(`/vaults/${vaultId}/deposit`, {
    method: 'POST',
    body: JSON.stringify({ amount_usdc: amount, user_wallet_pubkey: userWalletPubkey }),
  })
  return res.json()
}

export async function confirmDeposit(
  vaultId: string,
  txSignature: string,
  amount: number
): Promise<{ success: boolean }> {
  const res = await fetchApi(`/vaults/${vaultId}/deposit/confirm`, {
    method: 'POST',
    body: JSON.stringify({ tx_signature: txSignature, amount_usdc: amount }),
  })
  return res.json()
}

export async function buildWithdrawTx(
  vaultId: string,
  amount: number,
  userWalletPubkey: string
): Promise<{ serialized_tx: string; vault_address: string }> {
  const res = await fetchApi(`/vaults/${vaultId}/withdraw`, {
    method: 'POST',
    body: JSON.stringify({ amount_usdc: amount, user_wallet_pubkey: userWalletPubkey }),
  })
  return res.json()
}

export async function confirmWithdraw(
  vaultId: string,
  txSignature: string,
  amount: number
): Promise<{ success: boolean }> {
  const res = await fetchApi(`/vaults/${vaultId}/withdraw/confirm`, {
    method: 'POST',
    body: JSON.stringify({ tx_signature: txSignature, amount_usdc: amount }),
  })
  return res.json()
}

export async function getPositions(userId: string): Promise<Position[]> {
  const res = await fetchApi(`/users/${userId}/positions`)
  return res.json()
}

export async function getAgentStatus(): Promise<AgentStatusData> {
  const res = await fetchApi('/agent/sd-zones-v1/status')
  return res.json()
}

export async function getStrategyInfo(id: string): Promise<StrategyInfoData> {
  const res = await fetchApi(`/strategies/${id}`)
  return res.json()
}

export async function getVaultHistory(vaultId: string): Promise<VaultHistoryItem[]> {
  const res = await fetchApi(`/vaults/${vaultId}/history`)
  return res.json()
}

export async function getRiskMode(userId: string): Promise<RiskMode> {
  const res = await fetchApi(`/users/${userId}/risk-mode`)
  return res.json()
}

export async function setRiskMode(userId: string, mode: RiskMode): Promise<void> {
  await fetchApi(`/users/${userId}/risk-mode`, {
    method: 'POST',
    body: JSON.stringify({ mode }),
  })
}

export async function getStrategies(): Promise<Strategy[]> {
  const res = await fetchApi('/strategies')
  return res.json()
}

export async function getStrategy(id: string): Promise<Strategy> {
  const res = await fetchApi(`/strategies/${id}`)
  return res.json()
}

export const MOCK_VAULTS: Vault[] = [
  {
    id: 'vault-1',
    strategyId: 'sd-zones-v1',
    strategyName: 'S/D Zone Trading',
    balance: 1250.0,
    currency: 'USDC',
    status: 'active',
    address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  },
]

export const MOCK_TRADES: Trade[] = [
  {
    id: 'trade-1',
    coin: 'SOL',
    direction: 'LONG',
    entryPrice: 148.2,
    exitPrice: 162.5,
    pnl: 96.4,
    pnlPct: 9.65,
    status: 'tp2_hit',
    openedAt: '2026-04-28T08:15:00Z',
    closedAt: '2026-04-29T14:30:00Z',
    txSignature: '5KJUjL3JtBT9vPmbMkiRCgBJ4nzEfpLGMFt7KSMkaxBFkPU2Xe5xJkVnm6GkXvLzQJuQPz9v3XdR83wYt5mCdG2',
  },
  {
    id: 'trade-2',
    coin: 'ETH',
    direction: 'SHORT',
    entryPrice: 3120.0,
    exitPrice: 2980.0,
    pnl: 112.0,
    pnlPct: 4.49,
    status: 'tp2_hit',
    openedAt: '2026-04-27T11:00:00Z',
    closedAt: '2026-04-28T09:45:00Z',
    txSignature: '3FGhJKL8mNpQrTvXzABcDeFgHiJkLmNoPqRsTuVwXyZ1234567890abcdefghijk',
  },
  {
    id: 'trade-3',
    coin: 'BTC',
    direction: 'LONG',
    entryPrice: 75800.0,
    exitPrice: 77200.0,
    pnl: 87.5,
    pnlPct: 1.85,
    status: 'tp1_hit',
    openedAt: '2026-04-25T06:00:00Z',
    closedAt: '2026-04-25T18:20:00Z',
    txSignature: '2ABcDeF3gHiJkLmNoPqRsTuVwXyZ1234567890abcdefghijklmnopqrstuvwxyz',
  },
  {
    id: 'trade-4',
    coin: 'XRP',
    direction: 'SHORT',
    entryPrice: 1.39,
    exitPrice: 1.41,
    pnl: -14.8,
    pnlPct: -1.44,
    status: 'sl_hit',
    openedAt: '2026-04-22T20:00:00Z',
    closedAt: '2026-04-22T22:30:00Z',
    txSignature: null,
  },
  {
    id: 'trade-5',
    coin: 'TAO',
    direction: 'LONG',
    entryPrice: 320.0,
    exitPrice: null,
    pnl: null,
    pnlPct: null,
    status: 'open',
    openedAt: '2026-05-05T10:00:00Z',
    closedAt: null,
    txSignature: null,
  },
]

export const MOCK_PNL: PnlSummary = {
  totalPnl: 184.5,
  winRate: 89,
  totalTrades: 36,
  avgReturn: 4.2,
  maxDrawdown: 2.8,
  rrr: 1.5,
  vaultValue: 1434.5,
  totalPnlPct: 14.76,
  activePositions: 1,
  avgDuration: '18h 24m',
  bestTrade: 112.0,
  worstTrade: -14.8,
  profitFactor: 3.2,
  monthlyReturn: 8.4,
  weeklyReturn: 2.1,
  streak: 7,
  streakType: 'win',
}

export const MOCK_POSITIONS: Position[] = [
  {
    id: 'pos-1',
    coin: 'TAO',
    direction: 'LONG',
    entryPrice: 320.0,
    currentPrice: 338.5,
    unrealizedPnl: 74.2,
    unrealizedPnlPct: 5.78,
    qty: 4,
    leverage: 200,
    slPrice: 308.0,
    tp1Price: 340.0,
    tp2Price: 365.0,
    margin: 6.4,
    liquidationPrice: 318.4,
    openedAt: '2026-05-05T10:00:00Z',
  },
]

export const MOCK_AGENT_STATUS: AgentStatusData = {
  status: 'scanning',
  lastScanAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
  nextScanAt: new Date(Date.now() + 228 * 60 * 1000).toISOString(),
  watchlist: ['SOL', 'BTC', 'ETH', 'TAO', 'SUI', 'XRP', 'DOGE', 'LINK', 'DOT', 'ADA', 'UNI', 'ENA', 'AAVE', 'LTC'],
  sentinelWatches: [
    { coin: 'TAO', price: 340.0, type: 'tp1' },
    { coin: 'SOL', price: 152.5, type: 'zone_touch' },
    { coin: 'ETH', price: 2950.0, type: 'zone_touch' },
  ],
}

export const MOCK_STRATEGY_INFO: StrategyInfoData = {
  id: 'sd-zones-v1',
  name: 'S/D Zone Trading',
  description: 'Human-cloned supply & demand zone strategy with 89% verified win rate. Structural entries with body-close stop loss.',
  rules: [
    'Entry at S/D zone reversal on 4H + 15M confirmation',
    'BTC 1D macro must align with trade direction',
    'Stop loss: 30m candle body close — wicks ignored',
    'TP1: 50% at nearest zone, TP2: 50% at zone 2',
    'Max 2 concurrent positions at 0.5% margin each',
  ],
  trader: 'Abrar Nasir Jaffari',
  grade: 'S',
  fee: '20% profit share',
  coins: ['SOL', 'BTC', 'ETH', 'TAO', 'SUI', 'XRP', 'DOGE', 'LINK', 'DOT', 'ADA'],
  timeframes: ['1M', '1W', '1D', '4H', '1H', '30M', '15M'],
  maxPositions: 2,
  startDate: '2026-03-01T00:00:00Z',
  aum: 47250,
}

export const MOCK_VAULT_HISTORY: VaultHistoryItem[] = [
  {
    id: 'dep-1',
    type: 'deposit',
    amount: 1000,
    currency: 'USDC',
    txSignature: '5KJUjL3JtBT9vPmbMkiRCgBJ4nzEfpLGMFt7KSMkaxBF',
    createdAt: '2026-04-01T10:00:00Z',
  },
  {
    id: 'dep-2',
    type: 'deposit',
    amount: 250,
    currency: 'USDC',
    txSignature: '3FGhJKL8mNpQrTvXzABcDeFgHiJkLmNoPqRsTuVwXyZ1',
    createdAt: '2026-04-15T14:30:00Z',
  },
]

export const MOCK_STRATEGIES: Strategy[] = [
  {
    id: 'sd-zones-v1',
    name: 'S/D Zone Trading',
    winRate: 89,
    totalTrades: 36,
    avgReturn: 4.2,
    status: 'active',
  },
  {
    id: 'momentum-v1',
    name: 'Momentum Breakout',
    winRate: 72,
    totalTrades: 58,
    avgReturn: 3.1,
    status: 'paused',
  },
]
