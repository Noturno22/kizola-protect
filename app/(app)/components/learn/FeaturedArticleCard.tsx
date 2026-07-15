import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Clock, ChevronRight } from 'lucide-react-native';
import { LearningArticle } from '@/lib/supabase';
import { Theme } from '@/providers/ThemeProvider';

interface FeaturedArticleCardProps {
  featuredArticle: LearningArticle;
  onPress: () => void;
  theme: Theme;
  t: (key: string) => string;
}

export function FeaturedArticleCard({
  featuredArticle,
  onPress,
  theme,
  t,
}: FeaturedArticleCardProps) {
  const styles = createStyles(theme);

  return (
    <View style={styles.featuredSection}>
      <Text style={styles.sectionTitle}>
        {t('learn.featuredArticle') || 'Artigo em Destaque'}
      </Text>
      <TouchableOpacity
        style={styles.featuredCard}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={[theme.accent + '20', theme.accentBlue + '10']}
          style={styles.featuredGradient}
        />
        <View style={styles.featuredBadge}>
          <Sparkles size={14} color="#FFFFFF" />
          <Text style={styles.featuredBadgeText}>
            {t('learn.dailyTip') || 'Dica do Dia'}
          </Text>
        </View>
        <Text style={styles.featuredTitle}>{t(featuredArticle.title)}</Text>
        <Text style={styles.featuredDesc} numberOfLines={2}>
          {t(featuredArticle.description)}
        </Text>
        <View style={styles.featuredFooter}>
          <View style={styles.readTime}>
            <Clock size={14} color={theme.textSecondary} />
            <Text style={styles.readTimeText}>
              {featuredArticle.readTime} min
            </Text>
          </View>
          <View style={styles.featuredAction}>
            <Text style={styles.featuredActionText}>
              {t('learn.readNow') || 'Ler agora'}
            </Text>
            <ChevronRight size={16} color={theme.accent} />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    featuredSection: {
      paddingHorizontal: 24,
      marginBottom: 28,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
      letterSpacing: -0.5,
    },
    featuredCard: {
      borderRadius: 24,
      padding: 24,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.cardBorderAlt,
      backgroundColor: theme.surface,
      marginTop: 16,
    },
    featuredGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
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
  });

export default FeaturedArticleCard;
