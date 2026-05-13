import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Strategy, StrategyTier } from '@/types/api';

interface Props {
  strategy: Strategy;
  onPress: () => void;
}

const TIER_COLORS: Record<StrategyTier, { bg: string; text: string }> = {
  S: { bg: '#EDE9FE', text: '#7C3AED' },
  A: { bg: '#DBEAFE', text: '#1D4ED8' },
  B: { bg: '#DCFCE7', text: '#15803D' },
  C: { bg: '#FEF3C7', text: '#B45309' },
};

function TierBadge({ tier }: { tier: StrategyTier }) {
  const colors = TIER_COLORS[tier];
  return (
    <View style={[styles.tierBadge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.tierText, { color: colors.text }]}>{tier}-Tier</Text>
    </View>
  );
}

function VerifiedBadge() {
  return (
    <View style={styles.verifiedBadge}>
      <Ionicons name="shield-checkmark" size={12} color="#1D4ED8" />
      <Text style={styles.verifiedText}>Verified</Text>
    </View>
  );
}

interface StatItemProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function StatItem({ label, value, highlight }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, highlight && styles.statValueHighlight]}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function StrategyCard({ strategy, onPress }: Props) {
  const isSubscribed = false;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.strategyName} numberOfLines={1}>
            {strategy.name}
          </Text>
          <View style={styles.badgeRow}>
            <TierBadge tier={strategy.tier} />
            {strategy.isVerified && <VerifiedBadge />}
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.traderLabel}>by</Text>
          <Text style={styles.traderName} numberOfLines={1}>
            {strategy.traderName}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        <StatItem
          label="Win Rate"
          value={`${strategy.winRate}%`}
          highlight={strategy.winRate >= 80}
        />
        <View style={styles.statDivider} />
        <StatItem
          label="Monthly Return"
          value={`+${strategy.monthlyReturn}%`}
          highlight
        />
        <View style={styles.statDivider} />
        <StatItem
          label="Fee"
          value={`${strategy.feePercent}%`}
        />
      </View>

      <View style={styles.divider} />

      <Text style={styles.description} numberOfLines={2}>
        {strategy.description}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.tradesText}>
          {strategy.totalTrades} verified trades
        </Text>
        <View style={styles.actionRow}>
          <Text style={[styles.actionText, isSubscribed && styles.actionTextView]}>
            {isSubscribed ? 'View' : 'Subscribe'}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={14}
            color={isSubscribed ? '#64748B' : '#3B82F6'}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    marginRight: 8,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  strategyName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  tierText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  traderLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 1,
  },
  traderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    maxWidth: 100,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E2E8F0',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  statValueHighlight: {
    color: '#16A34A',
  },
  statLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  description: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tradesText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3B82F6',
  },
  actionTextView: {
    color: '#64748B',
  },
});
