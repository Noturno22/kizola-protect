import { Stack } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';

export default function AdminLayout() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  // Se não for admin ou user for null (ainda carregando), redireciona para o dashboard principal
  if (!user || !user.role || user.role !== 'admin') {
    return <Redirect href="/(app)/dashboard" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
      }}
    />
  );
}
