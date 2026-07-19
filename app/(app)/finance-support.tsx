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
  DollarSign,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  FileText,
  ChevronDown,
  Send,
  Sparkles,
  CreditCard,
  TrendingUp,
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

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma',
  'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee',
  'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

export default function FinanceSupport() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { addNotification } = useNotifications();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isConnected } = useOffline();

  const FINANCE_TYPES = [
    { id: 'ebt', label: t('financeForm.type_ebt'), icon: '🍎', description: t('financeForm.type_ebt_desc') },
    { id: 'state_benefits', label: t('financeForm.type_state_benefits'), icon: '🏛️', description: t('financeForm.type_state_benefits_desc') },
    { id: 'tax_return', label: t('financeForm.type_tax_return'), icon: '💵', description: t('financeForm.type_tax_return_desc') },
    { id: 'financial_planning', label: t('financeForm.type_financial_planning'), icon: '📊', description: t('financeForm.type_financial_planning_desc') },
    { id: 'debt_help', label: t('financeForm.type_debt_help'), icon: '💳', description: t('financeForm.type_debt_help_desc') },
    { id: 'banking', label: t('financeForm.type_banking'), icon: '🏦', description: t('financeForm.type_banking_desc') },
    { id: 'itin', label: t('financeForm.type_itin'), icon: '📋', description: t('financeForm.type_itin_desc') },
    { id: 'other', label: t('financeForm.type_other'), icon: '💬', description: t('financeForm.type_other_desc') },
  ];

  const [nome, setNome] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [tipoAjuda, setTipoAjuda] = useState('');
  const [estado, setEstado] = useState('');
  const [descricao, setDescricao] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);

  const selectedType = FINANCE_TYPES.find(ft => ft.id === tipoAjuda);

  const handleSubmit = async () => {
    if (!tipoAjuda || !estado.trim() || !descricao.trim()) {
      Alert.alert(t('financeForm.requiredFieldsTitle'), t('financeForm.requiredFieldsMessage'));
      return;
    }

    if (descricao.trim().length < 20) {
      Alert.alert(t('financeForm.insufficientDescriptionTitle'), t('financeForm.insufficientDescriptionMessage'));
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        user_id: user?.id,
        nome: nome.trim() || user?.name || 'Utilizador',
        email: email.trim() || user?.email || '',
        tipo_ajuda: tipoAjuda,
        estado: estado.trim(),
        descricao: descricao.trim(),
        observacoes: observacoes.trim() || null,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (!isSupabaseConfigured()) {
        const existing = await getSecureItem<object[]>(SECURE_KEYS.FINANCE_REQUESTS(user?.id ?? ''));
        const requests = existing || [];
        requests.unshift({ ...requestData, id: 'demo-finance-' + Date.now() });
        await setSecureItem(SECURE_KEYS.FINANCE_REQUESTS(user?.id ?? ''), requests);
      } else if (!isConnected) {
        await syncQueue.enqueue('finance_requests', requestData);
        addNotification({
          title: 'offline.queuedTitle',
          message: 'offline.queuedMessage',
          type: 'info',
          read: false,
        });
      } else {
        const { error } = await supabase.from('finance_requests').insert(requestData);
        if (error) throw error;

        await supabase.from('auth_audit_logs').insert({
          user_id: user?.id,
          action: 'finance_request_submitted',
          resource: 'finance_requests',
          details: { tipo_ajuda: tipoAjuda, estado },
        });
      }

      addNotification({
        title: 'financeForm.notificationTitle',
        message: 'financeForm.notificationMessage',
        type: 'success',
        read: false,
      });

      setSubmitted(true);
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || t('financeForm.submitError'));
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
              <Text style={[styles.successTitle, { color: theme.text }]}>{t('financeForm.submittedTitle')}</Text>
              <Text style={[styles.successDescription, { color: theme.textSecondary }]}>
                {t('financeForm.submittedDesc')}
              </Text>

              <View style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.cardBorderAlt }]}>
                <View style={styles.infoRow}>
                  <TrendingUp size={18} color={theme.accent} />
                  <Text style={[styles.infoText, { color: theme.text }]}>
                    {t('financeForm.specialistsAvailable')}
                  </Text>
                </View>
                <View style={[styles.infoDivider, { backgroundColor: theme.cardBorderAlt }]} />
                <View style={styles.infoRow}>
                  <Sparkles size={18} color={theme.accent} />
                  <Text style={[styles.infoText, { color: theme.text }]}>
                    {t('financeForm.responseTime')}
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
                <Text style={styles.primaryButtonText}>{t('financeForm.backToHome')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setSubmitted(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.secondaryButtonText, { color: theme.textSecondary }]}>
                  {t('financeForm.submitNewRequest')}
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
            {/* Back */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft size={20} color={isDark ? '#FFFFFF' : theme.text} />
              <Text style={[styles.backButtonText, { color: isDark ? '#FFFFFF' : theme.text }]}>{t('common.back')}</Text>
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <View style={[styles.headerIconWrapper, { backgroundColor: theme.accent + '20', borderColor: theme.accent + '40' }]}>
                <View style={[styles.headerIconInner, { backgroundColor: theme.accent }]}>
                  <DollarSign size={32} color="#FFFFFF" />
                </View>
              </View>
              <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : theme.text }]}>
                {t('financeForm.title')}
              </Text>
              <Text style={[styles.headerSubtitle, { color: isDark ? 'rgba(255,255,255,0.8)' : theme.textSecondary }]}>
                {t('financeForm.subtitle')}
              </Text>
              <View style={[styles.headerBadge, { backgroundColor: theme.accent + '15', borderColor: theme.accent + '30' }]}>
                <Sparkles size={14} color={theme.accent} />
                <Text style={[styles.headerBadgeText, { color: theme.accent }]}>{t('financeForm.freeAssistance')}</Text>
              </View>
            </View>

            {/* Quick Info Cards */}
            <View style={styles.quickInfoSection}>
              <Text style={[styles.sectionLabel, { color: isDark ? 'rgba(255,255,255,0.7)' : theme.textSecondary }]}>
                {t('financeForm.whatWeHelpWith')}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickInfoScroll}
                style={styles.quickInfoContainer}
              >
                {[
                  { icon: '💰', label: 'EBT/SNAP', desc: t('financeForm.quickInfo_ebt') },
                  { icon: '📑', label: 'Tax Return', desc: t('financeForm.quickInfo_tax') },
                  { icon: '🏛️', label: t('financeForm.type_benefits'), desc: t('financeForm.quickInfo_benefits') },
                  { icon: '📋', label: 'ITIN', desc: t('financeForm.quickInfo_itin') },
                ].map((item, i) => (
                  <View key={i} style={[styles.quickInfoCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.03)', borderColor: theme.cardBorderAlt }]}>
                    <View style={[styles.quickInfoEmojiWrapper, { backgroundColor: theme.accent + '15' }]}>
                      <Text style={styles.quickInfoEmoji}>{item.icon}</Text>
                    </View>
                    <Text style={[styles.quickInfoLabel, { color: isDark ? '#FFFFFF' : theme.text }]}>{item.label}</Text>
                    <Text style={[styles.quickInfoDesc, { color: isDark ? 'rgba(255,255,255,0.6)' : theme.textMuted }]}>{item.desc}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Form */}
            <View style={[styles.formCard, { backgroundColor: theme.surface, borderColor: theme.cardBorderAlt }]}>
              <View style={styles.formTitleRow}>
                <View style={[styles.formTitleIcon, { backgroundColor: theme.accent + '15' }]}>
                  <FileText size={20} color={theme.accent} />
                </View>
                <Text style={[styles.formTitle, { color: theme.text }]}>{t('financeForm.formTitle')}</Text>
              </View>
              <Text style={[styles.formSubtitle, { color: theme.textMuted }]}>{t('financeForm.formSubtitle')}</Text>

              {/* Tipo de Ajuda */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{t('financeForm.helpTypeLabel')}</Text>
                <TouchableOpacity
                  style={[styles.dropdownButton, { backgroundColor: theme.background, borderColor: theme.cardBorderAlt }]}
                  onPress={() => { setShowTypeDropdown(!showTypeDropdown); setShowStateDropdown(false); }}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    {selectedType ? (
                      <>
                        <Text style={[styles.dropdownText, { color: theme.text }]}>
                          {selectedType.icon} {selectedType.label}
                        </Text>
                        <Text style={[styles.dropdownSubText, { color: theme.textMuted }]}>
                          {selectedType.description}
                        </Text>
                      </>
                    ) : (
                      <Text style={[styles.dropdownText, { color: theme.textMuted }]}>
                        {t('financeForm.selectHelpType')}
                      </Text>
                    )}
                  </View>
                  <ChevronDown size={18} color={theme.textMuted} style={{ transform: [{ rotate: showTypeDropdown ? '180deg' : '0deg' }] }} />
                </TouchableOpacity>

                {showTypeDropdown && (
                  <View style={[styles.dropdownMenu, { backgroundColor: theme.surface, borderColor: theme.cardBorderAlt }]}>
                    {FINANCE_TYPES.map(ft => (
                      <TouchableOpacity
                        key={ft.id}
                        style={[styles.dropdownItem, tipoAjuda === ft.id && { backgroundColor: theme.primary + '15' }]}
                        onPress={() => { setTipoAjuda(ft.id); setShowTypeDropdown(false); }}
                      >
                        <Text style={styles.dropdownItemEmoji}>{ft.icon}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.dropdownItemText, { color: tipoAjuda === ft.id ? theme.primary : theme.text }]}>
                            {ft.label}
                          </Text>
                          <Text style={[styles.dropdownItemSubText, { color: theme.textMuted }]}>
                            {ft.description}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Estado */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{t('financeForm.stateLabel')}</Text>
                <TouchableOpacity
                  style={[styles.dropdownButton, { backgroundColor: theme.background, borderColor: theme.cardBorderAlt }]}
                  onPress={() => { setShowStateDropdown(!showStateDropdown); setShowTypeDropdown(false); }}
                  activeOpacity={0.7}
                >
                  <MapPin size={16} color={theme.textMuted} style={{ marginRight: 8 }} />
                  <Text style={[styles.dropdownText, { color: estado ? theme.text : theme.textMuted, flex: 1 }]}>
                    {estado || t('financeForm.selectState')}
                  </Text>
                  <ChevronDown size={18} color={theme.textMuted} style={{ transform: [{ rotate: showStateDropdown ? '180deg' : '0deg' }] }} />
                </TouchableOpacity>

                {showStateDropdown && (
                  <ScrollView
                    style={[styles.stateDropdownMenu, { backgroundColor: theme.surface, borderColor: theme.cardBorderAlt }]}
                    nestedScrollEnabled
                    showsVerticalScrollIndicator
                  >
                    {US_STATES.map(s => (
                      <TouchableOpacity
                        key={s}
                        style={[styles.dropdownItem, estado === s && { backgroundColor: theme.primary + '15' }]}
                        onPress={() => { setEstado(s); setShowStateDropdown(false); }}
                      >
                        <Text style={[styles.dropdownItemText, { color: estado === s ? theme.primary : theme.text }]}>
                          {s}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>

              {/* Descrição */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{t('financeForm.descriptionLabel')}</Text>
                <View style={[styles.inputWrapper, styles.textAreaWrapper, { backgroundColor: theme.background, borderColor: theme.cardBorderAlt }]}>
                  <TextInput
                    style={[styles.input, styles.textArea, { color: theme.text }]}
                    placeholder={t('financeForm.descriptionPlaceholder')}
                    placeholderTextColor={theme.textMuted}
                    value={descricao}
                    onChangeText={setDescricao}
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                  />
                </View>
                <Text style={[styles.charCount, { color: descricao.length < 20 ? '#EF4444' : theme.textMuted }]}>
                  {descricao.length} {t('financeForm.characters')} {descricao.length < 20 ? `(${t('financeForm.minChars')})` : '✓'}
                </Text>
              </View>

              {/* Observações */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{t('financeForm.additionalInfoLabel')}</Text>
                <View style={[styles.inputWrapper, { backgroundColor: theme.background, borderColor: theme.cardBorderAlt, height: 80, alignItems: 'flex-start', paddingVertical: 12 }]}>
                  <TextInput
                    style={[styles.input, { height: 56, color: theme.text }]}
                    placeholder={t('financeForm.additionalInfoPlaceholder')}
                    placeholderTextColor={theme.textMuted}
                    value={observacoes}
                    onChangeText={setObservacoes}
                    multiline
                    textAlignVertical="top"
                  />
                </View>
              </View>

              {/* Submit */}
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
                    <Text style={styles.submitButtonText}>{t('financeForm.submitButton')}</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={[styles.privacyNote, { backgroundColor: theme.background, borderColor: theme.cardBorderAlt }]}>
                <Text style={[styles.privacyNoteText, { color: theme.textSecondary }]}>
                  🔒 {t('financeForm.privacyNote')}
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
    paddingBottom: 28,
    alignItems: 'center',
  },
  headerIconWrapper: {
    width: 88,
    height: 88,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
  },
  headerIconInner: {
    width: 64,
    height: 64,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 28, fontWeight: '800', marginBottom: 10, letterSpacing: -0.5, textAlign: 'center' },
  headerSubtitle: { fontSize: 15, lineHeight: 22, textAlign: 'center', maxWidth: 280 },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  headerBadgeText: { fontSize: 13, fontWeight: '700' },

  quickInfoSection: { marginTop: 8 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginHorizontal: 24,
    marginBottom: 12,
  },
  quickInfoContainer: { marginBottom: 0 },
  quickInfoScroll: { paddingHorizontal: 16, paddingVertical: 8, gap: 12 },
  quickInfoCard: {
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    width: 110,
  },
  quickInfoEmojiWrapper: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickInfoEmoji: { fontSize: 24 },
  quickInfoLabel: { fontSize: 13, fontWeight: '700', marginBottom: 4, textAlign: 'center' },
  quickInfoDesc: { fontSize: 11, textAlign: 'center', lineHeight: 15 },

  formCard: {
    marginHorizontal: 16,
    marginTop: 4,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 6,
  },
  formTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  formTitleIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formTitle: { fontSize: 20, fontWeight: '800' },
  formSubtitle: { fontSize: 13, lineHeight: 18, marginBottom: 24, marginLeft: 52 },

  inputGroup: { marginBottom: 18 },
  inputLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 },
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
  charCount: { fontSize: 12, marginTop: 4, textAlign: 'right' },

  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    minHeight: 58,
    paddingVertical: 12,
  },
  dropdownText: { fontSize: 15 },
  dropdownSubText: { fontSize: 12, marginTop: 2 },
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
  stateDropdownMenu: {
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 4,
    maxHeight: 200,
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
    gap: 12,
  },
  dropdownItemEmoji: { fontSize: 22 },
  dropdownItemText: { fontSize: 15, fontWeight: '600' },
  dropdownItemSubText: { fontSize: 12, marginTop: 2, lineHeight: 16 },

  submitButton: {
    borderRadius: 18,
    overflow: 'hidden',
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
    marginTop: 8,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  privacyNote: { borderRadius: 12, borderWidth: 1, padding: 12 },
  privacyNoteText: { fontSize: 13, lineHeight: 18, textAlign: 'center' },

  successContainer: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 },
  successContent: { alignItems: 'center' },
  successIconWrapper: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 2, borderColor: 'rgba(34, 197, 94, 0.2)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 28,
  },
  successTitle: { fontSize: 28, fontWeight: '800', marginBottom: 12, letterSpacing: -0.5 },
  successDescription: { fontSize: 15, textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  infoCard: { borderRadius: 20, padding: 20, width: '100%', marginBottom: 32, borderWidth: 1 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  infoDivider: { height: 1 },
  infoText: { fontSize: 14, flex: 1, lineHeight: 20 },
  primaryButton: {
    borderRadius: 14, height: 54, width: '100%',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
    shadowColor: theme.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  secondaryButton: { paddingVertical: 14, paddingHorizontal: 24 },
  secondaryButtonText: { fontSize: 15, fontWeight: '600' },
});
