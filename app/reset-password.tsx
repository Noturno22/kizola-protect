import { useState, useEffect, useMemo } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
// Ionicons removed
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme, Theme } from '@/providers/ThemeProvider';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Lock, Eye, EyeOff, ShieldCheck, AlertTriangle } from 'lucide-react-native';
import * as Linking from 'expo-linking';
import * as QueryParams from 'expo-auth-session/build/QueryParams';

export default function ResetPassword() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Validate password strength
  const passwordStrength = (() => {
    if (!password) return { score: 0, label: '', color: theme.cardBorderAlt };
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLong = password.length >= 8;
    const score = [hasLower, hasUpper, hasNumber, hasSpecial, isLong].filter(Boolean).length;
    if (score <= 2) return { score, label: t('resetPassword.strengthWeak'), color: '#EF4444' };
    if (score <= 3) return { score, label: t('resetPassword.strengthFair'), color: '#F59E0B' };
    if (score <= 4) return { score, label: t('resetPassword.strengthGood'), color: '#10B981' };
    return { score, label: t('resetPassword.strengthStrong'), color: '#22C55E' };
  })();

  useEffect(() => {
    let cancelled = false;
    let authSub: { unsubscribe: () => void } | null = null;
    let linkSub: { remove: () => void } | null = null;

    // Extract auth tokens from the deep link URL and set the session.
    // This mirrors createSessionFromUrl from login.tsx.
    const trySetSessionFromUrl = async (url: string): Promise<boolean> => {
      try {
        const { params, errorCode } = QueryParams.getQueryParams(url);
        if (errorCode || !params) return false;

        if (params.code) {
          const { error } = await supabase.auth.exchangeCodeForSession(params.code);
          return !error;
        }

        const { access_token, refresh_token } = params;
        if (access_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token: refresh_token || '',
          });
          return !error;
        }
      } catch {
        // Silently fail — will be caught by the timeout error
      }
      return false;
    };

    const bootstrap = async () => {
      if (!isSupabaseConfigured() || cancelled) {
        if (!cancelled) setSessionReady(true);
        return;
      }

      // 1. Handle initial deep link URL (app was opened from email link)
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        const ok = await trySetSessionFromUrl(initialUrl);
        if (ok && !cancelled) {
          setSessionReady(true);
          return;
        }
      }

      // 2. Check if session already exists
      const { data: { session } } = await supabase.auth.getSession();
      if (!cancelled && session) {
        setSessionReady(true);
        return;
      }

      // 3. Listen for auth state change triggered by setSession above
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY' || session) {
          if (!cancelled) setSessionReady(true);
          data.subscription.unsubscribe();
        }
      });
      authSub = data.subscription;

      // 4. Timeout — if no session after 8s, show error
      setTimeout(() => {
        if (!cancelled) {
          setSessionError(t('resetPassword.invalidLink'));
        }
      }, 8000);
    };

    bootstrap();

    // 5. Listen for URL events while the app is already running
    linkSub = Linking.addEventListener('url', async (event) => {
      const ok = await trySetSessionFromUrl(event.url);
      if (ok && !cancelled) setSessionReady(true);
    });

    return () => {
      cancelled = true;
      authSub?.unsubscribe();
      linkSub?.remove();
    };
  }, []);

  const handleResetPassword = async () => {
    if (!password.trim() || !confirmPassword.trim()) {
      Alert.alert(t('common.error'), t('resetPassword.fillAllFields'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('common.error'), t('resetPassword.passwordsMismatch'));
      return;
    }

    if (password.length < 8) {
      Alert.alert(t('common.error'), t('resetPassword.minLengthError'));
      return;
    }

    if (passwordStrength.score < 3) {
      Alert.alert(
        t('resetPassword.weakPasswordTitle'),
        t('resetPassword.weakPasswordMessage')
      );
      return;
    }

    if (!isSupabaseConfigured()) {
      setSuccess(true);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      // Log audit event
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await supabase.from('auth_audit_logs').insert({
            user_id: session.user.id,
            action: 'password_reset_completed',
            resource: 'auth',
            details: { email: session.user.email },
            created_at: new Date().toISOString(),
          });
        }
      } catch {
        // Audit log failure is non-critical
      }

      setSuccess(true);
    } catch (error: any) {
      Alert.alert(
        t('common.error'),
        error.message || t('resetPassword.resetFailed')
      );
    } finally {
      setLoading(false);
    }
  };

  if (sessionError) {
    return (
      <View style={styles.container}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <LinearGradient colors={theme.headerGradient} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.centerContent}>
            <View style={[styles.errorIconWrapper]}>
              <AlertTriangle size={48} color="#EF4444" />
            </View>
            <Text style={[styles.errorTitle, { color: theme.text }]}>{t('resetPassword.invalidLinkTitle')}</Text>
            <Text style={[styles.errorDescription, { color: theme.textSecondary }]}>
              {sessionError}
            </Text>
            <TouchableOpacity
              style={[styles.primaryButton, { overflow: 'hidden' }]}
              onPress={() => router.replace('/forgot-password')}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[theme.primary, theme.primary + 'DD']}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.primaryButtonText}>{t('resetPassword.requestNewLink')}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (success) {
    return (
      <View style={styles.container}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <LinearGradient colors={theme.headerGradient} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.centerContent}>
            <View style={styles.successIconWrapper}>
              <CheckCircle2 size={64} color="#22C55E" />
            </View>
            <Text style={[styles.successTitle, { color: theme.text }]}>{t('resetPassword.successTitle')}</Text>
            <Text style={[styles.successDescription, { color: theme.textSecondary }]}>
              {t('resetPassword.successMessage')}
            </Text>
            <TouchableOpacity
              style={[styles.primaryButton, { overflow: 'hidden' }]}
              onPress={() => router.replace('/login')}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[theme.primary, theme.primary + 'DD']}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.primaryButtonText}>{t('resetPassword.loginButton')}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <LinearGradient
        colors={isDark ? ['#060D1F', '#0A1628', '#0D1F3C'] : ['#EEF2FF', '#F0F9FF', '#FFFFFF']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Icon */}
            <View style={styles.iconSection}>
              <View style={[styles.iconWrapper, { backgroundColor: theme.primary + '15', borderColor: theme.primary + '30' }]}>
                <Lock size={40} color={theme.primary} />
              </View>
            </View>

            {/* Form Card */}
            <View style={[styles.formCard, { backgroundColor: theme.surface, borderColor: theme.cardBorderAlt }]}>
              <Text style={[styles.title, { color: theme.text }]}>{t('resetPassword.newPasswordTitle')}</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                {t('resetPassword.newPasswordSubtitle')}
              </Text>

              {/* Security Note */}
              <View style={[styles.securityNote, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '25' }]}>
                <ShieldCheck size={16} color={theme.primary} />
                <Text style={[styles.securityNoteText, { color: theme.primary }]}>
                  {t('resetPassword.securityNote')}
                </Text>
              </View>

              {/* New Password */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{t('resetPassword.newPasswordLabel')}</Text>
                <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.cardBorderAlt }]}>
                  <Lock size={18} color={theme.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder={t('resetPassword.newPasswordPlaceholder')}
                    placeholderTextColor={theme.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    testID="new-password-input"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    {showPassword
                      ? <EyeOff size={18} color={theme.textMuted} />
                      : <Eye size={18} color={theme.textMuted} />
                    }
                  </TouchableOpacity>
                </View>

                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <View style={styles.strengthContainer}>
                    <View style={styles.strengthBars}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <View
                          key={i}
                          style={[
                            styles.strengthBar,
                            { backgroundColor: i <= passwordStrength.score ? passwordStrength.color : theme.cardBorderAlt }
                          ]}
                        />
                      ))}
                    </View>
                    <Text style={[styles.strengthLabel, { color: passwordStrength.color }]}>
                      {passwordStrength.label}
                    </Text>
                  </View>
                )}
              </View>

              {/* Confirm Password */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{t('resetPassword.confirmPasswordLabel')}</Text>
                <View style={[
                  styles.inputContainer,
                  { backgroundColor: theme.background, borderColor: confirmPassword && confirmPassword !== password ? '#EF4444' : theme.cardBorderAlt }
                ]}>
                  <Lock size={18} color={theme.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder={t('resetPassword.confirmPasswordPlaceholder')}
                    placeholderTextColor={theme.textMuted}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirm}
                    testID="confirm-password-input"
                  />
                  <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeIcon}>
                    {showConfirm
                      ? <EyeOff size={18} color={theme.textMuted} />
                      : <Eye size={18} color={theme.textMuted} />
                    }
                  </TouchableOpacity>
                </View>
                {confirmPassword.length > 0 && confirmPassword !== password && (
                  <Text style={styles.errorText}>{t('resetPassword.passwordsMismatchShort')}</Text>
                )}
                {confirmPassword.length > 0 && confirmPassword === password && (
                  <Text style={styles.successText}>✓ {t('resetPassword.passwordsMatch')}</Text>
                )}
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, (loading || !sessionReady) && styles.submitButtonDisabled]}
                onPress={handleResetPassword}
                disabled={loading || !sessionReady}
                activeOpacity={0.85}
                testID="reset-password-submit"
              >
                <LinearGradient
                  colors={(loading || !sessionReady) ? ['#CBD5E1', '#94A3B8'] : [theme.primary, theme.primary + 'DD']}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : !sessionReady ? (
                  <>
                    <ActivityIndicator color="#FFFFFF" size="small" />
                    <Text style={styles.submitButtonText}>{t('resetPassword.verifyingLink')}</Text>
                  </>
                ) : (
                  <>
                    <Lock size={18} color="#FFFFFF" />
                    <Text style={styles.submitButtonText}>{t('resetPassword.submitButton')}</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backLink}
                onPress={() => router.replace('/forgot-password')}
                activeOpacity={0.7}
              >
                <Text style={[styles.backLinkText, { color: theme.textSecondary }]}>
                  {t('resetPassword.requestNewLinkBottom')}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  safeArea: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconSection: {
    alignItems: 'center',
    marginTop: 48,
    marginBottom: 32,
  },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 32,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  securityNoteText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    height: 54,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15 },
  eyeIcon: { padding: 6 },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '700',
    minWidth: 40,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
  successText: {
    color: '#22C55E',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
  submitButton: {
    borderRadius: 14,
    overflow: 'hidden',
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  backLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  backLinkText: {
    fontSize: 13,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },

  // Error state
  errorIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  errorDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },

  // Success state
  successIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  successDescription: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  primaryButton: {
    borderRadius: 14,
    height: 54,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
