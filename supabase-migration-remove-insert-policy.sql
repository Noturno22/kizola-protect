-- ============================================================
-- KIZOLA PROTECT — Remover INSERT policy da tabela profiles
-- Data: 2026-06-27
-- Descrição: Profile creation moved to backend agent with
--            SERVICE_ROLE_KEY. App no longer does direct INSERT.
-- ============================================================

-- Remove INSERT policy (users should not insert directly)
-- Backend agent handles profile creation with SERVICE_ROLE_KEY
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Keep SELECT and UPDATE policies for normal user access
-- "Users can view own profile" — USING (auth.uid() = id)
-- "Users can update own profile" — USING (auth.uid() = id) WITH CHECK (auth.uid() = id)
