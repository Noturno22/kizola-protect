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
import { BlurView } from 'expo-blur';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import { ComingSoonModal } from '@/components/ComingSoonModal';
import * as AppleAuthentication from 'expo-apple-authentication';

import { supabase } from '@/lib/supabase';
import { sendWelcomeNotificationIfNeeded } from '@/lib/notifications';

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
    if (session) return '/dashboard';
    if (isDemoMode && user) return '/dashboard';
    return null;
  }, [session, isDemoMode, user]);

  const routerRef = useRef(router);
  routerRef.current = router;

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        if (nextRoute) {
          routerRef.current.replace(nextRoute);
          return;
        }
        const { data, error } = await supabase.auth.getSession();
        if (!error && data?.session && mounted) {
          routerRef.current.replace('/dashboard');
        }
      } catch {
      }
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && mounted) routerRef.current.replace('/dashboard');
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextRoute]);

  useFocusEffect(
    useCallback(() => {
      if (nextRoute) {
        routerRef.current.replace(nextRoute);
        return;
      }
      supabase.auth.getSession().then(({ data, error }) => {
        if (!error && data?.session) {
          routerRef.current.replace('/dashboard');
        }
      }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nextRoute])
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
    const { params: queryParams } = QueryParams.getQueryParams(url);

    let hashParams: Record<string, string> = {};
    try {
      const urlObj = new URL(url);
      if (urlObj.hash) {
        const hashStr = urlObj.hash.substring(1);
        hashStr.split('&').forEach((pair) => {
          const [key, value] = pair.split('=');
          if (key && value) {
            hashParams[decodeURIComponent(key)] = decodeURIComponent(value);
          }
        });
      }
    } catch { /* not a parseable URL, rely on queryParams */ }

    const params = { ...hashParams, ...queryParams };

    if (params?.code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(params.code);
      if (error) throw error;
      return data.session;
    }

    const access_token = params?.access_token;
    const refresh_token = params?.refresh_token;
    if (!access_token) return undefined;

    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token: refresh_token || '',
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
        Alert.alert(t('auth.errorGoogle'), error.message);
        return;
      }

      if (Platform.OS !== 'web' && data?.url) {
        const res = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectTo
        );

        if (res.type === 'success') {
          const session = await createSessionFromUrl(res.url);
          if (session) {
            sendWelcomeNotificationIfNeeded(session.user.id);
            router.replace('/dashboard');
            return;
          }

          const { data: fallback } = await supabase.auth.getSession();
          if (fallback?.session) {
            sendWelcomeNotificationIfNeeded(fallback.session.user.id);
            router.replace('/dashboard');
          }
        }
      }
    } catch (e: any) {
      // Handle Android native crash when app is killed during OAuth flow
      // This is a known issue with expo-web-browser Custom Chrome Tabs on Android dev builds
      if (Platform.OS === 'android' && e.message?.includes('addAll')) {
        // App was likely killed by Android during OAuth - check for any existing session
        try {
          const { data } = await supabase.auth.getSession();
          if (data?.session) {
            router.replace('/dashboard');
            return;
          }
        } catch {
          // Session check failed - user needs to try again
        }
        Alert.alert(
          t('common.warning') || 'Atenção',
          t('auth.loginInterrupted')
        );
      } else {
        Alert.alert(t('auth.error'), e.message);
      }
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

        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user?.id) {
          sendWelcomeNotificationIfNeeded(sessionData.session.user.id);
        }
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
        Alert.alert(t('auth.errorApple'), error.message);
        return;
      }

      if (Platform.OS !== 'web' && data?.url) {
        const res = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectTo
        );

        if (res.type === 'success') {
          const session = await createSessionFromUrl(res.url);
          if (session) {
            sendWelcomeNotificationIfNeeded(session.user.id);
            router.replace('/dashboard');
            return;
          }

          const { data: fallback } = await supabase.auth.getSession();
          if (fallback?.session) {
            sendWelcomeNotificationIfNeeded(fallback.session.user.id);
            router.replace('/dashboard');
          }
        }
      }
    } catch (e: any) {
      if (e.code === 'ERR_CANCELED' || e.message?.includes('canceled')) {
        return;
      }
      Alert.alert(t('auth.error'), e.message);
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
          key={isDark ? 'dark-toggle' : 'light-toggle'}
          onPress={toggleTheme}
          style={styles.themeToggleContainer}
          accessibilityLabel={isDark ? t('common.light') || 'Light mode' : t('common.dark') || 'Dark mode'}
          accessibilityRole="button"
          activeOpacity={0.8}
        >
          <BlurView
            intensity={isDark ? 40 : 60}
            tint={isDark ? 'dark' : 'light'}
            style={styles.themeToggle}
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
          </BlurView>
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
              <Image source={require('@/assets/images/icons.png')} style={styles.logoImage} resizeMode="contain" />
              <Text style={[styles.appName, { color: theme.text }]}>Kizola Protect</Text>
              <Text style={[styles.tagline, { color: theme.textSecondary }]}>{t('auth.tagline') || 'Your trusted protection partner'}</Text>
            </View>


            {/* ── Form Card ────────────────────────────────────────────────── */}
            <BlurView
              intensity={isDark ? 30 : 50}
              tint={isDark ? 'dark' : 'light'}
              style={[
                styles.formCard,
                {
                  borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.45)',
                },
              ]}
            >
              <Text style={[styles.title, { color: theme.text }]}>{t('auth.welcome')}</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{t('auth.signInSubtitle')}</Text>


              {/* Email */}
              <View style={[styles.inputContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.5)', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.4)' }]}>
                <Mail size={18} color={theme.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder={t('auth.email')}
                  placeholderTextColor={theme.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  testID="email-input"
                />
              </View>

              {/* Password */}
              <View style={[styles.inputContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.5)', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.4)' }]}>
                <Lock size={18} color={theme.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder={t('auth.password')}
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
                <Text style={[styles.forgotPasswordText, { color: isDark ? '#60A5FA' : '#2563EB' }]}>{t('auth.forgotPassword') || 'Esqueceu a senha?'}</Text>
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
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.5)', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.4)' },
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
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.5)', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.4)' },
                ]}
                onPress={() => setShowAppleModal(true)}
                accessibilityRole="button"
                accessibilityLabel={t('auth.appleSignIn') || 'Sign in with Apple'}
                activeOpacity={0.8}
              >
                <Apple size={20} color={isDark ? '#FFFFFF' : '#000000'} style={{ marginRight: 10 }} />
                <Text style={[styles.socialButtonTextApple, { color: isDark ? '#FFFFFF' : '#000000' }]}>{t('auth.appleSignIn')}</Text>
              </TouchableOpacity>

              {/* Phone Button */}
              <TouchableOpacity
                style={[styles.socialButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.5)', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.4)' }]}
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

            </BlurView>

          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>

      {/* Apple Login Coming Soon Modal */}
      <ComingSoonModal
        visible={showAppleModal}
        onClose={() => setShowAppleModal(false)}
        title={t('auth.appleComingSoon')}
        message={t('auth.appleComingSoonDesc')}
        icon="apple"
        accentColor="#000000"
      />

      {/* Phone Login Coming Soon Modal */}
      <ComingSoonModal
        visible={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        title={t('auth.phoneComingSoon')}
        message={t('auth.phoneComingSoonDesc')}
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
  themeToggleContainer: {
    position: 'absolute',
    top: 16,
    right: 20,
    zIndex: 10,
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    overflow: 'hidden',
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
  logoSection: { alignItems: 'center', marginTop: 48, marginBottom: 24 },
  logoImage: { width: 88, height: 88, marginBottom: 14 },
  logoGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.3,
  },
  appName: { fontSize: 26, fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  tagline: { fontSize: 14, fontWeight: '400', letterSpacing: 0.2 },

  // ── Form Card (Glass) ────────────────────────────────────────────────────
  formCard: {
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    overflow: 'hidden',
  },
  formCardContent: {
    gap: 0,
  },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 28, lineHeight: 20 },

  // ── Inputs (Glass) ───────────────────────────────────────────────────────
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    marginBottom: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    height: 54,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 15, height: '100%' },
  eyeIcon: { padding: 8 },

  forgotPassword: { alignSelf: 'flex-end', marginBottom: 22 },
  forgotPasswordText: { fontSize: 13, fontWeight: '600' },

  // ── Primary Button ────────────────────────────────────────────────────────
  loginButton: {
    borderRadius: 14, overflow: 'hidden', marginBottom: 22,
  },
  loginButtonDisabled: { opacity: 0.5 },
  loginButtonGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 17,
  },
  loginButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 13, marginHorizontal: 14, fontWeight: '500' },

  // ── Social Buttons (Glass) ────────────────────────────────────────────────
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 15,
    marginBottom: 12,
  },
  googleIcon: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  googleIconText: { fontSize: 13, fontWeight: '800', color: '#4285F4' },
  socialButtonText: { fontSize: 15, fontWeight: '600' },
  socialButtonTextApple: { fontSize: 15, fontWeight: '700' },
  appleButton: { width: '100%', height: 52, marginBottom: 12 },

  registerSection: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  registerText: { fontSize: 14 },
  registerLink: { fontSize: 14, fontWeight: '700', textDecorationLine: 'underline' },

});
