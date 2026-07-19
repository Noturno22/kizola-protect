import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Shield,
  ChevronRight,
  Gift,
  MessageCircle,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Bell,
  BookOpen,
  ClipboardList,
  Sun,
  Moon,
  FileText,
  Zap,
  Clock,
  LayoutDashboard,
} from 'lucide-react-native';
import { useAuth } from '@/providers/AuthProvider';
import { useNotifications } from '@/providers/NotificationProvider';
import {
  supabase,
  PLANS,
  SupportRequest,
  isSupabaseConfigured,
  BENEFIT_CATEGORIES,
} from '@/lib/supabase';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { getSecureItem, SECURE_KEYS } from '@/lib/secureStorage';
import { useTheme } from '@/providers/ThemeProvider';

function mapToLocale(language: string): string {
  switch (language) {
    case 'pt': return 'pt-BR';
    case 'fr': return 'fr-FR';
    case 'es':
    case 'es-US': return 'es-ES';
    case 'zh': return 'zh-CN';
    case 'ja': return 'ja-JP';
    case 'ko': return 'ko-KR';
    case 'vi': return 'vi-VN';
    case 'tl': return 'tl-PH';
    case 'ar': return 'ar-SA';
    case 'ru': return 'ru-RU';
    case 'hi': return 'hi-IN';
    case 'bn': return 'bn-BD';
    default: return 'en-US';
  }
}

const getStatusConfig = (t: any) => ({
  pending: { color: '#F59E0B', label: t('common.pending') || 'Pendente', bg: 'rgba(245,158,11,0.15)' },
  in_progress: { color: '#3B82F6', label: t('common.in_progress') || 'Em Progresso', bg: 'rgba(59,130,246,0.15)' },
  completed: { color: '#22C55E', label: t('common.completed') || 'Concluído', bg: 'rgba(34,197,94,0.15)' },
  cancelled: { color: '#EF4444', label: t('common.cancelled') || 'Cancelado', bg: 'rgba(239,68,68,0.15)' },
});

export function useDashboard() {
  const router = useRouter();
  const { user, isDemoMode } = useAuth();
  const { notifications, unreadCount } = useNotifications();
  const { theme, isDark, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const hasPlan = user?.plan && user.plan !== 'none';
  const planInfo = hasPlan ? PLANS[user.plan as keyof typeof PLANS] : null;
  const styles = useMemo(() => createStyles(theme, planInfo), [theme, planInfo]);

  const [refreshing, setRefreshing] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [recentRequests, setRecentRequests] = useState<SupportRequest[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (!isDemoMode && isSupabaseConfigured()) {
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        setSubscription(subData);

        const { data: requestsData } = await supabase
          .from('support_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);
        setRecentRequests(requestsData || []);
      } else {
        const stored = await getSecureItem<SupportRequest[]>(SECURE_KEYS.SUPPORT_REQUESTS(user.id));
        if (stored) setRecentRequests(stored.slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, [user]));

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const isActive = user?.status === 'active';

  let nextBillingObj: Date | null = null;
  const cycleLengthMs = 30 * 24 * 60 * 60 * 1000;

  if (subscription?.next_billing_date) {
    nextBillingObj = new Date(subscription.next_billing_date);
  } else if (user?.created_at && isActive && hasPlan) {
    const createdDate = new Date(user.created_at).getTime();
    const now = Date.now();
    const timePassed = Math.max(0, now - createdDate);
    const cyclesPassed = Math.floor(timePassed / cycleLengthMs);
    nextBillingObj = new Date(createdDate + (cyclesPassed + 1) * cycleLengthMs);
  }

  const nextBillingText = (isActive && hasPlan && nextBillingObj)
    ? new Intl.DateTimeFormat(mapToLocale(i18n.language), { month: 'long', day: 'numeric', year: 'numeric' }).format(nextBillingObj)
    : t('common.notApplicable');

  let usagePercentage = 0;
  if (isActive && hasPlan && nextBillingObj) {
    const next = nextBillingObj.getTime();
    const now = Date.now();
    let currentStart = next - cycleLengthMs;

    if (subscription?.start_date) {
      const start = new Date(subscription.start_date).getTime();
      if (next - start <= cycleLengthMs && next > start) {
        currentStart = start;
      }
    }

    if (now >= currentStart && now <= next) {
      const cycle = next - currentStart;
      usagePercentage = Math.round(((now - currentStart) / cycle) * 100);
    } else if (now > next) {
      usagePercentage = 100;
    } else {
      usagePercentage = 0;
    }
    usagePercentage = Math.max(0, Math.min(100, usagePercentage));
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const diffH = (Date.now() - date.getTime()) / 3600000;
    const locale = mapToLocale(i18n.language);
    if (diffH < 1) return t('dashboard.justNow');
    if (diffH < 24) return t('dashboard.hoursAgo', { count: Math.floor(diffH) });
    if (diffH < 48) return t('dashboard.yesterday');
    return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
  };

  const quickActions = [
    { label: t('dashboard.viewBenefits') || 'Ver\nBenefícios', sub: t('dashboard.accessServices') || 'Acesse seus serviços', icon: Gift, color: theme.accentBlue, bg: 'rgba(59,130,246,0.14)', route: '/benefits' },
    { label: t('dashboard.requestSupport') || 'Pedir\nSuporte', sub: t('dashboard.getHelpNow') || 'Obtenha ajuda agora', icon: MessageCircle, color: theme.accent, bg: 'rgba(0,200,180,0.12)', route: '/support' },
    { label: t('dashboard.myPlan') || 'Meu\nPlano', sub: t('dashboard.manageSubscription') || 'Gerir assinatura', icon: TrendingUp, color: theme.accentPurple, bg: 'rgba(139,92,246,0.14)', route: hasPlan ? '/plan-details' : '/plans' },
    { label: t('dashboard.documents') || 'Documentos', sub: t('dashboard.yourFiles') || 'Os seus arquivos', icon: FileText, color: theme.accentAmber, bg: 'rgba(245,158,11,0.14)', route: '/documents' },
  ];

  return {
    router,
    user,
    isDemoMode,
    theme,
    isDark,
    toggleTheme,
    t,
    hasPlan,
    planInfo,
    styles,
    refreshing,
    subscription,
    recentRequests,
    showNotifications,
    setShowNotifications,
    loading,
    fetchData,
    onRefresh,
    isActive,
    nextBillingObj,
    nextBillingText,
    usagePercentage,
    formatDate,
    quickActions,
    getStatusConfig,
    notifications,
    unreadCount,
  };
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (theme: any, planInfo: any) =>
  StyleSheet.create({
    header: {
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 56,
      overflow: 'hidden',
      position: 'relative',
    },
    gridOverlay: {
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
    },
    gridLine: {
      position: 'absolute',
      left: 0, right: 0, height: 1,
      backgroundColor: theme.isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.02)',
    },
    radialGlow: {
      position: 'absolute',
      top: -60, right: -60,
      width: 240, height: 240,
      borderRadius: 120,
      backgroundColor: theme.accent + '12',
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      position: 'relative',
      zIndex: 2,
    },
    greeting: {
      fontSize: 13,
      color: theme.textSecondary,
      marginBottom: 4,
      letterSpacing: 0.2,
    },
    userName: {
      fontSize: 26,
      fontWeight: '800',
      color: theme.text,
      letterSpacing: -0.5,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    iconBtn: {
      width: 40, height: 40,
      borderRadius: 12,
      backgroundColor: theme.isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.05)',
      borderWidth: 1,
      borderColor: theme.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    badge: {
      position: 'absolute',
      top: -4, right: -4,
      backgroundColor: '#EF4444',
      borderRadius: 10,
      minWidth: 18, height: 18,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
      borderWidth: 2,
      borderColor: theme.background,
    },
    badgeText: { color: '#FFF', fontSize: 9, fontWeight: '700' },
    cardContainer: {
      marginTop: -30,
      marginHorizontal: 16,
      zIndex: 10,
    },
    membershipCard: {
      borderRadius: 22,
      padding: 20,
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.45,
      shadowRadius: 24,
      elevation: 16,
      overflow: 'hidden',
      position: 'relative',
    },
    cardGlowTR: {
      position: 'absolute',
      top: -50, right: -50,
      width: 200, height: 200,
      borderRadius: 100,
      backgroundColor: theme.accent + '18',
    },
    cardGlowBL: {
      position: 'absolute',
      bottom: -30, left: 10,
      width: 140, height: 140,
      borderRadius: 70,
      backgroundColor: theme.accentBlue + '10',
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 18,
    },
    planBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      backgroundColor: 'transparent',
    },
    planBadgeText: { fontSize: 12, fontWeight: '600' },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      borderWidth: 1,
    },
    statusText: { fontSize: 9, fontWeight: '600' },
    cardBody: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 18,
    },
    cardTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: theme.isDark || planInfo?.color ? '#FFF' : theme.text,
      marginBottom: 4,
      letterSpacing: -0.5,
    },
    cardSubtitle: {
      fontSize: 13,
      color: theme.isDark || planInfo?.color ? 'rgba(255,255,255,0.55)' : theme.textSecondary,
      lineHeight: 18,
    },
    cardFooter: {
      borderTopWidth: 1,
      borderTopColor: theme.isDark || planInfo?.color ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
      paddingTop: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    billingInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    billingLabel: { fontSize: 12, color: theme.isDark || planInfo?.color ? 'rgba(255,255,255,0.5)' : theme.textMuted },
    billingDate: { fontSize: 12, fontWeight: '600' },
    statsRow: {
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 16,
      marginTop: 18,
    },
    section: {
      marginTop: 22,
      paddingHorizontal: 16,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: -0.3,
      marginBottom: 14,
    },
    seeAllLink: { fontSize: 13, fontWeight: '600' },
    actionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    actionCard: {
      width: '47.5%',
      borderRadius: 18,
      borderWidth: 1,
      padding: 15,
      alignItems: 'flex-start',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 2,
    },
    actionIcon: {
      width: 46, height: 46,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
    },
    actionTitle: {
      fontSize: 13,
      fontWeight: '700',
      marginBottom: 3,
      lineHeight: 17,
    },
    actionSubtitle: { fontSize: 11 },
    activityList: {
      borderRadius: 18,
      borderWidth: 1,
      overflow: 'hidden',
    },
    activityItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      gap: 12,
    },
    activityIcon: {
      width: 40, height: 40,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
    },
    activityContent: { flex: 1, minWidth: 0 },
    activityTitle: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
    activitySubtitle: { fontSize: 11 },
    activityMeta: { alignItems: 'flex-end', gap: 5, flexShrink: 0 },
    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 8,
    },
    statusDot: { width: 5, height: 5, borderRadius: 2.5 },
    statusLabel: { fontSize: 9, fontWeight: '700' },
    activityTime: { fontSize: 10 },
    learningCard: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
    },
    learningIconContainer: {
      width: 50, height: 50,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
      flexShrink: 0,
    },
    learningContent: { flex: 1 },
    learningTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
    learningDescription: { fontSize: 12, lineHeight: 17 },
    benefitsList: {
      borderRadius: 18,
      padding: 14,
      borderWidth: 1,
    },
    benefitItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 10,
    },
    benefitBullet: {
      width: 28, height: 28,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
    },
    benefitText: { flex: 1, fontSize: 13, lineHeight: 18 },
    helpCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      borderRadius: 18,
      padding: 18,
      borderWidth: 1,
    },
    helpIconContainer: {
      width: 48, height: 48,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
    },
    helpContent: { flex: 1 },
    helpTitle: { fontSize: 15, fontWeight: '700', marginBottom: 3 },
    helpDescription: { fontSize: 12, lineHeight: 17 },
  });
// Default export for Expo Router (this file is not a route)
export default function _notARoute() { return null; }
