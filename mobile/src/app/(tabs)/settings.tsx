import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

type RiskMode = 'conservative' | 'medium' | 'aggressive';

export default function SettingsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [riskMode, setRiskMode] = useState<RiskMode>('medium');
  const [pushNotifications, setPushNotifications] = useState(true);
  const [telegramAlerts, setTelegramAlerts] = useState(true);
  const [zoneTouchAlerts, setZoneTouchAlerts] = useState(false);

  const displayName = user?.name ?? 'Trader';
  const email = user?.email ?? '';
  const walletAddress = (user as { walletAddress?: string } | null)?.walletAddress ?? '';
  const truncatedWallet = walletAddress
    ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-3)}`
    : 'No wallet connected';

  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const riskOptions: { key: RiskMode; label: string }[] = [
    { key: 'conservative', label: 'Conservative' },
    { key: 'medium', label: 'Medium' },
    { key: 'aggressive', label: 'Aggressive' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── header ── */}
        <Text style={styles.headerTitle}>Settings</Text>

        {/* ── profile card ── */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileEmail}>{email}</Text>
            <Text style={styles.profileWallet}>{truncatedWallet}</Text>
          </View>
        </View>

        {/* ── risk mode ── */}
        <Text style={styles.sectionTitle}>RISK MODE</Text>
        <View style={styles.riskRow}>
          {riskOptions.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.riskButton,
                riskMode === opt.key && styles.riskButtonActive,
              ]}
              onPress={() => setRiskMode(opt.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.riskButtonText,
                  riskMode === opt.key && styles.riskButtonTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── notifications ── */}
        <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
        <View style={styles.toggleCard}>
          {/* Push Notifications */}
          <View style={[styles.toggleRow, styles.toggleDivider]}>
            <Text style={styles.toggleLabel}>Push Notifications</Text>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: '#E2E8F0', true: '#1D4ED8' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E2E8F0"
            />
          </View>
          {/* Telegram Alerts */}
          <View style={[styles.toggleRow, styles.toggleDivider]}>
            <Text style={styles.toggleLabel}>Telegram Alerts</Text>
            <Switch
              value={telegramAlerts}
              onValueChange={setTelegramAlerts}
              trackColor={{ false: '#E2E8F0', true: '#1D4ED8' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E2E8F0"
            />
          </View>
          {/* Zone Touch Alerts */}
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Zone Touch Alerts</Text>
            <Switch
              value={zoneTouchAlerts}
              onValueChange={setZoneTouchAlerts}
              trackColor={{ false: '#E2E8F0', true: '#1D4ED8' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E2E8F0"
            />
          </View>
        </View>

        {/* ── log out ── */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    paddingBottom: 32,
  },

  // header
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
    marginBottom: 20,
    paddingTop: 4,
  },

  // profile card
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 3,
  },
  profileWallet: {
    fontSize: 12,
    color: '#1D4ED8',
    fontWeight: '500',
  },

  // section title
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },

  // risk mode
  riskRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  riskButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    alignItems: 'center',
  },
  riskButtonActive: {
    backgroundColor: '#1D4ED8',
    borderColor: '#1D4ED8',
  },
  riskButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  riskButtonTextActive: {
    color: '#FFFFFF',
  },

  // toggle card
  toggleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 28,
    overflow: 'hidden',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  toggleDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '400',
    color: '#0F172A',
  },

  // logout
  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEF2F2',
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },

  bottomSpacer: {
    height: 24,
  },
});
