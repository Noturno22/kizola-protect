import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as Linking from 'expo-linking';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Moon, Sun, Mail, Lock, EyeOff, Eye, ArrowRight, Apple, Smartphone } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import { ComingSoonModal } from '@/components/ComingSoonModal';
import * as AppleAuthentication from 'expo-apple-authentication';

import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

const LIGHT = {
  gradientColors: ['#EEF2FF', '#F0F9FF', '#FFFFFF'] as const,
  bg: '#F8FAFF',
  card: '#FFFFFF',
  cardBorder: '#E2E8F4',
  input: '#F1F5FD',
  inputBorder: '#D1DCF0',
  accent: '#2563EB',
  accentEnd: '#1D4ED8',
  white: '#FFFFFF',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  divider: '#E2E8F4',
  socialBtn: '#F8FAFF',
  socialBtnBorder: '#D1DCF0',
  linkColor: '#2563EB',
  logoWrapper: '#EFF6FF',
  logoWrapperBorder: '#BFDBFE',
  shadow: '#A8C0E8',
};

const DARK = {
  gradientColors: ['#060D1F', '#0A1628', '#0D1F3C'] as const,
  bg: '#0A0F1E',
  card: '#111827',
  cardBorder: '#1F2A3D',
  input: '#0D1526',
  inputBorder: '#1E2D45',
  accent: '#2563EB',
  accentEnd: '#1D4ED8',
  white: '#FFFFFF',
  textPrimary: '#F9FAFB',
  textSecondary: '#6B7280',
  textMuted: '#4B5563',
  divider: '#1F2A3D',
  socialBtn: '#161F30',
  socialBtnBorder: '#2A3A52',
  linkColor: '#3B82F6',
  logoWrapper: '#0D1F3C',
  logoWrapperBorder: '#1E3A5F',
  shadow: '#000000',
};

export default function Login() {
  const router = useRouter();
  const { signIn, isDemoMode, session, user, loading: authLoading } = useAuth();
  const { t, i18n } = useTranslation();
  const { theme, isDark, toggleTheme } = useTheme();


  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [showAppleModal, setShowAppleModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const D = theme;

  const nextRoute = useMemo((): '/dashboard' | null => {
    if (!session) return null;
    return '/dashboard';
  }, [session]);

  const redirectIfLoggedIn = useCallback(async () => {
    const { data, error } = await supabase.auth.getSession();
    if (!error && data?.session) {
      router.replace('/dashboard');
      return true;
    }
    return false;
  }, [router]);

  const routerRef = useRef(router);
  routerRef.current = router;

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        if (nextRoute) {
          router.replace(nextRoute);
          return;
        }
        await redirectIfLoggedIn();
      } finally {
        // Initial session check completed
      }
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && mounted) routerRef.current.replace('/dashboard');
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [nextRoute, redirectIfLoggedIn]);

  useFocusEffect(
    useCallback(() => {
      if (nextRoute) router.replace(nextRoute);
      else redirectIfLoggedIn().catch(() => {});
    }, [nextRoute, redirectIfLoggedIn, router])
  );

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(t('common.error') || 'Erro', t('auth.emailPasswordRequired') || 'Por favor, insira o email e a senha.');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/dashboard');
    } catch (error: any) {
      Alert.alert(t('auth.loginFailed') || 'Falha no Login', error.message || t('auth.invalidCredentials') || 'Email ou senha inválidos.');
    } finally {
      setLoading(false);
    }
  };
  
  const createSessionFromUrl = async (url: string) => {
    const { params, errorCode } = QueryParams.getQueryParams(url);

    if (errorCode) throw new Error(errorCode);
    
    // Try PKCE code exchange first
    if (params?.code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(params.code);
      if (error) throw error;
      return data.session;
    }

    // Fallback to implicit flow tokens
    const { access_token, refresh_token } = params;
    if (!access_token) return;

    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });
    
    if (error) throw error;
    return data.session;
  };

  const signInWithGoogle = async () => {
    try {
      setGoogleLoading(true);

      const redirectTo =
        Platform.OS === 'web'
          ? window.location.origin
          : AuthSession.makeRedirectUri();

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: Platform.OS !== 'web',
        },
      });

      if (error) {
        Alert.alert('Erro Google', error.message);
        return;
      }

      if (Platform.OS !== 'web' && data?.url) {
        const res = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectTo
        );

        if (res.type === 'success') {
          const { url } = res;
          const session = await createSessionFromUrl(url);
          if (session) {
            router.replace('/dashboard');
          }
        }
      }
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const signInWithApple = async () => {
    try {
      setAppleLoading(true);

      if (Platform.OS === 'ios') {
        const credential = await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
        });

        if (!credential.identityToken) {
          throw new Error('No identity token returned from Apple.');
        }

        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        });

        if (error) throw error;
        return;
      }

      const redirectTo =
        Platform.OS === 'web'
          ? window.location.origin
          : AuthSession.makeRedirectUri();

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo,
          skipBrowserRedirect: Platform.OS !== 'web',
        },
      });

      if (error) {
        Alert.alert('Erro Apple', error.message);
        return;
      }

      if (Platform.OS !== 'web' && data?.url) {
        const res = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectTo
        );

        if (res.type === 'success') {
          const { url } = res;
          const session = await createSessionFromUrl(url);
          if (session) {
            router.replace('/dashboard');
          }
        }
      }
    } catch (e: any) {
      if (e.code === 'ERR_CANCELED' || e.message?.includes('canceled')) {
        return;
      }
      Alert.alert('Erro', e.message);
    } finally {
      setAppleLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <LinearGradient colors={isDark ? ['#060D1F', '#0A1628', '#0D1F3C'] : ['#EEF2FF', '#F0F9FF', '#FFFFFF']} style={styles.gradient}>

        {/* ── Theme Toggle ───────────────────────────────────────────────────── */}
        <TouchableOpacity
          onPress={toggleTheme}
          accessibilityLabel={isDark ? t('common.light') || 'Light mode' : t('common.dark') || 'Dark mode'}
          accessibilityRole="button"
          style={[
            styles.themeToggle,
            {
              backgroundColor: theme.surface,
              borderColor: theme.cardBorderAlt,
              shadowColor: '#000',
            },
          ]}
          activeOpacity={0.8}
        >
          <View style={[styles.themeToggleTrack, { backgroundColor: isDark ? '#1E3A5F' : '#DBEAFE' }]}>
            <View
              style={[
                styles.themeToggleThumb,
                {
                  backgroundColor: isDark ? '#3B82F6' : '#2563EB',
                  transform: [{ translateX: isDark ? 22 : 2 }],
                },
              ]}
            >
              {isDark ? <Moon size={12} color="#FFFFFF" /> : <Sun size={12} color="#FFFFFF" />}
            </View>
          </View>
          <Text style={[styles.themeToggleLabel, { color: theme.textSecondary }]}>
            {isDark ? t('common.dark') || 'Dark' : t('common.light') || 'Light'}
          </Text>

        </TouchableOpacity>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ── Logo ─────────────────────────────────────────────────────── */}
            <View style={styles.logoSection}>
              <View
                style={[
                  styles.logoWrapper,
                  {
                    backgroundColor: isDark ? '#0D1F3C' : '#EFF6FF',
                    borderColor: isDark ? '#1E3A5F' : '#BFDBFE',
                    shadowColor: theme.primary,
                  },
                ]}
              >
              <Image source={require('@/assets/images/icon.png')} style={styles.logoImage} resizeMode="contain" />
              </View>
              <Text style={[styles.appName, { color: theme.text }]}>Kizola Protect</Text>
              <Text style={[styles.tagline, { color: theme.textSecondary }]}>{t('auth.tagline') || 'Your trusted protection partner'}</Text>
            </View>


            {/* ── Form Card ────────────────────────────────────────────────── */}
            <View
              style={[
                styles.formCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.cardBorderAlt,
                  shadowColor: '#000',
                },
              ]}
            >
              <Text style={[styles.title, { color: theme.text }]}>{t('auth.welcome')}</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{t('auth.signInSubtitle')}</Text>


              {/* Email */}
              <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.cardBorderAlt }]}>
                <Mail size={18} color={theme.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Email address"
                  placeholderTextColor={theme.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  testID="email-input"
                />
              </View>

              {/* Password */}
              <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.cardBorderAlt }]}>
                <Lock size={18} color={theme.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Password"
                  placeholderTextColor={theme.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  testID="password-input"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  {showPassword ? <EyeOff size={18} color={theme.textMuted} /> : <Eye size={18} color={theme.textMuted} />}
                </TouchableOpacity>
              </View>

              {/* Forgot Password */}
              <TouchableOpacity style={styles.forgotPassword} onPress={() => router.push('/forgot-password')} accessibilityRole="link" accessibilityLabel={t('auth.forgotPassword') || 'Forgot password'}>
                <Text style={[styles.forgotPasswordText, { color: theme.primary }]}>{t('auth.forgotPassword') || 'Esqueceu a senha?'}</Text>
              </TouchableOpacity>

              {/* Sign In Button */}
              <TouchableOpacity
                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel={t('auth.signIn') || 'Sign in'}
                testID="login-button"
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[theme.primary, theme.primary]}
                  style={styles.loginButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.loginButtonText}>{t('auth.signIn')}</Text>
                      <ArrowRight size={18} color="#FFFFFF" />
                    </>

                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={[styles.dividerLine, { backgroundColor: theme.cardBorderAlt }]} />
                <Text style={[styles.dividerText, { color: theme.textMuted }]}>{t('auth.or')}</Text>
                <View style={[styles.dividerLine, { backgroundColor: theme.cardBorderAlt }]} />
              </View>

              {/* Google Button */}
              <TouchableOpacity
                style={[
                  styles.socialButton,
                  { backgroundColor: theme.surface, borderColor: theme.cardBorderAlt },
                  googleLoading && styles.loginButtonDisabled,
                ]}
                onPress={signInWithGoogle}
                disabled={googleLoading}
                accessibilityRole="button"
                accessibilityLabel={t('auth.googleSignIn') || 'Sign in with Google'}
                activeOpacity={0.8}
              >
                {googleLoading ? (
                  <ActivityIndicator color={theme.text} />
                ) : (
                  <>
                    <View style={styles.googleIcon}>
                      <Text style={styles.googleIconText}>G</Text>
                    </View>
                    <Text style={[styles.socialButtonText, { color: theme.text }]}>{t('auth.googleSignIn')}</Text>
                  </>

                )}
              </TouchableOpacity>

              {/* Apple Button */}
              <TouchableOpacity
                style={[
                  styles.socialButton,
                  { backgroundColor: '#000000', borderColor: '#333333' },
                ]}
                onPress={() => setShowAppleModal(true)}
                accessibilityRole="button"
                accessibilityLabel={t('auth.appleSignIn') || 'Sign in with Apple'}
                activeOpacity={0.8}
              >
                <Apple size={20} color="#FFFFFF" style={{ marginRight: 10 }} />
                <Text style={[styles.socialButtonTextApple, { color: '#FFFFFF' }]}>{t('auth.appleSignIn')}</Text>
              </TouchableOpacity>

              {/* Phone Button */}
              <TouchableOpacity
                style={[styles.socialButton, { backgroundColor: theme.surface, borderColor: theme.cardBorderAlt }]}
                onPress={() => setShowPhoneModal(true)}
                accessibilityRole="button"
                accessibilityLabel={t('auth.phoneSignIn') || 'Sign in with phone number'}
                activeOpacity={0.8}
              >
                <Smartphone size={18} color={theme.text} style={{ marginRight: 10 }} />
                <Text style={[styles.socialButtonText, { color: theme.text }]}>{t('auth.phoneSignIn')}</Text>
              </TouchableOpacity>


              {/* Register */}
              <View style={styles.registerSection} accessible={true} accessibilityLabel={t('auth.noAccount') || "Don't have an account"}>
                <Text style={[styles.registerText, { color: theme.textSecondary }]}>{t('auth.noAccount')}</Text>
                <TouchableOpacity onPress={() => router.push('/register')} accessibilityRole="link" accessibilityLabel={t('auth.createAccount') || 'Create account'}>
                  <Text style={[styles.registerLink, { color: theme.primary }]}>{t('auth.createAccount')}</Text>
                </TouchableOpacity>
              </View>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>

      {/* Apple Login Coming Soon Modal */}
      <ComingSoonModal
        visible={showAppleModal}
        onClose={() => setShowAppleModal(false)}
        title="Login com Apple"
        message="Esta área está sendo desenvolvida e será adicionada em breve na versão final. A autenticação com Apple ID requer uma conta de desenvolvedor Apple configurada."
        icon="apple"
        accentColor="#000000"
      />

      {/* Phone Login Coming Soon Modal */}
      <ComingSoonModal
        visible={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        title="Login com Telefone"
        message="Esta área está sendo desenvolvida e será adicionada em breve na versão final. O login via SMS/OTP estará disponível na versão completa."
        icon="phone"
        accentColor={theme.accent}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 32 },

  // ── Theme Toggle ──────────────────────────────────────────────────────────
  themeToggle: {
    position: 'absolute',
    top: 16,
    right: 20,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  themeToggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
  },
  themeToggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeToggleLabel: {
    fontSize: 13,
    fontWeight: '600',
  },

  // ── Logo ──────────────────────────────────────────────────────────────────
  logoSection: { alignItems: 'center', marginTop: 72, marginBottom: 28 },
  logoWrapper: {
    width: 64, height: 64, borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
    marginBottom: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  logoImage: { width: 56, height: 56 },
  appName: { fontSize: 22, fontWeight: '700', letterSpacing: 0.3, marginBottom: 4 },
  tagline: { fontSize: 13, fontWeight: '400' },

  // ── Form Card ─────────────────────────────────────────────────────────────
  formCard: {
    borderRadius: 20, padding: 24,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1, shadowRadius: 20, elevation: 12,
  },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 13, textAlign: 'center', marginBottom: 24 },

  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 12, marginBottom: 14, paddingHorizontal: 14,
    borderWidth: 1, height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15 },
  eyeIcon: { padding: 6 },

  forgotPassword: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotPasswordText: { fontSize: 13, fontWeight: '500' },

  loginButton: { borderRadius: 12, overflow: 'hidden', marginBottom: 20 },
  loginButtonDisabled: { opacity: 0.6 },
  loginButtonGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 16,
  },
  loginButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 13, marginHorizontal: 12 },

  socialButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderRadius: 12, paddingVertical: 14, marginBottom: 12,
  },
  googleIcon: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  googleIconText: { fontSize: 12, fontWeight: '800', color: '#4285F4' },
  socialButtonText: { fontSize: 15, fontWeight: '500' },
  socialButtonTextApple: { fontSize: 15, fontWeight: '600' },
  appleButton: { width: '100%', height: 50, marginBottom: 12 },

  registerSection: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  registerText: { fontSize: 13 },
  registerLink: { fontSize: 13, fontWeight: '600', textDecorationLine: 'underline' },
});
