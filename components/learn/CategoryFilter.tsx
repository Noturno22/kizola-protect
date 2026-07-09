import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useMemo } from 'react';
import { BookOpen } from 'lucide-react-native';
import { Theme } from '@/providers/ThemeProvider';

interface CategoryConfig {
  icon: typeof import('lucide-react-native').FileText;
  color: string;
  label: string;
}

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  getCategoryConfig: (category: string) => CategoryConfig;
  theme: Theme;
  t: any;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  getCategoryConfig,
  theme,
  t,
}: CategoryFilterProps) {
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.categoriesSection}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
      >
        <TouchableOpacity
          style={[styles.categoryChip, selectedCategory === null && styles.categoryChipActive]}
          onPress={() => onSelectCategory(null)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t('learn.all')}
          accessibilityState={{ selected: selectedCategory === null }}
        >
          <BookOpen size={16} color={selectedCategory === null ? '#FFFFFF' : theme.textSecondary} />
          <Text style={[styles.categoryChipText, selectedCategory === null && styles.categoryChipTextActive]}>
            {t('learn.all')}
          </Text>
        </TouchableOpacity>
        {categories.map((category) => {
          const config = getCategoryConfig(category);
          const Icon = config.icon;
          const isActive = selectedCategory === category;
          return (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                isActive && { backgroundColor: config.color, borderColor: config.color },
              ]}
              onPress={() => onSelectCategory(isActive ? null : category)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={config.label}
              accessibilityState={{ selected: isActive }}
              accessibilityHint={isActive ? 'Remover filtro' : `Filtrar por ${config.label}`}
            >
              <Icon size={16} color={isActive ? '#FFFFFF' : config.color} />
              <Text style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}>
                {config.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    categoriesSection: {
      marginBottom: 28,
    },
    categoriesScroll: {
      paddingHorizontal: 24,
      gap: 12,
    },
    categoryChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 24,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.cardBorderAlt,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    categoryChipActive: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
      shadowOpacity: 0.15,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
    categoryChipText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    categoryChipTextActive: {
      color: '#FFFFFF',
    },
  });
