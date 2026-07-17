import { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Phone, Lock, ArrowRight, ShieldCheck } from 'lucide-react-native';
import { useTheme, Theme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import { BlurView } from 'expo-blur';
import { useTranslation } from 'react-i18next';

const LOGO_URL = './assets/images/icon.png';

export default function LoginPhone() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signInWithOtp, verifyOtp, signInDemo, isDemoMode, user } = useAuth();
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [phone, setPhone] = useState('');
  const [token, setToken] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isDemoMode && user) {
      router.replace('/dashboard');
    }
  }, [isDemoMode, user]);

  const normalizePhone = (raw: string) => {
    let cleaned = raw.replace(/[^\d+]/g, '').trim();
    return cleaned;
  };

  const handleSendCode = async () => {
    const normalizedPhone = normalizePhone(phone);

    if (!normalizedPhone || normalizedPhone.length < 8) {
      Alert.alert(t('auth.error'), t('auth.invalidPhone'));
      return;
    }

    if (!normalizedPhone.startsWith('+')) {
      Alert.alert(t('auth.error'), t('auth.phoneCountryCodeRequired'));
      return;
    }

    setLoading(true);
    try {
      if (signInWithOtp) {
        await signInWithOtp(normalizedPhone);
        setStep(2);
        Alert.alert(t('auth.success') || 'Success', t('auth.smsSent'));
      }
    } catch (error: any) {
      Alert.alert(t('auth.error'), error.message || t('auth.couldNotSendSms'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!token || token.length < 6) {
      Alert.alert(t('auth.error'), t('auth.enterSixDigitCode'));
      return;
    }

    setLoading(true);
    try {
      if (verifyOtp) {
        await verifyOtp(normalizePhone(phone), token);
        router.replace('/dashboard');
      }
    } catch (error: any) {
      Alert.alert(t('auth.error'), error.message || t('auth.invalidCode'));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoMode = async () => {
    setLoading(true);
    try {
      await signInDemo();
    } catch (error: any) {
      Alert.alert(t('auth.error'), error.message || t('auth.demoModeFailed'));
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <LinearGradient colors={theme.headerGradient} style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <BlurView
                  intensity={40}
                  tint="dark"
                  style={{ width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}
                >
                  <ArrowRight size={24} color="#FFFFFF" style={{ transform: [{ rotate: '180deg' }] }} />
            </BlurView>

            <TouchableOpacity
              style={styles.demoButton}
              onPress={handleDemoMode}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel={t('auth.demoModeA11y')}
              activeOpacity={0.7}
            >
              <Text style={styles.demoButtonText}>
                {t('auth.demoMode')}
              </Text>
            </TouchableOpacity>
              </TouchableOpacity>
            </View>

            <View style={styles.logoSection}>
              <View style={styles.logoWrapper}>
                <Image
                  source={{ uri: LOGO_URL }}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.logoText}>Kizola Protect</Text>
              <Text style={styles.tagline}>{t('auth.phoneVerification')}</Text>
            </View>

            <BlurView
              intensity={theme.isDark ? 30 : 50}
              tint={theme.isDark ? 'dark' : 'light'}
              style={[
                styles.formContainer,
                {
                  borderColor: theme.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.45)',
                },
              ]}
            >
              {step === 1 ? (
                <>
                  <Text style={styles.title}>{t('auth.signInWithPhone')}</Text>
                  <Text style={styles.subtitle}>{t('auth.enterPhoneSubtitle')}</Text>

                  <View style={[styles.inputContainer, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.5)', borderColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.4)' }]}>
                    <Phone size={20} color={theme.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder={t('auth.phonePlaceholder')}
                      placeholderTextColor={theme.textMuted}
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                    />
                  </View>

                  <TouchableOpacity
                    style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
                    onPress={handleSendCode}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <>
                        <Text style={styles.primaryButtonText}>{t('auth.sendCode')}</Text>
                        <ArrowRight size={20} color="#FFFFFF" />
                      </>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={{ alignItems: 'center', marginBottom: 20 }}>
                    <ShieldCheck size={48} color={theme.primary} />
                  </View>
                  <Text style={styles.title}>{t('auth.verifyCode')}</Text>
                  <Text style={styles.subtitle}>{t('auth.enterCodeSentTo', { phone })}</Text>

                  <View style={[styles.inputContainer, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.5)', borderColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.4)' }]}>
                    <Lock size={20} color={theme.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder={t('auth.codePlaceholder')}
                      placeholderTextColor={theme.textMuted}
                      value={token}
                      onChangeText={setToken}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </View>

                  <TouchableOpacity
                    style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
                    onPress={handleVerifyCode}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <>
                        <Text style={styles.primaryButtonText}>{t('auth.verifyAndSignIn')}</Text>
                        <ArrowRight size={20} color="#FFFFFF" />
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.resendButton}
                    onPress={() => setStep(1)}
                    disabled={loading}
                  >
                    <Text style={styles.resendText}>{t('auth.changePhoneNumber')}</Text>
                  </TouchableOpacity>
                </>
              )}
            </BlurView>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 24 },
  header: { marginBottom: 8 },
  backButton: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden',
  },
  logoSection: { alignItems: 'center', marginBottom: 24 },
  logoWrapper: {
    width: 72, height: 72, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  logoImage: { width: 64, height: 64 },
  logoText: {
    fontSize: 22, fontWeight: '700', color: '#FFFFFF',
    marginTop: 12, marginBottom: 4,
  },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  formContainer: {
    borderRadius: 24, padding: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  title: {
    fontSize: 24, fontWeight: '700', color: theme.text,
    marginBottom: 8, textAlign: 'center',
  },
  subtitle: {
    fontSize: 14, color: theme.textSecondary,
    marginBottom: 24, textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14,
    marginBottom: 24, paddingHorizontal: 16,
    borderWidth: 1, height: 54,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, height: '100%', fontSize: 16, color: theme.text },
  primaryButton: {
    backgroundColor: theme.primary, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 17, borderRadius: 14, marginBottom: 16,
  },
  primaryButtonDisabled: { opacity: 0.7 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  resendButton: { alignItems: 'center', paddingVertical: 8 },
  resendText: { color: theme.primary, fontSize: 14, fontWeight: '600' },
  demoButton: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 20,
  },
  demoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.primary,
    textDecorationLine: 'underline',
  },
});
