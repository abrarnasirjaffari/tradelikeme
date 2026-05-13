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
import { Ionicons } from '@expo/vector-icons';
import { getVaults, getPnl } from '@/api/vault';
import { usePhantomDeepLink } from '@/hooks/usePhantomDeepLink';
import { useAuthStore } from '@/store/authStore';
import type { Vault, EpochSummary } from '@/types/api';

function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

interface SummaryCardProps {
  totalDeposited: number;
  currentValue: number;
  unrealisedGain: number;
  gainPercent: number;
}

function SummaryCard({ totalDeposited, currentValue, unrealisedGain, gainPercent }: SummaryCardProps) {
  const isPositive = unrealisedGain >= 0;
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>Portfolio Value</Text>
      <Text style={styles.summaryValue}>{formatCurrency(currentValue)}</Text>
      <View style={styles.summaryGainRow}>
        <Ionicons
          name={isPositive ? 'trending-up' : 'trending-down'}
          size={14}
          color={isPositive ? '#16A34A' : '#DC2626'}
        />
        <Text style={[styles.summaryGain, { color: isPositive ? '#16A34A' : '#DC2626' }]}>
          {isPositive ? '+' : ''}{formatCurrency(unrealisedGain)} ({isPositive ? '+' : ''}{gainPercent.toFixed(2)}%)
        </Text>
      </View>
      <View style={styles.summaryDivider} />
      <View style={styles.summaryRow}>
        <View style={styles.summaryCol}>
          <Text style={styles.summaryColLabel}>Total Deposited</Text>
          <Text style={styles.summaryColValue}>{formatCurrency(totalDeposited)}</Text>
        </View>
        <View style={styles.summaryColDivider} />
        <View style={styles.summaryCol}>
          <Text style={styles.summaryColLabel}>Unrealised Gain</Text>
          <Text style={[styles.summaryColValue, { color: isPositive ? '#16A34A' : '#DC2626' }]}>
            {isPositive ? '+' : ''}{formatCurrency(unrealisedGain)}
          </Text>
        </View>
      </View>
    </View>
  );
}

interface VaultRowProps {
  vault: Vault;
}

function VaultRow({ vault }: VaultRowProps) {
  const gain = vault.currentValue - vault.deposited;
  const isPositive = gain >= 0;
  return (
    <View style={styles.vaultRow}>
      <View style={styles.vaultLeft}>
        <Text style={styles.vaultName}>{vault.strategyName}</Text>
        <Text style={styles.vaultAllocation}>{vault.allocationPercent.toFixed(1)}% of portfolio</Text>
      </View>
      <View style={styles.vaultRight}>
        <Text style={styles.vaultCurrentValue}>{formatCurrency(vault.currentValue)}</Text>
        <Text style={[styles.vaultGain, { color: isPositive ? '#16A34A' : '#DC2626' }]}>
          {isPositive ? '+' : ''}{formatCurrency(gain)}
        </Text>
      </View>
    </View>
  );
}

interface EpochRowProps {
  epoch: EpochSummary;
}

function EpochRow({ epoch }: EpochRowProps) {
  const isPositive = epoch.netProfit >= 0;
  return (
    <View style={styles.epochRow}>
      <View style={styles.epochHeader}>
        <Text style={styles.epochDates}>
          {formatDate(epoch.startDate)} – {formatDate(epoch.endDate)}
        </Text>
        <Text style={[styles.epochNetProfit, { color: isPositive ? '#16A34A' : '#DC2626' }]}>
          {isPositive ? '+' : ''}{formatCurrency(epoch.netProfit)}
        </Text>
      </View>
      <View style={styles.epochDetails}>
        <Text style={styles.epochDetail}>
          Profit: <Text style={styles.epochDetailBold}>{formatCurrency(epoch.profit)}</Text>
        </Text>
        <Text style={styles.epochDetailSep}>·</Text>
        <Text style={styles.epochDetail}>
          Cut: <Text style={[styles.epochDetailBold, { color: '#64748B' }]}>-{formatCurrency(epoch.platformCut)}</Text>
        </Text>
        <Text style={styles.epochDetailSep}>·</Text>
        <Text style={styles.epochDetail}>
          Net: <Text style={[styles.epochDetailBold, { color: isPositive ? '#16A34A' : '#DC2626' }]}>
            {isPositive ? '+' : ''}{formatCurrency(epoch.netProfit)}
          </Text>
        </Text>
      </View>
    </View>
  );
}

type Section =
  | { type: 'summary'; data: SummaryCardProps }
  | { type: 'actions' }
  | { type: 'allocationsHeader' }
  | { type: 'vaultRow'; data: Vault }
  | { type: 'epochsHeader' }
  | { type: 'epochRow'; data: EpochSummary }
  | { type: 'empty'; message: string };

export default function VaultScreen() {
  const user = useAuthStore((s) => s.user);
  const { isProcessing: phantomLoading, deposit, withdraw } = usePhantomDeepLink();

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
  const gainPercent = totalDeposited > 0 ? (unrealisedGain / totalDeposited) * 100 : 0;

  const sections: Section[] = [];

  if (!loading) {
    sections.push({
      type: 'summary',
      data: { totalDeposited, currentValue, unrealisedGain, gainPercent },
    });
    sections.push({ type: 'actions' });
    sections.push({ type: 'allocationsHeader' });

    if (vaults.length === 0) {
      sections.push({ type: 'empty', message: 'No vaults yet. Deposit to get started.' });
    } else {
      vaults.forEach((v) => sections.push({ type: 'vaultRow', data: v }));
    }

    sections.push({ type: 'epochsHeader' });

    if (epochs.length === 0) {
      sections.push({ type: 'empty', message: 'No epoch history yet.' });
    } else {
      epochs.forEach((e) => sections.push({ type: 'epochRow', data: e }));
    }
  }

  const renderItem = ({ item }: { item: Section }) => {
    switch (item.type) {
      case 'summary':
        return <SummaryCard {...item.data} />;

      case 'actions':
        return (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.depositButton, phantomLoading && styles.buttonDisabled]}
              onPress={() => deposit()}
              disabled={phantomLoading}
              activeOpacity={0.85}
            >
              {phantomLoading ? (
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.depositButtonText}>Opening Phantom...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.depositButtonText}>Deposit</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.withdrawButton, phantomLoading && styles.buttonDisabled]}
              onPress={() => withdraw()}
              disabled={phantomLoading}
              activeOpacity={0.85}
            >
              <Ionicons name="arrow-down-circle-outline" size={18} color="#3B82F6" style={{ marginRight: 8 }} />
              <Text style={styles.withdrawButtonText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        );

      case 'allocationsHeader':
        return (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderTitle}>Strategy Allocations</Text>
          </View>
        );

      case 'vaultRow':
        return (
          <View style={styles.card}>
            <VaultRow vault={item.data} />
          </View>
        );

      case 'epochsHeader':
        return (
          <View style={[styles.sectionHeader, { marginTop: 8 }]}>
            <Text style={styles.sectionHeaderTitle}>Epoch History</Text>
            <Text style={styles.sectionHeaderSub}>Monthly profit settlement records</Text>
          </View>
        );

      case 'epochRow':
        return (
          <View style={styles.card}>
            <EpochRow epoch={item.data} />
          </View>
        );

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
          <Text style={styles.screenSubtitle}>Your portfolio & profit history</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading portfolio...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Vault</Text>
        <Text style={styles.screenSubtitle}>Your portfolio & profit history</Text>
      </View>
      <FlatList
        data={sections}
        keyExtractor={(item, index) => {
          if (item.type === 'vaultRow') return `vault-${item.data.id}`;
          if (item.type === 'epochRow') return `epoch-${item.data.id}`;
          return `${item.type}-${index}`;
        }}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
            colors={['#3B82F6']}
          />
        }
      />
    </SafeAreaView>
  );
}

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
    marginBottom: 2,
  },
  screenSubtitle: {
    fontSize: 13,
    color: '#64748B',
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
  summaryCard: {
    backgroundColor: '#0F172A',
    margin: 16,
    marginBottom: 0,
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  summaryLabel: {
    fontSize: 12,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  summaryGainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  summaryGain: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
  },
  summaryCol: {
    flex: 1,
  },
  summaryColDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 16,
  },
  summaryColLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  summaryColValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  depositButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: { elevation: 3 },
    }),
  },
  depositButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  withdrawButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#3B82F6',
  },
  withdrawButtonText: {
    color: '#3B82F6',
    fontSize: 15,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionHeaderSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    ...cardShadow,
  },
  vaultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  vaultLeft: {
    flex: 1,
    marginRight: 12,
  },
  vaultName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 3,
  },
  vaultAllocation: {
    fontSize: 12,
    color: '#94A3B8',
  },
  vaultRight: {
    alignItems: 'flex-end',
  },
  vaultCurrentValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  vaultGain: {
    fontSize: 12,
    fontWeight: '600',
  },
  epochRow: {
    padding: 14,
  },
  epochHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  epochDates: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  epochNetProfit: {
    fontSize: 14,
    fontWeight: '700',
  },
  epochDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  epochDetail: {
    fontSize: 12,
    color: '#64748B',
  },
  epochDetailSep: {
    fontSize: 12,
    color: '#CBD5E1',
  },
  epochDetailBold: {
    fontWeight: '600',
    color: '#0F172A',
  },
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
