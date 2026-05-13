import { useEffect, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Clipboard,
  Platform,
} from 'react-native';
import {
  Text,
  Divider,
  Switch,
  ActivityIndicator,
  Snackbar,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { getRiskMode, setRiskMode, getNotifConfig, setNotifConfig } from '@/api/vault';

// expo-notifications is native-only; import conditionally
let ExpoNotifications: typeof import('expo-notifications') | null = null;
if (Platform.OS !== 'web') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ExpoNotifications = require('expo-notifications');
}

type RiskMode = 'conservative' | 'medium' | 'aggressive';

const RISK_MODES: { label: string; value: RiskMode }[] = [
  { label: 'Conservative', value: 'conservative' },
  { label: 'Medium', value: 'medium' },
  { label: 'Aggressive', value: 'aggressive' },
];

function getInitials(name?: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function truncateAddress(addr?: string | null): string {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function SettingsScreen() {
  const theme = useTheme();
  const { user, logout } = useAuthStore();

  const [riskMode, setRiskModeState] = useState<RiskMode>('medium');
  const [pushEnabled, setPushEnabled] = useState(false);
  const [telegramEnabled, setTelegramEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');

  const showToast = useCallback((msg: string) => {
    setSnackMessage(msg);
    setSnackVisible(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [riskRes, notifRes] = await Promise.all([
          getRiskMode(user?.id),
          getNotifConfig(user?.id),
        ]);
        if (cancelled) return;
        if (riskRes?.mode) setRiskModeState(riskRes.mode as RiskMode);
        if (notifRes) {
          setPushEnabled(!!notifRes.push_enabled);
          setTelegramEnabled(!!notifRes.telegram_enabled);
        }
      } catch {
        // silently ignore — defaults remain
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleRiskModeSelect = async (mode: RiskMode) => {
    setRiskModeState(mode);
    try {
      await setRiskMode({ mode }, user?.id);
      showToast('Risk mode saved');
    } catch {
      showToast('Failed to save risk mode');
    }
  };

  const handlePushToggle = async (value: boolean) => {
    if (value) {
      if (Platform.OS === 'web' || !ExpoNotifications) {
        // Notifications not supported on web — allow toggle but skip permission request
      } else {
        const { status } = await ExpoNotifications.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Enable notifications in Settings to receive push alerts.',
          );
          return;
        }
      }
    }
    setPushEnabled(value);
    try {
      await setNotifConfig({ push_enabled: value, telegram_enabled: telegramEnabled }, user?.id);
      showToast('Notification settings saved');
    } catch {
      showToast('Failed to save notification settings');
    }
  };

  const handleTelegramToggle = async (value: boolean) => {
    setTelegramEnabled(value);
    try {
      await setNotifConfig({ push_enabled: pushEnabled, telegram_enabled: value }, user?.id);
      showToast('Notification settings saved');
    } catch {
      showToast('Failed to save notification settings');
    }
  };

  const handleCopyWallet = () => {
    if (user?.walletAddress) {
      Clipboard.setString(user.walletAddress);
      showToast('Wallet address copied');
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Section */}
        <Text style={styles.sectionHeader}>Account</Text>
        <View style={styles.card}>
          <View style={styles.accountRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>{user?.name ?? 'Anonymous'}</Text>
              <Text style={styles.accountEmail}>{user?.email ?? ''}</Text>
            </View>
          </View>
          {user?.walletAddress ? (
            <>
              <Divider style={styles.divider} />
              <TouchableOpacity style={styles.walletRow} onPress={handleCopyWallet} activeOpacity={0.7}>
                <View>
                  <Text style={styles.listLabel}>Wallet Address</Text>
                  <Text style={styles.walletAddress}>
                    {truncateAddress(user.walletAddress)}
                  </Text>
                </View>
                <Text style={styles.copyLink}>Copy</Text>
              </TouchableOpacity>
            </>
          ) : null}
        </View>

        {/* Risk Mode Section */}
        <Text style={styles.sectionHeader}>Risk Mode</Text>
        <View style={styles.card}>
          <Text style={styles.riskHint}>
            Controls leverage and margin per trade.
          </Text>
          <View style={styles.chipRow}>
            {RISK_MODES.map((m) => (
              <TouchableOpacity
                key={m.value}
                style={[
                  styles.chip,
                  riskMode === m.value && styles.chipActive,
                ]}
                onPress={() => handleRiskModeSelect(m.value)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.chipLabel,
                    riskMode === m.value && styles.chipLabelActive,
                  ]}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notifications Section */}
        <Text style={styles.sectionHeader}>Notifications</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.listLabel}>Push Notifications</Text>
              <Text style={styles.listSub}>Zone touches, TP hits, SL alerts</Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={handlePushToggle}
              color="#3B82F6"
            />
          </View>
          <Divider style={styles.divider} />
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.listLabel}>Telegram Notifications</Text>
              <Text style={styles.listSub}>Via @tradelikeme_alerts_bot</Text>
            </View>
            <Switch
              value={telegramEnabled}
              onValueChange={handleTelegramToggle}
              color="#3B82F6"
            />
          </View>
        </View>

        {/* Connected Wallets Section */}
        <Text style={styles.sectionHeader}>Connected Wallets</Text>
        <View style={styles.card}>
          {user?.walletAddress ? (
            <View style={styles.walletItemRow}>
              <View>
                <Text style={styles.listLabel}>Phantom</Text>
                <Text style={styles.walletAddress}>
                  {truncateAddress(user.walletAddress)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    'Disconnect Wallet',
                    'Disconnect Phantom wallet from your account?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Disconnect', style: 'destructive', onPress: () => showToast('Wallet disconnected') },
                    ],
                  )
                }
                activeOpacity={0.7}
              >
                <Text style={styles.disconnectLink}>Disconnect</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.noWalletText}>No wallet connected</Text>
          )}
        </View>

        {/* Log Out */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={styles.bottomPad} />
      </ScrollView>

      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={2500}
        style={styles.snackbar}
      >
        {snackMessage}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    overflow: 'hidden',
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  accountEmail: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  walletItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  walletAddress: {
    fontSize: 13,
    color: '#94A3B8',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  copyLink: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  disconnectLink: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '500',
  },
  noWalletText: {
    fontSize: 14,
    color: '#94A3B8',
    padding: 16,
  },
  divider: {
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
  },
  riskHint: {
    fontSize: 13,
    color: '#64748B',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 8,
  },
  chip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  chipActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  chipLabelActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  listLabel: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
  },
  listSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  logoutButton: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 4,
    marginBottom: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  snackbar: {
    backgroundColor: '#1E293B',
  },
  bottomPad: {
    height: 32,
  },
});
