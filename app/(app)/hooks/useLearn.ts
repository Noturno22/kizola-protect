import { useState, useRef, useEffect, useCallback } from 'react';
import { Animated } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LearningArticle } from '@/lib/supabase';
import { CATEGORY_CONFIG } from '../constants/learnCategories';
import { FileText } from 'lucide-react-native';
import {
  getLearningArticles,
  getFeaturedArticles,
  getPopularArticles,
  getRecentArticles,
  getRecommendedArticles,
  searchArticles,
  filterArticles,
  getArticleCounts,
  getAllCategories,
  ArticleFilters,
  ArticleSort,
} from '@/lib/learning';
import {
  getBookmarks,
  toggleBookmark,
} from '@/lib/bookmarks';

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
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [sort, setSort] = useState<ArticleSort>('recent');
  const [filters, setFilters] = useState<ArticleFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  const allArticles = getLearningArticles();
  const categories = getAllCategories();
  const articleCounts = getArticleCounts();

  const featuredArticle = getFeaturedArticles()[0];
  const popularArticles = getPopularArticles(3);
  const recentArticles = getRecentArticles(5);
  const recommendedArticles = getRecommendedArticles(readArticles, 5);

  const bookmarkArticles = bookmarkedIds
    .map((id) => allArticles.find((a) => a.id === id))
    .filter((a): a is LearningArticle => a !== undefined);

  const filteredArticles = searchQuery
    ? searchArticles(searchQuery)
    : selectedCategory
      ? allArticles.filter((a) => a.category === selectedCategory)
      : filterArticles(filters, sort);

  const displayArticles = selectedCategory || searchQuery
    ? filteredArticles
    : filterArticles(filters, sort);

  const hasActiveFilters =
    (filters.categories && filters.categories.length > 0) ||
    (filters.difficulty && filters.difficulty.length > 0) ||
    filters.readTime !== undefined;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [readData, bookmarkData] = await Promise.all([
        AsyncStorage.getItem('@kizola_read_articles'),
        getBookmarks(),
      ]);
      if (readData) setReadArticles(JSON.parse(readData));
      setBookmarkedIds(bookmarkData);
    } catch (e) {
      console.error('Error loading learn data:', e);
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

  const handleToggleBookmark = useCallback(
    async (articleId: string) => {
      const result = await toggleBookmark(articleId);
      setBookmarkedIds(result.bookmarks);
    },
    [],
  );

  const isArticleBookmarked = useCallback(
    (articleId: string) => bookmarkedIds.includes(articleId),
    [bookmarkedIds],
  );

  const clearFilters = useCallback(() => {
    setFilters({});
    setSelectedCategory(null);
  }, []);

  const getCategoryConfig = (category: string) => {
    const config = CATEGORY_CONFIG[category];
    if (config) {
      return { ...config, label: t(config.key) };
    }
    return { icon: FileText, color: theme.accent, label: category };
  };

  return {
    selectedCategory,
    setSelectedCategory,
    selectedArticle,
    setSelectedArticle,
    searchQuery,
    setSearchQuery,
    readArticles,
    readingProgress,
    setReadingProgress,

    bookmarkedIds,
    sort,
    setSort,
    filters,
    setFilters,
    showFilters,
    setShowFilters,

    fadeAnim,
    scrollY,

    filteredArticles: displayArticles,
    featuredArticle,
    popularArticles,
    recentArticles,
    recommendedArticles,
    bookmarkArticles,
    categories,
    articleCounts,

    handleToggleBookmark,
    isArticleBookmarked,
    clearFilters,
    hasActiveFilters,
    loadReadStatus: loadData,
    markAsRead,
    getCategoryConfig,

    theme,
    isDark,
    t,
    router,
    insets,
  };
}

export default function _notARoute() { return null; }
