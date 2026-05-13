import type { Position, Trade } from '@/types/api';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.tradelikeme.xyz';

const MOCK_POSITIONS: Position[] = [
  {
    id: 'pos-1',
    symbol: 'SOL',
    direction: 'LONG',
    entryPrice: 142.5,
    currentPrice: 148.3,
    unrealisedPnl: 8.7,
    qty: 1.5,
    tp1: 155.0,
    tp2: 162.0,
    sl: 138.0,
    strategyId: 'sd-zones-v1',
    openedAt: '2026-05-12T14:30:00Z',
  },
  {
    id: 'pos-2',
    symbol: 'ETH',
    direction: 'SHORT',
    entryPrice: 3240.0,
    currentPrice: 3195.0,
    unrealisedPnl: 13.5,
    qty: 0.3,
    tp1: 3150.0,
    tp2: 3080.0,
    sl: 3320.0,
    strategyId: 'sd-zones-v1',
    openedAt: '2026-05-13T08:15:00Z',
  },
];

const MOCK_TRADES: Trade[] = [
  {
    id: 'trade-1',
    symbol: 'BTC',
    direction: 'LONG',
    entryPrice: 62400,
    exitPrice: 64800,
    pnl: 48.0,
    qty: 0.02,
    status: 'WIN',
    strategyId: 'sd-zones-v1',
    openedAt: '2026-05-10T09:00:00Z',
    closedAt: '2026-05-11T16:30:00Z',
  },
  {
    id: 'trade-2',
    symbol: 'XRP',
    direction: 'SHORT',
    entryPrice: 1.392,
    exitPrice: 1.368,
    pnl: 7.2,
    qty: 300,
    status: 'WIN',
    strategyId: 'sd-zones-v1',
    openedAt: '2026-05-09T12:00:00Z',
    closedAt: '2026-05-09T20:45:00Z',
  },
  {
    id: 'trade-3',
    symbol: 'SUI',
    direction: 'SHORT',
    entryPrice: 0.9537,
    exitPrice: 0.975,
    pnl: -6.39,
    qty: 300,
    status: 'LOSS',
    strategyId: 'sd-zones-v1',
    openedAt: '2026-05-08T21:30:00Z',
    closedAt: '2026-05-08T23:00:00Z',
  },
  {
    id: 'trade-4',
    symbol: 'SOL',
    direction: 'LONG',
    entryPrice: 128.0,
    exitPrice: 134.5,
    pnl: 19.5,
    qty: 3,
    status: 'WIN',
    strategyId: 'momentum-v1',
    openedAt: '2026-05-07T10:00:00Z',
    closedAt: '2026-05-08T14:00:00Z',
  },
  {
    id: 'trade-5',
    symbol: 'DOT',
    direction: 'LONG',
    entryPrice: 1.148,
    exitPrice: 1.205,
    pnl: 5.7,
    qty: 100,
    status: 'WIN',
    strategyId: 'sd-zones-v1',
    openedAt: '2026-05-06T08:00:00Z',
    closedAt: '2026-05-06T18:00:00Z',
  },
];

export async function getPositions(userId: string): Promise<Position[]> {
  try {
    const res = await fetch(`${BASE_URL}/users/${userId}/positions`);
    if (!res.ok) throw new Error('fetch failed');
    return (await res.json()) as Position[];
  } catch {
    return MOCK_POSITIONS;
  }
}

export type TradeFilter = 'wins' | 'losses' | (string & {});

export async function getTrades(
  userId: string,
  filter?: TradeFilter
): Promise<Trade[]> {
  try {
    const url = new URL(`${BASE_URL}/users/${userId}/trades`);
    if (filter) url.searchParams.set('filter', filter);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('fetch failed');
    return (await res.json()) as Trade[];
  } catch {
    const trades = MOCK_TRADES;
    if (!filter) return trades;
    if (filter === 'wins') return trades.filter((t) => t.status === 'WIN');
    if (filter === 'losses') return trades.filter((t) => t.status === 'LOSS');
    return trades.filter((t) => t.symbol === filter.toUpperCase());
  }
}

export async function closeTrade(
  strategyId: string,
  positionId: string
): Promise<{ success: boolean }> {
  try {
    const res = await fetch(`${BASE_URL}/agent/${strategyId}/close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ positionId }),
    });
    if (!res.ok) throw new Error('close failed');
    return (await res.json()) as { success: boolean };
  } catch {
    return { success: true };
  }
}
