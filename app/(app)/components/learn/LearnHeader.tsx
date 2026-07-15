import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { GraduationCap, Search, X } from 'lucide-react-native';
import { useTheme, Theme, darkTheme } from '@/providers/ThemeProvider';

interface LearnHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  /** @deprecated Passar theme como prop é opcional — o componente usa useTheme() internamente */
  theme?: Theme;
  /** @deprecated Passar isDark como prop é opcional — o componente usa useTheme() internamente */
  isDark?: boolean;
  t: (key: string) => string;
}

export function LearnHeader({
  searchQuery,
  setSearchQuery,
  theme: themeProp,
  isDark: isDarkProp,
  t,
}: LearnHeaderProps) {
  // Consumir o contexto directamente — evita crash quando a prop chega undefined
  // durante o primeiro render (race condition no mount do ThemeProvider)
  const { theme: themeCtx, isDark: isDarkCtx } = useTheme();
  const theme = themeProp ?? themeCtx ?? darkTheme;
  const isDark = isDarkProp ?? isDarkCtx ?? true;

  const styles = createStyles(theme, isDark);

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.headerIconContainer}>
          <LinearGradient
            colors={[theme.accent, theme.accentBlue]}
            style={StyleSheet.absoluteFill}
          />
          <GraduationCap size={32} color="#FFFFFF" />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{t('learn.title')}</Text>
          <Text style={styles.headerSubtitle}>{t('learn.subtitle')}</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <BlurView
          intensity={isDark ? 20 : 40}
          tint={isDark ? 'dark' : 'light'}
          style={styles.searchContainer}
        >
          <Search size={20} color={theme.textSecondary} />
          <TextInput
            placeholder={t('common.search') || 'Pesquisar guias...'}
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
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
  });

export default LearnHeader;
