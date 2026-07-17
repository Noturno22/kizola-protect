import { useMemo } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useLearn } from '../hooks/useLearn';
import { LearnHeader } from '../components/learn/LearnHeader';
import { FeaturedArticleCard } from '../components/learn/FeaturedArticleCard';
import { StatsSection } from '../components/learn/StatsSection';
import { CategoryChips } from '../components/learn/CategoryChips';
import { ArticleGrid } from '../components/learn/ArticleGrid';
import { CuratedSection } from '../components/learn/CuratedSection';
import { FilterModal } from '../components/learn/FilterModal';
import { PremiumTipCard } from '../components/learn/PremiumTipCard';
import { ArticleModal } from '../components/learn/ArticleModal';

export default function Learn() {
  const {
    selectedCategory, setSelectedCategory,
    selectedArticle, setSelectedArticle,
    searchQuery, setSearchQuery,
    readArticles, fadeAnim, scrollY,
    filteredArticles, featuredArticle, categories,
    markAsRead, getCategoryConfig,
    bookmarkedIds, handleToggleBookmark,
    popularArticles, recentArticles, recommendedArticles, bookmarkArticles,
    sort, setSort, filters, setFilters,
    showFilters, setShowFilters,
    hasActiveFilters, articleCounts,
    theme, isDark, t,
  } = useLearn();

  const styles = useMemo(() => theme ? createStyles(theme) : null, [theme]);
  if (!theme || !styles) return null;

  const sortLabels: Record<string, string> = {
    recent: t('learn.sortRecent'),
    popular: t('learn.sortPopular'),
    az: t('learn.sortAZ'),
    readTime: t('learn.sortReadTime'),
  };

  const showCurated = !selectedCategory && !searchQuery;

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
              onFilterPress={() => setShowFilters(!showFilters)}
              hasActiveFilters={hasActiveFilters}
            />

            {showCurated && featuredArticle && (
              <FeaturedArticleCard
                featuredArticle={featuredArticle}
                onPress={() => setSelectedArticle(featuredArticle)}
                theme={theme}
                t={t}
              />
            )}

            <StatsSection
              articleCount={55}
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
              articleCounts={articleCounts}
            />

            {showCurated && (
              <>
                <CuratedSection
                  title={t('learn.popular')}
                  articles={popularArticles}
                  getCategoryConfig={getCategoryConfig}
                  readArticles={readArticles}
                  bookmarkedIds={bookmarkedIds}
                  onSelectArticle={setSelectedArticle}
                  onToggleBookmark={handleToggleBookmark}
                  theme={theme}
                  t={t}
                />

                <CuratedSection
                  title={t('learn.recommended')}
                  articles={recommendedArticles}
                  getCategoryConfig={getCategoryConfig}
                  readArticles={readArticles}
                  bookmarkedIds={bookmarkedIds}
                  onSelectArticle={setSelectedArticle}
                  onToggleBookmark={handleToggleBookmark}
                  theme={theme}
                  t={t}
                />

                {bookmarkArticles.length > 0 && (
                  <CuratedSection
                    title={t('learn.saved')}
                    articles={bookmarkArticles}
                    getCategoryConfig={getCategoryConfig}
                    readArticles={readArticles}
                    bookmarkedIds={bookmarkedIds}
                    onSelectArticle={setSelectedArticle}
                    onToggleBookmark={handleToggleBookmark}
                    theme={theme}
                    t={t}
                  />
                )}
              </>
            )}

            <ArticleGrid
              filteredArticles={filteredArticles}
              selectedCategory={selectedCategory}
              fadeAnim={fadeAnim}
              getCategoryConfig={getCategoryConfig}
              readArticles={readArticles}
              onSelectArticle={setSelectedArticle}
              theme={theme}
              t={t}
              bookmarkedIds={bookmarkedIds}
              onToggleBookmark={handleToggleBookmark}
              sortLabel={sortLabels[sort]}
            />

            <PremiumTipCard theme={theme} t={t} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        setFilters={setFilters}
        sort={sort}
        setSort={setSort}
        categories={categories}
        getCategoryConfig={getCategoryConfig}
        theme={theme}
        t={t}
      />

      <ArticleModal
        selectedArticle={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        getCategoryConfig={getCategoryConfig}
        markAsRead={markAsRead}
        theme={theme}
        isDark={isDark}
        t={t}
        scrollY={scrollY}
        isBookmarked={selectedArticle ? bookmarkedIds.includes(selectedArticle.id) : false}
        onToggleBookmark={handleToggleBookmark}
      />
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
