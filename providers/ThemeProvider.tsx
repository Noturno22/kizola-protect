import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

const THEME_KEY = 'kizola_theme';

export type Theme = {
  background: string;
  surface: string;
  surfaceElevated: string;
  cardBorder: string;
  cardBorderAlt: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentBlue: string;
  accentPurple: string;
  accentAmber: string;
  headerGradient: readonly [string, string, ...string[]];
  cardGradient: readonly [string, string, ...string[]];
  shieldGlow: string;
  actionCardBg: string;
  seeAllColor: string;
  learningBg: string;
  learningBorder: string;
  learningIconBg: string;
  isDark: boolean;
  statCardBg: string;
  helpCardBg: string;
  helpCardBorder: string;
  notifBg: string;
  // Additional properties from Colors
  primary: string;
  secondary: string;
  error: string;
  success: string;
  warning: string;
  border: string;
  borderLight: string;
};

export const darkTheme: Theme = {
  background: '#050D1A',
  surface: '#0D1B2E',
  surfaceElevated: '#0F2035',
  cardBorder: 'rgba(0,200,180,0.18)',
  cardBorderAlt: 'rgba(255,255,255,0.07)',
  text: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.65)',
  textMuted: 'rgba(255,255,255,0.38)',
  accent: '#00C8B4',
  accentBlue: '#3B82F6',
  accentPurple: '#8B5CF6',
  accentAmber: '#F59E0B',
  headerGradient: ['#071222', '#0A1E38', '#051528'],
  cardGradient: ['#0D2A40', '#091E30', '#0B2840'],
  shieldGlow: 'rgba(0,200,180,0.18)',
  actionCardBg: '#0D1B2E',
  seeAllColor: '#00C8B4',
  learningBg: 'rgba(0,200,180,0.07)',
  learningBorder: 'rgba(0,200,180,0.14)',
  learningIconBg: 'rgba(0,200,180,0.12)',
  isDark: true,
  statCardBg: '#0D1B2E',
  helpCardBg: 'rgba(59,130,246,0.08)',
  helpCardBorder: 'rgba(59,130,246,0.18)',
  notifBg: 'rgba(0,200,180,0.08)',
  primary: '#00C8B4',
  secondary: '#8B5CF6',
  error: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',
  border: 'rgba(255,255,255,0.1)',
  borderLight: 'rgba(255,255,255,0.05)',
};

export const lightTheme: Theme = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  cardBorder: 'rgba(15, 23, 42, 0.08)',
  cardBorderAlt: 'rgba(15, 23, 42, 0.05)',
  text: '#0F172A',
  textSecondary: 'rgba(15, 23, 42, 0.65)',
  textMuted: 'rgba(15, 23, 42, 0.4)',
  accent: '#4F46E5',
  accentBlue: '#2563EB',
  accentPurple: '#7C3AED',
  accentAmber: '#D97706',
  headerGradient: ['#E0E7FF', '#EEF2FF', '#F8FAFC'],
  cardGradient: ['#EEF2FF', '#F8FAFC', '#FFFFFF'],
  shieldGlow: 'rgba(79, 70, 229, 0.1)',
  actionCardBg: '#FFFFFF',
  seeAllColor: '#4F46E5',
  learningBg: 'rgba(79, 70, 229, 0.05)',
  learningBorder: 'rgba(79, 70, 229, 0.1)',
  learningIconBg: 'rgba(79, 70, 229, 0.08)',
  isDark: false,
  statCardBg: '#FFFFFF',
  helpCardBg: 'rgba(79, 70, 229, 0.04)',
  helpCardBorder: 'rgba(79, 70, 229, 0.1)',
  notifBg: 'rgba(79, 70, 229, 0.04)',
  primary: '#0F172A',
  secondary: '#334155',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
};

type ThemeContextType = {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (mode: 'light' | 'dark') => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await SecureStore.getItemAsync(THEME_KEY);
      if (savedTheme !== null) {
        setIsDark(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newMode = !isDark;
      setIsDark(newMode);
      await SecureStore.setItemAsync(THEME_KEY, newMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const setTheme = async (mode: 'light' | 'dark') => {
    try {
      setIsDark(mode === 'dark');
      await SecureStore.setItemAsync(THEME_KEY, mode);
    } catch (error) {
      console.error('Error setting theme:', error);
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
