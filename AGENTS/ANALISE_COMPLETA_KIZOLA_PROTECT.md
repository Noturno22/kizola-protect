# KIZOLA PROTECT — Análise Completa do Projecto

**Data:** 2026-07-06 (Actualizada)
**Plataforma:** React Native (Expo SDK 54) + Node.js/Express + Supabase
**Versão:** 1.0.0

---

## Índice

1. [Stack Tecnológica Completa](#1-stack-tecnológica-completa)
2. [Estrutura de Pastas Completa](#2-estrutura-de-pastas-completa)
3. [Arquitectura do Projecto](#3-arquitectura-do-projecto)
4. [Sistema de Autenticação](#4-sistema-de-autenticação)
5. [Base de Dados — Supabase (12 Tabelas)](#5-base-de-dados--supabase)
6. [RBAC — Roles e Permissões](#6-rbac--roles-e-permissões)
7. [Sistema de Navegação (Expo Router)](#7-sistema-de-navegação)
8. [Backend API](#8-backend-api)
9. [Providers e State Management](#9-providers-e-state-management)
10. [Hooks e Serviços](#10-hooks-e-serviços)
11. [Segurança — OWASP Assessment](#11-segurança)
12. [Monetização e Planos](#12-monetização-e-planos)
13. [Internacionalização (i18n)](#13-internacionalização)
14. [Critical Blockers para Mercado US](#14-critical-blockers)
15. [Major Issues — Dívida Técnica](#15-major-issues)
16. [Todos os Ficheiros do Projecto](#16-todos-os-ficheiros)
17. [Supabase Migrations — SQL Completo](#17-supabase-migrations)
18. [Plano de Acção Prioritário](#18-plano-de-acção)

---

## 1. Stack Tecnológica Completa

| Layer | Tecnologia | Versão |
|-------|-----------|--------|
| **Mobile Framework** | React Native | 0.81.5 |
| **Expo SDK** | Expo | ~54.0.35 |
| **Linguagem** | TypeScript | ~5.9.2 |
| **Routing** | Expo Router | ~6.0.17 |
| **Estado Global** | Zustand | ^5.0.2 |
| **Estado Servidor** | TanStack React Query | ^5.83.0 |
| **UI Icons** | Lucide React Native | ^1.11.0 |
| **Animações** | Moti + Reanimated | ^0.30.0 / ~4.1.1 |
| **Formulários** | Zod | ^4.3.6 |
| **Auth Mobile** | @supabase/supabase-js | ^2.105.4 |
| **Auth OTP** | Twilio Verify | ^6.0.2 |
| **HTTP Client** | Axios | ^1.16.1 |
| **i18n** | i18next + react-i18next | ^26.0.8 / ^17.0.6 |
| **Gestos** | react-native-gesture-handler | ~2.28.0 |
| **Safe Area** | react-native-safe-area-context | ~5.6.0 |
| **SVG** | react-native-svg | 15.12.1 |
| **PDF** | react-native-pdf | ^7.0.4 |
| **Fontes** | expo-font | ~14.0.10 |
| **Notificações** | expo-notifications | ~0.32.17 |
| **Documentos** | expo-document-picker | ~14.0.8 |
| **Ficheiros** | expo-file-system | ~19.0.22 |
| **Imagens** | expo-image | ~3.0.11 |
| **Câmara** | expo-image-picker | ~17.0.11 |
| **Localização** | expo-location | ~19.0.8 |
| **Blur** | expo-blur | ~15.0.8 |
| **Haptics** | expo-haptics | ~15.0.8 |
| **Linear Gradient** | expo-linear-gradient | ~15.0.8 |
| **Segurança** | expo-secure-store | ~15.0.8 |
| **Deep Links** | expo-linking | ~8.0.10 |
| **Auth Session** | expo-auth-session | ~7.0.11 |
| **Build** | EAS Build + EAS Submit | — |
| **Linting** | ESLint (expo-config) | ^9.31.0 |
| **Package Manager** | npm | — |
| **Backend Runtime** | Node.js + Express | ^5.2.1 |
| **Backend Segurança** | Helmet + CORS + Morgan | — |
| **Backend Rate Limit** | express-rate-limit | ^8.5.1 |
| **Backend Dev** | Nodemon | ^3.1.10 |
| **AI** | Google Gemini + Groq (Llama) | — |

---

## 2. Estrutura de Pastas Completa

```
KIZOLA PROTECT/
│
├── app/                                    # Expo Router (file-based routing)
│   ├── _layout.tsx                         # Root layout — Providers + QueryClient
│   ├── index.tsx                           # Entry point / redirect
│   ├── +not-found.tsx                      # 404 screen
│   ├── +native-intent.tsx                  # Deep link handler
│   ├── auth.tsx                            # Auth landing
│   ├── login.tsx                           # Email/password login
│   ├── login-phone.tsx                     # Phone number entry (OTP)
│   ├── register.tsx                        # Email registration
│   ├── forgot-password.tsx                 # Password reset
│   ├── reset-password.tsx                  # New password form
│   ├── onboarding.tsx                      # Onboarding screens
│   ├── tsconfig.json
│   ├── package.json
│   └── .gitignore
│
│   ├── (auth)/                             # Unauthenticated group
│   │   ├── _layout.tsx                     # Stack navigation (no header)
│   │   ├── verify.tsx                      # OTP verification (6-digit boxes)
│   │   └── login.tsx.phone                 # DEAD FILE — artifact não usado
│   │
│   └── (app)/                              # Authenticated group
│       ├── _layout.tsx                     # Tab navigation (7 tabs)
│       ├── dashboard.tsx                   # Home dashboard (977 linhas)
│       ├── benefits.tsx                    # Benefits overview
│       ├── activity.tsx                    # User activity log
│       ├── learn.tsx                       # Learning center (1161 linhas)
│       ├── support.tsx                     # Support requests (1173 linhas)
│       ├── profile.tsx                     # User profile (1604 linhas)
│       ├── plans.tsx                       # Subscription plans
│       ├── plan-details.tsx                # Plan details
│       ├── checkout.tsx                    # Stripe checkout
│       ├── documents.tsx                   # Document upload (1015 linhas)
│       ├── housing-support.tsx             # Housing assistance
│       ├── finance-support.tsx             # Financial assistance
│       │
│       └── admin/                          # Admin panel
│           ├── _layout.tsx                 # Admin stack layout
│           ├── dashboard.tsx               # Admin dashboard
│           ├── users.tsx                   # User management
│           ├── cases.tsx                   # Unified cases view
│           ├── support.tsx                 # Support queue
│           ├── finance.tsx                 # Finance queue
│           ├── reports.tsx                 # Reports & analytics
│           └── audit.tsx                   # Audit logs
│
├── backend/                                # Express API server
│   ├── package.json
│   ├── package-lock.json
│   │
│   ├── services/                           # (Legacy — não usado pelo src/)
│   │   ├── twilio.js
│   │   └── supabase.js
│   │
│   └── src/                                # Código activo
│       ├── index.js                        # Entry point — Express app
│       │
│       ├── routes/
│       │   └── authRoutes.js               # POST /auth/send-code
│       │                                   # POST /auth/verify-code
│       │                                   # POST /auth/create-profile
│       │
│       ├── controllers/
│       │   ├── authController.js           # sendCode + verifyCode logic
│       │   └── profileController.js        # Profile creation via service role
│       │
│       ├── services/
│       │   ├── twilioService.js            # Twilio Verify API
│       │   └── supabaseService.js          # Admin user creation + session
│       │
│       ├── middleware/
│       │   ├── rateLimiter.js              # Rate limiting (send/verify)
│       │   └── errorHandler.js             # Global error handler
│       │
│       └── utils/
│           ├── logger.js                   # Structured logging
│           └── validators.js               # Phone + code validation
│
├── components/                             # Shared components
│   ├── AuthRedirect.tsx                    # Auth state redirect logic
│   ├── KizolaLogo.tsx                      # Logo component
│   ├── AdminStatCard.tsx                   # Admin stats card
│   ├── SatisfactionModal.tsx               # Post-resolution survey
│   │
│   └── auth/                               # Auth-specific components
│       ├── PhoneInput.tsx                  # Phone number input
│       └── OtpInput.tsx                    # 6-digit OTP boxes
│
├── providers/                              # React Context providers
│   ├── AuthProvider.tsx                    # Auth state (686 linhas)
│   ├── ThemeProvider.tsx                   # Dark/light theme
│   └── NotificationProvider.tsx            # In-app notifications
│
├── hooks/                                  # Custom hooks
│   ├── usePhoneAuth.ts                     # OTP flow orchestrator
│   └── useRBAC.ts                          # Role-based access helpers
│
├── store/                                  # Zustand stores
│   └── authStore.ts                        # OTP flow state (pendingPhone, loading, error)
│
├── services/                               # Service layer
│   ├── auth.ts                             # createProfileIfNotExists (legacy)
│   ├── dashboard.ts                        # Dashboard data fetching
│   │
│   ├── auth/
│   │   └── phoneAuthService.ts             # Frontend phone auth (sendCode + verifyAndSignIn)
│   │
│   ├── api/
│   │   └── apiClient.ts                    # Axios instance (base URL, interceptors)
│   │
│   └── ai/
│       ├── gemini.ts                       # Google Gemini integration
│       └── groq.ts                         # Groq (Llama) integration
│
├── lib/                                    # Core libraries
│   ├── supabase.ts                         # Supabase client + types
│   ├── i18n.ts                             # i18next configuration
│   └── payment.ts                          # Payment utilities
│
├── constants/                              # Constants
│   └── logo-colors.ts                      # Logo color definitions
│
├── assets/                                 # Static assets
│   ├── images/
│   │   ├── icon.png
│   │   ├── splash-icon.png
│   │   ├── adaptive-icon.png
│   │   └── favicon.png
│   │
│   ├── onboarding/
│   │   ├── family.png
│   │   ├── benefits.png
│   │   ├── dashboard.png
│   │   └── support.png
│   │
│   └── translations/
│       ├── en.json                         # English
│       ├── pt.json                         # Portuguese
│       ├── fr.json                         # French
│       └── es.json                         # Spanish
│
├── supabase/                               # Supabase configuration
│   ├── config.toml                         # Supabase CLI config
│   │
│   └── functions/                          # Edge Functions
│       ├── create-checkout-session/
│       │   └── index.ts                    # Stripe checkout session
│       │
│       └── stripe-webhook/
│           ├── index.ts                    # Stripe webhook handler
│           ├── deno.json
│           └── .npmrc
│
├── .superpawers/
│   └── analysis/
│       └── kizola-protect-senior-analysis.md  # Senior US Mobile review
│
├── types/
│   └── auth.ts                             # Auth type definitions
│
├── package.json                            # Root dependencies
├── app.json                                # Expo configuration
├── tsconfig.json                           # TypeScript config
├── eas.json                                # EAS Build config
├── .gitignore
│
├── supabase-migrations-phase4.sql          # Housing, Finance, RBAC, Audit
├── supabase-migrations-documents.sql       # Documents table + storage
├── supabase-migration-remove-insert-policy.sql
├── supabase-migration-correcoes.sql
│
├── AGENTS.md                               # DB schema reference for agents
├── README.md                               # Project instructions
└── ANALISE_COMPLETA_KIZOLA_PROTECT.md      # This file
```

---

## 3. Arquitectura do Projecto

### 3.1 Fluxo de Dados Global

```
┌─────────────────────────────────────────────────────────────┐
│                        MOBILE APP                           │
│                                                             │
│  ┌──────────┐    ┌──────────────┐    ┌──────────────────┐   │
│  │ Screens  │───>│   Hooks     │───>│   Services       │   │
│  │ (Expo    │    │ (usePhone   │    │ (phoneAuth, api) │   │
│  │  Router) │    │  Auth,      │    │                  │   │
│  │          │<───│  useRBAC)   │<───│                  │   │
│  └──────────┘    └──────────────┘    └───────┬──────────┘   │
│       │                                       │             │
│       ▼                                       ▼             │
│  ┌──────────┐                        ┌──────────────────┐   │
│  │ Zustand  │                        │   Axios Client   │   │
│  │ authStore│                        │  apiClient.ts    │   │
│  └──────────┘                        └────────┬─────────┘   │
│       │                                       │             │
│       ▼                                       ▼             │
│  ┌──────────────────────────────────────────────────────┐    │
│  │                  Providers                           │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌───────────────┐  │    │
│  │  │ AuthProvider│ │ThemeProvider│ │Notification   │  │    │
│  │  │ (Context)   │ │ (Context)   │ │ Provider      │  │    │
│  │  └─────────────┘ └─────────────┘ └───────────────┘  │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              Supabase Client (lib/supabase.ts)       │    │
│  │         ┌────────────────────────────────────┐       │    │
│  │         │  Auth + Database + Storage + Realtime │     │    │
│  │         └────────────────────────────────────┘       │    │
│  └──────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                  ▼
┌───────────────┐  ┌──────────────┐  ┌──────────────┐
│    Backend    │  │  Supabase   │  │   Twilio     │
│   Express API │  │  Cloud      │  │   Verify     │
│   :3000       │  │  (Postgres) │  │   (OTP SMS)  │
└───────┬───────┘  └──────────────┘  └──────────────┘
        │
        ▼
┌───────────────┐
│   Supabase    │
│  Admin API    │
│ (Service Role)│
└───────────────┘
```

### 3.2 Fluxo de Autenticação por Telefone (OTP)

```
1. User → [Digita telefone] → login-phone.tsx
2. login-phone.tsx → usePhoneAuth.sendCode(phone)
3. usePhoneAuth → phoneAuthService.sendVerificationCode(phone)
4. phoneAuthService → apiClient.post('/auth/send-code', { phone })
5. Backend → twilioService.sendVerificationCode(phone)
6. Twilio → SMS com código OTP de 6 dígitos
7. User → [Digita código] → verify.tsx
8. verify.tsx → usePhoneAuth.verifyCode(phone, code)
9. usePhoneAuth → phoneAuthService.verifyAndSignIn(phone, code)
10. phoneAuthService → apiClient.post('/auth/verify-code', { phone, code })
11. Backend → twilioService.checkVerificationCode(phone, code)
12. Twilio → { valid: true/false }
13. Backend → supabaseService.getOrCreateUserByPhone(phone)
14. Supabase → { accessToken, refreshToken, userId }
15. Frontend → supabase.auth.setSession({ access_token, refresh_token })
16. AuthProvider → fetchUserProfile(userId)
17. Router → replace('/dashboard')
```

### 3.3 Fluxo de Autenticação Email/Password

```
1. User → [Email + Password] → login.tsx
2. login.tsx → AuthProvider.signIn(email, password)
3. AuthProvider:
   a. checkLockout() — verifica bloqueio por tentativas
   b. supabase.auth.signInWithPassword({ email, password })
   c. recordLoginAttempt(success)
   d. fetchUserProfile(userId)
4. Router → replace('/dashboard')
```

---

## 4. Sistema de Autenticação

### 4.1 Métodos de Autenticação

| Método | Componente | Status |
|--------|-----------|--------|
| Email + Password | `app/login.tsx` | ✅ Completo |
| Phone + OTP (Twilio Verify) | `app/login-phone.tsx` | ✅ Completo |
| Registro Email | `app/register.tsx` | ✅ Completo |
| Password Reset | `app/forgot-password.tsx` | ✅ Completo |
| Login com Apple | `app/login.tsx` (expo-apple-authentication) | ✅ Completo |
| Login com Google | `app/login.tsx` (Supabase OAuth) | ✅ Completo |
| MFA (TOTP) | `AuthProvider.tsx` (enableMfa/verifyMfa) | ⚠️ Parcial (falta factorId) |
| Biometria (Face ID/Touch ID) | ❌ Não implementado | 🟠 Desejável |

### 4.2 AuthProvider — Capacidades

| Funcionalidade | Descrição |
|---------------|-----------|
| `session` | Supabase Session ou null |
| `user` | User profile (id, email, name, plan, role, status) |
| `loading` | Estado de carregamento inicial |
| `isDemoMode` | Modo offline/demo sem Supabase |
| `signIn(email, password)` | Login email/password com lockout |
| `signInWithOtp(phone)` | Enviar OTP via Twilio |
| `verifyOtp(phone, code)` | Verificar OTP + criar sessão |
| `signUp(email, password, name, phone)` | Registro + profile criação |
| `signOut()` | Logout com audit log |
| `updateUserPlan(plan)` | Actualizar subscrição |
| `updateAvatar(url)` | Actualizar avatar |
| `enableMfa()` | Activar MFA TOTP |
| `verifyMfa(code)` | Verificar MFA |
| `disableMfa()` | Desactivar MFA |
| `isLockedOut` | Lockout após 5 tentativas falhadas |
| `isSessionExpired` | Timeout após 30 min inactividade |

### 4.3 Segurança da Auth

| Medida | Detalhe | Status |
|--------|---------|--------|
| Lockout 5 tentativas | 15 min bloqueio | ✅ |
| Session timeout | 30 min inactividade | ✅ |
| Audit logging | auth_audit_logs table | ✅ |
| MFA TOTP | Supabase MFA | ⚠️ Parcial |
| Rate limiting | Backend express-rate-limit | ✅ |
| CORS | Helmet config | ✅ |
| SecureStore | Token storage | ✅ |
| AsyncStorage (PII) | Dados sensíveis em texto plano | 🔴 CRITICAL |

---

## 5. Base de Dados — Supabase

### 5.1 Todas as Tabelas (12)

| # | Tabela | Descrição | Row Level Security |
|---|--------|-----------|-------------------|
| 1 | `profiles` | Perfis de utilizador (role, policy_number, avatar) | ✅ Completa |
| 2 | `subscriptions` | Assinaturas de planos (status, billing) | ✅ Completa |
| 3 | `support_requests` | Pedidos de suporte geral | ✅ Completa |
| 4 | `housing_requests` | Pedidos de apoio à habitação | ✅ Completa |
| 5 | `finance_requests` | Pedidos de ajuda financeira | ✅ Completa |
| 6 | `documents` | Documentos do utilizador (uploads) | ✅ Completa |
| 7 | `notifications` | Notificações por utilizador | ✅ Completa |
| 8 | `auth_audit_logs` | Log de segurança (login, logout, etc) | ✅ Completa |
| 9 | `satisfaction_ratings` | Avaliações pós-atendimento | ✅ Completa |
| 10 | `activities` | Registo de actividades do utilizador | ✅ |
| 11 | `plans` | Definições de planos (preço, features) | — |
| 12 | `auth.users` | Utilizadores Supabase Auth (gerido pela Supabase) | — |

### 5.2 Esquema Detalhado das Tabelas

#### `profiles`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
full_name       TEXT NULLABLE
email           TEXT NULLABLE
phone           TEXT NULLABLE
status          TEXT NULLABLE           -- active, inactive
created_at      TIMESTAMP NULLABLE
role            TEXT NULLABLE           -- user, support, finance, admin, super_admin, viewer
policy_number   TEXT NULLABLE UNIQUE    -- KP-123456
avatar_url      TEXT NULLABLE
```

#### `subscriptions`
```sql
id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id           UUID NULLABLE
plan_id           TEXT NULLABLE
status            TEXT NULLABLE           -- active, cancelled, expired
start_date        TIMESTAMP NULLABLE
end_date          TIMESTAMP NULLABLE
created_at        TIMESTAMP NULLABLE
next_billing_date TIMESTAMPTZ NULLABLE
plan              TEXT NOT NULL
expires_at        TIMESTAMPTZ NULLABLE
auto_renew        BOOL NULLABLE
cancelled_at      TIMESTAMPTZ NULLABLE
```

#### `support_requests`
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id     UUID NULLABLE
category    TEXT NULLABLE           -- legal, immigration, tax, housing, education, job, emergency, other
priority    TEXT NULLABLE           -- low, medium, high, urgent
message     TEXT NULLABLE
status      TEXT NULLABLE           -- pending, in_progress, completed, cancelled
created_at  TIMESTAMP NULLABLE
name        TEXT NULLABLE
email       TEXT NULLABLE
updated_at  TIMESTAMP NULLABLE
```

#### `housing_requests`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
nome            TEXT NOT NULL
email           TEXT NULLABLE
telefone        TEXT NULLABLE
estado          TEXT NOT NULL           -- Estado/Província
cidade          TEXT NOT NULL
situacao_atual  TEXT NOT NULL
necessidade     TEXT NOT NULL           -- rental_search, shelter_move, housing_program, tenant_rights, emergency
observacoes     TEXT NULLABLE
status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','resolved','cancelled'))
assigned_to     UUID NULLABLE REFERENCES auth.users(id) ON DELETE SET NULL
resolved_at     TIMESTAMPTZ NULLABLE
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

#### `finance_requests`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
nome            TEXT NOT NULL
email           TEXT NULLABLE
tipo_ajuda      TEXT NOT NULL       -- ebt, state_benefits, tax_return, financial_planning, debt_help, banking, other
estado          TEXT NOT NULL
descricao       TEXT NOT NULL
observacoes     TEXT NULLABLE
status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','resolved','cancelled'))
assigned_to     UUID NULLABLE REFERENCES auth.users(id) ON DELETE SET NULL
resolved_at     TIMESTAMPTZ NULLABLE
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

#### `documents`
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
name        TEXT NOT NULL
file_path   TEXT NOT NULL
file_url    TEXT NULLABLE
file_type   TEXT NOT NULL DEFAULT 'application/octet-stream'
file_size   BIGINT NOT NULL DEFAULT 0
status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('uploaded','pending','verified','rejected'))
created_at  TIMESTAMPTZ DEFAULT NOW()
updated_at  TIMESTAMPTZ DEFAULT NOW()
```

#### `notifications`
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id     UUID NULLABLE
title       TEXT NULLABLE
message     TEXT NULLABLE
read        BOOL NULLABLE
created_at  TIMESTAMP NULLABLE
type        TEXT NULLABLE           -- info, success, warning, alert
```

#### `auth_audit_logs`
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id     UUID NULLABLE REFERENCES auth.users(id) ON DELETE SET NULL
action      TEXT NOT NULL           -- login, logout, password_reset, plan_change, etc
resource    TEXT NULLABLE
details     JSONB DEFAULT '{}'
ip_address  TEXT NULLABLE
created_at  TIMESTAMPTZ DEFAULT NOW()
```

#### `satisfaction_ratings`
```sql
id                    UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
request_type          TEXT NOT NULL CHECK (request_type IN ('support','housing','finance'))
request_id            UUID NOT NULL
resolved              BOOL NOT NULL
problem_persists      BOOL NULLABLE
what_wasnt_resolved   TEXT NULLABLE
additional_comments   TEXT NULLABLE
rating                INTEGER CHECK (rating BETWEEN 1 AND 5)
created_at            TIMESTAMPTZ DEFAULT NOW()
```

#### `plans`
```sql
id          TEXT PRIMARY KEY        -- free, basic, pro, premium
name        TEXT UNIQUE
price       NUMERIC NULLABLE
features    JSONB NULLABLE
created_at  TIMESTAMP NULLABLE
```

#### `activities`
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id     UUID NULLABLE
title       TEXT NULLABLE
description TEXT NULLABLE
status      TEXT NULLABLE
created_at  TIMESTAMP NULLABLE
```

### 5.3 Views

#### `admin_cases_overview`
Unifica support_requests + housing_requests + finance_requests numa única view para o painel admin.

### 5.4 Funções

| Função | Descrição |
|--------|-----------|
| `has_role(required_role)` | Verifica hierarquia de roles |
| `get_satisfaction_rate(start, end)` | Calcula taxa de satisfação |
| `update_updated_at_column()` | Trigger para actualizar updated_at |

### 5.5 Storage Buckets

| Bucket | Público | Descrição |
|--------|---------|-----------|
| `documents` | `false` | Documentos do utilizador (RLS por user_id) |

---

## 6. RBAC — Roles e Permissões

### 6.1 Hierarquia

```
super_admin  (acesso total)
    │
    ├── admin  (gestão total, sem delete)
    │
    ├── finance  (subscrições + pedidos financeiros)
    │
    ├── support  (perfis + pedidos + notificações)
    │
    ├── viewer  (apenas leitura)
    │
    └── user  (apenas dados próprios)
```

### 6.2 Permissões por Tabela

| Tabela | user | support | finance | admin | super_admin | viewer |
|--------|------|---------|---------|-------|-------------|--------|
| **profiles** | próprio | todos (leitura) | todos (leitura) | todos (update) | todos | todos (leitura) |
| **subscriptions** | própria | todos (leitura) | todos | todos | todos | todos (leitura) |
| **support_requests** | própria | todos (update) | — | todos | todos | — |
| **housing_requests** | própria | — | — | todos | todos | — |
| **finance_requests** | própria | — | todos (update) | todos | todos | — |
| **documents** | própria | todos (leitura) | — | todos | todos | — |
| **notifications** | próprias | todos (leitura) | — | todos | todos | — |
| **auth_audit_logs** | — | — | — | todos | todos | — |

### 6.3 Função `has_role()`

```sql
has_role('super_admin') → role = 'super_admin'
has_role('admin')       → role IN ('super_admin', 'admin')
has_role('finance')     → role IN ('super_admin', 'admin', 'finance')
has_role('support')     → role IN ('super_admin', 'admin', 'support')
has_role('viewer')      → role IN ('super_admin', 'admin', 'finance', 'support', 'viewer')
```

---

## 7. Sistema de Navegação

### 7.1 Estrutura Expo Router

```
Root Layout (_layout.tsx)
│
├── Providers (QueryClient → Theme → Auth → Notification)
│
├── AuthRedirect (força saída de auth routes se logado)
│
├── Stack (screenOptions: headerShown=false)
│   │
│   ├── Public Routes
│   │   ├── /login
│   │   ├── /login-phone
│   │   ├── /register
│   │   ├── /forgot-password
│   │   ├── /reset-password
│   │   ├── /onboarding
│   │   └── /auth
│   │
│   ├── Auth Group (auth/)
│   │   └── /auth/verify (OTP verification)
│   │
│   └── App Group (app/) — Tab Navigation
│       │
│       ├── Tabs (7)
│       │   ├── Home (dashboard)
│       │   ├── Benefits (benefits)
│       │   ├── Activity (activity)
│       │   ├── Learn (learn)
│       │   ├── Support (support)
│       │   ├── Profile (profile)
│       │   └── Admin (admin/) [só admin]
│       │
│       ├── Hidden Screens (href: null)
│       │   ├── finance-support
│       │   ├── housing-support
│       │   ├── plans
│       │   ├── plan-details
│       │   ├── checkout
│       │   └── documents
│       │
│       └── Admin Stack
│           ├── /dashboard
│           ├── /users
│           ├── /cases
│           ├── /support
│           ├── /finance
│           ├── /reports
│           └── /audit
```

### 7.2 Auth Redirect Logic

```typescript
// Se está logado e tenta aceder a rota pública → redirecciona para /dashboard
AUTH_ROUTE_PREFIXES = ['/login', '/register', '/login-phone', '/auth', '/onboarding', '/(auth)', '/forgot-password', '/reset-password']

// Se não está logado → AuthRedirect não faz nada (deixa o Stack mostrar login)
```

---

## 8. Backend API

### 8.1 Endpoints

| Método | Rota | Descrição | Rate Limit | Auth |
|--------|------|-----------|------------|------|
| GET | `/health` | Health check | — | — |
| POST | `/auth/send-code` | Enviar OTP SMS | 5/min (sendCodeLimiter) | — |
| POST | `/auth/verify-code` | Verificar OTP | 10/min (verifyCodeLimiter) | — |
| POST | `/auth/create-profile` | Criar perfil (service role) | — | Bearer token |

### 8.2 Variáveis de Ambiente Necessárias (Backend)

| Variável | Descrição |
|----------|-----------|
| `TWILIO_ACCOUNT_SID` | Account SID do Twilio |
| `TWILIO_AUTH_TOKEN` | Auth Token do Twilio |
| `TWILIO_VERIFY_SERVICE_SID` | Service SID do Twilio Verify |
| `SUPABASE_URL` | URL do projecto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key do Supabase |
| `PORT` | Porta do servidor (default 3000) |
| `NODE_ENV` | production / development |

### 8.3 Middleware Stack

```javascript
helmet()                  // Segurança HTTP
cors({ origin: '*' })     // CORS (restringir em produção)
morgan('dev')             // Logging HTTP (apenas dev)
express.json({ limit: '10kb' })  // Body parsing
rateLimiter               // Limitar tentativas de auth
```

---

## 9. Providers e State Management

### 9.1 Arquitectura de Estado (3 Sistemas)

```
┌──────────────────────────────────────────────────────┐
│                   STATE MANAGEMENT                    │
├──────────────────────────────────────────────────────┤
│                                                       │
│ 1. React Context (AuthProvider, ThemeProvider,        │
│                     NotificationProvider)              │
│    → Estado global que poucos componentes consomem    │
│    → AuthProvider: sessão, user, loading              │
│                                                       │
│ 2. Zustand (authStore)                                │
│    → Estado de UI para fluxo OTP                      │
│    → pendingPhone, isLoading, error                   │
│                                                       │
│ 3. TanStack Query (QueryClient)                       │
│    → Estado do servidor (caching, refetch)            │
│    → Configurado mas sub-utilizado                    │
│                                                       │
└──────────────────────────────────────────────────────┘
```

### 9.2 Árvore de Providers

```
RootLayout
  └── QueryClientProvider
      └── ThemeProvider
          └── AuthProvider
              └── NotificationProvider
                  └── Stack
                      └── AuthRedirect
```

### 9.3 AuthProvider — Estado Interno

| Estado | Tipo | Descrição |
|--------|------|-----------|
| `session` | `Session \| null` | Sessão Supabase |
| `user` | `User \| null` | Perfil do utilizador |
| `loading` | `boolean` | Carregamento inicial |
| `isDemoMode` | `boolean` | Modo offline sem Supabase |
| `lastActivity` | `number` | Timestamp última actividade |
| `isSessionExpired` | `boolean` | Sessão expirou (30 min) |
| `mfaEnabled` | `boolean` | MFA TOTP activo |
| `loginAttempts` | `number` | Tentativas de login falhadas |
| `isLockedOut` | `boolean` | Conta bloqueada |
| `lockoutUntil` | `number` | Timestamp de desbloqueio |

---

## 10. Hooks e Serviços

### 10.1 Hooks

| Hook | Ficheiro | Descrição |
|------|----------|-----------|
| `usePhoneAuth()` | `hooks/usePhoneAuth.ts` | Orquestra fluxo OTP (sendCode, verifyCode) |
| `useRBAC()` | `hooks/useRBAC.ts` | Verificações de role (isAdmin, isSupport, etc) |

### 10.2 Serviços

| Serviço | Ficheiro | Descrição |
|---------|----------|-----------|
| `sendVerificationCode(phone)` | `services/auth/phoneAuthService.ts` | POST /auth/send-code |
| `verifyAndSignIn(phone, code)` | `services/auth/phoneAuthService.ts` | POST /auth/verify-code + setSession |
| `createProfileIfNotExists(user)` | `services/auth.ts` | Cria perfil se não existir (legacy) |
| `apiClient` | `services/api/apiClient.ts` | Axios instance com baseURL |
| `getDashboardStats(period)` | `services/dashboard.ts` | Stats do dashboard |

---

## 11. Segurança

### 11.1 OWASP Mobile Top 10 Assessment

| Categoria | Status | Notas |
|-----------|--------|-------|
| **M1: Improper Platform Usage** | ⚠️ | Expo actualizado, permissões não auditadas |
| **M2: Insecure Data Storage** | 🔴 CRITICAL | AsyncStorage para PII (phone, email) |
| **M3: Insecure Communication** | 🔴 CRITICAL | Sem TLS pinning |
| **M4: Insecure Authentication** | ⚠️ | Lockout OK, MFA opcional, Apple/Google OK |
| **M5: Insufficient Cryptography** | ⚠️ | SecureStore OK, AsyncStorage não encriptado |
| **M6: Insecure Authorization** | ✅ RBAC com hierarquia | Backend valida tokens |
| **M7: Client Code Quality** | ⚠️ | Sem testes, sem buffer overflow óbvio |
| **M8: Code Tampering** | 🔴 CRITICAL | Sem code signing + jailbreak detection |
| **M9: Reverse Engineering** | ❌ | Sem obfuscation/ProGuard |
| **M10: Extraneous Functionality** | ⚠️ | `login.tsx.phone` — dead code |

### 11.2 Medidas de Segurança Implementadas

| Medida | Localização | Status |
|--------|-------------|--------|
| Helmet headers | `backend/src/index.js` | ✅ |
| CORS restrito | `backend/src/index.js` | ✅ (produção) |
| Rate limiting | `backend/src/middleware/rateLimiter.js` | ✅ |
| Service role key apenas server-side | `backend/src/services/supabaseService.js` | ✅ |
| Row Level Security | `supabase-migrations-*.sql` | ✅ (todas as tabelas) |
| RBAC hierarchy | `supabase-migrations-phase4.sql` | ✅ |
| Audit logging | `auth_audit_logs` table | ✅ |
| Session timeout 30min | `providers/AuthProvider.tsx` | ✅ |
| Lockout 5 tentativas | `providers/AuthProvider.tsx` | ✅ |
| SecureStore for tokens | `store/authStore.ts` | ✅ |
| Twilio Verify (no OTP manual) | `backend/src/services/twilioService.js` | ✅ |
| Input validation | `backend/src/utils/validators.js` | ✅ |

### 11.3 Medidas de Segurança em Falta

| Medida | Severidade | Descrição |
|--------|-----------|-----------|
| **TLS Pinning** | 🔴 CRITICAL | Protecção contra MITM em Wi-Fi público |
| **SecureStore para PII** | 🔴 CRITICAL | AsyncStorage não encriptado expõe dados |
| **Jailbreak/Root detection** | 🔴 CRITICAL | Dispositivos comprometidos sem protecção |
| **Code signing verification** | 🔴 CRITICAL | Prevenir tampering do APK/IPA |
| **ProGuard/DexGuard** | 🟠 MAJOR | Ofuscação de código Android |
| **Biometric authentication** | 🟠 MAJOR | Face ID/Touch ID para dados sensíveis |
| **Error Boundaries** | 🟠 MAJOR | Prevenir crash total da app |

---

## 12. Monetização e Planos

### 12.1 Planos de Subscrição

| Plano | Preço | Destaque | Cor |
|-------|-------|----------|-----|
| **Free** | $0.00/mês | Acesso comunitário básico | Cinza |
| **Basic** | $27.99/mês | Consultoria legal + immigração | Verde |
| **Pro** | $29.99/mês | Tudo do Basic + prioridade + documentos | Azul |
| **Premium** | $33.99/mês | Tudo do Pro + ilimitado + dedicado | Roxo |

### 12.2 Problemas com Preços

| Problema | Descrição |
|----------|-----------|
| Diferença Basic/Pro | Apenas $2 de diferença — causa "analysis paralysis" |
| Sem free trial | Apps US bem-sucedidas usam trial 7-30 dias |
| Sem win-back flow | Sem estratégia pós-cancelamento |
| **CRITICAL: Sem IAP** | Usa Stripe directo → viola App Store/Play Store |

### 12.3 Recomendação de Preços (Mercado US)

```
Free     → $0.00
Basic    → $19.99
Pro      → $34.99
Premium  → $49.99
```

---

## 13. Internacionalização

### 13.1 Idiomas Disponíveis

| Idioma | Ficheiro | Qualidade |
|--------|----------|-----------|
| 🇺🇸 English | `assets/translations/en.json` | ✅ Completo (fallback actual) |
| 🇵🇹 Portuguese | `assets/translations/pt.json` | ✅ Completo |
| 🇫🇷 French | `assets/translations/fr.json` | ✅ Completo |
| 🇪🇸 Spanish | `assets/translations/es.json` | Parcial — falta es-US |
| 🇨🇳 Chinese (Simplified) | `assets/translations/zh.json` | ✅ Completo |
| 🇯🇵 Japanese | `assets/translations/ja.json` | ✅ Completo |
| 🇰🇷 Korean | `assets/translations/ko.json` | ✅ Completo |
| 🇻🇳 Vietnamese | `assets/translations/vi.json` | ✅ Completo |
| 🇵🇭 Tagalog (Filipino) | `assets/translations/tl.json` | ✅ Completo |
| 🇸🇦 Arabic | `assets/translations/ar.json` | ✅ Completo |
| 🇷🇺 Russian | `assets/translations/ru.json` | ✅ Completo |
| 🇮🇳 Hindi | `assets/translations/hi.json` | ✅ Completo |
| 🇧🇩 Bengali | `assets/translations/bn.json` | ✅ Completo |

### 13.2 Problemas de i18n

| Problema | Severidade | Descrição |
|----------|-----------|-----------|
| Sem es-US | 🟠 MAJOR | Hispânicos = maior minoria linguística nos EUA |
| Strings não traduzidas | 🟡 MINOR | Muitos textos na UI não estão em i18n |
| 13 línguas sem manutenção | 🟡 MINOR | Sem processo de actualização de traduções |

---

## 14. Critical Blockers

### 14.1 Para App Store / Google Play Submission

| # | Blocker | Guideline | Risco |
|---|---------|-----------|-------|
| 1 | **Usar Stripe para subscrições digitais** | App Store 3.1.1 / Play Payments Policy | 🔴 REJEIÇÃO GARANTIDA |
| 2 | **Sem Privacy Policy** | App Store 5.1.1 / Play Data Safety | 🔴 REJEIÇÃO GARANTIDA |
| 3 | **Sem Terms of Service** | App Store / Play Legal | 🔴 REJEIÇÃO GARANTIDA |
| 4 | **Sem Login com Apple (em telas de email)** | App Store 4.8 | 🔴 REJEIÇÃO SE TIVER LOGIN SOCIAL (email login) |
| 5 | **Sem VoiceOver/TalkBack** | ADA / WCAG 2.1 AA | 🔴 RISCO LEGAL |
| 6 | **Sem CCPA Data Deletion** | California Consumer Privacy Act | 🔴 RISCO LEGAL |
| 7 | **Dados sensíveis em AsyncStorage** | CCPA / OWASP M2 | 🔴 RISCO DE SEGURANÇA |
| 8 | **Sem TLS Pinning** | OWASP M3 | 🔴 MITM VULNERABLE |

### 14.2 Para Produção (US Market)

| # | Issue | Severidade | Descrição |
|---|-------|-----------|-----------|
| 9 | Sem crash reporting | MAJOR | Sem Sentry/Crashlytics |
| 10 | Sem analytics | MAJOR | Sem Firebase/Amplitude |
| 11 | Sem testes | MAJOR | Zero unit/integration/E2E |
| 12 | Sem experiência offline | MAJOR | App inutilizável sem internet |
| 13 | Apple login não aparece em telas de email | MINOR | Login com Apple existe na tela login.tsx, mas não noutros fluxos (phone auth) |
| 14 | Sem deep links universais | MAJOR | Password reset links não funcionam |

---

## 15. Major Issues

### 15.1 Dívida Técnica

| # | Issue | Local | Descrição |
|---|-------|-------|-----------|
| 1 | **Monolithic Screens** | profile.tsx (1604 linhas), support.tsx (1173), learn.tsx (1161), documents.tsx (1015), dashboard.tsx (977) | Ecrãs > 1000 linhas — violam responsabilidade única |
| 2 | **State Management Inconsistente** | Context + Zustand + React Query | 3 sistemas sem fronteiras claras |
| 3 | **Zero Testes** | Nenhum ficheiro de teste | Cada alteração é um risco |
| 4 | **Código Duplicado** | Múltiplos ecrãs | Lógica de fetch/submissão repetida sem hooks |
| 5 | **Components Genéricos Insuficientes** | Falta design system | Cada ecrã implementa estilos próprios |
| 6 | **Error Handling Inconsistente** | Espalhado | Alguns ecrãs tratam erros, outros não |
| 7 | **Código Morto** | `app/(auth)/login.tsx.phone` | Artifact não usado |
| 8 | **AuthProvider Monolítico** | `providers/AuthProvider.tsx` (686 linhas) | Demasiadas responsabilidades |
| 9 | **i18n Fallback EN correcto** | `lib/i18n.ts` | Fallback é EN (não PT) |
| 10 | **Números Mágicos** | Espalhado | Cores, sizes, timings hardcoded |

### 15.2 Performance

| Aspecto | Status | Notas |
|---------|--------|-------|
| Hermes engine | ✅ Configurado | Metro config |
| Bundle size | ⚠️ Não verificado | Precisa de `expo-analyze` |
| Image optimisation | ⚠️ Parcial | `expo-image` sem lazy loading |
| FlatList optimisation | ⚠️ Duvidoso | Ecrãs grandes sem virtualização |
| JS thread blocking | ⚠️ Risco | Cálculos na UI thread |
| Memory leaks | ⚠️ Risco | `useEffect` sem cleanup |
| Reanimated worklets | ⚠️ Misturado | Moti + Animated API clássica |

---

## 16. Todos os Ficheiros

### 16.1 Root (12 ficheiros)

| # | Ficheiro | Descrição |
|---|----------|-----------|
| 1 | `package.json` | Dependências do projecto |
| 2 | `package-lock.json` | Lock file |
| 3 | `tsconfig.json` | TypeScript config |
| 4 | `app.json` | Expo configuration |
| 5 | `eas.json` | EAS Build config |
| 6 | `.gitignore` | Git ignore |
| 7 | `README.md` | Project instructions |
| 8 | `AGENTS.md` | DB schema reference |
| 9 | `ANALISE_COMPLETA_KIZOLA_PROTECT.md` | This file |
| 10 | `supabase-migrations-phase4.sql` | Housing, Finance, RBAC, Audit |
| 11 | `supabase-migrations-documents.sql` | Documents + Storage |
| 12 | `supabase-migration-remove-insert-policy.sql` | Policy fix |
| 13 | `supabase-migration-correcoes.sql` | Corrections |

### 16.2 App (34 ficheiros)

| # | Ficheiro | Linhas | Descrição |
|---|----------|--------|-----------|
| 1 | `app/_layout.tsx` | 64 | Root layout |
| 2 | `app/index.tsx` | — | Entry |
| 3 | `app/+not-found.tsx` | — | 404 |
| 4 | `app/+native-intent.tsx` | — | Deep links |
| 5 | `app/auth.tsx` | — | Auth landing |
| 6 | `app/login.tsx` | — | Email login |
| 7 | `app/login-phone.tsx` | 259 | Phone login |
| 8 | `app/register.tsx` | — | Register |
| 9 | `app/forgot-password.tsx` | — | Reset request |
| 10 | `app/reset-password.tsx` | — | New password |
| 11 | `app/onboarding.tsx` | — | Onboarding |
| 12 | `app/(auth)/_layout.tsx` | 10 | Auth layout |
| 13 | `app/(auth)/verify.tsx` | 290 | OTP verify |
| 14 | `app/(auth)/login.tsx.phone` | — | **DEAD FILE** |
| 15 | `app/(app)/_layout.tsx` | 138 | App layout |
| 16 | `app/(app)/dashboard.tsx` | 977 | Dashboard |
| 17 | `app/(app)/benefits.tsx` | — | Benefits |
| 18 | `app/(app)/activity.tsx` | — | Activity |
| 19 | `app/(app)/learn.tsx` | 1161 | Learning |
| 20 | `app/(app)/support.tsx` | 1173 | Support |
| 21 | `app/(app)/profile.tsx` | 1604 | Profile |
| 22 | `app/(app)/plans.tsx` | — | Plans |
| 23 | `app/(app)/plan-details.tsx` | — | Plan detail |
| 24 | `app/(app)/checkout.tsx` | — | Checkout |
| 25 | `app/(app)/documents.tsx` | 1015 | Documents |
| 26 | `app/(app)/housing-support.tsx` | — | Housing |
| 27 | `app/(app)/finance-support.tsx` | — | Finance |
| 28 | `app/(app)/admin/_layout.tsx` | — | Admin layout |
| 29 | `app/(app)/admin/dashboard.tsx` | — | Admin dash |
| 30 | `app/(app)/admin/users.tsx` | — | Users |
| 31 | `app/(app)/admin/cases.tsx` | — | Cases |
| 32 | `app/(app)/admin/support.tsx` | — | Support queue |
| 33 | `app/(app)/admin/finance.tsx` | — | Finance queue |
| 34 | `app/(app)/admin/reports.tsx` | — | Reports |
| 35 | `app/(app)/admin/audit.tsx` | — | Audit |

### 16.3 Backend (10 ficheiros)

| # | Ficheiro | Descrição |
|---|----------|-----------|
| 1 | `backend/package.json` | Dependências |
| 2 | `backend/src/index.js` | Server entry |
| 3 | `backend/src/routes/authRoutes.js` | Routes |
| 4 | `backend/src/controllers/authController.js` | Auth logic |
| 5 | `backend/src/controllers/profileController.js` | Profile logic |
| 6 | `backend/src/services/twilioService.js` | Twilio Verify |
| 7 | `backend/src/services/supabaseService.js` | Admin user mgmt |
| 8 | `backend/src/middleware/rateLimiter.js` | Rate limiting |
| 9 | `backend/src/middleware/errorHandler.js` | Error handler |
| 10 | `backend/src/utils/validators.js` | Input validation |
| 11 | `backend/src/utils/logger.js` | Logger |

### 16.4 Providers (3 ficheiros)

| # | Ficheiro | Linhas | Descrição |
|---|----------|--------|-----------|
| 1 | `providers/AuthProvider.tsx` | 686 | Auth state |
| 2 | `providers/ThemeProvider.tsx` | — | Theme |
| 3 | `providers/NotificationProvider.tsx` | — | Notifications |

### 16.5 Components (6 ficheiros)

| # | Ficheiro | Descrição |
|---|----------|-----------|
| 1 | `components/AuthRedirect.tsx` | 32 | Auth redirect |
| 2 | `components/KizolaLogo.tsx` | — | Logo |
| 3 | `components/AdminStatCard.tsx` | — | Stats card |
| 4 | `components/SatisfactionModal.tsx` | — | Survey |
| 5 | `components/auth/PhoneInput.tsx` | — | Phone input |
| 6 | `components/auth/OtpInput.tsx` | — | OTP boxes |

### 16.6 Services + Hooks + Store + Lib (11 ficheiros)

| # | Ficheiro | Descrição |
|---|----------|-----------|
| 1 | `services/auth.ts` | Legacy profile |
| 2 | `services/dashboard.ts` | Dashboard API |
| 3 | `services/auth/phoneAuthService.ts` | Phone auth |
| 4 | `services/api/apiClient.ts` | Axios client |
| 5 | `services/ai/gemini.ts` | Gemini AI |
| 6 | `services/ai/groq.ts` | Groq AI |
| 7 | `hooks/usePhoneAuth.ts` | OTP hook |
| 8 | `hooks/useRBAC.ts` | RBAC hook |
| 9 | `store/authStore.ts` | Zustand store |
| 10 | `lib/supabase.ts` | Supabase client |
| 11 | `lib/i18n.ts` | i18n config |

### 16.7 Supabase Functions (2)

| # | Ficheiro | Descrição |
|---|----------|-----------|
| 1 | `supabase/functions/create-checkout-session/index.ts` | Stripe checkout |
| 2 | `supabase/functions/stripe-webhook/index.ts` | Stripe webhook |

### 16.8 Assets (9 ficheiros)

| # | Ficheiro | Descrição |
|---|----------|-----------|
| 1-4 | `assets/images/*.png` | App icons |
| 5-8 | `assets/onboarding/*.png` | Onboarding images |
| 9-21 | `assets/translations/*.json` | Translations (13 línguas) |

---

## 17. Supabase Migrations

### 17.1 `supabase-migrations-phase4.sql` (540 linhas)

Cria:
- `auth_audit_logs` — Logs de segurança
- `housing_requests` — Pedidos de habitação
- `finance_requests` — Pedidos financeiros
- `satisfaction_ratings` — Avaliações
- RBAC policies para todas as tabelas
- Função `has_role()`
- Função `get_satisfaction_rate()`
- View `admin_cases_overview`
- Trigger `update_updated_at_column`
- Índices de performance

### 17.2 `supabase-migrations-documents.sql` (93 linhas)

Cria:
- `documents` table
- Storage bucket `documents`
- RLS policies para documents + storage
- Índices

---

## 18. Plano de Acção

### 18.1 Imediato (Antes de Submeter à App Store)

| # | Tarefa | Prioridade | Esforço |
|---|--------|-----------|---------|
| 1 | Migrar Stripe → Apple IAP + Google Play Billing | 🔴 CRITICAL | 3-5 dias |
| 2 | Adicionar ecrãs Privacy Policy + Terms of Service | 🔴 CRITICAL | 1-2 dias |
| 3 | Adicionar `accessibilityLabel` + `accessibilityRole` a todos os componentes | 🔴 CRITICAL | 2-3 dias |
| 4 | Migrar PII de AsyncStorage para SecureStore | 🔴 CRITICAL | 1 dia |
| 5 | Implementar TLS pinning no Axios | 🔴 CRITICAL | 1 dia |
| 6 | Rever fluxo Apple Login (aparece só em email login) | 🔴 CRITICAL | 1 dia |
| 7 | Implementar CCPA data deletion flow | 🔴 CRITICAL | 2 dias |

### 18.2 Curto Prazo (Antes do Lançamento US)

| # | Tarefa | Prioridade | Esforço |
|---|--------|-----------|---------|
| 8 | Implementar testes unitários (Jest + RNTL) | 🟠 MAJOR | 5-7 dias |
| 9 | Refactor ecrãs > 1000 linhas em hooks + componentes | 🟠 MAJOR | 3-5 dias |
| 10 | Implementar NetInfo + cache offline (TanStack Query) | 🟠 MAJOR | 2-3 dias |
| 11 | Adicionar Firebase Crashlytics + Analytics | 🟠 MAJOR | 2 dias |
| 12 | Corrigir i18n: fallback EN, adicionar es-US | 🟠 MAJOR | 2 dias |
| 13 | Adicionar universal links / app links | 🟠 MAJOR | 1-2 dias |
| 14 | Remover código morto (`login.tsx.phone`) | 🟡 MINOR | < 1 dia |

### 18.3 Médio Prazo (Pós-Lançamento)

| # | Tarefa | Prioridade | Esforço |
|---|--------|-----------|---------|
| 15 | Criar design system (Button, Card, Input, Modal) | 🟡 MINOR | 5 dias |
| 16 | Rever estratégia de pricing (free trial, win-back) | 🟡 MINOR | 2 dias |
| 17 | Performance audit (bundle, memory, FlatList) | 🟡 MINOR | 2 dias |
| 18 | Security hardening (jailbreak, biometric, obfuscation) | 🟡 MINOR | 3-4 dias |
| 19 | E2E tests (Detox/Maestro) | 🟡 MINOR | 5 dias |
| 20 | Configurar Sentry para crash reporting | 🟡 MINOR | 1 dia |

---

## Apêndice A: Checklist App Store / Play Store

| Requisito | Status | Notas |
|-----------|--------|-------|
| Apple IAP / Google Play Billing | ❌ | Usa Stripe |
| Privacy Policy URL | ❌ | Não existe |
| Terms of Service | ❌ | Não existe |
| Login com Apple | ✅ | Implementado com expo-apple-authentication |
| Acessibilidade (VoiceOver/TalkBack) | ❌ | Nenhum label |
| CCPA Data Deletion | ❌ | Não implementado |
| TLS Pinning | ❌ | Sem protecção MITM |
| Crash Reporting | ❌ | Sem Sentry/Crashlytics |
| Analytics | ❌ | Sem Firebase |
| Parental Gate | ❌ | Se classificação 4+ |
| IDFA Consent | ❌ | App Tracking Transparency |
| Classificação etária | ❌ | Não definida |
| Screenshots para listing | ❌ | Não capturados |
| App description | ❌ | Não escrita |

---

## Apêndice B: Variáveis de Ambiente

### Frontend (.env.local)

| Variável | Descrição | Obrigatório |
|----------|-----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | URL do Supabase | Sim |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Anon key do Supabase | Sim |
| `EXPO_PUBLIC_API_URL` | URL do backend Express | Sim (default localhost:3000) |

### Backend (.env)

| Variável | Descrição | Obrigatório |
|----------|-----------|-------------|
| `TWILIO_ACCOUNT_SID` | Account SID | Sim |
| `TWILIO_AUTH_TOKEN` | Auth Token | Sim |
| `TWILIO_VERIFY_SERVICE_SID` | Verify Service SID | Sim |
| `SUPABASE_URL` | URL do Supabase | Sim |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key | Sim |
| `PORT` | Porta (default 3000) | Não |
| `NODE_ENV` | production/development | Não |

---

## Apêndice C: Comandos Úteis

```bash
# Iniciar frontend
npm start

# Iniciar frontend (web)
npm run web

# Iniciar backend
cd backend && npm run dev

# Build Android
eas build --platform android

# Build iOS
eas build --platform ios

# Submeter à App Store
eas submit --platform ios

# Submeter ao Play Store
eas submit --platform android
```

---

**Fim da Análise — Kizola Protect v1.0.0**
