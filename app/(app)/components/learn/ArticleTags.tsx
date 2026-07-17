import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Theme } from '@/providers/ThemeProvider';

interface ArticleTagsProps {
  tags: readonly string[];
  onTagPress: (tag: string) => void;
  theme: Theme;
}

export function ArticleTags({ tags, onTagPress, theme }: ArticleTagsProps) {
  const styles = createStyles(theme);

  if (tags.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {tags.map((tag) => (
        <TouchableOpacity
          key={tag}
          style={styles.tag}
          onPress={() => onTagPress(tag)}
          activeOpacity={0.7}
        >
          <Text style={styles.tagText}>#{tag}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      gap: 8,
      paddingVertical: 4,
    },
    tag: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.cardBorderAlt,
    },
    tagText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.accent,
    },
  });

export default ArticleTags;
