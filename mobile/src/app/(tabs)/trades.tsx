import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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
        <SkeletonBlock width={80} height={20} />
        <SkeletonBlock width={60} height={20} />
      </View>
      <SkeletonBlock width="100%" height={1} style={{ marginBottom: 12 }} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <SkeletonBlock width={70} height={16} />
        <SkeletonBlock width={70} height={16} />
        <SkeletonBlock width={70} height={16} />
      </View>
    </View>
  );
}

function TradeRowSkeleton() {
  return (
    <View style={styles.skeletonRow}>
      <View style={{ flex: 1, gap: 6 }}>
        <SkeletonBlock width={120} height={14} />
        <SkeletonBlock width={160} height={12} />
      </View>
      <View style={{ alignItems: 'flex-end', gap: 6 }}>
        <SkeletonBlock width={60} height={14} />
        <SkeletonBlock width={80} height={12} />
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

  return (
    <TouchableOpacity style={styles.positionCard} onPress={() => onClose(position)} activeOpacity={0.8}>
      <View style={styles.positionCardHeader}>
        <View style={styles.positionSymbolRow}>
          <Text style={styles.positionSymbol}>{position.symbol}</Text>
          <View style={[styles.directionBadge, isLong ? styles.longBadge : styles.shortBadge]}>
            <Text style={styles.directionText}>{position.direction}</Text>
          </View>
        </View>
        <View style={styles.positionPnlBox}>
          <Text style={[styles.positionPnl, isPnlPositive ? styles.pnlPositive : styles.pnlNegative]}>
            {formatPnl(position.unrealisedPnl)}
          </Text>
          <Ionicons
            name={isPnlPositive ? 'trending-up' : 'trending-down'}
            size={14}
            color={isPnlPositive ? '#22C55E' : '#EF4444'}
          />
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.positionDetails}>
        <View style={styles.detailCol}>
          <Text style={styles.detailLabel}>Entry</Text>
          <Text style={styles.detailValue}>${formatPrice(position.entryPrice)}</Text>
        </View>
        <View style={styles.detailCol}>
          <Text style={styles.detailLabel}>Current</Text>
          <Text style={styles.detailValue}>${formatPrice(position.currentPrice)}</Text>
        </View>
        <View style={styles.detailCol}>
          <Text style={styles.detailLabel}>Qty</Text>
          <Text style={styles.detailValue}>{position.qty}</Text>
        </View>
      </View>

      <View style={styles.positionLevels}>
        <View style={styles.levelItem}>
          <Text style={styles.levelLabel}>TP1</Text>
          <Text style={[styles.levelValue, styles.tpColor]}>${formatPrice(position.tp1)}</Text>
        </View>
        <View style={styles.levelItem}>
          <Text style={styles.levelLabel}>TP2</Text>
          <Text style={[styles.levelValue, styles.tpColor]}>${formatPrice(position.tp2)}</Text>
        </View>
        <View style={styles.levelItem}>
          <Text style={styles.levelLabel}>SL</Text>
          <Text style={[styles.levelValue, styles.slColor]}>${formatPrice(position.sl)}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.closeBtn} onPress={() => onClose(position)}>
        <Text style={styles.closeBtnText}>Close Position</Text>
      </TouchableOpacity>
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trades</Text>
      </View>

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
  header: {
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
  segmented: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
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
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  positionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  positionSymbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  positionSymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  directionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  longBadge: {
    backgroundColor: '#3B82F6',
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
  positionPnlBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  positionPnl: {
    fontSize: 16,
    fontWeight: '700',
  },
  pnlPositive: {
    color: '#22C55E',
  },
  pnlNegative: {
    color: '#EF4444',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 12,
  },
  positionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailCol: {
    gap: 2,
  },
  detailLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  positionLevels: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    gap: 0,
  },
  levelItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  levelLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  levelValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  tpColor: {
    color: '#22C55E',
  },
  slColor: {
    color: '#EF4444',
  },
  closeBtn: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
  },
  // History filter
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#3B82F6',
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
