import { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Animated, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import {
  Scale,
  Globe,
  Calculator,
  Home,
  GraduationCap,
  Briefcase,
  ShieldAlert,
  KeyRound,
  X,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Bike,
  ShieldCheck
} from 'lucide-react-native';
import { useTheme, Theme } from '@/providers/ThemeProvider';
import { BENEFIT_CATEGORIES, BENEFITS } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

const getIcon = (name: string, size: number, color: string) => {
  switch (name) {
    case 'Scale': return <Scale size={size} color={color} />;
    case 'Globe': return <Globe size={size} color={color} />;
    case 'Calculator': return <Calculator size={size} color={color} />;
    case 'Home': return <Home size={size} color={color} />;
    case 'GraduationCap': return <GraduationCap size={size} color={color} />;
    case 'Briefcase': return <Briefcase size={size} color={color} />;
    case 'ShieldAlert': return <ShieldAlert size={size} color={color} />;
    case 'KeyRound': return <KeyRound size={size} color={color} />;
    case 'Bike': return <Bike size={size} color={color} />;
    default: return <ShieldCheck size={size} color={color} />;
  }
};

export default function Benefits() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  
  const [selectedCategory, setSelectedCategory] = useState<typeof BENEFIT_CATEGORIES[keyof typeof BENEFIT_CATEGORIES] | null>(null);
  const [selectedBenefit, setSelectedBenefit] = useState<typeof BENEFITS[number] | null>(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleRequestAssistance = (categoryId: string) => {
    setSelectedCategory(null);
    setSelectedBenefit(null);
    setTimeout(() => {
      router.push({
        pathname: '/support',
        params: { category: categoryId }
      });
    }, 300);
  };

  const categoryEntries = Object.entries(BENEFIT_CATEGORIES);

  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* Absolute Header Gradient */}
      <LinearGradient 
        colors={theme.headerGradient} 
        locations={[0, 0.35, 0.5]}
        style={StyleSheet.absoluteFillObject} 
      />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.headerIconContainer}>
                <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFillObject} />
                <ShieldCheck size={36} color={theme.isDark ? "#FFFFFF" : theme.accent} />
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>{t('benefits.title')}</Text>
                <Text style={styles.headerSubtitle}>
                  {t('benefits.subtitle', { plan: user?.plan || t('common.member') })}
                </Text>
              </View>
            </View>
          </View>

          {/* Upgrade CTA (Moved to top overlapping gradient) */}
          <View style={styles.premiumCtaWrapper}>
            <LinearGradient
              colors={[theme.warning, '#F57C00']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.premiumCtaCard}
            >
              <View style={styles.ctaGlow}>
                <Sparkles size={32} color="#FFFFFF" />
              </View>
              <View style={styles.ctaContent}>
                <Text style={styles.ctaTitle}>{t('benefits.ctaTitle')}</Text>
                <Text style={styles.ctaDescription}>{t('benefits.ctaDesc')}</Text>
                <TouchableOpacity
                  style={styles.ctaButton}
                  onPress={() => router.push('/plans')}
                  activeOpacity={0.9}
                >
                  <Text style={styles.ctaButtonText}>{t('benefits.upgrade')}</Text>
                  <ChevronRight size={18} color={theme.warning} />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {/* Categories Grid */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{t('benefits.categories')}</Text>
            
            <Animated.View style={[styles.categoriesGrid, { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}>
              {categoryEntries.map(([key, category]) => {
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.categoryCard}
                    onPress={() => setSelectedCategory(category)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.categoryCardInner}>
                      <View style={[styles.categoryIconCircle, { backgroundColor: category.color + '15' }]}>
                        {getIcon(category.icon, 28, category.color)}
                      </View>
                      <Text style={styles.categoryTitle}>{t(`benefits.categories_list.${category.id}.title`)}</Text>
                      <Text style={styles.categoryDescription} numberOfLines={2}>
                        {t(`benefits.categories_list.${category.id}.description`)}
                      </Text>
                      <View style={styles.categoryFooter}>
                        <Text style={[styles.categoryActionText, { color: category.color }]}>
                          {t('benefits.viewDetails')}
                        </Text>
                        <ChevronRight size={16} color={category.color} />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </Animated.View>
          </View>

          {/* Special Feature: Bike Loan */}
          <View style={styles.specialFeatureContainer}>
            <TouchableOpacity style={styles.bikeLoanCard} activeOpacity={0.9}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.bikeLoanGradient}
              >
                <View style={styles.bikeLoanContentWrapper}>
                  <View style={styles.bikeLoanTextContent}>
                    <View style={styles.bikeLoanBadge}>
                      <Text style={styles.bikeLoanBadgeText}>{t('benefits.newBadge')}</Text>
                    </View>
                    <Text style={styles.bikeLoanTitle}>{t('benefits.bikeLoanTitle')}</Text>
                    <Text style={styles.bikeLoanDescription}>
                      {t('benefits.bikeLoanDesc')}
                    </Text>
                  </View>
                  <View style={styles.bikeLoanIconHero}>
                    <View style={styles.bikeLoanIconCircle}>
                      <Bike size={44} color="#059669" />
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Individual Benefits List */}
          <View style={styles.listSectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('benefits.allServices')}</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{BENEFITS.length}</Text>
              </View>
            </View>

            <View style={styles.benefitsListContainer}>
              {BENEFITS.map((benefit, index) => (
                <TouchableOpacity
                  key={benefit.id}
                  style={[
                    styles.benefitListItem,
                    index === BENEFITS.length - 1 && styles.benefitListItemLast
                  ]}
                  onPress={() => setSelectedBenefit(benefit)}
                  activeOpacity={0.7}
                >
                  <View style={styles.benefitListIcon}>
                    {getIcon(benefit.icon, 24, theme.primary)}
                  </View>
                  <View style={styles.benefitListContent}>
                    <Text style={styles.benefitListTitle}>{t(`benefits.items.${benefit.id}.title`)}</Text>
                    <Text style={styles.benefitListCategory}>{t(`benefits.items.${benefit.id}.category_name`)}</Text>
                  </View>
                  <View style={styles.benefitListAction}>
                    <ChevronRight size={20} color={theme.textMuted} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Category Detail Modal */}
      <Modal
        visible={selectedCategory !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedCategory(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={() => setSelectedCategory(null)} 
          />
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 24 }]}>
            {selectedCategory && (
              <>
                <View style={styles.modalDragIndicator} />
                <View style={styles.modalSheetHeader}>
                  <View style={[styles.modalSheetIcon, { backgroundColor: selectedCategory.color + '15' }]}>
                    {getIcon(selectedCategory.icon, 32, selectedCategory.color)}
                  </View>
                  <TouchableOpacity
                    onPress={() => setSelectedCategory(null)}
                    style={styles.modalSheetClose}
                  >
                    <X size={24} color={theme.textSecondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={[styles.modalCategoryTag, { backgroundColor: selectedCategory.color + '15' }]}>
                    <Text style={[styles.modalCategoryTagText, { color: selectedCategory.color }]}>
                      {t(`benefits.categories_list.${selectedCategory.id}.title`)}
                    </Text>
                  </View>

                  <Text style={styles.modalSheetTitle}>{t(`benefits.categories_list.${selectedCategory.id}.title`)}</Text>
                  <Text style={styles.modalSheetDescription}>{t(`benefits.categories_list.${selectedCategory.id}.description`)}</Text>

                  <View style={styles.modalFeaturesBox}>
                    <Text style={styles.modalFeaturesTitle}>{t('benefits.whatsIncluded')}</Text>
                    <View style={styles.modalFeaturesList}>
                      {(() => {
                        const features = t(`benefits.categories_list.${selectedCategory.id}.features`, { returnObjects: true });
                        const featuresArray = Array.isArray(features) ? features : [];
                        return featuresArray.map((feature, index) => (
                          <View key={index} style={styles.modalFeatureItem}>
                            <CheckCircle2 size={22} color={selectedCategory.color} />
                            <Text style={styles.modalFeatureText}>{feature}</Text>
                          </View>
                        ));
                      })()}
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.modalPrimaryAction, { backgroundColor: selectedCategory.color }]}
                    onPress={() => handleRequestAssistance(selectedCategory.id)}
                    activeOpacity={0.8}
                  >
                    <HelpCircle size={22} color="#FFFFFF" />
                    <Text style={styles.modalPrimaryActionText}>{t('benefits.requestAssistance')}</Text>
                  </TouchableOpacity>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Benefit Detail Modal */}
      <Modal
        visible={selectedBenefit !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedBenefit(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={() => setSelectedBenefit(null)} 
          />
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 24 }]}>
            {selectedBenefit && (
              <>
                <View style={styles.modalDragIndicator} />
                <View style={styles.modalSheetHeader}>
                  <View style={[styles.modalSheetIcon, { backgroundColor: theme.primary + '20' }]}>
                    {getIcon(selectedBenefit.icon, 32, theme.primary)}
                  </View>
                  <TouchableOpacity
                    onPress={() => setSelectedBenefit(null)}
                    style={styles.modalSheetClose}
                  >
                    <X size={24} color={theme.textSecondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={[styles.modalCategoryTag, { backgroundColor: theme.primary + '20' }]}>
                    <Text style={[styles.modalCategoryTagText, { color: theme.primary }]}>
                      {t(`benefits.items.${selectedBenefit.id}.category_name`)}
                    </Text>
                  </View>

                  <Text style={styles.modalSheetTitle}>{t(`benefits.items.${selectedBenefit.id}.title`)}</Text>
                  <Text style={styles.modalSheetDescription}>{t(`benefits.items.${selectedBenefit.id}.description`)}</Text>

                  <View style={{ height: 24 }} />

                  <TouchableOpacity
                    style={[styles.modalPrimaryAction, { backgroundColor: theme.primary }]}
                    onPress={() => handleRequestAssistance(selectedBenefit.id)}
                    activeOpacity={0.8}
                  >
                    <HelpCircle size={22} color="#FFFFFF" />
                    <Text style={styles.modalPrimaryActionText}>{t('benefits.requestService')}</Text>
                  </TouchableOpacity>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 48,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.isDark ? '#FFFFFF' : theme.text,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: theme.isDark ? 'rgba(255,255,255,0.85)' : theme.textSecondary,
    lineHeight: 22,
  },
  premiumCtaWrapper: {
    marginHorizontal: 24,
    marginTop: -32,
    marginBottom: 32,
    shadowColor: theme.warning,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  premiumCtaCard: {
    flexDirection: 'row',
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
  },
  ctaGlow: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  ctaContent: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  ctaDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
    marginBottom: 16,
  },
  ctaButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.warning,
  },
  sectionContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.text,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - 48 - 16) / 2,
    backgroundColor: theme.surface,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: theme.cardBorderAlt,
  },
  categoryCardInner: {
    padding: 20,
  },
  categoryIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  categoryDescription: {
    fontSize: 13,
    color: theme.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  categoryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.cardBorderAlt,
  },
  categoryActionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  specialFeatureContainer: {
    marginHorizontal: 24,
    marginBottom: 32,
  },
  bikeLoanCard: {
    borderRadius: 24,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  bikeLoanGradient: {
    padding: 24,
  },
  bikeLoanContentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bikeLoanTextContent: {
    flex: 1,
    paddingRight: 16,
  },
  bikeLoanBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  bikeLoanBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bikeLoanTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  bikeLoanDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
  },
  bikeLoanIconHero: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bikeLoanIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  listSectionContainer: {
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  countBadge: {
    backgroundColor: theme.cardBorderAlt,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.textSecondary,
  },
  benefitsListContainer: {
    backgroundColor: theme.surface,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.cardBorderAlt,
  },
  benefitListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.cardBorderAlt,
  },
  benefitListItemLast: {
    borderBottomWidth: 0,
  },
  benefitListIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: theme.accent + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  benefitListContent: {
    flex: 1,
  },
  benefitListTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 4,
  },
  benefitListCategory: {
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  benefitListAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 24,
  },
  modalDragIndicator: {
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.cardBorderAlt,
    alignSelf: 'center',
    marginBottom: 24,
  },
  modalSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  modalSheetIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSheetClose: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCategoryTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalCategoryTagText: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalSheetTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.text,
    marginBottom: 12,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  modalSheetDescription: {
    fontSize: 16,
    color: theme.textSecondary,
    lineHeight: 26,
    marginBottom: 32,
  },
  modalFeaturesBox: {
    backgroundColor: theme.background,
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
  },
  modalFeaturesTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.text,
    marginBottom: 16,
  },
  modalFeaturesList: {
    gap: 16,
  },
  modalFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalFeatureText: {
    fontSize: 16,
    color: theme.text,
    flex: 1,
    lineHeight: 22,
  },
  modalPrimaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  modalPrimaryActionText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
});
