import { renderHook } from '@testing-library/react-native';
import { useRBAC } from '@/hooks/useRBAC';

// ── Mock AuthProvider ─────────────────────────────────────────────────────────

const mockUser = { role: undefined as string | undefined };

jest.mock('@/providers/AuthProvider', () => ({
  useAuth: () => ({ user: mockUser }),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function setUserRole(role: string | undefined) {
  mockUser.role = role;
}

function getRBAC() {
  const { result } = renderHook(() => useRBAC());
  return result.current;
}

// ── isAdmin ───────────────────────────────────────────────────────────────────

describe('isAdmin', () => {
  it('returns true when user is admin', () => {
    setUserRole('admin');
    expect(getRBAC().isAdmin()).toBe(true);
  });

  it('returns true when user is super_admin (higher rank)', () => {
    setUserRole('super_admin');
    expect(getRBAC().isAdmin()).toBe(true);
  });

  it('returns false when user is finance', () => {
    setUserRole('finance');
    expect(getRBAC().isAdmin()).toBe(false);
  });

  it('returns false when user is support', () => {
    setUserRole('support');
    expect(getRBAC().isAdmin()).toBe(false);
  });

  it('returns false when user is viewer', () => {
    setUserRole('viewer');
    expect(getRBAC().isAdmin()).toBe(false);
  });

  it('returns false when user is basic user', () => {
    setUserRole('user');
    expect(getRBAC().isAdmin()).toBe(false);
  });
});

// ── isSupport ─────────────────────────────────────────────────────────────────

describe('isSupport', () => {
  it('returns true when user is support', () => {
    setUserRole('support');
    expect(getRBAC().isSupport()).toBe(true);
  });

  it('returns true when user is finance (higher rank)', () => {
    setUserRole('finance');
    expect(getRBAC().isSupport()).toBe(true);
  });

  it('returns true when user is admin (higher rank)', () => {
    setUserRole('admin');
    expect(getRBAC().isSupport()).toBe(true);
  });

  it('returns true when user is super_admin (highest rank)', () => {
    setUserRole('super_admin');
    expect(getRBAC().isSupport()).toBe(true);
  });

  it('returns false when user is viewer (lower rank)', () => {
    setUserRole('viewer');
    expect(getRBAC().isSupport()).toBe(false);
  });

  it('returns false when user is basic user', () => {
    setUserRole('user');
    expect(getRBAC().isSupport()).toBe(false);
  });
});

// ── isFinance ─────────────────────────────────────────────────────────────────

describe('isFinance', () => {
  it('returns true when user is finance', () => {
    setUserRole('finance');
    expect(getRBAC().isFinance()).toBe(true);
  });

  it('returns true when user is admin (higher rank)', () => {
    setUserRole('admin');
    expect(getRBAC().isFinance()).toBe(true);
  });

  it('returns true when user is super_admin (higher rank)', () => {
    setUserRole('super_admin');
    expect(getRBAC().isFinance()).toBe(true);
  });

  it('returns false when user is support (lower rank)', () => {
    setUserRole('support');
    expect(getRBAC().isFinance()).toBe(false);
  });

  it('returns false when user is viewer', () => {
    setUserRole('viewer');
    expect(getRBAC().isFinance()).toBe(false);
  });

  it('returns false when user is basic user', () => {
    setUserRole('user');
    expect(getRBAC().isFinance()).toBe(false);
  });
});

// ── isViewer ──────────────────────────────────────────────────────────────────

describe('isViewer', () => {
  it('returns true when user is viewer', () => {
    setUserRole('viewer');
    expect(getRBAC().isViewer()).toBe(true);
  });

  it('returns true when user is support (higher rank)', () => {
    setUserRole('support');
    expect(getRBAC().isViewer()).toBe(true);
  });

  it('returns true when user is finance (higher rank)', () => {
    setUserRole('finance');
    expect(getRBAC().isViewer()).toBe(true);
  });

  it('returns true when user is admin (higher rank)', () => {
    setUserRole('admin');
    expect(getRBAC().isViewer()).toBe(true);
  });

  it('returns true when user is super_admin (higher rank)', () => {
    setUserRole('super_admin');
    expect(getRBAC().isViewer()).toBe(true);
  });

  it('returns false when user is basic user (lower rank)', () => {
    setUserRole('user');
    expect(getRBAC().isViewer()).toBe(false);
  });
});

// ── hasRole ───────────────────────────────────────────────────────────────────

describe('hasRole', () => {
  it('returns false for null/undefined user role', () => {
    setUserRole(undefined);
    expect(getRBAC().hasRole('user')).toBe(false);
  });

  it('returns true when user role equals required role', () => {
    setUserRole('support');
    expect(getRBAC().hasRole('support')).toBe(true);
  });

  it('returns true when user role is higher than required', () => {
    setUserRole('admin');
    expect(getRBAC().hasRole('support')).toBe(true);
  });

  it('returns false when user role is lower than required', () => {
    setUserRole('viewer');
    expect(getRBAC().hasRole('support')).toBe(false);
  });
});

// ── hasAnyRole ────────────────────────────────────────────────────────────────

describe('hasAnyRole', () => {
  it('returns false for undefined role', () => {
    setUserRole(undefined);
    expect(getRBAC().hasAnyRole(['admin', 'support'])).toBe(false);
  });

  it('returns true when role matches one of the required', () => {
    setUserRole('finance');
    expect(getRBAC().hasAnyRole(['admin', 'finance'])).toBe(true);
  });

  it('returns true when role is higher than one of the required', () => {
    setUserRole('super_admin');
    expect(getRBAC().hasAnyRole(['admin', 'support'])).toBe(true);
  });

  it('returns false when role is lower than all required', () => {
    setUserRole('user');
    expect(getRBAC().hasAnyRole(['admin', 'finance', 'support'])).toBe(false);
  });
});

// ── Edge cases ────────────────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles null user gracefully', () => {
    setUserRole(undefined);
    const rbac = getRBAC();
    expect(rbac.isAdmin()).toBe(false);
    expect(rbac.isSupport()).toBe(false);
    expect(rbac.isFinance()).toBe(false);
    expect(rbac.isViewer()).toBe(false);
    expect(rbac.isSuperAdmin()).toBe(false);
    expect(rbac.canAccessAdminPanel()).toBe(false);
    expect(rbac.canDeleteData()).toBe(false);
  });

  it('isSuperAdmin returns true only for super_admin', () => {
    setUserRole('super_admin');
    expect(getRBAC().isSuperAdmin()).toBe(true);
    setUserRole('admin');
    expect(getRBAC().isSuperAdmin()).toBe(false);
  });

  it('user role of type "user" gets no special permissions', () => {
    setUserRole('user');
    const rbac = getRBAC();
    expect(rbac.canAccessAdminPanel()).toBe(false);
    expect(rbac.canManageUsers()).toBe(false);
    expect(rbac.canViewFinance()).toBe(false);
    expect(rbac.canManageSupport()).toBe(false);
    expect(rbac.canViewAuditLogs()).toBe(false);
    expect(rbac.canExportReports()).toBe(false);
    expect(rbac.canManageSubscriptions()).toBe(false);
    expect(rbac.canViewAllCases()).toBe(false);
    expect(rbac.canDeleteData()).toBe(false);
  });
});
