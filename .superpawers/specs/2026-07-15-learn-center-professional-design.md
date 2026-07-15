# Learn Center Professional — Design Spec

**Date:** 2026-07-15
**Branch:** `feature/learn-center-professional`
**Status:** Approved

---

## 1. Objective

Transform the Learn Center from a basic 5-article hardcoded page into a professional content library with 50+ articles across 11 categories, rich discovery features, working bookmarks/sharing, cover images, and a structure prepared for future Supabase migration.

---

## 2. Data Structure

### Article Schema

```typescript
interface LearningArticle {
  id: string;
  title: string;              // i18n key (e.g. 'learn.articles.tax.title')
  description: string;        // i18n key
  content: string;            // i18n key (markdown content)
  category: string;           // tax, immigration, housing, etc.
  readTime: number;           // minutes (calculated from content length)
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];             // for filtering (e.g. ['w2', 'deductions', 'irs'])
  coverImage: string;         // require() path or URL
  author?: string;            // optional author name
  featured?: boolean;         // eligible for featured rotation
  popular?: boolean;          // manually marked as popular
  relatedArticles?: string[]; // IDs of related articles
  created_at: string;
  updated_at: string;
}
```

### Categories (11)

| ID | Name | Icon | Color |
|----|------|------|-------|
| tax | Tax | Calculator | #8B5CF6 |
| immigration | Immigration | Globe | #10B981 |
| housing | Housing | Home | #F59E0B |
| legal | Legal | Scale | #3B82F6 |
| career | Career | Briefcase | #EC4899 |
| health | Health & Healthcare | Heart | #EF4444 |
| finance | Finance & Banking | Wallet | #06B6D4 |
| education | Education | GraduationCap | #8B5CF6 |
| safety | Safety & Protection | ShieldAlert | #F97316 |
| community | Community & Culture | Users | #14B8A6 |
| work | Work & Gig Economy | BriefcaseBusiness | #6366F1 |

---

## 3. Content Strategy

- **50+ articles** distributed across 11 categories (~4-5 per category)
- Content in **markdown** (already supported by `renderArticleContent`)
- Each article: **5-15 min** read time
- Content must be **practical and actionable** (lists, steps, useful links)
- Focus on the **US market** (laws, processes, US resources)
- All text via **i18n keys** (15 languages supported)

### Article Distribution

| Category | Articles | Focus |
|----------|----------|-------|
| tax | 5 | W-2, deductions, filing, self-employment, refunds |
| immigration | 5 | Visas, green card, citizenship, DACA, work permits |
| housing | 5 | Rights, leases, eviction, deposits, discrimination |
| legal | 5 | When to hire a lawyer, free legal aid, know your rights |
| career | 5 | Resume, interviews, networking, LinkedIn, gig work |
| health | 5 | Insurance, Medicaid, emergency, mental health, providers |
| finance | 5 | Banking, credit, budgeting, remittances, debt |
| education | 5 | Schools, ESL, scholarships, GED, online learning |
| safety | 5 | Scams, domestic violence, ICE encounters, emergency plan |
| community | 5 | Cultural adjustment, community resources, language, faith |
| work | 5 | Uber/DoorDash, labor rights, wage theft, unions, permits |

---

## 4. UI Layout

### Page Structure (top to bottom)

```
[Header with search + filter button]
[Featured Article Card — dynamic weekly rotation]
[Stats Section: 50+ articles | 11 categories | X avg read]
[Curated Section: "Popular" (top 3)]
[Curated Section: "Recent" (latest 5)]
[Category Chips with article counts]
[Article Grid with sort options]
[Curated Section: "Recommended" (based on read history)]
[Bookmark Section: "Your Saved" (if any saved)]
[Premium Tip CTA]
```

### Component Changes

| Component | Change |
|-----------|--------|
| `LearnHeader` | Add filter button (opens FilterModal) |
| `FeaturedArticleCard` | Dynamic weekly rotation based on week-of-year |
| `StatsSection` | Update counters (11 categories, 50+ articles) |
| `CategoryChips` | Add article count per category |
| `ArticleGrid` | Add sort options (recent, popular, A-Z, read time) |
| `ArticleCard` | Add cover image, difficulty badge, tag visuals |
| `ArticleModal` | Add cover hero, tags, related articles section |
| `PremiumTipCard` | Keep as-is |

### New Components

| Component | Purpose |
|-----------|---------|
| `FilterModal` | Filter by category (multi), difficulty, read time, sort |
| `CuratedSection` | Reusable section for "Popular", "Recent", "Recommended" |
| `ArticleTags` | Clickable tags that filter by tag |
| `RelatedArticles` | Grid of related articles at end of article modal |

---

## 5. Discovery Features

### Dynamic Featured
- Rotation: `LEARNING_ARTICLES[weekOfYear % featuredArticles.length]`
- Source: articles with `featured: true`
- Fallback: first article if no featured exist

### Curated Sections
- **Popular**: Articles with `popular: true` (top 3)
- **Recent**: 5 most recent by `created_at`
- **Recommended**: Based on categories of articles user has read (stored in AsyncStorage)
  - Algorithm: Get categories of read articles → find unread articles in same categories → sort by relevance (matching category count) → return top 5
  - Fallback: If no read history, show random 5 articles from different categories

### Filters
- **Category**: Multi-select (can filter by 2+ categories)
- **Difficulty**: Beginner / Intermediate / Advanced
- **Read time**: <5 min, 5-10 min, 10+ min
- **Sort**: Recent, Popular, A-Z, Read time

### Search
- Current: search by title and description
- New: search by title, description, tags, and content
- Debounce: 300ms for performance

---

## 6. Bookmark & Share

### Bookmark
- **Storage**: AsyncStorage (key: `@kizola_bookmarked_articles`)
- **UI**: Bookmark icon on article card and in modal
- **State**: Array of bookmarked article IDs
- **Toggle**: Tap adds/removes from bookmarks
- **Section**: "Your Saved" appears at top if user has bookmarks
- **Icon**: `Bookmark` (outline) when not saved, `BookmarkCheck` (filled) when saved

### Share
- **API**: `Share.share()` from React Native (native)
- **Data**: Article title + description + formatted text
- **Format**: `"📚 {title}\n\n{description}\n\n— Kizola Protect"`
- **Button**: In article modal, next to bookmark
- **Fallback**: Copy to clipboard with alert if share not supported

---

## 7. Images

### Strategy
- Each article has a **cover image** (hero image)
- Images stored in `assets/images/learn/`
- Naming: `{category}-{id}.jpg` or `{category}-{id}.png`
- Fallback: gradient based on category color if image missing

### Dimensions
- **Article cover**: 800x450px (16:9)
- **Card thumbnail**: 400x225px (16:9)
- **Modal hero**: 800x400px (2:1)

### Implementation
- `ArticleCard`: Image as background with gradient overlay
- `FeaturedArticleCard`: Larger image with softer gradient
- `ArticleModal`: Hero section with background image
- Use `expo-image` for caching and performance
- **Image source**: Use placeholder images from Unsplash/Pexels (free license) for now. Each category gets a representative image. Real images can be added later via Supabase Storage.

---

## 8. Supabase Preparation

### Abstraction Layer

New file: `lib/learning.ts`

```typescript
// Returns articles (hardcoded now, Supabase later)
export async function getLearningArticles(): Promise<LearningArticle[]>

// Returns single article by ID
export async function getLearningArticle(id: string): Promise<LearningArticle | null>

// Returns articles by category
export async function getArticlesByCategory(category: string): Promise<LearningArticle[]>

// Searches articles
export async function searchArticles(query: string): Promise<LearningArticle[]>
```

Currently returns hardcoded data. When Supabase is ready, only the internal implementation changes — UI remains the same.

### Future Supabase Table

```sql
CREATE TABLE learning_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT DEFAULT 'beginner',
  tags JSONB DEFAULT '[]',
  cover_image TEXT,
  author TEXT,
  featured BOOLEAN DEFAULT false,
  popular BOOLEAN DEFAULT false,
  related_articles JSONB DEFAULT '[]',
  read_time INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 9. Files Modified

| File | Action |
|------|--------|
| `lib/learning.ts` | **NEW** — Abstraction layer for articles |
| `lib/supabase.ts` | Modify — Expand `LEARNING_ARTICLES` to 50+, add new fields |
| `app/(app)/constants/learnCategories.ts` | Modify — Add 6 new categories |
| `app/(app)/hooks/useLearn.ts` | Modify — Add bookmark state, recommended logic, new filters |
| `app/(app)/(tabs)/learn.tsx` | Modify — Add curated sections, filter integration |
| `app/(app)/components/learn/LearnHeader.tsx` | Modify — Add filter button |
| `app/(app)/components/learn/FeaturedArticleCard.tsx` | Modify — Dynamic rotation |
| `app/(app)/components/learn/StatsSection.tsx` | Modify — Update counters |
| `app/(app)/components/learn/CategoryChips.tsx` | Modify — Add counts |
| `app/(app)/components/learn/ArticleGrid.tsx` | Modify — Add sort options |
| `app/(app)/components/learn/ArticleCard.tsx` | Modify — Add cover image, difficulty badge, bookmark |
| `app/(app)/components/learn/ArticleModal.tsx` | Modify — Add cover hero, tags, related articles |
| `app/(app)/components/learn/FilterModal.tsx` | **NEW** — Filter modal |
| `app/(app)/components/learn/CuratedSection.tsx` | **NEW** — Reusable curated section |
| `app/(app)/components/learn/ArticleTags.tsx` | **NEW** — Clickable tags |
| `app/(app)/components/learn/RelatedArticles.tsx` | **NEW** — Related articles grid |
| `app/(app)/utils/renderArticleContent.tsx` | Modify — Add image support in markdown |
| `assets/translations/en.json` | Modify — Add all new article content |
| `assets/images/learn/` | **NEW** — Cover images directory |

---

## 10. Constraints

- All content via i18n keys (15 languages)
- No Supabase dependency for now (hardcoded only)
- Must work offline (articles available without network)
- Cover images must have fallback gradients
- Bookmark data must persist across app restarts (AsyncStorage)
- Performance: no jank on scroll with 50+ articles
