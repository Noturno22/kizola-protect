import { useState, useMemo } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme, Theme } from '@/providers/ThemeProvider';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Mail, ArrowLeft, ShieldCheck } from 'lucide-react-native';

export default function ForgotPassword() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendReset = async () => {
    if (!email.trim()) {
      Alert.alert(
        t('common.error') || 'Erro',
        t('auth.emailRequired') || 'Por favor, insira o seu endereço de email.'
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert(
        t('common.error') || 'Erro',
        t('auth.invalidEmail') || 'Por favor, insira um email válido.'
      );
      return;
    }

    if (!isSupabaseConfigured()) {
      // Demo mode — simular envio
      setSent(true);
      return;
    }

    setLoading(true);
    try {
      // Construct redirect URL for deep linking back into app
      const redirectTo = Platform.OS === 'web'
        ? `${window.location.origin}/reset-password`
        : 'kizola://reset-password';

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });

      if (error) {
        // Supabase returns success even for non-existent emails (security best practice)
        // so only throw on genuine errors
        if (error.status !== 400) {
          throw error;
        }
      }

      // Log audit event
      try {
        await supabase.from('auth_audit_logs').insert({
          action: 'password_reset_requested',
          resource: 'auth',
          details: { email: email.trim() },
          created_at: new Date().toISOString(),
        });
      } catch {
        // Audit log failure is non-critical
      }

      setSent(true);
    } catch (error: any) {
      Alert.alert(
        t('common.error') || 'Erro',
        error.message || t('auth.resetFailed') || 'Falha ao enviar email de recuperação. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <View style={styles.container}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <LinearGradient colors={theme.headerGradient} style={StyleSheet.absoluteFillObject} />
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.successContainer}>
            <View style={styles.successContent}>
              <View style={styles.successIconWrapper}>
                <CheckCircle2 size={64} color="#22C55E" />
              </View>
              <Text style={styles.successTitle}>
                {t('auth.emailSent') || 'Email Enviado!'}
              </Text>
              <Text style={styles.successDescription}>
                {t('auth.emailSentDesc') || `Enviámos um link de recuperação para ${email}. Verifique a sua caixa de entrada e a pasta de spam.`}
              </Text>

              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Mail size={18} color={theme.accent} />
                  <Text style={styles.infoText}>
                    {t('auth.checkInbox') || 'Verifique a sua caixa de entrada'}
                  </Text>
                </View>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <ShieldCheck size={18} color={theme.accent} />
                  <Text style={styles.infoText}>
                    {t('auth.linkExpires') || 'O link expira em 1 hora por segurança'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.replace('/login')}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[theme.primary, theme.primary + 'DD']}
                  style={StyleSheet.absoluteFillObject}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
                <Text style={styles.primaryButtonText}>
                  {t('auth.backToLogin') || 'Voltar ao Login'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setSent(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.secondaryButtonText}>
                  {t('auth.resendEmail') || 'Reenviar Email'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <LinearGradient
        colors={isDark ? ['#060D1F', '#0A1628', '#0D1F3C'] : ['#EEF2FF', '#F0F9FF', '#FFFFFF']}
        style={StyleSheet.absoluteFillObject}
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
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <ArrowLeft size={20} color={theme.text} />
              <Text style={styles.backButtonText}>{t('common.back') || 'Voltar'}</Text>
            </TouchableOpacity>

            {/* Icon */}
            <View style={styles.iconSection}>
              <View style={[styles.iconWrapper, { backgroundColor: theme.primary + '15', borderColor: theme.primary + '30' }]}>
                <Mail size={40} color={theme.primary} />
              </View>
            </View>

            {/* Form Card */}
            <View style={[styles.formCard, { backgroundColor: theme.surface, borderColor: theme.cardBorderAlt }]}>
              <Text style={[styles.title, { color: theme.text }]}>
                {t('auth.forgotPassword') || 'Recuperar Conta'}
              </Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                {t('auth.forgotPasswordDesc') || 'Insira o email associado à sua conta. Enviaremos um link para criar uma nova senha.'}
              </Text>

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                  {t('support.emailLabel') || 'Email'}
                </Text>
                <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.cardBorderAlt }]}>
                  <Ionicons name="mail-outline" size={18} color={theme.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder={t('auth.emailPlaceholder') || 'exemplo@email.com'}
                    placeholderTextColor={theme.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    testID="forgot-password-email"
                  />
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSendReset}
                disabled={loading}
                activeOpacity={0.85}
                testID="forgot-password-submit"
              >
                <LinearGradient
                  colors={loading ? ['#CBD5E1', '#94A3B8'] : [theme.primary, theme.primary + 'DD']}
                  style={StyleSheet.absoluteFillObject}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Mail size={18} color="#FFFFFF" />
                    <Text style={styles.submitButtonText}>
                      {t('auth.sendResetLink') || 'Enviar Link de Recuperação'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Back to Login */}
              <View style={styles.backToLogin}>
                <Text style={[styles.backToLoginText, { color: theme.textSecondary }]}>
                  {t('auth.rememberedPassword') || 'Lembrou a senha?'}
                </Text>
                <TouchableOpacity onPress={() => router.back()}>
                  <Text style={[styles.backToLoginLink, { color: theme.primary }]}>
                    {' '}{t('auth.signIn') || 'Entrar'}
                  </Text>
                </TouchableOpacity>
              </View>
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 16,
    paddingBottom: 8,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
  },
  iconSection: {
    alignItems: 'center',
    marginTop: 40,
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
    marginBottom: 28,
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
  submitButton: {
    borderRadius: 14,
    overflow: 'hidden',
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
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
  backToLogin: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backToLoginText: { fontSize: 14 },
  backToLoginLink: { fontSize: 14, fontWeight: '700' },

  // Success state
  successContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  successContent: {
    alignItems: 'center',
  },
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
    color: theme.text,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  successDescription: {
    fontSize: 15,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  infoCard: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: theme.cardBorderAlt,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  infoDivider: {
    height: 1,
    backgroundColor: theme.cardBorderAlt,
  },
  infoText: {
    fontSize: 14,
    color: theme.text,
    flex: 1,
    lineHeight: 20,
  },
  primaryButton: {
    borderRadius: 14,
    overflow: 'hidden',
    height: 54,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
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
  secondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  secondaryButtonText: {
    color: theme.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
});
