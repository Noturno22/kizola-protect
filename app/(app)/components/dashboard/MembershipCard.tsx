import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, ChevronRight, Calendar } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { PulseDot, GlowingShield, ProgressBar } from '@/components/dashboard';

type Props = {
  theme: any;
  styles: any;
  planInfo: any;
  isActive: boolean;
  hasPlan: boolean;
  usagePercentage: number;
  nextBillingText: string;
};

export function MembershipCard({
  theme,
  styles,
  planInfo,
  isActive,
  hasPlan,
  usagePercentage,
  nextBillingText,
}: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.cardContainer}>
      <LinearGradient
        colors={planInfo?.color || theme.cardGradient}
        style={[styles.membershipCard, { borderColor: theme.cardBorder }]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
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
          <ChevronRight size={16} color={theme.isDark || planInfo?.color ? 'rgba(255,255,255,0.3)' : theme.textMuted} />
        </View>
      </LinearGradient>
    </View>
  );
}

export default MembershipCard;
