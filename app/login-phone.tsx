import { useState, useMemo } from 'react';
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

const LOGO_URL = 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/rp8ormh5clrs4bxi5u20j.jpg';

export default function LoginPhone() {
  const router = useRouter();
  const { signInWithOtp, verifyOtp } = useAuth();
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [phone, setPhone] = useState('');
  const [token, setToken] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);

  const normalizePhone = (raw: string) => {
    let cleaned = raw.replace(/[^\d+]/g, '').trim();
    return cleaned;
  };

  const handleSendCode = async () => {
    const normalizedPhone = normalizePhone(phone);

    if (!normalizedPhone || normalizedPhone.length < 8) {
      Alert.alert('Error', 'Please enter a valid phone number with country code (e.g. +1234567890)');
      return;
    }

    if (!normalizedPhone.startsWith('+')) {
      Alert.alert('Error', 'Please include the country code starting with + (e.g. +1)');
      return;
    }

    setLoading(true);
    try {
      if (signInWithOtp) {
        await signInWithOtp(normalizedPhone);
        setStep(2);
        Alert.alert('Success', 'SMS sent successfully');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not send SMS');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!token || token.length < 6) {
      Alert.alert('Error', 'Please enter the 6-digit code');
      return;
    }

    setLoading(true);
    try {
      if (verifyOtp) {
        await verifyOtp(normalizePhone(phone), token);
        router.replace('/dashboard');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Invalid code');
    } finally {
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
                <ArrowRight size={24} color={theme.isDark ? "#FFFFFF" : theme.text} style={{ transform: [{ rotate: '180deg' }] }} />
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
              <Text style={styles.tagline}>Phone Verification</Text>
            </View>

            <View style={styles.formContainer}>
              {step === 1 ? (
                <>
                  <Text style={styles.title}>Sign in with Phone</Text>
                  <Text style={styles.subtitle}>Enter your phone number to receive a secure code.</Text>

                  <View style={styles.inputContainer}>
                    <Phone size={20} color={theme.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. +1 234 567 8900"
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
                        <Text style={styles.primaryButtonText}>Send Code</Text>
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
                  <Text style={styles.title}>Verify Code</Text>
                  <Text style={styles.subtitle}>Enter the 6-digit code sent to {phone}</Text>

                  <View style={styles.inputContainer}>
                    <Lock size={20} color={theme.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter 6-digit code"
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
                        <Text style={styles.primaryButtonText}>Verify & Sign In</Text>
                        <ArrowRight size={20} color="#FFFFFF" />
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.resendButton}
                    onPress={() => setStep(1)}
                    disabled={loading}
                  >
                    <Text style={styles.resendText}>Change phone number</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
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
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  logoSection: { alignItems: 'center', marginBottom: 24 },
  logoWrapper: {
    width: 72, height: 72, borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
    overflow: 'hidden',
  },
  logoImage: { width: 64, height: 64 },
  logoText: {
    fontSize: 22, fontWeight: '700', color: '#FFFFFF',
    marginTop: 12, marginBottom: 4,
  },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  formContainer: {
    backgroundColor: theme.surface, borderRadius: 24, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 8,
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
    backgroundColor: theme.background, borderRadius: 12,
    marginBottom: 24, paddingHorizontal: 16,
    borderWidth: 1, borderColor: theme.cardBorderAlt,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, height: 52, fontSize: 16, color: theme.text },
  primaryButton: {
    backgroundColor: theme.primary, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 16, borderRadius: 12, marginBottom: 16,
  },
  primaryButtonDisabled: { opacity: 0.7 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  resendButton: { alignItems: 'center', paddingVertical: 8 },
  resendText: { color: theme.primary, fontSize: 14, fontWeight: '600' },
});
