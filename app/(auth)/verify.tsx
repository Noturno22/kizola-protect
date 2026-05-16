/**
 * (auth)/verify.tsx — OTP verification screen.
 * 6 individual boxes, countdown timer, auto-paste, retry.
 */

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, ShieldCheck, RotateCcw } from 'lucide-react-native';
import { useTheme, Theme } from '@/providers/ThemeProvider';
import { OtpInput } from '@/components/auth/OtpInput';
import { usePhoneAuth } from '@/hooks/usePhoneAuth';
import { useAuthStore } from '@/store/authStore';
import { sendVerificationCode } from '@/services/auth/phoneAuthService';

const RESEND_COOLDOWN = 60; // seconds

export default function VerifyScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { verifyCode, isLoading, error, clearError } = usePhoneAuth();
  const pendingPhone = useAuthStore((s) => s.pendingPhone);

  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [resending, setResending] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  // Shake animation on error
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Shake on error
  useEffect(() => {
    if (error) shake();
  }, [error, shake]);

  // Auto-submit when all 6 digits entered
  useEffect(() => {
    if (code.length === 6 && !isLoading) {
      handleVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const handleVerify = useCallback(async () => {
    if (code.length < 6 || isLoading) return;
    if (!pendingPhone) {
      router.replace('/(auth)/login');
      return;
    }
    await verifyCode(pendingPhone, code);
    // On error, clear the code so the user can re-enter
    if (error) setCode('');
  }, [code, isLoading, pendingPhone, verifyCode, router, error]);

  const handleResend = useCallback(async () => {
    if (countdown > 0 || resending || !pendingPhone) return;
    setResendError(null);
    setResending(true);
    try {
      await sendVerificationCode(pendingPhone);
      setCode('');
      setCountdown(RESEND_COOLDOWN);
      if (error) clearError();
    } catch (e: any) {
      setResendError(e.message ?? 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  }, [countdown, resending, pendingPhone, error, clearError]);

  // Formatted phone for display (hide middle digits)
  const displayPhone = pendingPhone
    ? pendingPhone.slice(0, 5) + ' *** ' + pendingPhone.slice(-3)
    : '—';

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <LinearGradient colors={theme.headerGradient as [string, string]} style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.kav}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Back button */}
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <ArrowLeft size={20} color="#fff" />
            </TouchableOpacity>

            {/* Icon header */}
            <View style={styles.iconSection}>
              <View style={[styles.iconWrap, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                <ShieldCheck size={40} color="#fff" />
              </View>
              <Text style={styles.heading}>Verify Your Number</Text>
              <Text style={styles.sub}>
                We sent a 6-digit code to{'\n'}
                <Text style={styles.phone}>{displayPhone}</Text>
              </Text>
            </View>

            {/* Card */}
            <View style={[styles.card, { backgroundColor: theme.surface }]}>
              <Text style={[styles.cardLabel, { color: theme.text }]}>Enter Code</Text>

              {/* OTP boxes */}
              <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
                <OtpInput value={code} onChange={setCode} disabled={isLoading} />
              </Animated.View>

              {/* Error */}
              {(error || resendError) ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error || resendError}</Text>
                </View>
              ) : null}

              {/* Verify button */}
              <TouchableOpacity
                style={[
                  styles.btn,
                  { backgroundColor: theme.primary },
                  (code.length < 6 || isLoading) && styles.btnDisabled,
                ]}
                onPress={handleVerify}
                disabled={code.length < 6 || isLoading}
                activeOpacity={0.85}
                accessibilityLabel="Verify code and sign in"
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnText}>Verify & Sign In</Text>
                )}
              </TouchableOpacity>

              {/* Resend section */}
              <View style={styles.resendRow}>
                {countdown > 0 ? (
                  <Text style={[styles.resendInfo, { color: theme.textMuted }]}>
                    Resend code in{' '}
                    <Text style={[styles.resendTimer, { color: theme.primary }]}>
                      {countdown}s
                    </Text>
                  </Text>
                ) : (
                  <TouchableOpacity
                    style={styles.resendBtn}
                    onPress={handleResend}
                    disabled={resending}
                  >
                    {resending ? (
                      <ActivityIndicator size="small" color={theme.primary} />
                    ) : (
                      <>
                        <RotateCcw size={14} color={theme.primary} />
                        <Text style={[styles.resendText, { color: theme.primary }]}>
                          Resend Code
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>

              {/* Change number */}
              <TouchableOpacity
                style={styles.changeBtn}
                onPress={() => router.replace('/(auth)/login')}
              >
                <Text style={[styles.changeText, { color: theme.textMuted }]}>
                  Wrong number?{' '}
                  <Text style={{ color: theme.primary, fontWeight: '600' }}>Change it</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    root: { flex: 1 },
    gradient: { flex: 1 },
    kav: { flex: 1 },
    scroll: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 32 },

    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
      marginBottom: 4,
    },

    iconSection: { alignItems: 'center', paddingVertical: 24 },
    iconWrap: {
      width: 88,
      height: 88,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    heading: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
    sub: { fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: 6, lineHeight: 22 },
    phone: { fontWeight: '700', color: '#fff' },

    card: {
      borderRadius: 28,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
      elevation: 12,
    },
    cardLabel: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },

    errorBox: {
      backgroundColor: 'rgba(239,68,68,0.1)',
      borderRadius: 10,
      padding: 12,
      marginBottom: 12,
      borderLeftWidth: 3,
      borderLeftColor: '#EF4444',
    },
    errorText: { color: '#EF4444', fontSize: 13, lineHeight: 18 },

    btn: {
      height: 56,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    btnDisabled: { opacity: 0.45 },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

    resendRow: { alignItems: 'center', marginBottom: 16 },
    resendInfo: { fontSize: 14 },
    resendTimer: { fontWeight: '700' },
    resendBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    resendText: { fontSize: 14, fontWeight: '600' },

    changeBtn: { alignItems: 'center', paddingVertical: 4 },
    changeText: { fontSize: 13 },
  });
