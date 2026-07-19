import { useMemo } from 'react';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';

export default function TabsLayout() {
    const { t } = useTranslation();
    const { theme, isDark } = useTheme();
    const { user } = useAuth();

    const isAdmin = (user as any)?.role === 'admin';

    const iconColor = useMemo(() => ({
        default: theme.textSecondary,
        selected: theme.accent,
    }), [theme]);

    const labelStyle = useMemo(() => ({
        fontSize: 11,
        fontWeight: '500' as const,
        color: theme.textSecondary,
    }), [theme]);

    const tabSelectedStyle = useMemo(() => ({
        color: theme.accent,
        fontSize: 11,
        fontWeight: '600' as const,
    }), [theme]);

    return (
        <NativeTabs
            backgroundColor={theme.surface}
            disableIndicator
            iconColor={iconColor}
            labelStyle={labelStyle}
            rippleColor="transparent"
        >
            <NativeTabs.Trigger name="dashboard">
                <NativeTabs.Trigger.Label selectedStyle={tabSelectedStyle}>
                    {t('dashboard.welcome') || 'Home'}
                </NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon md="home" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="benefits">
                <NativeTabs.Trigger.Label selectedStyle={tabSelectedStyle}>
                    {t('profile.benefits') || 'Benefícios'}
                </NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon md="card_giftcard" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="activity">
                <NativeTabs.Trigger.Label selectedStyle={tabSelectedStyle}>
                    {t('profile.myActivity') || 'Actividade'}
                </NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon md="assignment" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="learn">
                <NativeTabs.Trigger.Label selectedStyle={tabSelectedStyle}>
                    {t('profile.learningCenter') || 'Aprender'}
                </NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon md="menu_book" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="support">
                <NativeTabs.Trigger.Label selectedStyle={tabSelectedStyle}>
                    {t('profile.support') || 'Suporte'}
                </NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon md="chat" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="profile">
                <NativeTabs.Trigger.Label selectedStyle={tabSelectedStyle}>
                    {t('profile.title') || 'Perfil'}
                </NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon md="person" />
            </NativeTabs.Trigger>
            {isAdmin && (
                <NativeTabs.Trigger name="admin">
                    <NativeTabs.Trigger.Label selectedStyle={tabSelectedStyle}>
                        {t('adminTab.label')}
                    </NativeTabs.Trigger.Label>
                    <NativeTabs.Trigger.Icon md="dashboard" />
                </NativeTabs.Trigger>
            )}
        </NativeTabs>
    );
}
