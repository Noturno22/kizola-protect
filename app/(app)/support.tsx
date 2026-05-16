import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  ActivityIndicator, 
  Linking,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { 
  MessageCircle, 
  Send, 
  ChevronDown, 
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  Shield,
  Heart,
  Globe,
  ChevronRight,
  Info,
  X,
  Sparkles
} from 'lucide-react-native';
import { useTheme, Theme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useNotifications } from '@/providers/NotificationProvider';
import { supabase, isSupabaseConfigured, PRIORITY_OPTIONS } from '@/lib/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');
const REQUESTS_KEY = '@kizola_support_requests';

const CATEGORIES = [
  { id: 'legal', labelKey: 'benefits.items.legal.title', icon: Shield, color: '#3B82F6' },
  { id: 'immigration', labelKey: 'benefits.items.immigration.title', icon: Globe, color: '#10B981' },
  { id: 'tax', labelKey: 'benefits.items.tax.title', icon: Sparkles, color: '#8B5CF6' },
  { id: 'housing', labelKey: 'benefits.items.housing.title', icon: Heart, color: '#F59E0B' },
  { id: 'education', labelKey: 'benefits.items.education.title', icon: Info, color: '#EC4899' },
  { id: 'other', labelKey: 'common.other', icon: MessageCircle, color: '#64748B' },
] as const;

export default function Support() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { user, isDemoMode } = useAuth();
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { addNotification } = useNotifications();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [category, setCategory] = useState<string>('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'chat'>('form');
  const [chatMessages, setChatMessages] = useState<{ id: string; text: string; sender: 'user' | 'ai'; timestamp: Date }[]>([
    { id: '1', text: t('support.aiWelcome') || 'Olá! Sou o assistente virtual da Kizola. Como posso ajudar hoje?', sender: 'ai', timestamp: new Date() }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    if (params.category) {
      const categoryId = params.category as string;
      if (CATEGORIES.some(c => c.id === categoryId)) {
        setCategory(categoryId);
      }
    }
  }, [params.category]);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !category || !message.trim()) {
      Alert.alert(t('common.error'), t('support.fillRequired'));
      return;
    }

    if (message.trim().length < 20) {
      Alert.alert(t('common.error'), t('support.moreDetails'));
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        user_id: user?.id,
        name: name.trim(),
        email: email.trim(),
        category,
        priority,
        message: message.trim(),
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (isDemoMode || !isSupabaseConfigured()) {
        const existing = await AsyncStorage.getItem(`${REQUESTS_KEY}_${user?.id}`);
        const requests = existing ? JSON.parse(existing) : [];
        requests.unshift({ ...requestData, id: 'demo-' + Date.now() });
        await AsyncStorage.setItem(`${REQUESTS_KEY}_${user?.id}`, JSON.stringify(requests));
      } else {
        const { error } = await supabase.from('support_requests').insert(requestData);
        if (error) throw error;
      }

      addNotification({
        title: t('support.requestSubmitted'),
        message: t('support.thankYou'),
        type: 'success',
        read: false,
      });

      setSubmitted(true);
      setMessage('');
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || t('support.failedSubmit'));
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      text: chatInput.trim(),
      sender: 'user' as const,
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    // Simulate AI Response
    setTimeout(() => {
      const responseText = getAIResponse(userMsg.text);
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'ai' as const,
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const getAIResponse = (input: string) => {
    const text = input.toLowerCase();
    if (text.includes('plano') || text.includes('preço') || text.includes('valor')) {
      return t('support.aiResponsePlans') || 'Temos 3 planos: Basic ($10/mês), Pro ($25/mês) e Premium ($50/mês). Pode ver mais detalhes na aba de Planos!';
    }
    if (text.includes('legal') || text.includes('advogado') || text.includes('lei')) {
      return t('support.aiResponseLegal') || 'Oferecemos assistência jurídica completa para imigrantes, incluindo revisão de contratos e defesa básica.';
    }
    if (text.includes('visto') || text.includes('imigração') || text.includes('documento')) {
      return t('support.aiResponseImmigration') || 'A nossa equipa de imigração pode ajudar com agendamentos no SEF/AIMA, pedidos de residência e manifestação de interesse.';
    }
    if (text.includes('contacto') || text.includes('whatsapp') || text.includes('telefone')) {
      return t('support.aiResponseContact') || 'Pode falar connosco pelo WhatsApp (+1 929 609-7035) ou enviar um bilhete de suporte aqui mesmo!';
    }
    if (text.includes('olá') || text.includes('oi') || text.includes('bom dia')) {
      return t('support.aiResponseGreet') || 'Olá! Como posso ajudar com a sua proteção hoje?';
    }
    return t('support.aiResponseDefault') || 'Interessante! Para detalhes específicos, recomendo falar com um de nossos consultores via WhatsApp ou abrir um ticket de suporte.';
  };

  const openWhatsApp = () => {
    Linking.openURL('https://wa.me/19296097035');
  };

  const getPriorityConfig = (p: string) => PRIORITY_OPTIONS.find(opt => opt.id === p) || PRIORITY_OPTIONS[1];

  const headerHeight = 220;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, headerHeight - 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  if (submitted) {
    return (
      <View style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
        <LinearGradient
          colors={theme.headerGradient}
          style={StyleSheet.absoluteFillObject}
        />
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.successContainer}>
            <Animated.View style={[styles.successContent, { opacity: fadeAnim }]}>
              <View style={styles.successIconWrapper}>
                <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFillObject} />
                <CheckCircle2 size={64} color={theme.isDark ? "#FFFFFF" : theme.accent} />
              </View>
              
              <Text style={[styles.successTitle, { color: theme.text }]}>{t('support.requestSubmitted')}</Text>
              <Text style={[styles.successDescription, { color: theme.textSecondary }]}>
                {t('support.thankYou')}
              </Text>

              <BlurView intensity={20} tint="light" style={styles.successInfoCard}>
                <View style={styles.successInfoRow}>
                  <Clock size={20} color="#FFFFFF" />
                  <Text style={styles.successInfoText}>{t('support.responseTimeInfo')}</Text>
                </View>
                <View style={styles.successInfoDivider} />
                <View style={styles.successInfoRow}>
                  <Mail size={20} color="#FFFFFF" />
                  <Text style={styles.successInfoText}>{t('support.confirmationSent')} {email}</Text>
                </View>
              </BlurView>

              <View style={styles.successButtons}>
                <TouchableOpacity 
                  style={styles.primaryButton}
                  onPress={() => setSubmitted(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryButtonText}>{t('support.submitAnother')}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.secondaryButton}
                  onPress={() => router.push('/activity')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.secondaryButtonText}>{t('support.viewActivity')}</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={theme.headerGradient}
        locations={[0, 0.3, 0.5]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <Animated.ScrollView
            contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'form' && styles.activeTab]} 
              onPress={() => setActiveTab('form')}
            >
              <MessageCircle size={18} color={activeTab === 'form' ? theme.accent : theme.textMuted} />
              <Text style={[styles.tabText, activeTab === 'form' && styles.activeTabText]}>{t('support.ticketTab') || 'Ticket'}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'chat' && styles.activeTab]} 
              onPress={() => setActiveTab('chat')}
            >
              <Sparkles size={18} color={activeTab === 'chat' ? theme.accent : theme.textMuted} />
              <Text style={[styles.tabText, activeTab === 'chat' && styles.activeTabText]}>{t('support.aiTab') || 'Chat IA'}</Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'form' ? (
            <>
              {/* Quick Contact Cards */}
              <View style={styles.contactSection}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.contactScroll}
                  snapToInterval={width * 0.75 + 16}
                  decelerationRate="fast"
                >
                  <TouchableOpacity style={styles.contactCard} onPress={openWhatsApp} activeOpacity={0.9}>
                    <LinearGradient
                      colors={['#25D366', '#128C7E']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.contactCardBg}
                    />
                    <View style={styles.contactCardContent}>
                      <View style={styles.contactCardIcon}>
                        <Phone size={24} color="#FFFFFF" />
                      </View>
                      <Text style={styles.contactCardLabel}>{t('support.whatsapp')}</Text>
                      <Text style={styles.contactCardValue}>+1 (929) 609-7035</Text>
                      <View style={styles.contactCardAction}>
                        <Text style={styles.contactCardActionText}>{t('common.contact')}</Text>
                        <ChevronRight size={16} color="#FFFFFF" />
                      </View>
                    </View>
                  </TouchableOpacity>

                  <View style={styles.contactCard}>
                    <LinearGradient
                      colors={[theme.accentBlue, '#2563EB']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.contactCardBg}
                    />
                    <View style={styles.contactCardContent}>
                      <View style={styles.contactCardIcon}>
                        <Mail size={24} color="#FFFFFF" />
                      </View>
                      <Text style={styles.contactCardLabel}>{t('support.email')}</Text>
                      <Text style={styles.contactCardValue}>support@kizola.protect</Text>
                      <View style={styles.contactCardAction}>
                        <Text style={styles.contactCardActionText}>{t('support.hours2448')}</Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>
              </View>

              {/* Transparent Commitment Section */}
              <View style={styles.commitmentSection}>
                <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={styles.commitmentCard}>
                  <View style={styles.commitmentHeader}>
                    <Shield size={20} color={theme.accent} />
                    <Text style={styles.commitmentTitle}>{t('support.commitmentTitle')}</Text>
                  </View>
                  <Text style={styles.commitmentText}>
                    {t('support.commitmentText')}
                  </Text>
                </BlurView>
              </View>

              {/* Support Form */}
              <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
                <View style={styles.formHeader}>
                  <Sparkles size={20} color={theme.accent} />
                  <Text style={styles.formTitle}>{t('support.requestAssistance')}</Text>
                </View>

                {/* Inputs */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t('support.fullNameLabel')}</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      value={name}
                      onChangeText={setName}
                      placeholder={t('support.fullNamePlaceholder')}
                      placeholderTextColor={theme.textMuted}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t('support.emailLabel')}</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
                      placeholder={t('support.emailPlaceholder')}
                      placeholderTextColor={theme.textMuted}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t('support.categoryLabel')}</Text>
                  <TouchableOpacity 
                    style={styles.dropdownButton}
                    onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.dropdownContent}>
                      {category && (() => {
                        const cat = CATEGORIES.find(c => c.id === category);
                        const CatIcon = cat?.icon || Info;
                        return (
                          <View style={[styles.categoryIcon, { backgroundColor: (cat?.color || theme.accent) + '20' }]}>
                            <CatIcon size={18} color={cat?.color || theme.accent} />
                          </View>
                        );
                      })()}
                      <Text style={category ? styles.dropdownText : styles.dropdownPlaceholder}>
                        {category ? t(CATEGORIES.find(c => c.id === category)?.labelKey || '') : t('support.categoryPlaceholder')}
                      </Text>
                    </View>
                    <ChevronDown size={20} color={theme.textMuted} style={{ transform: [{ rotate: showCategoryDropdown ? '180deg' : '0deg' }] }} />
                  </TouchableOpacity>
                  
                  {showCategoryDropdown && (
                    <View style={styles.dropdownMenu}>
                      {CATEGORIES.map((cat) => {
                        const CatIcon = cat.icon;
                        return (
                          <TouchableOpacity
                            key={cat.id}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setCategory(cat.id);
                              setShowCategoryDropdown(false);
                            }}
                          >
                            <View style={[styles.itemIconWrapper, { backgroundColor: cat.color + '15' }]}>
                              <CatIcon size={18} color={cat.color} />
                            </View>
                            <Text style={[
                              styles.dropdownItemText,
                              category === cat.id && styles.dropdownItemTextActive
                            ]}>
                              {t(cat.labelKey)}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t('support.priorityLabel')}</Text>
                  <TouchableOpacity 
                    style={styles.dropdownButton}
                    onPress={() => setShowPriorityDropdown(!showPriorityDropdown)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.priorityDisplay}>
                      <View style={[styles.priorityDot, { backgroundColor: getPriorityConfig(priority).color }]} />
                      <Text style={styles.dropdownText}>{t(getPriorityConfig(priority).label)}</Text>
                    </View>
                    <ChevronDown size={20} color={theme.textMuted} style={{ transform: [{ rotate: showPriorityDropdown ? '180deg' : '0deg' }] }} />
                  </TouchableOpacity>
                  
                  {showPriorityDropdown && (
                    <View style={styles.dropdownMenu}>
                      {PRIORITY_OPTIONS.map((opt) => (
                        <TouchableOpacity
                          key={opt.id}
                          style={styles.priorityItem}
                          onPress={() => {
                            setPriority(opt.id as 'low' | 'medium' | 'high' | 'urgent');
                            setShowPriorityDropdown(false);
                          }}
                        >
                          <View style={[styles.priorityDot, { backgroundColor: opt.color }]} />
                          <View style={styles.priorityItemContent}>
                            <Text style={[
                              styles.priorityItemLabel,
                              priority === opt.id && styles.priorityItemLabelActive
                            ]}>
                              {t(opt.label)}
                            </Text>
                            <Text style={styles.priorityItemDescription}>{t(opt.description)}</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t('support.messageLabel')}</Text>
                  <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={message}
                      onChangeText={setMessage}
                      placeholder={t('support.messagePlaceholder')}
                      placeholderTextColor={theme.textMuted}
                      multiline
                      numberOfLines={6}
                      textAlignVertical="top"
                    />
                  </View>
                  <Text style={styles.characterCount}>
                    {message.length} {t('support.characters')} {message.length < 20 && t('support.min20')}
                  </Text>
                </View>

                <TouchableOpacity 
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={loading}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={loading ? ['#CBD5E1', '#94A3B8'] : [theme.accent, theme.accent + 'DD']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                  />
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.submitButtonText}>{t('support.submitRequest')}</Text>
                      <Send size={18} color="#FFFFFF" />
                    </>
                  )}
                </TouchableOpacity>
              </Animated.View>
            </>
          ) : (
            /* Chat IA Assistant */
            <View style={styles.chatContainer}>
              <View style={styles.chatHeader}>
                <View style={styles.aiBadge}>
                  <Sparkles size={14} color="#FFFFFF" />
                  <Text style={styles.aiBadgeText}>AI Assistant</Text>
                </View>
                <Text style={styles.chatStatus}>Online</Text>
              </View>

              <View style={styles.chatMessagesList}>
                {chatMessages.map((msg) => (
                  <View 
                    key={msg.id} 
                    style={[
                      styles.messageWrapper, 
                      msg.sender === 'user' ? styles.userMessageWrapper : styles.aiMessageWrapper
                    ]}
                  >
                    <View 
                      style={[
                        styles.messageBubble, 
                        msg.sender === 'user' ? [styles.userBubble, { backgroundColor: theme.primary }] : [styles.aiBubble, { backgroundColor: theme.surface }]
                      ]}
                    >
                      <Text style={[
                        styles.messageText, 
                        msg.sender === 'user' ? styles.userMessageText : [styles.aiMessageText, { color: theme.text }]
                      ]}>
                        {msg.text}
                      </Text>
                      <Text style={[
                        styles.messageTime, 
                        msg.sender === 'user' ? styles.userMessageTime : styles.aiMessageTime
                      ]}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                ))}
                {isTyping && (
                  <View style={styles.aiMessageWrapper}>
                    <View style={[styles.messageBubble, styles.aiBubble, { backgroundColor: theme.surface, paddingVertical: 12 }]}>
                      <ActivityIndicator size="small" color={theme.accent} />
                    </View>
                  </View>
                )}
              </View>

              <View style={[styles.chatInputContainer, { backgroundColor: theme.surface, borderColor: theme.cardBorderAlt }]}>
                <TextInput
                  style={[styles.chatInput, { color: theme.text }]}
                  placeholder={t('support.typeMessage') || 'Escreva sua dúvida...'}
                  placeholderTextColor={theme.textMuted}
                  value={chatInput}
                  onChangeText={setChatInput}
                  multiline
                />
                <TouchableOpacity 
                  style={[styles.chatSendButton, { backgroundColor: theme.primary }]}
                  onPress={handleSendMessage}
                  activeOpacity={0.8}
                >
                  <Send size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          </Animated.ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  headerIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.isDark ? '#FFFFFF' : theme.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.isDark ? 'rgba(255,255,255,0.8)' : theme.textSecondary,
    lineHeight: 22,
  },
  contactSection: {
    marginTop: -8,
    marginBottom: 24,
  },
  contactScroll: {
    paddingHorizontal: 24,
    gap: 16,
  },
  contactCard: {
    width: width * 0.75,
    borderRadius: 24,
    overflow: 'hidden',
    height: 160,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  contactCardBg: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.9,
  },
  contactCardContent: {
    padding: 24,
    flex: 1,
    justifyContent: 'space-between',
  },
  contactCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactCardLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  contactCardValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  contactCardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contactCardActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  commitmentSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  commitmentCard: {
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.cardBorderAlt,
  },
  commitmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  commitmentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
  },
  commitmentText: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
  },
  formContainer: {
    marginHorizontal: 24,
    backgroundColor: theme.surface,
    borderRadius: 32,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 1,
    borderColor: theme.cardBorderAlt,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 6,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.cardBorderAlt,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: theme.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textMuted,
  },
  activeTabText: {
    color: theme.text,
  },
  chatContainer: {
    marginHorizontal: 24,
    backgroundColor: theme.surface,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.cardBorderAlt,
    minHeight: 400,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.cardBorderAlt,
    backgroundColor: theme.background + '50',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  aiBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  chatStatus: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  chatMessagesList: {
    flex: 1,
    padding: 16,
    gap: 16,
    minHeight: 300,
  },
  messageWrapper: {
    maxWidth: '85%',
  },
  userMessageWrapper: {
    alignSelf: 'flex-end',
  },
  aiMessageWrapper: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: theme.cardBorderAlt,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  aiMessageText: {
    color: theme.text,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  userMessageTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  aiMessageTime: {
    color: theme.textMuted,
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  chatInput: {
    flex: 1,
    fontSize: 15,
    maxHeight: 100,
    paddingTop: 8,
    paddingBottom: 8,
  },
  chatSendButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 10,
    marginLeft: 4,
  },
  inputWrapper: {
    backgroundColor: theme.background,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.cardBorderAlt,
    overflow: 'hidden',
  },
  input: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: theme.text,
  },
  textAreaWrapper: {
    height: 160,
  },
  textArea: {
    height: '100%',
    paddingTop: 16,
  },
  characterCount: {
    fontSize: 12,
    color: theme.textMuted,
    textAlign: 'right',
    marginTop: 8,
    marginRight: 4,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.background,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: theme.cardBorderAlt,
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: theme.text,
    fontWeight: '500',
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: theme.textMuted,
  },
  priorityDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dropdownMenu: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: theme.cardBorderAlt,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.cardBorderAlt,
  },
  itemIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownItemText: {
    fontSize: 15,
    color: theme.text,
    fontWeight: '500',
  },
  dropdownItemTextActive: {
    color: theme.accent,
    fontWeight: '700',
  },
  priorityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.cardBorderAlt,
  },
  priorityItemContent: {
    flex: 1,
  },
  priorityItemLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 2,
  },
  priorityItemLabelActive: {
    color: theme.accent,
  },
  priorityItemDescription: {
    fontSize: 13,
    color: theme.textMuted,
  },
  submitButton: {
    height: 60,
    borderRadius: 20,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    zIndex: 1,
  },
  successContainer: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  successContent: {
    alignItems: 'center',
  },
  successIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 40,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  successTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  successDescription: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  successInfoCard: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    marginBottom: 48,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  successInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  successInfoText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  successInfoDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 16,
  },
  successButtons: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    height: 64,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.primary,
  },
  secondaryButton: {
    height: 64,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
