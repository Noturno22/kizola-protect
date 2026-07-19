import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import * as SecureStore from 'expo-secure-store';
import { File } from 'expo-file-system';
import type { SessionManager } from './useSessionManager';

const DEMO_MODE_KEY = 'kizola_demo_user';

export type UserPlanManager = ReturnType<typeof useUserPlan>;

export function useUserPlan(ctx: { sessionManager: SessionManager }) {
  const { session, user, isDemoMode, fetchUserProfile, setUser } = ctx.sessionManager;

  const updateUserPlan = useCallback(async (plan: 'free' | 'basic' | 'pro' | 'premium') => {
    const now = new Date();
    const nextBilling = new Date(now);
    nextBilling.setMonth(nextBilling.getMonth() + 1);

    if (isDemoMode && user) {
      const updatedUser = { ...user, plan, status: 'active' as const };
      await SecureStore.setItemAsync(DEMO_MODE_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser as any);

      const demoNotif = {
        id: 'sub-' + Date.now(),
        user_id: user.id,
        title: 'notifPlanActivatedTitle',
        message: 'notifPlanActivatedMessage',
        type: 'success' as const,
        read: false,
        created_at: new Date().toISOString(),
        metadata: { plan: plan.toUpperCase() },
      };
      const existingNotifs = await SecureStore.getItemAsync(`kizola_notifications_${user.id}`);
      const parsedNotifs = existingNotifs ? JSON.parse(existingNotifs) : [];
      await SecureStore.setItemAsync(
        `kizola_notifications_${user.id}`,
        JSON.stringify([demoNotif, ...parsedNotifs]),
      );
      return;
    }

    if (!session?.user) throw new Error('No session found. Please log in.');

    const { error: subError } = await supabase.from('subscriptions').insert({
      user_id: session.user.id,
      plan_id: plan,
      status: 'active',
      start_date: now.toISOString(),
      next_billing_date: nextBilling.toISOString(),
    });

    if (subError) throw subError;

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ status: 'active' })
      .eq('id', session.user.id);

    if (profileError) {
      console.error('Error updating profile status:', profileError);
    }

    try {
      await supabase.from('notifications').insert({
        user_id: session.user.id,
        title: 'notifPlanActivatedTitle',
        message: 'notifPlanActivatedMessage',
        type: 'success',
        read: false,
      });
    } catch (notifError) {
      console.error('[Auth] Failed to trigger subscription notification:', notifError);
    }

    await fetchUserProfile(session.user.id);
  }, [session, user, isDemoMode, fetchUserProfile, setUser]);

  const updateAvatar = useCallback(async (localUri: string) => {
    if (isDemoMode && user) {
      const updatedUser = { ...user, avatar_url: localUri };
      await SecureStore.setItemAsync(DEMO_MODE_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser as any);
      return;
    }

    if (!session?.user) throw new Error('No session');

    const userId = session.user.id;

    const file = new File(localUri);
    const arrayBuffer = await file.arrayBuffer();
    const decoded = new Uint8Array(arrayBuffer);

    const ext = localUri.split('.').pop()?.toLowerCase() || 'jpg';
    const contentType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
    const filePath = `${userId}/avatar.${ext}`;

    try {
      const { data: existingFiles } = await supabase.storage
        .from('avatars')
        .list(userId);
      if (existingFiles?.length) {
        const oldPaths = existingFiles.map((f) => `${userId}/${f.name}`);
        await supabase.storage.from('avatars').remove(oldPaths);
      }
    } catch {
      // Cleanup is best-effort — first upload has no old files
    }

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, decoded, { contentType, upsert: true });
    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const publicUrl = urlData.publicUrl;

    const { error: dbError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId);
    if (dbError) throw dbError;

    setUser({ ...user!, avatar_url: publicUrl } as any);
  }, [session, user, isDemoMode, fetchUserProfile, setUser]);

  return { updateUserPlan, updateAvatar };
}
