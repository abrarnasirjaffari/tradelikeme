import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
        <StatusBar barStyle="light-content" backgroundColor="#1D4ED8" />
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#1D4ED8" />

      {/* Blue hero area */}
      <SafeAreaView style={styles.heroArea} edges={['top']}>
        {/* Logo box */}
        <View style={styles.logoBox}>
          <Text style={styles.logoBoxText}>TL</Text>
        </View>

        {/* App name */}
        <Text style={styles.appName}>TradeLikeMe</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Verified strategies. Automated profits.
        </Text>

        {/* Badge pills */}
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>89% Win Rate</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Trustless</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>200x</Text>
          </View>
        </View>
      </SafeAreaView>

      {/* White bottom sheet */}
      <SafeAreaView style={styles.bottomSheet} edges={['bottom']}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/onboarding' as never)}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ghostButton}
          onPress={() => router.push('/(auth)/login' as never)}
          activeOpacity={0.7}
        >
          <Text style={styles.ghostButtonText}>Log In</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Your funds. Your gains. 20% profit share only.
        </Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerContainer: {
    flex: 1,
    backgroundColor: '#1D4ED8',
  },
  heroArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  logoBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoBoxText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1D4ED8',
    fontFamily: 'Inter',
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
    fontFamily: 'Inter',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  badge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1D4ED8',
    fontFamily: 'Inter',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#1D4ED8',
    borderRadius: 28,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter',
  },
  ghostButton: {
    borderRadius: 28,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#1D4ED8',
    marginBottom: 20,
  },
  ghostButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D4ED8',
    fontFamily: 'Inter',
  },
  footerText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: 'Inter',
  },
});
