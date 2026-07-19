import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, Star, Crown, Shield, ArrowRight, Sparkles, ArrowLeft } from 'lucide-react-native';
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
  const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(user?.plan && user.plan !== 'none' ? user.plan : null);
  const [loading, setLoading] = useState(false);
  const carouselRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const isPremium = user?.plan === 'premium' && user?.status === 'active';

  // Premium accent color - uses theme purple with gold as special accent
  const premiumAccent = '#D4AF37';

  // Determine which plans to show
  const visiblePlanKeys = useMemo(() => {
    const allKeys = (Object.keys(PLANS) as Array<keyof typeof PLANS>);
    
    if (isPremium) {
      return ['premium'] as const;
    }

    const planOrder = ['free', 'basic', 'pro', 'premium'] as const;
    const currentLevel = user?.plan ? planOrder.indexOf(user.plan as typeof planOrder[number]) : 0;

    return allKeys.filter((planId) => {
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
        return <Crown size={size} color={premiumAccent} />;
      case 'pro':
        return <Star size={size} color={theme.accentBlue} />;
      case 'basic':
        return <Shield size={size} color={theme.success} />;
      default:
        return <Shield size={size} color={theme.secondary} />;
    }
  };

  const getPlanGradient = (planId: string): readonly [string, string, ...string[]] => {
    switch (planId) {
      case 'premium':
        return [theme.accentPurple, isDark ? '#4C1D95' : '#6D28D9'] as const;
      case 'pro':
        return [theme.accentBlue, isDark ? '#1D4ED8' : '#2563EB'] as const;
      case 'basic':
        return [theme.success, isDark ? '#047857' : '#059669'] as const;
      default:
        return isDark
          ? ['#1E293B', '#0F172A'] as const
          : ['#475569', '#334155'] as const;
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
          isPremiumPlan && styles.premiumPlanCard,
        ]}
      >
        {/* Current Plan Badge */}
        {isCurrentPlan && (
          <View style={[
            styles.currentBadge,
            isPremiumPlan && styles.premiumCurrentBadge,
          ]}>
            {isPremiumPlan ? (
              <View style={styles.premiumBadgeInner}>
                <Crown size={10} color="#FFFFFF" />
                <Text style={styles.premiumBadgeText}>{t('plans.currentPlan')}</Text>
              </View>
            ) : (
              <Text style={styles.currentBadgeText}>{t('plans.currentPlan')}</Text>
            )}
          </View>
        )}

        {/* Premium Member Indicator */}
        {isPremium && isPremiumPlan && (
          <View style={styles.premiumMemberBanner}>
            <Sparkles size={14} color={premiumAccent} />
            <Text style={styles.premiumMemberText}>{t('plans.premiumMember')}</Text>
          </View>
        )}

        {/* Plan Header */}
        <LinearGradient
          colors={getPlanGradient(planId)}
          style={styles.planHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={[
            styles.planIconContainer,
            isPremiumPlan && styles.premiumIconContainer,
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
                    isPremiumPlan && styles.premiumBenefitCheck,
                  ]}>
                    <Check size={14} color={isPremiumPlan ? premiumAccent : theme.success} />
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
              isPremiumPlan && isCurrentPlan && styles.premiumCurrentButton,
              isSelected && !isCurrentPlan && styles.selectedButton,
            ]}
            onPress={() => handleSelectPlan(planId as 'basic' | 'pro' | 'premium')}
            disabled={loading || isCurrentPlan}
            activeOpacity={0.8}
          >
            {loading && selectedPlan === planId ? (
              <ActivityIndicator color={isCurrentPlan ? theme.textSecondary : '#FFFFFF'} />
            ) : (
              <>
                <Text style={[
                  styles.selectButtonText,
                  isCurrentPlan && styles.currentButtonText,
                  isPremiumPlan && isCurrentPlan && styles.premiumCurrentButtonText,
                  isSelected && !isCurrentPlan && styles.selectedButtonText,
                ]}>
                  {isCurrentPlan ? t('plans.currentPlan') : isSelected ? t('plans.selected') : t('plans.selectPlan')}
                </Text>
                {!isCurrentPlan && (
                  <ArrowRight
                    size={18}
                    color={isSelected ? theme.accent : isPremiumPlan ? premiumAccent : '#FFFFFF'}
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
    <View style={styles.outerContainer}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {/* Full-screen gradient background covering status bar area */}
      <LinearGradient
        colors={theme.headerGradient}
        locations={[0, 0.35, 0.5]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <LinearGradient
            colors={theme.headerGradient}
            style={styles.header}
          >
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <ArrowLeft size={24} color={isDark ? '#FFFFFF' : theme.text} />
              </TouchableOpacity>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>{t('plans.title')}</Text>
                <Text style={styles.headerSubtitle}>{t('plans.subtitle')}</Text>
              </View>
              {isPremium && (
                <View style={styles.headerPremiumBadge}>
                  <Crown size={20} color={premiumAccent} />
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
                      ]}
                    />
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Note */}
          <View style={styles.noteContainer}>
            {isPremium ? (
              <View style={styles.premiumNoteContent}>
                <Crown size={16} color={premiumAccent} />
                <Text style={styles.premiumNoteText}>
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

const createStyles = (theme: Theme, isDark: boolean) => StyleSheet.create({
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: isDark ? '#FFFFFF' : theme.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: isDark ? 'rgba(255,255,255,0.7)' : theme.textSecondary,
  },
  headerPremiumBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
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
    backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
  },
  dotActive: {
    backgroundColor: theme.accent,
    width: 24,
  },
  // Plan Card
  planCard: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: theme.cardBorderAlt,
  },
  premiumPlanCard: {
    borderColor: 'rgba(212, 175, 55, 0.3)',
    shadowColor: 'rgba(212, 175, 55, 0.15)',
    shadowRadius: 20,
    elevation: 8,
  },
  currentBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: theme.success,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    zIndex: 1,
  },
  premiumCurrentBadge: {
    backgroundColor: '#B8860B',
  },
  premiumBadgeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  premiumBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
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
    paddingVertical: 10,
    backgroundColor: isDark ? 'rgba(212, 175, 55, 0.08)' : 'rgba(212, 175, 55, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: isDark ? 'rgba(212, 175, 55, 0.15)' : 'rgba(212, 175, 55, 0.2)',
  },
  premiumMemberText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#D4AF37',
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
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumIconContainer: {
    backgroundColor: '#D4AF37',
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.5)',
    shadowColor: '#B8860B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
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
    backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  premiumBenefitCheck: {
    backgroundColor: isDark ? 'rgba(212, 175, 55, 0.2)' : 'rgba(212, 175, 55, 0.15)',
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
    backgroundColor: '#B8860B',
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
    color: '#FFFFFF',
    fontWeight: '700',
  },
  selectedButtonText: {
    color: theme.accent,
  },
  noteContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: isDark ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.1)',
  },
  premiumNoteContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  premiumNoteText: {
    flex: 1,
    fontSize: 13,
    color: '#D4AF37',
    textAlign: 'left',
    fontWeight: '600',
    lineHeight: 20,
  },
  noteText: {
    fontSize: 13,
    color: isDark ? 'rgba(245, 158, 11, 0.85)' : '#B45309',
    textAlign: 'center',
    lineHeight: 20,
  },
});
