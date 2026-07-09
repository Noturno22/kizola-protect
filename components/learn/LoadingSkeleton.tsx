import { View, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { Theme } from '@/providers/ThemeProvider';

interface LoadingSkeletonProps {
  count?: number;
  theme: Theme;
}

export default function LoadingSkeleton({ count = 3, theme }: LoadingSkeletonProps) {
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container} accessibilityRole="progressbar" accessibilityLabel="Carregando artigos">
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.cardInner}>
            <View style={styles.cardHeader}>
              <View style={styles.iconSkeleton} />
              <View style={styles.tagSkeleton} />
            </View>
            <View style={styles.titleSkeleton} />
            <View style={styles.descSkeleton} />
            <View style={styles.descSkeletonShort} />
            <View style={styles.footerSkeleton}>
              <View style={styles.readTimeSkeleton} />
              <View style={styles.arrowSkeleton} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      gap: 16,
    },
    card: {
      backgroundColor: theme.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.cardBorderAlt,
      overflow: 'hidden',
    },
    cardInner: {
      padding: 20,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    iconSkeleton: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: theme.cardBorderAlt,
    },
    tagSkeleton: {
      width: 60,
      height: 24,
      borderRadius: 8,
      backgroundColor: theme.cardBorderAlt,
    },
    titleSkeleton: {
      height: 20,
      borderRadius: 6,
      backgroundColor: theme.cardBorderAlt,
      marginBottom: 12,
      width: '80%',
    },
    descSkeleton: {
      height: 14,
      borderRadius: 6,
      backgroundColor: theme.cardBorderAlt,
      marginBottom: 8,
      width: '100%',
    },
    descSkeletonShort: {
      height: 14,
      borderRadius: 6,
      backgroundColor: theme.cardBorderAlt,
      marginBottom: 20,
      width: '60%',
    },
    footerSkeleton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.cardBorderAlt,
    },
    readTimeSkeleton: {
      width: 80,
      height: 28,
      borderRadius: 8,
      backgroundColor: theme.cardBorderAlt,
    },
    arrowSkeleton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.cardBorderAlt,
    },
  });
