import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StatCard } from '@/components/dashboard';

type Props = {
  theme: any;
  styles: any;
  planInfo: any;
  recentRequests: any[];
  notifications: any[];
};

export function StatsRow({ theme, styles, planInfo, recentRequests, notifications }: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.statsRow}>
      <StatCard value={String(planInfo?.benefits?.length || 0)} label={t('dashboard.statsBenefits') || 'Benefícios'} color={theme.accent} bg="" theme={theme} />
      <StatCard value={String(recentRequests.length)} label={t('dashboard.statsRequests') || 'Pedidos'} color={theme.accentBlue} bg="" theme={theme} />
      <StatCard value={String(notifications.length)} label={t('dashboard.notifications') || 'Notificações'} color={theme.accentPurple} bg="" theme={theme} />
    </View>
  );
}

export default StatsRow;
