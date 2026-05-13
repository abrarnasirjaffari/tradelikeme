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
import { Ionicons } from '@expo/vector-icons';
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

interface StatRowProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function StatRow({ label, value, highlight }: StatRowProps) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statRowLabel}>{label}</Text>
      <Text style={[styles.statRowValue, highlight && styles.statRowValueHighlight]}>
        {value}
      </Text>
    </View>
  );
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

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
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading strategy...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!strategy) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Strategy not found.</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const tierColors = TIER_COLORS[strategy.tier];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroName}>{strategy.name}</Text>
              <View style={styles.heroBadges}>
                <View style={[styles.tierBadge, { backgroundColor: tierColors.bg }]}>
                  <Text style={[styles.tierText, { color: tierColors.text }]}>
                    {strategy.tier}-Tier
                  </Text>
                </View>
                {strategy.isVerified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="shield-checkmark" size={13} color="#1D4ED8" />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                )}
              </View>
            </View>
            <View style={styles.heroRight}>
              <Text style={styles.heroWinRate}>{strategy.winRate}%</Text>
              <Text style={styles.heroWinRateLabel}>Win Rate</Text>
            </View>
          </View>
          <Text style={styles.heroTrader}>by {strategy.traderName}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Stats</Text>
          <View style={styles.statsCard}>
            <StatRow
              label="Win Rate"
              value={`${strategy.winRate}%`}
              highlight={strategy.winRate >= 80}
            />
            <View style={styles.statsDivider} />
            <StatRow
              label="Monthly Return"
              value={`+${strategy.monthlyReturn}%`}
              highlight
            />
            <View style={styles.statsDivider} />
            <StatRow label="Platform Fee" value={`${strategy.feePercent}% of profit`} />
            <View style={styles.statsDivider} />
            <StatRow label="Total Trades" value={strategy.totalTrades.toString()} />
            <View style={styles.statsDivider} />
            <StatRow label="Active Since" value={formatDate(strategy.openSince)} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rules Summary</Text>
          <View style={styles.rulesCard}>
            <Text style={styles.rulesText}>{strategy.rulesText}</Text>
          </View>
        </View>

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
                        styles.riskModeIndicator,
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
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color={mode.color}
                        style={styles.riskModeCheck}
                      />
                    )}
                  </View>
                  <Text style={styles.riskModeDesc}>{mode.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.subscribeSection}>
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
              <>
                <Ionicons
                  name={subscribed ? 'checkmark-circle' : 'flash'}
                  size={18}
                  color="#FFFFFF"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.subscribeButtonText}>
                  {subscribed ? 'Subscribed' : 'Subscribe Now'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.subscribeDisclaimer}>
            You keep 80% of all profits. {strategy.feePercent}% platform fee applies only on
            gains.
          </Text>
        </View>
      </ScrollView>
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
    color: '#64748B',
  },
  errorText: {
    fontSize: 15,
    color: '#64748B',
  },
  backButton: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  heroCard: {
    backgroundColor: '#0F172A',
    padding: 20,
    marginBottom: 0,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  heroLeft: {
    flex: 1,
    marginRight: 12,
  },
  heroName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  heroBadges: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  tierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tierText: {
    fontSize: 12,
    fontWeight: '700',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  heroRight: {
    alignItems: 'flex-end',
  },
  heroWinRate: {
    fontSize: 32,
    fontWeight: '800',
    color: '#4ADE80',
    lineHeight: 36,
  },
  heroWinRateLabel: {
    fontSize: 11,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroTrader: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginTop: 12,
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
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  statsDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 16,
  },
  statRowLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  statRowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  statRowValueHighlight: {
    color: '#16A34A',
  },
  rulesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginTop: 12,
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
  rulesText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  riskModes: {
    gap: 10,
    marginTop: 8,
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
  riskModeIndicator: {
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
    marginLeft: 4,
  },
  riskModeDesc: {
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 16,
  },
  subscribeSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  subscribeButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...Platform.select({
      ios: {
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
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
    fontSize: 16,
    fontWeight: '700',
  },
  subscribeDisclaimer: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 18,
  },
});
