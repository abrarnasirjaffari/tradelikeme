import type { Vault, EpochSummary } from '@/types/api';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.tradelikeme.xyz';

const MOCK_VAULTS: Vault[] = [
  {
    id: 'vault-1',
    strategyId: 'sd-zones-v1',
    strategyName: 'S/D Zone Trading',
    deposited: 1000,
    currentValue: 1082.4,
    allocationPercent: 68,
  },
  {
    id: 'vault-2',
    strategyId: 'momentum-v1',
    strategyName: 'Momentum Breakout',
    deposited: 500,
    currentValue: 531.0,
    allocationPercent: 32,
  },
];

const MOCK_EPOCHS: EpochSummary[] = [
  {
    id: 'epoch-3',
    strategyId: 'sd-zones-v1',
    startDate: '2026-04-01',
    endDate: '2026-04-30',
    openingBalance: 1000,
    closingBalance: 1082.4,
    profit: 82.4,
    platformCut: 16.48,
    netProfit: 65.92,
  },
  {
    id: 'epoch-2',
    strategyId: 'sd-zones-v1',
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    openingBalance: 924.8,
    closingBalance: 1000,
    profit: 75.2,
    platformCut: 15.04,
    netProfit: 60.16,
  },
  {
    id: 'epoch-1',
    strategyId: 'sd-zones-v1',
    startDate: '2026-02-01',
    endDate: '2026-02-28',
    openingBalance: 860,
    closingBalance: 924.8,
    profit: 64.8,
    platformCut: 12.96,
    netProfit: 51.84,
  },
];

export async function getVaults(userId: string): Promise<Vault[]> {
  try {
    const res = await fetch(`${BASE_URL}/users/${userId}/vaults`);
    if (!res.ok) throw new Error('fetch failed');
    return (await res.json()) as Vault[];
  } catch {
    return MOCK_VAULTS;
  }
}

export async function getPnl(userId: string): Promise<EpochSummary[]> {
  try {
    const res = await fetch(`${BASE_URL}/users/${userId}/pnl`);
    if (!res.ok) throw new Error('fetch failed');
    return (await res.json()) as EpochSummary[];
  } catch {
    return MOCK_EPOCHS;
  }
}
