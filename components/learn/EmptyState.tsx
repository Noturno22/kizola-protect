import { View, Text, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { SearchX } from 'lucide-react-native';
import { Theme } from '@/providers/ThemeProvider';

interface EmptyStateProps {
  theme: Theme;
  t: any;
}

export default function EmptyState({ theme, t }: EmptyStateProps) {
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container} accessibilityRole="text" accessibilityLabel={t('learn.noArticles', 'Nenhum artigo encontrado')}>
      <View style={styles.iconWrapper}>
        <SearchX size={48} color={theme.textMuted} />
      </View>
      <Text style={styles.title}>{t('learn.noArticles', 'Nenhum artigo encontrado')}</Text>
      <Text style={styles.description}>
        {t('learn.noArticlesDesc', 'Tente ajustar a pesquisa ou selecionar outra categoria.')}
      </Text>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      paddingVertical: 48,
      paddingHorizontal: 24,
    },
    iconWrapper: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.cardBorderAlt,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    description: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
  });
