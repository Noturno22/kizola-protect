import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { ArrowLeft, AlertTriangle } from 'lucide-react-native';

const DELETION_REASONS = [
  { value: 'too_expensive' },
  { value: 'missing_features' },
  { value: 'not_helpful' },
  { value: 'privacy' },
  { value: 'duplicate' },
  { value: 'other' },
];

export default function DeleteAccount() {
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { user, signOut, isDemoMode } = useAuth();
  const [confirmed, setConfirmed] = useState(false);
  const [reason, setReason] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirmed) {
      setError(t('profile.deleteAccount.confirmError'));
      return;
    }
    setLoading(true);
    setError(null);

    try {
      if (isDemoMode) {
        await signOut();
        Alert.alert(t('profile.deleteAccount.alertDeletedTitle'), t('profile.deleteAccount.alertDeletedDemo'));
        router.replace('/login');
        return;
      }

      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;

      if (!accessToken) {
        throw new Error(t('profile.deleteAccount.noSession'));
      }

      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
      const response = await fetch(`${supabaseUrl}/functions/v1/delete-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
        },
        body: JSON.stringify({ reason, userId: user?.id }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || t('profile.deleteAccount.deleteFailed'));
      }

      await signOut();
      Alert.alert(
        t('profile.deleteAccount.alertDeletedTitle'),
        t('profile.deleteAccount.alertDeletedDesc'),
        [{ text: t('profile.deleteAccount.alertOk'), onPress: () => router.replace('/login') }]
      );
    } catch (err: any) {
      setError(err.message || t('profile.deleteAccount.genericError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>{t('profile.deleteAccount.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.warningCard, { backgroundColor: theme.error + '15', borderColor: theme.error + '30' }]}>
          <AlertTriangle size={24} color={theme.error} />
          <Text style={[styles.warningText, { color: theme.textSecondary }]}>
            {t('profile.deleteAccount.warning')}
          </Text>
        </View>

        {error && (
          <View style={[styles.errorBox, { backgroundColor: theme.error + '20' }]}>
            <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
          </View>
        )}

        <Text style={[styles.label, { color: theme.text }]}>{t('profile.deleteAccount.reasonLabel')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reasonsRow}>
          {DELETION_REASONS.map((r) => (
            <TouchableOpacity
              key={r.value}
              style={[
                styles.reasonChip,
                {
                  backgroundColor: reason === r.value ? theme.primary + '20' : theme.surface,
                  borderColor: reason === r.value ? theme.primary : theme.cardBorderAlt,
                },
              ]}
              onPress={() => setReason(r.value)}
              accessibilityRole="button"
              accessibilityLabel={t(`profile.deleteAccount.reasons.${r.value}`)}
            >
              <Text style={{ color: reason === r.value ? theme.primary : theme.textSecondary, fontSize: 13 }}>
                {t(`profile.deleteAccount.reasons.${r.value}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.label, { color: theme.text }]}>
          {t('profile.deleteAccount.passwordLabel')}
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.cardBorderAlt, color: theme.text }]}
          placeholder={t('profile.deleteAccount.passwordPlaceholder')}
          placeholderTextColor={theme.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
          accessibilityLabel="Enter your password to confirm deletion"
          accessibilityHint="Type your account password to authorize account deletion"
        />

        <TouchableOpacity
          style={[
            styles.confirmRow,
            { opacity: confirmed ? 1 : 0.6 },
          ]}
          onPress={() => setConfirmed(!confirmed)}
          accessibilityRole="button"
          accessibilityLabel={confirmed ? 'Confirmed' : 'Tap to confirm account deletion'}
        >
          <View
            style={[
              styles.checkbox,
              {
                backgroundColor: confirmed ? theme.error : 'transparent',
                borderColor: confirmed ? theme.error : theme.cardBorderAlt,
              },
            ]}
          >
            {confirmed && <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>✓</Text>}
          </View>
          <Text style={[styles.confirmLabel, { color: theme.textSecondary }]}>
            {t('profile.deleteAccount.confirmLabel')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: theme.error, opacity: loading ? 0.6 : 1 }]}
          onPress={handleDelete}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Permanently delete my account"
          accessibilityHint="Double tap to permanently delete your account and all data"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.deleteButtonText}>{t('profile.deleteAccount.deleteButton')}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Cancel and go back"
        >
          <Text style={[styles.cancelText, { color: theme.primary }]}>{t('profile.deleteAccount.cancelButton')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: { fontSize: 18, fontWeight: '700' },
  content: { padding: 20, paddingBottom: 60 },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  warningText: { flex: 1, fontSize: 14, lineHeight: 20 },
  errorBox: {
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  errorText: { fontSize: 14, fontWeight: '500' },
  label: { fontSize: 15, fontWeight: '600', marginBottom: 10, marginTop: 16 },
  input: {
    borderRadius: 12,
    borderWidth: 1.5,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  reasonsRow: { marginBottom: 4 },
  reasonChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 8,
  },
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
    marginBottom: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmLabel: { flex: 1, fontSize: 14, lineHeight: 20 },
  deleteButton: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  deleteButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  cancelButton: { alignItems: 'center', paddingVertical: 12 },
  cancelText: { fontSize: 15, fontWeight: '600' },
});
