import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, Star, Crown, Shield, ArrowRight, Sparkles } from 'lucide-react-native';
import { useTheme, Theme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useState, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { PLANS } from '@/lib/supabase';

const { width: screenWidth } = Dimensions.get('window');
const CARD_GAP = 14;

export default function Plans() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, updateUserPlan } = useAuth();
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(user?.plan && user.plan !== 'none' ? user.plan : null);
  const [loading, setLoading] = useState(false);
  const carouselRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const isPremium = user?.plan === 'premium' && user?.status === 'active';

  // Determine which plans to show
  const visiblePlanKeys = useMemo(() => {
    const allKeys = (Object.keys(PLANS) as Array<keyof typeof PLANS>);
    
    if (isPremium) {
      return ['premium'] as const;
    }

    const planOrder = ['free', 'basic', 'pro', 'premium'] as const;
    const currentLevel = user?.plan ? planOrder.indexOf(user.plan as typeof planOrder[number]) : 0;

    return allKeys.filter((planId) => {
      // Never show free plan in the carousel
      if (planId === 'free') return false;
      // Show current plan and all higher plans
      const level = planOrder.indexOf(planId);
      return level >= currentLevel;
    });
  }, [user?.plan, user?.status, isPremium]);

  const CARD_WIDTH = screenWidth - 80;

  const handleCarouselScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_GAP));
    setActiveIndex(index);
  }, [CARD_WIDTH]);

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
          t('plans.subscribeSuccess', { plan: t(`plans.${planId}.name`) }) || `You have successfully subscribed to the ${t(`plans.${planId}.name`)}.`,
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

  const getPlanIcon = (planId: string, size: number = 24) => {
    switch (planId) {
      case 'premium':
        return <Crown size={size} color={isPremium ? '#D4AF37' : theme.accentPurple} />;
      case 'pro':
        return <Star size={size} color={theme.accentBlue} />;
      case 'basic':
        return <Shield size={size} color={theme.success} />;
      default:
        return <Shield size={size} color={theme.secondary} />;
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
      default:
        return ['#1E293B', '#0F172A'] as const;
    }
  };

  const renderPlanCard = (planId: string, plan: typeof PLANS[keyof typeof PLANS]) => {
    const isCurrentPlan = (user?.plan === planId && user?.status === 'active') ||
                         (planId === 'free' && (!user?.plan || user.plan === 'none' || user.plan === 'free'));
    const isSelected = selectedPlan === planId;
    const isPremiumPlan = planId === 'premium';

    return (
      <View
        key={planId}
        style={[
          styles.planCard,
          isPremium && isPremiumPlan && styles.premiumPlanCard,
        ]}
      >
        {/* Current Plan Badge */}
        {isCurrentPlan && (
          <View style={[
            styles.currentBadge,
            isPremium && isPremiumPlan && styles.premiumBadge,
          ]}>
            {isPremium && isPremiumPlan ? (
              <View style={styles.premiumBadgeInner}>
                <Crown size={10} color="#D4AF37" />
                <Text style={styles.premiumBadgeText}>{t('plans.currentPlan')}</Text>
              </View>
            ) : (
              <Text style={styles.currentBadgeText}>{t('plans.currentPlan')}</Text>
            )}
          </View>
        )}

        {/* Premium Member Indicator (only when user IS on premium) */}
        {isPremium && isPremiumPlan && (
          <View style={styles.premiumMemberBanner}>
            <Sparkles size={14} color="#D4AF37" />
            <Text style={styles.premiumMemberText}>{t('plans.premiumMember')}</Text>
          </View>
        )}

        {/* Plan Header */}
        <LinearGradient
          colors={isPremium && isPremiumPlan ? ['#7C3AED', '#5B21B6', '#4C1D95'] : getPlanGradient(planId)}
          style={[
            styles.planHeader,
            isPremium && isPremiumPlan && styles.premiumHeader,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={[
            styles.planIconContainer,
            isPremium && isPremiumPlan && styles.premiumIconContainer,
          ]}>
            {getPlanIcon(planId, 28)}
          </View>
          <View style={styles.planTitleContainer}>
            <Text style={styles.planName}>{t(`plans.${planId}.name`)}</Text>
            <View style={styles.priceContainer}>
              {renderPlanPrice(plan.price)}
              <Text style={styles.pricePeriod}>{t('plans.month')}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Plan Content */}
        <View style={styles.planContent}>
          <Text style={styles.benefitsTitle}>{t('plans.whatsIncluded')}</Text>
          <View style={styles.benefitsList}>
            {(() => {
              const benefits = t(`plans.${planId}.benefits`, { returnObjects: true });
              const benefitsArray = Array.isArray(benefits) ? benefits : [];
              return benefitsArray.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <View style={[
                    styles.benefitCheck,
                    isPremium && isPremiumPlan && styles.premiumBenefitCheck,
                  ]}>
                    <Check size={14} color={isPremium && isPremiumPlan ? '#D4AF37' : theme.success} />
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
              isPremium && isPremiumPlan && isCurrentPlan && styles.premiumCurrentButton,
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
                  isPremium && isPremiumPlan && isCurrentPlan && styles.premiumCurrentButtonText,
                  isSelected && !isCurrentPlan && styles.selectedButtonText,
                ]}>
                  {isCurrentPlan ? t('plans.currentPlan') : isSelected ? t('plans.selected') : t('plans.selectPlan')}
                </Text>
                {!isCurrentPlan && (
                  <ArrowRight
                    size={18}
                    color={isSelected ? theme.accent : isPremium && isPremiumPlan ? '#D4AF37' : '#FFFFFF'}
                  />
                )}
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.outerContainer, { backgroundColor: theme.headerGradient?.[0] ?? theme.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <LinearGradient
            colors={isPremium ? ['#4C1D95', '#5B21B6', '#6D28D9'] : theme.headerGradient}
            style={styles.header}
          >
            <View style={styles.headerRow}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>{t('plans.title')}</Text>
                <Text style={styles.headerSubtitle}>{t('plans.subtitle')}</Text>
              </View>
              {isPremium && (
                <View style={styles.headerPremiumBadge}>
                  <Crown size={20} color="#D4AF37" />
                </View>
              )}
            </View>
          </LinearGradient>

          {/* Plans Carousel */}
          {visiblePlanKeys.length === 1 ? (
            /* Single plan (premium user) - centered, no carousel */
            <View style={styles.singlePlanContainer}>
              {renderPlanCard(visiblePlanKeys[0], PLANS[visiblePlanKeys[0]])}
            </View>
          ) : (
            /* Multiple plans - horizontal carousel */
            <View style={styles.carouselContainer}>
              <ScrollView
                ref={carouselRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                snapToInterval={CARD_WIDTH + CARD_GAP}
                snapToAlignment="center"
                decelerationRate="fast"
                contentContainerStyle={styles.carouselContent}
                onMomentumScrollEnd={handleCarouselScroll}
              >
                {visiblePlanKeys.map((planId, index) => (
                  <View
                    key={planId}
                    style={[
                      styles.carouselCard,
                      { width: CARD_WIDTH, marginRight: index < visiblePlanKeys.length - 1 ? CARD_GAP : 0 },
                    ]}
                  >
                    {renderPlanCard(planId, PLANS[planId])}
                  </View>
                ))}
              </ScrollView>

              {/* Pagination Dots */}
              {visiblePlanKeys.length > 1 && (
                <View style={styles.carouselDots}>
                  {visiblePlanKeys.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dot,
                        index === activeIndex && styles.dotActive,
                        isPremium && index === activeIndex && styles.dotPremiumActive,
                      ]}
                    />
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Note */}
          <View style={[
            styles.noteContainer,
            isPremium && styles.premiumNoteContainer,
          ]}>
            {isPremium ? (
              <View style={styles.premiumNoteContent}>
                <Crown size={16} color="#D4AF37" />
                <Text style={[styles.noteText, styles.premiumNoteText]}>
                  {t('plans.premiumNote')}
                </Text>
              </View>
            ) : (
              <Text style={styles.noteText}>{t('plans.note')}</Text>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextContainer: {
    flex: 1,
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
  headerPremiumBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Carousel
  carouselContainer: {
    marginTop: -16,
  },
  carouselContent: {
    paddingHorizontal: 20,
  },
  carouselCard: {
    // Width set dynamically
  },
  singlePlanContainer: {
    marginTop: -16,
    paddingHorizontal: 20,
  },
  carouselDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.textMuted,
  },
  dotActive: {
    backgroundColor: theme.accent,
    width: 24,
  },
  dotPremiumActive: {
    backgroundColor: '#D4AF37',
  },
  // Plan Card
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
  premiumPlanCard: {
    borderColor: 'rgba(212, 175, 55, 0.3)',
    shadowColor: '#D4AF37',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
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
  premiumBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  premiumBadgeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  premiumBadgeText: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: '700',
  },
  currentBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  premiumMemberBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.15)',
  },
  premiumMemberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D4AF37',
    letterSpacing: 0.5,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  premiumHeader: {
    // Slightly deeper gradient for premium
  },
  planIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumIconContainer: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
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
  premiumBenefitCheck: {
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
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
  premiumCurrentButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
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
  premiumCurrentButtonText: {
    color: '#D4AF37',
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
  premiumNoteContainer: {
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.15)',
  },
  premiumNoteContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  noteText: {
    fontSize: 13,
    color: theme.accentAmber,
    textAlign: 'center',
    lineHeight: 20,
  },
  premiumNoteText: {
    color: '#D4AF37',
    textAlign: 'left',
    flex: 1,
  },
});
