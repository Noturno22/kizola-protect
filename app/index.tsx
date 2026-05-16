import { useEffect, useState, useMemo } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme, Theme } from '@/providers/ThemeProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const APP_ONBOARDING_COMPLETED_KEY = '@kizola_app_onboarding_completed_v1';

export default function Index() {
  const { session, user, loading: authLoading, isDemoMode } = useAuth();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const completed = await AsyncStorage.getItem(APP_ONBOARDING_COMPLETED_KEY);
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

  if (authLoading || !onboardingChecked) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  const isAuthenticated = Boolean(session ?? (isDemoMode && user));

  if (!isAuthenticated) {
    // Redirect to the Twilio-backed phone auth login
    return <Redirect href="/(auth)/login" />;
  }

  if (user?.plan === 'none') {
    return <Redirect href="/dashboard" />;
  }

  return <Redirect href="/dashboard" />;
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
  },
});
