import { useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function SplashScreen() {
  const router = useRouter();
  const { token, isLoading, loadToken } = useAuthStore();

  useEffect(() => {
    loadToken().then(() => {
      const currentToken = useAuthStore.getState().token;
      if (currentToken) {
        router.replace('/(tabs)/index' as never);
      }
    });
  }, []);

  useEffect(() => {
    if (!isLoading && token) {
      router.replace('/(tabs)/index' as never);
    }
  }, [isLoading, token]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.heroSection}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Trade</Text>
          <Text style={styles.logoAccent}>LikeMe</Text>
        </View>
        <Text style={styles.tagline}>89% win rate. Verified. Automated.</Text>
        <Text style={styles.subTagline}>
          Copy a proven trading strategy. Earn while you sleep.
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>89%</Text>
          <Text style={styles.statLabel}>Win Rate</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>200x</Text>
          <Text style={styles.statLabel}>Max Leverage</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>24/7</Text>
          <Text style={styles.statLabel}>Auto Trading</Text>
        </View>
      </View>

      <View style={styles.buttonSection}>
        <Button
          mode="contained"
          onPress={() => router.push('/(auth)/signup' as never)}
          style={styles.primaryButton}
          contentStyle={styles.buttonContent}
          labelStyle={styles.primaryButtonLabel}
        >
          Get Started
        </Button>
        <Button
          mode="outlined"
          onPress={() => router.push('/(auth)/login' as never)}
          style={styles.outlinedButton}
          contentStyle={styles.buttonContent}
          labelStyle={styles.outlinedButtonLabel}
        >
          Log In
        </Button>
      </View>

      <Text style={styles.disclaimer}>
        Trading involves risk. Past performance does not guarantee future results.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 48,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 40,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -1,
  },
  logoAccent: {
    fontSize: 40,
    fontWeight: '800',
    color: '#3B82F6',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 12,
  },
  subTagline: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3B82F6',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E2E8F0',
  },
  buttonSection: {
    gap: 12,
    marginBottom: 16,
  },
  primaryButton: {
    borderRadius: 12,
    backgroundColor: '#3B82F6',
  },
  outlinedButton: {
    borderRadius: 12,
    borderColor: '#3B82F6',
    borderWidth: 1.5,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  primaryButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  outlinedButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  disclaimer: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 16,
  },
});
