import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LearningArticle } from '@/lib/supabase';
import { Theme } from '@/providers/ThemeProvider';
import { ArticleCard } from './ArticleCard';
import { SearchX, ArrowUpDown } from 'lucide-react-native';

interface ArticleGridProps {
  filteredArticles: readonly LearningArticle[];
  selectedCategory: string | null;
  fadeAnim: Animated.Value;
  getCategoryConfig: (category: string) => {
    icon: React.ComponentType<{ size?: number; color?: string }>;
    color: string;
    label: string;
  };
  readArticles: string[];
  onSelectArticle: (article: LearningArticle) => void;
  theme: Theme;
  t: (key: string) => string;
  bookmarkedIds?: string[];
  onToggleBookmark?: (articleId: string) => void;
  sortLabel?: string;
}

export function ArticleGrid({
  filteredArticles,
  selectedCategory,
  fadeAnim,
  getCategoryConfig,
  readArticles,
  onSelectArticle,
  theme,
  t,
  bookmarkedIds,
  onToggleBookmark,
  sortLabel,
}: ArticleGridProps) {
  const styles = createStyles(theme);

  return (
    <View style={styles.articlesSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {selectedCategory
            ? getCategoryConfig(selectedCategory).label
            : t('learn.allArticles')}
        </Text>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{filteredArticles.length}</Text>
        </View>
      </View>

      {sortLabel && (
        <View style={styles.sortIndicator}>
          <ArrowUpDown size={12} color={theme.textMuted} />
          <Text style={styles.sortText}>{t('dashboard.sort')} {sortLabel}</Text>
        </View>
      )}

      {filteredArticles.length === 0 ? (
        <View style={styles.emptyState}>
          <SearchX size={48} color={theme.textMuted} />
          <Text style={styles.emptyTitle}>{t('learn.noResults')}</Text>
          <Text style={styles.emptySubtext}>{t('learn.tryDifferentFilters')}</Text>
        </View>
      ) : (
        <Animated.View
          style={[
            styles.articlesGrid,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {filteredArticles.map((article) => {
            const config = getCategoryConfig(article.category);
            return (
              <ArticleCard
                key={article.id}
                article={article}
                config={config}
                isRead={readArticles.includes(article.id)}
                onPress={() => onSelectArticle(article)}
                isBookmarked={bookmarkedIds?.includes(article.id) ?? false}
                onToggleBookmark={() => onToggleBookmark?.(article.id)}
                theme={theme}
                t={t}
              />
            );
          })}
        </Animated.View>
      )}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
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
    sortIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 16,
    },
    sortText: {
      fontSize: 12,
      color: theme.textMuted,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 48,
      gap: 12,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.textSecondary,
    },
    emptySubtext: {
      fontSize: 14,
      color: theme.textMuted,
    },
  });

export default ArticleGrid;
