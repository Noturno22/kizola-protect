-- ============================================================
-- Cria a função exec_sql para permitir SQL arbitrário via API
-- Necessária para o supabase-admin.js e agents conseguirem
-- executar DDL/DML directamente sem ir ao dashboard.
-- ============================================================
-- A função é declarada como SECURITY DEFINER para correr com
-- permissões elevadas (mesmo chamada com anon key, o corpo
-- usa permissões de quem a definiu — tipicamente o owner).
-- ============================================================

CREATE OR REPLACE FUNCTION exec_sql(query TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  EXECUTE query;
  result := jsonb_build_object('success', true, 'query', query);
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'detail', SQLSTATE
  );
END;
$$;

-- Para queries SELECT que devolvem linhas (usado pelo comando "query")
CREATE OR REPLACE FUNCTION exec_select(query TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  EXECUTE 'SELECT coalesce(json_agg(row_to_json(t)), ''[]''::json) FROM (' || query || ') t' INTO result;
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'detail', SQLSTATE
  );
END;
$$;

-- Para listar tabelas dinamicamente
CREATE OR REPLACE FUNCTION list_tables()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_agg(jsonb_build_object(
    'table_name', t.table_name,
    'column_count', (SELECT count(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t.table_name),
    'row_estimate', (SELECT n_live_tup FROM pg_stat_user_tables WHERE relname = t.table_name)
  ) ORDER BY t.table_name)
  FROM information_schema.tables t
  WHERE table_schema = 'public'
  INTO result;
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- Para inspeccionar colunas de uma tabela
CREATE OR REPLACE FUNCTION inspect_table(table_name TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_agg(jsonb_build_object(
    'column_name', c.column_name,
    'data_type', c.data_type,
    'is_nullable', c.is_nullable,
    'column_default', c.column_default,
    'ordinal_position', c.ordinal_position,
    'max_length', c.character_maximum_length
  ) ORDER BY c.ordinal_position)
  FROM information_schema.columns c
  WHERE c.table_schema = 'public' AND c.table_name = inspect_table.table_name
  INTO result;
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;
