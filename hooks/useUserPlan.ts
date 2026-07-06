import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import * as SecureStore from 'expo-secure-store';
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
        title: 'Assinatura Ativada! ✨',
        message: `Parabéns! Você agora é um membro ${plan.toUpperCase()}. Seus benefícios já estão disponíveis.`,
        type: 'success' as const,
        read: false,
        created_at: new Date().toISOString(),
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
        title: 'Plano Ativado com Sucesso! ✅',
        message: `Sua assinatura do plano ${plan.toUpperCase()} foi confirmada. Aproveite todos os seus benefícios agora mesmo.`,
        type: 'success',
        read: false,
      });
    } catch (notifError) {
      console.error('[Auth] Failed to trigger subscription notification:', notifError);
    }

    await fetchUserProfile(session.user.id);
  }, [session, user, isDemoMode, fetchUserProfile, setUser]);

  const updateAvatar = useCallback(async (url: string) => {
    if (isDemoMode && user) {
      const updatedUser = { ...user, avatar_url: url };
      await SecureStore.setItemAsync(DEMO_MODE_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser as any);
      return;
    }

    if (!session?.user) throw new Error('No session');

    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: url })
      .eq('id', session.user.id);

    if (error) throw error;
    await fetchUserProfile(session.user.id);
  }, [session, user, isDemoMode, fetchUserProfile, setUser]);

  return { updateUserPlan, updateAvatar };
}
