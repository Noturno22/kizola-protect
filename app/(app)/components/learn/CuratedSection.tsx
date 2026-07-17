import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LearningArticle } from '@/lib/supabase';
import { Theme } from '@/providers/ThemeProvider';
import { ArticleCard } from './ArticleCard';

interface CuratedSectionProps {
  title: string;
  articles: readonly LearningArticle[];
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

export function CuratedSection({
  title,
  articles,
  getCategoryConfig,
  readArticles,
  bookmarkedIds,
  onSelectArticle,
  onToggleBookmark,
  theme,
  t,
}: CuratedSectionProps) {
  const styles = createStyles(theme);

  if (articles.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {articles.map((article) => (
          <View key={article.id} style={styles.cardWrapper}>
            <ArticleCard
              article={article}
              config={getCategoryConfig(article.category)}
              isRead={readArticles.includes(article.id)}
              isBookmarked={bookmarkedIds.includes(article.id)}
              onToggleBookmark={() => onToggleBookmark(article.id)}
              onPress={() => onSelectArticle(article)}
              theme={theme}
              t={t}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    section: {
      marginBottom: 28,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 24,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
      letterSpacing: -0.5,
    },
    scrollContent: {
      paddingHorizontal: 24,
      gap: 16,
    },
    cardWrapper: {
      width: 300,
    },
  });

export default CuratedSection;
