import { Tabs } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import {
    HomeIcon,
    BookOpenIcon,
    MessageCircleIcon,
    UserIcon,
    GridIcon,
    GiftIcon,
    ClipboardIcon,
} from '@/components/TabBarIcons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import { Redirect } from 'expo-router';

export default function AppLayout() {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const { user, loading } = useAuth();

    const isAdmin = (user as any)?.role === 'admin';

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
                <ActivityIndicator size="large" color={theme.accent} />
            </View>
        );
    }

    if (!user) {
        return <Redirect href="/login" />;
    }

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: theme.surface,
                    borderTopWidth: 1,
                    borderTopColor: theme.cardBorderAlt,
                    shadowColor: '#000',
                    shadowOpacity: 0.10,
                    shadowRadius: 12,
                    shadowOffset: { width: 0, height: -6 },
                    elevation: 12,
                },
                tabBarActiveTintColor: theme.accent,
                tabBarInactiveTintColor: theme.textSecondary,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '500',
                },
                tabBarIconStyle: {
                    width: 24,
                    height: 24,
                },
            }}
        >
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: t('dashboard.welcome') || 'Home',
                    tabBarIcon: ({ color }: { color: string }) => <HomeIcon color={color} size={22} />,
                }}
            />
            <Tabs.Screen
                name="benefits"
                options={{
                    title: t('profile.benefits') || 'Benefícios',
                    tabBarIcon: ({ color }: { color: string }) => <GiftIcon color={color} size={22} />,
                }}
            />
            <Tabs.Screen
                name="activity"
                options={{
                    title: t('profile.myActivity') || 'Actividade',
                    tabBarIcon: ({ color }: { color: string }) => <ClipboardIcon color={color} size={22} />,
                }}
            />
            <Tabs.Screen
                name="learn"
                options={{
                    title: t('profile.learningCenter') || 'Aprender',
                    tabBarIcon: ({ color }: { color: string }) => <BookOpenIcon color={color} size={22} />,
                }}
            />
            <Tabs.Screen
                name="support"
                options={{
                    title: t('profile.support') || 'Suporte',
                    tabBarIcon: ({ color }: { color: string }) => <MessageCircleIcon color={color} size={22} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: t('profile.title') || 'Perfil',
                    tabBarIcon: ({ color }: { color: string }) => <UserIcon color={color} size={22} />,
                }}
            />
            {/* Admin tab — visível apenas para admins */}
            <Tabs.Screen
                name="admin"
                options={{
                    title: 'Admin',
                    tabBarIcon: ({ color }: { color: string }) => <GridIcon color={color} size={22} />,
                    href: isAdmin ? '/(app)/admin/dashboard' : null,
                }}
            />
            {/* Ecrãs ocultos — não aparecem na tab bar */}
            <Tabs.Screen name="plans" options={{ href: null }} />
            <Tabs.Screen name="plan-details" options={{ href: null }} />
            <Tabs.Screen name="checkout" options={{ href: null }} />
            <Tabs.Screen name="documents" options={{ href: null }} />
            <Tabs.Screen name="housing-support" options={{ href: null }} />
            <Tabs.Screen name="finance-support" options={{ href: null }} />
            <Tabs.Screen name="delete-account" options={{ href: null }} />
        </Tabs>
    );
}