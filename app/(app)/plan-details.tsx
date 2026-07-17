import { useState, useMemo, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Shield, 
  Check, 
  CreditCard, 
  Calendar,
  AlertTriangle,
  Crown,
  Star,
  ArrowUpRight
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme, Theme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import { PLANS } from '@/lib/supabase';
import { useRouter } from 'expo-router';

export default function PlanDetails() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const carouselRef = useRef<ScrollView>(null);
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const { width: screenWidth } = Dimensions.get('window');
  const CARD_WIDTH = screenWidth - 60;
  const CARD_GAP = 12;

  const currentPlan = user?.plan && user.plan !== 'none' ? PLANS[user.plan as keyof typeof PLANS] : null;
  const nextBillingDate = new Date();
  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

  const planOrder = ['free', 'basic', 'pro', 'premium'] as const;
  const currentLevel = currentPlan ? planOrder.indexOf(currentPlan.id as typeof planOrder[number]) : 0;
  const upgradePlans = currentPlan
    ? Object.entries(PLANS).filter(([planId]) => {
        if (planId === currentPlan.id) return false;
        if (currentLevel > 0 && planId === 'free') return false;
        return true;
      })
    : [];

  const handleCarouselScroll = useCallback((event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_GAP));
    setActiveCarouselIndex(index);
  }, [CARD_WIDTH]);

  const handleUpgrade = (planId: 'basic' | 'pro' | 'premium') => {
    if (planId === user?.plan) {
      Alert.alert(t('common.info'), t('planDetails.alreadyOnPlan'));
      return;
    }

    router.push(`/checkout?planId=${planId}`);
  };

  const handleCancel = () => {
    setShowCancelModal(false);
    Alert.alert(
      t('planDetails.cancelSubscription'),
      t('planDetails.cancelConfirmDescription'),
      [
        { text: t('planDetails.keepSubscription'), style: 'cancel' },
        { 
          text: t('planDetails.cancelSubscription'), 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              t('planDetails.cancellationRequested'),
              t('planDetails.cancellationMessage'),
              [{ text: t('common.done') }]
            );
          }
        },
      ]
    );
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'premium':
        return <Crown size={32} color="#FFFFFF" />;
      case 'pro':
        return <Star size={32} color="#FFFFFF" />;
      default:
        return <Shield size={32} color="#FFFFFF" />;
    }
  };

  if (!currentPlan) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <LinearGradient colors={theme.headerGradient} style={styles.header}>
            <Text style={styles.headerTitle}>{t('planDetails.title')}</Text>
          </LinearGradient>
          
          <View style={styles.noPlanContainer}>
            <View style={styles.noPlanIcon}>
              <Shield size={48} color={theme.primary} />
            </View>
            <Text style={styles.noPlanTitle}>{t('planDetails.noActivePlan')}</Text>
            <Text style={styles.noPlanDescription}>
              {t('planDetails.noPlanDescription')}
            </Text>
            <TouchableOpacity 
              style={styles.selectPlanButton}
              onPress={() => router.push('/plans')}
            >
              <Text style={styles.selectPlanButtonText}>{t('planDetails.viewPlans')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <LinearGradient colors={theme.headerGradient} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <LinearGradient colors={theme.headerGradient} style={styles.header}>
          <Text style={styles.headerTitle}>{t('planDetails.title')}</Text>
          <Text style={styles.headerSubtitle}>{t('planDetails.subtitle')}</Text>
        </LinearGradient>

        {/* Current Plan Card */}
        <View style={styles.planCardContainer}>
          <LinearGradient 
            colors={currentPlan.color} 
            style={styles.planCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.planHeader}>
              <View style={styles.planIconContainer}>
                {getPlanIcon(currentPlan.id)}
              </View>
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>{t('planDetails.currentPlanBadge')}</Text>
              </View>
            </View>
            
            <View style={styles.planInfo}>
              <Text style={styles.planName}>{currentPlan.name}</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.planPrice}>${currentPlan.price}</Text>
                <Text style={styles.planPeriod}>{t('plans.month')}</Text>
              </View>
            </View>

            <View style={styles.planStatus}>
              <View style={styles.statusRow}>
                <View style={styles.statusIndicator} />
                <Text style={styles.statusText}>{t('common.active')}</Text>
              </View>
              <Text style={styles.nextBilling}>
                {t('planDetails.nextBilling')} {nextBillingDate.toLocaleDateString(i18n.language, { month: 'long', day: 'numeric', year: 'numeric' })}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Plan Benefits */}
        <View style={styles.benefitsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('planDetails.includedBenefits')}</Text>
            <Text style={styles.benefitsCount}>{currentPlan.benefits.length} {t('planDetails.benefits')}</Text>
          </View>
          
          <View style={styles.benefitsList}>
            {(() => {
              const benefits = t(`plans.${currentPlan.id}.benefits`, { returnObjects: true });
              const benefitsArray = Array.isArray(benefits) ? benefits : [];
              return benefitsArray.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <View style={styles.benefitCheck}>
                    <Check size={16} color={theme.success} />
                  </View>
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ));
            })()}
          </View>
        </View>

        {/* Upgrade Options */}
        <View style={styles.upgradeSection}>
          <Text style={styles.sectionTitle}>{t('planDetails.otherPlans')}</Text>
          
          <ScrollView
            ref={carouselRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            snapToInterval={CARD_WIDTH + CARD_GAP}
            snapToAlignment="center"
            decelerationRate="fast"
            contentContainerStyle={{ paddingRight: CARD_GAP }}
            onMomentumScrollEnd={handleCarouselScroll}
          >
            {upgradePlans.map(([planId, plan], index) => (
              <TouchableOpacity
                key={planId}
                style={[styles.upgradeCard, { width: CARD_WIDTH, marginRight: index < upgradePlans.length - 1 ? CARD_GAP : 0 }]}
                onPress={() => handleUpgrade(planId as 'basic' | 'pro' | 'premium')}
              >
                <LinearGradient 
                  colors={plan.color} 
                  style={styles.upgradeCardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.upgradeContent}>
                    <View style={styles.upgradeIcon}>
                      {planId === 'premium' ? (
                        <Crown size={24} color="#FFFFFF" />
                      ) : planId === 'pro' ? (
                        <Star size={24} color="#FFFFFF" />
                      ) : (
                        <Shield size={24} color="#FFFFFF" />
                      )}
                    </View>
                    <View style={styles.upgradeInfo}>
                      <Text style={styles.upgradeName}>{plan.name}</Text>
                      <Text style={styles.upgradePrice}>${plan.price}{t('plans.month')}</Text>
                    </View>
                  </View>
                  <View style={styles.upgradeAction}>
                    <Text style={styles.upgradeActionText}>{t('planDetails.upgrade')}</Text>
                    <ArrowUpRight size={18} color="#FFFFFF" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {upgradePlans.length > 1 && (
            <View style={styles.carouselDots}>
              {upgradePlans.map((_, index) => (
                <View
                  key={index}
                  style={[styles.dot, index === activeCarouselIndex && styles.dotActive]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Billing Info */}
        <View style={styles.billingSection}>
          <Text style={styles.sectionTitle}>{t('planDetails.billingInfo')}</Text>
          
          <View style={styles.billingCard}>
            <View style={styles.billingRow}>
              <View style={styles.billingIconContainer}>
                <CreditCard size={20} color={theme.primary} />
              </View>
              <View style={styles.billingContent}>
                <Text style={styles.billingLabel}>{t('planDetails.paymentMethod')}</Text>
                <Text style={styles.billingValue}>•••• •••• •••• 4242</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.billingAction}>{t('common.edit')}</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.billingDivider} />
            
            <View style={styles.billingRow}>
              <View style={styles.billingIconContainer}>
                <Calendar size={20} color={theme.primary} />
              </View>
              <View style={styles.billingContent}>
                <Text style={styles.billingLabel}>{t('planDetails.billingCycle')}</Text>
                <Text style={styles.billingValue}>{t('planDetails.monthly')}</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.billingAction}>{t('common.edit')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Cancel Subscription */}
        <View style={styles.cancelSection}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => setShowCancelModal(true)}
          >
            <AlertTriangle size={20} color={theme.error} />
            <Text style={styles.cancelButtonText}>{t('planDetails.cancelSubscription')}</Text>
          </TouchableOpacity>
          <Text style={styles.cancelNote}>
            {t('planDetails.cancelNote')}
          </Text>
        </View>
      </ScrollView>

      {/* Cancel Confirmation Modal */}
      <Modal
        visible={showCancelModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <AlertTriangle size={48} color={theme.warning} />
            </View>
            <Text style={styles.modalTitle}>{t('planDetails.cancelSubscriptionQuestion')}</Text>
            <Text style={styles.modalDescription}>
              {t('planDetails.cancelModalDescription', { planName: currentPlan.name, date: nextBillingDate.toLocaleDateString(i18n.language, { month: 'long', day: 'numeric' }) })}
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalButtonSecondary}
                onPress={() => setShowCancelModal(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>{t('planDetails.keepSubscription')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalButtonPrimary}
                onPress={handleCancel}
              >
                <Text style={styles.modalButtonPrimaryText}>{t('planDetails.yesCancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
    </>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.isDark ? '#FFFFFF' : theme.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.isDark ? 'rgba(255,255,255,0.8)' : theme.textSecondary,
  },
  planCardContainer: {
    marginTop: -28,
    marginHorizontal: 20,
  },
  planCard: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  planIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  planBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  planBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  planInfo: {
    marginBottom: 20,
  },
  planName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  planPeriod: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 4,
  },
  planStatus: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  nextBilling: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  benefitsSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
  },
  benefitsCount: {
    fontSize: 14,
    color: theme.textMuted,
  },
  benefitsList: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.cardBorderAlt,
  },
  benefitCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.success + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  benefitText: {
    flex: 1,
    fontSize: 15,
    color: theme.text,
    lineHeight: 22,
  },
  upgradeSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  upgradeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  upgradeCardGradient: {
    flexDirection: 'column',
    padding: 16,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  upgradeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  upgradeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  upgradeInfo: {},
  upgradeName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  upgradePrice: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
  upgradeAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  upgradeActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  carouselDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.textMuted,
  },
  dotActive: {
    backgroundColor: theme.primary,
  },
  billingSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  billingCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  billingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  billingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: theme.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  billingContent: {
    flex: 1,
  },
  billingLabel: {
    fontSize: 13,
    color: theme.textMuted,
    marginBottom: 2,
  },
  billingValue: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.text,
  },
  billingAction: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.primary,
  },
  billingDivider: {
    height: 1,
    backgroundColor: theme.cardBorderAlt,
  },
  cancelSection: {
    marginTop: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.error,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.error,
  },
  cancelNote: {
    fontSize: 13,
    color: theme.textMuted,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 20,
  },
  noPlanContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  noPlanIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  noPlanTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  noPlanDescription: {
    fontSize: 15,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  selectPlanButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  selectPlanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.warning + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalActions: {
    width: '100%',
    gap: 12,
  },
  modalButtonSecondary: {
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.background,
    alignItems: 'center',
  },
  modalButtonSecondaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
  },
  modalButtonPrimary: {
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.error,
    alignItems: 'center',
  },
  modalButtonPrimaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
