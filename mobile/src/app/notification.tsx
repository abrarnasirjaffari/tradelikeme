import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
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

interface EventPayload {
  coin?: string;
  price?: number | string;
  direction?: string;
  pnl?: number | string;
  totalPnl?: number | string;
  loss?: number | string;
  balance?: number | string;
  n?: number | string;
  [key: string]: unknown;
}

function formatCurrency(val?: number | string): string {
  if (val === undefined || val === null || val === '') return '—';
  const n = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(n)) return String(val);
  return n.toFixed(2);
}

function getEventIcon(type: WsEventType): { name: string; color: string; bg: string } {
  switch (type) {
    case 'ZONE_TOUCH':
      return { name: 'locate-outline', color: '#3B82F6', bg: '#EFF6FF' };
    case 'TRADE_ENTERED':
      return { name: 'arrow-forward-circle-outline', color: '#8B5CF6', bg: '#F5F3FF' };
    case 'TP1_HIT':
      return { name: 'checkmark-circle-outline', color: '#10B981', bg: '#ECFDF5' };
    case 'TP2_HIT':
      return { name: 'trophy-outline', color: '#10B981', bg: '#ECFDF5' };
    case 'SL_HIT':
      return { name: 'close-circle-outline', color: '#EF4444', bg: '#FEF2F2' };
    case 'BALANCE_LOW':
      return { name: 'warning-outline', color: '#F59E0B', bg: '#FFFBEB' };
    case 'AGENT_DOWN':
      return { name: 'alert-circle-outline', color: '#EF4444', bg: '#FEF2F2' };
    case 'DAILY_SUMMARY':
      return { name: 'bar-chart-outline', color: '#3B82F6', bg: '#EFF6FF' };
    default:
      return { name: 'notifications-outline', color: '#64748B', bg: '#F1F5F9' };
  }
}

function getTitle(type: WsEventType): string {
  switch (type) {
    case 'ZONE_TOUCH': return 'Zone Touched';
    case 'TRADE_ENTERED': return 'Trade Entered';
    case 'TP1_HIT': return 'Take Profit 1 Hit';
    case 'TP2_HIT': return 'Take Profit 2 Hit';
    case 'SL_HIT': return 'Stop Loss Hit';
    case 'BALANCE_LOW': return 'Balance Low';
    case 'AGENT_DOWN': return 'Agent Offline';
    case 'DAILY_SUMMARY': return 'Daily Summary';
    default: return 'Notification';
  }
}

function getMessage(type: WsEventType, payload: EventPayload): string {
  switch (type) {
    case 'ZONE_TOUCH':
      return `Zone touched on ${payload.coin ?? '—'} at $${formatCurrency(payload.price)}`;
    case 'TRADE_ENTERED':
      return `Trade entered: ${payload.coin ?? '—'} ${payload.direction ?? ''} at $${formatCurrency(payload.price)}`;
    case 'TP1_HIT':
      return `TP1 hit on ${payload.coin ?? '—'}! +$${formatCurrency(payload.pnl)}`;
    case 'TP2_HIT':
      return `Trade complete on ${payload.coin ?? '—'}! +$${formatCurrency(payload.totalPnl)}`;
    case 'SL_HIT':
      return `Stop loss hit on ${payload.coin ?? '—'}. -$${formatCurrency(payload.loss)}`;
    case 'BALANCE_LOW':
      return `Balance low: $${formatCurrency(payload.balance)} remaining`;
    case 'AGENT_DOWN':
      return 'Agent offline — check dashboard';
    case 'DAILY_SUMMARY':
      return `${payload.n ?? 0} trades today. P&L: $${formatCurrency(payload.pnl)}`;
    default:
      return 'No details available';
  }
}

function hasTradeLink(type: WsEventType): boolean {
  return ['TRADE_ENTERED', 'TP1_HIT', 'TP2_HIT', 'SL_HIT'].includes(type);
}

function formatTimestamp(ts?: string): string {
  if (!ts) return '';
  const d = new Date(isNaN(Number(ts)) ? ts : Number(ts));
  if (isNaN(d.getTime())) return ts;
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getDetailRows(type: WsEventType, payload: EventPayload): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [];
  if (payload.coin) rows.push({ label: 'Coin', value: String(payload.coin) });
  if (payload.direction) rows.push({ label: 'Direction', value: String(payload.direction).toUpperCase() });
  if (payload.price !== undefined) rows.push({ label: 'Price', value: `$${formatCurrency(payload.price)}` });
  if (payload.pnl !== undefined && (type === 'TP1_HIT' || type === 'DAILY_SUMMARY')) {
    rows.push({ label: 'P&L', value: `$${formatCurrency(payload.pnl)}` });
  }
  if (payload.totalPnl !== undefined && type === 'TP2_HIT') {
    rows.push({ label: 'Total P&L', value: `$${formatCurrency(payload.totalPnl)}` });
  }
  if (payload.loss !== undefined && type === 'SL_HIT') {
    rows.push({ label: 'Loss', value: `-$${formatCurrency(payload.loss)}` });
  }
  if (payload.balance !== undefined && type === 'BALANCE_LOW') {
    rows.push({ label: 'Balance', value: `$${formatCurrency(payload.balance)}` });
  }
  if (payload.n !== undefined && type === 'DAILY_SUMMARY') {
    rows.push({ label: 'Trades', value: String(payload.n) });
  }
  return rows;
}

export default function NotificationScreen() {
  const params = useLocalSearchParams<{ type?: string; payload?: string; timestamp?: string }>();

  const type = (params.type ?? 'ZONE_TOUCH') as WsEventType;
  const timestamp = params.timestamp;

  let payload: EventPayload = {};
  try {
    if (params.payload) {
      payload = JSON.parse(params.payload) as EventPayload;
    }
  } catch {
    // keep empty payload
  }

  const icon = getEventIcon(type);
  const title = getTitle(type);
  const message = getMessage(type, payload);
  const showTradeLink = hasTradeLink(type);
  const detailRows = getDetailRows(type, payload);
  const formattedTime = formatTimestamp(timestamp);

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Icon + Title */}
        <View style={styles.heroSection}>
          <View style={[styles.iconCircle, { backgroundColor: icon.bg }]}>
            <Ionicons name={icon.name as keyof typeof Ionicons.glyphMap} size={36} color={icon.color} />
          </View>
          <Text style={styles.heroTitle}>{title}</Text>
          {formattedTime ? (
            <Text style={styles.heroTimestamp}>{formattedTime}</Text>
          ) : null}
        </View>

        {/* Message card */}
        <View style={styles.card}>
          <Text style={styles.messageText}>{message}</Text>
        </View>

        {/* Detail rows */}
        {detailRows.length > 0 ? (
          <View style={styles.card}>
            {detailRows.map((row, i) => (
              <View key={row.label}>
                {i > 0 ? <View style={styles.rowDivider} /> : null}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{row.label}</Text>
                  <Text style={styles.detailValue}>{row.value}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {/* CTA buttons */}
        <View style={styles.buttonGroup}>
          {showTradeLink ? (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/(tabs)/trades')}
              activeOpacity={0.8}
            >
              <Ionicons name="trending-up-outline" size={18} color="#FFFFFF" style={styles.btnIcon} />
              <Text style={styles.primaryButtonText}>View Trade</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={[styles.secondaryButton, showTradeLink ? styles.secondaryButtonMargin : null]}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back-outline" size={18} color="#3B82F6" style={styles.btnIcon} />
            <Text style={styles.secondaryButtonText}>Back</Text>
          </TouchableOpacity>
        </View>

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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
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
  heroTimestamp: {
    fontSize: 13,
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
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
    padding: 16,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  buttonGroup: {
    marginTop: 4,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#3B82F6',
  },
  secondaryButtonMargin: {
    marginTop: 0,
  },
  btnIcon: {
    marginRight: 6,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  bottomPad: {
    height: 32,
  },
});
