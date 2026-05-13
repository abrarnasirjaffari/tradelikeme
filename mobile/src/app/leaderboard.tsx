import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type TabKey = 'winRate' | 'monthly' | 'subscribers';

interface LeaderboardEntry {
  id: string;
  rank: number;
  strategyName: string;
  traderName: string;
  subscribers: number;
  winRate: number;
  monthlyReturn: number;
  tier: string;
}

const BASE_DATA: LeaderboardEntry[] = [
  {
    id: '1',
    rank: 1,
    strategyName: 'S/D Zone Strategy',
    traderName: 'TradeLikeMe',
    subscribers: 142,
    winRate: 89,
    monthlyReturn: 8.0,
    tier: 'S',
  },
  {
    id: '2',
    rank: 2,
    strategyName: 'Momentum Breakout',
    traderName: 'AlphaTrader',
    subscribers: 87,
    winRate: 78,
    monthlyReturn: 6.2,
    tier: 'A',
  },
  {
    id: '3',
    rank: 3,
    strategyName: 'Scalp King',
    traderName: 'CryptoNinja',
    subscribers: 54,
    winRate: 74,
    monthlyReturn: 5.8,
    tier: 'A',
  },
  {
    id: '4',
    rank: 4,
    strategyName: 'Trend Rider',
    traderName: 'SwingMaster',
    subscribers: 31,
    winRate: 71,
    monthlyReturn: 4.5,
    tier: 'B',
  },
  {
    id: '5',
    rank: 5,
    strategyName: 'FVG Hunter',
    traderName: 'ZoneTrader',
    subscribers: 18,
    winRate: 68,
    monthlyReturn: 3.9,
    tier: 'B',
  },
];

function getSortedData(tab: TabKey): LeaderboardEntry[] {
  const data = [...BASE_DATA];
  switch (tab) {
    case 'winRate':
      return data.sort((a, b) => b.winRate - a.winRate).map((d, i) => ({ ...d, rank: i + 1 }));
    case 'monthly':
      return data.sort((a, b) => b.monthlyReturn - a.monthlyReturn).map((d, i) => ({ ...d, rank: i + 1 }));
    case 'subscribers':
      return data.sort((a, b) => b.subscribers - a.subscribers).map((d, i) => ({ ...d, rank: i + 1 }));
    default:
      return data;
  }
}

function getRankStyle(rank: number): { color: string; size: number } {
  switch (rank) {
    case 1:
      return { color: '#F59E0B', size: 18 };
    case 2:
      return { color: '#94A3B8', size: 17 };
    case 3:
      return { color: '#D97706', size: 17 };
    default:
      return { color: '#CBD5E1', size: 15 };
  }
}

const TIER_COLORS: Record<string, { bg: string; text: string }> = {
  S: { bg: '#EDE9FE', text: '#7C3AED' },
  A: { bg: '#DBEAFE', text: '#1D4ED8' },
  B: { bg: '#DCFCE7', text: '#15803D' },
  C: { bg: '#FEF3C7', text: '#B45309' },
};

interface LeaderRowProps {
  entry: LeaderboardEntry;
  isLast: boolean;
  activeTab: TabKey;
}

function LeaderRow({ entry, isLast, activeTab }: LeaderRowProps) {
  const rankStyle = getRankStyle(entry.rank);
  const tierColors = TIER_COLORS[entry.tier] ?? TIER_COLORS['B'];

  return (
    <>
      <View style={styles.leaderRow}>
        {/* Rank */}
        <Text style={[styles.rankNumber, { color: rankStyle.color, fontSize: rankStyle.size }]}>
          {entry.rank}
        </Text>

        {/* Center: strategy name + trader info */}
        <View style={styles.leaderCenter}>
          <View style={styles.leaderNameRow}>
            <Text style={styles.strategyName} numberOfLines={1}>{entry.strategyName}</Text>
            <View style={[styles.tierBadge, { backgroundColor: tierColors.bg }]}>
              <Text style={[styles.tierText, { color: tierColors.text }]}>{entry.tier}</Text>
            </View>
          </View>
          <Text style={styles.traderMeta}>
            by {entry.traderName} · {entry.subscribers} subscribers
          </Text>
        </View>

        {/* Right: win rate + monthly */}
        <View style={styles.leaderRight}>
          {activeTab === 'subscribers' ? (
            <>
              <Text style={styles.leaderPrimary}>{entry.subscribers}</Text>
              <Text style={styles.leaderSecondary}>{entry.winRate}% win</Text>
            </>
          ) : (
            <>
              <Text style={styles.leaderPrimary}>{entry.winRate}%</Text>
              <Text style={styles.leaderSecondary}>{entry.monthlyReturn}%/mo</Text>
            </>
          )}
        </View>
      </View>
      {!isLast && <View style={styles.rowDivider} />}
    </>
  );
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'winRate', label: 'Win Rate' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'subscribers', label: 'Subscribers' },
];

export default function LeaderboardScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('winRate');
  const data = getSortedData(activeTab);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Tab pills */}
      <View style={styles.tabRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabPill, activeTab === tab.key && styles.tabPillActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabPillText, activeTab === tab.key && styles.tabPillTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top 3 podium note */}
        <View style={styles.podiumNote}>
          <Ionicons name="trophy" size={14} color="#F59E0B" />
          <Text style={styles.podiumNoteText}>
            {activeTab === 'winRate' ? 'Ranked by win rate' :
             activeTab === 'monthly' ? 'Ranked by monthly return' :
             'Ranked by subscribers'}
          </Text>
        </View>

        {/* Leaderboard list */}
        <View style={styles.listCard}>
          {data.map((entry, index) => (
            <LeaderRow
              key={entry.id}
              entry={entry}
              isLast={index === data.length - 1}
              activeTab={activeTab}
            />
          ))}
        </View>

        {/* Footer */}
        <Text style={styles.footerNote}>
          Updated daily · All strategies independently verified
        </Text>

        {/* Submit CTA */}
        <View style={styles.submitCta}>
          <Ionicons name="add-circle-outline" size={18} color="#1D4ED8" style={{ marginRight: 8 }} />
          <Text style={styles.submitCtaText}>Have a strategy with 55%+ win rate?</Text>
          <Text style={styles.submitCtaLink}> Apply →</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    padding: 4,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  headerRight: {
    width: 30,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  tabPillActive: {
    backgroundColor: '#1D4ED8',
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabPillTextActive: {
    color: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  podiumNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 10,
    marginLeft: 2,
  },
  podiumNoteText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 14,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  rankNumber: {
    fontWeight: '800',
    width: 22,
    textAlign: 'center',
    flexShrink: 0,
  },
  leaderCenter: {
    flex: 1,
    minWidth: 0,
  },
  leaderNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  strategyName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    flexShrink: 1,
  },
  tierBadge: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
    flexShrink: 0,
  },
  tierText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  traderMeta: {
    fontSize: 12,
    color: '#94A3B8',
  },
  leaderRight: {
    alignItems: 'flex-end',
    flexShrink: 0,
    minWidth: 60,
  },
  leaderPrimary: {
    fontSize: 15,
    fontWeight: '700',
    color: '#16A34A',
  },
  leaderSecondary: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 1,
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
    marginBottom: 12,
  },
  submitCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 14,
  },
  submitCtaText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  submitCtaLink: {
    fontSize: 13,
    color: '#1D4ED8',
    fontWeight: '700',
  },
  bottomPad: {
    height: 32,
  },
});
