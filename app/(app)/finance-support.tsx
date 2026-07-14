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

const FINANCE_TYPES = [
  { id: 'ebt', label: 'EBT / SNAP (Vale Alimentação)', icon: '🍎', description: 'Assistência para alimentação' },
  { id: 'state_benefits', label: 'Benefícios Estatais (Welfare, Medicaid)', icon: '🏛️', description: 'Programas de assistência do estado' },
  { id: 'tax_return', label: 'Tax Return (Devolução de Impostos)', icon: '💵', description: 'Ajuda com declaração e devolução' },
  { id: 'financial_planning', label: 'Planejamento Financeiro', icon: '📊', description: 'Organização e planejamento' },
  { id: 'debt_help', label: 'Gestão de Dívidas', icon: '💳', description: 'Orientação sobre dívidas e crédito' },
  { id: 'banking', label: 'Abertura de Conta Bancária', icon: '🏦', description: 'Orientação bancária para imigrantes' },
  { id: 'itin', label: 'ITIN (Número de Identificação Fiscal)', icon: '📋', description: 'Obtenção do ITIN para não-cidadãos' },
  { id: 'other', label: 'Outra Situação Financeira', icon: '💬', description: 'Outras necessidades financeiras' },
] as const;

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

  const selectedType = FINANCE_TYPES.find(t => t.id === tipoAjuda);

  const handleSubmit = async () => {
    if (!tipoAjuda || !estado.trim() || !descricao.trim()) {
      Alert.alert('Campos Obrigatórios', 'Por favor, selecione o tipo de ajuda, o estado e descreva a sua situação.');
      return;
    }

    if (descricao.trim().length < 20) {
      Alert.alert('Descrição Insuficiente', 'Por favor, forneça mais detalhes sobre a sua situação (mínimo 20 caracteres).');
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
        title: 'Pedido Financeiro Recebido',
        message: 'A nossa equipa de especialistas financeiros vai analisar o seu caso em breve.',
        type: 'success',
        read: false,
      });

      setSubmitted(true);
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Falha ao submeter o pedido. Por favor, tente novamente.');
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
              <Text style={[styles.successTitle, { color: theme.text }]}>Pedido Enviado!</Text>
              <Text style={[styles.successDescription, { color: theme.textSecondary }]}>
                O seu pedido de ajuda financeira foi recebido. Um especialista irá analisá-lo e contactá-lo em breve.
              </Text>

              <View style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.cardBorderAlt }]}>
                <View style={styles.infoRow}>
                  <TrendingUp size={18} color={theme.accent} />
                  <Text style={[styles.infoText, { color: theme.text }]}>
                    Especialistas em benefícios e impostos disponíveis
                  </Text>
                </View>
                <View style={[styles.infoDivider, { backgroundColor: theme.cardBorderAlt }]} />
                <View style={styles.infoRow}>
                  <Sparkles size={18} color={theme.accent} />
                  <Text style={[styles.infoText, { color: theme.text }]}>
                    Resposta em 24-48 horas úteis
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
                <Text style={styles.primaryButtonText}>Voltar ao Início</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setSubmitted(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.secondaryButtonText, { color: theme.textSecondary }]}>
                  Submeter Novo Pedido
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
              <Text style={[styles.backButtonText, { color: isDark ? '#FFFFFF' : theme.text }]}>Voltar</Text>
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerIconWrapper}>
                <DollarSign size={36} color={isDark ? '#FFFFFF' : theme.accent} />
              </View>
              <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : theme.text }]}>
                Ajuda às Finanças
              </Text>
              <Text style={[styles.headerSubtitle, { color: isDark ? 'rgba(255,255,255,0.8)' : theme.textSecondary }]}>
                Orientação sobre benefícios financeiros, EBT, cartões de ajuda estatal, impostos e Tax Return.
              </Text>
            </View>

            {/* Quick Info Cards */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickInfoScroll}
              style={styles.quickInfoContainer}
            >
              {[
                { icon: '💰', label: 'EBT/SNAP', desc: 'Vale alimentação' },
                { icon: '📑', label: 'Tax Return', desc: 'Devolução impostos' },
                { icon: '🏛️', label: 'Benefícios', desc: 'Ajuda estatal' },
                { icon: '📋', label: 'ITIN', desc: 'ID Fiscal' },
              ].map((item, i) => (
                <View key={i} style={[styles.quickInfoCard, { backgroundColor: theme.surface, borderColor: theme.cardBorderAlt }]}>
                  <Text style={styles.quickInfoEmoji}>{item.icon}</Text>
                  <Text style={[styles.quickInfoLabel, { color: theme.text }]}>{item.label}</Text>
                  <Text style={[styles.quickInfoDesc, { color: theme.textMuted }]}>{item.desc}</Text>
                </View>
              ))}
            </ScrollView>

            {/* Form */}
            <View style={[styles.formCard, { backgroundColor: theme.surface, borderColor: theme.cardBorderAlt }]}>
              <Text style={[styles.formTitle, { color: theme.text }]}>💼 Formulário de Pedido</Text>

              {/* Tipo de Ajuda */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Tipo de Ajuda Necessária *</Text>
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
                        Selecione o tipo de ajuda
                      </Text>
                    )}
                  </View>
                  <ChevronDown size={18} color={theme.textMuted} style={{ transform: [{ rotate: showTypeDropdown ? '180deg' : '0deg' }] }} />
                </TouchableOpacity>

                {showTypeDropdown && (
                  <View style={[styles.dropdownMenu, { backgroundColor: theme.surface, borderColor: theme.cardBorderAlt }]}>
                    {FINANCE_TYPES.map(t => (
                      <TouchableOpacity
                        key={t.id}
                        style={[styles.dropdownItem, tipoAjuda === t.id && { backgroundColor: theme.primary + '15' }]}
                        onPress={() => { setTipoAjuda(t.id); setShowTypeDropdown(false); }}
                      >
                        <Text style={styles.dropdownItemEmoji}>{t.icon}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.dropdownItemText, { color: tipoAjuda === t.id ? theme.primary : theme.text }]}>
                            {t.label}
                          </Text>
                          <Text style={[styles.dropdownItemSubText, { color: theme.textMuted }]}>
                            {t.description}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Estado */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Estado (USA) *</Text>
                <TouchableOpacity
                  style={[styles.dropdownButton, { backgroundColor: theme.background, borderColor: theme.cardBorderAlt }]}
                  onPress={() => { setShowStateDropdown(!showStateDropdown); setShowTypeDropdown(false); }}
                  activeOpacity={0.7}
                >
                  <MapPin size={16} color={theme.textMuted} style={{ marginRight: 8 }} />
                  <Text style={[styles.dropdownText, { color: estado ? theme.text : theme.textMuted, flex: 1 }]}>
                    {estado || 'Selecione o estado'}
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
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Descrição da Situação *</Text>
                <View style={[styles.inputWrapper, styles.textAreaWrapper, { backgroundColor: theme.background, borderColor: theme.cardBorderAlt }]}>
                  <TextInput
                    style={[styles.input, styles.textArea, { color: theme.text }]}
                    placeholder="Descreva a sua situação financeira atual. Ex: 'Preciso de ajuda para pedir o SNAP. Sou imigrante com visto de trabalho e tenho 3 filhos...'"
                    placeholderTextColor={theme.textMuted}
                    value={descricao}
                    onChangeText={setDescricao}
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                  />
                </View>
                <Text style={[styles.charCount, { color: descricao.length < 20 ? '#EF4444' : theme.textMuted }]}>
                  {descricao.length} caracteres {descricao.length < 20 ? `(mínimo 20)` : '✓'}
                </Text>
              </View>

              {/* Observações */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Informações Adicionais</Text>
                <View style={[styles.inputWrapper, { backgroundColor: theme.background, borderColor: theme.cardBorderAlt, height: 80, alignItems: 'flex-start', paddingVertical: 12 }]}>
                  <TextInput
                    style={[styles.input, { height: 56, color: theme.text }]}
                    placeholder="Documentos disponíveis, urgência, outras informações relevantes..."
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
                    <Text style={styles.submitButtonText}>Submeter Pedido Financeiro</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={[styles.privacyNote, { backgroundColor: theme.background, borderColor: theme.cardBorderAlt }]}>
                <Text style={[styles.privacyNoteText, { color: theme.textSecondary }]}>
                  🔒 As suas informações financeiras são tratadas com total confidencialidade.
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
    paddingBottom: 24,
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
  headerTitle: { fontSize: 28, fontWeight: '800', marginBottom: 10, letterSpacing: -0.5, textAlign: 'center' },
  headerSubtitle: { fontSize: 15, lineHeight: 22, textAlign: 'center' },

  quickInfoContainer: { marginBottom: 0 },
  quickInfoScroll: { paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  quickInfoCard: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    width: 100,
  },
  quickInfoEmoji: { fontSize: 24, marginBottom: 6 },
  quickInfoLabel: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  quickInfoDesc: { fontSize: 11, textAlign: 'center' },

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
  formTitle: { fontSize: 20, fontWeight: '800', marginBottom: 20 },

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
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    minHeight: 52,
    paddingVertical: 10,
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.cardBorderAlt,
    gap: 10,
  },
  dropdownItemEmoji: { fontSize: 18 },
  dropdownItemText: { fontSize: 15, fontWeight: '500' },
  dropdownItemSubText: { fontSize: 12, marginTop: 1 },

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
