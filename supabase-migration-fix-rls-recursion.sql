-- ============================================================
-- KIZOLA PROTECT — Fix infinite recursion in profiles RLS
-- Date: 2026-07-12
-- Problem: RBAC policies on `profiles` query `profiles` from
--          within themselves, causing infinite recursion.
--          e.g. EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() ...)
--
-- Fix: Replace recursive subqueries with has_role() which is
--      SECURITY DEFINER and bypasses RLS.
-- ============================================================

-- ─── Ensure has_role function exists (SECURITY DEFINER) ──────
CREATE OR REPLACE FUNCTION has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM profiles WHERE id = auth.uid();
  IF user_role IS NULL THEN
    RETURN FALSE;
  END IF;
  CASE required_role
    WHEN 'super_admin' THEN RETURN user_role = 'super_admin';
    WHEN 'admin' THEN RETURN user_role IN ('super_admin', 'admin');
    WHEN 'finance' THEN RETURN user_role IN ('super_admin', 'admin', 'finance');
    WHEN 'support' THEN RETURN user_role IN ('super_admin', 'admin', 'support');
    WHEN 'viewer' THEN RETURN user_role IN ('super_admin', 'admin', 'finance', 'support', 'viewer');
    ELSE RETURN FALSE;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── Drop ALL existing RBAC policies (the recursive ones) ───
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Support can view profiles for support" ON profiles;
DROP POLICY IF EXISTS "Finance can view profiles for finance" ON profiles;
DROP POLICY IF EXISTS "Viewer can view profiles" ON profiles;
DROP POLICY IF EXISTS "Only super_admin can delete profiles" ON profiles;

-- ─── Recreate RBAC policies using has_role() ────────────────
-- has_role() is SECURITY DEFINER, so it bypasses RLS and does
-- NOT trigger recursive policy evaluation on `profiles`.

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (has_role('admin'));

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (has_role('admin'));

CREATE POLICY "Support can view profiles for support"
  ON profiles FOR SELECT
  USING (has_role('support'));

CREATE POLICY "Finance can view profiles for finance"
  ON profiles FOR SELECT
  USING (has_role('finance'));

CREATE POLICY "Viewer can view profiles"
  ON profiles FOR SELECT
  USING (has_role('viewer'));

CREATE POLICY "Only super_admin can delete profiles"
  ON profiles FOR DELETE
  USING (has_role('super_admin'));

-- ─── Also fix RBAC policies on documents (same pattern) ──────
DROP POLICY IF EXISTS "Admins can view all documents" ON documents;
CREATE POLICY "Admins can view all documents"
  ON documents FOR SELECT
  USING (has_role('admin'));

DROP POLICY IF EXISTS "Support can view documents for their users" ON documents;
CREATE POLICY "Support can view documents for their users"
  ON documents FOR SELECT
  USING (has_role('support'));

-- ═════════════════════════════════════════════════════════════
-- DONE — All recursive policies replaced with has_role()
-- ═════════════════════════════════════════════════════════════
