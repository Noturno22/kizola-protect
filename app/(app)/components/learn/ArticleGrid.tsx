import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LearningArticle } from '@/lib/supabase';
import { Theme } from '@/providers/ThemeProvider';
import { ArticleCard } from './ArticleCard';

interface ArticleGridProps {
  filteredArticles: LearningArticle[];
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
              theme={theme}
              t={t}
            />
          );
        })}
      </Animated.View>
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
  });

export default ArticleGrid;
