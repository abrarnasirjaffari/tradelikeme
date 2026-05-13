export interface User {
  id: string;
  email: string;
  name: string;
  walletAddress?: string;
  createdAt: string;
}

export type StrategyTier = 'S' | 'A' | 'B' | 'C';
export type RiskMode = 'conservative' | 'medium' | 'aggressive';

export interface Strategy {
  id: string;
  name: string;
  tier: StrategyTier;
  isVerified: boolean;
  isOurs: boolean;
  winRate: number;
  monthlyReturn: number;
  feePercent: number;
  totalTrades: number;
  openSince: string;
  description: string;
  rulesText: string;
  traderName: string;
}

export interface Vault {
  id: string;
  strategyId: string;
  strategyName: string;
  deposited: number;
  currentValue: number;
  allocationPercent: number;
}

export interface EpochSummary {
  id: string;
  strategyId: string;
  startDate: string;
  endDate: string;
  openingBalance: number;
  closingBalance: number;
  profit: number;
  platformCut: number;
  netProfit: number;
}

export interface Position {
  id: string;
  symbol: string;
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  currentPrice: number;
  unrealisedPnl: number;
  qty: number;
  tp1: number;
  tp2: number;
  sl: number;
  strategyId: string;
  openedAt: string;
}

export interface Trade {
  id: string;
  symbol: string;
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  qty: number;
  status: 'WIN' | 'LOSS' | 'BREAKEVEN';
  strategyId: string;
  openedAt: string;
  closedAt: string;
}

export interface PnlSummary {
  totalPnl: number;
  winRate: number;
  openTrades: number;
  todayPnl: number;
}

export interface WsEvent {
  type: string;
  payload: unknown;
  timestamp: string;
}
