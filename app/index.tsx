import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme, Theme } from '@/providers/ThemeProvider';
import * as SecureStore from 'expo-secure-store';

export const APP_ONBOARDING_COMPLETED_KEY = 'kizola_app_onboarding_completed_v1';

export default function Index() {
  const router = useRouter();
  const { session, user, loading: authLoading, isDemoMode } = useAuth();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const completed = await SecureStore.getItemAsync(APP_ONBOARDING_COMPLETED_KEY);
        if (isMounted) {
          setHasCompletedOnboarding(!!completed);
          setOnboardingChecked(true);
        }
      } catch (error) {
        if (isMounted) {
          setHasCompletedOnboarding(false);
          setOnboardingChecked(true);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (authLoading || !onboardingChecked) return;

    if (!hasCompletedOnboarding) {
      router.replace('/onboarding');
    } else {
      const isAuthenticated = Boolean(session ?? (isDemoMode && user));
      if (!isAuthenticated) {
        router.replace('/login');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [authLoading, onboardingChecked, hasCompletedOnboarding, session, user, isDemoMode, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.primary} />
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
  },
});
