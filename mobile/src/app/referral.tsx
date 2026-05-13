import { View, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const REFERRAL_LINK = 'tradelikeme.xyz/r/abrar';

interface ReferralActivity {
  id: string;
  username: string;
  detail: string;
  earned: string;
}

const MOCK_ACTIVITY: ReferralActivity[] = [
  {
    id: '1',
    username: 'wasiq_amir joined',
    detail: 'Deposited $2,000 · 5 days ago',
    earned: '+$8.40',
  },
  {
    id: '2',
    username: 'ali_khan joined',
    detail: 'Deposited $500 · 1 week ago',
    earned: '+$2.10',
  },
];

interface StatCardProps {
  value: string;
  label: string;
  valueColor?: string;
}

function StatCard({ value, label, valueColor }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function copyToClipboard(text: string) {
  // Try expo-clipboard if available, fall back to Alert
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Clipboard = require('expo-clipboard');
    if (Clipboard && typeof Clipboard.setStringAsync === 'function') {
      void Clipboard.setStringAsync(text);
      Alert.alert('Copied!', 'Referral link copied to clipboard.');
      return;
    }
    if (Clipboard && typeof Clipboard.setString === 'function') {
      Clipboard.setString(text);
      Alert.alert('Copied!', 'Referral link copied to clipboard.');
      return;
    }
  } catch {
    // expo-clipboard not available
  }
  Alert.alert('Your Referral Link', text);
}

export default function ReferralScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refer & Earn</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Blue banner */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerIconRow}>
            <Ionicons name="gift" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.bannerTitle}>Earn 5% of your referrals' profits</Text>
          <Text style={styles.bannerDesc}>
            Share your link. When friends deposit and profit, you earn 5% of their gains forever.
          </Text>
        </View>

        {/* Referral link */}
        <Text style={styles.sectionLabel}>Your Referral Link</Text>
        <View style={styles.linkRow}>
          <Ionicons name="link-outline" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
          <Text style={styles.linkText} numberOfLines={1}>{REFERRAL_LINK}</Text>
          <TouchableOpacity
            onPress={() => copyToClipboard(REFERRAL_LINK)}
            style={styles.copyBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.copyText}>Copy</Text>
          </TouchableOpacity>
        </View>

        {/* Share button */}
        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => Alert.alert('Share', 'Share your referral link: https://' + REFERRAL_LINK)}
          activeOpacity={0.85}
        >
          <Ionicons name="share-social-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.shareButtonText}>Share Link</Text>
        </TouchableOpacity>

        {/* Stats */}
        <Text style={styles.sectionTitle}>Your Referrals</Text>
        <View style={styles.statsRow}>
          <StatCard value="12" label="Invited" />
          <StatCard value="7" label="Active" />
          <StatCard value="$284" label="Earned" valueColor="#16A34A" />
        </View>

        {/* Recent activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          {MOCK_ACTIVITY.map((item, index) => (
            <View key={item.id}>
              {index > 0 && <View style={styles.rowDivider} />}
              <View style={styles.activityRow}>
                <View style={styles.activityLeft}>
                  <View style={styles.activityAvatarCircle}>
                    <Ionicons name="person" size={14} color="#64748B" />
                  </View>
                  <View style={styles.activityText}>
                    <Text style={styles.activityUsername}>{item.username}</Text>
                    <Text style={styles.activityDetail}>{item.detail}</Text>
                  </View>
                </View>
                <Text style={styles.activityEarned}>{item.earned}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* How it works */}
        <Text style={styles.sectionTitle}>How It Works</Text>
        <View style={styles.stepsCard}>
          {[
            { step: '1', text: 'Share your unique referral link with friends' },
            { step: '2', text: 'Friends sign up and deposit into any strategy' },
            { step: '3', text: 'You earn 5% of their profits automatically, forever' },
          ].map((item) => (
            <View key={item.step} style={styles.stepRow}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNumber}>{item.step}</Text>
              </View>
              <Text style={styles.stepText}>{item.text}</Text>
            </View>
          ))}
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  bannerCard: {
    backgroundColor: '#1D4ED8',
    borderRadius: 14,
    padding: 20,
    marginBottom: 20,
  },
  bannerIconRow: {
    marginBottom: 10,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 22,
  },
  bannerDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 19,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  linkText: {
    flex: 1,
    fontSize: 14,
    color: '#64748B',
  },
  copyBtn: {
    marginLeft: 8,
  },
  copyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1D4ED8',
    borderRadius: 12,
    height: 48,
    marginBottom: 24,
  },
  shareButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
    overflow: 'hidden',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  activityAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    flexShrink: 0,
  },
  activityText: {
    flex: 1,
  },
  activityUsername: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 1,
  },
  activityDetail: {
    fontSize: 12,
    color: '#94A3B8',
  },
  activityEarned: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16A34A',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 16,
  },
  stepsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 14,
    marginBottom: 8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  stepText: {
    fontSize: 14,
    color: '#475569',
    flex: 1,
    lineHeight: 20,
  },
  bottomPad: {
    height: 32,
  },
});
