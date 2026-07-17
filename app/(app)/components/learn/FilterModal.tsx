import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { X, Check } from 'lucide-react-native';
import { ArticleDifficulty } from '@/lib/supabase';
import { ArticleFilters, ArticleSort } from '@/lib/learning';
import { Theme } from '@/providers/ThemeProvider';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: ArticleFilters;
  setFilters: (f: ArticleFilters) => void;
  sort: ArticleSort;
  setSort: (s: ArticleSort) => void;
  categories: string[];
  getCategoryConfig: (category: string) => {
    icon: React.ComponentType<{ size?: number; color?: string }>;
    color: string;
    label: string;
  };
  theme: Theme;
  t: (key: string) => string;
}

export function FilterModal({
  visible,
  onClose,
  filters,
  setFilters,
  sort,
  setSort,
  categories,
  getCategoryConfig,
  theme,
  t,
}: FilterModalProps) {
  const styles = createStyles(theme);
  const [localFilters, setLocalFilters] = useState<ArticleFilters>(filters);
  const [localSort, setLocalSort] = useState<ArticleSort>(sort);

  const toggleCategory = (cat: string) => {
    const current = localFilters.categories || [];
    const next = current.includes(cat)
      ? current.filter((c) => c !== cat)
      : [...current, cat];
    setLocalFilters({ ...localFilters, categories: next.length > 0 ? next : undefined });
  };

  const toggleDifficulty = (d: ArticleDifficulty) => {
    const current = localFilters.difficulty || [];
    const next = current.includes(d)
      ? current.filter((x) => x !== d)
      : [...current, d];
    setLocalFilters({ ...localFilters, difficulty: next.length > 0 ? next : undefined });
  };

  const toggleReadTime = (r: 'short' | 'medium' | 'long') => {
    setLocalFilters({
      ...localFilters,
      readTime: localFilters.readTime === r ? undefined : r,
    });
  };

  const handleApply = () => {
    setFilters(localFilters);
    setSort(localSort);
    onClose();
  };

  const handleClear = () => {
    setLocalFilters({});
    setLocalSort('recent');
  };

  const sortOptions: { key: ArticleSort; label: string }[] = [
    { key: 'recent', label: t('learn.sortRecent') },
    { key: 'popular', label: t('learn.sortPopular') },
    { key: 'az', label: t('learn.sortAZ') },
    { key: 'readTime', label: t('learn.sortReadTime') },
  ];

  const difficultyOptions: { key: ArticleDifficulty; label: string }[] = [
    { key: 'beginner', label: t('learn.beginner') },
    { key: 'intermediate', label: t('learn.intermediate') },
    { key: 'advanced', label: t('learn.advanced') },
  ];

  const readTimeOptions: { key: 'short' | 'medium' | 'long'; label: string }[] = [
    { key: 'short', label: t('learn.under5') },
    { key: 'medium', label: t('learn.fiveTo10') },
    { key: 'long', label: t('learn.over10') },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('learn.filters')}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={22} color={theme.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          <Text style={styles.label}>{t('learn.sortBy')}</Text>
          <View style={styles.optionsRow}>
            {sortOptions.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.optionBtn, localSort === opt.key && styles.optionBtnActive]}
                onPress={() => setLocalSort(opt.key)}
              >
                <Text style={[styles.optionText, localSort === opt.key && styles.optionTextActive]}>
                  {opt.label}
                </Text>
                {localSort === opt.key && <Check size={14} color="#FFF" />}
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>{t('learn.difficulty')}</Text>
          <View style={styles.optionsRow}>
            {difficultyOptions.map((opt) => {
              const active = localFilters.difficulty?.includes(opt.key) ?? false;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.optionBtn, active && styles.optionBtnActive]}
                  onPress={() => toggleDifficulty(opt.key)}
                >
                  <Text style={[styles.optionText, active && styles.optionTextActive]}>
                    {opt.label}
                  </Text>
                  {active && <Check size={14} color="#FFF" />}
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>{t('learn.readTime')}</Text>
          <View style={styles.optionsRow}>
            {readTimeOptions.map((opt) => {
              const active = localFilters.readTime === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.optionBtn, active && styles.optionBtnActive]}
                  onPress={() => toggleReadTime(opt.key)}
                >
                  <Text style={[styles.optionText, active && styles.optionTextActive]}>
                    {opt.label}
                  </Text>
                  {active && <Check size={14} color="#FFF" />}
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>{t('learn.filters')} — {t('learn.allArticles')}</Text>
          <View style={styles.categoryGrid}>
            {categories.map((cat) => {
              const config = getCategoryConfig(cat);
              const active = localFilters.categories?.includes(cat) ?? false;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    active && { backgroundColor: config.color, borderColor: config.color },
                  ]}
                  onPress={() => toggleCategory(cat)}
                >
                  <Text style={[styles.categoryChipText, active && { color: '#FFF' }]}>
                    {config.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
            <Text style={styles.clearBtnText}>{t('learn.clearFilters')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
            <Text style={styles.applyBtnText}>{t('learn.applyFilters')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.cardBorderAlt,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
    },
    closeBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    body: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 12,
      marginTop: 8,
    },
    optionsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 20,
    },
    optionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.cardBorderAlt,
    },
    optionBtnActive: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
    },
    optionText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    optionTextActive: {
      color: '#FFF',
    },
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 20,
    },
    categoryChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.cardBorderAlt,
    },
    categoryChipText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    footer: {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 24,
      paddingVertical: 20,
      borderTopWidth: 1,
      borderTopColor: theme.cardBorderAlt,
    },
    clearBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 14,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.cardBorderAlt,
      alignItems: 'center',
    },
    clearBtnText: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.textSecondary,
    },
    applyBtn: {
      flex: 2,
      paddingVertical: 14,
      borderRadius: 14,
      backgroundColor: theme.accent,
      alignItems: 'center',
    },
    applyBtnText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#FFF',
    },
  });

export default FilterModal;
