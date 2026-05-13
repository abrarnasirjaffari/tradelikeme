import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { getVaults, getPnl } from '@/api/vault';
import { useAuthStore } from '@/store/authStore';
import type { Vault, EpochSummary } from '@/types/api';

const PRIMARY = '#1D4ED8';
const SUCCESS = '#22C55E';

function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ── Portfolio card ────────────────────────────────────────────────────────────

interface PortfolioCardProps {
  totalDeposited: number;
  currentValue: number;
  unrealisedGain: number;
  platformCut: number;
}

function PortfolioCard({ totalDeposited, currentValue, unrealisedGain, platformCut }: PortfolioCardProps) {
  return (
    <View style={styles.portfolioCard}>
      <Text style={styles.portfolioLabel}>Total Portfolio Value</Text>
      <Text style={styles.portfolioValue}>{formatCurrency(currentValue)}</Text>
      <View style={styles.portfolioStatsRow}>
        <View style={styles.portfolioStat}>
          <Text style={styles.portfolioStatLabel}>Deposited</Text>
          <Text style={styles.portfolioStatValue}>{formatCurrency(totalDeposited)}</Text>
        </View>
        <View style={styles.portfolioStat}>
          <Text style={styles.portfolioStatLabel}>Total Gain</Text>
          <Text style={styles.portfolioStatValue}>
            {unrealisedGain >= 0 ? '+' : ''}{formatCurrency(unrealisedGain)}
          </Text>
        </View>
        <View style={styles.portfolioStat}>
          <Text style={styles.portfolioStatLabel}>Our 20%</Text>
          <Text style={styles.portfolioStatValue}>{formatCurrency(platformCut)}</Text>
        </View>
      </View>
    </View>
  );
}

// ── Deposit / Withdraw tab switcher ──────────────────────────────────────────

interface TabSwitcherProps {
  active: 'deposit' | 'withdraw';
  onDeposit: () => void;
  onWithdraw: () => void;
}

function TabSwitcher({ active, onDeposit, onWithdraw }: TabSwitcherProps) {
  return (
    <View style={styles.tabRow}>
      <TouchableOpacity
        style={[styles.tabBtn, styles.tabBtnLeft, active === 'deposit' && styles.tabBtnActive]}
        onPress={onDeposit}
        activeOpacity={0.85}
      >
        <Text style={[styles.tabBtnText, active === 'deposit' && styles.tabBtnTextActive]}>
          Deposit
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tabBtn, styles.tabBtnRight, active === 'withdraw' && styles.tabBtnActive]}
        onPress={onWithdraw}
        activeOpacity={0.85}
      >
        <Text style={[styles.tabBtnText, active === 'withdraw' && styles.tabBtnTextActive]}>
          Withdraw
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Allocation row ────────────────────────────────────────────────────────────

interface AllocationRowProps {
  vault: Vault;
}

function AllocationRow({ vault }: AllocationRowProps) {
  const gain = vault.currentValue - vault.deposited;
  const gainPercent = vault.deposited > 0 ? (gain / vault.deposited) * 100 : 0;
  const isPositive = gain >= 0;
  return (
    <View style={styles.allocationCard}>
      <View style={styles.allocationLeft}>
        <View style={styles.logoChip}>
          <Text style={styles.logoChipText}>TL</Text>
        </View>
        <View>
          <Text style={styles.allocationName}>{vault.strategyName}</Text>
          <Text style={styles.allocationWinRate}>89% win rate</Text>
        </View>
      </View>
      <View style={styles.allocationRight}>
        <Text style={styles.allocationValue}>{formatCurrency(vault.currentValue)}</Text>
        <Text style={[styles.allocationGain, { color: isPositive ? SUCCESS : '#EF4444' }]}>
          {isPositive ? '+' : ''}{gainPercent.toFixed(1)}%
        </Text>
      </View>
    </View>
  );
}

// ── Epoch row ─────────────────────────────────────────────────────────────────

interface EpochRowProps {
  epoch: EpochSummary;
}

function EpochRow({ epoch }: EpochRowProps) {
  const isPositive = epoch.netProfit >= 0;
  // Build "April 2026" from start date
  let monthLabel = epoch.startDate;
  try {
    monthLabel = new Date(epoch.startDate).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  } catch {}

  const startVal = epoch.profit + epoch.platformCut - epoch.netProfit + epoch.netProfit - epoch.profit;
  // Simpler: show opening → closing narrative
  const opening = epoch.profit > 0
    ? epoch.netProfit + epoch.platformCut
    : epoch.netProfit + epoch.platformCut;
  const closing = opening + epoch.profit;

  return (
    <View style={styles.epochCard}>
      <View style={styles.epochLeft}>
        <Text style={styles.epochMonth}>{monthLabel}</Text>
        <Text style={styles.epochRange}>
          {formatCurrency(Math.abs(closing - epoch.profit))} → {formatCurrency(closing)}
        </Text>
      </View>
      <View style={styles.epochRight}>
        <Text style={[styles.epochProfit, { color: isPositive ? SUCCESS : '#EF4444' }]}>
          {isPositive ? '+' : ''}{formatCurrency(epoch.netProfit)}
        </Text>
        <Text style={styles.epochPlatformCut}>Platform: {formatCurrency(epoch.platformCut)}</Text>
      </View>
    </View>
  );
}

// ── Section types ─────────────────────────────────────────────────────────────

type Section =
  | { type: 'portfolioCard'; data: PortfolioCardProps }
  | { type: 'tabSwitcher' }
  | { type: 'sectionTitle'; title: string }
  | { type: 'allocationRow'; data: Vault }
  | { type: 'epochRow'; data: EpochSummary }
  | { type: 'empty'; message: string };

// ── Screen ────────────────────────────────────────────────────────────────────

export default function VaultScreen() {
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');

  const [vaults, setVaults] = useState<Vault[]>([]);
  const [epochs, setEpochs] = useState<EpochSummary[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const userId = user?.id ?? 'demo';
    try {
      const [v, e] = await Promise.all([getVaults(userId), getPnl(userId)]);
      setVaults(v);
      setEpochs(e);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const totalDeposited = vaults.reduce((s, v) => s + v.deposited, 0);
  const currentValue = vaults.reduce((s, v) => s + v.currentValue, 0);
  const unrealisedGain = currentValue - totalDeposited;
  const platformCut = unrealisedGain > 0 ? unrealisedGain * 0.2 : 0;

  const handleDepositTab = () => {
    setActiveTab('deposit');
    router.push('/deposit');
  };

  const handleWithdrawTab = () => {
    setActiveTab('withdraw');
  };

  const sections: Section[] = [];

  if (!loading) {
    sections.push({
      type: 'portfolioCard',
      data: { totalDeposited, currentValue, unrealisedGain, platformCut },
    });
    sections.push({ type: 'tabSwitcher' });
    sections.push({ type: 'sectionTitle', title: 'Allocation' });

    if (vaults.length === 0) {
      sections.push({ type: 'empty', message: 'No vaults yet. Deposit to get started.' });
    } else {
      vaults.forEach((v) => sections.push({ type: 'allocationRow', data: v }));
    }

    sections.push({ type: 'sectionTitle', title: 'Epoch History' });

    if (epochs.length === 0) {
      sections.push({ type: 'empty', message: 'No epoch history yet.' });
    } else {
      epochs.forEach((e) => sections.push({ type: 'epochRow', data: e }));
    }
  }

  const renderItem = ({ item }: { item: Section }) => {
    switch (item.type) {
      case 'portfolioCard':
        return <PortfolioCard {...item.data} />;

      case 'tabSwitcher':
        return (
          <View style={styles.tabWrapper}>
            <TabSwitcher
              active={activeTab}
              onDeposit={handleDepositTab}
              onWithdraw={handleWithdrawTab}
            />
          </View>
        );

      case 'sectionTitle':
        return (
          <View style={styles.sectionTitleWrapper}>
            <Text style={styles.sectionTitle}>{item.title}</Text>
          </View>
        );

      case 'allocationRow':
        return <AllocationRow vault={item.data} />;

      case 'epochRow':
        return <EpochRow epoch={item.data} />;

      case 'empty':
        return (
          <View style={styles.emptyRow}>
            <Text style={styles.emptyRowText}>{item.message}</Text>
          </View>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>Vault</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.loadingText}>Loading portfolio...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Vault</Text>
      </View>
      <FlatList
        data={sections}
        keyExtractor={(item, index) => {
          if (item.type === 'allocationRow') return `vault-${item.data.id}`;
          if (item.type === 'epochRow') return `epoch-${item.data.id}`;
          if (item.type === 'sectionTitle') return `title-${item.title}`;
          return `${item.type}-${index}`;
        }}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={PRIMARY}
            colors={[PRIMARY]}
          />
        }
      />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const cardShadow = Platform.select({
  ios: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  android: { elevation: 2 },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  screenHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  listContent: {
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#94A3B8',
  },

  // Portfolio card
  portfolioCard: {
    backgroundColor: PRIMARY,
    margin: 16,
    marginBottom: 0,
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  portfolioLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 4,
  },
  portfolioValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  portfolioStatsRow: {
    flexDirection: 'row',
  },
  portfolioStat: {
    flex: 1,
  },
  portfolioStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 2,
  },
  portfolioStatValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Tab switcher
  tabWrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  tabRow: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  tabBtnLeft: {
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  tabBtnRight: {
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    borderLeftWidth: 1,
    borderLeftColor: '#E2E8F0',
  },
  tabBtnActive: {
    backgroundColor: PRIMARY,
  },
  tabBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
  },

  // Section title
  sectionTitleWrapper: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },

  // Allocation card
  allocationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    ...cardShadow,
  },
  allocationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  logoChip: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  allocationName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  allocationWinRate: {
    fontSize: 12,
    color: '#64748B',
  },
  allocationRight: {
    alignItems: 'flex-end',
  },
  allocationValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  allocationGain: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Epoch card
  epochCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    ...cardShadow,
  },
  epochLeft: {
    flex: 1,
    marginRight: 12,
  },
  epochMonth: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
  },
  epochRange: {
    fontSize: 12,
    color: '#64748B',
  },
  epochRight: {
    alignItems: 'flex-end',
  },
  epochProfit: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  epochPlatformCut: {
    fontSize: 11,
    color: '#94A3B8',
  },

  // Empty
  emptyRow: {
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  emptyRowText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
  },
});
