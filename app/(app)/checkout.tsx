import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  CreditCard,
  Lock,
  ArrowLeft,
  Shield,
  CheckCircle,
  ChevronRight,
  Smartphone,
} from 'lucide-react-native';
import { useTheme, Theme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import { PLANS } from '@/lib/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { getPaymentPlatform, PLAN_IAP_PRODUCTS } from '@/lib/payment';
import { purchaseProduct, verifyReceipt } from '@/services/iap/iapService';

export default function Checkout() {
  const router = useRouter();
  const { t } = useTranslation();
  const { planId } = useLocalSearchParams<{ planId?: string }>();
  const safePlanId = String(planId || '');
  const { session, isDemoMode, updateUserPlan } = useAuth();
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  let plan = null;
  if (safePlanId === 'basic' || safePlanId === 'pro' || safePlanId === 'premium') {
    plan = PLANS[safePlanId];
  }

  const [loading, setLoading] = useState(false);
  const paymentPlatform = getPaymentPlatform();

  const getPlanGradient = (id: string) => {
    switch (id) {
      case 'premium':
        return ['#8B5CF6', '#6366F1'] as const;
      case 'pro':
        return ['#0EA5E9', '#2563EB'] as const;
      case 'basic':
        return ['#10B981', '#059669'] as const;
      default:
        return ['#10B981', '#059669'] as const;
    }
  };

  const getPlanIcon = (id: string) => {
    switch (id) {
      case 'premium':
        return '#8B5CF6';
      case 'pro':
        return '#3B82F6';
      case 'basic':
        return '#22C55E';
      default:
        return '#22C55E';
    }
  };

  const handlePayment = async () => {
    if (!plan) {
      Alert.alert(t('common.error'), 'Invalid plan selected');
      return;
    }

    if (isDemoMode) {
      setLoading(true);
      try {
        await updateUserPlan(plan.id as any);
        Alert.alert(
          t('common.success'),
          `Modo de Teste: Plano ${plan.name} ativado com sucesso!`,
          [
            {
              text: t('common.done'),
              onPress: () => {
                router.replace('/dashboard');
              },
            },
          ]
        );
      } catch (error: any) {
        Alert.alert(t('common.error'), error.message || 'Falha ao ativar plano em modo teste');
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      // IAP flow for mobile (iOS/Android)
      if (paymentPlatform === 'iap') {
        const productId = PLAN_IAP_PRODUCTS[plan.id as 'basic' | 'pro' | 'premium'];
        if (!productId) {
          throw new Error('No IAP product configured for this plan');
        }

        const purchaseResult = await purchaseProduct(productId);
        if (!purchaseResult.success) {
          if (purchaseResult.userCancelled) {
            setLoading(false);
            return;
          }
          throw new Error(purchaseResult.error || 'Purchase failed');
        }

        const verification = await verifyReceipt(purchaseResult.purchase);
        if (!verification.valid) {
          throw new Error(verification.error || 'Receipt verification failed');
        }

        await updateUserPlan(plan.id as any);
        Alert.alert(
          t('common.success'),
          `Plano ${plan.name} ativado com sucesso!`,
          [{ text: t('common.done'), onPress: () => router.replace('/dashboard') }]
        );
        return;
      }

      // Stripe flow (web)
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !anonKey) {
        throw new Error('Supabase configuration is missing');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
          'apikey': anonKey,
        },
        body: JSON.stringify({ planId: plan.id }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create checkout session');
      }

      if (result.url) {
        const supported = await Linking.canOpenURL(result.url);
        if (supported) {
          await Linking.openURL(result.url);
          Alert.alert(
            t('common.success'),
            `Redirecionando para a página de pagamento Stripe...`,
            [
              {
                text: t('common.done'),
                onPress: () => {
                  router.replace('/dashboard');
                },
              },
            ]
          );
        } else {
          Alert.alert(t('common.error'), 'Unable to open payment link');
        }
      } else {
        throw new Error('No payment URL returned from server');
      }
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || 'Failed to open payment link');
    } finally {
      setLoading(false);
    }
  };

  if (!plan || plan.id === 'free') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.isDark ? "#FFFFFF" : theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Finalizar Compra</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No payment required for the Free plan.</Text>
          <TouchableOpacity
            style={styles.backToPlansButton}
            onPress={() => router.push('/plans')}
          >
            <Text style={styles.backToPlansText}>View Plans</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Checkout</Text>
          </View>

          {/* Plan Card */}
          <LinearGradient
            colors={getPlanGradient(plan.id)}
            style={styles.planCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.planCardHeader}>
              <View style={styles.planIconWrapper}>
                <View style={[styles.planIcon, { backgroundColor: getPlanIcon(plan.id) + '20' }]}>
                  <Shield size={24} color={getPlanIcon(plan.id)} />
                </View>
              </View>
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>{plan.name.toUpperCase()}</Text>
              </View>
            </View>
            
            <View style={styles.planCardContent}>
              <View>
                <Text style={styles.planName}>{plan.name} Plan</Text>
                <Text style={styles.planPeriod}>Monthly subscription</Text>
              </View>
              <View style={styles.priceBlock}>
                <Text style={styles.currency}>R$</Text>
                <Text style={styles.price}>{plan.price.toFixed(2)}</Text>
                <Text style={styles.period}>/mês</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Features Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Included in this plan</Text>
            <View style={styles.featuresCard}>
              {(() => {
                const benefits = t(`plans.${plan.id}.benefits`, { returnObjects: true });
                const benefitsArray = Array.isArray(benefits) ? benefits : [];
                return benefitsArray.slice(0, 4).map((benefit: string, index: number) => (
                  <View key={index} style={styles.featureRow}>
                    <View style={styles.featureCheck}>
                      <CheckCircle size={16} color={theme.success} />
                    </View>
                    <Text style={styles.featureText}>{benefit}</Text>
                  </View>
                ));
              })()}
              {(() => {
                const benefits = t(`plans.${plan.id}.benefits`, { returnObjects: true });
                const benefitsArray = Array.isArray(benefits) ? benefits : [];
                if (benefitsArray.length > 4) {
                  return (
                    <View style={styles.moreFeaturesRow}>
                      <Text style={styles.moreFeaturesText}>
                        +{benefitsArray.length - 4} more benefits
                      </Text>
                      <ChevronRight size={16} color={theme.textMuted} />
                    </View>
                  );
                }
                return null;
              })()}
            </View>
          </View>

          {/* Security Info */}
          <View style={styles.securityCard}>
            <View style={styles.securityIcon}>
              <Lock size={20} color={theme.success} />
            </View>
            <View style={styles.securityContent}>
              <Text style={styles.securityTitle}>Secure Payment</Text>
              <Text style={styles.securityText}>
                {paymentPlatform === 'iap'
                  ? 'Payment is processed securely through your device\'s app store. We never store your payment details.'
                  : 'Your payment is processed securely through Stripe. We never store your card details.'}
              </Text>
            </View>
          </View>

          {/* Pay Button */}
          <TouchableOpacity
            style={[styles.payButton, loading && styles.payButtonDisabled]}
            onPress={handlePayment}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={getPlanGradient(plan.id)}
              style={styles.payButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View style={styles.payButtonContent}>
                  {paymentPlatform === 'iap' ? (
                    <Smartphone size={20} color="#FFFFFF" />
                  ) : (
                    <CreditCard size={20} color="#FFFFFF" />
                  )}
                  <Text style={styles.payButtonText}>
                    {paymentPlatform === 'iap' ? 'Subscribe' : `Pagar R$ ${plan.price.toFixed(2)}`}
                  </Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Cancel Link */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingTop: 8,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      marginBottom: 24,
      gap: 12,
    },
    backButton: {
      padding: 8,
      borderRadius: 12,
      backgroundColor: theme.surface,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.text,
    },
    planCard: {
      borderRadius: 24,
      padding: 24,
      marginBottom: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    planCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    planIconWrapper: {
      width: 56,
      height: 56,
      borderRadius: 16,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    planIcon: {
      width: 48,
      height: 48,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
    },
    planBadge: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    planBadgeText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    planCardContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },
    planName: {
      fontSize: 22,
      fontWeight: '700',
      color: '#FFFFFF',
      marginBottom: 4,
    },
    planPeriod: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.8)',
    },
    priceBlock: {
      flexDirection: 'row',
      alignItems: 'flex-end',
    },
    currency: {
      fontSize: 18,
      fontWeight: '600',
      color: '#FFFFFF',
      marginBottom: 6,
      marginRight: 4,
    },
    price: {
      fontSize: 40,
      fontWeight: '800',
      color: '#FFFFFF',
      lineHeight: 44,
    },
    period: {
      fontSize: 16,
      color: 'rgba(255,255,255,0.8)',
      marginBottom: 6,
      marginLeft: 2,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 12,
    },
    featuresCard: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.cardBorderAlt,
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.cardBorderAlt,
    },
    featureCheck: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.success + '15',
      justifyContent: 'center',
      alignItems: 'center',
    },
    featureText: {
      flex: 1,
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
    },
    moreFeaturesRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      marginTop: 4,
    },
    moreFeaturesText: {
      fontSize: 14,
      color: theme.accent,
      fontWeight: '500',
    },
    securityCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: theme.success + '20',
      gap: 14,
    },
    securityIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: theme.success + '15',
      justifyContent: 'center',
      alignItems: 'center',
    },
    securityContent: {
      flex: 1,
    },
    securityTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
    },
    securityText: {
      fontSize: 13,
      color: theme.textMuted,
      lineHeight: 18,
    },
    payButton: {
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 12,
    },
    payButtonGradient: {
      paddingVertical: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    payButtonDisabled: {
      opacity: 0.7,
    },
    payButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    payButtonText: {
      fontSize: 18,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    cancelButton: {
      paddingVertical: 14,
      alignItems: 'center',
    },
    cancelButtonText: {
      fontSize: 16,
      color: theme.textMuted,
      fontWeight: '500',
    },
    bottomSpacer: {
      height: 20,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    emptyText: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
      marginBottom: 20,
    },
    backToPlansButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderRadius: 12,
    },
    backToPlansText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
  });