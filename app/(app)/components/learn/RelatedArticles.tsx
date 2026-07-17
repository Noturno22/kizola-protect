import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LearningArticle } from '@/lib/supabase';
import { getRelatedArticles } from '@/lib/learning';
import { Theme } from '@/providers/ThemeProvider';
import { ArticleCard } from './ArticleCard';

interface RelatedArticlesProps {
  articleId: string;
  getCategoryConfig: (category: string) => {
    icon: React.ComponentType<{ size?: number; color?: string }>;
    color: string;
    label: string;
  };
  readArticles: string[];
  bookmarkedIds: string[];
  onSelectArticle: (article: LearningArticle) => void;
  onToggleBookmark: (articleId: string) => void;
  theme: Theme;
  t: (key: string) => string;
}

export function RelatedArticles({
  articleId,
  getCategoryConfig,
  readArticles,
  bookmarkedIds,
  onSelectArticle,
  onToggleBookmark,
  theme,
  t,
}: RelatedArticlesProps) {
  const styles = createStyles(theme);
  const related = getRelatedArticles(articleId, 3);

  if (related.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{t('learn.relatedArticles')}</Text>
      <View style={styles.grid}>
        {related.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            config={getCategoryConfig(article.category)}
            isRead={readArticles.includes(article.id)}
            isBookmarked={bookmarkedIds.includes(article.id)}
            onToggleBookmark={() => onToggleBookmark(article.id)}
            onPress={() => onSelectArticle(article)}
            theme={theme}
            t={t}
          />
        ))}
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    section: {
      marginTop: 24,
      paddingTop: 24,
      borderTopWidth: 1,
      borderTopColor: theme.cardBorderAlt,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 16,
    },
    grid: {
      gap: 12,
    },
  });

export default RelatedArticles;
