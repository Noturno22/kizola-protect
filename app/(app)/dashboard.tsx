import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Modal,
  Animated,
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
  AlertCircle,
  Bell,
  X,
  Info,
  BookOpen,
  ClipboardList,
  Sun,
  Moon,
  FileText,
  Zap,
  Clock,
  LayoutDashboard
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
import { useTheme, Theme } from '@/providers/ThemeProvider';

const THEME_KEY = '@kizola_theme';

const NOTIFICATION_ICONS = {
  info: Info,
  success: CheckCircle2,
  warning: AlertCircle,
  alert: Bell,
};

const getNotificationColors = (isDark: boolean) => ({
  info: { bg: isDark ? '#1E3A5F' : '#DBEAFE', icon: '#3B82F6' },
  success: { bg: isDark ? '#14312A' : '#DCFCE7', icon: '#22C55E' },
  warning: { bg: isDark ? '#3B2A0A' : '#FEF3C7', icon: '#F59E0B' },
  alert: { bg: isDark ? '#3B1515' : '#FEE2E2', icon: '#EF4444' },
});

const getStatusConfig = (t: any) => ({
  pending: { color: '#F59E0B', label: t('common.pending') || 'Pendente', bg: 'rgba(245,158,11,0.15)' },
  in_progress: { color: '#3B82F6', label: t('common.in_progress') || 'Em Progresso', bg: 'rgba(59,130,246,0.15)' },
  completed: { color: '#22C55E', label: t('common.completed') || 'Concluído', bg: 'rgba(34,197,94,0.15)' },
  cancelled: { color: '#EF4444', label: t('common.cancelled') || 'Cancelado', bg: 'rgba(239,68,68,0.15)' },
});


// ─── Theme ────────────────────────────────────────────────────────────────────


// ─── Pulse Dot (for active status) ───────────────────────────────────────────

function PulseDot({ color }: { color: string }) {
  const anim = useState(() => new Animated.Value(1))[0];
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1.4, duration: 900, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <View style={{ width: 10, height: 10, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{
        position: 'absolute', width: 10, height: 10, borderRadius: 5,
        backgroundColor: color, opacity: 0.3, transform: [{ scale: anim }],
      }} />
      <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: color }} />
    </View>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ value, color, theme }: { value: number; color: string; theme: any }) {
  return (
    <View style={{ height: 4, backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', borderRadius: 4, overflow: 'hidden', marginTop: 10 }}>
      <LinearGradient
        colors={[color, color + 'CC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ height: '100%', width: `${value}%`, borderRadius: 4 }}
      />
    </View>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ value, label, color, bg, theme }: { value: string; label: string; color: string; bg: string; theme: any }) {
  return (
    <View style={{
      flex: 1,
      backgroundColor: theme.statCardBg,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.cardBorderAlt,
      padding: 14,
      alignItems: 'center',
    }}>
      <Text style={{ fontSize: 22, fontWeight: '800', color, letterSpacing: -0.5, marginBottom: 3 }}>{value}</Text>
      <Text style={{ fontSize: 10, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>
    </View>
  );
}

// ─── Glowing Shield ───────────────────────────────────────────────────────────

function GlowingShield({ theme }: { theme: any }) {
  return (
    <View style={{ width: 90, height: 90, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{
        position: 'absolute', width: 78, height: 78, borderRadius: 39,
        backgroundColor: theme.shieldGlow,
      }} />
      <Shield size={50} color={theme.accent} strokeWidth={1.4} />
      <View style={{
        position: 'absolute', bottom: 12, right: 12,
        width: 24, height: 24, borderRadius: 12,
        backgroundColor: theme.accent,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: theme.accent, shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6, shadowRadius: 8, elevation: 4,
      }}>
        <CheckCircle2 size={14} color="#FFF" strokeWidth={2.5} />
      </View>
    </View>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const router = useRouter();
  const { user, isDemoMode } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { t, i18n: i18nInstance } = useTranslation();

  const { theme, isDark, toggleTheme } = useTheme();

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
        if (stored) {
          const allRequests = stored;
          setRecentRequests(allRequests.slice(0, 3));
        }
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
    ? nextBillingObj.toLocaleDateString('pt-AO', { month: 'long', day: 'numeric', year: 'numeric' })
    : (t('common.notApplicable') === 'common.notApplicable' ? 'Não aplicável' : t('common.notApplicable'));

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
    } else if (now < currentStart) {
      usagePercentage = 0;
    }
    usagePercentage = Math.max(0, Math.min(100, usagePercentage));
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const diffH = (Date.now() - date.getTime()) / 3600000;
    if (diffH < 1) return 'Agora';
    if (diffH < 24) return `${Math.floor(diffH)}h atrás`;
    if (diffH < 48) return 'Ontem';
    return date.toLocaleDateString('pt-AO', { month: 'short', day: 'numeric' });
  };

  const quickActions = [
    { label: t('dashboard.viewBenefits') || 'Ver\nBenefícios', sub: t('dashboard.accessServices') || 'Acesse seus serviços', icon: Gift, color: theme.accentBlue, bg: 'rgba(59,130,246,0.14)', route: '/benefits' },
    { label: t('dashboard.requestSupport') || 'Pedir\nSuporte', sub: t('dashboard.getHelpNow') || 'Obtenha ajuda agora', icon: MessageCircle, color: theme.accent, bg: 'rgba(0,200,180,0.12)', route: '/support' },
    { label: t('dashboard.myPlan') || 'Meu\nPlano', sub: t('dashboard.manageSubscription') || 'Gerir assinatura', icon: TrendingUp, color: theme.accentPurple, bg: 'rgba(139,92,246,0.14)', route: '/plan-details' },
    { label: t('dashboard.documents') || 'Documentos', sub: t('dashboard.yourFiles') || 'Os seus arquivos', icon: FileText, color: theme.accentAmber, bg: 'rgba(245,158,11,0.14)', route: '/documents' },
  ];

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.background }]} />
      <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <LinearGradient colors={theme.headerGradient} style={styles.header}>
          {/* Grid overlay */}
          <View style={styles.gridOverlay} pointerEvents="none">
            {Array.from({ length: 6 }).map((_, i) => (
              <View key={i} style={[styles.gridLine, { top: i * 24 }]} />
            ))}
          </View>
          {/* Radial glow */}
          <View style={styles.radialGlow} pointerEvents="none" />

          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>{t('dashboard.welcomeBack') || 'Bem-vindo de volta,'}</Text>
              <Text style={styles.userName}>{user?.name || t('common.member') || 'Membro'}</Text>
            </View>

            <View style={styles.headerActions}>
              {user?.role === 'admin' && (
                <TouchableOpacity
                  style={[styles.iconBtn, { backgroundColor: theme.accent + '25', borderColor: theme.accent + '40', padding: 8 }]}
                  onPress={() => router.push('/(app)/admin/dashboard')}
                  activeOpacity={0.7}
                >
                  <View style={{ backgroundColor: theme.accent + '20', borderRadius: 8, padding: 6 }}>
                    <LayoutDashboard size={22} color={theme.accent} strokeWidth={1.8} />
                  </View>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.iconBtn} onPress={toggleTheme}>
                {isDark ? <Sun size={19} color={theme.text} /> : <Moon size={19} color={theme.text} />}
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => setShowNotifications(true)}>
                <Bell size={20} color={theme.text} />
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn}>
                <Shield size={20} color={theme.text} />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* ── Membership Card ── */}
        <View style={styles.cardContainer}>
          <LinearGradient
            colors={planInfo?.color || theme.cardGradient}
            style={[styles.membershipCard, { borderColor: theme.cardBorder }]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            {/* Inner glow top-right */}
            <View style={styles.cardGlowTR} pointerEvents="none" />
            <View style={styles.cardGlowBL} pointerEvents="none" />

            <View style={styles.cardHeader}>
              <View style={[styles.planBadge, { borderColor: theme.accent }]}>
                <Zap size={12} color={theme.accent} />
                <Text style={[styles.planBadgeText, { color: theme.accent }]}>
                  {planInfo?.name ? `${planInfo.name} Plan` : (t('common.noPlan') === 'common.noPlan' ? 'Sem Plano' : t('common.noPlan'))}
                </Text>
              </View>
              <View style={[styles.statusBadge, {
                backgroundColor: isActive ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                borderColor: isActive ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)',
              }]}>
                <PulseDot color={isActive ? '#22C55E' : '#EF4444'} />
                <Text style={[styles.statusText, { color: isActive ? '#22C55E' : '#EF4444' }]}>
                  {isActive ? t('common.active') || 'Ativo' : t('common.inactive') || 'Inativo'}
                </Text>
              </View>
            </View>

            <View style={styles.cardBody}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{t('dashboard.protectionStatus')}</Text>
                <Text style={styles.cardSubtitle}>{isActive && hasPlan ? t('dashboard.protected') : t('dashboard.notProtected')}</Text>
                <ProgressBar value={usagePercentage} color={theme.accent} theme={theme} />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                  <Text style={{ fontSize: 10, color: theme.isDark || planInfo?.color ? 'rgba(255,255,255,0.4)' : theme.textMuted }}>{t('dashboard.planUsage') || 'Uso do plano'}</Text>
                  <Text style={{ fontSize: 10, color: theme.accent, fontWeight: '600' }}>{usagePercentage}%</Text>
                </View>
              </View>
              <GlowingShield theme={theme} />
            </View>

            <View style={styles.cardFooter}>
              <View style={styles.billingInfo}>
                <Calendar size={14} color={theme.accent} />
                <Text style={styles.billingLabel}>{t('dashboard.nextBilling') || 'Próxima cobrança:'}</Text>
                <Text style={[styles.billingDate, { color: theme.accent }]}>{nextBillingText}</Text>
              </View>
              <ChevronRight size={16} color={theme.isDark || planInfo?.color ? "rgba(255,255,255,0.3)" : theme.textMuted} />
            </View>
          </LinearGradient>
        </View>

        {/* ── Stats Row ── */}
        <View style={styles.statsRow}>
          <StatCard value={String(planInfo?.benefits?.length || 0)} label={t('dashboard.statsBenefits') || "Benefícios"} color={theme.accent} bg="" theme={theme} />
          <StatCard value={String(recentRequests.length)} label={t('dashboard.statsRequests') || "Pedidos"} color={theme.accentBlue} bg="" theme={theme} />
          <StatCard value={String(notifications.length)} label={t('dashboard.notifications') || "Notificações"} color={theme.accentPurple} bg="" theme={theme} />
        </View>

        {/* ── Quick Actions ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('dashboard.quickActions')}</Text>
          <View style={styles.actionsGrid}>

            {quickActions.map((action, i) => {
              const Icon = action.icon;
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.actionCard, { backgroundColor: theme.actionCardBg, borderColor: theme.cardBorderAlt }]}
                  onPress={() => router.push(action.route as any)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.actionIcon, { backgroundColor: action.bg }]}>
                    <Icon size={22} color={action.color} strokeWidth={1.8} />
                  </View>
                  <Text style={[styles.actionTitle, { color: theme.text }]}>{action.label}</Text>
                  <Text style={[styles.actionSubtitle, { color: theme.textMuted }]}>{action.sub}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Recent Activity ── */}
        {recentRequests.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('dashboard.recentActivity')}</Text>
              <TouchableOpacity onPress={() => router.push('/activity')}>
                <Text style={[styles.seeAllLink, { color: theme.seeAllColor }]}>{t('common.seeAll') || 'Ver tudo'}</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.activityList, { backgroundColor: theme.surface, borderColor: theme.cardBorderAlt }]}>
              {recentRequests.map((request, idx) => {
                const statusCfg = getStatusConfig(t);
                const cfg = statusCfg[request.status as keyof typeof statusCfg];

                return (
                  <TouchableOpacity
                    key={request.id}
                    style={[styles.activityItem, {
                      borderBottomColor: theme.cardBorderAlt,
                      borderBottomWidth: idx < recentRequests.length - 1 ? 1 : 0,
                    }]}
                    onPress={() => router.push('/activity')}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.activityIcon, { backgroundColor: cfg.bg }]}>
                      <ClipboardList size={18} color={cfg.color} strokeWidth={1.8} />
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={[styles.activityTitle, { color: theme.text }]}>
                        {BENEFIT_CATEGORIES[request.category as keyof typeof BENEFIT_CATEGORIES]?.title || 'Pedido de Suporte'}
                      </Text>
                      <Text style={[styles.activitySubtitle, { color: theme.textSecondary }]} numberOfLines={1}>
                        {request.message.substring(0, 48)}…
                      </Text>
                    </View>
                    <View style={styles.activityMeta}>
                      <View style={[styles.statusPill, { backgroundColor: cfg.bg }]}>
                        <View style={[styles.statusDot, { backgroundColor: cfg.color }]} />
                        <Text style={[styles.statusLabel, { color: cfg.color }]}>{cfg.label}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                        <Clock size={10} color={theme.textMuted} />
                        <Text style={[styles.activityTime, { color: theme.textMuted }]}>{formatDate(request.created_at)}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ── Learning Resources ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('dashboard.knowledgeBase')}</Text>
            <TouchableOpacity onPress={() => router.push('/learn')}>
              <Text style={[styles.seeAllLink, { color: theme.seeAllColor }]}>{t('common.seeAll')}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.learningCard, { backgroundColor: theme.learningBg, borderColor: theme.learningBorder }]}
            onPress={() => router.push('/learn')}
            activeOpacity={0.8}
          >
            <View style={[styles.learningIconContainer, { backgroundColor: theme.learningIconBg }]}>
              <BookOpen size={26} color={theme.accent} strokeWidth={1.8} />
            </View>
            <View style={styles.learningContent}>
              <Text style={[styles.learningTitle, { color: theme.text }]}>{t('dashboard.guidesAndResources') || 'Guias e Recursos'}</Text>
              <Text style={[styles.learningDescription, { color: theme.textSecondary }]}>
                {t('dashboard.guidesDescription') || 'Explore guias sobre impostos, imigração, habitação e mais'}
              </Text>
            </View>

            <ChevronRight size={20} color={theme.textMuted} />
          </TouchableOpacity>
        </View>

        {/* ── Plan Benefits ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('dashboard.planBenefits') || 'Benefícios do Plano'}</Text>
            <TouchableOpacity onPress={() => router.push('/benefits')}>
              <Text style={[styles.seeAllLink, { color: theme.seeAllColor }]}>{t('common.seeAll')}</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.benefitsList, { backgroundColor: theme.surface, borderColor: theme.cardBorderAlt }]}>
            {(() => {
              const benefits = t(`plans.${user?.plan}.benefits`, { returnObjects: true });
              const benefitsArray = Array.isArray(benefits) ? benefits : [];
              return benefitsArray.slice(0, 4).map((benefit, index, arr) => (
                <View key={index} style={[styles.benefitItem, {
                  borderBottomColor: theme.cardBorderAlt,
                  borderBottomWidth: index < arr.length - 1 ? 1 : 0,
                }]}>
                  <View style={[styles.benefitBullet, { backgroundColor: theme.accent + '18' }]}>
                    <CheckCircle2 size={14} color={theme.accent} strokeWidth={2} />
                  </View>
                  <Text style={[styles.benefitText, { color: theme.textSecondary }]}>{benefit}</Text>
                </View>
              ));
            })()}
          </View>
        </View>

        {/* ── Estamos para Ajudar-te ── */}
        <View style={[styles.section, { marginBottom: 36 }]}>
          <TouchableOpacity
            style={[styles.helpCard, { backgroundColor: theme.helpCardBg, borderColor: theme.helpCardBorder }]}
            onPress={() => router.push('/support')}
            activeOpacity={0.8}
          >
            <View style={[styles.helpIconContainer, { backgroundColor: 'rgba(59,130,246,0.15)' }]}>
              <MessageCircle size={22} color={theme.accentBlue} strokeWidth={1.8} />
            </View>
            <View style={styles.helpContent}>
              <Text style={[styles.helpTitle, { color: theme.text }]}>{t('dashboard.helpTitle') || 'Estamos para Ajudar-te'}</Text>
              <Text style={[styles.helpDescription, { color: theme.textSecondary }]}>
                {t('dashboard.helpDescription') || 'Disponíveis 7 dias por semana, 24 horas por dia, 365 dias por ano.'}
              </Text>
            </View>

            <ChevronRight size={20} color={theme.accentBlue} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Notifications Modal ── */}
      <Modal visible={showNotifications} transparent animationType="slide" onRequestClose={() => setShowNotifications(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.cardBorderAlt }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>{t('dashboard.notifications') || 'Notificações'}</Text>
              <View style={styles.modalActions}>

                {unreadCount > 0 && (
                  <TouchableOpacity onPress={markAllAsRead} style={[styles.markAllButton, { backgroundColor: theme.accent + '18' }]}>
                    <Text style={[styles.markAllText, { color: theme.accent }]}>{t('dashboard.markAllAsRead') || 'Marcar todas'}</Text>
                  </TouchableOpacity>

                )}
                <TouchableOpacity onPress={() => setShowNotifications(false)} style={[styles.closeButton, { backgroundColor: theme.background }]}>
                  <X size={20} color={theme.text} />
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView contentContainerStyle={styles.notificationsList}>
              {notifications.length === 0 ? (
                <View style={styles.emptyNotifications}>
                  <Bell size={44} color={theme.textMuted} />
                  <Text style={[styles.emptyTitle, { color: theme.text }]}>Sem notificações</Text>
                  <Text style={[styles.emptyDescription, { color: theme.textSecondary }]}>Está tudo em dia!</Text>
                </View>
              ) : (
                notifications.map((n) => {
                  const Icon = NOTIFICATION_ICONS[n.type as keyof typeof NOTIFICATION_ICONS];
                  const notifColors = getNotificationColors(isDark);
                  const colors = notifColors[n.type as keyof typeof notifColors];
                  return (
                    <TouchableOpacity
                      key={n.id}
                      style={[styles.notificationItem, { backgroundColor: n.read ? 'transparent' : theme.notifBg }]}
                      onPress={() => markAsRead(n.id)}
                    >
                      <View style={[styles.notificationIconContainer, { backgroundColor: colors.bg }]}>
                        <Icon size={18} color={colors.icon} />
                      </View>
                      <View style={styles.notificationContent}>
                        <Text style={[styles.notificationTitle, { color: theme.text }]}>{n.title}</Text>
                        <Text style={[styles.notificationMessage, { color: theme.textSecondary }]} numberOfLines={2}>{n.message}</Text>
                        <Text style={[styles.notificationTime, { color: theme.textMuted }]}>{formatDate(n.created_at)}</Text>
                      </View>
                      {!n.read && <View style={[styles.unreadDot, { backgroundColor: theme.accent }]} />}
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (theme: Theme, planInfo: any) => StyleSheet.create({
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
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: { fontSize: 11, fontWeight: '600' },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    maxHeight: '82%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  modalActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  markAllButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  markAllText: { fontSize: 12, fontWeight: '600' },
  closeButton: {
    width: 36, height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationsList: { padding: 14 },
  emptyNotifications: { alignItems: 'center', paddingVertical: 52, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyDescription: { fontSize: 14 },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
  },
  notificationIconContainer: {
    width: 38, height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  notificationContent: { flex: 1 },
  notificationTitle: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  notificationMessage: { fontSize: 12, lineHeight: 17, marginBottom: 4 },
  notificationTime: { fontSize: 11 },
  unreadDot: {
    width: 8, height: 8,
    borderRadius: 4,
    marginTop: 4,
    flexShrink: 0,
  },
});