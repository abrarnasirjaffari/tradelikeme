import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface NotificationItem {
  id: string;
  type: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  valueText: string;
  valueColor: string;
  badgeText?: string;
  badgeColor?: string;
  badgeBg?: string;
  unread: boolean;
  timestamp: string;
  payload: Record<string, unknown>;
}

const KNOWN_EVENT_TYPES = new Set([
  'ZONE_TOUCH',
  'TRADE_ENTERED',
  'TP1_HIT',
  'TP2_HIT',
  'SL_HIT',
  'BALANCE_LOW',
  'AGENT_DOWN',
  'DAILY_SUMMARY',
]);

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    type: 'TP1_HIT',
    iconName: 'checkmark-circle',
    iconColor: '#16A34A',
    iconBg: '#DCFCE7',
    title: 'TP1 Hit — SOL LONG',
    subtitle: 'SL moved to break-even · 2 min ago',
    valueText: '+$42.10',
    valueColor: '#16A34A',
    unread: true,
    timestamp: String(Date.now() - 2 * 60 * 1000),
    payload: { coin: 'SOL', direction: 'LONG', pnl: '42.10', tp1: '92.00', tp2: '96.50', entry: '87.20', newSl: '87.20', price: '92.00', tradeId: '1' },
  },
  {
    id: '2',
    type: 'ZONE_TOUCH',
    iconName: 'radio-button-on',
    iconColor: '#3B82F6',
    iconBg: '#EFF6FF',
    title: 'Zone Touch — BTC',
    subtitle: 'Demand zone at $66,100 · 15 min ago',
    valueText: 'Watching',
    valueColor: '#F59E0B',
    badgeText: 'Watching',
    badgeColor: '#B45309',
    badgeBg: '#FEF3C7',
    unread: true,
    timestamp: String(Date.now() - 15 * 60 * 1000),
    payload: { coin: 'BTC', price: '66100' },
  },
  {
    id: '3',
    type: 'TRADE_ENTERED',
    iconName: 'enter',
    iconColor: '#3B82F6',
    iconBg: '#EFF6FF',
    title: 'Trade Entered — BTC LONG',
    subtitle: 'Entry $66,100 · 200x Cross · 20 min ago',
    valueText: 'Active',
    valueColor: '#1D4ED8',
    badgeText: 'Active',
    badgeColor: '#1D4ED8',
    badgeBg: '#DBEAFE',
    unread: true,
    timestamp: String(Date.now() - 20 * 60 * 1000),
    payload: { coin: 'BTC', direction: 'LONG', price: '66100', tradeId: '2' },
  },
  {
    id: '4',
    type: 'SL_HIT',
    iconName: 'close-circle',
    iconColor: '#EF4444',
    iconBg: '#FEF2F2',
    title: 'SL Hit — XRP SHORT',
    subtitle: 'Body close below SL · Yesterday',
    valueText: '-$0.96',
    valueColor: '#EF4444',
    unread: false,
    timestamp: String(Date.now() - 26 * 60 * 60 * 1000),
    payload: { coin: 'XRP', direction: 'SHORT', loss: '0.96' },
  },
  {
    id: '5',
    type: 'TP2_HIT',
    iconName: 'checkmark-circle',
    iconColor: '#16A34A',
    iconBg: '#DCFCE7',
    title: 'TP2 Hit — AAVE LONG',
    subtitle: 'Trade complete · 2 days ago',
    valueText: '+$130.40',
    valueColor: '#16A34A',
    unread: false,
    timestamp: String(Date.now() - 2 * 24 * 60 * 60 * 1000),
    payload: { coin: 'AAVE', direction: 'LONG', totalPnl: '130.40' },
  },
  {
    id: '6',
    type: 'BALANCE_LOW',
    iconName: 'warning',
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB',
    title: 'Balance Low Warning',
    subtitle: 'Balance near $35 minimum · 3 days ago',
    valueText: '$40.65',
    valueColor: '#F59E0B',
    unread: false,
    timestamp: String(Date.now() - 3 * 24 * 60 * 60 * 1000),
    payload: { balance: '40.65' },
  },
];

const unreadCount = MOCK_NOTIFICATIONS.filter((n) => n.unread).length;

interface NotifRowProps {
  item: NotificationItem;
  isLast: boolean;
}

function NotifRow({ item, isLast }: NotifRowProps) {
  const handlePress = () => {
    // Validate type against known event types before navigating to prevent
    // arbitrary type injection if this list is ever populated from an API.
    const safeType = KNOWN_EVENT_TYPES.has(item.type) ? item.type : 'DAILY_SUMMARY';
    router.push({
      pathname: '/notification',
      params: {
        type: safeType,
        payload: JSON.stringify(item.payload),
        timestamp: item.timestamp,
      },
    });
  };

  return (
    <>
      <TouchableOpacity style={styles.notifRow} onPress={handlePress} activeOpacity={0.7}>
        {/* Icon */}
        <View style={[styles.notifIcon, { backgroundColor: item.iconBg }]}>
          <Ionicons name={item.iconName} size={18} color={item.iconColor} />
        </View>

        {/* Text block */}
        <View style={styles.notifText}>
          <Text style={styles.notifTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.notifSubtitle} numberOfLines={1}>{item.subtitle}</Text>
        </View>

        {/* Right: value or badge + unread dot */}
        <View style={styles.notifRight}>
          {item.badgeText ? (
            <View style={[styles.badge, { backgroundColor: item.badgeBg ?? '#F1F5F9' }]}>
              <Text style={[styles.badgeText, { color: item.badgeColor ?? '#64748B' }]}>
                {item.badgeText}
              </Text>
            </View>
          ) : (
            <Text style={[styles.notifValue, { color: item.valueColor }]}>{item.valueText}</Text>
          )}
          {item.unread ? <View style={styles.unreadDot} /> : <View style={styles.unreadDotPlaceholder} />}
        </View>
      </TouchableOpacity>
      {!isLast && <View style={styles.rowDivider} />}
    </>
  );
}

export default function NotificationsScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>{unreadCount} new</Text>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.listCard}>
          {MOCK_NOTIFICATIONS.map((item, index) => (
            <NotifRow
              key={item.id}
              item={item}
              isLast={index === MOCK_NOTIFICATIONS.length - 1}
            />
          ))}
        </View>

        <Text style={styles.footerNote}>Showing last 30 days of activity</Text>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  newBadge: {
    backgroundColor: '#DBEAFE',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  newBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  notifIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  notifText: {
    flex: 1,
    marginRight: 10,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  notifSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
  },
  notifRight: {
    alignItems: 'flex-end',
    gap: 4,
    flexShrink: 0,
  },
  notifValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  badge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    alignSelf: 'flex-end',
  },
  unreadDotPlaceholder: {
    width: 8,
    height: 8,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 16,
  },
  footerNote: {
    fontSize: 12,
    color: '#CBD5E1',
    textAlign: 'center',
    marginTop: 16,
  },
  bottomPad: {
    height: 32,
  },
});
