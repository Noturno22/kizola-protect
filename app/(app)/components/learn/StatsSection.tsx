import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Theme } from '@/providers/ThemeProvider';

interface StatsSectionProps {
  articleCount: number;
  categoryCount: number;
  theme: Theme;
  t: (key: string) => string;
}

export function StatsSection({
  articleCount,
  categoryCount,
  theme,
  t,
}: StatsSectionProps) {
  const styles = createStyles(theme);

  return (
    <View style={styles.statsWrapper}>
      <BlurView intensity={80} tint="light" style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{articleCount}</Text>
          <Text style={styles.statLabel}>{t('learn.articles_stat')}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{categoryCount}</Text>
          <Text style={styles.statLabel}>{t('learn.categories_stat')}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>15m</Text>
          <Text style={styles.statLabel}>{t('learn.avgRead')}</Text>
        </View>
      </BlurView>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    statsWrapper: {
      marginHorizontal: 24,
      marginTop: -32,
      marginBottom: 24,
      borderRadius: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 8,
      backgroundColor: 'transparent',
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.cardBorderAlt,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 20,
      paddingHorizontal: 16,
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.accent,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    statDivider: {
      width: 1,
      height: '100%',
      backgroundColor: theme.cardBorderAlt,
    },
  });
