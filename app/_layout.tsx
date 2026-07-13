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
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

initSentry();

const queryClient = new QueryClient();

export default function RootLayout() {
  // App uses SVG icons (TabBarIcons) and lucide-react-native components, not font files
  const fontsLoaded = true;
  const fontError = null;
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, []);

  useEffect(() => {
    if (!__DEV__) return;
    
    LogBox.ignoreLogs([
      'Unable to activate keep awake',
      'Possible Unhandled Promise Rejection',
    ]);

    const originalFetch = globalThis.fetch.bind(globalThis);
    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      console.log('FETCH URL:', input);
      try {
        const response = await originalFetch(input, init);
        console.log('FETCH STATUS:', response.status);
        return response;
      } catch (error) {
        console.error('FETCH FAILED:', input);
        console.error(error);
        throw error;
      }
    };
  }, []);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
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
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}