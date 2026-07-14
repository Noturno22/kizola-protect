import { useDashboard } from './hooks/useDashboard';
import { DashboardContent } from './components/dashboard/DashboardContent';
import { DashboardHeader } from './components/dashboard/DashboardHeader';
import { MembershipCard } from './components/dashboard/MembershipCard';
import { StatsRow } from './components/dashboard/StatsRow';
import { QuickActions } from './components/dashboard/QuickActions';
import { RecentRequests } from './components/dashboard/RecentRequests';
import { LearningCard } from './components/dashboard/LearningCard';
import { PlanBenefits } from './components/dashboard/PlanBenefits';
import { HelpCard } from './components/dashboard/HelpCard';
import { NotificationsModal } from '@/components/dashboard';

export default function Dashboard() {
  const {
    theme, isDark, refreshing, onRefresh, user, planInfo, hasPlan, isActive,
    nextBillingText, usagePercentage, recentRequests, notifications, unreadCount,
    showNotifications, setShowNotifications, quickActions, formatDate,
    getStatusConfig, toggleTheme, styles, t, router,
  } = useDashboard();

  const handleActivityPress = () => router.push('/activity');
  const handleLearnPress = () => router.push('/learn');
  const handleBenefitsPress = () => router.push('/benefits');
  const handleSupportPress = () => router.push('/support');
  const handleActionPress = (route: string) => router.push(route as any);

  return (
    <DashboardContent
      refreshing={refreshing}
      onRefresh={onRefresh}
      theme={theme}
      notificationsModal={<NotificationsModal visible={showNotifications} onClose={() => setShowNotifications(false)} />}
    >
      <DashboardHeader
        theme={theme}
        styles={styles}
        isDark={isDark}
        userName={user?.name || t('common.member') || 'Membro'}
        greeting={t('dashboard.welcomeBack') || 'Bem-vindo de volta,'}
        adminRole={user?.role}
        onToggleTheme={toggleTheme}
        onOpenNotifications={() => setShowNotifications(true)}
        unreadCount={unreadCount}
      />
      <MembershipCard
        theme={theme}
        styles={styles}
        planInfo={planInfo}
        isActive={isActive}
        hasPlan={hasPlan ?? false}
        usagePercentage={usagePercentage}
        nextBillingText={nextBillingText}
      />
      <StatsRow
        theme={theme}
        styles={styles}
        planInfo={planInfo}
        recentRequests={recentRequests}
        notifications={notifications}
      />
      <QuickActions
        theme={theme}
        styles={styles}
        actions={quickActions}
        onActionPress={handleActionPress}
      />
      <RecentRequests
        theme={theme}
        styles={styles}
        requests={recentRequests}
        formatDate={formatDate}
        getStatusConfig={getStatusConfig}
        onSeeAll={handleActivityPress}
      />
      <LearningCard theme={theme} styles={styles} onPress={handleLearnPress} />
      <PlanBenefits theme={theme} styles={styles} user={user} onPress={handleBenefitsPress} />
      <HelpCard theme={theme} styles={styles} onPress={handleSupportPress} />
    </DashboardContent>
  );
}
