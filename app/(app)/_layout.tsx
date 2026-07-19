import { Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';

export default function AppLayout() {
    const { theme } = useTheme();
    const { user, loading } = useAuth();

    if (!loading && !user) {
        return null;
    }

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: theme.surface },
            }}
        >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="admin" />
            <Stack.Screen name="plan-details" />
            <Stack.Screen name="plans" />
            <Stack.Screen name="documents" />
            <Stack.Screen name="checkout" />
            <Stack.Screen name="housing-support" />
            <Stack.Screen name="finance-support" />
            <Stack.Screen name="delete-account" />
        </Stack>
    );
}
