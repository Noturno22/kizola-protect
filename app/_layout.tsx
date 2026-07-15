import 'react-native-gesture-handler';
import { useEffect } from 'react';
import '@/lib/i18n';
import { LogBox } from 'react-native';
import { AuthProvider } from '@/providers/AuthProvider'; 
import { NotificationProvider } from '@/providers/NotificationProvider';
import { OfflineProvider } from '@/providers/OfflineProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { Stack, Redirect } from 'expo-router';
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
                  <Stack
                    screenOptions={{
                      headerShown: false,
                      contentStyle: { backgroundColor: '#0D1B2E' },
                    }}
                  >
                    {/* Public auth screens (fora do grupo (app)) */}
                    <Stack.Screen name="login" options={{ title: 'Login' }} />
                    <Stack.Screen name="register" options={{ title: 'Register' }} />
                    <Stack.Screen name="login-phone" options={{ title: 'Phone Login' }} />
                    <Stack.Screen name="forgot-password" options={{ title: 'Forgot Password' }} />
                    <Stack.Screen name="reset-password" options={{ title: 'Reset Password' }} />
                    <Stack.Screen name="verify" options={{ title: 'Verify' }} />
                    <Stack.Screen name="onboarding" options={{ title: 'Onboarding' }} />
                    <Stack.Screen name="terms" options={{ title: 'Terms' }} />
                    <Stack.Screen name="privacy" options={{ title: 'Privacy' }} />

                    {/*
                      O grupo (app) tem o seu próprio _layout.tsx com Tabs.
                      NÃO registar aqui os screens individuais (dashboard, learn, etc.)
                      — esses pertencem ao Tabs navigator dentro de (app)/_layout.tsx.
                      Registar apenas o grupo como um todo.
                    */}
                    <Stack.Screen name="(app)" options={{ headerShown: false }} />

                    {/* index screen (redireciona para login ou (app)) */}
                    <Stack.Screen name="index" options={{ headerShown: false }} />
                  </Stack>
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