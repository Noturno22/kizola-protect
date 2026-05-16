import { useEffect } from 'react';
import { ActivityIndicator, View, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // 🔥 MOBILE (Expo / WebBrowser flow)
        if (Platform.OS !== 'web') {
          const { data, error } = await supabase.auth.getSession();

          if (error) {
            console.warn('Auth session error:', error);
          }

          if (cancelled) return;

          if (data?.session) {
            router.replace('/(app)/dashboard');
          } else {
            router.replace('/login');
          }

          return;
        }

        // 🌐 WEB FLOW
        const href = window.location.href;

        const url = new URL(href);
        const code = url.searchParams.get('code');

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) console.warn('OAuth code exchange error:', error);
        }

        if (cancelled) return;

        const { data } = await supabase.auth.getSession();

        if (data.session) {
          router.replace('/(app)/dashboard');
        } else {
          router.replace('/login');
        }
      } catch (e) {
        console.warn('OAuth callback crash:', e);
        router.replace('/login');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator />
    </View>
  );
}