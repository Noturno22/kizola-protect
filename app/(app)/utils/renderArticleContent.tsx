import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Theme } from '@/providers/ThemeProvider';

export const createArticleContentStyles = (theme: Theme) =>
  StyleSheet.create({
    articleH2: {
      fontSize: 24,
      fontWeight: '800',
      color: theme.text,
      marginTop: 28,
      marginBottom: 12,
      letterSpacing: -0.5,
    },
    articleH3: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
      marginTop: 20,
      marginBottom: 8,
    },
    articleParagraph: {
      fontSize: 16,
      color: theme.textSecondary,
      lineHeight: 26,
      marginBottom: 12,
    },
    articleBold: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text,
    },
    articleListItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      marginBottom: 8,
    },
    bulletPoint: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.accent,
      marginTop: 10,
    },
    articleListText: {
      flex: 1,
      fontSize: 16,
      color: theme.textSecondary,
      lineHeight: 26,
    },
    articleNumberItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      marginBottom: 8,
    },
    numberPoint: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.accent,
    },
    articleSpacing: {
      height: 16,
    },
    imageContainer: {
      marginVertical: 16,
      borderRadius: 12,
      overflow: 'hidden' as const,
    },
    imageCaption: {
      fontSize: 12,
      color: theme.textMuted,
      marginTop: 4,
      fontStyle: 'italic' as const,
      textAlign: 'center' as const,
    },
    blockquoteContainer: {
      borderLeftWidth: 4,
      borderLeftColor: theme.accent,
      backgroundColor: theme.accent + '08',
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginVertical: 12,
      borderRadius: 8,
    },
    blockquoteText: {
      fontSize: 15,
      color: theme.textSecondary,
      lineHeight: 24,
      fontStyle: 'italic' as const,
    },
  });

type ArticleContentStyles = ReturnType<typeof createArticleContentStyles>;

export const renderArticleContent = (
  content: string,
  styles: ArticleContentStyles,
) => {
  const lines = content.split('\n');
  return lines.map((line, index) => {
    const trimmedLine = line.trim();
    if (trimmedLine === '') {
      return <View key={index} style={styles.articleSpacing} />;
    }
    const imageMatch = trimmedLine.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageMatch) {
      const [, alt, url] = imageMatch;
      return (
        <View key={index} style={styles.imageContainer}>
          <Image
            source={{ uri: url }}
            style={{ width: '100%', height: 200, borderRadius: 12 }}
            resizeMode="cover"
          />
          {alt ? <Text style={styles.imageCaption}>{alt}</Text> : null}
        </View>
      );
    }
    if (trimmedLine.startsWith('> ')) {
      return (
        <View key={index} style={styles.blockquoteContainer}>
          <Text style={styles.blockquoteText}>{trimmedLine.slice(2)}</Text>
        </View>
      );
    }
    if (trimmedLine.startsWith('## ')) {
      return (
        <Text key={index} style={styles.articleH2}>
          {trimmedLine.replace('## ', '')}
        </Text>
      );
    }
    if (trimmedLine.startsWith('### ')) {
      return (
        <Text key={index} style={styles.articleH3}>
          {trimmedLine.replace('### ', '')}
        </Text>
      );
    }
    if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
      return (
        <Text key={index} style={styles.articleBold}>
          {trimmedLine.replace(/\*\*/g, '')}
        </Text>
      );
    }
    if (trimmedLine.startsWith('- ')) {
      return (
        <View key={index} style={styles.articleListItem}>
          <View style={styles.bulletPoint} />
          <Text style={styles.articleListText}>
            {trimmedLine.replace('- ', '')}
          </Text>
        </View>
      );
    }
    if (trimmedLine.match(/^\d+\./)) {
      return (
        <View key={index} style={styles.articleNumberItem}>
          <Text style={styles.numberPoint}>
            {trimmedLine.match(/^\d+/)?.[0]}
          </Text>
          <Text style={styles.articleListText}>
            {trimmedLine.replace(/^\d+\.\s*/, '')}
          </Text>
        </View>
      );
    }
    if (trimmedLine === '') {
      return <View key={index} style={styles.articleSpacing} />;
    }
    return (
      <Text key={index} style={styles.articleParagraph}>
        {trimmedLine}
      </Text>
    );
  });
};

// Default export for Expo Router (this file is not a route)
export default function _notARoute() { return null; }
