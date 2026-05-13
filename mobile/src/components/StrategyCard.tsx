import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import type { Strategy, StrategyTier } from '@/types/api';

interface Props {
  strategy: Strategy;
  onPress: () => void;
}

const TIER_COLORS: Record<StrategyTier, { bg: string; text: string; label: string }> = {
  S: { bg: '#EDE9FE', text: '#7C3AED', label: 'S-TIER' },
  A: { bg: '#DBEAFE', text: '#1D4ED8', label: 'A-TIER' },
  B: { bg: '#DCFCE7', text: '#15803D', label: 'B-TIER' },
  C: { bg: '#FEF3C7', text: '#B45309', label: 'C-TIER' },
};

interface StatItemProps {
  label: string;
  value: string;
}

function StatItem({ label, value }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

export default function StrategyCard({ strategy, onPress }: Props) {
  const tierColors = TIER_COLORS[strategy.tier];
  const isOurs = strategy.isOurs ?? false;
  const feeLabel = isOurs
    ? '20% profit share'
    : `${strategy.feePercent}% profit share`;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Row 1: strategy name + verified badge */}
      <View style={styles.row1}>
        <Text style={styles.strategyName} numberOfLines={1}>
          {strategy.name}
        </Text>
        {(strategy.isVerified || isOurs) && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Verified</Text>
          </View>
        )}
      </View>

      {/* Row 2: by trader · tier badge */}
      <View style={styles.row2}>
        <Text style={styles.traderName}>by {strategy.traderName}</Text>
        <View style={[styles.tierBadge, { backgroundColor: tierColors.bg }]}>
          <Text style={[styles.tierText, { color: tierColors.text }]}>
            {tierColors.label}
          </Text>
        </View>
      </View>

      {/* Row 3: fee badge (only for our strategy / profit share) */}
      {isOurs && (
        <View style={styles.row3}>
          <View style={styles.feeBadge}>
            <Text style={styles.feeText}>{feeLabel}</Text>
          </View>
        </View>
      )}

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatItem label="Win Rate" value={`${strategy.winRate}%`} />
        <View style={styles.statDivider} />
        <StatItem label="Monthly" value={`${strategy.monthlyReturn}%`} />
        <View style={styles.statDivider} />
        <StatItem label="Trades" value={strategy.totalTrades.toString()} />
      </View>

      {/* Subscribe button */}
      {isOurs ? (
        <TouchableOpacity style={styles.subscribeBtnFilled} onPress={onPress} activeOpacity={0.85}>
          <Text style={styles.subscribeBtnFilledText}>Subscribe →</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.subscribeBtnOutline} onPress={onPress} activeOpacity={0.85}>
          <Text style={styles.subscribeBtnOutlineText}>Subscribe →</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  row1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  strategyName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  verifiedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  row2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  traderName: {
    fontSize: 12,
    color: '#64748B',
  },
  tierBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
  },
  tierText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  row3: {
    marginBottom: 12,
  },
  feeBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  feeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
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
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  subscribeBtnFilled: {
    backgroundColor: '#1D4ED8',
    borderRadius: 10,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribeBtnFilledText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  subscribeBtnOutline: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#1D4ED8',
  },
  subscribeBtnOutlineText: {
    color: '#1D4ED8',
    fontSize: 15,
    fontWeight: '700',
  },
});
