import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import {
  Home,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Building2,
  FileText,
  ChevronDown,
  Send,
  Sparkles,
  Users,
} from 'lucide-react-native';
import { useTheme, Theme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useNotifications } from '@/providers/NotificationProvider';
import { getSecureItem, setSecureItem, SECURE_KEYS } from '@/lib/secureStorage';
import { useTranslation } from 'react-i18next';
import { useOffline } from '@/providers/OfflineProvider';
import { syncQueue } from '@/lib/syncQueue';

export default function HousingSupport() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { addNotification } = useNotifications();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isConnected } = useOffline();

  const HOUSING_NEEDS = [
    { id: 'rental_search', label: t('housingForm.need_rental_search'), icon: '🏠' },
    { id: 'voucher_housing', label: t('housingForm.need_voucher_housing'), icon: '🎫' },
    { id: 'section8', label: t('housingForm.need_section8'), icon: '📋' },
    { id: 'shelter_move', label: t('housingForm.need_shelter_move'), icon: '🏢' },
    { id: 'housing_program', label: t('housingForm.need_housing_program'), icon: '📋' },
    { id: 'tenant_rights', label: t('housingForm.need_tenant_rights'), icon: '⚖️' },
    { id: 'emergency', label: t('housingForm.need_emergency'), icon: '🆘' },
    { id: 'other', label: t('housingForm.need_other'), icon: '💬' },
  ];

  const CURRENT_SITUATIONS = [
    { id: 'homeless', label: t('housingForm.situation_homeless') },
    { id: 'shelter', label: t('housingForm.situation_shelter') },
    { id: 'unstable', label: t('housingForm.situation_unstable') },
    { id: 'eviction', label: t('housingForm.situation_eviction') },
    { id: 'overcrowded', label: t('housingForm.situation_overcrowded') },
    { id: 'temporary', label: t('housingForm.situation_temporary') },
    { id: 'rental', label: t('housingForm.situation_rental') },
    { id: 'voucher_waitlist', label: t('housingForm.situation_voucher_waitlist') },
    { id: 'voucher_active', label: t('housingForm.situation_voucher_active') },
    { id: 'other', label: t('housingForm.situation_other') },
  ];

  const [nome, setNome] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [estado, setEstado] = useState('');
  const [cidade, setCidade] = useState('');
  const [situacaoAtual, setSituacaoAtual] = useState('');
  const [necessidade, setNecessidade] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showSituationDropdown, setShowSituationDropdown] = useState(false);
  const [showNeedDropdown, setShowNeedDropdown] = useState(false);

  const handleSubmit = async () => {
    if (!nome.trim() || !estado.trim() || !cidade.trim() || !situacaoAtual || !necessidade) {
      Alert.alert(t('housingForm.requiredFieldsTitle'), t('housingForm.requiredFieldsMessage'));
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        user_id: user?.id,
        nome: nome.trim(),
        email: email.trim() || user?.email || '',
        estado: estado.trim(),
        cidade: cidade.trim(),
        situacao_atual: situacaoAtual,
        necessidade,
        observacoes: observacoes.trim() || null,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (!isSupabaseConfigured()) {
        // Demo mode — save locally
        const existing = await getSecureItem<object[]>(SECURE_KEYS.HOUSING_REQUESTS(user?.id ?? ''));
        const requests = existing || [];
        requests.unshift({ ...requestData, id: 'demo-housing-' + Date.now() });
        await setSecureItem(SECURE_KEYS.HOUSING_REQUESTS(user?.id ?? ''), requests);
      } else if (!isConnected) {
        await syncQueue.enqueue('housing_request', requestData);
        addNotification({
          title: 'offline.queuedTitle',
          message: 'offline.queuedMessage',
          type: 'info',
          read: false,
        });
      } else {
        const { error } = await supabase.from('housing_requests').insert(requestData);
        if (error) throw error;

        // Audit log (fire-and-forget, non-critical)
        supabase.from('auth_audit_logs').insert({
          user_id: user?.id,
          action: 'housing_request_submitted',
          resource: 'housing_requests',
          details: { necessidade, estado, cidade },
        });
      }

      addNotification({
        title: 'housingForm.notificationTitle',
        message: 'housingForm.notificationMessage',
        type: 'success',
        read: false,
      });

      setSubmitted(true);
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || t('housingForm.submitError'));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <View style={styles.container}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <LinearGradient colors={theme.headerGradient} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.successContainer}>
            <View style={styles.successContent}>
              <View style={styles.successIconWrapper}>
                <CheckCircle2 size={64} color="#22C55E" />
              </View>
              <Text style={[styles.successTitle, { color: theme.text }]}>{t('housingForm.submittedTitle')}</Text>
              <Text style={[styles.successDescription, { color: theme.textSecondary }]}>
                {t('housingForm.submittedDesc')}
              </Text>

              <View style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.cardBorderAlt }]}>
                <View style={styles.infoRow}>
                  <Sparkles size={18} color={theme.accent} />
                  <Text style={[styles.infoText, { color: theme.text }]}>
                    {t('housingForm.responseTime')}
                  </Text>
                </View>
                <View style={[styles.infoDivider, { backgroundColor: theme.cardBorderAlt }]} />
                <View style={styles.infoRow}>
                  <Users size={18} color={theme.accent} />
                  <Text style={[styles.infoText, { color: theme.text }]}>
                    {t('housingForm.specialistsAvailable')}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, { overflow: 'hidden' }]}
                onPress={() => router.replace('/dashboard')}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[theme.primary, theme.primary + 'DD']}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.primaryButtonText}>{t('housingForm.backToHome')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setSubmitted(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.secondaryButtonText, { color: theme.textSecondary }]}>
                  {t('housingForm.submitNewRequest')}
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

      {/* Header Gradient */}
      <LinearGradient
        colors={theme.headerGradient}
        locations={[0, 0.35, 0.55]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft size={20} color={isDark ? '#FFFFFF' : theme.text} />
              <Text style={[styles.backButtonText, { color: isDark ? '#FFFFFF' : theme.text }]}>{t('common.back')}</Text>
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerIconWrapper}>
                <Home size={36} color={isDark ? '#FFFFFF' : theme.accent} />
              </View>
              <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : theme.text }]}>
                {t('housingForm.title')}
              </Text>
              <Text style={[styles.headerSubtitle, { color: isDark ? 'rgba(255,255,255,0.8)' : theme.textSecondary }]}>
                {t('housingForm.subtitle')}
              </Text>
            </View>

            {/* Form */}
            <View style={[styles.formCard, { backgroundColor: theme.surface, borderColor: theme.cardBorderAlt }]}>
              <Text style={[styles.formTitle, { color: theme.text }]}>{t('housingForm.formTitle')}</Text>
              <Text style={[styles.formSubtitle, { color: theme.textSecondary }]}>
                {t('housingForm.requiredFieldsNote')}
              </Text>

              {/* Nome */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{t('housingForm.fullNameLabel')}</Text>
                <View style={[styles.inputWrapper, { backgroundColor: theme.background, borderColor: theme.cardBorderAlt }]}>
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder={t('housingForm.fullNamePlaceholder')}
                    placeholderTextColor={theme.textMuted}
                    value={nome}
                    onChangeText={setNome}
                  />
                </View>
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{t('housingForm.emailLabel')}</Text>
                <View style={[styles.inputWrapper, { backgroundColor: theme.background, borderColor: theme.cardBorderAlt }]}>
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder={t('housingForm.emailPlaceholder')}
                    placeholderTextColor={theme.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Estado e Cidade (Row) */}
              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{t('housingForm.stateLabel')}</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: theme.background, borderColor: theme.cardBorderAlt }]}>
                    <MapPin size={16} color={theme.textMuted} style={{ marginRight: 8 }} />
                    <TextInput
                      style={[styles.input, { color: theme.text }]}
                      placeholder={t('housingForm.statePlaceholder')}
                      placeholderTextColor={theme.textMuted}
                      value={estado}
                      onChangeText={setEstado}
                    />
                  </View>
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{t('housingForm.cityLabel')}</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: theme.background, borderColor: theme.cardBorderAlt }]}>
                    <Building2 size={16} color={theme.textMuted} style={{ marginRight: 8 }} />
                    <TextInput
                      style={[styles.input, { color: theme.text }]}
                      placeholder={t('housingForm.cityPlaceholder')}
                      placeholderTextColor={theme.textMuted}
                      value={cidade}
                      onChangeText={setCidade}
                    />
                  </View>
                </View>
              </View>

              {/* Situação Atual — Dropdown */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{t('housingForm.currentSituationLabel')}</Text>
                <TouchableOpacity
                  style={[styles.dropdownButton, { backgroundColor: theme.background, borderColor: theme.cardBorderAlt }]}
                  onPress={() => { setShowSituationDropdown(!showSituationDropdown); setShowNeedDropdown(false); }}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.dropdownText,
                    { color: situacaoAtual ? theme.text : theme.textMuted }
                  ]}>
                    {situacaoAtual
                      ? CURRENT_SITUATIONS.find(s => s.id === situacaoAtual)?.label
                      : t('housingForm.selectSituation')
                    }
                  </Text>
                  <ChevronDown size={18} color={theme.textMuted} style={{ transform: [{ rotate: showSituationDropdown ? '180deg' : '0deg' }] }} />
                </TouchableOpacity>

                {showSituationDropdown && (
                  <View style={[styles.dropdownMenu, { backgroundColor: theme.surface, borderColor: theme.cardBorderAlt }]}>
                    {CURRENT_SITUATIONS.map(s => (
                      <TouchableOpacity
                        key={s.id}
                        style={[styles.dropdownItem, situacaoAtual === s.id && { backgroundColor: theme.primary + '15' }]}
                        onPress={() => { setSituacaoAtual(s.id); setShowSituationDropdown(false); }}
                      >
                        <Text style={[styles.dropdownItemText, { color: situacaoAtual === s.id ? theme.primary : theme.text }]}>
                          {s.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Necessidade — Dropdown */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{t('housingForm.needTypeLabel')}</Text>
                <TouchableOpacity
                  style={[styles.dropdownButton, { backgroundColor: theme.background, borderColor: theme.cardBorderAlt }]}
                  onPress={() => { setShowNeedDropdown(!showNeedDropdown); setShowSituationDropdown(false); }}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.dropdownText,
                    { color: necessidade ? theme.text : theme.textMuted }
                  ]}>
                    {necessidade
                      ? HOUSING_NEEDS.find(n => n.id === necessidade)?.label
                      : t('housingForm.selectNeed')
                    }
                  </Text>
                  <ChevronDown size={18} color={theme.textMuted} style={{ transform: [{ rotate: showNeedDropdown ? '180deg' : '0deg' }] }} />
                </TouchableOpacity>

                {showNeedDropdown && (
                  <View style={[styles.dropdownMenu, { backgroundColor: theme.surface, borderColor: theme.cardBorderAlt }]}>
                    {HOUSING_NEEDS.map(n => (
                      <TouchableOpacity
                        key={n.id}
                        style={[styles.dropdownItem, necessidade === n.id && { backgroundColor: theme.primary + '15' }]}
                        onPress={() => { setNecessidade(n.id); setShowNeedDropdown(false); }}
                      >
                        <Text style={styles.dropdownItemEmoji}>{n.icon}</Text>
                        <Text style={[styles.dropdownItemText, { color: necessidade === n.id ? theme.primary : theme.text }]}>
                          {n.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Observações */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{t('housingForm.additionalNotesLabel')}</Text>
                <View style={[styles.inputWrapper, styles.textAreaWrapper, { backgroundColor: theme.background, borderColor: theme.cardBorderAlt }]}>
                  <FileText size={16} color={theme.textMuted} style={{ alignSelf: 'flex-start', marginTop: 2, marginRight: 8 }} />
                  <TextInput
                    style={[styles.input, styles.textArea, { color: theme.text }]}
                    placeholder={t('housingForm.additionalNotesPlaceholder')}
                    placeholderTextColor={theme.textMuted}
                    value={observacoes}
                    onChangeText={setObservacoes}
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                  />
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={loading ? ['#CBD5E1', '#94A3B8'] : [theme.primary, theme.primary + 'DD']}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Send size={18} color="#FFFFFF" />
                    <Text style={styles.submitButtonText}>{t('housingForm.submitButton')}</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Info Note */}
              <View style={[styles.privacyNote, { backgroundColor: theme.background, borderColor: theme.cardBorderAlt }]}>
                <Text style={[styles.privacyNoteText, { color: theme.textSecondary }]}>
                  {t('housingForm.privacyNote')}
                </Text>
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
  scrollContent: { flexGrow: 1 },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    alignSelf: 'flex-start',
  },
  backButtonText: { fontSize: 15, fontWeight: '600' },

  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 48,
    alignItems: 'center',
  },
  headerIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },

  formCard: {
    marginHorizontal: 16,
    marginTop: -24,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 6,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 13,
    marginBottom: 24,
  },

  rowInputs: {
    flexDirection: 'row',
  },
  inputGroup: { marginBottom: 18 },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    height: 52,
  },
  input: { flex: 1, fontSize: 15 },
  textAreaWrapper: { height: 120, alignItems: 'flex-start', paddingVertical: 12 },
  textArea: { height: 90 },

  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    height: 52,
  },
  dropdownText: { fontSize: 15, flex: 1 },
  dropdownMenu: {
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.cardBorderAlt,
    gap: 10,
  },
  dropdownItemEmoji: { fontSize: 18 },
  dropdownItemText: { fontSize: 15, fontWeight: '500', flex: 1 },

  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 56,
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
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  privacyNote: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  privacyNoteText: { fontSize: 13, lineHeight: 18, textAlign: 'center' },

  // Success state
  successContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  successContent: { alignItems: 'center' },
  successIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  successTitle: { fontSize: 28, fontWeight: '800', marginBottom: 12, letterSpacing: -0.5 },
  successDescription: { fontSize: 15, textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  infoCard: {
    borderRadius: 20,
    padding: 20,
    width: '100%',
    marginBottom: 32,
    borderWidth: 1,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  infoDivider: { height: 1 },
  infoText: { fontSize: 14, flex: 1, lineHeight: 20 },
  primaryButton: {
    borderRadius: 14,
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
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  secondaryButton: { paddingVertical: 14, paddingHorizontal: 24 },
  secondaryButtonText: { fontSize: 15, fontWeight: '600' },
});
