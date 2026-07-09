import React from 'react';
import { render } from '@testing-library/react-native';
import Dashboard from '@/app/(app)/dashboard';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useFocusEffect: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'pt' } }),
}));

jest.mock('@/providers/AuthProvider', () => ({
  useAuth: () => ({
    user: { id: 'u1', name: 'Test', plan: 'pro', status: 'active', role: 'user' },
    isDemoMode: false,
  }),
}));

jest.mock('@/providers/NotificationProvider', () => ({
  useNotifications: () => ({
    notifications: [],
    unreadCount: 0,
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
  }),
}));

jest.mock('@/providers/ThemeProvider', () => {
  const lightTheme = {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#0F172A',
    textSecondary: 'rgba(15, 23, 42, 0.65)',
    textMuted: 'rgba(15, 23, 42, 0.4)',
    accent: '#4F46E5',
    accentBlue: '#2563EB',
    accentPurple: '#7C3AED',
    accentAmber: '#D97706',
    cardBorder: 'rgba(15, 23, 42, 0.08)',
    cardBorderAlt: 'rgba(15, 23, 42, 0.05)',
    headerGradient: ['#EEF2FF', '#F1F5F9', '#F8FAFC'],
    cardGradient: ['#F1F5F9', '#F8FAFC', '#FFFFFF'],
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
  };
  return {
    useTheme: () => ({ theme: lightTheme, isDark: false, toggleTheme: jest.fn() }),
  };
});

jest.mock('@/lib/supabase', () => ({
  supabase: { from: jest.fn(() => ({ select: jest.fn() })) },
  PLANS: {
    basic: { name: 'Basic', price: 19.99, benefits: ['B1'] },
    pro: { name: 'Pro', price: 34.99, benefits: ['B1', 'B2'] },
    premium: { name: 'Premium', price: 49.99, benefits: ['B1', 'B2', 'B3'] },
  },
  isSupabaseConfigured: () => false,
  BENEFIT_CATEGORIES: {},
  SupportRequest: {} as any,
}));

jest.mock('@/lib/secureStorage', () => ({
  getSecureItem: jest.fn(),
  SECURE_KEYS: { SUPPORT_REQUESTS: (id: string) => `kizola_support_${id}` },
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: any) => children,
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
}));

jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));

describe('Dashboard', () => {
  it('renders without crashing', () => {
    const { getByText } = render(<Dashboard />);
    expect(getByText('dashboard.welcomeBack')).toBeDefined();
  });

  it('renders the user name', () => {
    const { getByText } = render(<Dashboard />);
    expect(getByText('Test')).toBeDefined();
  });

  it('renders plan name for pro user', () => {
    const { getByText } = render(<Dashboard />);
    expect(getByText('Pro Plan')).toBeDefined();
  });

  it('renders quick action buttons', () => {
    const { getByText } = render(<Dashboard />);
    expect(getByText('dashboard.quickActions')).toBeDefined();
  });

  it('renders learning section', () => {
    const { getByText } = render(<Dashboard />);
    expect(getByText('dashboard.knowledgeBase')).toBeDefined();
  });

  it('renders plan benefits section', () => {
    const { getByText } = render(<Dashboard />);
    expect(getByText('dashboard.planBenefits')).toBeDefined();
  });
});
