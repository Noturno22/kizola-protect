import { useState, useRef, useEffect, useCallback } from 'react';
import { Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as SecureStore from 'expo-secure-store';
import { LEARNING_ARTICLES, LearningArticle } from '@/lib/supabase';
import {
  FileText,
  Calculator,
  Globe,
  Home,
  Scale,
  Briefcase,
} from 'lucide-react-native';
import { Theme } from '@/providers/ThemeProvider';

export const CATEGORY_CONFIG: Record<string, { icon: typeof FileText; color: string; key: string }> = {
  tax: { icon: Calculator, color: '#8B5CF6', key: 'learn.category_tax' },
  immigration: { icon: Globe, color: '#10B981', key: 'learn.category_immigration' },
  housing: { icon: Home, color: '#F59E0B', key: 'learn.category_housing' },
  legal: { icon: Scale, color: '#3B82F6', key: 'learn.category_legal' },
  career: { icon: Briefcase, color: '#EC4899', key: 'learn.category_career' },
};

const READ_ARTICLES_KEY = 'kizola_read_articles';

export function useLearnArticles(theme: Theme) {
  const { t } = useTranslation();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [readArticles, setReadArticles] = useState<string[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Animate on category/search change
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [selectedCategory, searchQuery]);

  // Load persisted read status
  useEffect(() => {
    (async () => {
      try {
        const saved = await SecureStore.getItemAsync(READ_ARTICLES_KEY);
        if (saved) setReadArticles(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading read status:', e);
      }
    })();
  }, []);

  const markAsRead = useCallback(async (articleId: string) => {
    try {
      const next = [...new Set([...readArticles, articleId])];
      setReadArticles(next);
      await SecureStore.setItemAsync(READ_ARTICLES_KEY, JSON.stringify(next));
    } catch (e) {
      console.error('Error saving read status:', e);
    }
  }, [readArticles]);

  const filteredArticles = LEARNING_ARTICLES.filter((a) => {
    const matchesCategory = !selectedCategory || a.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      t(a.title).toLowerCase().includes(searchQuery.toLowerCase()) ||
      t(a.description).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredArticle = LEARNING_ARTICLES[0];

  const categories = Array.from(new Set(LEARNING_ARTICLES.map((a) => a.category)));

  const getCategoryConfig = useCallback(
    (category: string) => {
      const config = CATEGORY_CONFIG[category];
      if (config) {
        return { ...config, label: t(config.key) };
      }
      return { icon: FileText, color: theme.accent, label: category };
    },
    [t, theme.accent],
  );

  const handleSelectCategory = useCallback(
    (category: string | null) => {
      if (category !== selectedCategory) fadeAnim.setValue(0);
      setSelectedCategory(category);
    },
    [selectedCategory, fadeAnim],
  );

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return {
    selectedCategory,
    searchQuery,
    readArticles,
    filteredArticles,
    featuredArticle,
    categories,
    fadeAnim,
    getCategoryConfig,
    markAsRead,
    handleSelectCategory,
    handleSearchChange,
    totalArticles: LEARNING_ARTICLES.length,
  };
}
