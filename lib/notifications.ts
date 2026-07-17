import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { sendPushNotification } from '@/services/pushNotifications';
import i18n from '@/lib/i18n';

export async function sendWelcomeNotificationIfNeeded(userId: string): Promise<void> {
  try {
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('created_at')
      .eq('id', userId)
      .gte('created_at', twoMinutesAgo)
      .maybeSingle();

    if (profileError) {
      console.error('[Notifications] Error checking profile:', profileError);
      return;
    }

    if (!profile) return;

    const { error: welcomeError } = await supabase.from('notifications').insert({
      user_id: userId,
      title: i18n.t('notifWelcomeTitle'),
      message: i18n.t('notifWelcomeMessage'),
      type: 'success',
      read: false,
    });

    if (welcomeError) {
      console.error('[Notifications] Failed to send welcome notification:', welcomeError);
    } else if (isSupabaseConfigured()) {
      await sendPushNotification(
        userId,
        i18n.t('notifWelcomeTitle'),
        i18n.t('notifWelcomeMessage'),
        { type: 'success', screen: 'dashboard' }
      );
    }

    const { error: profileNotifError } = await supabase.from('notifications').insert({
      user_id: userId,
      title: i18n.t('notifCompleteProfileTitle'),
      message: i18n.t('notifCompleteProfileMessage'),
      type: 'warning',
      read: false,
    });

    if (profileNotifError) {
      console.error('[Notifications] Failed to send profile notification:', profileNotifError);
    } else if (isSupabaseConfigured()) {
      await sendPushNotification(
        userId,
        i18n.t('notifCompleteProfileTitle'),
        i18n.t('notifCompleteProfileMessage'),
        { type: 'warning', screen: 'profile' }
      );
    }
  } catch (error) {
    console.error('[Notifications] Unexpected error:', error);
  }
}
