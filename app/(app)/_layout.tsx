import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { ActivityIndicator, View } from 'react-native';
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
        <NativeTabs
            backgroundColor={theme.surface}
            disableIndicator
            iconColor={{
                default: theme.textSecondary,
                selected: theme.accent,
            }}
            labelStyle={{
                fontSize: 10,
                fontWeight: '500',
                color: theme.textSecondary,
            }}
        >
            <NativeTabs.Trigger name="dashboard">
                <NativeTabs.Trigger.Label selectedStyle={{ color: theme.accent, fontSize: 10, fontWeight: '600' }}>
                    {t('dashboard.welcome') || 'Home'}
                </NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon md="home" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="benefits">
                <NativeTabs.Trigger.Label selectedStyle={{ color: theme.accent, fontSize: 10, fontWeight: '600' }}>
                    {t('profile.benefits') || 'Benefícios'}
                </NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon md="card_giftcard" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="activity">
                <NativeTabs.Trigger.Label selectedStyle={{ color: theme.accent, fontSize: 10, fontWeight: '600' }}>
                    {t('profile.myActivity') || 'Actividade'}
                </NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon md="assignment" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="learn">
                <NativeTabs.Trigger.Label selectedStyle={{ color: theme.accent, fontSize: 10, fontWeight: '600' }}>
                    {t('profile.learningCenter') || 'Aprender'}
                </NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon md="menu_book" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="support">
                <NativeTabs.Trigger.Label selectedStyle={{ color: theme.accent, fontSize: 10, fontWeight: '600' }}>
                    {t('profile.support') || 'Suporte'}
                </NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon md="chat" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="profile">
                <NativeTabs.Trigger.Label selectedStyle={{ color: theme.accent, fontSize: 10, fontWeight: '600' }}>
                    {t('profile.title') || 'Perfil'}
                </NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon md="person" />
            </NativeTabs.Trigger>
            {isAdmin && (
                <NativeTabs.Trigger name="admin">
                    <NativeTabs.Trigger.Label selectedStyle={{ color: theme.accent, fontSize: 10, fontWeight: '600' }}>
                        Admin
                    </NativeTabs.Trigger.Label>
                    <NativeTabs.Trigger.Icon md="dashboard" />
                </NativeTabs.Trigger>
            )}
        </NativeTabs>
    );
}
