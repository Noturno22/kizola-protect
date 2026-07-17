import {
  LEARNING_ARTICLES,
  LearningArticle,
  ArticleDifficulty,
} from './supabase';

export type ArticleFilters = {
  categories?: string[];
  difficulty?: ArticleDifficulty[];
  readTime?: 'short' | 'medium' | 'long';
  tags?: string[];
};

export type ArticleSort = 'recent' | 'popular' | 'az' | 'readTime';

function matchesReadTime(
  article: LearningArticle,
  range: 'short' | 'medium' | 'long',
): boolean {
  switch (range) {
    case 'short':
      return article.readTime <= 5;
    case 'medium':
      return article.readTime > 5 && article.readTime <= 10;
    case 'long':
      return article.readTime > 10;
  }
}

function sortArticles(
  articles: readonly LearningArticle[],
  sort: ArticleSort,
): LearningArticle[] {
  const sorted = [...articles];
  switch (sort) {
    case 'recent':
      return sorted.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    case 'popular':
      return sorted.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
    case 'az':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case 'readTime':
      return sorted.sort((a, b) => a.readTime - b.readTime);
  }
}

export function getLearningArticles(): readonly LearningArticle[] {
  return LEARNING_ARTICLES;
}

export function getLearningArticle(id: string): LearningArticle | undefined {
  return LEARNING_ARTICLES.find((a) => a.id === id);
}

export function getArticlesByCategory(
  category: string,
): readonly LearningArticle[] {
  return LEARNING_ARTICLES.filter((a) => a.category === category);
}

export function searchArticles(query: string): readonly LearningArticle[] {
  const q = query.toLowerCase();
  return LEARNING_ARTICLES.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      a.tags.some((tag) => tag.toLowerCase().includes(q)),
  );
}

export function getFeaturedArticles(): readonly LearningArticle[] {
  return LEARNING_ARTICLES.filter((a) => a.featured);
}

export function getPopularArticles(limit = 3): readonly LearningArticle[] {
  return LEARNING_ARTICLES.filter((a) => a.popular).slice(0, limit);
}

export function getRecentArticles(limit = 5): readonly LearningArticle[] {
  return sortArticles(LEARNING_ARTICLES, 'recent').slice(0, limit);
}

export function getRecommendedArticles(
  readIds: string[],
  limit = 5,
): readonly LearningArticle[] {
  if (readIds.length === 0) return getPopularArticles(limit);

  const readCategories = new Set<string>();
  for (const id of readIds) {
    const article = getLearningArticle(id);
    if (article) readCategories.add(article.category);
  }

  return LEARNING_ARTICLES.filter(
    (a) => !readIds.includes(a.id) && readCategories.has(a.category),
  ).slice(0, limit);
}

export function getRelatedArticles(
  articleId: string,
  limit = 3,
): readonly LearningArticle[] {
  const article = getLearningArticle(articleId);
  if (!article) return [];

  if (article.relatedArticles && article.relatedArticles.length > 0) {
    return article.relatedArticles
      .map((id) => getLearningArticle(id))
      .filter((a): a is LearningArticle => a !== undefined)
      .slice(0, limit);
  }

  return LEARNING_ARTICLES.filter(
    (a) => a.id !== articleId && a.category === article.category,
  ).slice(0, limit);
}

export function filterArticles(
  filters: ArticleFilters,
  sort: ArticleSort = 'recent',
): readonly LearningArticle[] {
  let result = [...LEARNING_ARTICLES];

  if (filters.categories && filters.categories.length > 0) {
    result = result.filter((a) => filters.categories!.includes(a.category));
  }

  if (filters.difficulty && filters.difficulty.length > 0) {
    result = result.filter((a) =>
      filters.difficulty!.includes(a.difficulty),
    );
  }

  if (filters.readTime) {
    result = result.filter((a) => matchesReadTime(a, filters.readTime!));
  }

  if (filters.tags && filters.tags.length > 0) {
    result = result.filter((a) =>
      filters.tags!.some((tag) => a.tags.includes(tag)),
    );
  }

  return sortArticles(result, sort);
}

export function getArticleCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const article of LEARNING_ARTICLES) {
    counts[article.category] = (counts[article.category] || 0) + 1;
  }
  return counts;
}

export function getAllCategories(): string[] {
  return [...new Set(LEARNING_ARTICLES.map((a) => a.category))];
}
