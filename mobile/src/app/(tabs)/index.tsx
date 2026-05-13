import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { getPnl } from '@/api/vault';
import { useWebSocket } from '@/hooks/useWebSocket';
import PnlCard from '@/components/PnlCard';
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

function formatPercent(n: number): string {
  return `${n.toFixed(1)}%`;
}

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

interface EventMeta {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  description: string;
}

function getEventMeta(event: WsEvent): EventMeta {
  const type = event.type ?? '';
  const payload = event.payload as Record<string, unknown> | null;
  const symbol = (payload?.symbol as string) ?? '';

  switch (type) {
    case 'ZONE_TOUCH':
      return {
        icon: 'radio-button-on-outline',
        iconColor: '#F59E0B',
        description: symbol ? `Zone touch — ${symbol}` : 'Zone touch detected',
      };
    case 'TRADE_ENTERED':
      return {
        icon: 'enter-outline',
        iconColor: '#3B82F6',
        description: symbol ? `Entered ${symbol}` : 'Trade entered',
      };
    case 'TP1_HIT':
      return {
        icon: 'checkmark-circle-outline',
        iconColor: '#22C55E',
        description: symbol ? `TP1 hit — ${symbol}` : 'TP1 hit',
      };
    case 'TP2_HIT':
      return {
        icon: 'trophy-outline',
        iconColor: '#22C55E',
        description: symbol ? `TP2 hit — ${symbol}` : 'TP2 hit',
      };
    case 'SL_HIT':
      return {
        icon: 'close-circle-outline',
        iconColor: '#EF4444',
        description: symbol ? `SL hit — ${symbol}` : 'Stop loss hit',
      };
    case 'BALANCE_LOW':
      return {
        icon: 'warning-outline',
        iconColor: '#F59E0B',
        description: 'Balance below minimum threshold',
      };
    case 'AGENT_DOWN':
      return {
        icon: 'alert-circle-outline',
        iconColor: '#EF4444',
        description: 'Agent offline — check connection',
      };
    case 'DAILY_SUMMARY':
      return {
        icon: 'bar-chart-outline',
        iconColor: '#8B5CF6',
        description: 'Daily summary available',
      };
    default:
      return {
        icon: 'information-circle-outline',
        iconColor: '#64748B',
        description: type || 'Activity update',
      };
  }
}

// ─── quick link card ─────────────────────────────────────────────────────────

interface QuickLinkProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}

function QuickLinkCard({ icon, label, onPress }: QuickLinkProps) {
  return (
    <TouchableOpacity style={styles.quickLink} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.quickLinkIcon}>
        <Ionicons name={icon} size={22} color="#3B82F6" />
      </View>
      <Text style={styles.quickLinkLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── main screen ─────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const pnl = useDashboardStore((s) => s.pnl);
  const wsConnected = useDashboardStore((s) => s.wsConnected);
  const recentEvents = useDashboardStore((s) => s.recentEvents);
  const setPnl = useDashboardStore((s) => s.setPnl);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [epochs, setEpochs] = useState<EpochSummary[]>([]);

  // start WebSocket — updates dashboardStore.wsConnected internally
  useWebSocket(user?.id ?? '');

  const fetchData = useCallback(
    async (silent = false) => {
      if (!user?.id) return;
      if (!silent) setIsLoading(true);
      try {
        const epochs = await getPnl(user.id);
        setEpochs(epochs);

        // derive PnlSummary from latest epoch
        const latest = epochs[0];
        if (latest) {
          setPnl({
            totalPnl: epochs.reduce((sum, e) => sum + e.netProfit, 0),
            winRate: 89,   // strategy win rate — no per-epoch win rate in API
            openTrades: 0, // populated via WS events
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
  const totalPnlPositive = (pnl?.totalPnl ?? 0) >= 0;
  const todayPnlPositive = (pnl?.todayPnl ?? 0) >= 0;

  const displayedEvents = recentEvents.slice(0, 5);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
            colors={['#3B82F6']}
          />
        }
      >
        {/* ── header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {getGreeting()}, {firstName} 👋
            </Text>
            <Text style={styles.subGreeting}>Here's your portfolio today</Text>
          </View>
          <View style={[styles.wsBadge, wsConnected ? styles.wsBadgeOn : styles.wsBadgeOff]}>
            <View style={[styles.wsDot, wsConnected ? styles.wsDotOn : styles.wsDotOff]} />
            <Text style={[styles.wsText, wsConnected ? styles.wsTextOn : styles.wsTextOff]}>
              {wsConnected ? 'Live' : 'Offline'}
            </Text>
          </View>
        </View>

        {/* ── summary cards row ── */}
        <Text style={styles.sectionLabel}>Portfolio Summary</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsRow}
        >
          <PnlCard
            label="Total P&L"
            value={pnl ? formatCurrency(pnl.totalPnl) : '--'}
            isPositive={pnl ? totalPnlPositive : undefined}
            isLoading={isLoading}
            style={styles.summaryCard}
          />
          <PnlCard
            label="Win Rate"
            value={pnl ? formatPercent(pnl.winRate) : '--'}
            isPositive={pnl ? pnl.winRate >= 55 : undefined}
            isLoading={isLoading}
            style={styles.summaryCard}
          />
          <PnlCard
            label="Open Trades"
            value={pnl ? String(pnl.openTrades) : '--'}
            isLoading={isLoading}
            style={styles.summaryCard}
          />
        </ScrollView>

        {/* ── today's P&L large card ── */}
        <Text style={styles.sectionLabel}>Today's P&L</Text>
        <View style={styles.todayCard}>
          {isLoading ? (
            <View>
              <LoadingSkeleton width={120} height={14} borderRadius={4} style={{ marginBottom: 12 }} />
              <LoadingSkeleton width={180} height={36} borderRadius={6} />
            </View>
          ) : (
            <>
              <Text style={styles.todayLabel}>Net profit (latest epoch)</Text>
              <Text
                style={[
                  styles.todayValue,
                  { color: todayPnlPositive ? '#22C55E' : '#EF4444' },
                ]}
              >
                {pnl ? formatCurrency(pnl.todayPnl) : '--'}
              </Text>
              {epochs[0] && (
                <Text style={styles.todayMeta}>
                  {epochs[0].startDate} → {epochs[0].endDate}
                </Text>
              )}
            </>
          )}
        </View>

        {/* ── recent activity ── */}
        <Text style={styles.sectionLabel}>Recent Activity</Text>
        <View style={styles.activityCard}>
          {isLoading ? (
            [0, 1, 2].map((i) => (
              <View key={i} style={styles.activityRow}>
                <LoadingSkeleton width={36} height={36} borderRadius={18} />
                <View style={styles.activityText}>
                  <LoadingSkeleton width={160} height={13} borderRadius={4} style={{ marginBottom: 6 }} />
                  <LoadingSkeleton width={80} height={11} borderRadius={4} />
                </View>
              </View>
            ))
          ) : displayedEvents.length === 0 ? (
            <View style={styles.emptyActivity}>
              <Ionicons name="pulse-outline" size={32} color="#CBD5E1" />
              <Text style={styles.emptyActivityText}>No recent activity</Text>
              <Text style={styles.emptyActivitySub}>Live events will appear here</Text>
            </View>
          ) : (
            displayedEvents.map((event, idx) => {
              const meta = getEventMeta(event);
              return (
                <View
                  key={`${event.timestamp}-${idx}`}
                  style={[
                    styles.activityRow,
                    idx < displayedEvents.length - 1 && styles.activityRowBorder,
                  ]}
                >
                  <View style={[styles.activityIconWrap, { backgroundColor: `${meta.iconColor}18` }]}>
                    <Ionicons name={meta.icon} size={18} color={meta.iconColor} />
                  </View>
                  <View style={styles.activityText}>
                    <Text style={styles.activityDesc}>{meta.description}</Text>
                    <Text style={styles.activityTime}>{formatTimestamp(event.timestamp)}</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* ── quick links ── */}
        <Text style={styles.sectionLabel}>Quick Links</Text>
        <View style={styles.quickLinksRow}>
          <QuickLinkCard
            icon="trending-up-outline"
            label="Active Trades"
            onPress={() => router.push('/(tabs)/trades')}
          />
          <QuickLinkCard
            icon="wallet-outline"
            label="Vault"
            onPress={() => router.push('/(tabs)/vault')}
          />
          <QuickLinkCard
            icon="grid-outline"
            label="Strategies"
            onPress={() => router.push('/(tabs)/strategies')}
          />
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
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 8,
  },

  // header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  subGreeting: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  wsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  wsBadgeOn: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  wsBadgeOff: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  wsDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 5,
  },
  wsDotOn: {
    backgroundColor: '#22C55E',
  },
  wsDotOff: {
    backgroundColor: '#F59E0B',
  },
  wsText: {
    fontSize: 12,
    fontWeight: '600',
  },
  wsTextOn: {
    color: '#16A34A',
  },
  wsTextOff: {
    color: '#D97706',
  },

  // section label
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },

  // summary cards
  cardsRow: {
    paddingBottom: 4,
    gap: 10,
    marginBottom: 20,
  },
  summaryCard: {
    minWidth: 120,
  },

  // today card
  todayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  todayLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  todayValue: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  todayMeta: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 6,
  },

  // activity
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 4,
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  activityRowBorder: {
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
  activityText: {
    flex: 1,
  },
  activityDesc: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
  },
  activityTime: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  emptyActivity: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  emptyActivityText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 10,
  },
  emptyActivitySub: {
    fontSize: 13,
    color: '#CBD5E1',
    marginTop: 4,
  },

  // quick links
  quickLinksRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  quickLink: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickLinkIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickLinkLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
  },

  bottomSpacer: {
    height: 24,
  },
});
