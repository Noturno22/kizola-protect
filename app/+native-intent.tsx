export function redirectSystemPath({
  path,
  initial,
}: { path: string; initial: boolean }) {
  // Allow password reset deep links to reach the reset-password screen
  if (path.startsWith('/reset-password')) {
    return path;
  }
  // Allow other public routes that don't require authentication
  const publicPaths = ['/forgot-password', '/login', '/register', '/onboarding', '/(auth)'];
  if (publicPaths.some(p => path === p || path.startsWith(`${p}/`))) {
    return path;
  }
  return '/';
}