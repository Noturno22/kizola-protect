import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import {
  HomeIcon,
  BookOpenIcon,
  MessageCircleIcon,
  UserIcon,
  GridIcon,
} from '@/components/TabBarIcons';

// ─── Fallbacks seguros para o primeiro render (antes do theme async carregar) ───
const FALLBACK_BG        = '#0D1B2E';
const FALLBACK_BORDER    = 'rgba(255,255,255,0.07)';
const FALLBACK_ACTIVE    = '#00C8B4';
const FALLBACK_INACTIVE  = 'rgba(255,255,255,0.45)';

export default function AppLayout() {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const { user } = useAuth();

    const isAdmin = user?.role === 'admin';

    // Guardar contra valores undefined (theme async ainda não carregado)
    const tabBg       = theme?.surface        ?? FALLBACK_BG;
    const tabBorder   = theme?.cardBorderAlt  ?? FALLBACK_BORDER;
    const activeColor = theme?.accent         ?? FALLBACK_ACTIVE;
    const inactiveColor = theme?.textSecondary ?? FALLBACK_INACTIVE;

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: tabBg,
                    borderTopWidth: 1,
                    borderTopColor: tabBorder,
                    shadowColor: '#000',
                    shadowOpacity: 0.10,
                    shadowRadius: 12,
                    shadowOffset: { width: 0, height: -6 },
                },
                tabBarActiveTintColor: activeColor,
                tabBarInactiveTintColor: inactiveColor,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '500',
                },
                tabBarIconStyle: {
                    marginHorizontal: 0,
                    paddingHorizontal: 4,
                },
            }}
        >
            {/* ── 4 tabs visíveis ── */}
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: t('dashboard.welcome') || 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <HomeIcon color={color} size={size} strokeWidth={2.5} />
                    ),
                }}
            />
            <Tabs.Screen
                name="learn"
                options={{
                    title: t('profile.learningCenter') || 'Learn',
                    tabBarIcon: ({ color, size }) => (
                        <BookOpenIcon color={color} size={size} strokeWidth={2.5} />
                    ),
                }}
            />
            <Tabs.Screen
                name="support"
                options={{
                    title: t('profile.support') || 'Support',
                    tabBarIcon: ({ color, size }) => (
                        <MessageCircleIcon color={color} size={size} strokeWidth={2.5} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: t('profile.title') || 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <UserIcon color={color} size={size} strokeWidth={2.5} />
                    ),
                }}
            />

            {/* ── Admin tab — visível apenas para admins ── */}
            <Tabs.Screen
                name="admin"
                options={{
                    title: 'Admin',
                    tabBarIcon: ({ color, size }) => (
                        <GridIcon color={color} size={size} strokeWidth={2.5} />
                    ),
                    href: isAdmin ? '/(app)/admin/dashboard' : null,
                }}
            />

            {/* ── Ecrãs ocultos — não aparecem na tab bar ── */}
            <Tabs.Screen name="benefits"        options={{ href: null }} />
            <Tabs.Screen name="activity"        options={{ href: null }} />
            <Tabs.Screen name="finance-support" options={{ href: null }} />
            <Tabs.Screen name="housing-support" options={{ href: null }} />
            <Tabs.Screen name="plans"           options={{ href: null }} />
            <Tabs.Screen name="plan-details"    options={{ href: null }} />
            <Tabs.Screen name="checkout"        options={{ href: null }} />
            <Tabs.Screen name="documents"       options={{ href: null }} />
            <Tabs.Screen name="delete-account"  options={{ href: null }} />
        </Tabs>
    );
}
