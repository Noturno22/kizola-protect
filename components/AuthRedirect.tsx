import { useEffect } from 'react';
import { usePathname, useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';

/** Rotas de login/registro: usuário logado não deve permanecer aqui. */
const AUTH_ROUTE_PREFIXES = ['/login', '/register', '/login-phone', '/auth', '/onboarding', '/(auth)', '/forgot-password', '/reset-password'] as const;

function isPublicAuthPath(pathname: string) {
  return AUTH_ROUTE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Observa pathname + estado de auth e força saída de telas públicas quando já autenticado.
 * Cobre corrida entre Supabase/React e `router.replace` em telas isoladas.
 */
export function AuthRedirect() {
  const { session, user, loading, isDemoMode } = useAuth();
  const pathname = usePathname() ?? '';
  const router = useRouter();

  const isAuthenticated = Boolean(session ?? (isDemoMode && user));

  useEffect(() => {
    if (loading || !isAuthenticated || !pathname) return;
    if (!isPublicAuthPath(pathname)) return;

    const dest = '/dashboard';
    router.replace(dest);
  }, [loading, isAuthenticated, user?.plan, pathname, router]);

  return null;
}
