#!/usr/bin/env node
/**
 * Supabase Admin CLI — Kizola Protect
 * =====================================
 * Executa operações directamente no Supabase usando a service_role_key.
 * Alternativa a ir ao dashboard do Supabase — para agents e devs.
 *
 * Uso: node scripts/supabase-admin.js <comando> [args]
 *
 * Comandos:
 *   sql <query>         – DDL/DML arbitrário (CREATE, ALTER, INSERT, UPDATE, DELETE)
 *   query <sql>         – SELECT e retorna JSON
 *   migrate <arquivo>   – Executa um ficheiro SQL de migração
 *   migrate:all         – Executa todas as migrações SQL pendentes
 *   tables              – Lista todas as tabelas do schema public
 *   inspect <tabela>    – Mostra colunas, tipos e constraints de uma tabela
 *   rpc <fn> [args]     – Chama qualquer função RPC do Supabase
 *   seed <ficheiro>     – Executa um ficheiro de seed data
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

try {
  global.WebSocket = global.WebSocket || require('ws');
} catch {}

const PROJECT_ROOT = path.resolve(__dirname, '..');

// ─── Carregar env ──────────────────────────────────────────────
function loadEnv() {
  const files = [
    path.join(PROJECT_ROOT, 'backend', '.env'),
    path.join(PROJECT_ROOT, '.env.local'),
  ];
  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf-8');
    for (const line of content.split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const eq = t.indexOf('=');
      if (eq === -1) continue;
      const k = t.slice(0, eq).trim();
      const v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[k]) process.env[k] = v;
    }
  }
}
loadEnv();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getClient() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Erro: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY necessarios.');
    console.error('Verifica backend/.env ou passa como env vars.');
    process.exit(1);
  }
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ─── Help ──────────────────────────────────────────────────────
function showHelp() {
  console.log(`
Supabase Admin CLI — Kizola

USO:
  node scripts/supabase-admin.js <comando> [args]

COMANDOS:
  sql <query>           DDL/DML: CREATE, ALTER, INSERT, UPDATE, DELETE
                        Ex: supabase-admin.js sql "ALTER TABLE profiles ADD COLUMN bio TEXT"

  query <sql>           SELECT e retorna JSON
                        Ex: supabase-admin.js query "SELECT * FROM profiles LIMIT 3"

  migrate <arquivo>     Executa ficheiro SQL de migracao
                        Ex: supabase-admin.js migrate supabase-migration-correcoes.sql

  migrate:all           Executa todos os .sql da raiz por ordem alfabetica
                        Ex: supabase-admin.js migrate:all

  tables                Lista tabelas do schema public
                        Ex: supabase-admin.js tables

  inspect <tabela>      Mostra colunas e tipos
                        Ex: supabase-admin.js inspect notifications

  rpc <fn> [argsJSON]   Chama funcao RPC (args em JSON)
                        Ex (cmd): supabase-admin.js rpc list_tables
                        Ex (bash): supabase-admin.js rpc inspect_table '{"table_name":"profiles"}'
                        Ex (PS):   supabase-admin.js --% rpc inspect_table "{\"table_name\":\"profiles\"}"

  seed <ficheiro>       Executa seed data
                        Ex: supabase-admin.js seed scripts/seed-data.sql

  --help, -h            Mostra esta mensagem

NOTA (PowerShell): em vez de aspas simples, usa --% antes do comando
  e aspas duplas escapadas: node --% supabase-admin.js rpc fn "{\"key\":\"val\"}"
`.trim());
}

// ─── RPC wrappers ──────────────────────────────────────────────
async function rpcCall(name, args = {}) {
  const supabase = getClient();
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw new Error(`${name}: ${error.message}`);
  // Se data for JSONB com estrutura { success, data }, extrai
  if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
    return data.data;
  }
  return data;
}

// ─── Comandos ──────────────────────────────────────────────────

async function cmdSql(args) {
  if (!args.length) { console.error('Uso: supabase-admin.js sql "<query>"'); process.exit(1); }
  const query = args.join(' ');
  console.log(`SQL: ${query.slice(0, 300)}${query.length > 300 ? '...' : ''}`);
  const result = await rpcCall('exec_sql', { query });
  console.log('Resultado:', JSON.stringify(result, null, 2));
}

async function cmdQuery(args) {
  if (!args.length) { console.error('Uso: supabase-admin.js query "<SELECT>"'); process.exit(1); }
  const query = args.join(' ');
  const result = await rpcCall('exec_select', { query });
  console.log(JSON.stringify(result, null, 2));
}

async function cmdMigrate(args) {
  if (!args.length) { console.error('Uso: supabase-admin.js migrate <ficheiro>'); process.exit(1); }
  const filePath = path.resolve(PROJECT_ROOT, args[0]);
  if (!fs.existsSync(filePath)) { console.error('Ficheiro nao encontrado:', filePath); process.exit(1); }

  const sql = fs.readFileSync(filePath, 'utf-8');
  const lines = sql.split('\n');
  console.log(`Migracao: ${path.basename(filePath)} (${lines.length} linhas)`);

  // Partir por ponto-e-virgula, ignorar comentarios e linhas em branco
  const stmts = sql
    .replace(/--[^\n]*/g, '')
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const supabase = getClient();
  let ok = 0, fail = 0;

  for (let i = 0; i < stmts.length; i++) {
    const stmt = stmts[i];
    try {
      const { error } = await supabase.rpc('exec_sql', { query: stmt + ';' });
      if (error) {
        console.warn(`  [${i + 1}/${stmts.length}] erro: ${error.message.slice(0, 200)}`);
        fail++;
      } else {
        ok++;
      }
    } catch (err) {
      console.warn(`  [${i + 1}/${stmts.length}] excepcao: ${err.message.slice(0, 200)}`);
      fail++;
    }
  }
  console.log(`Concluido: ${ok} ok, ${fail} falhas`);
}

async function cmdMigrateAll() {
  const files = fs.readdirSync(PROJECT_ROOT)
    .filter(f => f.endsWith('.sql') && f.startsWith('supabase-migration'))
    .sort();
  if (!files.length) { console.log('Nenhuma migracao encontrada.'); return; }
  console.log(`Migracoes (${files.length}):`);
  files.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
  for (const f of files) {
    console.log(`\n--- ${f} ---`);
    await cmdMigrate([f]);
  }
  console.log(`\nTodas as ${files.length} migracoes executadas.`);
}

async function cmdTables() {
  const data = await rpcCall('list_tables');
  if (!Array.isArray(data) || !data.length) {
    console.log('Nenhuma tabela encontrada.');
    return;
  }
  console.log('\nTabelas:\n');
  console.log('  Nome'.padEnd(32) + 'Colunas  Estimativa');
  console.log('  ' + '-'.repeat(55));
  for (const row of data) {
    const est = row.row_estimate != null ? String(row.row_estimate).padStart(9) : '      N/A';
    console.log(`  ${row.table_name.padEnd(32)} ${String(row.column_count).padStart(4)}   ${est}`);
  }
  console.log();
}

async function cmdInspect(args) {
  if (!args.length) { console.error('Uso: supabase-admin.js inspect <tabela>'); process.exit(1); }
  const data = await rpcCall('inspect_table', { table_name: args[0] });
  if (!Array.isArray(data) || !data.length) {
    console.log(`Tabela "${args[0]}" nao encontrada.`);
    return;
  }
  const table = args[0];
  console.log(`\nColunas de \`${table}\`:\n`);
  console.log('  #    Nome'.padEnd(28) + 'Tipo'.padEnd(22) + 'Null    Default');
  console.log('  ' + '-'.repeat(65));
  for (const col of data) {
    const typeStr = col.max_length ? `${col.data_type}(${col.max_length})` : col.data_type;
    const nul = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
    const def = col.column_default || '';
    console.log(
      `  ${String(col.ordinal_position).padEnd(4)} ${col.column_name.padEnd(24)} ${typeStr.padEnd(22)} ${nul.padEnd(7)} ${def.slice(0, 20)}`
    );
  }
  console.log();
}

async function cmdRpc(args) {
  if (!args.length) { console.error('Uso: supabase-admin.js rpc <fn> [argsJSON]'); process.exit(1); }
  const fn = args[0];
  const fnArgs = args.length > 1 ? JSON.parse(args.slice(1).join(' ')) : {};
  const data = await rpcCall(fn, fnArgs);
  console.log(JSON.stringify(data, null, 2));
}

async function cmdSeed(args) {
  if (!args.length) { console.error('Uso: supabase-admin.js seed <ficheiro>'); process.exit(1); }
  await cmdMigrate(args);
}

// ─── Main ──────────────────────────────────────────────────────
async function main() {
  const cmd = process.argv[2];
  if (!cmd || cmd === '--help' || cmd === '-h') {
    showHelp();
    return;
  }
  const args = process.argv.slice(3);
  const handlers = {
    sql: cmdSql,
    query: cmdQuery,
    migrate: cmdMigrate,
    'migrate:all': cmdMigrateAll,
    tables: cmdTables,
    inspect: cmdInspect,
    rpc: cmdRpc,
    seed: cmdSeed,
  };
  const handler = handlers[cmd];
  if (!handler) {
    console.error(`Comando desconhecido: "${cmd}"`);
    console.error('Usa --help para ver os comandos.');
    process.exit(1);
  }
  await handler(args);
}

main().catch(err => {
  console.error('Erro:', err.message);
  process.exit(1);
});
