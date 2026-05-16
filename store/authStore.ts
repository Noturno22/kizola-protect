/**
 * Zustand auth store with expo-secure-store persistence.
 * Keeps the phone number in state between the login and verify screens.
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

// Keys used for SecureStore
const PHONE_KEY = 'kizola_pending_phone';

interface AuthStore {
  /** Phone being verified (shared between login → verify screens) */
  pendingPhone: string;
  /** Whether a code send or verify operation is in progress */
  isLoading: boolean;
  /** Last error message to display in UI */
  error: string | null;

  // Actions
  setPendingPhone: (phone: string) => void;
  clearPendingPhone: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  /** Persist phone to SecureStore so it survives an app restart mid-flow */
  savePendingPhone: (phone: string) => Promise<void>;
  /** Restore phone from SecureStore on app start */
  restorePendingPhone: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  pendingPhone: '',
  isLoading: false,
  error: null,

  setPendingPhone: (phone) => set({ pendingPhone: phone }),
  clearPendingPhone: () => set({ pendingPhone: '' }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  savePendingPhone: async (phone) => {
    set({ pendingPhone: phone });
    try {
      await SecureStore.setItemAsync(PHONE_KEY, phone);
    } catch (e) {
      // SecureStore may not be available in all environments; degrade gracefully
      if (__DEV__) console.warn('[AuthStore] SecureStore save failed:', e);
    }
  },

  restorePendingPhone: async () => {
    try {
      const stored = await SecureStore.getItemAsync(PHONE_KEY);
      if (stored) set({ pendingPhone: stored });
    } catch (e) {
      if (__DEV__) console.warn('[AuthStore] SecureStore restore failed:', e);
    }
  },
}));
