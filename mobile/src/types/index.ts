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

export interface User {
  id: string;
  email: string;
  name?: string;
}
