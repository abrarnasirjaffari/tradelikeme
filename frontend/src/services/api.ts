const API_BASE = import.meta.env.VITE_API_URL ?? 'https://api.tradelikeme.xyz'

export type Vault = {
  id: string
  strategyId: string
  strategyName: string
  balance: number
  currency: string
  status: 'active' | 'paused' | 'closed'
}

export type Trade = {
  id: string
  coin: string
  direction: 'LONG' | 'SHORT'
  entryPrice: number
  exitPrice: number | null
  pnl: number | null
  status: 'open' | 'closed' | 'sl_hit' | 'tp1_hit' | 'tp2_hit'
  openedAt: string
  closedAt: string | null
}

export type PnlSummary = {
  totalPnl: number
  winRate: number
  totalTrades: number
  avgReturn: number
  maxDrawdown: number
  rrr: number
}

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
    status: 'tp2_hit',
    openedAt: '2026-04-28T08:15:00Z',
    closedAt: '2026-04-29T14:30:00Z',
  },
  {
    id: 'trade-2',
    coin: 'ETH',
    direction: 'SHORT',
    entryPrice: 3120.0,
    exitPrice: 2980.0,
    pnl: 112.0,
    status: 'tp2_hit',
    openedAt: '2026-04-27T11:00:00Z',
    closedAt: '2026-04-28T09:45:00Z',
  },
  {
    id: 'trade-3',
    coin: 'BTC',
    direction: 'LONG',
    entryPrice: 75800.0,
    exitPrice: 77200.0,
    pnl: 87.5,
    status: 'tp1_hit',
    openedAt: '2026-04-25T06:00:00Z',
    closedAt: '2026-04-25T18:20:00Z',
  },
  {
    id: 'trade-4',
    coin: 'XRP',
    direction: 'SHORT',
    entryPrice: 1.39,
    exitPrice: 1.41,
    pnl: -14.8,
    status: 'sl_hit',
    openedAt: '2026-04-22T20:00:00Z',
    closedAt: '2026-04-22T22:30:00Z',
  },
  {
    id: 'trade-5',
    coin: 'TAO',
    direction: 'LONG',
    entryPrice: 320.0,
    exitPrice: null,
    pnl: null,
    status: 'open',
    openedAt: '2026-05-05T10:00:00Z',
    closedAt: null,
  },
]

export const MOCK_PNL: PnlSummary = {
  totalPnl: 184.5,
  winRate: 89,
  totalTrades: 36,
  avgReturn: 4.2,
  maxDrawdown: 2.8,
  rrr: 1.5,
}

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
