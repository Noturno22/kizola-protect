import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useMemo } from 'react';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { GraduationCap, Search, X } from 'lucide-react-native';
import { Theme } from '@/providers/ThemeProvider';

interface LearnHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  theme: Theme;
  isDark: boolean;
  t: any;
}

export default function LearnHeader({ searchQuery, onSearchChange, theme, isDark, t }: LearnHeaderProps) {
  const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.headerIconContainer}>
          <LinearGradient
            colors={[theme.accent, theme.accentBlue]}
            style={StyleSheet.absoluteFillObject}
          />
          <GraduationCap size={32} color="#FFFFFF" />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{t('learn.title')}</Text>
          <Text style={styles.headerSubtitle}>{t('learn.subtitle')}</Text>
        </View>
      </View>

      <View style={styles.searchWrapper}>
        <BlurView intensity={isDark ? 20 : 40} tint={isDark ? 'dark' : 'light'} style={styles.searchContainer}>
          <Search size={20} color={theme.textSecondary} accessibilityElementsHidden />
          <TextInput
            placeholder={t('common.search') || 'Pesquisar guias...'}
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={onSearchChange}
            style={styles.searchInput}
            accessibilityLabel={t('common.search') || 'Pesquisar guias'}
            accessibilityRole="search"
          />
          {searchQuery !== '' && (
            <TouchableOpacity
              onPress={() => onSearchChange('')}
              style={styles.clearButton}
              accessibilityRole="button"
              accessibilityLabel="Limpar pesquisa"
              accessibilityHint="Remove o texto da pesquisa"
              activeOpacity={0.7}
            >
              <X size={18} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </BlurView>
      </View>
    </View>
  );
}

const createStyles = (theme: Theme, isDark: boolean) =>
  StyleSheet.create({
    header: {
      paddingHorizontal: 24,
      paddingTop: 32,
      paddingBottom: 48,
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    headerIconContainer: {
      width: 64,
      height: 64,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
    },
    headerTextContainer: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '800',
      color: isDark ? '#FFFFFF' : theme.text,
      marginBottom: 4,
      letterSpacing: 0.5,
    },
    headerSubtitle: {
      fontSize: 15,
      color: isDark ? 'rgba(255,255,255,0.85)' : theme.textSecondary,
      lineHeight: 22,
      marginBottom: 20,
    },
    searchWrapper: {
      marginTop: 8,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      height: 52,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.cardBorderAlt,
      overflow: 'hidden',
      gap: 12,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: theme.text,
      fontWeight: '500',
    },
    clearButton: {
      padding: 4,
    },
  });
