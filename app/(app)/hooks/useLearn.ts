import { useState, useRef, useEffect, useMemo } from 'react';
import { Animated } from 'react-native';
import { useTheme, Theme } from '@/providers/ThemeProvider';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LEARNING_ARTICLES, LearningArticle } from '@/lib/supabase';
import { CATEGORY_CONFIG } from '../constants/learnCategories';
import { FileText } from 'lucide-react-native';

export function useLearn() {
  const router = useRouter();
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<LearningArticle | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [readArticles, setReadArticles] = useState<string[]>([]);
  const [readingProgress, setReadingProgress] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    loadReadStatus();
  }, []);

  const loadReadStatus = async () => {
    try {
      const saved = await AsyncStorage.getItem('@kizola_read_articles');
      if (saved) setReadArticles(JSON.parse(saved));
    } catch (e) {
      console.error('Error loading read status:', e);
    }
  };

  const markAsRead = async (articleId: string) => {
    try {
      const next = [...new Set([...readArticles, articleId])];
      setReadArticles(next);
      await AsyncStorage.setItem('@kizola_read_articles', JSON.stringify(next));
    } catch (e) {
      console.error('Error saving read status:', e);
    }
  };

  const filteredArticles = LEARNING_ARTICLES.filter((a) => {
    const matchesCategory = !selectedCategory || a.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      t(a.title).toLowerCase().includes(searchQuery.toLowerCase()) ||
      t(a.description).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredArticle = LEARNING_ARTICLES[0];

  const categories = Array.from(
    new Set(LEARNING_ARTICLES.map((a) => a.category)),
  );

  const getCategoryConfig = (category: string) => {
    const config = CATEGORY_CONFIG[category];
    if (config) {
      return { ...config, label: t(config.key) };
    }
    return { icon: FileText, color: theme.accent, label: category };
  };

  return {
    // State
    selectedCategory,
    setSelectedCategory,
    selectedArticle,
    setSelectedArticle,
    searchQuery,
    setSearchQuery,
    readArticles,
    readingProgress,
    setReadingProgress,

    // Refs
    fadeAnim,
    scrollY,

    // Derived
    filteredArticles,
    featuredArticle,
    categories,

    // Handlers
    loadReadStatus,
    markAsRead,
    getCategoryConfig,

    // Context
    theme,
    isDark,
    t,
    router,
    insets,
  };
}
