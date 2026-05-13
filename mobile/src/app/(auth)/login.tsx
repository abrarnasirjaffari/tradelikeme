import { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { auth } from '@/api/auth';

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await auth.login({ email: email.trim(), password });
      router.replace('/(tabs)/index' as never);
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Sign in failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleOAuth = async () => {
    setError(null);
    setOauthLoading('google');
    try {
      await auth.googleOAuth();
      router.replace('/(tabs)/index' as never);
    } catch {
      setError('Google sign-in failed. Please try again.');
    } finally {
      setOauthLoading(null);
    }
  };

  const handleGithubOAuth = async () => {
    setError(null);
    setOauthLoading('github');
    try {
      await auth.githubOAuth();
      router.replace('/(tabs)/index' as never);
    } catch {
      setError('GitHub sign-in failed. Please try again.');
    } finally {
      setOauthLoading(null);
    }
  };

  const handleMagicLink = () => {
    Alert.prompt(
      'Magic Link',
      'Enter your email address to receive a sign-in link.',
      async (inputEmail) => {
        if (!inputEmail?.trim()) return;
        try {
          await auth.sendMagicLink(inputEmail.trim());
          Alert.alert('Check your email', `We sent a sign-in link to ${inputEmail.trim()}.`);
        } catch {
          Alert.alert('Error', 'Failed to send magic link. Please try again.');
        }
      },
      'plain-text',
      email,
      'email-address'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <Text style={styles.logoText}>Trade</Text>
              <Text style={styles.logoAccent}>LikeMe</Text>
            </View>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </View>

          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              style={styles.input}
              outlineStyle={styles.inputOutline}
              theme={{ colors: { primary: '#3B82F6', outline: '#CBD5E1' } }}
              left={<TextInput.Icon icon="email-outline" color="#94A3B8" />}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry={!passwordVisible}
              autoCapitalize="none"
              autoComplete="password"
              style={styles.input}
              outlineStyle={styles.inputOutline}
              theme={{ colors: { primary: '#3B82F6', outline: '#CBD5E1' } }}
              left={<TextInput.Icon icon="lock-outline" color="#94A3B8" />}
              right={
                <TextInput.Icon
                  icon={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
                  color="#94A3B8"
                  onPress={() => setPasswordVisible((v) => !v)}
                />
              }
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading || oauthLoading !== null}
              style={styles.primaryButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.primaryButtonLabel}
            >
              Sign In
            </Button>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.divider} />
            </View>

            <Button
              mode="outlined"
              onPress={handleGoogleOAuth}
              loading={oauthLoading === 'google'}
              disabled={loading || oauthLoading !== null}
              style={styles.oauthButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.oauthButtonLabel}
              icon="google"
            >
              Sign in with Google
            </Button>

            <Button
              mode="outlined"
              onPress={handleGithubOAuth}
              loading={oauthLoading === 'github'}
              disabled={loading || oauthLoading !== null}
              style={styles.oauthButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.oauthButtonLabel}
              icon="github"
            >
              Sign in with GitHub
            </Button>

            <Button
              mode="text"
              onPress={handleMagicLink}
              disabled={loading || oauthLoading !== null}
              labelStyle={styles.magicLinkLabel}
            >
              Send magic link
            </Button>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/signup' as never)}>
              <Text style={styles.footerLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 28,
  },
  logoRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  logoAccent: {
    fontSize: 22,
    fontWeight: '800',
    color: '#3B82F6',
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '500',
  },
  form: {
    gap: 12,
    flex: 1,
  },
  input: {
    backgroundColor: '#FFFFFF',
  },
  inputOutline: {
    borderRadius: 10,
  },
  primaryButton: {
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    marginTop: 4,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  primaryButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  oauthButton: {
    borderRadius: 12,
    borderColor: '#E2E8F0',
    borderWidth: 1.5,
  },
  oauthButtonLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0F172A',
  },
  magicLinkLabel: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#64748B',
  },
  footerLink: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
});
