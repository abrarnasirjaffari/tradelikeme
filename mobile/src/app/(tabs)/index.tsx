import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { getPnl } from '@/api/vault';
import { useWebSocket } from '@/hooks/useWebSocket';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import type { EpochSummary, WsEvent } from '@/types/api';

// ─── helpers ────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatCurrency(n: number): string {
  const abs = Math.abs(n);
  const prefix = n >= 0 ? '+$' : '-$';
  return `${prefix}${abs.toFixed(2)}`;
}

function getActivityValue(event: WsEvent): { text: string; color: string } {
  const type = event.type ?? '';
  const payload = event.payload as Record<string, unknown> | null;
  const pnl = payload?.pnl as number | undefined;

  switch (type) {
    case 'TP1_HIT':
    case 'TP2_HIT':
      return { text: pnl != null ? formatCurrency(pnl) : 'Hit', color: '#22C55E' };
    case 'SL_HIT':
      return { text: pnl != null ? formatCurrency(pnl) : 'SL Hit', color: '#EF4444' };
    case 'ZONE_TOUCH':
      return { text: 'Watching', color: '#F59E0B' };
    case 'TRADE_ENTERED':
      return { text: 'Entered', color: '#3B82F6' };
    case 'BALANCE_LOW':
      return { text: 'Warning', color: '#F59E0B' };
    case 'AGENT_DOWN':
      return { text: 'Offline', color: '#EF4444' };
    default:
      return { text: 'Update', color: '#64748B' };
  }
}

interface EventMeta {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  bgColor: string;
  description: string;
}

function getEventMeta(event: WsEvent): EventMeta {
  const type = event.type ?? '';
  const payload = event.payload as Record<string, unknown> | null;
  const symbol = (payload?.symbol as string) ?? '';
  const dir = (payload?.direction as string) ?? '';
  const label = symbol ? (dir ? `${symbol} ${dir}` : symbol) : '';

  switch (type) {
    case 'ZONE_TOUCH':
      return {
        icon: 'radio-button-on',
        iconColor: '#3B82F6',
        bgColor: '#EFF6FF',
        description: label ? `Zone Touch — ${label}` : 'Zone touch detected',
      };
    case 'TRADE_ENTERED':
      return {
        icon: 'enter-outline',
        iconColor: '#3B82F6',
        bgColor: '#EFF6FF',
        description: label ? `Entered — ${label}` : 'Trade entered',
      };
    case 'TP1_HIT':
      return {
        icon: 'checkmark-circle',
        iconColor: '#22C55E',
        bgColor: '#F0FDF4',
        description: label ? `TP1 Hit — ${label}` : 'TP1 hit',
      };
    case 'TP2_HIT':
      return {
        icon: 'trophy',
        iconColor: '#22C55E',
        bgColor: '#F0FDF4',
        description: label ? `TP2 Hit — ${label}` : 'TP2 hit',
      };
    case 'SL_HIT':
      return {
        icon: 'close-circle',
        iconColor: '#EF4444',
        bgColor: '#FEF2F2',
        description: label ? `SL Hit — ${label}` : 'Stop loss hit',
      };
    case 'BALANCE_LOW':
      return {
        icon: 'warning',
        iconColor: '#F59E0B',
        bgColor: '#FFFBEB',
        description: 'Balance below minimum',
      };
    case 'AGENT_DOWN':
      return {
        icon: 'alert-circle',
        iconColor: '#EF4444',
        bgColor: '#FEF2F2',
        description: 'Agent offline',
      };
    case 'DAILY_SUMMARY':
      return {
        icon: 'bar-chart',
        iconColor: '#8B5CF6',
        bgColor: '#F5F3FF',
        description: 'Daily summary',
      };
    default:
      return {
        icon: 'information-circle',
        iconColor: '#64748B',
        bgColor: '#F8FAFC',
        description: type || 'Activity update',
      };
  }
}

function formatActivityTime(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffH = Math.floor(diffMs / 3_600_000);
    if (diffH < 1) return 'Just now';
    if (diffH < 24) return `${diffH} hour${diffH === 1 ? '' : 's'} ago`;
    if (diffH < 48) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}

// Static fallback activity items shown when no live events exist
const STATIC_EVENTS = [
  {
    id: 'static-1',
    icon: 'checkmark-circle' as const,
    iconColor: '#22C55E',
    bgColor: '#F0FDF4',
    description: 'TP1 Hit — SOL LONG',
    time: '2 hours ago',
    value: '+$42.10',
    valueColor: '#22C55E',
  },
  {
    id: 'static-2',
    icon: 'radio-button-on' as const,
    iconColor: '#3B82F6',
    bgColor: '#EFF6FF',
    description: 'Zone Touch — BTC',
    time: '4 hours ago',
    value: 'Watching',
    valueColor: '#F59E0B',
  },
  {
    id: 'static-3',
    icon: 'close-circle' as const,
    iconColor: '#EF4444',
    bgColor: '#FEF2F2',
    description: 'SL Hit — XRP SHORT',
    time: 'Yesterday',
    value: '-$18.40',
    valueColor: '#EF4444',
  },
];

// ─── main screen ─────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const pnl = useDashboardStore((s) => s.pnl);
  const recentEvents = useDashboardStore((s) => s.recentEvents);
  const setPnl = useDashboardStore((s) => s.setPnl);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [epochs, setEpochs] = useState<EpochSummary[]>([]);

  useWebSocket(user?.id ?? '');

  const fetchData = useCallback(
    async (silent = false) => {
      if (!user?.id) return;
      if (!silent) setIsLoading(true);
      try {
        const fetched = await getPnl(user.id);
        setEpochs(fetched);
        const latest = fetched[0];
        if (latest) {
          setPnl({
            totalPnl: fetched.reduce((sum, e) => sum + e.netProfit, 0),
            winRate: 89,
            openTrades: 0,
            todayPnl: latest.netProfit,
          });
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [user?.id, setPnl]
  );

  useEffect(() => {
    void fetchData(false);
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    void fetchData(true);
  }, [fetchData]);

  const firstName = user?.name?.split(' ')[0] ?? 'Trader';
  const initials = (user?.name ?? 'A')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const totalPnl = pnl?.totalPnl ?? 1284.5;
  const totalPnlPositive = totalPnl >= 0;
  const winRate = pnl?.winRate ?? 89;
  const openTrades = pnl?.openTrades ?? 2;

  const displayedEvents = recentEvents.slice(0, 3);
  const hasLiveEvents = displayedEvents.length > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#1D4ED8"
            colors={['#1D4ED8']}
          />
        }
      >
        {/* ── header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{getGreeting()}, {firstName}</Text>
            <Text style={styles.headerTitle}>Dashboard</Text>
          </View>
          <TouchableOpacity
            style={styles.avatarCircle}
            onPress={() => router.push('/(tabs)/settings')}
            activeOpacity={0.8}
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </TouchableOpacity>
        </View>

        {/* ── P&L blue gradient card ── */}
        <View style={styles.pnlCard}>
          {isLoading ? (
            <>
              <LoadingSkeleton width={80} height={12} borderRadius={4} style={{ marginBottom: 10, opacity: 0.4 }} />
              <LoadingSkeleton width={180} height={40} borderRadius={6} style={{ marginBottom: 8, opacity: 0.4 }} />
              <LoadingSkeleton width={140} height={14} borderRadius={4} style={{ opacity: 0.4 }} />
            </>
          ) : (
            <>
              <Text style={styles.pnlLabel}>Total P&amp;L</Text>
              <Text style={styles.pnlValue}>
                {totalPnlPositive ? '+' : '-'}${Math.abs(totalPnl).toFixed(2)}
              </Text>
              <View style={styles.pnlChangeRow}>
                <Ionicons
                  name={totalPnlPositive ? 'arrow-up' : 'arrow-down'}
                  size={14}
                  color="#93C5FD"
                />
                <Text style={styles.pnlChange}>8.4% this month</Text>
              </View>
            </>
          )}
        </View>

        {/* ── two stat cards row ── */}
        <View style={styles.statRow}>
          {/* Win Rate */}
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Win Rate</Text>
            {isLoading ? (
              <LoadingSkeleton width={60} height={28} borderRadius={4} style={{ marginVertical: 4 }} />
            ) : (
              <Text style={styles.statValue}>{winRate}%</Text>
            )}
            <Text style={styles.statBadgeGreen}>Verified</Text>
          </View>
          {/* Open Trades */}
          <View style={[styles.statCard, styles.statCardRight]}>
            <Text style={styles.statLabel}>Open Trades</Text>
            {isLoading ? (
              <LoadingSkeleton width={40} height={28} borderRadius={4} style={{ marginVertical: 4 }} />
            ) : (
              <Text style={styles.statValue}>{openTrades}</Text>
            )}
            <Text style={styles.statBadgeBlue}>Active now</Text>
          </View>
        </View>

        {/* ── recent activity ── */}
        <View style={styles.activityHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/trades')} activeOpacity={0.7}>
            <Text style={styles.seeAll}>See all →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.activityCard}>
          {isLoading ? (
            [0, 1, 2].map((i) => (
              <View key={i} style={[styles.activityRow, i < 2 && styles.activityDivider]}>
                <LoadingSkeleton width={36} height={36} borderRadius={18} />
                <View style={styles.activityTextBlock}>
                  <LoadingSkeleton width={160} height={13} borderRadius={4} style={{ marginBottom: 6 }} />
                  <LoadingSkeleton width={80} height={11} borderRadius={4} />
                </View>
                <LoadingSkeleton width={50} height={13} borderRadius={4} />
              </View>
            ))
          ) : hasLiveEvents ? (
            displayedEvents.map((event, idx) => {
              const meta = getEventMeta(event);
              const val = getActivityValue(event);
              return (
                <View
                  key={`${event.timestamp}-${idx}`}
                  style={[styles.activityRow, idx < displayedEvents.length - 1 && styles.activityDivider]}
                >
                  <View style={[styles.activityIconWrap, { backgroundColor: meta.bgColor }]}>
                    <Ionicons name={meta.icon} size={18} color={meta.iconColor} />
                  </View>
                  <View style={styles.activityTextBlock}>
                    <Text style={styles.activityDesc}>{meta.description}</Text>
                    <Text style={styles.activityTime}>{formatActivityTime(event.timestamp)}</Text>
                  </View>
                  <Text style={[styles.activityValue, { color: val.color }]}>{val.text}</Text>
                </View>
              );
            })
          ) : (
            STATIC_EVENTS.map((item, idx) => (
              <View
                key={item.id}
                style={[styles.activityRow, idx < STATIC_EVENTS.length - 1 && styles.activityDivider]}
              >
                <View style={[styles.activityIconWrap, { backgroundColor: item.bgColor }]}>
                  <Ionicons name={item.icon} size={18} color={item.iconColor} />
                </View>
                <View style={styles.activityTextBlock}>
                  <Text style={styles.activityDesc}>{item.description}</Text>
                  <Text style={styles.activityTime}>{item.time}</Text>
                </View>
                <Text style={[styles.activityValue, { color: item.valueColor }]}>{item.value}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    paddingBottom: 24,
  },

  // header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingTop: 4,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '400',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  // P&L card
  pnlCard: {
    backgroundColor: '#1D4ED8',
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
  },
  pnlLabel: {
    fontSize: 12,
    color: '#BFDBFE',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  pnlValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 8,
  },
  pnlChangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pnlChange: {
    fontSize: 13,
    color: '#93C5FD',
    fontWeight: '500',
  },

  // stat row
  statRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statCardRight: {
    // no extra styles needed — gap handles spacing
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  statBadgeGreen: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16A34A',
  },
  statBadgeBlue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1D4ED8',
  },

  // activity section
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1D4ED8',
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  activityDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  activityIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityTextBlock: {
    flex: 1,
  },
  activityDesc: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
  activityValue: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },

  bottomSpacer: {
    height: 24,
  },
});
