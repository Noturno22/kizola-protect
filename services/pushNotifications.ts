import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { PermissionStatus } from 'expo-modules-core';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ── Configure foreground notification behavior ─────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ── Types ─────────────────────────────────────────────────────
export type PushTokenResult = {
  token: string | null;
  permission: PermissionStatus;
};

export type NotificationListener = {
  received: Notifications.Subscription;
  response: Notifications.Subscription;
  tokenRefresh: Notifications.Subscription;
};

// ── Core: Register for Push Token ─────────────────────────────
export async function registerForPushNotificationsAsync(): Promise<PushTokenResult> {
  // Android: create notification channel (required before permission prompt)
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Kizola Protect',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  // Check existing permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request if not granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('[PushNotifications] Permission denied');
    return { token: null, permission: finalStatus };
  }

  // Get EAS projectId
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;

  if (!projectId) {
    console.error('[PushNotifications] EAS projectId not found. Run `eas init` or set in app.json.');
    return { token: null, permission: finalStatus };
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    return { token: tokenData.data, permission: finalStatus };
  } catch (error: any) {
    // Gracefully handle Firebase not being configured (no google-services.json)
    if (error?.message?.includes('FirebaseApp') || error?.message?.includes('googleServicesFile')) {
      console.warn('[PushNotifications] Firebase not configured — push notifications disabled. Add google-services.json to enable.');
    } else {
      console.error('[PushNotifications] Failed to get push token:', error);
    }
    return { token: null, permission: finalStatus };
  }
}

// ── Save Token to Backend ─────────────────────────────────────
export async function savePushToken(userId: string, token: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.log('[PushNotifications] Supabase not configured, skipping token save');
    return false;
  }

  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        push_token: token,
        push_token_updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('[PushNotifications] Failed to save token:', error);
      return false;
    }

    console.log('[PushNotifications] Token saved successfully');
    return true;
  } catch (error) {
    console.error('[PushNotifications] Unexpected error saving token:', error);
    return false;
  }
}

// ── Remove Token from Backend ─────────────────────────────────
export async function removePushToken(userId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        push_token: null,
        push_token_updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('[PushNotifications] Failed to remove token:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[PushNotifications] Unexpected error removing token:', error);
    return false;
  }
}

// ── Get All Push Tokens for a User ────────────────────────────
export async function getUserPushTokens(userId: string): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('push_token')
      .eq('id', userId)
      .not('push_token', 'is', null);

    if (error) {
      console.error('[PushNotifications] Failed to get tokens:', error);
      return [];
    }

    return (data || []).map((row) => row.push_token).filter(Boolean);
  } catch (error) {
    console.error('[PushNotifications] Unexpected error getting tokens:', error);
    return [];
  }
}

// ── Setup Listeners ───────────────────────────────────────────
export function setupNotificationListeners(
  onTokenRefresh?: (token: string) => void,
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationTapped?: (response: Notifications.NotificationResponse) => void
): NotificationListener {
  const tokenRefreshListener = Notifications.addPushTokenListener((newToken) => {
    const tokenString = typeof newToken === 'string' ? newToken : newToken.data;
    onTokenRefresh?.(tokenString);
  });

  // Notification received while app is in foreground
  const receivedListener = Notifications.addNotificationReceivedListener((notification) => {
    console.log('[PushNotifications] Foreground notification:', notification.request.content);
    onNotificationReceived?.(notification);
  });

  // User tapped notification (opens app from background/closed)
  const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data;
    console.log('[PushNotifications] Notification tapped:', data);
    onNotificationTapped?.(response);
  });

  return {
    received: receivedListener,
    response: responseListener,
    tokenRefresh: tokenRefreshListener,
  };
}

// ── Cleanup Listeners ─────────────────────────────────────────
export function cleanupNotificationListeners(listeners: NotificationListener): void {
  listeners.received.remove();
  listeners.response.remove();
  listeners.tokenRefresh.remove();
}

// ── Send Push via Edge Function ───────────────────────────────
export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.log('[PushNotifications] Supabase not configured, skipping push');
    return false;
  }

  try {
    const { data: result, error } = await supabase.functions.invoke('send-push', {
      body: { userId, title, body, data },
    });

    if (error) {
      console.error('[PushNotifications] Edge function error:', error);
      return false;
    }

    return result?.success ?? false;
  } catch (error) {
    console.error('[PushNotifications] Failed to invoke send-push:', error);
    return false;
  }
}

// ── Send Push to Multiple Users ───────────────────────────────
export async function sendPushToMultipleUsers(
  userIds: string[],
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { data: result, error } = await supabase.functions.invoke('send-push', {
      body: { userIds, title, body, data },
    });

    if (error) {
      console.error('[PushNotifications] Edge function error:', error);
      return false;
    }

    return result?.success ?? false;
  } catch (error) {
    console.error('[PushNotifications] Failed to invoke send-push:', error);
    return false;
  }
}
