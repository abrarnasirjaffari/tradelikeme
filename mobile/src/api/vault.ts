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

// ---------------------------------------------------------------------------
// Risk mode
// ---------------------------------------------------------------------------
export type RiskMode = 'conservative' | 'medium' | 'aggressive';

export interface RiskModeConfig {
  mode: RiskMode;
}

export async function getRiskMode(userId?: string): Promise<RiskModeConfig> {
  try {
    const url = userId
      ? `${BASE_URL}/users/${userId}/risk-mode`
      : `${BASE_URL}/users/me/risk-mode`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('fetch failed');
    return (await res.json()) as RiskModeConfig;
  } catch {
    return { mode: 'medium' };
  }
}

export async function setRiskMode(
  config: RiskModeConfig | { mode: RiskMode },
  userId?: string
): Promise<RiskModeConfig> {
  try {
    const url = userId
      ? `${BASE_URL}/users/${userId}/risk-mode`
      : `${BASE_URL}/users/me/risk-mode`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error('set risk-mode failed');
    return (await res.json()) as RiskModeConfig;
  } catch {
    return config as RiskModeConfig;
  }
}

// ---------------------------------------------------------------------------
// Notification config
// Supports both the internal shape (telegram/zoneTouch/…) and the
// settings screen shape (push_enabled/telegram_enabled).
// ---------------------------------------------------------------------------
export interface NotifConfig {
  push_enabled?: boolean;
  telegram_enabled?: boolean;
  telegram?: boolean;
  zoneTouch?: boolean;
  tp1Hit?: boolean;
  tp2Hit?: boolean;
  slHit?: boolean;
  agentDown?: boolean;
  dailySummary?: boolean;
}

const DEFAULT_NOTIF_CONFIG: NotifConfig = {
  push_enabled: true,
  telegram_enabled: true,
  telegram: true,
  zoneTouch: true,
  tp1Hit: true,
  tp2Hit: true,
  slHit: true,
  agentDown: true,
  dailySummary: true,
};

export async function getNotifConfig(userId?: string): Promise<NotifConfig> {
  try {
    const headers: Record<string, string> = {};
    if (userId) headers['X-User-Id'] = userId;
    const res = await fetch(`${BASE_URL}/notifications/config`, { headers });
    if (!res.ok) throw new Error('fetch failed');
    return (await res.json()) as NotifConfig;
  } catch {
    return DEFAULT_NOTIF_CONFIG;
  }
}

export async function setNotifConfig(
  config: Partial<NotifConfig>,
  userId?: string
): Promise<NotifConfig> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (userId) headers['X-User-Id'] = userId;
    const res = await fetch(`${BASE_URL}/notifications/config`, {
      method: 'POST',
      headers,
      body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error('set notif config failed');
    return (await res.json()) as NotifConfig;
  } catch {
    return { ...DEFAULT_NOTIF_CONFIG, ...config };
  }
}
