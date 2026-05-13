import { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { auth } from '@/api/auth';

export default function SignupScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleSignup = async () => {
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await auth.signup({ name: name.trim(), email: email.trim(), password });
      setEmailSent(true);
      router.replace('/(tabs)/index' as never);
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Sign up failed. Please try again.';
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
      setError('Google sign-up failed. Please try again.');
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
      setError('GitHub sign-up failed. Please try again.');
    } finally {
      setOauthLoading(null);
    }
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
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Start earning with a verified strategy</Text>
          </View>

          {emailSent ? (
            <View style={styles.infoBanner}>
              <Text style={styles.infoText}>
                Check your email to verify your account before trading.
              </Text>
            </View>
          ) : null}

          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <TextInput
              label="Full Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              autoCapitalize="words"
              autoComplete="name"
              autoCorrect={false}
              style={styles.input}
              outlineStyle={styles.inputOutline}
              theme={{ colors: { primary: '#3B82F6', outline: '#CBD5E1' } }}
              left={<TextInput.Icon icon="account-outline" color="#94A3B8" />}
            />

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
              autoComplete="new-password"
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
            <Text style={styles.passwordHint}>Minimum 8 characters</Text>

            <Button
              mode="contained"
              onPress={handleSignup}
              loading={loading}
              disabled={loading || oauthLoading !== null}
              style={styles.primaryButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.primaryButtonLabel}
            >
              Create Account
            </Button>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or sign up with</Text>
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
              Sign up with Google
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
              Sign up with GitHub
            </Button>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login' as never)}>
              <Text style={styles.footerLink}>Log in</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.terms}>
            By creating an account you agree to our Terms of Service and Privacy Policy.
          </Text>
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
    marginBottom: 24,
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
  infoBanner: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  infoText: {
    color: '#1D4ED8',
    fontSize: 14,
    fontWeight: '500',
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
  passwordHint: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: -6,
    marginLeft: 4,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
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
  terms: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 4,
  },
});
