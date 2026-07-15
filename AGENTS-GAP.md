# AGENTS.md — Análise de Lacunas (Gap Analysis)

> Este documento descreve o que **falta** no `AGENTS.md` actual para que seja um guia
> completo para AI agents contribuírem eficazmente no projecto **Kizola Protect**.

---

## Resumo

O `AGENTS.md` actual cobre **apenas**:
- Schemas de 10 tabelas do banco de dados
- Uma observação sobre notificações por utilizador
- Instruções de uso do Supabase Admin CLI

**Isto é insuficiente.** Um AI agent que chegue ao projecto sem contexto extra terá
que explorar dezenas de ficheiros para perceber padrões, convenções e arquitectura.

Abaixo, cada secção documenta o que está em falta, com justificação e referência
a código existente onde o agente teria que procurar.

---

## 1. Visão Geral do Projecto

**O que falta:** Uma descrição clara do que é o Kizola Protect, público-alvo e
propósito.

**Porque é crítico:** Sem contexto de domínio, um agente não consegue tomar
decisões de design informadas.

**Referência:** O `README.md` tem isto, mas o `AGENTS.md` não — e agentes nem
sempre leêm o README.

```
Falta:
- Público-alvo: imigrantes nos EUA (comunidades lusófonas, hispânicas, asiáticas)
- Proposta de valor: protecção e assistência (habitação, finanças, documentos)
- Modelo de negócio: subscrições Free / Basic / Pro / Premium
- Região: mercado US (preços em USD, compliance americano)
```

---

## 2. Stack Tecnológica Completa

**O que falta:** As tecnologias usadas em cada camada, com versões, e **porque**
foram escolhidas.

**Porque é crítico:** Agents precisam saber quais ferramentas estão disponíveis
e quais não devem ser introduzidas.

| Camada | Tecnologia | Está no AGENTS.md? |
|--------|-----------|-------------------|
| Framework Mobile | React Native 0.81 + Expo SDK 54 | ❌ |
| Routing | Expo Router 3 (file-based) | ❌ |
| Linguagem | TypeScript 5 | ❌ |
| Estado Global | Zustand 5 | ❌ |
| Server State | TanStack Query 5 | ❌ |
| Backend | Node.js + Express 5 | ❌ |
| Database | Supabase (PostgreSQL) | ✅ (só schemas) |
| Auth | Supabase Auth + Twilio Verify + Google + Apple | ❌ |
| Pagamentos | Stripe (Edge Functions) | ❌ |
| i18n | i18next (15 idiomas) | ❌ |
| UI | Moti + Reanimated + expo-image | ❌ |
| AI | Google Gemini + Groq (Llama) | ❌ |
| Testes | Jest | ❌ |

---

## 3. Arquitectura de Navegação (Expo Router)

**O que falta:** A estrutura de grupos (grupos) do Expo Router e como as rotas
se organizam.

**Porque é crítico:** Agents que criam novos ecrãs precisam saber onde colocar
os ficheiros e como registar rotas.

**Referência:** `app/_layout.tsx`, `app/(app)/_layout.tsx`, `app/(auth)/_layout.tsx`

```
Estrutura actual (não documentada no AGENTS.md):
app/
├── _layout.tsx          ← Root layout com providers (Auth, Theme, Query, Offline, Notification)
├── (app)/               ← Grupo autenticado (tab navigator)
│   ├── _layout.tsx      ← Tab navigator com 6 abas + screens ocultos
│   ├── dashboard.tsx
│   ├── benefits.tsx
│   ├── activity.tsx
│   ├── learn.tsx
│   ├── support.tsx
│   ├── profile.tsx
│   ├── documents.tsx
│   ├── plans.tsx
│   ├── plan-details.tsx
│   ├── checkout.tsx
│   ├── finance-support.tsx
│   ├── housing-support.tsx
│   ├── delete-account.tsx
│   └── admin/           ← Sub-grupo admin
│       ├── _layout.tsx
│       ├── dashboard.tsx
│       ├── users.tsx
│       ├── cases.tsx
│       ├── support.tsx
│       ├── finance.tsx
│       ├── audit.tsx
│       └── reports.tsx
├── (auth)/              ← Grupo não autenticado
│   ├── _layout.tsx
│   └── verify.tsx
├── auth.tsx             ← Tela de selecção de login
├── login.tsx
├── login-phone.tsx
├── register.tsx
├── forgot-password.tsx
├── reset-password.tsx
├── onboarding.tsx
├── terms.tsx
├── privacy.tsx
├── index.tsx            ← Entry point / redirect
├── +not-found.tsx
└── +native-intent.tsx
```

---

## 4. Providers e Ordem de Inicialização

**O que falta:** A hierarquia de providers no root layout e as dependências
entre eles.

**Porque é crítico:** Agents podem quebrar a ordem ou esquecer providers
ao adicionar novo contexto.

**Referência:** `app/_layout.tsx` (linhas 55-69)

```
Ordem actual (não documentada):
QueryClientProvider → ThemeProvider → AuthProvider → NotificationProvider → OfflineProvider

Cada provider tem responsabilidades específicas que não estão documentadas:
- ThemeProvider: tema claro/escuro, tokens de design
- AuthProvider: sessão Supabase, role do utilizador
- NotificationProvider: push notifications (estrutura preparada)
- OfflineProvider: detecção de conectividade
- AuthRedirect: redirecciona entre auth/app stacks conforme sessão
```

---

## 5. Sistema de Autenticação

**O que falta:** Fluxo completo de auth, roles, e como os componentes se integram.

**Porque é crítico:** É a funcionalidade mais sensível do sistema.

**Referência:** `app/(auth)/`, `app/login*.tsx`, `hooks/usePhoneAuth.ts`,
`hooks/useAuthOperations.ts`, `hooks/useSessionManager.ts`,
`providers/AuthProvider.tsx`, `services/auth/`

```
Fluxos não documentados:
1. Phone OTP (Twilio): login-phone.tsx → (auth)/verify.tsx → backend/auth/send-code + verify-code
2. Google Login: expo-auth-session + Supabase
3. Apple Login: expo-apple-authentication + Supabase
4. Role-Based Access: hook useRBAC.ts com hierarquia user < viewer < support < finance < admin < super_admin
5. AuthStore (Zustand): pendingPhone persistido em SecureStore entre ecrãs login → verify

Backend (não documentado):
- POST /auth/send-code (rate limited)
- POST /auth/verify-code (rate limited)
- POST /auth/create-profile (requer bearer token)
- Middlware: rateLimiter.js, errorHandler.js
```

---

## 6. Estado Global (Zustand + TanStack Query)

**O que falta:** Padrões de gestão de estado e onde cada tipo de estado vive.

**Porque é crítico:** Agents podem misturar estado local, global e server state.

**Referência:** `store/authStore.ts`

```
Padrão actual (não documentado):
- Zustand: apenas authStore (pendingPhone, loading, error) — estado UI transiente
- TanStack Query: dados do servidor (dashboard, documentos, etc.)
- React Context: auth (sessão), theme, notifications, offline
- Local state (useState): tudo o que é específico de um ecrã

Falta documentar:
- Quando usar Zustand vs Context vs TanStack Query vs useState
- Convenção de nomes para stores e queries
- Padrão de cache invalidação
```

---

## 7. Sistema de Design e Tema

**O que falta:** Tokens de design, cores, tipografia, e padrão de componentes.

**Porque é crítico:** Agents de frontend produzem código inconsistente sem
referências de design.

**Referência:** `constants/theme.ts`, `constants/colors.ts`,
`constants/logo-colors.ts`, `providers/ThemeProvider.tsx`

```
Falta documentar:
- Tema claro/escuro via ThemeProvider
- Paleta de cores principal (colors.ts)
- Design tokens (theme.ts): surface, background, accent, text, cardBorder, etc.
- Componentes reutilizáveis existentes (AdminStatCard, KizolaLogo, etc.)
- Padrão de ícones (lucide-react-native)
- Biblioteca de animações (Moti + Reanimated)
```

---

## 8. Internacionalização (i18n)

**O que falta:** Como o sistema de traduções funciona e como adicionar novos idiomas.

**Porque é crítico:** Agents que criam UI precisam saber que todas as strings
devem passar por `t()`.

**Referência:** `lib/i18n.ts`, `assets/translations/`

```
Falta documentar:
- 15 idiomas suportados: EN, PT, FR, ES, ES-US, ZH, JA, KO, VI, TL, AR, RU, HI, BN, LN
- Fallback: sempre EN
- Detecção: SecureStore → device locale → 'en'
- Estrutura dos JSONs de tradução
- Convenção de chaves (dot notation: "dashboard.welcome", "profile.title")
- Como adicionar novo idioma (ficheiro + import em i18n.ts)
```

---

## 9. Testes

**O que falta:** Setup de testes, convenções, e comandos.

**Porque é crítico:** Agents precisam saber como correr e escrever testes.

**Referência:** `jest.config.js`, `__tests__/`

```
Falta documentar:
- Runner: Jest
- 9 suites, 155 testes, 0 falhas
- Padrão de naming: *.test.ts, *.test.tsx
- Comando: npx jest --passWithNoTests
- Testes existentes: authStore, dashboard, documents, plans, profile,
  i18n, apiClient, secureStorage, notifications
- Mocking: como mockar Supabase, Twilio, SecureStore
```

---

## 10. Backend API

**O que falta:** Rotas, controladores, serviços e middleware do backend.

**Porque é crítico:** Agents de backend precisam saber a estrutura para
adicionar novas rotas.

**Referência:** `backend/src/`

```
Estrutura não documentada:
backend/src/
├── index.js              ← Entry point (Express + Helmet + CORS + Morgan)
├── controllers/
│   ├── authController.js   ← sendCode, verifyCode
│   └── profileController.js ← createProfile
├── routes/
│   └── authRoutes.js       ← /auth/*
├── services/
│   ├── twilioService.js    ← Integração Twilio Verify
│   └── supabaseService.js  ← Admin client Supabase
├── middleware/
│   ├── rateLimiter.js      ← Rate limiting (sendCode, verifyCode)
│   └── errorHandler.js     ← Tratamento de erros (Twilio + Supabase + genérico)
└── utils/
    ├── logger.js           ← Logger estruturado
    └── validators.js       ← Validação de input
```

---

## 11. Supabase — Detalhes de Banco

**O que falta:** Informação que agents precisam para operar o banco: RLS,
relacionamentos, índices, funções, triggers.

**Porque é crítico:** Agents podem escrever queries ineficientes ou inseguras.

```
Falta documentar:
- Políticas RLS por tabela (quem pode ler/escrever o quê)
- Relacionamentos entre tabelas (ex: profiles.id → subscriptions.user_id)
- Índices existentes
- Funções RPC (exec_sql, exec_select, list_tables, inspect_table)
- Triggers (ex: auto-create profile on signup)
- Stripe Edge Functions (create-checkout-session, stripe-webhook)
- Migrations (nenhuma encontrada em supabase/migrations/)
- Storage buckets (documentos)
```

---

## 12. Fluxos de Pagamento (Stripe)

**O que falta:** Como o checkout e subscrições funcionam.

**Referência:** `supabase/functions/create-checkout-session/index.ts`,
`supabase/functions/stripe-webhook/index.ts`, `app/(app)/checkout.tsx`,
`app/(app)/plans.tsx`

```
Fluxo não documentado:
1. Utilizador selecciona plano em plans.tsx
2. Redireccionado para checkout.tsx
3. Edge Function create-checkout-session cria sessão Stripe
4. Webhook stripe-webhook actualiza subscriptions no Supabase
5. Tabela plans tem planos: Free, Basic ($19.99), Pro ($34.99), Premium ($49.99)
6. Tabela subscriptions guarda estado da subscrição por utilizador
```

---

## 13. Módulo de Documentos

**O que falta:** Como o upload/download/storage de documentos funciona.

**Referência:** `app/(app)/documents.tsx`, `components/documents/`

```
Falta documentar:
- Upload para Supabase Storage
- Preview de documentos (PreviewModal.tsx)
- Filtros por tipo/status (FilterModal.tsx)
- Menu de upload (UploadMenuModal.tsx)
- Cards de documento (DocumentCard.tsx)
- Estatísticas (StatsRow.tsx)
- Helpers de formatação (helpers.ts)
```

---

## 14. Módulo Admin

**O que falta:** Painel administrativo e suas permissões.

**Referência:** `app/(app)/admin/`

```
Falta documentar:
- Dashboard admin com métricas e gráficos
- Gestão de utilizadores (users.tsx)
- Gestão de casos (cases.tsx)
- Suporte admin (support.tsx)
- Finanças admin (finance.tsx)
- Auditoria (audit.tsx)
- Relatórios (reports.tsx)
- RBAC: cada ecrã admin requer role específico
```

---

## 15. Convenções de Código

**O que falta:** Regras que agents devem seguir ao escrever código.

```
Falta documentar:
- Estrutura de ficheiros (componentes em components/Feature/, hooks em hooks/)
- Naming: PascalCase para componentes, camelCase para hooks/funções
- Estilo de import: @/alias para paths internos
- Tratamento de erros: nunca catch silencioso, sempre logging
- TypeScript: evitar `as any` e `@ts-ignore`
- Testes: TDD ou teste após implementação?
- Commits: convenção (não documentada)
- Branch strategy: feature/us-market-phase1 está ativa
```

---

## 16. Variáveis de Ambiente

**O que falta:** Quais env vars existem e onde são usadas.

```
Frontend (.env.local):
- EXPO_PUBLIC_SUPABASE_URL
- EXPO_PUBLIC_SUPABASE_ANON_KEY
- EXPO_PUBLIC_API_URL
- EXPO_PUBLIC_GOOGLE_CLIENT_ID / IOS / WEB

Backend (backend/.env):
- PORT, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID
- SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
- SENTRY_DSN
```

---

## 17. Serviços e Integrações

**O que falta:** Lista completa de serviços externos e como são integrados.

```
- Supabase (Auth, Database, Storage, Edge Functions)
- Twilio Verify (OTP)
- Google Login (expo-auth-session)
- Apple Login (expo-apple-authentication)
- Stripe (checkout, webhook)
- Google Gemini (chat AI)
- Groq / Llama (chat AI alternativo)
- Sentry (monitoramento)
- Expo SecureStore (armazenamento seguro local)
```

---

## Resumo de Prioridades

| Prioridade | O que falta | Impacto |
|-----------|------------|---------|
| 🔴 Alta | Arquitectura de navegação (Expo Router) | Agent cria ecrã no lugar errado |
| 🔴 Alta | Fluxo de autenticação completo | Agent quebra fluxo de login |
| 🔴 Alta | Convenções de código e estado | Código inconsistente |
| 🟡 Média | Providers e ordem inicialização | Agent quebra hierarquia |
| 🟡 Média | Sistema de design e tema | UI inconsistente |
| 🟡 Média | Backend API: rotas + middleware | Agent duplica rotas |
| 🟡 Média | i18n: como adicionar traduções | Strings hardcoded |
| 🟡 Média | RLS e relacionamentos Supabase | Queries inseguras |
| 🟢 Baixa | Testes: setup e padrões | Testes mal escritos |
| 🟢 Baixa | Fluxo Stripe | Duplicação de lógica |
| 🟢 Baixa | Detalhes de módulos (admin, docs) | Conhecimento disperso |

---

## Checklist de Acção

- [ ] Adicionar secção "Project Overview" (copy do README)
- [ ] Adicionar secção "Tech Stack" com versões
- [ ] Adicionar secção "Navigation Architecture" com mapa de rotas
- [ ] Adicionar secção "Providers & Initialization Order"
- [ ] Adicionar secção "Auth Flow" com diagrama de fluxo
- [ ] Adicionar secção "State Management Patterns"
- [ ] Adicionar secção "Design System & Theme Tokens"
- [ ] Adicionar secção "i18n System"
- [ ] Adicionar secção "Testing Conventions"
- [ ] Adicionar secção "Backend API Reference"
- [ ] Adicionar secção "Supabase Schema (RLS, Indexes, Relations)"
- [ ] Adicionar secção "Payment Flow (Stripe)"
- [ ] Adicionar secção "Coding Conventions"
- [ ] Adicionar secção "Environment Variables Reference"
- [ ] Adicionar secção "External Services & Integrations"
