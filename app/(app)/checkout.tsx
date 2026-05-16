import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  CreditCard,
  Lock,
  ArrowLeft,
  AlertCircle,
  Crown,
  Star,
  Shield,
} from 'lucide-react-native';
import { useTheme, Theme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import { PLANS } from '@/lib/supabase';
import {
  CardData,
  processPayment,
  formatCardNumberInput,
  formatExpiryInput,
  validateCard,
  getCardBrand,
} from '@/lib/payment';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function Checkout() {
  const router = useRouter();
  const { t } = useTranslation();
  const { planId } = useLocalSearchParams<{ planId?: string }>();
  const safePlanId = String(planId || '');
  const { updateUserPlan } = useAuth();
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  let plan = null;
  if (safePlanId === 'basic' || safePlanId === 'pro' || safePlanId === 'premium') {
    plan = PLANS[safePlanId];
  }

  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const cardBrand = useMemo(() => {
    if (cardNumber.replace(/\s/g, '').length >= 4) {
      return getCardBrand(cardNumber);
    }
    return null;
  }, [cardNumber]);

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumberInput(value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardNumber(formatted);
      if (errors.cardNumber) {
        setErrors((prev) => ({ ...prev, cardNumber: '' }));
      }
    }
  };

  const handleExpiryChange = (value: string) => {
    const formatted = formatExpiryInput(value);
    if (formatted.length <= 5) {
      setExpiryDate(formatted);
      if (errors.expiryDate) {
        setErrors((prev) => ({ ...prev, expiryDate: '' }));
      }
    }
  };

  const handleCvcChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 4) {
      setCvc(cleaned);
      if (errors.cvc) {
        setErrors((prev) => ({ ...prev, cvc: '' }));
      }
    }
  };

  const handleNameChange = (value: string) => {
    setCardholderName(value);
    if (errors.cardholderName) {
      setErrors((prev) => ({ ...prev, cardholderName: '' }));
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'premium':
        return <Crown size={24} color={theme.accentPurple} />;
      case 'pro':
        return <Star size={24} color={theme.accentBlue} />;
      default:
        return <Shield size={24} color={theme.success} />;
    }
  };

  const handlePayment = async () => {
    const cardData: CardData = {
      cardNumber,
      expiryDate,
      cvc,
      cardholderName,
    };

    const validation = validateCard(cardData);
    if (!validation.valid) {
      const newErrors: Record<string, string> = {};
      
      if (validation.error?.includes('card number')) {
        newErrors.cardNumber = validation.error;
      }
      if (validation.error?.includes('expir')) {
        newErrors.expiryDate = validation.error;
      }
      if (validation.error?.includes('CVC')) {
        newErrors.cvc = validation.error;
      }
      if (validation.error?.includes('name')) {
        newErrors.cardholderName = validation.error;
      }
      
      setErrors(newErrors);
      return;
    }

    if (!plan) {
      Alert.alert(t('common.error'), 'Invalid plan selected');
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const result = await processPayment(cardData, {
        id: plan.id,
        name: plan.name,
        price: plan.price,
        interval: 'month',
      });

      if (result.success) {
        await updateUserPlan(plan.id as 'basic' | 'pro' | 'premium');
        
        Alert.alert(
          t('common.success'),
          result.message || `You are now subscribed to the ${plan.name} plan.`,
          [
            {
              text: t('common.done'),
              onPress: () => router.replace('/dashboard'),
            },
          ]
        );
      } else {
        Alert.alert(t('common.error'), result.error || 'Payment failed. Please try again.');
      }
    } catch (error: any) {
      Alert.alert(
        t('common.error'),
        error.message || 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderError = (field: string) => {
    if (errors[field]) {
      return (
        <View style={styles.errorContainer}>
          <AlertCircle size={14} color={theme.error} />
          <Text style={styles.errorText}>{errors[field]}</Text>
        </View>
      );
    }
    return null;
  };

  if (!plan || plan.id === 'free') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.isDark ? "#FFFFFF" : theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('checkout.title')}</Text>
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <LinearGradient colors={theme.headerGradient as any} style={styles.headerGradient}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <ArrowLeft size={24} color={theme.isDark ? "#FFFFFF" : theme.text} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{t('checkout.title')}</Text>
            </View>

            {/* Plan Summary */}
            <View style={styles.planSummary}>
              <View style={styles.planIconContainer}>
                {getPlanIcon(plan.id)}
              </View>
              <View style={styles.planInfo}>
                <Text style={styles.planName}>{plan.name} Plan</Text>
                <Text style={styles.planPrice}>
                  ${plan.price.toFixed(2)}/month
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Card Form */}
          <View style={styles.formContainer}>
            {/* Card Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('checkout.cardNumber')}</Text>
              <View style={[styles.inputContainer, errors.cardNumber && styles.inputError]}>
                <CreditCard size={20} color={theme.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor={theme.textMuted}
                  value={cardNumber}
                  onChangeText={handleCardNumberChange}
                  keyboardType="numeric"
                  maxLength={19}
                />
                {cardBrand && (
                  <View style={styles.cardBrandBadge}>
                    <Text style={styles.cardBrandText}>{cardBrand}</Text>
                  </View>
                )}
              </View>
              {renderError('cardNumber')}
            </View>

            {/* Expiry and CVC Row */}
            <View style={styles.row}>
              <View style={styles.halfInputGroup}>
                <Text style={styles.label}>{t('checkout.expiryDate')}</Text>
                <View style={[styles.inputContainer, errors.expiryDate && styles.inputError]}>
                  <TextInput
                    style={styles.input}
                    placeholder="MM/YY"
                    placeholderTextColor={theme.textMuted}
                    value={expiryDate}
                    onChangeText={handleExpiryChange}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
                {renderError('expiryDate')}
              </View>

              <View style={styles.halfInputGroup}>
                <Text style={styles.label}>{t('checkout.cvc')}</Text>
                <View style={[styles.inputContainer, errors.cvc && styles.inputError]}>
                  <Lock size={20} color={theme.textMuted} />
                  <TextInput
                    style={styles.input}
                    placeholder="123"
                    placeholderTextColor={theme.textMuted}
                    value={cvc}
                    onChangeText={handleCvcChange}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
                {renderError('cvc')}
              </View>
            </View>

            {/* Cardholder Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('checkout.cardholderName')}</Text>
              <View style={[styles.inputContainer, errors.cardholderName && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor={theme.textMuted}
                  value={cardholderName}
                  onChangeText={handleNameChange}
                  autoCapitalize="words"
                />
              </View>
              {renderError('cardholderName')}
            </View>

            {/* Security Note */}
            <View style={styles.securityNote}>
              <Lock size={16} color={theme.textMuted} />
              <Text style={styles.securityText}>
                Your payment info is encrypted and secure. This is a test environment using Stripe mock.
              </Text>
            </View>

            {/* Pay Button */}
            <TouchableOpacity
              style={[styles.payButton, loading && styles.payButtonDisabled]}
              onPress={handlePayment}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.payButtonText}>Pay ${plan.price.toFixed(2)}</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Test Cards Info */}
            <View style={styles.testCardsContainer}>
              <Text style={styles.testCardsTitle}>Test Cards</Text>
              <Text style={styles.testCardsText}>4242 4242 4242 4242 - Success (Recommended)</Text>
              <Text style={styles.testCardsText}>4000 0000 0000 9995 - Card Declined</Text>
              <Text style={styles.testCardsText}>4000 0000 0000 0069 - Card Declined</Text>
            </View>
          </View>
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
    },
    headerGradient: {
      paddingBottom: 24,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 8,
      gap: 12,
    },
    backButton: {
      padding: 8,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.isDark ? '#FFFFFF' : theme.text,
    },
    planSummary: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginTop: 8,
      gap: 16,
    },
    planIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 16,
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
    },
    planInfo: {
      flex: 1,
    },
    planName: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.isDark ? '#FFFFFF' : theme.text,
      marginBottom: 4,
    },
    planPrice: {
      fontSize: 16,
      color: theme.isDark ? 'rgba(255,255,255,0.85)' : theme.textSecondary,
    },
    formContainer: {
      padding: 20,
      gap: 20,
    },
    inputGroup: {
      gap: 8,
    },
    row: {
      flexDirection: 'row',
      gap: 16,
    },
    halfInputGroup: {
      flex: 1,
      gap: 8,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.cardBorderAlt,
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
    },
    inputError: {
      borderColor: theme.error,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: theme.text,
    },
    cardBrandBadge: {
      backgroundColor: theme.primary + '20',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    cardBrandText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.primary,
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 4,
    },
    errorText: {
      fontSize: 12,
      color: theme.error,
    },
    securityNote: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      padding: 16,
      backgroundColor: theme.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.cardBorderAlt,
    },
    securityText: {
      flex: 1,
      fontSize: 13,
      color: theme.textMuted,
      lineHeight: 18,
    },
    payButton: {
      backgroundColor: theme.primary,
      paddingVertical: 18,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    payButtonDisabled: {
      opacity: 0.7,
    },
    payButtonText: {
      fontSize: 18,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    testCardsContainer: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.cardBorderAlt,
      marginTop: 8,
    },
    testCardsTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 12,
    },
    testCardsText: {
      fontSize: 13,
      color: theme.textMuted,
      marginBottom: 4,
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