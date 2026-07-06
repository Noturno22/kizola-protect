# Kizola Protect — US Market Phase 1 (Remaining Tasks)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpawers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete remaining US-market preparation tasks for Kizola Protect (many critical items already completed in prior work).

**Current Status:** Extensive work already completed. The following are **DONE**:
- ✅ Privacy Policy (`app/privacy.tsx`) and Terms of Service (`app/terms.tsx`) 
- ✅ SecureStore migration (`lib/secureStorage.ts`, Supabase adapter, authStore)
- ✅ i18n fallback EN + es-US locale
- ✅ Apple Login + Google Login (login.tsx, register.tsx)
- ✅ Accessibility (161 props across 22 files)
- ✅ CCPA delete account flow (`app/(app)/delete-account.tsx`)
- ✅ AuthProvider refactored (44 lines, 4 custom hooks extracted)
- ✅ Profile refactored (1604 → 495 lines, 8 profile components extracted)
- ✅ Sentry monitoring module scaffolded (`services/monitoring/sentry.ts`)
- ✅ TLS pinning JS-level validation (`apiClient.ts`)
- ✅ Terms/Privacy links in registration flow

**Remaining (this plan):**
- Phase 1 Critical: Dead code removal (US-015)
- Phase 2 Major: Unit tests (US-007), Native TLS pinning (US-009), Crash reporting install (US-010), Offline support (US-011), Universal links (US-012), US pricing update (US-014)
- Phase 3 Medium: Constants extraction (US-017)
- Phase 2 Review: Accessibility audit gaps

**Tech Stack:** React Native (Expo SDK 54), TypeScript, Zustand, TanStack Query, i18next, Jest

---

## Status Map

| Task ID | Description | Status | Priority |
|---------|-------------|--------|----------|
| US-001 | Privacy Policy | ✅ DONE | Critical |
| US-002 | Terms of Service | ✅ DONE | Critical |
| US-003 | SecureStore Migration | ✅ DONE | Critical |
| US-004 | i18n Fallback EN | ✅ DONE | Critical |
| US-005 | Apple Login | ✅ DONE | Critical |
| US-006 | Accessibility | ✅ DONE (161 props) | Critical |
| US-007 | Unit Tests | ❌ NOT STARTED | Major |
| US-008 | es-US Translations | ✅ DONE | Major |
| US-009 | TLS Pinning | ⚠️ PARTIAL (JS validation only) | Major |
| US-010 | Crash Reporting | ⚠️ PARTIAL (Sentry module exists, pkg not installed) | Major |
| US-011 | Offline Support | ❌ NOT STARTED | Major |
| US-012 | Universal Links | ❌ NOT STARTED | Major |
| US-013 | CCPA Deletion | ✅ DONE | Major |
| US-014 | US Pricing | ⚠️ OLD PRICES ($27.99/$29.99/$33.99) | Medium |
| US-015 | Dead Code | ❌ `login.tsx.phone` exists | Medium |
| US-016 | Sentry | ⚠️ Scaffolded, needs install | Medium |
| US-017 | Constants | ❌ Only logo-colors.ts exists | Medium |
| US-018 | Monolith Refactor | ⚠️ Profile done, learn(1161)/dashboard(976)/support remain | Medium |

---

### Task 1: Remove dead code (US-015)

**Files:**
- Delete: `app/(auth)/login.tsx.phone`

- [ ] **Step 1: Delete dead file**

Run: `Remove-Item -LiteralPath "app/(auth)/login.tsx.phone" -Force`
Verify file no longer exists.

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "chore: remove dead file app/(auth)/login.tsx.phone"
```

---

### Task 2: US Pricing update (US-014)

**Files:**
- Modify: `lib/supabase.ts:130-183`

Update the PLANS object to US-market pricing:
- Basic: $27.99 → $19.99
- Pro: $29.99 → $34.99
- Premium: $33.99 → $49.99

- [ ] **Step 1: Update pricing constants**

Edit `lib/supabase.ts` lines 133, 149, 167:
```typescript
// basic: price: 19.99
// pro: price: 34.99
// premium: price: 49.99
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: update pricing to US market (Basic $19.99/Pro $34.99/Premium $49.99)"
```

---

### Task 3: Install Sentry/Error Reporting (US-010)

**Files:**
- Modify: `package.json` (add dependency)
- Modify: `app/_layout.tsx` (initialize Sentry)

- [ ] **Step 1: Install @sentry/react-native**

Run: `npx expo install @sentry/react-native`

- [ ] **Step 2: Initialize Sentry in root layout**

Edit `app/_layout.tsx`:
```typescript
import { initSentry } from '@/services/monitoring/sentry';
initSentry();
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add Sentry crash reporting for production monitoring"
```

---

### Task 4: Native TLS Pinning (US-009)

**Files:**
- Modify: `app.json` (add expo-network-addons plugin)
- Modify: `package.json` (add dependency)

- [ ] **Step 1: Install expo-network-addons**

Run: `npx expo install expo-network-addons`

- [ ] **Step 2: Configure in app.json**

Add to `app.json` → `expo.plugins`:
```json
"expo-network-addons": {
  "ios": {
    "pinnedDomains": ["api.kizola.app"]
  },
  "android": {
    "pinnedDomains": ["api.kizola.app"]
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add native TLS pinning via expo-network-addons"
```

---

### Task 5: Constants extraction (US-017)

**Files:**
- Create: `constants/colors.ts`
- Create: `constants/theme.ts`

- [ ] **Step 1: Create colors constant file**

`constants/colors.ts`:
```typescript
export const COLORS = {
  // Primary
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#3B82F6',

  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',

  // Backgrounds
  bgLight: '#F8FAFF',
  bgDark: '#0A0F1E',
  surfaceLight: '#FFFFFF',
  surfaceDark: '#111827',

  // Borders
  borderLight: '#E2E8F4',
  borderDark: '#1F2A3D',

  // Plan colors
  free: ['#94A3B8', '#475569'] as const,
  basic: ['#10B981', '#059669'] as const,
  pro: ['#0EA5E9', '#2563EB'] as const,
  premium: ['#8B5CF6', '#6366F1'] as const,

  // Gradients
  gradientLight: ['#EEF2FF', '#F0F9FF', '#FFFFFF'] as const,
  gradientDark: ['#060D1F', '#0A1628', '#0D1F3C'] as const,
} as const;

export type ColorKey = keyof typeof COLORS;
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add constants/colors.ts for design system colors"
```

---

### Task 6: Unit test setup (US-007)

**Files:**
- Create: `jest.config.js`
- Modify: `package.json` (add jest config)
- Create: `lib/__tests__/payment.test.ts`
- Create: `hooks/__tests__/useRBAC.test.ts`
- Create: `components/auth/__tests__/PhoneInput.test.tsx`

- [ ] **Step 1: Install jest-expo and testing libraries**

Run: `npx expo install jest-expo @testing-library/react-native @testing-library/jest-native`

- [ ] **Step 2: Create jest.config.js**

```javascript
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  setupFilesAfterSetup: ['@testing-library/jest-native/extend-expect'],
};
```

- [ ] **Step 3: Create payment validation test**

- [ ] **Step 4: Verify tests run**

Run: `npx jest --passWithNoTests`
Expected: Tests pass

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "test: add Jest configuration and initial unit tests"
```

---

### Task 7: Accessibility audit pass (US-006 gap analysis)

**Files:**
- Review: `app/(app)/dashboard.tsx` — check interactive elements
- Review: `app/(app)/learn.tsx` — check accessibility on article cards
- Review: `app/(app)/support.tsx` — check form and list accessibility
- Review: `app/(auth)/verify.tsx` — verification screen

- [ ] **Step 1: Audit dashboard.tsx for missing accessibility props**

Scan for TouchableOpacity / Pressable without `accessibilityRole`, `accessibilityLabel`. Fix any gaps.

- [ ] **Step 2: Audit learn.tsx**

Same scan for article cards, search bar, category filters.

- [ ] **Step 3: Audit support.tsx**

Same scan for form inputs, submit button, request list.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "fix: add missing accessibility props to dashboard, learn, support screens"
```

---

### Task 8: Offline support foundation (US-011)

**Files:**
- Install: `@react-native-community/netinfo`
- Create: `providers/OfflineProvider.tsx`
- Modify: `app/_layout.tsx` (add OfflineProvider)

- [ ] **Step 1: Install NetInfo**

Run: `npx expo install @react-native-community/netinfo`

- [ ] **Step 2: Create OfflineProvider**

- [ ] **Step 3: Integrate in root layout**

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add offline detection with NetInfo + OfflineProvider"
```

---

## Verification

After all tasks complete, verify:
1. `npm run lint` passes
2. All new tests pass: `npx jest`
3. TypeScript compiles: `npx tsc --noEmit`
4. Dead file is gone
5. Pricing shows correct US values in PLANS object
