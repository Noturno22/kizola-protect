/**
 * ═══════════════════════════════════════════════════════════════
 * 🎨 Kizola Protect — Design System Colors
 * ═══════════════════════════════════════════════════════════════
 *
 * Single source of truth for all colors used in the app.
 * No hardcoded color values anywhere else — import from here.
 */

export const COLORS = {
  // ── Primary ──────────────────────────────────────────────────
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#3B82F6',

  // ── Status ────────────────────────────────────────────────────
  success: '#10B981',
  successDark: '#059669',
  warning: '#F59E0B',
  warningDark: '#D97706',
  error: '#EF4444',
  errorDark: '#DC2626',
  info: '#3B82F6',

  // ── Text ──────────────────────────────────────────────────────
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textLight: '#F9FAFB',

  // ── Backgrounds ───────────────────────────────────────────────
  bgLight: '#F8FAFF',
  bgDark: '#0A0F1E',
  bgDarkSecondary: '#060D1F',
  surfaceLight: '#FFFFFF',
  surfaceDark: '#111827',
  surfaceDarkSecondary: '#161F30',

  // ── Borders ───────────────────────────────────────────────────
  borderLight: '#E2E8F4',
  borderLightAlt: '#D1DCF0',
  borderDark: '#1F2A3D',
  borderDarkAlt: '#2A3A52',
  borderDarkAlt2: '#1E3A5F',

  // ── Cards & Inputs ────────────────────────────────────────────
  inputLight: '#F1F5FD',
  inputDark: '#0D1526',
  cardShadow: '#000000',
  shadowLight: '#A8C0E8',

  // ── Social ────────────────────────────────────────────────────
  google: '#4285F4',
  apple: '#000000',
  appleDark: '#333333',

  // ── Plan Colors ───────────────────────────────────────────────
  planFree: ['#94A3B8', '#475569'] as const,
  planBasic: ['#10B981', '#059669'] as const,
  planPro: ['#0EA5E9', '#2563EB'] as const,
  planPremium: ['#8B5CF6', '#6366F1'] as const,

  // ── Gradients ─────────────────────────────────────────────────
  gradientLight: ['#EEF2FF', '#F0F9FF', '#FFFFFF'] as const,
  gradientDark: ['#060D1F', '#0A1628', '#0D1F3C'] as const,
  gradientLightForm: ['#EEF2FF', '#F0F9FF', '#FFFFFF'] as const,
  gradientDarkForm: ['#060D1F', '#0A1628', '#0D1F3C'] as const,

  // ── Misc ──────────────────────────────────────────────────────
  overlay: 'rgba(0,0,0,0.5)',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export type ColorKey = keyof typeof COLORS;
