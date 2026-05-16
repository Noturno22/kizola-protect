import 'react-native-gesture-handler';
import { useEffect } from 'react';
import '@/lib/i18n';
import { LogBox } from 'react-native';
import { AuthProvider } from '@/providers/AuthProvider'; 
import { NotificationProvider } from '@/providers/NotificationProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthRedirect } from '@/components/AuthRedirect';

const queryClient = new QueryClient();

export default function RootLayout() {
  useEffect(() => {
    if (!__DEV__) return;
    
    // Silence common development-only warnings
    LogBox.ignoreLogs([
      'Unable to activate keep awake',
      'Possible Unhandled Promise Rejection',
    ]);

    // Catch unhandled promise rejections that LogBox might not catch
    const handleRejection = (event: any) => {
      if (event?.reason?.message?.includes('keep awake')) {
        // Silently ignore keep awake activation failures
        return;
      }
    };

    // Note: On some platforms, this might need different handling
    // For now, LogBox.ignoreLogs handles the UI part.
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <AuthRedirect />
            <Stack screenOptions={{ headerShown: false }} />
            <StatusBar style="auto" />
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}