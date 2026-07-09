import 'react-native-gesture-handler';
import { useEffect } from 'react';
import '@/lib/i18n';
import { LogBox } from 'react-native';
import { AuthProvider } from '@/providers/AuthProvider'; 
import { NotificationProvider } from '@/providers/NotificationProvider';
import { OfflineProvider } from '@/providers/OfflineProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthRedirect } from '@/components/AuthRedirect';
import { initSentry } from '@/services/monitoring/sentry';

initSentry();

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

    // Global fetch logging for network diagnostics
    const originalFetch = global.fetch;
    global.fetch = async (...args) => {
      console.log('FETCH URL:', args[0]);
      try {
        const response = await originalFetch(...args);
        console.log('FETCH STATUS:', response.status);
        return response;
      } catch (error) {
        console.error('FETCH FAILED:', args[0]);
        console.error(error);
        throw error;
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
            <OfflineProvider>
              <AuthRedirect />
              <Stack screenOptions={{ headerShown: false }} />
              <StatusBar style="auto" />
            </OfflineProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}