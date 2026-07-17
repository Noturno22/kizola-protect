import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, ChevronRight, CheckCircle, Bookmark, BookmarkCheck } from 'lucide-react-native';
import { LearningArticle } from '@/lib/supabase';
import { Theme } from '@/providers/ThemeProvider';

interface ArticleCardProps {
  article: LearningArticle;
  config: {
    icon: React.ComponentType<{ size?: number; color?: string }>;
    color: string;
    label: string;
  };
  isRead: boolean;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
  onPress: () => void;
  theme: Theme;
  t: (key: string) => string;
}

export function ArticleCard({
  article,
  config,
  isRead,
  isBookmarked = false,
  onToggleBookmark,
  onPress,
  theme,
  t,
}: ArticleCardProps) {
  const styles = createStyles(theme);
  const Icon = config.icon;

  const difficultyConfig = {
    beginner: { bg: theme.success + '15', color: theme.success, label: t('learn.beginner') },
    intermediate: { bg: '#F59E0B15', color: '#F59E0B', label: t('learn.intermediate') },
    advanced: { bg: theme.error + '15', color: theme.error, label: t('learn.advanced') },
  };
  const diff = article.difficulty ? difficultyConfig[article.difficulty] : null;

  return (
    <TouchableOpacity
      style={styles.articleCardOuter}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[config.color + '20', config.color + '05']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientStrip}
      />
      {article.coverImage && (
        <Image source={{ uri: article.coverImage }} style={styles.heroImage} resizeMode="cover" />
      )}
      <View style={styles.articleCardInner}>
        <View style={styles.articleHeader}>
          <View
            style={[
              styles.articleIconWrapper,
              { backgroundColor: config.color + '15' },
            ]}
          >
            <Icon size={24} color={config.color} />
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.bookmarkBtn}
              onPress={(e) => {
                e.stopPropagation?.();
                onToggleBookmark?.();
              }}
              activeOpacity={0.7}
            >
              {isBookmarked ? (
                <BookmarkCheck size={18} color={theme.accent} />
              ) : (
                <Bookmark size={18} color={theme.textMuted} />
              )}
            </TouchableOpacity>
            <View
              style={[
                styles.categoryTag,
                { backgroundColor: config.color + '10' },
              ]}
            >
              <Text style={[styles.categoryTagText, { color: config.color }]}>
                {config.label}
              </Text>
            </View>
          </View>
        </View>

        {isRead && (
          <View
            style={[
              styles.readBadge,
              { backgroundColor: theme.success + '15' },
            ]}
          >
            <CheckCircle size={12} color={theme.success} />
            <Text style={[styles.readBadgeText, { color: theme.success }]}>
              {t('common.read') || 'Lido'}
            </Text>
          </View>
        )}

        <Text style={styles.articleTitle}>{t(article.title)}</Text>
        <Text style={styles.articleDescription} numberOfLines={2}>
          {t(article.description)}
        </Text>

        {diff && (
          <View style={[styles.difficultyBadge, { backgroundColor: diff.bg }]}>
            <Text style={[styles.difficultyText, { color: diff.color }]}>
              {diff.label}
            </Text>
          </View>
        )}

        <View style={styles.articleFooter}>
          <View style={styles.readTime}>
            <Clock size={14} color={theme.textMuted} />
            <Text style={styles.readTimeText}>
              {article.readTime} {t('learn.minRead')}
            </Text>
          </View>
          <View style={styles.articleActionIcon}>
            <ChevronRight size={16} color={theme.accent} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    articleCardOuter: {
      backgroundColor: theme.surface,
      borderRadius: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.06,
      shadowRadius: 16,
      elevation: 4,
      borderWidth: 1,
      borderColor: theme.cardBorderAlt,
      overflow: 'hidden',
    },
    heroImage: {
      width: '100%',
      height: 160,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    },
    gradientStrip: {
      height: 8,
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
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    bookmarkBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.background,
      justifyContent: 'center',
      alignItems: 'center',
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
      alignSelf: 'flex-start',
      marginBottom: 8,
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
      marginBottom: 12,
    },
    difficultyBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      marginBottom: 16,
    },
    difficultyText: {
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
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
  });

export default ArticleCard;
