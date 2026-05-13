import { View, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type WsEventType =
  | 'ZONE_TOUCH'
  | 'TRADE_ENTERED'
  | 'TP1_HIT'
  | 'TP2_HIT'
  | 'SL_HIT'
  | 'BALANCE_LOW'
  | 'AGENT_DOWN'
  | 'DAILY_SUMMARY';

const KNOWN_EVENT_TYPES: ReadonlySet<WsEventType> = new Set([
  'ZONE_TOUCH',
  'TRADE_ENTERED',
  'TP1_HIT',
  'TP2_HIT',
  'SL_HIT',
  'BALANCE_LOW',
  'AGENT_DOWN',
  'DAILY_SUMMARY',
] as const);

function isKnownEventType(value: string): value is WsEventType {
  return KNOWN_EVENT_TYPES.has(value as WsEventType);
}

interface EventPayload {
  coin?: string;
  price?: number | string;
  direction?: string;
  pnl?: number | string;
  totalPnl?: number | string;
  loss?: number | string;
  balance?: number | string;
  n?: number | string;
  tradeId?: string;
  tp1?: number | string;
  tp2?: number | string;
  sl?: number | string;
  entry?: number | string;
  newSl?: number | string;
  remainingQty?: string;
  [key: string]: unknown;
}

function formatCurrency(val?: number | string): string {
  if (val === undefined || val === null || val === '') return '—';
  const n = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(n)) return String(val);
  return n.toFixed(2);
}

function getEventConfig(type: WsEventType): {
  iconName: string;
  iconColor: string;
  iconBg: string;
  titleShort: string;
  subtitle: string;
} {
  switch (type) {
    case 'TP1_HIT':
      return {
        iconName: 'checkmark-circle',
        iconColor: '#16A34A',
        iconBg: '#DCFCE7',
        titleShort: 'TP1 Hit!',
        subtitle: 'SOL/USDT · LONG',
      };
    case 'TP2_HIT':
      return {
        iconName: 'trophy',
        iconColor: '#16A34A',
        iconBg: '#DCFCE7',
        titleShort: 'TP2 Hit!',
        subtitle: 'Trade Complete',
      };
    case 'ZONE_TOUCH':
      return {
        iconName: 'radio-button-on',
        iconColor: '#3B82F6',
        iconBg: '#EFF6FF',
        titleShort: 'Zone Touch',
        subtitle: 'Demand Zone Reached',
      };
    case 'TRADE_ENTERED':
      return {
        iconName: 'enter',
        iconColor: '#3B82F6',
        iconBg: '#EFF6FF',
        titleShort: 'Trade Entered',
        subtitle: 'Position Opened',
      };
    case 'SL_HIT':
      return {
        iconName: 'close-circle',
        iconColor: '#EF4444',
        iconBg: '#FEF2F2',
        titleShort: 'SL Hit',
        subtitle: 'Position Closed',
      };
    case 'BALANCE_LOW':
      return {
        iconName: 'warning',
        iconColor: '#F59E0B',
        iconBg: '#FFFBEB',
        titleShort: 'Balance Low',
        subtitle: 'Action Required',
      };
    case 'AGENT_DOWN':
      return {
        iconName: 'alert-circle',
        iconColor: '#EF4444',
        iconBg: '#FEF2F2',
        titleShort: 'Agent Offline',
        subtitle: 'Check Dashboard',
      };
    case 'DAILY_SUMMARY':
      return {
        iconName: 'bar-chart',
        iconColor: '#3B82F6',
        iconBg: '#EFF6FF',
        titleShort: 'Daily Summary',
        subtitle: "Today's P&L",
      };
    default:
      return {
        iconName: 'notifications',
        iconColor: '#64748B',
        iconBg: '#F1F5F9',
        titleShort: 'Notification',
        subtitle: '',
      };
  }
}

function getMessage(type: WsEventType, payload: EventPayload): string {
  switch (type) {
    case 'TP1_HIT':
      return `Your take profit 1 level was hit at $${formatCurrency(payload.tp1 ?? payload.price)}. Stop loss moved to entry $${formatCurrency(payload.entry ?? payload.newSl)} (break-even).`;
    case 'TP2_HIT':
      return `Take profit 2 hit at $${formatCurrency(payload.tp2 ?? payload.price)}. Trade complete — full position closed.`;
    case 'ZONE_TOUCH':
      return `Price touched the demand zone on ${payload.coin ?? '—'} at $${formatCurrency(payload.price)}. Agent is evaluating entry conditions.`;
    case 'TRADE_ENTERED':
      return `Trade entered: ${payload.coin ?? '—'} ${payload.direction ?? 'LONG'} at $${formatCurrency(payload.price)}. 200x Cross leverage, 0.5% margin. 4 orders placed.`;
    case 'SL_HIT':
      return `Stop loss triggered on ${payload.coin ?? '—'}. Body closed below structural SL level. Position fully closed.`;
    case 'BALANCE_LOW':
      return `Account balance is near the $35 minimum threshold. Current balance: $${formatCurrency(payload.balance)}. Consider depositing more funds.`;
    case 'AGENT_DOWN':
      return 'Agent has gone offline unexpectedly. Disaster SL orders on exchange will protect open positions. Check dashboard.';
    case 'DAILY_SUMMARY':
      return `${payload.n ?? 0} trades completed today. Net P&L: ${Number(payload.pnl ?? 0) >= 0 ? '+' : ''}$${formatCurrency(payload.pnl)}. Agent continues monitoring.`;
    default:
      return 'No details available.';
  }
}

function getProfitLine(type: WsEventType, payload: EventPayload): { label: string; value: string; color: string } | null {
  if (type === 'TP1_HIT') {
    return { label: 'Profit Realised (50%)', value: `+$${formatCurrency(payload.pnl ?? '42.10')}`, color: '#16A34A' };
  }
  if (type === 'TP2_HIT') {
    return { label: 'Total Profit', value: `+$${formatCurrency(payload.totalPnl ?? payload.pnl)}`, color: '#16A34A' };
  }
  if (type === 'SL_HIT') {
    return { label: 'Loss', value: `-$${formatCurrency(payload.loss)}`, color: '#EF4444' };
  }
  return null;
}

interface DetailRow {
  label: string;
  value: string;
  valueColor?: string;
}

function getActiveTradeRows(type: WsEventType, payload: EventPayload): DetailRow[] {
  if (type === 'TP1_HIT') {
    return [
      { label: 'Remaining Position', value: payload.remainingQty ?? '50% qty (TP2 pending)' },
      { label: 'New Stop Loss', value: `$${formatCurrency(payload.newSl ?? payload.entry ?? '87.20')} (break-even)`, valueColor: '#3B82F6' },
      { label: 'TP2 Target', value: `$${formatCurrency(payload.tp2 ?? '96.50')}` },
    ];
  }
  if (type === 'TRADE_ENTERED') {
    return [
      { label: 'Entry Price', value: `$${formatCurrency(payload.price)}` },
      { label: 'Direction', value: String(payload.direction ?? 'LONG') },
      { label: 'TP1', value: `$${formatCurrency(payload.tp1)}` },
      { label: 'TP2', value: `$${formatCurrency(payload.tp2)}` },
      { label: 'Stop Loss', value: `$${formatCurrency(payload.sl)}`, valueColor: '#EF4444' },
    ];
  }
  if (type === 'ZONE_TOUCH') {
    return [
      { label: 'Coin', value: String(payload.coin ?? '—') },
      { label: 'Zone Price', value: `$${formatCurrency(payload.price)}` },
      { label: 'Status', value: 'Watching' },
    ];
  }
  if (type === 'BALANCE_LOW') {
    return [
      { label: 'Current Balance', value: `$${formatCurrency(payload.balance)}` },
      { label: 'Minimum Threshold', value: '$35.00', valueColor: '#EF4444' },
    ];
  }
  return [];
}

function hasTradeLink(type: WsEventType): boolean {
  return ['TRADE_ENTERED', 'TP1_HIT', 'TP2_HIT'].includes(type);
}

function formatTimestamp(ts?: string): string {
  if (!ts) return '';
  const d = new Date(isNaN(Number(ts)) ? ts : Number(ts));
  if (isNaN(d.getTime())) return ts;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  const hours = d.getHours();
  const mins = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return `Today at ${h}:${mins} ${ampm}`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ` at ${h}:${mins} ${ampm}`;
}

export default function NotificationScreen() {
  const params = useLocalSearchParams<{ type?: string; payload?: string; timestamp?: string }>();

  // Validate the type param against known event types to prevent arbitrary type injection.
  const rawType = params.type ?? '';
  const type: WsEventType = isKnownEventType(rawType) ? rawType : 'DAILY_SUMMARY';
  const timestamp = params.timestamp;

  let payload: EventPayload = {
    coin: 'SOL',
    direction: 'LONG',
    tp1: '92.00',
    tp2: '96.50',
    sl: '84.00',
    entry: '87.20',
    newSl: '87.20',
    price: '92.00',
    pnl: '42.10',
    remainingQty: '50% qty (TP2 pending)',
  };
  try {
    if (params.payload) {
      payload = JSON.parse(params.payload) as EventPayload;
    }
  } catch {
    // keep default payload
  }

  const cfg = getEventConfig(type);
  const message = getMessage(type, payload);
  const profitLine = getProfitLine(type, payload);
  const activeTradeRows = getActiveTradeRows(type, payload);
  const showTradeLink = hasTradeLink(type);
  const formattedTime = formatTimestamp(timestamp);
  const coinLabel = payload.coin ? `${payload.coin}/USDT` : 'SOL/USDT';
  const timestampLine = formattedTime ? `${formattedTime} · ${coinLabel}` : coinLabel;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      {/* Custom header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
          <Text style={styles.headerTitle}>Notification</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero icon + title */}
        <View style={styles.heroSection}>
          <View style={[styles.iconCircle, { backgroundColor: cfg.iconBg }]}>
            <Ionicons name={cfg.iconName as keyof typeof Ionicons.glyphMap} size={40} color={cfg.iconColor} />
          </View>
          <Text style={styles.heroTitle}>{cfg.titleShort}</Text>
          <Text style={styles.heroSubtitle}>{cfg.subtitle}</Text>
        </View>

        {/* Message card */}
        <View style={styles.card}>
          <Text style={styles.messageText}>{message}</Text>
          {profitLine ? (
            <View style={styles.profitRow}>
              <Text style={styles.profitLabel}>{profitLine.label}</Text>
              <Text style={[styles.profitValue, { color: profitLine.color }]}>{profitLine.value}</Text>
            </View>
          ) : null}
        </View>

        {/* Active Trade Details */}
        {activeTradeRows.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Active Trade Details</Text>
            <View style={styles.card}>
              {activeTradeRows.map((row, i) => (
                <View key={row.label}>
                  {i > 0 ? <View style={styles.rowDivider} /> : null}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{row.label}</Text>
                    <Text style={[styles.detailValue, row.valueColor ? { color: row.valueColor } : null]}>
                      {row.value}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : null}

        {/* CTA button */}
        {showTradeLink ? (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              // Sanitize tradeId — allow only alphanumeric chars to prevent route injection.
              const rawTradeId = String(payload.tradeId ?? '1');
              const safeTradeId = rawTradeId.replace(/[^a-zA-Z0-9_-]/g, '') || '1';
              router.push({ pathname: '/trade/[id]', params: { id: safeTradeId } });
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>View Active Trade →</Text>
          </TouchableOpacity>
        ) : null}

        {/* Timestamp */}
        <Text style={styles.timestamp}>{timestampLine}</Text>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0F172A',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 28,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    overflow: 'hidden',
  },
  messageText: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 23,
    padding: 16,
  },
  profitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FAFAFA',
  },
  profitLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  profitValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
    marginLeft: 2,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#1D4ED8',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 8,
  },
  bottomPad: {
    height: 32,
  },
});
