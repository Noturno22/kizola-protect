# Learn Center Professional Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpawers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Learn Center from 5 hardcoded articles to a professional 50+ article content library with 11 categories, advanced discovery, working bookmarks/sharing, cover images, and Supabase-ready architecture.

**Architecture:** Hybrid approach — articles hardcoded in `lib/supabase.ts` now, accessed through `lib/learning.ts` abstraction layer. UI components enhanced with curated sections, filters, and bookmark/share. Structure designed for easy Supabase migration later.

**Tech Stack:** React Native, Expo Router 3, TypeScript, AsyncStorage (bookmarks), Share API (native sharing), expo-image (cover images), i18next (15 languages)

**Spec:** `.superpawers/specs/2026-07-15-learn-center-professional-design.md`

**Branch:** `feature/learn-center-professional`

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `lib/supabase.ts` | MODIFY | Expand LEARNING_ARTICLES to 55 articles with new fields |
| `lib/learning.ts` | CREATE | Abstraction layer for article queries |
| `app/(app)/constants/learnCategories.ts` | MODIFY | Add 6 new categories (11 total) |
| `app/(app)/hooks/useLearn.ts` | MODIFY | Add bookmarks, recommended, filters, sort |
| `app/(app)/(tabs)/learn.tsx` | MODIFY | Integrate new sections and components |
| `app/(app)/components/learn/LearnHeader.tsx` | MODIFY | Add filter button |
| `app/(app)/components/learn/FeaturedArticleCard.tsx` | MODIFY | Dynamic weekly rotation |
| `app/(app)/components/learn/StatsSection.tsx` | MODIFY | Update counters |
| `app/(app)/components/learn/CategoryChips.tsx` | MODIFY | Add article counts |
| `app/(app)/components/learn/ArticleGrid.tsx` | MODIFY | Add sort dropdown |
| `app/(app)/components/learn/ArticleCard.tsx` | MODIFY | Cover image, difficulty badge, bookmark icon |
| `app/(app)/components/learn/ArticleModal.tsx` | MODIFY | Cover hero, tags, related articles, working bookmark/share |
| `app/(app)/components/learn/FilterModal.tsx` | CREATE | Filter by category, difficulty, read time, sort |
| `app/(app)/components/learn/CuratedSection.tsx` | CREATE | Reusable section for Popular/Recent/Recommended |
| `app/(app)/components/learn/ArticleTags.tsx` | CREATE | Clickable tag chips |
| `app/(app)/components/learn/RelatedArticles.tsx` | CREATE | Related articles grid |
| `app/(app)/utils/renderArticleContent.tsx` | MODIFY | Add image support in markdown |
| `assets/translations/en.json` | MODIFY | Add all new article content (50+ articles) |

---

## Task 1: Expand Categories

**Files:**
- Modify: `app/(app)/constants/learnCategories.ts`

- [ ] **Step 1: Add 6 new categories to CATEGORY_CONFIG**

```typescript
// app/(app)/constants/learnCategories.ts
import {
  Calculator,
  Globe,
  Home,
  Scale,
  Briefcase,
  FileText,
  Heart,
  Wallet,
  GraduationCap,
  ShieldAlert,
  Users,
  BriefcaseBusiness,
} from 'lucide-react-native';

export const CATEGORY_CONFIG: Record<
  string,
  { icon: typeof FileText; color: string; key: string }
> = {
  tax: { icon: Calculator, color: '#8B5CF6', key: 'learn.category_tax' },
  immigration: { icon: Globe, color: '#10B981', key: 'learn.category_immigration' },
  housing: { icon: Home, color: '#F59E0B', key: 'learn.category_housing' },
  legal: { icon: Scale, color: '#3B82F6', key: 'learn.category_legal' },
  career: { icon: Briefcase, color: '#EC4899', key: 'learn.category_career' },
  health: { icon: Heart, color: '#EF4444', key: 'learn.category_health' },
  finance: { icon: Wallet, color: '#06B6D4', key: 'learn.category_finance' },
  education: { icon: GraduationCap, color: '#8B5CF6', key: 'learn.category_education' },
  safety: { icon: ShieldAlert, color: '#F97316', key: 'learn.category_safety' },
  community: { icon: Users, color: '#14B8A6', key: 'learn.category_community' },
  work: { icon: BriefcaseBusiness, color: '#6366F1', key: 'learn.category_work' },
};
```

- [ ] **Step 2: Add category i18n keys to en.json**

In `assets/translations/en.json`, under `"learn"`, add:
```json
"category_health": "Health",
"category_finance": "Finance",
"category_education": "Education",
"safety": "Safety",
"category_safety": "Safety",
"category_community": "Community",
"category_work": "Work & Gig"
```

- [ ] **Step 3: Commit**

```bash
git add app/\(app\)/constants/learnCategories.ts assets/translations/en.json
git commit -m "feat(learn): add 6 new categories (11 total)"
```

---

## Task 2: Expand Article Data Structure

**Files:**
- Modify: `lib/supabase.ts` (LEARNING_ARTICLES type + array)

- [ ] **Step 1: Update LearningArticle type in lib/supabase.ts**

Find the existing `LearningArticle` type (before the LEARNING_ARTICLES array) and replace with:

```typescript
export type ArticleDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type LearningArticle = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly content: string;
  readonly category: string;
  readonly readTime: number;
  readonly difficulty: ArticleDifficulty;
  readonly tags: readonly string[];
  readonly coverImage?: string;
  readonly author?: string;
  readonly featured?: boolean;
  readonly popular?: boolean;
  readonly relatedArticles?: readonly string[];
  readonly created_at: string;
  readonly updated_at?: string;
};
```

- [ ] **Step 2: Expand LEARNING_ARTICLES to 55 articles**

Replace the existing `LEARNING_ARTICLES` array with 55 articles (5 per category). Each article has the new fields: `difficulty`, `tags`, `featured`, `popular`, `relatedArticles`, `updated_at`.

Structure for EACH article:
```typescript
{
  id: '{category_numeric}',
  title: 'learn.articles.{category}.{topic}.title',
  description: 'learn.articles.{category}.{topic}.description',
  content: 'learn.articles.{category}.{topic}.content',
  category: '{category}',
  readTime: {5-12},
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  tags: ['{tag1}', '{tag2}'],
  featured: true for 1-2 per category,
  popular: true for top 3 overall,
  relatedArticles: ['{id1}', '{id2}'],
  created_at: '2024-{month}-{day}T00:00:00Z',
  updated_at: '2024-{month}-{day}T00:00:00Z',
}
```

**Article distribution:**
- tax (IDs 1-5): W-2 basics, deductions guide, filing self-employed, tax refunds, state taxes
- immigration (IDs 6-10): Visa types, green card process, citizenship path, DACA, work permits
- housing (IDs 11-15): Tenant rights, lease agreements, eviction protection, security deposits, fair housing
- legal (IDs 16-20): When to hire a lawyer, free legal aid, know your rights, traffic tickets, employment law
- career (IDs 21-25): Resume building, interview prep, networking, LinkedIn, career change
- health (IDs 26-30): Health insurance basics, Medicaid, emergency care, mental health, finding a doctor
- finance (IDs 31-35): Banking basics, credit score, budgeting, sending money abroad, managing debt
- education (IDs 36-40): ESL programs, GED preparation, college scholarships, online learning, trade schools
- safety (IDs 41-45): Scam prevention, domestic violence resources, ICE encounters, emergency planning, online safety
- community (IDs 46-50): Cultural adjustment, finding community, language exchange, faith resources, volunteering
- work (IDs 51-55): Gig economy rights, labor laws, wage theft, unions, work authorization

- [ ] **Step 3: Verify type consistency**

Run LSP diagnostics on lib/supabase.ts to confirm no type errors.

- [ ] **Step 4: Commit**

```bash
git add lib/supabase.ts
git commit -m "feat(learn): expand to 55 articles across 11 categories"
```

---

## Task 3: i18n Content — Categories + UI Strings

**Files:**
- Modify: `assets/translations/en.json`

- [ ] **Step 1: Add all new category names and UI strings**

In `assets/translations/en.json`, ensure the `"learn"` section contains all new UI keys:

```json
"learn": {
  "title": "Learning Center",
  "subtitle": "Educational resources to help you navigate life's challenges",
  "all": "All",
  "articles_stat": "Articles",
  "categories_stat": "Categories",
  "category_tax": "Tax",
  "category_immigration": "Immigration",
  "category_housing": "Housing",
  "category_legal": "Legal",
  "category_career": "Career",
  "category_health": "Health",
  "category_finance": "Finance",
  "category_education": "Education",
  "category_safety": "Safety",
  "category_community": "Community",
  "category_work": "Work & Gig",
  "avgRead": "Avg. Read",
  "featuredArticle": "Featured Article",
  "dailyTip": "Daily Tip",
  "readNow": "Read now",
  "allArticles": "All Articles",
  "articlesCount": "articles",
  "minRead": "min read",
  "needHelp": "Need personalized help?",
  "helpDesc": "Our support team can provide guidance tailored to your specific situation",
  "contactSupport": "Contact Support",
  "helpTopic": "Need help with this topic?",
  "popular": "Popular",
  "recent": "Recent",
  "recommended": "Recommended for You",
  "saved": "Your Saved Articles",
  "noSaved": "No saved articles yet",
  "sortBy": "Sort by",
  "sortRecent": "Most Recent",
  "sortPopular": "Most Popular",
  "sortAZ": "A-Z",
  "sortReadTime": "Read Time",
  "filters": "Filters",
  "clearFilters": "Clear All",
  "applyFilters": "Apply Filters",
  "difficulty": "Difficulty",
  "beginner": "Beginner",
  "intermediate": "Intermediate",
  "advanced": "Advanced",
  "readTime": "Read Time",
  "under5": "Under 5 min",
  "fiveTo10": "5-10 min",
  "over10": "10+ min",
  "relatedArticles": "Related Articles",
  "bookmarked": "Saved",
  "shareArticle": "Share Article",
  "noResults": "No articles found",
  "tryDifferent": "Try different search terms or filters"
}
```

- [ ] **Step 2: Commit**

```bash
git add assets/translations/en.json
git commit -m "feat(learn): add UI strings for filters, bookmarks, curated sections"
```

---

## Task 4: i18n Content — Article Text (Batch 1: Tax + Immigration + Housing)

**Files:**
- Modify: `assets/translations/en.json`

- [ ] **Step 1: Add article content for tax (IDs 1-5)**

Under `learn.articles`, replace the existing `tax` section and add 4 new articles:

```json
"tax": {
  "basics": {
    "title": "Tax Return Filing Basics",
    "description": "Essential guide to understanding tax filing requirements, deadlines, and deductions.",
    "content": "\n## Understanding Tax Filing\n\nFiling your taxes doesn't have to be overwhelming...\n[Full markdown content, 8-12 paragraphs with headers, bullet lists, numbered lists]\n"
  },
  "deductions": {
    "title": "Common Tax Deductions",
    "description": "Maximize your refund with these commonly overlooked deductions.",
    "content": "\n## Tax Deductions You Might Be Missing\n..."
  },
  "selfEmployed": {
    "title": "Filing Taxes as Self-Employed",
    "description": "Guide to quarterly estimated taxes, deductions, and record-keeping for freelancers.",
    "content": "\n## Self-Employment Tax Basics\n..."
  },
  "refunds": {
    "title": "Understanding Tax Refunds",
    "description": "Why you get a refund, how to track it, and what to do if it's delayed.",
    "content": "\n## Why Do People Get Refunds?\n..."
  },
  "stateTaxes": {
    "title": "State Tax Guide",
    "description": "How state income taxes work and which states have no income tax.",
    "content": "\n## State Income Taxes\n..."
  }
}
```

Each content field should be 8-12 paragraphs of markdown with:
- `##` and `###` headers
- Bullet lists (`- item`)
- Numbered lists (`1. Step`)
- Bold text (`**important**`)
- Practical, actionable advice focused on US immigrants

- [ ] **Step 2: Add article content for immigration (IDs 6-10)**

```json
"immigration": {
  "visaTypes": { ... },
  "greenCard": { ... },
  "citizenship": { ... },
  "daca": { ... },
  "workPermits": { ... }
}
```

- [ ] **Step 3: Add article content for housing (IDs 11-15)**

```json
"housing": {
  "tenantRights": { ... },
  "leaseAgreements": { ... },
  "evictionProtection": { ... },
  "securityDeposits": { ... },
  "fairHousing": { ... }
}
```

- [ ] **Step 4: Commit**

```bash
git add assets/translations/en.json
git commit -m "feat(learn): add article content for tax, immigration, housing (15 articles)"
```

---

## Task 5: i18n Content — Article Text (Batch 2: Legal + Career + Health)

**Files:**
- Modify: `assets/translations/en.json`

- [ ] **Step 1: Add article content for legal (IDs 16-20)**

```json
"legal": {
  "hireLawyer": { ... },
  "freeLegalAid": { ... },
  "knowYourRights": { ... },
  "trafficTickets": { ... },
  "employmentLaw": { ... }
}
```

- [ ] **Step 2: Add article content for career (IDs 21-25)**

```json
"career": {
  "resumeBuilding": { ... },
  "interviewPrep": { ... },
  "networking": { ... },
  "linkedin": { ... },
  "careerChange": { ... }
}
```

- [ ] **Step 3: Add article content for health (IDs 26-30)**

```json
"health": {
  "insuranceBasics": { ... },
  "medicaid": { ... },
  "emergencyCare": { ... },
  "mentalHealth": { ... },
  "findingDoctor": { ... }
}
```

- [ ] **Step 4: Commit**

```bash
git add assets/translations/en.json
git commit -m "feat(learn): add article content for legal, career, health (15 articles)"
```

---

## Task 6: i18n Content — Article Text (Batch 3: Finance + Education + Safety + Community + Work)

**Files:**
- Modify: `assets/translations/en.json`

- [ ] **Step 1: Add article content for finance (IDs 31-35)**

```json
"finance": {
  "bankingBasics": { ... },
  "creditScore": { ... },
  "budgeting": { ... },
  "sendingMoneyAbroad": { ... },
  "managingDebt": { ... }
}
```

- [ ] **Step 2: Add article content for education (IDs 36-40)**

```json
"education": {
  "eslPrograms": { ... },
  "gedPrep": { ... },
  "scholarships": { ... },
  "onlineLearning": { ... },
  "tradeSchools": { ... }
}
```

- [ ] **Step 3: Add article content for safety (IDs 41-45)**

```json
"safety": {
  "scamPrevention": { ... },
  "domesticViolence": { ... },
  "iceEncounters": { ... },
  "emergencyPlanning": { ... },
  "onlineSafety": { ... }
}
```

- [ ] **Step 4: Add article content for community (IDs 46-50)**

```json
"community": {
  "culturalAdjustment": { ... },
  "findingCommunity": { ... },
  "languageExchange": { ... },
  "faithResources": { ... },
  "volunteering": { ... }
}
```

- [ ] **Step 5: Add article content for work (IDs 51-55)**

```json
"work": {
  "gigEconomyRights": { ... },
  "laborLaws": { ... },
  "wageTheft": { ... },
  "unions": { ... },
  "workAuthorization": { ... }
}
```

- [ ] **Step 6: Commit**

```bash
git add assets/translations/en.json
git commit -m "feat(learn): add article content for finance, education, safety, community, work (25 articles)"
```

---

## Task 7: Abstraction Layer

**Files:**
- Create: `lib/learning.ts`

- [ ] **Step 1: Create lib/learning.ts**

```typescript
import {
  LEARNING_ARTICLES,
  LearningArticle,
  ArticleDifficulty,
} from './supabase';

export type { LearningArticle, ArticleDifficulty };

export type ArticleFilters = {
  categories?: string[];
  difficulty?: ArticleDifficulty[];
  readTime?: 'under5' | 'fiveTo10' | 'over10';
  tags?: string[];
};

export type ArticleSort = 'recent' | 'popular' | 'az' | 'readTime';

export async function getLearningArticles(): Promise<LearningArticle[]> {
  return [...LEARNING_ARTICLES];
}

export async function getLearningArticle(
  id: string,
): Promise<LearningArticle | null> {
  return LEARNING_ARTICLES.find((a) => a.id === id) ?? null;
}

export async function getArticlesByCategory(
  category: string,
): Promise<LearningArticle[]> {
  return LEARNING_ARTICLES.filter((a) => a.category === category);
}

export async function searchArticles(
  query: string,
): Promise<LearningArticle[]> {
  const q = query.toLowerCase();
  return LEARNING_ARTICLES.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      a.tags.some((t) => t.toLowerCase().includes(q)),
  );
}

export async function getFeaturedArticles(): Promise<LearningArticle[]> {
  return LEARNING_ARTICLES.filter((a) => a.featured);
}

export async function getPopularArticles(
  limit = 3,
): Promise<LearningArticle[]> {
  return LEARNING_ARTICLES.filter((a) => a.popular).slice(0, limit);
}

export async function getRecentArticles(
  limit = 5,
): Promise<LearningArticle[]> {
  return [...LEARNING_ARTICLES]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, limit);
}

export async function getRecommendedArticles(
  readArticleIds: string[],
  limit = 5,
): Promise<LearningArticle[]> {
  if (readArticleIds.length === 0) {
    const shuffled = [...LEARNING_ARTICLES].sort(() => Math.random() - 0.5);
    const seen = new Set<string>();
    return shuffled.filter((a) => {
      if (seen.has(a.category)) return false;
      seen.add(a.category);
      return true;
    }).slice(0, limit);
  }

  const readArticles = LEARNING_ARTICLES.filter((a) =>
    readArticleIds.includes(a.id),
  );
  const readCategories = new Set(readArticles.map((a) => a.category));

  return LEARNING_ARTICLES.filter(
    (a) =>
      !readArticleIds.includes(a.id) && readCategories.has(a.category),
  ).slice(0, limit);
}

export async function getRelatedArticles(
  articleId: string,
  limit = 3,
): Promise<LearningArticle[]> {
  const article = LEARNING_ARTICLES.find((a) => a.id === articleId);
  if (!article) return [];

  if (article.relatedArticles?.length) {
    return LEARNING_ARTICLES.filter((a) =>
      article.relatedArticles!.includes(a.id),
    ).slice(0, limit);
  }

  return LEARNING_ARTICLES.filter(
    (a) => a.id !== articleId && a.category === article.category,
  ).slice(0, limit);
}

export async function filterArticles(
  filters: ArticleFilters,
  sort: ArticleSort = 'recent',
): Promise<LearningArticle[]> {
  let results = [...LEARNING_ARTICLES];

  if (filters.categories?.length) {
    results = results.filter((a) => filters.categories!.includes(a.category));
  }

  if (filters.difficulty?.length) {
    results = results.filter((a) =>
      filters.difficulty!.includes(a.difficulty),
    );
  }

  if (filters.readTime) {
    results = results.filter((a) => {
      switch (filters.readTime) {
        case 'under5':
          return a.readTime < 5;
        case 'fiveTo10':
          return a.readTime >= 5 && a.readTime <= 10;
        case 'over10':
          return a.readTime > 10;
      }
    });
  }

  if (filters.tags?.length) {
    results = results.filter((a) =>
      filters.tags!.some((t) => a.tags.includes(t)),
    );
  }

  switch (sort) {
    case 'recent':
      results.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      break;
    case 'popular':
      results.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
      break;
    case 'az':
      results.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'readTime':
      results.sort((a, b) => a.readTime - b.readTime);
      break;
  }

  return results;
}

export function getWeekOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
}

export async function getDynamicFeatured(): Promise<LearningArticle | null> {
  const featured = await getFeaturedArticles();
  if (featured.length === 0) return LEARNING_ARTICLES[0] ?? null;
  const week = getWeekOfYear();
  return featured[week % featured.length];
}

export function getArticleCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const article of LEARNING_ARTICLES) {
    counts[article.category] = (counts[article.category] || 0) + 1;
  }
  return counts;
}
```

- [ ] **Step 2: Verify LSP diagnostics on lib/learning.ts**

Run: `lsp_diagnostics` on the file. Expect no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/learning.ts
git commit -m "feat(learn): add lib/learning.ts abstraction layer"
```

---

## Task 8: Bookmark Utility

**Files:**
- Create: `lib/bookmarks.ts`

- [ ] **Step 1: Create lib/bookmarks.ts**

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@kizola_bookmarked_articles';

export async function getBookmarks(): Promise<string[]> {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Error loading bookmarks:', e);
    return [];
  }
}

export async function addBookmark(articleId: string): Promise<string[]> {
  const bookmarks = await getBookmarks();
  const next = [...new Set([...bookmarks, articleId])];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export async function removeBookmark(articleId: string): Promise<string[]> {
  const bookmarks = await getBookmarks();
  const next = bookmarks.filter((id) => id !== articleId);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export async function toggleBookmark(
  articleId: string,
): Promise<{ bookmarks: string[]; isBookmarked: boolean }> {
  const bookmarks = await getBookmarks();
  const isBookmarked = bookmarks.includes(articleId);
  if (isBookmarked) {
    const next = bookmarks.filter((id) => id !== articleId);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return { bookmarks: next, isBookmarked: false };
  } else {
    const next = [...new Set([...bookmarks, articleId])];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return { bookmarks: next, isBookmarked: true };
  }
}

export async function isBookmarked(articleId: string): Promise<boolean> {
  const bookmarks = await getBookmarks();
  return bookmarks.includes(articleId);
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/bookmarks.ts
git commit -m "feat(learn): add bookmark utility with AsyncStorage"
```

---

## Task 9: Updated useLearn Hook

**Files:**
- Modify: `app/(app)/hooks/useLearn.ts`

- [ ] **Step 1: Rewrite useLearn hook**

Replace the entire file content with:

```typescript
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Animated } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LearningArticle, ArticleDifficulty } from '@/lib/supabase';
import {
  getDynamicFeatured,
  getPopularArticles,
  getRecentArticles,
  getRecommendedArticles,
  filterArticles,
  getArticleCounts,
  searchArticles as searchArticlesUtil,
  ArticleFilters,
  ArticleSort,
} from '@/lib/learning';
import {
  getBookmarks,
  toggleBookmark,
} from '@/lib/bookmarks';
import { CATEGORY_CONFIG } from '../constants/learnCategories';
import { FileText } from 'lucide-react-native';

export function useLearn() {
  const router = useRouter();
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<LearningArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [readArticles, setReadArticles] = useState<string[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [sort, setSort] = useState<ArticleSort>('recent');
  const [filters, setFilters] = useState<ArticleFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  // Derived data
  const [featuredArticle, setFeaturedArticle] = useState<LearningArticle | null>(null);
  const [popularArticles, setPopularArticles] = useState<LearningArticle[]>([]);
  const [recentArticles, setRecentArticles] = useState<LearningArticle[]>([]);
  const [recommendedArticles, setRecommendedArticles] = useState<LearningArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<LearningArticle[]>([]);
  const [bookmarkArticles, setBookmarkArticles] = useState<LearningArticle[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [articleCounts, setArticleCounts] = useState<Record<string, number>>({});

  // Load data on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Reload when filters change
  useEffect(() => {
    loadFilteredArticles();
  }, [selectedCategory, searchQuery, sort, filters]);

  // Reload bookmarks when they change
  useEffect(() => {
    loadBookmarkArticles();
  }, [bookmarkedIds]);

  // Reload recommended when read articles change
  useEffect(() => {
    loadRecommended();
  }, [readArticles]);

  const loadInitialData = async () => {
    const [featured, popular, recent, read, bookmarks, counts] = await Promise.all([
      getDynamicFeatured(),
      getPopularArticles(3),
      getRecentArticles(5),
      loadReadStatus(),
      getBookmarks(),
      Promise.resolve(getArticleCounts()),
    ]);

    setFeaturedArticle(featured);
    setPopularArticles(popular);
    setRecentArticles(recent);
    setReadArticles(read);
    setBookmarkedIds(bookmarks);
    setArticleCounts(counts);
    setCategories(Object.keys(counts));

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const loadReadStatus = async (): Promise<string[]> => {
    try {
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      const saved = await AsyncStorage.getItem('@kizola_read_articles');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error loading read status:', e);
      return [];
    }
  };

  const loadFilteredArticles = async () => {
    const mergedFilters: ArticleFilters = { ...filters };
    if (selectedCategory) {
      mergedFilters.categories = [selectedCategory];
    }

    let results: LearningArticle[];

    if (searchQuery) {
      results = await searchArticlesUtil(searchQuery);
      if (selectedCategory) {
        results = results.filter((a) => a.category === selectedCategory);
      }
    } else {
      results = await filterArticles(mergedFilters, sort);
    }

    setFilteredArticles(results);
  };

  const loadBookmarkArticles = async () => {
    const allArticles = await import('@/lib/supabase').then((m) => m.LEARNING_ARTICLES);
    setBookmarkArticles(allArticles.filter((a) => bookmarkedIds.includes(a.id)));
  };

  const loadRecommended = async () => {
    const recs = await getRecommendedArticles(readArticles, 5);
    setRecommendedArticles(recs);
  };

  const markAsRead = useCallback(async (articleId: string) => {
    try {
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      const next = [...new Set([...readArticles, articleId])];
      setReadArticles(next);
      await AsyncStorage.setItem('@kizola_read_articles', JSON.stringify(next));
    } catch (e) {
      console.error('Error saving read status:', e);
    }
  }, [readArticles]);

  const handleToggleBookmark = useCallback(async (articleId: string) => {
    const result = await toggleBookmark(articleId);
    setBookmarkedIds(result.bookmarks);
  }, []);

  const isArticleBookmarked = useCallback(
    (articleId: string) => bookmarkedIds.includes(articleId),
    [bookmarkedIds],
  );

  const getCategoryConfig = useCallback(
    (category: string) => {
      const config = CATEGORY_CONFIG[category];
      if (config) {
        return { ...config, label: t(config.key) };
      }
      return { icon: FileText, color: theme.accent, label: category };
    },
    [t, theme],
  );

  const clearFilters = useCallback(() => {
    setSelectedCategory(null);
    setFilters({});
    setSort('recent');
    setSearchQuery('');
  }, []);

  const hasActiveFilters = useMemo(
    () =>
      !!selectedCategory ||
      !!filters.difficulty?.length ||
      !!filters.readTime ||
      sort !== 'recent',
    [selectedCategory, filters, sort],
  );

  return {
    // State
    selectedCategory,
    setSelectedCategory,
    selectedArticle,
    setSelectedArticle,
    searchQuery,
    setSearchQuery,
    readArticles,
    bookmarkedIds,
    sort,
    setSort,
    filters,
    setFilters,
    showFilters,
    setShowFilters,

    // Refs
    fadeAnim,
    scrollY,

    // Derived
    filteredArticles,
    featuredArticle,
    popularArticles,
    recentArticles,
    recommendedArticles,
    bookmarkArticles,
    categories,
    articleCounts,

    // Handlers
    markAsRead,
    handleToggleBookmark,
    isArticleBookmarked,
    getCategoryConfig,
    clearFilters,
    hasActiveFilters,

    // Context
    theme,
    isDark,
    t,
    router,
    insets,
  };
}
```

- [ ] **Step 2: Verify LSP diagnostics**

Run LSP diagnostics. Fix any errors.

- [ ] **Step 3: Commit**

```bash
git add app/\(app\)/hooks/useLearn.ts
git commit -m "feat(learn): rewrite useLearn with bookmarks, filters, curated sections"
```

---

## Task 10: New Component — CuratedSection

**Files:**
- Create: `app/(app)/components/learn/CuratedSection.tsx`

- [ ] **Step 1: Create CuratedSection component**

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LearningArticle } from '@/lib/supabase';
import { Theme } from '@/providers/ThemeProvider';
import { ArticleCard } from './ArticleCard';

interface CuratedSectionProps {
  title: string;
  articles: LearningArticle[];
  getCategoryConfig: (category: string) => {
    icon: React.ComponentType<{ size?: number; color?: string }>;
    color: string;
    label: string;
  };
  readArticles: string[];
  bookmarkedIds: string[];
  onSelectArticle: (article: LearningArticle) => void;
  onToggleBookmark: (articleId: string) => void;
  theme: Theme;
  t: (key: string) => string;
}

export function CuratedSection({
  title,
  articles,
  getCategoryConfig,
  readArticles,
  bookmarkedIds,
  onSelectArticle,
  onToggleBookmark,
  theme,
  t,
}: CuratedSectionProps) {
  const styles = createStyles(theme);

  if (articles.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {articles.map((article) => {
        const config = getCategoryConfig(article.category);
        return (
          <ArticleCard
            key={article.id}
            article={article}
            config={config}
            isRead={readArticles.includes(article.id)}
            isBookmarked={bookmarkedIds.includes(article.id)}
            onPress={() => onSelectArticle(article)}
            onToggleBookmark={() => onToggleBookmark(article.id)}
            theme={theme}
            t={t}
          />
        );
      })}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    section: {
      paddingHorizontal: 24,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
      letterSpacing: -0.5,
      marginBottom: 16,
    },
  });

export default CuratedSection;
```

- [ ] **Step 2: Commit**

```bash
git add app/\(app\)/components/learn/CuratedSection.tsx
git commit -m "feat(learn): add CuratedSection component"
```

---

## Task 11: New Component — FilterModal

**Files:**
- Create: `app/(app)/components/learn/FilterModal.tsx`

- [ ] **Step 1: Create FilterModal component**

Full component with:
- Category multi-select (chips for all 11 categories)
- Difficulty filter (beginner/intermediate/advanced toggles)
- Read time filter (under5/fiveTo10/over10 toggles)
- Sort selector (recent/popular/AZ/readTime)
- Clear All button
- Apply button
- Modal presentation with slide-up animation
- Theme-aware styling matching existing modals

- [ ] **Step 2: Commit**

```bash
git add app/\(app\)/components/learn/FilterModal.tsx
git commit -m "feat(learn): add FilterModal component"
```

---

## Task 12: New Component — ArticleTags

**Files:**
- Create: `app/(app)/components/learn/ArticleTags.tsx`

- [ ] **Step 1: Create ArticleTags component**

Clickable horizontal list of tag chips. Each tag is a small pill with the tag text. Tapping a tag triggers a search for that tag.

- [ ] **Step 2: Commit**

```bash
git add app/\(app\)/components/learn/ArticleTags.tsx
git commit -m "feat(learn): add ArticleTags component"
```

---

## Task 13: New Component — RelatedArticles

**Files:**
- Create: `app/(app)/components/learn/RelatedArticles.tsx`

- [ ] **Step 1: Create RelatedArticles component**

Grid of 2-3 related article cards shown at the bottom of the ArticleModal. Uses `getRelatedArticles()` from lib/learning.ts.

- [ ] **Step 2: Commit**

```bash
git add app/\(app\)/components/learn/RelatedArticles.tsx
git commit -m "feat(learn): add RelatedArticles component"
```

---

## Task 14: Update ArticleCard

**Files:**
- Modify: `app/(app)/components/learn/ArticleCard.tsx`

- [ ] **Step 1: Add new props and cover image support**

Add `isBookmarked`, `onToggleBookmark` props. Add cover image with gradient overlay. Add difficulty badge. Add bookmark icon toggle.

- [ ] **Step 2: Verify LSP diagnostics**

- [ ] **Step 3: Commit**

```bash
git add app/\(app\)/components/learn/ArticleCard.tsx
git commit -m "feat(learn): update ArticleCard with cover image, difficulty, bookmark"
```

---

## Task 15: Update ArticleModal

**Files:**
- Modify: `app/(app)/components/learn/ArticleModal.tsx`

- [ ] **Step 1: Add cover hero, working bookmark/share, tags, related articles**

- Cover hero section with background image + gradient
- Working Bookmark toggle (calls `onToggleBookmark`)
- Working Share button (calls `Share.share()`)
- ArticleTags section showing article's tags
- RelatedArticles grid at bottom
- New props: `isBookmarked`, `onToggleBookmark`

- [ ] **Step 2: Verify LSP diagnostics**

- [ ] **Step 3: Commit**

```bash
git add app/\(app\)/components/learn/ArticleModal.tsx
git commit -m "feat(learn): update ArticleModal with hero, bookmark, share, tags, related"
```

---

## Task 16: Update Supporting Components

**Files:**
- Modify: `app/(app)/components/learn/LearnHeader.tsx`
- Modify: `app/(app)/components/learn/FeaturedArticleCard.tsx`
- Modify: `app/(app)/components/learn/StatsSection.tsx`
- Modify: `app/(app)/components/learn/CategoryChips.tsx`
- Modify: `app/(app)/components/learn/ArticleGrid.tsx`

- [ ] **Step 1: LearnHeader — add filter button**

Add a filter icon button next to the search bar. `onPress` calls `onOpenFilters` prop.

- [ ] **Step 2: FeaturedArticleCard — use dynamic article**

The component already receives `featuredArticle` as prop, so no changes needed to the component itself. The parent will pass the dynamic featured article.

- [ ] **Step 3: StatsSection — update counters**

Change hardcoded values to use `articleCount` and `categoryCount` props (already passed). The parent passes `55` and `11`.

- [ ] **Step 4: CategoryChips — add article counts**

Add a small count badge next to each category label showing how many articles it has. Accept `articleCounts` prop.

- [ ] **Step 5: ArticleGrid — add sort dropdown**

Add a sort selector (dropdown or horizontal chips) at the top: Recent | Popular | A-Z | Read Time. Accept `sort` and `onSortChange` props.

- [ ] **Step 6: Commit**

```bash
git add app/\(app\)/components/learn/
git commit -m "feat(learn): update LearnHeader, CategoryChips, ArticleGrid with new features"
```

---

## Task 17: Integrate learn.tsx

**Files:**
- Modify: `app/(app)/(tabs)/learn.tsx`

- [ ] **Step 1: Update learn.tsx to use all new components and data**

The main screen now renders:
1. `LearnHeader` (with filter button)
2. `FeaturedArticleCard` (dynamic)
3. `StatsSection` (55 articles, 11 categories)
4. `CuratedSection` "Popular" (top 3)
5. `CuratedSection` "Recent" (5 latest)
6. `CategoryChips` (with counts)
7. `ArticleGrid` (with sort)
8. `CuratedSection` "Recommended" (based on read history)
9. `CuratedSection` "Your Saved" (bookmarks)
10. `PremiumTipCard`
11. `FilterModal` (overlay)
12. `ArticleModal` (overlay)

All wired through `useLearn()` hook.

- [ ] **Step 2: Verify LSP diagnostics on all changed files**

- [ ] **Step 3: Commit**

```bash
git add app/\(app\)/\(tabs\)/learn.tsx
git commit -m "feat(learn): integrate all new components in learn.tsx"
```

---

## Task 18: Add Cover Images

**Files:**
- Create: `assets/images/learn/` (directory)
- Modify: `lib/supabase.ts` (add coverImage paths to articles)

- [ ] **Step 1: Create assets/images/learn/ directory**

```bash
mkdir -p assets/images/learn
```

- [ ] **Step 2: Add placeholder cover images**

For each category, add a representative image. Use Unsplash/Pexels free license images (or solid color gradients as immediate placeholders). Update `coverImage` field in each article to point to the require() path.

If no real images available yet, use `coverImage: undefined` and let the component fall back to category gradient.

- [ ] **Step 3: Commit**

```bash
git add assets/images/learn/ lib/supabase.ts
git commit -m "feat(learn): add cover images with category gradient fallbacks"
```

---

## Task 19: Update renderArticleContent

**Files:**
- Modify: `app/(app)/utils/renderArticleContent.tsx`

- [ ] **Step 1: Add image support in markdown**

Add handling for `![alt](image)` markdown syntax to render `Image` components within article content. Also add support for `> ` blockquote syntax.

- [ ] **Step 2: Commit**

```bash
git add app/\(app\)/utils/renderArticleContent.tsx
git commit -m "feat(learn): add image and blockquote support to article renderer"
```

---

## Task 20: Final Integration Test

**Files:** All modified files

- [ ] **Step 1: Run LSP diagnostics on all changed files**

Run diagnostics on every file in the file map. Fix any errors.

- [ ] **Step 2: Verify no TypeScript errors**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Run existing tests**

```bash
npx jest --passWithNoTests
```

- [ ] **Step 4: Final commit with all fixes**

```bash
git add -A
git commit -m "fix(learn): resolve lint and type errors from Learn Center upgrade"
```
