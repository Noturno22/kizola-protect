import { useMemo } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useLearn } from './hooks/useLearn';
import { LEARNING_ARTICLES } from '@/lib/supabase';
import { LearnHeader } from './components/learn/LearnHeader';
import { FeaturedArticleCard } from './components/learn/FeaturedArticleCard';
import { StatsSection } from './components/learn/StatsSection';
import { CategoryChips } from './components/learn/CategoryChips';
import { ArticleGrid } from './components/learn/ArticleGrid';
import { PremiumTipCard } from './components/learn/PremiumTipCard';
import { ArticleModal } from './components/learn/ArticleModal';

export default function Learn() {
  const {
    selectedCategory, setSelectedCategory,
    selectedArticle, setSelectedArticle,
    searchQuery, setSearchQuery,
    readArticles, fadeAnim, scrollY,
    filteredArticles, featuredArticle, categories,
    markAsRead, getCategoryConfig,
    theme, isDark, t, insets,
  } = useLearn();

  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <LinearGradient
        colors={theme.headerGradient}
        locations={[0, 0.3, 0.45]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <LearnHeader
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              theme={theme}
              isDark={isDark}
              t={t}
            />

            {!selectedCategory && !searchQuery && featuredArticle && (
              <FeaturedArticleCard
                featuredArticle={featuredArticle}
                onPress={() => setSelectedArticle(featuredArticle)}
                theme={theme}
                t={t}
              />
            )}

            <StatsSection
              articleCount={LEARNING_ARTICLES.length}
              categoryCount={categories.length}
              theme={theme}
              t={t}
            />

            <CategoryChips
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              getCategoryConfig={getCategoryConfig}
              fadeAnim={fadeAnim}
              theme={theme}
              t={t}
            />

            <ArticleGrid
              filteredArticles={filteredArticles}
              selectedCategory={selectedCategory}
              fadeAnim={fadeAnim}
              getCategoryConfig={getCategoryConfig}
              readArticles={readArticles}
              onSelectArticle={setSelectedArticle}
              theme={theme}
              t={t}
            />

            <PremiumTipCard theme={theme} t={t} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <ArticleModal
        selectedArticle={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        getCategoryConfig={getCategoryConfig}
        markAsRead={markAsRead}
        theme={theme}
        isDark={isDark}
        t={t}
        scrollY={scrollY}
      />
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
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
});
