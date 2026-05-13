import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTradesStore } from '@/store/tradesStore';
import { useAuthStore } from '@/store/authStore';
import { getPositions, getTrades, closeTrade } from '@/api/trades';
import TradeRow from '@/components/TradeRow';
import CloseTradeModal from '@/components/CloseTradeModal';
import type { Position, Trade } from '@/types/api';

type TabKey = 'active' | 'history';
type TradeFilter = 'all' | 'wins' | 'losses';

function formatPrice(price: number): string {
  if (price >= 1000) {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }
  return price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

function formatPnl(pnl: number): string {
  const sign = pnl >= 0 ? '+' : '';
  return `${sign}$${Math.abs(pnl).toFixed(2)}`;
}

function SkeletonBlock({ width, height, style }: { width: number | string; height: number; style?: object }) {
  return (
    <View
      style={[
        { width: width as number, height, borderRadius: 6, backgroundColor: '#F1F5F9' },
        style,
      ]}
    />
  );
}

function PositionCardSkeleton() {
  return (
    <View style={styles.positionCard}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
        <SkeletonBlock width={120} height={20} />
        <SkeletonBlock width={60} height={20} />
      </View>
      <SkeletonBlock width="100%" height={1} style={{ marginBottom: 12 }} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
        <SkeletonBlock width={70} height={32} />
        <SkeletonBlock width={70} height={32} />
        <SkeletonBlock width={70} height={32} />
      </View>
      <SkeletonBlock width="100%" height={40} style={{ borderRadius: 8 }} />
    </View>
  );
}

function TradeRowSkeleton() {
  return (
    <View style={styles.skeletonRow}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
        <SkeletonBlock width={40} height={40} style={{ borderRadius: 20 }} />
        <View style={{ gap: 6, flex: 1 }}>
          <SkeletonBlock width={120} height={14} />
          <SkeletonBlock width={160} height={12} />
        </View>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 6 }}>
        <SkeletonBlock width={60} height={14} />
      </View>
    </View>
  );
}

interface PositionCardProps {
  position: Position;
  onClose: (position: Position) => void;
}

function PositionCard({ position, onClose }: PositionCardProps) {
  const isLong = position.direction === 'LONG';
  const isPnlPositive = position.unrealisedPnl >= 0;

  const handlePress = () => {
    router.push(`/trade/${position.id}` as any);
  };

  return (
    <TouchableOpacity style={styles.positionCard} onPress={handlePress} activeOpacity={0.85}>
      {/* Card header: symbol chip + pair label left, direction badge right */}
      <View style={styles.positionCardHeader}>
        <View style={styles.positionSymbolRow}>
          <View style={styles.symbolChip}>
            <Text style={styles.symbolChipText}>{position.symbol}</Text>
          </View>
          <Text style={styles.pairLabel}>{position.symbol}/USDT · 200x</Text>
        </View>
        <View style={[styles.directionBadge, isLong ? styles.longBadge : styles.shortBadge]}>
          <Text style={styles.directionText}>{position.direction}</Text>
        </View>
      </View>

      {/* 3-column row: Entry / Current / Unrealised P&L */}
      <View style={styles.positionDetails}>
        <View style={styles.detailCol}>
          <Text style={styles.detailLabel}>Entry</Text>
          <Text style={styles.detailValue}>${formatPrice(position.entryPrice)}</Text>
        </View>
        <View style={[styles.detailCol, styles.detailColCenter]}>
          <Text style={styles.detailLabel}>Current</Text>
          <Text style={styles.detailValue}>${formatPrice(position.currentPrice)}</Text>
        </View>
        <View style={[styles.detailCol, styles.detailColRight]}>
          <Text style={styles.detailLabel}>Unrealised P&L</Text>
          <Text style={[styles.detailValueBold, isPnlPositive ? styles.pnlPositive : styles.pnlNegative]}>
            {formatPnl(position.unrealisedPnl)}
          </Text>
        </View>
      </View>

      {/* TP/SL levels strip */}
      <View style={styles.positionLevels}>
        <Text style={[styles.levelInline, styles.tpColor]}>
          TP1 ${formatPrice(position.tp1)}
        </Text>
        <View style={styles.levelDivider} />
        <Text style={[styles.levelInline, styles.tpColor]}>
          TP2 ${formatPrice(position.tp2)}
        </Text>
        <View style={styles.levelDivider} />
        <Text style={[styles.levelInline, styles.slColor]}>
          SL ${formatPrice(position.sl)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function TradesScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('active');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const { user } = useAuthStore();
  const {
    positions,
    trades,
    isLoadingPositions,
    isLoadingTrades,
    filter,
    setPositions,
    setTrades,
    setFilter,
    filteredTrades,
    removePosition,
  } = useTradesStore();

  const loadData = useCallback(
    async (showRefresh = false) => {
      if (!user?.id) return;
      if (showRefresh) setIsRefreshing(true);

      try {
        const [posData, tradeData] = await Promise.all([
          getPositions(user.id),
          getTrades(user.id),
        ]);
        setPositions(posData);
        setTrades(tradeData);
      } finally {
        setIsRefreshing(false);
        setInitialLoading(false);
      }
    },
    [user?.id, setPositions, setTrades]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(() => {
    loadData(true);
  }, [loadData]);

  const handleOpenModal = useCallback((position: Position) => {
    setSelectedPosition(position);
    setModalVisible(true);
  }, []);

  const handleCancelModal = useCallback(() => {
    if (!isClosing) {
      setModalVisible(false);
      setSelectedPosition(null);
    }
  }, [isClosing]);

  const handleConfirmClose = useCallback(async () => {
    if (!selectedPosition) return;
    setIsClosing(true);
    try {
      await closeTrade(selectedPosition.strategyId, selectedPosition.id);
      removePosition(selectedPosition.id);
      setModalVisible(false);
      setSelectedPosition(null);
    } finally {
      setIsClosing(false);
    }
  }, [selectedPosition, removePosition]);

  const displayedTrades = filteredTrades();

  const renderActiveContent = () => {
    if (initialLoading && isLoadingPositions) {
      return (
        <View style={styles.listContent}>
          {[1, 2].map((k) => (
            <PositionCardSkeleton key={k} />
          ))}
        </View>
      );
    }

    if (positions.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="analytics-outline" size={56} color="#CBD5E1" />
          <Text style={styles.emptyTitle}>No open positions</Text>
          <Text style={styles.emptySubtitle}>
            Active trades will appear here when the agent enters a position.
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={positions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PositionCard position={item} onClose={handleOpenModal} />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#3B82F6" />
        }
        showsVerticalScrollIndicator={false}
      />
    );
  };

  const renderHistoryContent = () => {
    if (initialLoading && isLoadingTrades) {
      return (
        <View>
          {[1, 2, 3, 4].map((k) => (
            <TradeRowSkeleton key={k} />
          ))}
        </View>
      );
    }

    return (
      <FlatList
        data={displayedTrades}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TradeRow trade={item} />}
        ListHeaderComponent={
          <View style={styles.filterRow}>
            {(['all', 'wins', 'losses'] as TradeFilter[]).map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, filter === f && styles.filterChipActive]}
                onPress={() => setFilter(f)}
              >
                <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={56} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No trades yet</Text>
            <Text style={styles.emptySubtitle}>
              Your completed trades will appear here.
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#3B82F6" />
        }
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header row: title left, LIVE badge right (shown on active tab) */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {activeTab === 'active' ? 'Active Trades' : 'Trade History'}
        </Text>
        {activeTab === 'active' && (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
      </View>

      {/* Tab switcher pills */}
      <View style={styles.segmented}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'active' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.segmentText, activeTab === 'active' && styles.segmentTextActive]}>
            Active
          </Text>
          {positions.length > 0 && (
            <View style={[styles.badge, activeTab === 'active' && styles.badgeActive]}>
              <Text style={[styles.badgeText, activeTab === 'active' && styles.badgeTextActive]}>
                {positions.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'history' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.segmentText, activeTab === 'history' && styles.segmentTextActive]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContent}>
        {activeTab === 'active' ? renderActiveContent() : renderHistoryContent()}
      </View>

      <CloseTradeModal
        visible={modalVisible}
        position={selectedPosition}
        onConfirm={handleConfirmClose}
        onCancel={handleCancelModal}
        isClosing={isClosing}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  // LIVE badge
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 5,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#16A34A',
  },
  liveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A34A',
    letterSpacing: 0.5,
  },
  // Tab switcher pills
  segmented: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  segmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    gap: 6,
  },
  segmentBtnActive: {
    backgroundColor: '#3B82F6',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  badgeTextActive: {
    color: '#FFFFFF',
  },
  tabContent: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  // Position card
  positionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  positionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  positionSymbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // Coin symbol chip — gray bg, rounded 6, bold 12px
  symbolChip: {
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  symbolChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  pairLabel: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  directionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  longBadge: {
    backgroundColor: '#1D4ED8',
  },
  shortBadge: {
    backgroundColor: '#F59E0B',
  },
  directionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  pnlPositive: {
    color: '#22C55E',
  },
  pnlNegative: {
    color: '#EF4444',
  },
  // 3-column details row
  positionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailCol: {
    gap: 3,
  },
  detailColCenter: {
    alignItems: 'center',
  },
  detailColRight: {
    alignItems: 'flex-end',
  },
  detailLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  detailValueBold: {
    fontSize: 14,
    fontWeight: '700',
  },
  // TP/SL levels inline strip
  positionLevels: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 6,
  },
  levelInline: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  levelDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#E2E8F0',
  },
  tpColor: {
    color: '#22C55E',
  },
  slColor: {
    color: '#EF4444',
  },
  // History filter pills
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterChipActive: {
    backgroundColor: '#3B82F6',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  // Skeleton
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
});
