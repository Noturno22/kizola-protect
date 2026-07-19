import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Zap, ChevronRight, Calendar } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { PulseDot, GlowingShield, ProgressBar } from '@/components/dashboard';
import { useRouter } from 'expo-router';

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
  const router = useRouter();

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => { scale.value = withSpring(0.96, { damping: 15, stiffness: 300 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 12, stiffness: 250 }); }}
      onPress={() => router.push('/benefits')}
    >
      <Animated.View style={[styles.cardContainer, animatedStyle]}>
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
              {planInfo?.name ? `${planInfo.name} ${t('dashboard.planSuffix')}` : (t('common.noPlan') === 'common.noPlan' ? 'Plano Grátis' : t('common.noPlan'))}
            </Text>
          </View>
          <View style={[styles.statusBadge, {
            backgroundColor: isActive ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
            borderColor: isActive ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)',
          }]}>
            <PulseDot color={isActive ? '#22C55E' : '#EF4444'} size={8} />
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
      </Animated.View>
    </Pressable>
  );
}

export default MembershipCard;
