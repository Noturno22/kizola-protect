import { useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';

/**
 * Sits inside AuthProvider and fires onReady once auth loading completes.
 * Used by _layout.tsx to know when to dismiss the splash screen.
 */
export function AuthReadyMarker({ onReady }: { onReady: () => void }) {
  const { loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      onReady();
    }
  }, [loading, onReady]);

  return null;
}
