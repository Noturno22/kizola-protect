import 'react-native-gesture-handler';
import { useEffect, useState, useCallback } from 'react';
import '@/lib/i18n';
import { LogBox, StyleSheet, View, InteractionManager } from 'react-native';
import { AuthProvider } from '@/providers/AuthProvider';
import { NotificationProvider } from '@/providers/NotificationProvider';
import { OfflineProvider } from '@/providers/OfflineProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthRedirect } from '@/components/AuthRedirect';
import { AuthReadyMarker } from '@/components/AuthReadyMarker';
import { initSentry } from '@/services/monitoring/sentry';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SplashScreen as PremiumSplash } from '@/src/components/Splash/SplashScreen';
import i18n from '@/lib/i18n';

SplashScreen.preventAutoHideAsync();

initSentry();

const queryClient = new QueryClient();

export default function RootLayout() {
  const [authReady, setAuthReady] = useState(false);
  const [splashDismissed, setSplashDismissed] = useState(false);
  const [readyToDismiss, setReadyToDismiss] = useState(false);

  useEffect(() => {
    if (!__DEV__) return;
    LogBox.ignoreLogs([
      'Unable to activate keep awake',
      'Possible Unhandled Promise Rejection',
    ]);
  }, []);

  useEffect(() => {
    if (!authReady) return;
    const task = InteractionManager.runAfterInteractions(() => {
      setReadyToDismiss(true);
    });
    return () => task.cancel();
  }, [authReady]);

  const handlePremiumSplashComplete = useCallback(() => {
    setSplashDismissed(true);
  }, []);

  return (
    <View style={styles.root}>
      {/* App content — always rendered so providers init immediately */}
      <GestureHandlerRootView style={styles.flex}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <AuthProvider>
                <NotificationProvider>
                  <OfflineProvider>
                    <AuthReadyMarker onReady={() => setAuthReady(true)} />
                    <AuthRedirect />
                    <Stack
                      screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: '#0D1B2E' },
                      }}
                    >
                      <Stack.Screen name="login" options={{ title: i18n.t('screens.login') }} />
                      <Stack.Screen name="register" options={{ title: i18n.t('screens.register') }} />
                      <Stack.Screen name="login-phone" options={{ title: i18n.t('screens.phoneLogin') }} />
                      <Stack.Screen name="forgot-password" options={{ title: i18n.t('screens.forgotPassword') }} />
                      <Stack.Screen name="reset-password" options={{ title: i18n.t('screens.resetPassword') }} />
                      <Stack.Screen name="onboarding" options={{ title: i18n.t('screens.onboarding') }} />
                      <Stack.Screen name="terms" options={{ title: i18n.t('screens.termsPrivacy') }} />
                      <Stack.Screen name="(app)" options={{ headerShown: false }} />
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

      {/* Premium splash overlay — stays on top until auth ready + fade complete */}
      {!splashDismissed && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <PremiumSplash
            readyToDismiss={readyToDismiss}
            onAnimationComplete={handlePremiumSplashComplete}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
});
