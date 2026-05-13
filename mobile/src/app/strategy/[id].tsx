import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getStrategy, subscribe } from '@/api/strategies';
import type { Strategy, StrategyTier, RiskMode } from '@/types/api';

const TIER_COLORS: Record<StrategyTier, { bg: string; text: string }> = {
  S: { bg: '#EDE9FE', text: '#7C3AED' },
  A: { bg: '#DBEAFE', text: '#1D4ED8' },
  B: { bg: '#DCFCE7', text: '#15803D' },
  C: { bg: '#FEF3C7', text: '#B45309' },
};

const RISK_MODES: { value: RiskMode; label: string; desc: string; color: string }[] = [
  {
    value: 'conservative',
    label: 'Conservative',
    desc: '50–100x leverage · 0.25%–0.5% margin · 20+ trade buffer',
    color: '#16A34A',
  },
  {
    value: 'medium',
    label: 'Medium',
    desc: '50–200x leverage · 0.5%–1% margin · 8–10 trade buffer',
    color: '#2563EB',
  },
  {
    value: 'aggressive',
    label: 'Aggressive',
    desc: '50–300x leverage · 1%–2% margin · 4–5 trade buffer',
    color: '#DC2626',
  },
];

const RISK_PARAMS = [
  { label: 'Leverage', value: '200x Cross' },
  { label: 'Margin per trade', value: '0.5%' },
  { label: 'Max concurrent', value: '2 positions' },
  { label: 'Stop Loss', value: 'Structural (body-close)' },
  { label: 'Timeframes', value: '7 TFs (1M → 15M)' },
];

const RECENT_TRADES = [
  { label: 'SOL LONG · Apr 14', pnl: '+$42.10', positive: true },
  { label: 'BTC LONG · Apr 18', pnl: '+$88.20', positive: true },
  { label: 'XRP SHORT · Apr 16', pnl: '-$0.96', positive: false },
];

export default function StrategyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRisk, setSelectedRisk] = useState<RiskMode>('medium');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (!id) return;
    getStrategy(id)
      .then(setStrategy)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubscribe = useCallback(async () => {
    if (!strategy || subscribing || subscribed) return;
    setSubscribing(true);
    try {
      await subscribe(strategy.id, selectedRisk);
      setSubscribed(true);
      Alert.alert(
        'Subscribed!',
        `You are now subscribed to ${strategy.name} in ${selectedRisk} mode.`,
        [{ text: 'OK' }]
      );
    } catch {
      Alert.alert('Error', 'Failed to subscribe. Please try again.');
    } finally {
      setSubscribing(false);
    }
  }, [strategy, selectedRisk, subscribing, subscribed]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1D4ED8" />
          <Text style={styles.loadingText}>Loading strategy...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!strategy) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Strategy not found.</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.goBackButton}>
            <Text style={styles.goBackButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const tierColors = TIER_COLORS[strategy.tier];
  const tierLabel = `${strategy.tier}-TIER`;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header nav */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.navTitle}>Strategy Detail</Text>
        </TouchableOpacity>
        {strategy.isVerified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Verified</Text>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Blue hero card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroName}>{strategy.name}</Text>
          <Text style={styles.heroSub}>
            by {strategy.traderName} · {tierLabel}
          </Text>
          <View style={styles.heroStats}>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatLabel}>Win Rate</Text>
              <Text style={styles.heroStatValue}>{strategy.winRate}%</Text>
            </View>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatLabel}>Monthly</Text>
              <Text style={styles.heroStatValue}>{strategy.monthlyReturn}%</Text>
            </View>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatLabel}>Trades</Text>
              <Text style={styles.heroStatValue}>{strategy.totalTrades}</Text>
            </View>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatLabel}>Profit</Text>
              <Text style={styles.heroStatValue}>$2.8k</Text>
            </View>
          </View>
        </View>

        {/* Performance section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance</Text>
          <View style={styles.card}>
            <View style={styles.equityPlaceholder}>
              <Text style={styles.equityPlaceholderText}>↑ Equity Curve (coming soon)</Text>
            </View>
          </View>
        </View>

        {/* Risk Parameters section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risk Parameters</Text>
          <View style={styles.card}>
            {RISK_PARAMS.map((param, index) => (
              <React.Fragment key={param.label}>
                <View style={styles.paramRow}>
                  <Text style={styles.paramLabel}>{param.label}</Text>
                  <Text style={styles.paramValue}>{param.value}</Text>
                </View>
                {index < RISK_PARAMS.length - 1 && <View style={styles.rowDivider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Select Risk Mode */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Risk Mode</Text>
          <Text style={styles.sectionSubtitle}>
            Your risk tolerance determines leverage and position sizing.
          </Text>
          <View style={styles.riskModes}>
            {RISK_MODES.map((mode) => {
              const isSelected = selectedRisk === mode.value;
              return (
                <TouchableOpacity
                  key={mode.value}
                  style={[
                    styles.riskModeCard,
                    isSelected && {
                      borderColor: mode.color,
                      backgroundColor: '#FAFAFA',
                    },
                  ]}
                  onPress={() => setSelectedRisk(mode.value)}
                  activeOpacity={0.8}
                >
                  <View style={styles.riskModeHeader}>
                    <View
                      style={[
                        styles.riskModeDot,
                        { backgroundColor: isSelected ? mode.color : '#E2E8F0' },
                      ]}
                    />
                    <Text
                      style={[
                        styles.riskModeLabel,
                        isSelected && { color: mode.color },
                      ]}
                    >
                      {mode.label}
                    </Text>
                    {isSelected && (
                      <Text style={[styles.riskModeCheck, { color: mode.color }]}>✓</Text>
                    )}
                  </View>
                  <Text style={styles.riskModeDesc}>{mode.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Recent Trades */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Trades</Text>
          <View style={styles.card}>
            {RECENT_TRADES.map((trade, index) => (
              <React.Fragment key={trade.label}>
                <View style={styles.tradeRow}>
                  <Text style={styles.tradeLabel}>{trade.label}</Text>
                  <Text style={[styles.tradePnl, trade.positive ? styles.pnlPositive : styles.pnlNegative]}>
                    {trade.pnl}
                  </Text>
                </View>
                {index < RECENT_TRADES.length - 1 && <View style={styles.rowDivider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Bottom spacing for fixed button */}
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Fixed subscribe button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.subscribeButton,
            (subscribing || subscribed) && styles.subscribeButtonDisabled,
          ]}
          onPress={handleSubscribe}
          disabled={subscribing || subscribed}
          activeOpacity={0.85}
        >
          {subscribing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.subscribeButtonText}>
              {subscribed ? 'Subscribed ✓' : `Subscribe · ${strategy.feePercent}% Profit Share`}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
  },
  errorText: {
    fontSize: 15,
    color: '#64748B',
  },
  goBackButton: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#1D4ED8',
    borderRadius: 8,
  },
  goBackButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  // Nav bar
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backArrow: {
    fontSize: 18,
    color: '#0F172A',
    lineHeight: 22,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  verifiedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A34A',
  },
  // Hero card
  heroCard: {
    backgroundColor: '#1D4ED8',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#1D4ED8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: { elevation: 5 },
    }),
  },
  heroName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
  },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroStatItem: {
    alignItems: 'center',
  },
  heroStatLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
  },
  heroStatValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Sections
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
    marginTop: -4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
    }),
  },
  // Equity placeholder
  equityPlaceholder: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  equityPlaceholderText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  // Risk params
  paramRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  paramLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  paramValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 16,
  },
  // Risk modes
  riskModes: {
    gap: 10,
  },
  riskModeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  riskModeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  riskModeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  riskModeLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  riskModeCheck: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 4,
  },
  riskModeDesc: {
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 16,
  },
  // Recent trades
  tradeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  tradeLabel: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
  },
  tradePnl: {
    fontSize: 14,
    fontWeight: '700',
  },
  pnlPositive: {
    color: '#16A34A',
  },
  pnlNegative: {
    color: '#DC2626',
  },
  // Bottom bar
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  subscribeButton: {
    backgroundColor: '#1D4ED8',
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#1D4ED8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.28,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  subscribeButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
