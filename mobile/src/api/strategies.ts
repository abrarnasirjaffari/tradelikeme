import type { Strategy, RiskMode } from '@/types/api';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.tradelikeme.xyz';

const MOCK_STRATEGIES: Strategy[] = [
  {
    id: 'sd-zones-v1',
    name: 'S/D Zone Trading',
    tier: 'S',
    isVerified: true,
    isOurs: true,
    winRate: 89,
    monthlyReturn: 8,
    feePercent: 20,
    totalTrades: 147,
    openSince: '2025-11-01',
    description:
      'Human-cloned strategy from a verified profitable trader. Supply/demand zone reversals with structural stop losses and multi-timeframe confirmation.',
    rulesText:
      'Entry at S/D zone reversal on 4H. Confirmation on 15M. BTC 1D macro gate. Body-close SL (30m candles). TP1 at zone 1 (50%), TP2 at zone 2 (50%). Never zones 3–4.',
    traderName: 'TradeLikeMe',
  },
  {
    id: 'momentum-v1',
    name: 'Momentum Breakout',
    tier: 'A',
    isVerified: true,
    isOurs: false,
    winRate: 78,
    monthlyReturn: 6.2,
    feePercent: 12,
    totalTrades: 89,
    openSince: '2025-12-15',
    description:
      'Momentum-based breakout strategy targeting high-volume consolidation breakouts with trend confirmation.',
    rulesText:
      'Enter on confirmed breakout above resistance with 2x+ average volume. SL below breakout base. TP at 1:2 RR minimum.',
    traderName: 'CryptoAlpha',
  },
  {
    id: 'scalp-b-v1',
    name: 'Intraday Scalp',
    tier: 'B',
    isVerified: false,
    isOurs: false,
    winRate: 69,
    monthlyReturn: 4.8,
    feePercent: 10,
    totalTrades: 214,
    openSince: '2026-01-10',
    description:
      'High-frequency intraday scalping on 5M and 15M timeframes. Best for volatile altcoins during high-activity sessions.',
    rulesText:
      'Enter on EMA cross with RSI confirmation (30/70 levels). Fixed 1% SL, TP at nearest resistance. Max 3 concurrent positions.',
    traderName: 'ScalpKing',
  },
  {
    id: 'swing-c-v1',
    name: 'Weekly Swing',
    tier: 'C',
    isVerified: false,
    isOurs: false,
    winRate: 62,
    monthlyReturn: 3.1,
    feePercent: 8,
    totalTrades: 41,
    openSince: '2026-02-20',
    description:
      'Longer-duration swing trades targeting weekly trend continuations. Lower frequency, higher conviction setups.',
    rulesText:
      'Weekly trend confirmation required. Entry on 4H retest of broken structure. SL below weekly swing low.',
    traderName: 'SwingTrader99',
  },
];

export async function getStrategies(): Promise<Strategy[]> {
  try {
    const res = await fetch(`${BASE_URL}/strategies`);
    if (!res.ok) throw new Error('fetch failed');
    const data = await res.json();
    return data as Strategy[];
  } catch {
    return MOCK_STRATEGIES;
  }
}

export async function getStrategy(id: string): Promise<Strategy> {
  try {
    const res = await fetch(`${BASE_URL}/strategies/${id}`);
    if (!res.ok) throw new Error('fetch failed');
    return (await res.json()) as Strategy;
  } catch {
    const found = MOCK_STRATEGIES.find((s) => s.id === id);
    if (!found) throw new Error(`Strategy ${id} not found`);
    return found;
  }
}

export async function subscribe(
  strategyId: string,
  riskMode: RiskMode
): Promise<{ subscriptionId: string }> {
  try {
    const res = await fetch(`${BASE_URL}/subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ strategyId, riskMode }),
    });
    if (!res.ok) throw new Error('subscribe failed');
    return await res.json();
  } catch {
    return { subscriptionId: `mock-sub-${Date.now()}` };
  }
}
