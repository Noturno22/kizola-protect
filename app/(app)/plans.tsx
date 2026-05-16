import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, Star, Crown, Shield, ArrowRight } from 'lucide-react-native';
import { useTheme, Theme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { PLANS } from '@/lib/supabase';

export default function Plans() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, updateUserPlan } = useAuth();
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(user?.plan && user.plan !== 'none' ? user.plan : null);
  const [loading, setLoading] = useState(false);

  const renderPlanPrice = (price: string | number) => {
    const raw = String(price).trim();
    const normalized = raw.replace(',', '.');
    const [wholePart, decimalPart] = normalized.split('.');

    const centsRaw = (decimalPart ?? '').replace(/[^\d]/g, '');
    const hasCents = centsRaw.length > 0;
    const cents = centsRaw.padEnd(2, '0').slice(0, 2);

    return (
      <Text style={styles.price}>
        ${wholePart}
        {hasCents ? '.' : ''}
        {hasCents ? <Text style={styles.priceCents}>{cents}</Text> : null}
      </Text>
    );
  };

  const handleSelectPlan = async (planId: 'free' | 'basic' | 'pro' | 'premium') => {
    if (user?.plan === planId && user?.status === 'active') {
      Alert.alert(t('common.info') || 'Info', t('plans.alreadySubscribed'));
      return;
    }

    if (planId === 'free') {
      setLoading(true);
      try {
        await updateUserPlan(planId);
        setSelectedPlan(planId);
        Alert.alert(
          t('common.success'),
          t('plans.subscribeSuccess', { plan: t(`plans.${planId}.name`) }) || `You have successfully subscribed to the ${t(`plans.${planId}.name`)} plan.`,
          [{ text: t('common.done'), onPress: () => router.replace('/dashboard') }]
        );
      } catch (error: any) {
        Alert.alert(t('common.error'), error.message || t('plans.selectFailed') || 'Failed to select plan');
      } finally {
        setLoading(false);
      }
    } else {
      router.push(`/checkout?planId=${planId}`);
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'premium':
        return <Crown size={24} color={theme.accentPurple} />;
      case 'pro':
        return <Star size={24} color={theme.accentBlue} />;
      case 'basic':
        return <Shield size={24} color={theme.success} />;
      case 'free':
        return <Shield size={24} color={theme.textMuted} />;
      default:
        return <Shield size={24} color={theme.secondary} />;
    }
  };

  const getPlanGradient = (planId: string) => {
    switch (planId) {
      case 'premium':
        return ['#8B5CF6', '#6366F1'] as const;
      case 'pro':
        return ['#0EA5E9', '#2563EB'] as const;
      case 'basic':
        return ['#10B981', '#059669'] as const;
      case 'free':
        return ['#1E293B', '#0F172A'] as const;
      default:
        return ['#1E293B', '#0F172A'] as const;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <LinearGradient colors={theme.headerGradient} style={styles.header}>
          <Text style={styles.headerTitle}>{t('plans.title')}</Text>
          <Text style={styles.headerSubtitle}>{t('plans.subtitle')}</Text>
        </LinearGradient>

        {/* Plans */}
        <View style={styles.plansContainer}>
          {(Object.keys(PLANS) as Array<keyof typeof PLANS>).map((planId) => {
            const plan = PLANS[planId];
            const planKey = String(planId);
            const isCurrentPlan = (user?.plan === planId && user?.status === 'active') || 
                                 (planId === 'free' && (!user?.plan || user.plan === 'none' || user.plan === 'free'));
            const isSelected = selectedPlan === planId;

            return (
              <View
                key={planKey}
                style={[
                  styles.planCard,
                  isCurrentPlan && styles.currentPlanCard,
                  isSelected && styles.selectedPlanCard,
                ]}
              >
                {isCurrentPlan && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>{t('plans.currentPlan')}</Text>
                  </View>
                )}

                <LinearGradient
                  colors={getPlanGradient(planKey)}
                  style={styles.planHeader}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <View style={styles.planIconContainer}>
                    {getPlanIcon(planKey)}
                  </View>
                  <View style={styles.planTitleContainer}>
                    <Text style={styles.planName}>{t(`plans.${planId}.name`)}</Text>
                    <View style={styles.priceContainer}>
                      {renderPlanPrice(plan.price)}
                      <Text style={styles.pricePeriod}>{t('plans.month')}</Text>
                    </View>
                  </View>
                </LinearGradient>

                <View style={styles.planContent}>
                  <Text style={styles.benefitsTitle}>{t('plans.whatsIncluded')}</Text>
                  <View style={styles.benefitsList}>
                    {(() => {
                      const benefits = t(`plans.${planId}.benefits`, { returnObjects: true });
                      const benefitsArray = Array.isArray(benefits) ? benefits : [];
                      return benefitsArray.map((benefit, index) => (
                        <View key={index} style={styles.benefitItem}>
                          <View style={styles.benefitCheck}>
                            <Check size={14} color={theme.success} />
                          </View>
                          <Text style={styles.benefitText}>{benefit}</Text>
                        </View>
                      ));
                    })()}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.selectButton,
                      isCurrentPlan && styles.currentButton,
                      isSelected && !isCurrentPlan && styles.selectedButton,
                    ]}
                    onPress={() => handleSelectPlan(planId as 'basic' | 'pro' | 'premium')}
                    disabled={loading || isCurrentPlan}
                  >
                    {loading && selectedPlan === planId ? (
                      <ActivityIndicator color={isCurrentPlan ? theme.textSecondary : '#FFFFFF'} />
                    ) : (
                      <>
                        <Text style={[
                          styles.selectButtonText,
                          isCurrentPlan && styles.currentButtonText,
                          isSelected && !isCurrentPlan && styles.selectedButtonText,
                        ]}>
                          {isCurrentPlan ? t('plans.currentPlan') : isSelected ? t('plans.selected') : t('plans.selectPlan')}
                        </Text>
                        {!isCurrentPlan && <ArrowRight size={18} color={isSelected ? theme.accent : '#FFFFFF'} />}
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {/* Note */}
        <View style={styles.noteContainer}>
          <Text style={styles.noteText}>
            {t('plans.note')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.isDark ? '#FFFFFF' : theme.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.isDark ? 'rgba(255,255,255,0.8)' : theme.textSecondary,
  },
  plansContainer: {
    marginTop: -16,
    paddingHorizontal: 20,
    gap: 16,
  },
  planCard: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  currentPlanCard: {
    borderColor: theme.success,
  },
  selectedPlanCard: {
    borderColor: theme.accent,
  },
  currentBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: theme.success,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  currentBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  planIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  planTitleContainer: {
    flex: 1,
  },
  planName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  priceCents: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    position: 'relative',
    top: -8,
  },
  pricePeriod: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 4,
  },
  planContent: {
    padding: 20,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 16,
  },
  benefitsList: {
    gap: 12,
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  benefitCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.success + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
  },
  selectButton: {
    backgroundColor: theme.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  currentButton: {
    backgroundColor: theme.cardBorderAlt,
  },
  selectedButton: {
    backgroundColor: theme.surface,
    borderWidth: 2,
    borderColor: theme.accent,
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  currentButtonText: {
    color: theme.textSecondary,
  },
  selectedButtonText: {
    color: theme.accent,
  },
  noteContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: theme.accentAmber + '15',
    borderRadius: 12,
  },
  noteText: {
    fontSize: 13,
    color: theme.accentAmber,
    textAlign: 'center',
    lineHeight: 20,
  },
});
