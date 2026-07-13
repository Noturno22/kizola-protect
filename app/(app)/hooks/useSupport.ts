import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Alert, Animated, Dimensions, Linking, StyleSheet } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useNotifications } from '@/providers/NotificationProvider';
import { supabase, isSupabaseConfigured, PRIORITY_OPTIONS } from '@/lib/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getSecureItem, setSecureItem, SECURE_KEYS } from '@/lib/secureStorage';
import { useTranslation } from 'react-i18next';
import { sendMessage } from '@/services/ai/groq';
import {
  MessageCircle,
  Shield,
  Globe,
  Sparkles,
  Heart,
  Info,
} from 'lucide-react-native';

const CATEGORIES = [
  { id: 'legal', labelKey: 'benefits.items.legal.title', icon: Shield, color: '#3B82F6' },
  { id: 'immigration', labelKey: 'benefits.items.immigration.title', icon: Globe, color: '#10B981' },
  { id: 'tax', labelKey: 'benefits.items.tax.title', icon: Sparkles, color: '#8B5CF6' },
  { id: 'housing', labelKey: 'benefits.items.housing.title', icon: Heart, color: '#F59E0B' },
  { id: 'education', labelKey: 'benefits.items.education.title', icon: Info, color: '#EC4899' },
  { id: 'other', labelKey: 'common.other', icon: MessageCircle, color: '#64748B' },
] as const;

export function useSupport() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const { user, isDemoMode } = useAuth();
  const { theme, isDark } = useTheme();
  const { addNotification } = useNotifications();

  // State
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
    { id: '1', text: t('support.aiWelcome') || 'Olá! Sou o assistente virtual da Kizola. Como posso ajudar hoje?', sender: 'ai', timestamp: new Date() },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Refs
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Effects
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

  // Handlers
  const handleSubmit = useCallback(async () => {
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
        const existing = await getSecureItem<object[]>(SECURE_KEYS.SUPPORT_REQUESTS(user?.id));
        const requests = existing || [];
        requests.unshift({ ...requestData, id: 'demo-' + Date.now() });
        await setSecureItem(SECURE_KEYS.SUPPORT_REQUESTS(user?.id), requests);
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
  }, [name, email, category, priority, message, user, isDemoMode, t, addNotification]);

  const handleSendMessage = useCallback(async () => {
    if (!chatInput.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      text: chatInput.trim(),
      sender: 'user' as const,
      timestamp: new Date(),
    };

    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setChatInput('');
    setIsTyping(true);

    try {
      const groqMessages = updatedMessages
        .filter((m) => m.id !== '1' || m.sender === 'ai')
        .map((m) => ({
          role: m.sender === 'ai' ? ('assistant' as const) : ('user' as const),
          text: m.text,
        }));

      const responseText = await sendMessage(groqMessages);
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'ai' as const,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    } catch {
      const fallbackMsg = {
        id: (Date.now() + 1).toString(),
        text: 'Desculpa, ocorreu um erro ao contactar o assistente. Por favor, tenta novamente ou contacta-nos pelo WhatsApp (+1 929 609-7035).',
        sender: 'ai' as const,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  }, [chatInput, chatMessages]);

  const handleCall = useCallback(() => {
    Linking.openURL('tel:+19296097035');
  }, []);

  const handleEmail = useCallback(() => {
    Linking.openURL('mailto:support@kizola.protect');
  }, []);

  const openWhatsApp = useCallback(() => {
    Linking.openURL('https://wa.me/19296097035');
  }, []);

  const getPriorityConfig = useCallback((p: string) => {
    return PRIORITY_OPTIONS.find(opt => opt.id === p) || PRIORITY_OPTIONS[1];
  }, []);

  const handleResetSubmitted = useCallback(() => {
    setSubmitted(false);
  }, []);

  const handleViewActivity = useCallback(() => {
    router.push('/activity');
  }, [router]);

  const handleToggleCategoryDropdown = useCallback(() => {
    setShowCategoryDropdown(prev => !prev);
  }, []);

  const handleTogglePriorityDropdown = useCallback(() => {
    setShowPriorityDropdown(prev => !prev);
  }, []);

  const handleSelectCategory = useCallback((catId: string) => {
    setCategory(catId);
    setShowCategoryDropdown(false);
  }, []);

  const handleSelectPriority = useCallback((p: string) => {
    setPriority(p as 'low' | 'medium' | 'high' | 'urgent');
    setShowPriorityDropdown(false);
  }, []);

  // Derived
  const styles = useMemo(() => createStyles(theme), [theme]);

  const categoriesTranslated = useMemo(() => {
    return CATEGORIES.map(cat => ({
      ...cat,
      label: t(cat.labelKey),
    }));
  }, [t]);

  return {
    // State
    name,
    setName,
    email,
    setEmail,
    category,
    setCategory,
    priority,
    setPriority,
    message,
    setMessage,
    loading,
    showCategoryDropdown,
    showPriorityDropdown,
    submitted,
    activeTab,
    setActiveTab,
    chatMessages,
    chatInput,
    setChatInput,
    isTyping,

    // Refs
    fadeAnim,
    scrollY,

    // Handlers
    handleSubmit,
    handleSendMessage,
    handleCall,
    handleEmail,
    openWhatsApp,
    getPriorityConfig,
    handleResetSubmitted,
    handleViewActivity,
    handleToggleCategoryDropdown,
    handleTogglePriorityDropdown,
    handleSelectCategory,
    handleSelectPriority,

    // Derived
    categories: categoriesTranslated,
    styles,

    // Context
    theme,
    isDark,
    t,
    router,
    user,
    isDemoMode,
  };
}

const createStyles = (theme: any) => {
  const { width } = Dimensions.get('window');

  return StyleSheet.create({
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
      elevation: theme.isDark ? 8 : 1,
      shadowColor: theme.isDark ? '#000' : '#000',
      shadowOffset: { width: 0, height: theme.isDark ? 4 : 0.5 },
      shadowOpacity: theme.isDark ? 0.2 : 0.04,
      shadowRadius: theme.isDark ? 12 : 2,
    },
    contactCardBg: {
      ...StyleSheet.absoluteFillObject,
      opacity: theme.isDark ? 0.9 : 1,
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
      backgroundColor: theme.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.25)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    contactCardLabel: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.85)',
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
      borderColor: theme.isDark ? theme.cardBorderAlt : 'rgba(15, 23, 42, 0.08)',
      backgroundColor: theme.isDark ? 'transparent' : 'rgba(255,255,255,0.7)',
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
};

// Default export for Expo Router (this file is not a route)
export default function _notARoute() { return null; }
