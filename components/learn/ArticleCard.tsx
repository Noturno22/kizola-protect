import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useMemo } from 'react';
import { Clock, ChevronRight, CheckCircle } from 'lucide-react-native';
import { LearningArticle } from '@/lib/supabase';
import { Theme } from '@/providers/ThemeProvider';

interface CategoryConfig {
  icon: typeof import('lucide-react-native').FileText;
  color: string;
  label: string;
}

interface ArticleCardProps {
  article: LearningArticle;
  categoryConfig: CategoryConfig;
  isRead: boolean;
  onPress: () => void;
  theme: Theme;
  t: any;
}

export default function ArticleCard({ article, categoryConfig, isRead, onPress, theme, t }: ArticleCardProps) {
  const styles = useMemo(() => createStyles(theme), [theme]);
  const Icon = categoryConfig.icon;

  return (
    <TouchableOpacity
      style={styles.articleCard}
      onPress={onPress}
      activeOpacity={0.8}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${t(article.title)}, ${categoryConfig.label}, ${article.readTime} minutos de leitura`}
      accessibilityHint="Abrir artigo para leitura"
    >
      <View style={styles.articleCardInner}>
        <View style={styles.articleHeader}>
          <View style={[styles.articleIconWrapper, { backgroundColor: categoryConfig.color + '15' }]}>
            <Icon size={24} color={categoryConfig.color} />
          </View>
          {isRead && (
            <View style={[styles.readBadge, { backgroundColor: theme.success + '15' }]}>
              <CheckCircle size={12} color={theme.success} />
              <Text style={[styles.readBadgeText, { color: theme.success }]}>{t('common.read') || 'Lido'}</Text>
            </View>
          )}
          <View style={[styles.categoryTag, { backgroundColor: categoryConfig.color + '10' }]}>
            <Text style={[styles.categoryTagText, { color: categoryConfig.color }]}>
              {categoryConfig.label}
            </Text>
          </View>
        </View>

        <Text style={styles.articleTitle}>{t(article.title)}</Text>
        <Text style={styles.articleDescription} numberOfLines={2}>
          {t(article.description)}
        </Text>

        <View style={styles.articleFooter}>
          <View style={styles.readTime}>
            <Clock size={14} color={theme.textMuted} accessibilityElementsHidden />
            <Text style={styles.readTimeText}>{article.readTime} {t('learn.minRead')}</Text>
          </View>
          <View style={styles.articleActionIcon}>
            <ChevronRight size={16} color={theme.accent} accessibilityElementsHidden />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
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
  });
