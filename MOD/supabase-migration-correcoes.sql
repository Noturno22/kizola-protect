-- ============================================================
-- KIZOLA PROTECT — Correções de Schema
-- Data: 2026-06-18
-- Descrição: Adiciona colunas em falta nas tabelas existentes
-- Identificadas pela análise do código vs AGENTS.md
-- ============================================================

-- ─── 1. SUPPORT REQUESTS ──────────────────────────────────────
-- Colunas em falta: name, email, updated_at
-- (usadas em app/(app)/support.tsx:117-124 e lib/supabase.ts:55-66)

ALTER TABLE support_requests
ADD COLUMN IF NOT EXISTS name TEXT;

ALTER TABLE support_requests
ADD COLUMN IF NOT EXISTS email TEXT;

ALTER TABLE support_requests
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- ─── 2. NOTIFICATIONS ─────────────────────────────────────────
-- Coluna em falta: type
-- (definida em lib/supabase.ts:84 como 'info' | 'success' | 'warning' | 'alert')

ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'info';

-- ─── 3. RLS POLICIES EM FALTA PARA TABELA PROFILES ──────────────
-- O erro 42501 acontece porque não há políticas que permitam a um
-- utilizador com role='user' (ou sem perfil) inserir/ler/actualizar
-- o seu próprio registo na tabela profiles.

-- Permite que qualquer utilizador autenticado INSIRA o seu próprio perfil
-- (necessário para a auto-criação de perfil após o registo)
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Permite que qualquer utilizador autenticado LEIA o seu próprio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Permite que qualquer utilizador autenticado ACTUALIZE o seu próprio perfil
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
