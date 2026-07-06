import { useAuth } from '@/providers/AuthProvider';

type Role = 'user' | 'support' | 'finance' | 'admin' | 'super_admin' | 'viewer';

const ROLE_HIERARCHY: Record<Role, number> = {
  user: 0,
  viewer: 1,
  support: 2,
  finance: 3,
  admin: 4,
  super_admin: 5,
};

export function useRBAC() {
  const { user } = useAuth();

  const hasRole = (requiredRole: Role): boolean => {
    if (!user?.role) return false;
    return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[requiredRole];
  };

  const hasAnyRole = (roles: Role[]): boolean => {
    if (!user?.role) return false;
    return roles.some(role => hasRole(role));
  };

  const isSuperAdmin = () => hasRole('super_admin');
  const isAdmin = () => hasRole('admin');
  const isFinance = () => hasRole('finance');
  const isSupport = () => hasRole('support');
  const isViewer = () => hasRole('viewer');

  const canAccessAdminPanel = () => hasRole('admin');
  const canManageUsers = () => hasRole('admin');
  const canViewFinance = () => hasRole('finance');
  const canManageSupport = () => hasRole('support');
  const canViewAuditLogs = () => hasRole('support');
  const canExportReports = () => hasRole('finance');
  const canManageSubscriptions = () => hasRole('finance');
  const canViewAllCases = () => hasRole('support');
  const canDeleteData = () => hasRole('super_admin');

  return {
    userRole: user?.role as Role | undefined,
    hasRole,
    hasAnyRole,
    isSuperAdmin,
    isAdmin,
    isFinance,
    isSupport,
    isViewer,
    canAccessAdminPanel,
    canManageUsers,
    canViewFinance,
    canManageSupport,
    canViewAuditLogs,
    canExportReports,
    canManageSubscriptions,
    canViewAllCases,
    canDeleteData,
  };
}