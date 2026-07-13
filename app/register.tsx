import { useState } from 'react';
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
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Moon, Sun, ArrowLeft, User, Mail, Phone, Lock, EyeOff, Eye, Check, ArrowRight, Apple, Smartphone } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import * as AppleAuthentication from 'expo-apple-authentication';

WebBrowser.maybeCompleteAuthSession();

const LOGO_URL = './assets/images/icon.png';

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

export default function Register() {
  const router = useRouter();
  const { signUp, isDemoMode } = useAuth();
  const { t } = useTranslation();
  const { theme, isDark, toggleTheme } = useTheme();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const D = theme;

  const normalizePhone = (raw: string) => raw.replace(/[^\d+]/g, '').trim();

  const handleRegister = async () => {
    const normalizedPhone = normalizePhone(phone);

    // Validações — apenas nome, email e senha são obrigatórios
    if (!name.trim()) {
      Alert.alert('Erro', 'Por favor insira o seu nome completo.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Erro', 'Por favor insira o seu email.');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Erro', 'Por favor insira uma senha.');
      return;
    }
    if (normalizedPhone && normalizedPhone.replace(/\D/g, '').length < 8) {
      Alert.alert('Erro', 'Número de telemóvel inválido (mínimo 8 dígitos).');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (!agreed) {
      Alert.alert('Erro', 'Por favor aceite os termos e condições.');
      return;
    }

    setLoading(true);
    try {
      console.log('[Register] Iniciando registo para:', email);
      const result = await signUp(email, password, name, normalizedPhone || undefined);
      console.log('[Register] Resultado do signUp:', JSON.stringify({ 
        hasSession: Boolean((result as any)?.session),
        hasUser: Boolean((result as any)?.user),
        isDemoMode,
      }));

      const sessionExists = Boolean((result as any)?.session);

      if (isDemoMode || sessionExists) {
        // Sessão imediata → ir para dashboard
        console.log('[Register] Sessão ativa, redirecionando para dashboard...');
        router.replace('/dashboard');
      } else {
        // Supabase exige confirmação de email
        console.log('[Register] Email de confirmação enviado.');
        Alert.alert(
          'Confirme o seu email ✉️',
          `Enviámos um link de confirmação para ${email.toLowerCase()}.\n\nApós clicar no link, faça login para continuar.`,
          [{ text: 'Ir para Login', onPress: () => router.replace('/login') }]
        );
      }
    } catch (error: any) {
      console.error('[Register] Erro:', error);
      // Traduz erros comuns do Supabase
      let msg = error.message || 'Não foi possível criar a conta.';
      if (msg.includes('already registered') || msg.includes('already been registered')) {
        msg = 'Este email já está registado. Tente fazer login.';
      } else if (msg.includes('Password should be at least')) {
        msg = 'A senha deve ter pelo menos 6 caracteres.';
      } else if (msg.includes('Unable to validate email')) {
        msg = 'Email inválido. Verifique e tente novamente.';
      }
      Alert.alert('Erro no Registo', msg);
    } finally {
      setLoading(false);
    }
  };

  const createSessionFromUrl = async (url: string) => {
    const { params, errorCode } = QueryParams.getQueryParams(url);
    if (errorCode) throw new Error(errorCode);
    
    if (params?.code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(params.code);
      if (error) throw error;
      return data.session;
    }

    const { access_token, refresh_token } = params;
    if (!access_token) return;

    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });
    if (error) throw error;
    return data.session;
  };

  const signUpWithGoogle = async () => {
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
        const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
        if (res.type !== 'success') return;

        const session = await createSessionFromUrl(res.url);
        if (!session) return;

        // Ensure a profile row exists for Google users (they bypass signUp)
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id, plan')
          .eq('id', session.user.id)
          .maybeSingle();

        if (!existingProfile) {
          await supabase.from('profiles').insert({
            id: session.user.id,
            email: session.user.email ?? '',
            full_name: session.user.user_metadata?.full_name ?? session.user.email?.split('@')[0] ?? 'User',
            plan: 'none',
            status: 'inactive',
            role: 'user',
          });
        }

        // Navigate to dashboard
        router.replace('/dashboard');
      }
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const signUpWithApple = async () => {
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

        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        });

        if (error) throw error;

        const session = data?.user;
        if (session) {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id, plan')
            .eq('id', session.id)
            .maybeSingle();

          if (!existingProfile) {
            const fullName = credential.fullName
              ? `${credential.fullName.givenName ?? ''} ${credential.fullName.familyName ?? ''}`.trim()
              : session.email?.split('@')[0] ?? 'User';
            await supabase.from('profiles').insert({
              id: session.id,
              email: session.email ?? '',
              full_name: fullName,
              plan: 'none',
              status: 'inactive',
              role: 'user',
            });
          }
        }

        router.replace('/dashboard');
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
        const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
        if (res.type !== 'success') return;

        const session = await createSessionFromUrl(res.url);
        if (!session) return;

        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id, plan')
          .eq('id', session.user.id)
          .maybeSingle();

        if (!existingProfile) {
          await supabase.from('profiles').insert({
            id: session.user.id,
            email: session.user.email ?? '',
            full_name: session.user.user_metadata?.full_name ?? session.user.email?.split('@')[0] ?? 'User',
            plan: 'none',
            status: 'inactive',
            role: 'user',
          });
        }

        router.replace('/dashboard');
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

        {/* ── Back Button ────────────────────────────────────────────────────── */}
        <TouchableOpacity 
          onPress={() => router.back()} 
          accessibilityRole="button"
          accessibilityLabel={t('common.back') || 'Back'}
          style={[styles.backButton, { backgroundColor: theme.surface, borderColor: theme.cardBorderAlt, shadowColor: '#000' }]}
        >
          <ArrowLeft size={20} color={theme.text} />
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
                <Image source={{ uri: LOGO_URL }} style={styles.logoImage} resizeMode="contain" />
              </View>
              <Text style={[styles.appName, { color: theme.text }]}>Kizola Protect</Text>
              <Text style={[styles.tagline, { color: theme.textSecondary }]}>{t('auth.tagline')}</Text>
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
              <Text style={[styles.title, { color: theme.text }]}>{t('auth.createAccountTitle')}</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{t('auth.signUpSubtitle')}</Text>

              {/* Name */}
              <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.cardBorderAlt }]}>
                <User size={18} color={theme.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder={t('auth.fullName')}
                  placeholderTextColor={theme.textMuted}
                  value={name}
                  onChangeText={setName}
                  testID="name-input"
                />
              </View>

              {/* Email */}
              <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.cardBorderAlt }]}>
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

              {/* Phone */}
              <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.cardBorderAlt }]}>
                <Phone size={18} color={theme.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder={t('auth.phone')}
                  placeholderTextColor={theme.textMuted}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  testID="phone-input"
                />
              </View>

              {/* Password */}
              <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.cardBorderAlt }]}>
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

              {/* Confirm Password */}
              <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.cardBorderAlt }]}>
                <Lock size={18} color={theme.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder={t('auth.confirmPassword')}
                  placeholderTextColor={theme.textMuted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  testID="confirm-password-input"
                />
              </View>

              {/* Terms */}
              <View style={styles.termsContainer}>
                <TouchableOpacity onPress={() => setAgreed(!agreed)} style={styles.checkboxTouchable}>
                  <View style={[styles.checkbox, agreed && { backgroundColor: theme.primary }, { borderColor: theme.primary }]}>
                    {agreed && <Check size={14} color="#FFFFFF" />}
                  </View>
                </TouchableOpacity>
                <Text style={[styles.termsText, { color: theme.textSecondary }]}>
                  {t('auth.iAgreeTo')}{' '}
                  <Text style={[styles.termsLink, { color: theme.primary }]} onPress={() => router.push('/terms')}>{t('auth.termsOfService')}</Text>{' '}
                  {t('auth.and')}{' '}
                  <Text style={[styles.termsLink, { color: theme.primary }]} onPress={() => router.push('/privacy')}>{t('auth.privacyPolicy')}</Text>
                </Text>
              </View>

              {/* Register Button */}
              <TouchableOpacity
                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                onPress={handleRegister}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel={t('auth.register') || 'Register'}
                testID="register-button"
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
                      <Text style={styles.loginButtonText}>{t('auth.register')}</Text>
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
                onPress={signUpWithGoogle}
                disabled={googleLoading}
                accessibilityRole="button"
                accessibilityLabel={t('auth.googleSignUp') || 'Sign up with Google'}
                activeOpacity={0.8}
              >
                {googleLoading ? (
                  <ActivityIndicator color={theme.text} />
                ) : (
                  <>
                    <View style={styles.googleIcon}>
                      <Text style={styles.googleIconText}>G</Text>
                    </View>
                    <Text style={[styles.socialButtonText, { color: theme.text }]}>{t('auth.googleSignUp')}</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Apple Button */}
              {Platform.OS === 'ios' ? (
                <AppleAuthentication.AppleAuthenticationButton
                  buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP}
                  buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                  cornerRadius={12}
                  style={styles.appleButton}
                  onPress={signUpWithApple}
                />
              ) : (
                <TouchableOpacity
                  style={[
                    styles.socialButton,
                    { backgroundColor: '#000000', borderColor: '#333333' },
                    appleLoading && styles.loginButtonDisabled,
                  ]}
                  onPress={signUpWithApple}
                  disabled={appleLoading}
                  accessibilityRole="button"
                  accessibilityLabel={t('auth.appleSignIn') || 'Sign up with Apple'}
                  activeOpacity={0.8}
                >
                  {appleLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Apple size={20} color="#FFFFFF" style={{ marginRight: 10 }} />
                      <Text style={[styles.socialButtonTextApple, { color: '#FFFFFF' }]}>{t('auth.appleSignIn')}</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {/* Phone Login Button */}
              <TouchableOpacity
                style={[styles.socialButton, { backgroundColor: theme.surface, borderColor: theme.cardBorderAlt }]}
                onPress={() => router.push('/login-phone')}
                accessibilityRole="button"
                accessibilityLabel={t('auth.phoneSignIn') || 'Sign in with phone number'}
                activeOpacity={0.8}
              >
                <Smartphone size={18} color={theme.text} style={{ marginRight: 10 }} />
                <Text style={[styles.socialButtonText, { color: theme.text }]}>{t('auth.phoneSignIn')}</Text>
              </TouchableOpacity>

              {/* Login Section */}
              <View style={styles.registerSection} accessible={true} accessibilityLabel={t('auth.alreadyHaveAccount') || 'Already have an account'}>
                <Text style={[styles.registerText, { color: theme.textSecondary }]}>{t('auth.alreadyHaveAccount')}</Text>
                <TouchableOpacity onPress={() => router.push('/login')} accessibilityRole="link" accessibilityLabel={t('auth.signIn') || 'Sign in'}>
                  <Text style={[styles.registerLink, { color: theme.primary }]}>{t('auth.signIn')}</Text>
                </TouchableOpacity>
              </View>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 32 },

  // ── Back Button ───────────────────────────────────────────────────────────
  backButton: {
    position: 'absolute',
    top: 16,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },

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

  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingRight: 10,
  },
  checkboxTouchable: {
    marginRight: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  termsLink: {
    fontWeight: '600',
  },

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

  registerSection: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  registerText: { fontSize: 13 },
  registerLink: { fontSize: 13, fontWeight: '600', textDecorationLine: 'underline' },
});
