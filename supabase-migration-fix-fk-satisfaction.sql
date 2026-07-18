-- ============================================================
-- KIZOLA PROTECT — Fix FK relationship satisfaction_ratings → profiles
-- Data: 2026-07-17
-- Descrição: Adiciona foreign key de satisfaction_ratings.user_id
--            para profiles.id, permitindo joins PostgREST como:
--            .select('*, profiles(full_name, email)')
-- Erro: "Could not find a relationship between 'satisfaction_ratings'
--        and 'profiles' in the schema cache"
-- ============================================================

-- 1. Adicionar foreign key constraint
ALTER TABLE satisfaction_ratings
ADD CONSTRAINT fk_satisfaction_ratings_profiles
FOREIGN KEY (user_id) REFERENCES profiles(id)
ON DELETE CASCADE;

-- 2. Criar índice para performance nas queries de join
CREATE INDEX IF NOT EXISTS idx_satisfaction_ratings_user_id
ON satisfaction_ratings(user_id);
