import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface MockTradeData {
  symbol: string;
  direction: 'LONG' | 'SHORT';
  leverage: string;
  unrealisedPnl: string;
  pnlPercent: string;
  entryPrice: string;
  currentPrice: string;
  tp1: string;
  tp1Qty: string;
  tp2: string;
  tp2Qty: string;
  sl: string;
  slType: string;
  positionSize: string;
  margin: string;
}

const MOCK_TRADES: Record<string, MockTradeData> = {
  '1': {
    symbol: 'SOL/USDT',
    direction: 'LONG',
    leverage: '200x Cross',
    unrealisedPnl: '+$42.10',
    pnlPercent: '+4.87%',
    entryPrice: '$87.20',
    currentPrice: '$91.45',
    tp1: '$92.00',
    tp1Qty: '50% qty',
    tp2: '$96.50',
    tp2Qty: '50% qty',
    sl: '$84.00',
    slType: 'structural',
    positionSize: '10 SOL',
    margin: '$0.48 margin',
  },
  '2': {
    symbol: 'BTC/USDT',
    direction: 'LONG',
    leverage: '200x Cross',
    unrealisedPnl: '+$18.30',
    pnlPercent: '+2.10%',
    entryPrice: '$66,100',
    currentPrice: '$67,490',
    tp1: '$68,200',
    tp1Qty: '50% qty',
    tp2: '$71,000',
    tp2Qty: '50% qty',
    sl: '$63,800',
    slType: 'structural',
    positionSize: '0.01 BTC',
    margin: '$0.33 margin',
  },
};

function getDefaultTrade(): MockTradeData {
  return MOCK_TRADES['1'];
}

interface DetailRowProps {
  label: string;
  value: string;
  valueColor?: string;
  valueBold?: boolean;
}

function DetailRow({ label, value, valueColor, valueBold }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text
        style={[
          styles.detailValue,
          valueColor ? { color: valueColor } : null,
          valueBold ? styles.detailValueBold : null,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

interface OrderRowProps {
  type: string;
  description: string;
  status: string;
  statusColor: string;
  statusBg: string;
}

function OrderRow({ type, description, status, statusColor, statusBg }: OrderRowProps) {
  return (
    <View style={styles.orderRow}>
      <View style={styles.orderLeft}>
        <Text style={styles.orderType}>{type}</Text>
        <Text style={styles.orderDesc}>{description}</Text>
      </View>
      <View style={[styles.orderStatusBadge, { backgroundColor: statusBg }]}>
        <Text style={[styles.orderStatusText, { color: statusColor }]}>{status}</Text>
      </View>
    </View>
  );
}

export default function LiveTradeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const trade = MOCK_TRADES[id ?? '1'] ?? getDefaultTrade();

  const isLong = trade.direction === 'LONG';
  const isPositive = trade.unrealisedPnl.startsWith('+');

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      {/* Custom header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
          <Text style={styles.headerSymbol}>{trade.symbol}</Text>
        </TouchableOpacity>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* P&L Hero Card */}
        <View style={[styles.heroCard, isPositive ? styles.heroCardGreen : styles.heroCardRed]}>
          <Text style={styles.heroLabel}>Unrealised P&L</Text>
          <Text style={[styles.heroPnl, isPositive ? styles.heroPnlGreen : styles.heroPnlRed]}>
            {trade.unrealisedPnl}
          </Text>
          <View style={styles.heroMeta}>
            <Text style={styles.heroMetaText}>{trade.pnlPercent}</Text>
            <View style={styles.heroMetaDot} />
            <View style={[styles.directionBadge, isLong ? styles.longBadge : styles.shortBadge]}>
              <Text style={styles.directionText}>{trade.direction}</Text>
            </View>
            <View style={styles.heroMetaDot} />
            <Text style={styles.heroMetaText}>{trade.leverage}</Text>
          </View>
        </View>

        {/* Mini chart placeholder */}
        <View style={styles.chartPlaceholder}>
          <Ionicons name="stats-chart-outline" size={28} color="#CBD5E1" />
          <Text style={styles.chartPlaceholderText}>Mini chart area</Text>
          <Text style={styles.chartPlaceholderSub}>Live chart coming soon</Text>
        </View>

        {/* Trade Details */}
        <Text style={styles.sectionTitle}>Trade Details</Text>
        <View style={styles.card}>
          <DetailRow label="Entry Price" value={trade.entryPrice} />
          <View style={styles.rowDivider} />
          <DetailRow label="Current Price" value={trade.currentPrice} valueBold />
          <View style={styles.rowDivider} />
          <DetailRow
            label={`TP1 (${trade.tp1Qty})`}
            value={trade.tp1}
            valueColor="#16A34A"
          />
          <View style={styles.rowDivider} />
          <DetailRow
            label={`TP2 (${trade.tp2Qty})`}
            value={trade.tp2}
            valueColor="#16A34A"
          />
          <View style={styles.rowDivider} />
          <DetailRow
            label={`Stop Loss (${trade.slType})`}
            value={trade.sl}
            valueColor="#EF4444"
          />
          <View style={styles.rowDivider} />
          <DetailRow
            label="Position Size"
            value={`${trade.positionSize} (${trade.margin})`}
          />
        </View>

        {/* Order History */}
        <Text style={styles.sectionTitle}>Order History</Text>
        <View style={styles.card}>
          <OrderRow
            type="Market Buy"
            description={`Filled at ${trade.entryPrice}`}
            status="Filled"
            statusColor="#16A34A"
            statusBg="#DCFCE7"
          />
          <View style={styles.rowDivider} />
          <OrderRow
            type="Take Profit 1"
            description={`Trigger at ${trade.tp1}`}
            status="Pending"
            statusColor="#B45309"
            statusBg="#FEF3C7"
          />
          <View style={styles.rowDivider} />
          <OrderRow
            type="Take Profit 2"
            description={`Trigger at ${trade.tp2}`}
            status="Pending"
            statusColor="#B45309"
            statusBg="#FEF3C7"
          />
          <View style={styles.rowDivider} />
          <OrderRow
            type="Stop Loss (disaster)"
            description={`Trigger at ${trade.sl}`}
            status="Insurance"
            statusColor="#64748B"
            statusBg="#F1F5F9"
          />
        </View>

        {/* Info note */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={15} color="#3B82F6" style={{ marginRight: 6 }} />
          <Text style={styles.infoText}>
            Body-close SL active. Wicks past stop loss level are ignored — only a 30m candle BODY close triggers exit.
          </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  headerSymbol: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
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
    fontWeight: '800',
    color: '#16A34A',
    letterSpacing: 0.5,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  heroCard: {
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
  },
  heroCardGreen: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  heroCardRed: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  heroLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroPnl: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 8,
  },
  heroPnlGreen: {
    color: '#16A34A',
  },
  heroPnlRed: {
    color: '#EF4444',
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroMetaText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  heroMetaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#CBD5E1',
  },
  directionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  longBadge: {
    backgroundColor: '#DBEAFE',
  },
  shortBadge: {
    backgroundColor: '#FEF3C7',
  },
  directionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
    letterSpacing: 0.3,
  },
  chartPlaceholder: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    gap: 4,
  },
  chartPlaceholderText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  chartPlaceholderSub: {
    fontSize: 11,
    color: '#CBD5E1',
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    overflow: 'hidden',
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
    color: '#0F172A',
    fontWeight: '500',
  },
  detailValueBold: {
    fontWeight: '700',
    fontSize: 15,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  orderLeft: {
    flex: 1,
    marginRight: 12,
  },
  orderType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  orderDesc: {
    fontSize: 12,
    color: '#94A3B8',
  },
  orderStatusBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexShrink: 0,
  },
  orderStatusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#1D4ED8',
    flex: 1,
    lineHeight: 18,
  },
  bottomPad: {
    height: 32,
  },
});
