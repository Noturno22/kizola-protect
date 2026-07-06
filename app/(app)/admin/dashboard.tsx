import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useTranslation } from 'react-i18next';
import { 
  Users, 
  ShieldCheck, 
  MessageSquare, 
  TrendingUp, 
  ChevronRight,
  Bell,
  Settings,
  LayoutDashboard,
  LogOut,
  ArrowUpRight,
  ClipboardList,
  FileText,
  ShieldAlert,
  DollarSign
} from 'lucide-react-native';
import { AdminStatCard } from '@/components/AdminStatCard';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  getDashboardStats,
  getRevenueChartData,
  getRecentUsers,
  getSatisfactionAnalytics,
  getBenefitsAnalytics,
  getAtendimentoAnalytics,
  getFinanceiroAnalytics,
  formatTimeAgo,
  formatCurrency,
  formatNumber,
  type DashboardStats,
  type RevenueDataPoint,
  type RecentUser,
  type SatisfactionAnalytics,
  type BenefitsAnalytics,
  type AtendimentoAnalytics,
  type FinanceiroAnalytics,
} from '@/services/dashboard';

const { width } = Dimensions.get('window');

function AdminDashboard() {
  const { theme, isDark } = useTheme();
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [satisfactionData, setSatisfactionData] = useState<SatisfactionAnalytics | null>(null);
  const [benefitsData, setBenefitsData] = useState<BenefitsAnalytics | null>(null);
  const [atendimentoData, setAtendimentoData] = useState<AtendimentoAnalytics | null>(null);
  const [financeiroData, setFinanceiroData] = useState<FinanceiroAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [
        statsData,
        revenueData,
        usersData,
        satisfactionDataResult,
        benefitsDataResult,
        atendimentoDataResult,
        financeiroDataResult,
      ] = await Promise.all([
        getDashboardStats(),
        getRevenueChartData(),
        getRecentUsers(5),
        getSatisfactionAnalytics(),
        getBenefitsAnalytics(),
        getAtendimentoAnalytics(),
        getFinanceiroAnalytics(),
      ]);
      setStats(statsData);
      setRevenueData(revenueData);
      setRecentUsers(usersData);
      setSatisfactionData(satisfactionDataResult);
      setBenefitsData(benefitsDataResult);
      setAtendimentoData(atendimentoDataResult);
      setFinanceiroData(financeiroDataResult);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const maxRevenue = Math.max(...revenueData.map(d => d.revenue), 1);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>{t('admin.loadingDashboard')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>{t('admin.panel')}</Text>
            <Text style={[styles.name, { color: theme.text }]}>{t('admin.dashboard')}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.surfaceElevated }]}>
              <Bell size={20} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => signOut()}
              style={[styles.iconButton, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}
            >
              <LogOut size={20} color={theme.error} />
            </TouchableOpacity>
          </View>
        </View>

        {error && (
          <View style={[styles.errorBanner, { backgroundColor: theme.error + '15', borderColor: theme.error + '30' }]}>
            <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
            <TouchableOpacity onPress={fetchData}>
              <Text style={[styles.retryText, { color: theme.error }]}>{t('admin.retry')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Stats Grid - Primary */}
        <View style={styles.statsGrid}>
          <AdminStatCard 
            title={t('admin.totalUsers')}
            value={stats ? formatNumber(stats.totalUsers) : '0'}
            icon={Users}
            color="#3B82F6"
            trend={stats && stats.userGrowthPercent >= 0 ? 'up' : 'down'}
            trendValue={stats ? `${stats.userGrowthPercent >= 0 ? '+' : ''}${stats.userGrowthPercent}%` : '0%'}
          />
          <AdminStatCard 
            title={t('admin.activePlans') || 'Assinaturas Ativas'}
            value={stats ? formatNumber(stats.activePlans) : '0'}
            icon={ShieldCheck}
            color="#10B981"
            trend={stats && stats.planGrowthPercent >= 0 ? 'up' : 'down'}
            trendValue={stats ? `${stats.planGrowthPercent >= 0 ? '+' : ''}${stats.planGrowthPercent}%` : '0%'}
          />
          <AdminStatCard 
            title={t('admin.openCases') || 'Casos Abertos'}
            value={stats ? formatNumber(stats.openCases) : '0'}
            icon={MessageSquare}
            color="#F59E0B"
            trend={stats && stats.ticketTrendPercent <= 0 ? 'down' : 'up'}
            trendValue={stats ? `${stats.ticketTrendPercent >= 0 ? '+' : ''}${stats.ticketTrendPercent}%` : '0%'}
          />
          <AdminStatCard 
            title={t('admin.satisfactionRate') || 'Taxa Satisfação'}
            value={satisfactionData ? `${satisfactionData.satisfactionRate}%` : (stats ? `${stats.satisfactionRate}%` : '96%')}
            icon={ShieldCheck}
            color="#8B5CF6"
            trend="up"
            trendValue="100%"
          />
        </View>

        {/* Stats Grid - Atendimento */}
        {atendimentoData && (
          <>
          <View style={[styles.sectionTitle, { color: theme.text, marginTop: 24, marginBottom: 16 }]}>Atendimento</View>
          <View style={styles.statsGrid}>
            <AdminStatCard 
              title="Pendentes"
              value={formatNumber(atendimentoData.pendingCount)}
              icon={MessageSquare}
              color="#F59E0B"
              trend="neutral"
              trendValue="—"
            />
            <AdminStatCard 
              title="Em Progresso"
              value={formatNumber(atendimentoData.inProgressCount)}
              icon={MessageSquare}
              color="#3B82F6"
              trend="neutral"
              trendValue="—"
            />
            <AdminStatCard 
              title="Resolvidos"
              value={formatNumber(atendimentoData.resolvedCount)}
              icon={ShieldCheck}
              color="#22C55E"
              trend="up"
              trendValue="—"
            />
            <AdminStatCard 
              title="Total de Casos"
              value={formatNumber(atendimentoData.totalCount)}
              icon={ClipboardList}
              color="#8B5CF6"
              trend="neutral"
              trendValue="—"
            />
          </View>
        </>
        )}

        {/* Stats Grid - Financeiro */}
        {financeiroData && (
          <>
          <View style={[styles.sectionTitle, { color: theme.text, marginTop: 24, marginBottom: 16 }]}>Financeiro</View>
          <View style={styles.statsGrid}>
            <AdminStatCard 
              title="MRR"
              value={formatCurrency(financeiroData.mrr)}
              icon={DollarSign}
              color="#10B981"
              trend="up"
              trendValue="—"
            />
            <AdminStatCard 
              title="ARR"
              value={formatCurrency(financeiroData.arr)}
              icon={TrendingUp}
              color="#059669"
              trend="up"
              trendValue="—"
            />
            <AdminStatCard 
              title="Assinaturas Ativas"
              value={formatNumber(financeiroData.activeSubscriptions)}
              icon={Users}
              color="#3B82F6"
              trend="neutral"
              trendValue="—"
            />
            <AdminStatCard 
              title="Status Stripe"
              value={financeiroData.stripeStatus === 'connected' ? 'Conectado' : 'Desconectado'}
              icon={ShieldAlert}
              color={financeiroData.stripeStatus === 'connected' ? '#22C55E' : '#EF4444'}
              trend="neutral"
              trendValue="—"
            />
          </View>
        </>
        )}

        {/* Satisfaction Analytics Detail */}
        {satisfactionData && (
          <View style={[styles.satisfactionCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.cardBorder }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Análise de Satisfação</Text>
              <TouchableOpacity onPress={() => router.push('/(app)/admin/reports')}>
                <Text style={[styles.seeMore, { color: theme.accent }]}>{t('admin.seeAll')}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.satisfactionStats}>
              <View style={styles.satisfactionStatItem}>
                <Text style={[styles.satisfactionStatValue, { color: '#22C55E' }]}>{satisfactionData.satisfactionRate}%</Text>
                <Text style={[styles.satisfactionStatLabel, { color: theme.textSecondary }]}>Taxa de Resolução</Text>
              </View>
              <View style={styles.satisfactionStatDivider} />
              <View style={styles.satisfactionStatItem}>
                <Text style={[styles.satisfactionStatValue, { color: theme.accent }]}>{satisfactionData.avgRating.toFixed(1)}</Text>
                <Text style={[styles.satisfactionStatLabel, { color: theme.textSecondary }]}>Avaliação Média</Text>
              </View>
              <View style={styles.satisfactionStatDivider} />
              <View style={styles.satisfactionStatItem}>
                <Text style={[styles.satisfactionStatValue, { color: theme.text }]}>{satisfactionData.totalRatings}</Text>
                <Text style={[styles.satisfactionStatLabel, { color: theme.textSecondary }]}>Total de Avaliações</Text>
              </View>
            </View>
            <View style={styles.satisfactionBreakdown}>
              <Text style={[styles.breakdownTitle, { color: theme.text }]}>Por Categoria</Text>
              <View style={styles.breakdownRow}>
                <View style={styles.breakdownItem}>
                  <Text style={[styles.breakdownItemLabel, { color: '#3B82F6' }]}>Suporte</Text>
                  <Text style={[styles.breakdownItemValue, { color: theme.text }]}>{satisfactionData.ratingsByType.support.rate}%</Text>
                  <Text style={[styles.breakdownItemCount, { color: theme.textSecondary }]}>{satisfactionData.ratingsByType.support.resolved}/{satisfactionData.ratingsByType.support.total}</Text>
                </View>
                <View style={styles.breakdownItem}>
                  <Text style={[styles.breakdownItemLabel, { color: '#F59E0B' }]}>Habitação</Text>
                  <Text style={[styles.breakdownItemValue, { color: theme.text }]}>{satisfactionData.ratingsByType.housing.rate}%</Text>
                  <Text style={[styles.breakdownItemCount, { color: theme.textSecondary }]}>{satisfactionData.ratingsByType.housing.resolved}/{satisfactionData.ratingsByType.housing.total}</Text>
                </View>
                <View style={styles.breakdownItem}>
                  <Text style={[styles.breakdownItemLabel, { color: '#8B5CF6' }]}>Finanças</Text>
                  <Text style={[styles.breakdownItemValue, { color: theme.text }]}>{satisfactionData.ratingsByType.finance.rate}%</Text>
                  <Text style={[styles.breakdownItemCount, { color: theme.textSecondary }]}>{satisfactionData.ratingsByType.finance.resolved}/{satisfactionData.ratingsByType.finance.total}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Benefits Analytics Detail */}
        {benefitsData && (
          <View style={[styles.satisfactionCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.cardBorder }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Benefícios & Serviços</Text>
              <TouchableOpacity onPress={() => router.push('/(app)/admin/reports')}>
                <Text style={[styles.seeMore, { color: theme.accent }]}>{t('admin.seeAll')}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.satisfactionStats}>
              <View style={styles.satisfactionStatItem}>
                <Text style={[styles.satisfactionStatValue, { color: theme.accent }]}>{benefitsData.totalRequests}</Text>
                <Text style={[styles.satisfactionStatLabel, { color: theme.textSecondary }]}>Total de Pedidos</Text>
              </View>
              <View style={styles.satisfactionStatDivider} />
              <View style={styles.satisfactionStatItem}>
                <Text style={[styles.satisfactionStatValue, { color: '#10B981' }]}>{benefitsData.requestsByCategory.support}</Text>
                <Text style={[styles.satisfactionStatLabel, { color: theme.textSecondary }]}>Suporte</Text>
              </View>
              <View style={styles.satisfactionStatDivider} />
              <View style={styles.satisfactionStatItem}>
                <Text style={[styles.satisfactionStatValue, { color: '#F59E0B' }]}>{benefitsData.requestsByCategory.housing}</Text>
                <Text style={[styles.satisfactionStatLabel, { color: theme.textSecondary }]}>Habitação</Text>
              </View>
              <View style={styles.satisfactionStatDivider} />
              <View style={styles.satisfactionStatItem}>
                <Text style={[styles.satisfactionStatValue, { color: '#8B5CF6' }]}>{benefitsData.requestsByCategory.finance}</Text>
                <Text style={[styles.satisfactionStatLabel, { color: theme.textSecondary }]}>Finanças</Text>
              </View>
            </View>
            <View style={styles.satisfactionBreakdown}>
              <Text style={[styles.breakdownTitle, { color: theme.text }]}>Serviços Mais Solicitados</Text>
              <View style={styles.breakdownRow}>
                {benefitsData.topServices.slice(0, 3).map((service, index) => (
                  <View key={index} style={styles.breakdownItem}>
                    <Text style={[styles.breakdownItemLabel, { color: theme.text }]}>{service.category}</Text>
                    <Text style={[styles.breakdownItemValue, { color: theme.text }]}>{service.count}</Text>
                    <Text style={[styles.breakdownItemCount, { color: theme.textSecondary }]}>{service.percentage}%</Text>
                  </View>
                ))}
              </View>
              <View style={styles.breakdownRow}>
                {benefitsData.topServices.slice(3, 5).map((service, index) => (
                  <View key={index + 3} style={styles.breakdownItem}>
                    <Text style={[styles.breakdownItemLabel, { color: theme.text }]}>{service.category}</Text>
                    <Text style={[styles.breakdownItemValue, { color: theme.text }]}>{service.count}</Text>
                    <Text style={[styles.breakdownItemCount, { color: theme.textSecondary }]}>{service.percentage}%</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Módulos Administrativos */}
        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 16, marginBottom: 16 }]}>Módulos Kizola</Text>
        <View style={styles.modulesGrid}>
          <TouchableOpacity 
            style={[styles.moduleCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
            onPress={() => router.push('/(app)/admin/cases')}
            activeOpacity={0.8}
          >
            <View style={[styles.moduleIconContainer, { backgroundColor: '#3B82F615' }]}>
              <ClipboardList size={20} color="#3B82F6" />
            </View>
            <View>
              <Text style={[styles.moduleTitle, { color: theme.text }]}>Gestão de Casos</Text>
              <Text style={[styles.moduleSubtitle, { color: theme.textSecondary }]}>Suporte, Habitação e Finanças</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.moduleCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
            onPress={() => router.push('/(app)/admin/finance')}
            activeOpacity={0.8}
          >
            <View style={[styles.moduleIconContainer, { backgroundColor: '#10B98115' }]}>
              <DollarSign size={20} color="#10B981" />
            </View>
            <View>
              <Text style={[styles.moduleTitle, { color: theme.text }]}>Painel Financeiro</Text>
              <Text style={[styles.moduleSubtitle, { color: theme.textSecondary }]}>MRR, ARR e status Stripe</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.moduleCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
            onPress={() => router.push('/(app)/admin/reports')}
            activeOpacity={0.8}
          >
            <View style={[styles.moduleIconContainer, { backgroundColor: '#F59E0B15' }]}>
              <FileText size={20} color="#F59E0B" />
            </View>
            <View>
              <Text style={[styles.moduleTitle, { color: theme.text }]}>Relatórios</Text>
              <Text style={[styles.moduleSubtitle, { color: theme.textSecondary }]}>Exportação em Excel e PDF</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.moduleCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
            onPress={() => router.push('/(app)/admin/audit')}
            activeOpacity={0.8}
          >
            <View style={[styles.moduleIconContainer, { backgroundColor: '#8B5CF615' }]}>
              <ShieldAlert size={20} color="#8B5CF6" />
            </View>
            <View>
              <Text style={[styles.moduleTitle, { color: theme.text }]}>Segurança & Logs</Text>
              <Text style={[styles.moduleSubtitle, { color: theme.textSecondary }]}>Rastreabilidade de auditorias</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Revenue Overview Chart */}
        <View 
          style={[styles.chartCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.cardBorder }]}
        >
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>{t('admin.revenueOverview')}</Text>
            <Text style={[styles.seeMore, { color: theme.textMuted }]}>{t('admin.lastMonths', { count: revenueData.length })}</Text>
          </View>
          
          <View style={styles.chartPlaceholder}>
            <LinearGradient
              colors={[theme.accent + '30', 'transparent']}
              style={styles.chartGradient}
            />
            <View style={styles.barsContainer}>
              {revenueData.map((d, i) => {
                const heightPercent = (d.revenue / maxRevenue) * 100;
                return (
                  <View key={i} style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: Math.max(heightPercent, 5),
                          backgroundColor: theme.accent,
                        },
                      ]}
                    />
                    <Text style={[styles.barLabel, { color: theme.textMuted }]}>{d.month}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Recent Users List */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('admin.recentUsers')}</Text>
          <TouchableOpacity onPress={() => router.push('/(app)/admin/users')}>
            <Text style={[styles.seeAll, { color: theme.accent }]}>{t('admin.seeAll')}</Text>
          </TouchableOpacity>
        </View>

        {recentUsers.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: theme.surfaceElevated, borderColor: theme.cardBorder }]}>
            <Users size={48} color={theme.textMuted} />
            <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>{t('admin.noUsersYet')}</Text>
          </View>
        ) : (
          recentUsers.map((u) => (
            <TouchableOpacity
              key={u.id}
              style={[styles.userCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
            >
              <View style={styles.userInfo}>
                <View style={[styles.avatar, { backgroundColor: theme.accent + '20' }]}>
                  <Text style={[styles.avatarText, { color: theme.accent }]}>{u.name[0]?.toUpperCase()}</Text>
                </View>
                <View>
                  <Text style={[styles.userName, { color: theme.text }]}>{u.name}</Text>
                  <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{u.email}</Text>
                </View>
              </View>
              <View style={styles.userMeta}>
                <View style={[styles.planBadge, { backgroundColor: u.plan === 'premium' ? theme.accentPurple + '20' : theme.accentBlue + '20' }]}>
                  <Text style={[styles.planText, { color: u.plan === 'premium' ? theme.accentPurple : theme.accentBlue }]}>{u.plan}</Text>
                </View>
                <Text style={[styles.userDate, { color: theme.textMuted }]}>{formatTimeAgo(u.created_at)}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Admin Bottom Navigation */}
      <View style={[styles.bottomNav, { backgroundColor: theme.surface, borderTopColor: theme.cardBorder }]}>
        <TouchableOpacity style={styles.navItem}>
          <LayoutDashboard size={24} color={theme.accent} />
          <Text style={[styles.navText, { color: theme.accent }]}>{t('admin.navPanel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/(app)/admin/users')}
        >
          <Users size={24} color={theme.textSecondary} />
          <Text style={[styles.navText, { color: theme.textSecondary }]}>{t('admin.navUsers')}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/(app)/admin/support')}
        >
          <MessageSquare size={24} color={theme.textSecondary} />
          <Text style={[styles.navText, { color: theme.textSecondary }]}>{t('admin.navSupport')}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/dashboard')}
        >
          <ArrowUpRight size={24} color={theme.textSecondary} />
          <Text style={[styles.navText, { color: theme.textSecondary }]}>{t('admin.navExit')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 8,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  name: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  chartCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 8,
    marginBottom: 32,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  seeMore: {
    fontSize: 14,
    fontWeight: '600',
  },
  chartPlaceholder: {
    height: 120,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderRadius: 12,
  },
  chartGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    height: '100%',
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: (width - 120) / 7,
    borderRadius: 6,
    opacity: 0.8,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 13,
  },
  userMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  planBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  planText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  userDate: {
    fontSize: 11,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 20,
    borderTopWidth: 1,
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navText: {
    fontSize: 10,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  errorBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 12,
  },
  emptyState: {
    padding: 32,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 32,
  },
  moduleCard: {
    width: (width - 60) / 2,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  moduleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  moduleSubtitle: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
  },
  satisfactionCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    marginTop: 8,
    marginBottom: 32,
  },
  satisfactionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  satisfactionStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  satisfactionStatValue: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  satisfactionStatLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  satisfactionStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  satisfactionBreakdown: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  breakdownItemLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  breakdownItemValue: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  breakdownItemCount: {
    fontSize: 11,
    fontWeight: '500',
  },
});

export default AdminDashboard;
