/**
 * ═══════════════════════════════════════════════════════════════
 * 🎨 Kizola Protect — Design Tokens
 * ═══════════════════════════════════════════════════════════════
 *
 * Single source of truth for spacing, typography, border radius,
 * shadows, and animation durations. Use these tokens instead of
 * hardcoding values.
 *
 * Color tokens live in `constants/colors.ts`.
 * ThemeProvider theme objects live in `providers/ThemeProvider.tsx`.
 */

// ── Spacing (4px base unit) ───────────────────────────────────
export const SPACING = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,
  section: 22,
  page: 20,
} as const;

// ── Border Radius ─────────────────────────────────────────────
export const RADIUS = {
  none: 0,
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  xxl: 14,
  round: 16,
  pill: 20,
  full: 9999,
  modal: 26,
} as const;

// ── Typography ────────────────────────────────────────────────
export const FONT = {
  size: {
    caption: 10,
    xs: 11,
    sm: 12,
    md: 13,
    base: 14,
    lg: 15,
    xl: 16,
    xxl: 18,
    title: 20,
    heading: 22,
    hero: 26,
    display: 28,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.2,
    wider: 0.5,
  },
  lineHeight: {
    tight: 17,
    normal: 18,
    relaxed: 20,
    loose: 24,
  },
} as const;

// ── Shadows ───────────────────────────────────────────────────
export const SHADOW = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 16,
  },
  glow: (color: string, opacity = 0.6) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: opacity,
    shadowRadius: 8,
    elevation: 4,
  }),
} as const;

// ── Animation ─────────────────────────────────────────────────
export const ANIM = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
    pulse: 900,
  },
  pulse: {
    scale: { min: 1, max: 1.4 },
  },
} as const;

// ── Layout ────────────────────────────────────────────────────
export const LAYOUT = {
  icon: {
    sm: 16,
    md: 20,
    lg: 22,
    xl: 24,
    xxl: 26,
    avatar: 40,
    action: 46,
    stat: 48,
    empty: 96,
  },
  button: {
    sm: 36,
    md: 40,
    lg: 46,
    xl: 48,
  },
  card: {
    minHeight: 110,
    padding: 16,
    iconSize: 48,
  },
} as const;

// ── Grid ──────────────────────────────────────────────────────
export const GRID = {
  gutter: 10,
  columnCount: 2,
  actionCardWidth: '47.5%' as const,
} as const;
