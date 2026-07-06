-- ============================================================
-- KIZOLA PROTECT — Fase 4 SQL Migrations
-- Data: 2026-06-07
-- Descrição: Novas tabelas para Housing, Finance, Satisfação,
--            Auditoria, RBAC e melhorias de segurança
-- ============================================================

-- ─── 1. AUTH AUDIT LOGS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS auth_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  -- Possíveis valores: login, logout, password_reset_requested, 
  -- password_reset_completed, plan_change, data_update, 
  -- data_delete, admin_action, profile_created
  resource TEXT,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_user_id ON auth_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_action ON auth_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_created_at ON auth_audit_logs(created_at DESC);

ALTER TABLE auth_audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins podem ver todos os logs
CREATE POLICY "Admins can view all audit logs"
  ON auth_audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Sistema pode inserir logs (service role)
CREATE POLICY "Service role can insert audit logs"
  ON auth_audit_logs FOR INSERT
  WITH CHECK (true);

-- ─── 2. APOIO À HABITAÇÃO ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS housing_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  estado TEXT NOT NULL,           -- Estado/Província/Região
  cidade TEXT NOT NULL,           -- Cidade
  situacao_atual TEXT NOT NULL,   -- Situação habitacional atual
  necessidade TEXT NOT NULL,      -- Tipo de necessidade
  -- Opções: rental_search, shelter_move, housing_program, tenant_rights, emergency
  observacoes TEXT,               -- Informações adicionais
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'resolved', 'cancelled')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_housing_requests_user_id ON housing_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_housing_requests_status ON housing_requests(status);
CREATE INDEX IF NOT EXISTS idx_housing_requests_created_at ON housing_requests(created_at DESC);

ALTER TABLE housing_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own housing requests"
  ON housing_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own housing requests"
  ON housing_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own housing requests"
  ON housing_requests FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all housing requests"
  ON housing_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin', 'support')
    )
  );

CREATE POLICY "Admins can update housing requests"
  ON housing_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin', 'support')
    )
  );

-- ─── 3. AJUDA ÀS FINANÇAS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS finance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT,
  tipo_ajuda TEXT NOT NULL,
  -- Opções: ebt, state_benefits, tax_return, financial_planning, 
  --         debt_help, banking, other
  estado TEXT NOT NULL,
  descricao TEXT NOT NULL,
  observacoes TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'resolved', 'cancelled')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_finance_requests_user_id ON finance_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_finance_requests_status ON finance_requests(status);
CREATE INDEX IF NOT EXISTS idx_finance_requests_created_at ON finance_requests(created_at DESC);

ALTER TABLE finance_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own finance requests"
  ON finance_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own finance requests"
  ON finance_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all finance requests"
  ON finance_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin', 'support', 'finance')
    )
  );

CREATE POLICY "Admins can update finance requests"
  ON finance_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin', 'support', 'finance')
    )
  );

-- ─── 4. SATISFAÇÃO PÓS-ATENDIMENTO ───────────────────────────
CREATE TABLE IF NOT EXISTS satisfaction_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Referência ao pedido que foi encerrado (suporte, habitação ou finanças)
  request_type TEXT NOT NULL CHECK (request_type IN ('support', 'housing', 'finance')),
  request_id UUID NOT NULL,
  resolved BOOLEAN NOT NULL,
  problem_persists BOOLEAN,
  what_wasnt_resolved TEXT,
  additional_comments TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_satisfaction_ratings_user_id ON satisfaction_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_satisfaction_ratings_request_id ON satisfaction_ratings(request_id);
CREATE INDEX IF NOT EXISTS idx_satisfaction_ratings_resolved ON satisfaction_ratings(resolved);
CREATE INDEX IF NOT EXISTS idx_satisfaction_ratings_created_at ON satisfaction_ratings(created_at DESC);

ALTER TABLE satisfaction_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own satisfaction ratings"
  ON satisfaction_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own satisfaction ratings"
  ON satisfaction_ratings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all satisfaction ratings"
  ON satisfaction_ratings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin', 'support')
    )
  );

-- ─── 5. RBAC — ATUALIZAR ROLES NA TABELA PROFILES ────────────
-- Adicionar suporte a novos roles
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('user', 'support', 'finance', 'admin', 'super_admin', 'viewer'));

-- ─── 5.1. RLS POLICIES PARA TABELAS SENSÍVEIS ─────────────────
-- Perfis - apenas admins podem ver todos
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'super_admin')
    )
  );

-- Admins podem atualizar qualquer perfil
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'super_admin')
    )
  );

-- Support pode ver perfis para suporte
CREATE POLICY "Support can view profiles for support"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('support', 'admin', 'super_admin')
    )
  );

-- Finance pode ver perfis para financeiro
CREATE POLICY "Finance can view profiles for finance"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('finance', 'admin', 'super_admin')
    )
  );

-- Viewer pode apenas ver perfis (sem dados sensíveis)
CREATE POLICY "Viewer can view profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('viewer', 'support', 'finance', 'admin', 'super_admin')
    )
  );

-- Subscriptions - políticas baseadas em role
CREATE POLICY "Admins can view all subscriptions"
  ON subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Support can view subscriptions for support"
  ON subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('support', 'admin', 'super_admin')
    )
  );

CREATE POLICY "Finance can view all subscriptions"
  ON subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('finance', 'admin', 'super_admin')
    )
  );

CREATE POLICY "Viewer can view subscriptions"
  ON subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('viewer', 'support', 'finance', 'admin', 'super_admin')
    )
  );

-- Support Requests - políticas baseadas em role
CREATE POLICY "Support can view all support requests"
  ON support_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('support', 'admin', 'super_admin')
    )
  );

CREATE POLICY "Support can update support requests"
  ON support_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('support', 'admin', 'super_admin')
    )
  );

-- Notifications - políticas baseadas em role
CREATE POLICY "Admins can view all notifications"
  ON notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Support can view notifications for their users"
  ON notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('support', 'admin', 'super_admin')
    )
  );

-- Documents - políticas baseadas em role (DROP primeiro para ser re-executável)
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

-- ─── 5.2. FUNÇÃO PARA VERIFICAR PERMISSÕES ────────────────────
CREATE OR REPLACE FUNCTION has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM profiles WHERE id = auth.uid();
  
  IF user_role IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Hierarquia de roles: super_admin > admin > finance/support > viewer > user
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

-- ─── 5.3. POLÍTICAS DE SEGURANÇA ADICIONAIS ───────────────────
-- Impedir exclusão de usuários com assinaturas ativas
CREATE POLICY "Prevent deletion of users with active subscriptions"
  ON profiles FOR DELETE
  USING (
    NOT EXISTS (
      SELECT 1 FROM subscriptions s
      WHERE s.user_id = profiles.id
      AND s.status = 'active'
    )
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'super_admin'
    )
  );

-- Apenas super_admin pode deletar perfis
CREATE POLICY "Only super_admin can delete profiles"
  ON profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'super_admin'
    )
  );

-- ─── 6. ÍNDICES DE PERFORMANCE NAS TABELAS EXISTENTES ─────────
-- Support Requests
CREATE INDEX IF NOT EXISTS idx_support_requests_status ON support_requests(status);
CREATE INDEX IF NOT EXISTS idx_support_requests_user_id ON support_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_support_requests_created_at ON support_requests(created_at DESC);

-- Subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- ─── 7. TRIGGER — ATUALIZAR updated_at AUTOMATICAMENTE ────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_housing_requests_updated_at
  BEFORE UPDATE ON housing_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_finance_requests_updated_at
  BEFORE UPDATE ON finance_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ─── 8. FUNÇÃO ANALYTICS — TAXA DE SATISFAÇÃO ─────────────────
CREATE OR REPLACE FUNCTION get_satisfaction_rate(
  start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE(
  total_ratings BIGINT,
  resolved_count BIGINT,
  unresolved_count BIGINT,
  satisfaction_rate NUMERIC,
  avg_rating NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) AS total_ratings,
    COUNT(*) FILTER (WHERE resolved = true) AS resolved_count,
    COUNT(*) FILTER (WHERE resolved = false) AS unresolved_count,
    ROUND(
      COUNT(*) FILTER (WHERE resolved = true)::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2
    ) AS satisfaction_rate,
    ROUND(AVG(rating), 2) AS avg_rating
  FROM satisfaction_ratings
  WHERE created_at BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 9. VISTA ADMIN — CASOS UNIFICADOS ────────────────────────
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

-- ─── 10. INSERIR DADOS DE TESTE (APENAS DEV) ──────────────────
-- Descomentar apenas em ambiente de desenvolvimento
/*
INSERT INTO housing_requests (user_id, nome, email, estado, cidade, situacao_atual, necessidade, observacoes)
VALUES (
  auth.uid(),
  'Utilizador Teste',
  'teste@kizola.com',
  'New York',
  'New York City',
  'Sem habitação estável, a viver em abrigo temporário',
  'shelter_move',
  'Família com 2 crianças, necessita de habitação urgente'
);
*/

-- ─── FIM DAS MIGRAÇÕES FASE 4 ─────────────────────────────────
-- Para executar: copie e cole no SQL Editor do Supabase
-- ou use: supabase db push (se tiver Supabase CLI configurado)
