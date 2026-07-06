## Table `profiles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `full_name` | `text` |  Nullable |
| `email` | `text` |  Nullable |
| `phone` | `text` |  Nullable |
| `status` | `text` |  Nullable |
| `created_at` | `timestamp` |  Nullable |
| `role` | `text` |  Nullable |
| `policy_number` | `text` |  Nullable Unique |
| `avatar_url` | `text` |  Nullable |

## Table `support_requests`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  Nullable |
| `category` | `text` |  Nullable |
| `priority` | `text` |  Nullable |
| `message` | `text` |  Nullable |
| `status` | `text` |  Nullable |
| `created_at` | `timestamp` |  Nullable |
| `name` | `text` |  Nullable |
| `email` | `text` |  Nullable |
| `updated_at` | `timestamp` |  Nullable |

## Table `activities`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  Nullable |
| `title` | `text` |  Nullable |
| `description` | `text` |  Nullable |
| `status` | `text` |  Nullable |
| `created_at` | `timestamp` |  Nullable |

## Table `notifications`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  Nullable |
| `title` | `text` |  Nullable |
| `message` | `text` |  Nullable |
| `read` | `bool` |  Nullable |
| `created_at` | `timestamp` |  Nullable |
| `type` | `text` |  Nullable |

## Table `plans`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `text` | Primary |
| `name` | `text` |  Unique |
| `price` | `numeric` |  Nullable |
| `features` | `jsonb` |  Nullable |
| `created_at` | `timestamp` |  Nullable |

## Table `subscriptions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  Nullable |
| `plan_id` | `text` |  Nullable |
| `status` | `text` |  Nullable |
| `start_date` | `timestamp` |  Nullable |
| `end_date` | `timestamp` |  Nullable |
| `created_at` | `timestamp` |  Nullable |
| `next_billing_date` | `timestamptz` |  Nullable |
| `plan` | `text` |  |
| `expires_at` | `timestamptz` |  Nullable |
| `auto_renew` | `bool` |  Nullable |
| `cancelled_at` | `timestamptz` |  Nullable |

## Table `documents`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `name` | `text` |  |
| `file_path` | `text` |  |
| `file_url` | `text` |  Nullable |
| `file_type` | `text` |  |
| `file_size` | `int8` |  |
| `status` | `text` |  |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `auth_audit_logs`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  Nullable |
| `action` | `text` |  |
| `resource` | `text` |  Nullable |
| `details` | `jsonb` |  Nullable |
| `ip_address` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `housing_requests`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `nome` | `text` |  |
| `email` | `text` |  Nullable |
| `telefone` | `text` |  Nullable |
| `estado` | `text` |  |
| `cidade` | `text` |  |
| `situacao_atual` | `text` |  |
| `necessidade` | `text` |  |
| `observacoes` | `text` |  Nullable |
| `status` | `text` |  |
| `assigned_to` | `uuid` |  Nullable |
| `resolved_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `finance_requests`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `nome` | `text` |  |
| `email` | `text` |  Nullable |
| `tipo_ajuda` | `text` |  |
| `estado` | `text` |  |
| `descricao` | `text` |  |
| `observacoes` | `text` |  Nullable |
| `status` | `text` |  |
| `assigned_to` | `uuid` |  Nullable |
| `resolved_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `satisfaction_ratings`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `request_type` | `text` |  |
| `request_id` | `uuid` |  |
| `resolved` | `bool` |  |
| `problem_persists` | `bool` |  Nullable |
| `what_wasnt_resolved` | `text` |  Nullable |
| `additional_comments` | `text` |  Nullable |
| `rating` | `int4` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

mais as notificaçoes são para cada usuario e não no geral

## Supabase Admin CLI

Existe um script (`scripts/supabase-admin.js`) para agents executarem operações
directamente no Supabase **sem precisar do dashboard web**.

### Como usar

```bash
# Listar todas as tabelas
node scripts/supabase-admin.js tables

# Ver schema de uma tabela
node scripts/supabase-admin.js inspect profiles

# Correr query SELECT
node scripts/supabase-admin.js query "SELECT * FROM profiles LIMIT 5"

# Executar DDL/DML (ALTER TABLE, INSERT, UPDATE, DELETE)
node scripts/supabase-admin.js sql "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT"

# Executar migrações SQL
node scripts/supabase-admin.js migrate supabase-migration-correcoes.sql

# Executar todas as migrações pendentes
node scripts/supabase-admin.js migrate:all

# Chamar função RPC
node scripts/supabase-admin.js rpc list_tables

# Ver ajuda completa
node scripts/supabase-admin.js --help
```

### Pré-requisitos

- O Supabase CLI deve estar linked ao projecto (`supabase link` já foi feito)
- As RPC functions (`exec_sql`, `exec_select`, `list_tables`, `inspect_table`)
  foram criadas via `scripts/init-exec-sql.sql`

### Nota para PowerShell

No Windows PowerShell, para passar argumentos JSON ao comando `rpc`, usa `--%`:

```powershell
node --% scripts/supabase-admin.js rpc inspect_table "{\"table_name\":\"profiles\"}"
```
