import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
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
        {featuredArticle.coverImage && (
          <Image
            source={{ uri: featuredArticle.coverImage }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        )}
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.3)']}
          style={styles.featuredGradient}
        />
        <View style={styles.featuredBadge}>
          <Sparkles size={14} color="#FFFFFF" />
          <Text style={styles.featuredBadgeText}>
            {t('learn.dailyTip') || 'Dica do Dia'}
          </Text>
        </View>
        <Text style={[styles.featuredTitle, { color: '#FFFFFF' }]}>{t(featuredArticle.title)}</Text>
        <Text style={[styles.featuredDesc, { color: 'rgba(255,255,255,0.85)' }]} numberOfLines={2}>
          {t(featuredArticle.description)}
        </Text>
        <View style={styles.featuredFooter}>
          <View style={styles.readTime}>
            <Clock size={14} color="rgba(255,255,255,0.7)" />
            <Text style={[styles.readTimeText, { color: 'rgba(255,255,255,0.8)' }]}>
              {featuredArticle.readTime} min
            </Text>
          </View>
          <View style={styles.featuredAction}>
            <Text style={[styles.featuredActionText, { color: '#FFFFFF' }]}>
              {t('learn.readNow') || 'Ler agora'}
            </Text>
            <ChevronRight size={16} color="#FFFFFF" />
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
    heroImage: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 200,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
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
      backgroundColor: 'rgba(255,255,255,0.15)',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
    },
    readTimeText: {
      fontSize: 13,
      fontWeight: '600',
      color: 'rgba(255,255,255,0.8)',
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
