import { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Animated, Dimensions, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import {
  BookOpen,
  Clock,
  ChevronRight,
  X,
  FileText,
  GraduationCap,
  Home,
  Scale,
  Briefcase,
  Calculator,
  Globe,
  Sparkles
} from 'lucide-react-native';
import { useTheme, Theme } from '@/providers/ThemeProvider';
import { LEARNING_ARTICLES, LearningArticle } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Search, Bookmark, CheckCircle, Share2 } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CATEGORY_CONFIG: Record<string, { icon: typeof FileText; color: string; key: string }> = {
  tax: { icon: Calculator, color: '#8B5CF6', key: 'learn.category_tax' },
  immigration: { icon: Globe, color: '#10B981', key: 'learn.category_immigration' },
  housing: { icon: Home, color: '#F59E0B', key: 'learn.category_housing' },
  legal: { icon: Scale, color: '#3B82F6', key: 'learn.category_legal' },
  career: { icon: Briefcase, color: '#EC4899', key: 'learn.category_career' },
};

export default function Learn() {
  const router = useRouter();
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<LearningArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [readArticles, setReadArticles] = useState<string[]>([]);
  const [readingProgress, setReadingProgress] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    loadReadStatus();
  }, []);

  const loadReadStatus = async () => {
    try {
      const saved = await AsyncStorage.getItem('@kizola_read_articles');
      if (saved) setReadArticles(JSON.parse(saved));
    } catch (e) {
      console.error('Error loading read status:', e);
    }
  };

  const markAsRead = async (articleId: string) => {
    try {
      const next = [...new Set([...readArticles, articleId])];
      setReadArticles(next);
      await AsyncStorage.setItem('@kizola_read_articles', JSON.stringify(next));
    } catch (e) {
      console.error('Error saving read status:', e);
    }
  };

  const filteredArticles = LEARNING_ARTICLES.filter(a => {
    const matchesCategory = !selectedCategory || a.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      t(a.title).toLowerCase().includes(searchQuery.toLowerCase()) || 
      t(a.description).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredArticle = LEARNING_ARTICLES[0]; // Logic for featured article

  const categories = Array.from(new Set(LEARNING_ARTICLES.map(a => a.category)));

  const getCategoryConfig = (category: string) => {
    const config = CATEGORY_CONFIG[category];
    if (config) {
      return { ...config, label: t(config.key) };
    }
    return { icon: FileText, color: theme.accent, label: category };
  };

  const renderArticleContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, index) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('## ')) {
        return (
          <Text key={index} style={styles.articleH2}>
            {trimmedLine.replace('## ', '')}
          </Text>
        );
      }
      if (trimmedLine.startsWith('### ')) {
        return (
          <Text key={index} style={styles.articleH3}>
            {trimmedLine.replace('### ', '')}
          </Text>
        );
      }
      if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
        return (
          <Text key={index} style={styles.articleBold}>
            {trimmedLine.replace(/\*\*/g, '')}
          </Text>
        );
      }
      if (trimmedLine.startsWith('- ')) {
        return (
          <View key={index} style={styles.articleListItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.articleListText}>{trimmedLine.replace('- ', '')}</Text>
          </View>
        );
      }
      if (trimmedLine.match(/^\d+\./)) {
        return (
          <View key={index} style={styles.articleNumberItem}>
            <Text style={styles.numberPoint}>{trimmedLine.match(/^\d+/)?.[0]}</Text>
            <Text style={styles.articleListText}>{trimmedLine.replace(/^\d+\.\s*/, '')}</Text>
          </View>
        );
      }
      if (trimmedLine === '') {
        return <View key={index} style={styles.articleSpacing} />;
      }
      return (
        <Text key={index} style={styles.articleParagraph}>
          {trimmedLine}
        </Text>
      );
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Background Gradient extending from top */}
      <LinearGradient
        colors={theme.headerGradient}
        locations={[0, 0.3, 0.45]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
            showsVerticalScrollIndicator={false}
          >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.headerIconContainer}>
                <LinearGradient
                  colors={[theme.accent, theme.accentBlue]}
                  style={StyleSheet.absoluteFillObject}
                />
                <GraduationCap size={32} color="#FFFFFF" />
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>{t('learn.title')}</Text>
                <Text style={styles.headerSubtitle}>{t('learn.subtitle')}</Text>
              </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchWrapper}>
              <BlurView intensity={isDark ? 20 : 40} tint={isDark ? "dark" : "light"} style={styles.searchContainer}>
                <Search size={20} color={theme.textSecondary} />
                <TextInput
                  placeholder={t('common.search') || "Pesquisar guias..."}
                  placeholderTextColor={theme.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={styles.searchInput}
                />
                {searchQuery !== '' && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <X size={18} color={theme.textMuted} />
                  </TouchableOpacity>
                )}
              </BlurView>
            </View>
          </View>

          {/* Featured Article */}
          {!selectedCategory && !searchQuery && featuredArticle && (
            <View style={styles.featuredSection}>
              <Text style={styles.sectionTitle}>{t('learn.featuredArticle') || "Artigo em Destaque"}</Text>
              <TouchableOpacity 
                style={styles.featuredCard}
                onPress={() => setSelectedArticle(featuredArticle)}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={[theme.accent + '20', theme.accentBlue + '10']}
                  style={styles.featuredGradient}
                />
                <View style={styles.featuredBadge}>
                  <Sparkles size={14} color="#FFFFFF" />
                  <Text style={styles.featuredBadgeText}>{t('learn.dailyTip') || "Dica do Dia"}</Text>
                </View>
                <Text style={styles.featuredTitle}>{t(featuredArticle.title)}</Text>
                <Text style={styles.featuredDesc} numberOfLines={2}>{t(featuredArticle.description)}</Text>
                <View style={styles.featuredFooter}>
                   <View style={styles.readTime}>
                      <Clock size={14} color={theme.textSecondary} />
                      <Text style={styles.readTimeText}>{featuredArticle.readTime} min</Text>
                   </View>
                   <View style={styles.featuredAction}>
                      <Text style={styles.featuredActionText}>{t('learn.readNow') || "Ler agora"}</Text>
                      <ChevronRight size={16} color={theme.accent} />
                   </View>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Stats overlapping the gradient edge */}
          <View style={styles.statsWrapper}>
            <BlurView intensity={80} tint="light" style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{LEARNING_ARTICLES.length}</Text>
                <Text style={styles.statLabel}>{t('learn.articles_stat')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{categories.length}</Text>
                <Text style={styles.statLabel}>{t('learn.categories_stat')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>15m</Text>
                <Text style={styles.statLabel}>{t('learn.avgRead')}</Text>
              </View>
            </BlurView>
          </View>

          {/* Categories */}
          <View style={styles.categoriesSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScroll}
            >
              <TouchableOpacity
                style={[styles.categoryChip, selectedCategory === null && styles.categoryChipActive]}
                onPress={() => {
                  fadeAnim.setValue(0);
                  setSelectedCategory(null);
                }}
                activeOpacity={0.7}
              >
                <BookOpen size={16} color={selectedCategory === null ? '#FFFFFF' : theme.textSecondary} />
                <Text style={[styles.categoryChipText, selectedCategory === null && styles.categoryChipTextActive]}>
                  {t('learn.all')}
                </Text>
              </TouchableOpacity>
              {categories.map((category) => {
                const config = getCategoryConfig(category);
                const Icon = config.icon;
                const isActive = selectedCategory === category;
                return (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryChip,
                      isActive && { backgroundColor: config.color, borderColor: config.color }
                    ]}
                    onPress={() => {
                      if (!isActive) fadeAnim.setValue(0);
                      setSelectedCategory(isActive ? null : category);
                    }}
                    activeOpacity={0.7}
                  >
                    <Icon size={16} color={isActive ? '#FFFFFF' : config.color} />
                    <Text style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}>
                      {config.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Articles Grid */}
          <View style={styles.articlesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {selectedCategory ? getCategoryConfig(selectedCategory).label : t('learn.allArticles')}
              </Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{filteredArticles.length}</Text>
              </View>
            </View>

            <Animated.View style={[styles.articlesGrid, {
              opacity: fadeAnim,
              transform: [{
                translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] })
              }]
            }]}>
              {filteredArticles.map((article) => {
                const config = getCategoryConfig(article.category);
                const Icon = config.icon;
                return (
                  <TouchableOpacity
                    key={article.id}
                    style={styles.articleCard}
                    onPress={() => setSelectedArticle(article)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.articleCardInner}>
                      <View style={styles.articleHeader}>
                        <View style={[styles.articleIconWrapper, { backgroundColor: config.color + '15' }]}>
                          <Icon size={24} color={config.color} />
                        </View>
                        {readArticles.includes(article.id) && (
                          <View style={[styles.readBadge, { backgroundColor: theme.success + '15' }]}>
                            <CheckCircle size={12} color={theme.success} />
                            <Text style={[styles.readBadgeText, { color: theme.success }]}>{t('common.read') || "Lido"}</Text>
                          </View>
                        )}
                        <View style={[styles.categoryTag, { backgroundColor: config.color + '10' }]}>
                          <Text style={[styles.categoryTagText, { color: config.color }]}>
                            {config.label}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.articleTitle}>{t(article.title)}</Text>
                      <Text style={styles.articleDescription} numberOfLines={2}>
                        {t(article.description)}
                      </Text>

                      <View style={styles.articleFooter}>
                        <View style={styles.readTime}>
                          <Clock size={14} color={theme.textMuted} />
                          <Text style={styles.readTimeText}>{article.readTime} {t('learn.minRead')}</Text>
                        </View>
                        <View style={styles.articleActionIcon}>
                          <ChevronRight size={16} color={theme.accent} />
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </Animated.View>
          </View>

          {/* Premium Quick Tip Card */}
          <View style={styles.tipSection}>
            <LinearGradient
              colors={[theme.accent, theme.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.premiumTipCard}
            >
              <View style={styles.tipIconGlow}>
                <Sparkles size={28} color={theme.accentAmber} />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.premiumTipTitle}>{t('learn.needHelp')}</Text>
                <Text style={styles.premiumTipDescription}>
                  {t('learn.helpDesc')}
                </Text>
                <TouchableOpacity
                  style={styles.premiumTipButton}
                  onPress={() => router.push('/support')}
                  activeOpacity={0.9}
                >
                  <Text style={styles.premiumTipButtonText}>{t('learn.contactSupport')}</Text>
                  <ChevronRight size={16} color={theme.primary} />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>

      {/* Modern Full-Screen Article Modal */}
      <Modal
        visible={selectedArticle !== null}
        animationType="slide"
        onRequestClose={() => setSelectedArticle(null)}
      >
        <View style={styles.modalContainer}>
          <StatusBar style={isDark ? "light" : "dark"} />
          {selectedArticle && (() => {
            const config = getCategoryConfig(selectedArticle.category);
            const Icon = config.icon;

            return (
              <>
                  <SafeAreaView edges={['top']} style={[styles.modalNavArea, { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 }]}>
                    <TouchableOpacity
                      onPress={() => setSelectedArticle(null)}
                      style={styles.modalCloseCircle}
                      activeOpacity={0.7}
                    >
                      <X size={22} color={theme.text} />
                    </TouchableOpacity>
                    
                    <View style={styles.modalNavActions}>
                       <TouchableOpacity style={styles.modalActionCircle}>
                          <Bookmark size={20} color={theme.text} />
                       </TouchableOpacity>
                       <TouchableOpacity style={styles.modalActionCircle}>
                          <Share2 size={20} color={theme.text} />
                       </TouchableOpacity>
                    </View>
                  </SafeAreaView>

                  {/* Reading Progress Bar */}
                  <View style={styles.progressContainer}>
                     <Animated.View 
                       style={[
                         styles.progressBar, 
                         { 
                           backgroundColor: config.color,
                           width: scrollY.interpolate({
                             inputRange: [0, 500],
                             outputRange: ['0%', '100%'],
                             extrapolate: 'clamp'
                           })
                         }
                       ]} 
                     />
                  </View>

                  <Animated.ScrollView
                    contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
                    showsVerticalScrollIndicator={false}
                    onScroll={Animated.event(
                      [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                      { useNativeDriver: false }
                    )}
                    scrollEventThrottle={16}
                    onMomentumScrollEnd={(e) => {
                       const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
                       if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 20) {
                          markAsRead(selectedArticle.id);
                       }
                    }}
                  >
                    <View style={[styles.modalHeaderGraphic, { backgroundColor: config.color + '15', zIndex: 10 }]}>
                      <View style={styles.modalHeroContent}>
                        <View style={[styles.modalHeroIconWrapper, { backgroundColor: theme.surface, shadowColor: config.color }]}>
                          <Icon size={40} color={config.color} />
                        </View>
                        <View style={[styles.modalHeroTag, { backgroundColor: config.color }]}>
                          <Text style={styles.modalHeroTagText}>{config.label}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.modalBody}>
                      <View style={styles.modalTitleSection}>
                    <Text style={styles.modalArticleTitle}>{t(selectedArticle.title)}</Text>
                    <View style={styles.modalMetaBar}>
                      <View style={styles.modalMetaItem}>
                        <Clock size={16} color={theme.textMuted} />
                        <Text style={styles.modalMetaText}>{selectedArticle.readTime} {t('learn.minRead')}</Text>
                      </View>
                      <View style={styles.modalMetaDivider} />
                      <Text style={styles.modalMetaDate}>{new Date().toLocaleDateString()}</Text>
                    </View>
                  </View>

                  <View style={styles.modalArticleContent}>
                    {renderArticleContent(t(selectedArticle.content))}
                  </View>

                  <View style={styles.modalFooter}>
                    <LinearGradient
                      colors={[theme.background, theme.surface]}
                      style={styles.modalHelpBox}
                    >
                      <Text style={styles.modalHelpTitle}>{t('learn.needHelp')}</Text>
                      <Text style={styles.modalHelpText}>{t('learn.helpDesc')}</Text>
                      <TouchableOpacity
                        style={[styles.modalCtaButton, { backgroundColor: config.color }]}
                        onPress={() => {
                          setSelectedArticle(null);
                          setTimeout(() => router.push('/support'), 300);
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.modalCtaText}>{t('learn.helpTopic')}</Text>
                        <ChevronRight size={18} color="#FFFFFF" />
                      </TouchableOpacity>
                    </LinearGradient>
                  </View>
                  </View>
                  </Animated.ScrollView>
              </>
            );
          })()}
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
    paddingTop: 32,
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
    marginBottom: 20,
  },
  searchWrapper: {
    marginTop: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.cardBorderAlt,
    overflow: 'hidden',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.text,
    fontWeight: '500',
  },
  featuredSection: {
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  featuredCard: {
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.cardBorderAlt,
    marginTop: 16,
  },
  featuredGradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.8,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.accent,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  featuredBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  featuredTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.text,
    marginBottom: 8,
  },
  featuredDesc: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featuredActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.accent,
  },
  statsWrapper: {
    marginHorizontal: 24,
    marginTop: -32,
    marginBottom: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.cardBorderAlt,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.accent,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: theme.cardBorderAlt,
  },
  categoriesSection: {
    marginBottom: 28,
  },
  categoriesScroll: {
    paddingHorizontal: 24,
    gap: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.cardBorderAlt,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryChipActive: {
    backgroundColor: theme.accent,
    borderColor: theme.accent,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  articlesSection: {
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
    letterSpacing: -0.5,
  },
  countBadge: {
    backgroundColor: theme.cardBorderAlt,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.textSecondary,
  },
  articlesGrid: {
    gap: 16,
  },
  articleCard: {
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
  articleCardInner: {
    padding: 20,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  articleIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryTagText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  readBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    position: 'absolute',
    top: 0,
    right: 0,
  },
  readBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  articleDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  articleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.cardBorderAlt,
  },
  readTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  readTimeText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  articleActionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.accent + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipSection: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  premiumTipCard: {
    flexDirection: 'row',
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
    shadowColor: theme.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  tipIconGlow: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  tipContent: {
    flex: 1,
  },
  premiumTipTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  premiumTipDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
    marginBottom: 16,
  },
  premiumTipButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  premiumTipButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.primary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.surface,
  },
  modalHeaderGraphic: {
    height: 240,
    position: 'relative',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  modalNavArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    zIndex: 10,
  },
  modalCloseCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  modalNavActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalActionCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    zIndex: 1000,
  },
  progressBar: {
    height: '100%',
  },
  modalHeroContent: {
    position: 'absolute',
    bottom: -40,
    left: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  modalHeroIconWrapper: {
    width: 88,
    height: 88,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeroTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  modalHeroTagText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalBody: {
    paddingTop: 64,
    paddingHorizontal: 24,
  },
  modalTitleSection: {
    marginBottom: 32,
  },
  modalArticleTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: theme.text,
    lineHeight: 38,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  modalMetaBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalMetaText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  modalMetaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.cardBorderAlt,
  },
  modalMetaDate: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textMuted,
  },
  modalArticleContent: {
    gap: 12,
  },
  articleH2: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.text,
    marginTop: 28,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  articleH3: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
    marginTop: 20,
    marginBottom: 8,
  },
  articleParagraph: {
    fontSize: 16,
    color: theme.textSecondary,
    lineHeight: 26,
    marginBottom: 12,
  },
  articleBold: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
  },
  articleListItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.accent,
    marginTop: 10,
  },
  articleListText: {
    flex: 1,
    fontSize: 16,
    color: theme.textSecondary,
    lineHeight: 26,
  },
  articleNumberItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  numberPoint: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.accent,
  },
  articleSpacing: {
    height: 16,
  },
  modalFooter: {
    marginTop: 40,
  },
  modalHelpBox: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.cardBorderAlt,
  },
  modalHelpTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.text,
    marginBottom: 8,
  },
  modalHelpText: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
  },
  modalCtaText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
