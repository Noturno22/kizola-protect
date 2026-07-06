import createContextHook from '@nkzw/create-context-hook';
import { useSessionManager } from '@/hooks/useSessionManager';
import { useSecurity } from '@/hooks/useSecurity';
import { useAuthOperations } from '@/hooks/useAuthOperations';
import { useUserPlan } from '@/hooks/useUserPlan';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const sessionManager = useSessionManager();
  const security = useSecurity({ sessionManager });
  const authOps = useAuthOperations({ sessionManager, security });
  const planManager = useUserPlan({ sessionManager });

  return {
    // State
    session: sessionManager.session,
    user: sessionManager.user,
    loading: sessionManager.loading,
    isDemoMode: sessionManager.isDemoMode,

    // Session
    isSessionExpired: sessionManager.isSessionExpired,
    updateActivity: sessionManager.updateActivity,

    // Auth operations
    signUp: authOps.signUp,
    signIn: authOps.signIn,
    signInWithOtp: authOps.signInWithOtp,
    verifyOtp: authOps.verifyOtp,
    signOut: authOps.signOut,

    // Plan & avatar
    updateUserPlan: planManager.updateUserPlan,
    updateAvatar: planManager.updateAvatar,

    // Security
    isLockedOut: security.isLockedOut,
    lockoutUntil: security.lockoutUntil,
    loginAttempts: security.loginAttempts,
    mfaEnabled: security.mfaEnabled,
    enableMfa: security.enableMfa,
    verifyMfa: security.verifyMfa,
    disableMfa: security.disableMfa,
  };
});
