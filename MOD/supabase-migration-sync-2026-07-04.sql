-- ============================================================
-- KIZOLA PROTECT — Migração Sync Completa
-- Data: 2026-07-04
-- Descrição: Alinha a base de dados com o código do projecto.
--            Adiciona colunas, RLS policies, triggers, índices
--            e RBAC que estavam em falta.
-- ============================================================
-- Este ficheiro é IDEMPOTENTE (pode ser corrido多次).
-- ============================================================

-- ═══════════════════════════════════════════════════════════════
-- 1. PROFILES — Coluna `plan` em falta
-- ═══════════════════════════════════════════════════════════════
-- O código (register.tsx, services/auth.ts, lib/supabase.ts)
-- espera uma coluna `plan` em profiles. A BD não a tem.
-- A coluna foi removida numa migração anterior (posição 5 vazia).

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'none';

-- NOTA: a coluna é adicionada sem CHECK constraint para evitar
-- conflitos com valores existentes. A validação é feita no código.

-- ═══════════════════════════════════════════════════════════════
-- 2. RLS POLICIES EM FALTA
-- ═══════════════════════════════════════════════════════════════

-- ─── 2.1 SUPPORT REQUESTS ─────────────────────────────────────
-- O código permite que utilizadores criem, vejam e actualizem
-- os seus próprios pedidos de suporte.

DROP POLICY IF EXISTS "Users can create their own support requests" ON support_requests;
CREATE POLICY "Users can create their own support requests"
  ON support_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own support requests" ON support_requests;
CREATE POLICY "Users can view their own support requests"
  ON support_requests FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own support requests" ON support_requests;
CREATE POLICY "Users can update their own support requests"
  ON support_requests FOR UPDATE
  USING (auth.uid() = user_id);

-- ─── 2.2 NOTIFICATIONS ────────────────────────────────────────
-- O código insere notificações via frontend (AuthProvider) e
-- os utilizadores precisam de ver as suas próprias notificações.

DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ─── 2.3 SUBSCRIPTIONS — UPDATE ───────────────────────────────
-- O código (AuthProvider) actualiza subscriptions.

DROP POLICY IF EXISTS "Users can update their own subscriptions" ON subscriptions;
CREATE POLICY "Users can update their own subscriptions"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- ─── 2.4 PROFILES — RBAC POLICIES ─────────────────────────────
-- Estas políticas permitem que admins/support/finance/viewer
-- vejam perfis de outros utilizadores (necessário para o admin panel).

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Support can view profiles for support" ON profiles;
CREATE POLICY "Support can view profiles for support"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('support', 'admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Finance can view profiles for finance" ON profiles;
CREATE POLICY "Finance can view profiles for finance"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('finance', 'admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Viewer can view profiles" ON profiles;
CREATE POLICY "Viewer can view profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('viewer', 'support', 'finance', 'admin', 'super_admin')
    )
  );

-- Apenas super_admin pode remover perfis
DROP POLICY IF EXISTS "Only super_admin can delete profiles" ON profiles;
CREATE POLICY "Only super_admin can delete profiles"
  ON profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'super_admin'
    )
  );

-- ═══════════════════════════════════════════════════════════════
-- 3. TRIGGER — updated_at para support_requests
-- ═══════════════════════════════════════════════════════════════
-- A tabela support_requests tem coluna updated_at mas faltava-lhe
-- o trigger automático (ao contrário de housing e finance).

DROP TRIGGER IF EXISTS update_support_requests_updated_at ON support_requests;
CREATE TRIGGER update_support_requests_updated_at
  BEFORE UPDATE ON support_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════
-- 4. VIEWS
-- ═══════════════════════════════════════════════════════════════
-- Garantir que a view admin_cases_overview existe

CREATE OR REPLACE VIEW admin_cases_overview AS
SELECT 
  'support' AS case_type,
  id,
  user_id,
  status,
  category AS sub_type,
  priority,
  created_at,
  updated_at,
  message AS description
FROM support_requests

UNION ALL

SELECT 
  'housing' AS case_type,
  id,
  user_id,
  status,
  necessidade AS sub_type,
  'medium' AS priority,
  created_at,
  updated_at,
  observacoes AS description
FROM housing_requests

UNION ALL

SELECT 
  'finance' AS case_type,
  id,
  user_id,
  status,
  tipo_ajuda AS sub_type,
  'medium' AS priority,
  created_at,
  updated_at,
  descricao AS description
FROM finance_requests;

-- ═══════════════════════════════════════════════════════════════
-- 5. FUNÇÕES ÚTEIS (caso não existam)
-- ═══════════════════════════════════════════════════════════════

-- Função has_role
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

-- ═══════════════════════════════════════════════════════════════
-- 6. ÍNDICES EM FALTA
-- ═══════════════════════════════════════════════════════════════

-- Índices para support_requests (já criados pela phase4, mas
-- IF NOT EXISTS garante que são seguros de re-correr)
CREATE INDEX IF NOT EXISTS idx_support_requests_status ON support_requests(status);
CREATE INDEX IF NOT EXISTS idx_support_requests_user_id ON support_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_support_requests_created_at ON support_requests(created_at DESC);

-- Índices para subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Índices para notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Índice para profiles policy_number
CREATE INDEX IF NOT EXISTS idx_profiles_policy_number ON profiles(policy_number);
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON profiles(plan);

-- ═══════════════════════════════════════════════════════════════
-- 7. VERIFICAÇÃO DE INTEGRIDADE
-- ═══════════════════════════════════════════════════════════════
-- Adicionar CHECK constraints onde faz sentido (idempotente)

-- Garantir que o CHECK de role inclui todos os valores do código
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('user', 'support', 'finance', 'admin', 'super_admin', 'viewer'));

-- ═══════════════════════════════════════════════════════════════
-- 8. DOCUMENTS — GARANTIR POLICIES
-- ═══════════════════════════════════════════════════════════════
-- As policies de documents já devem existir da migração anterior,
-- mas vamos garantir que as de admin/support também estão.

DROP POLICY IF EXISTS "Admins can view all documents" ON documents;
CREATE POLICY "Admins can view all documents"
  ON documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Support can view documents for their users" ON documents;
CREATE POLICY "Support can view documents for their users"
  ON documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('support', 'admin', 'super_admin')
    )
  );

-- ═══════════════════════════════════════════════════════════════
-- FIM — Todas as alterações aplicadas
-- ═══════════════════════════════════════════════════════════════
