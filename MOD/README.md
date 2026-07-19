# Kizola Protect 🛡️

**React Native (Expo) + Node.js/Express + Supabase** — Plataforma mobile-first de protecção e assistência para imigrantes nos Estados Unidos.

> **Branch activa:** `feature/us-market-phase1`

---

## Stack

| Layer | Tecnologia |
|-------|-----------|
| Framework | React Native 0.81 + Expo SDK 54 |
| Routing | Expo Router 3 (file-based) |
| Language | TypeScript 5 |
| State | Zustand 5 + TanStack Query 5 + React Context |
| Backend | Node.js + Express 5 |
| Database | Supabase (PostgreSQL) + Auth + Storage |
| Auth | Supabase Auth + Twilio Verify + Google Login + Apple Login |
| Payments | Stripe (Edge Functions) — IAP Apple/Google planeado |
| i18n | i18next (15 idiomas: EN, PT, FR, ES, ES-US, ZH, JA, KO, VI, TL, AR, RU, HI, BN, LN) |
| UI | Moti + Reanimated + expo-image |
| AI | Google Gemini + Groq (Llama) |

---

## Funcionalidades

- **Autenticação:** Telefone (OTP Twilio), Google Login, Apple Login
- **Dashboard:** Visão geral de subscrição, documentos, notificações
- **Planos & Subscrições:** Free / Basic / Pro / Premium (preços US)
- **Suporte:** Pedidos de assistência em categorias múltiplas
- **Habitação:** Pedidos de apoio habitacional
- **Finanças:** Pedidos de ajuda financeira
- **Documentos:** Upload/download/gestão de documentos com Supabase Storage
- **Chat IA:** Assistente com Google Gemini + Groq (Llama)
- **Admin:** Painel administrativo com relatórios, auditoria, utilizadores
- **i18n:** 15 idiomas com fallback EN
- **Notificações:** Push notifications (estrutura preparada)
- **Satisfação:** Feedback e rating pós-atendimento

---

## Testes

| Suite | Tipo |
|-------|------|
| Auth Store | Unit (Zustand) |
| Dashboard | Unit + Component |
| Documents | Unit + Component |
| Plans | Unit |
| Profile | Unit |
| i18n | Unit |
| API Client | Unit |
| Secure Storage | Unit |
| Notifications | Unit |

**Total: 9 suites · 155 testes · 0 falhas**

```bash
npx jest --passWithNoTests
```

---

## Pré-requisitos

- Node.js 20+
- Expo CLI
- Supabase project linked (`supabase link`)
- Twilio Account com Verify Service
- Apple Developer Account (para Apple Login)
- Google Cloud Console project (para Google Login)

---

## Setup

### 1. Variáveis de Ambiente

**Frontend (`.env.local`):**
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_google_ios_client_id
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_google_web_client_id
```

**Backend (`backend/.env`):**
```env
PORT=3000
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_VERIFY_SERVICE_SID=your_twilio_verify_service_sid
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SENTRY_DSN=your_sentry_dsn
```

### 2. Backend

```bash
cd backend
npm install
npm run dev        # http://localhost:3000
```

### 3. Frontend

```bash
npm install
npm start
```

---

## Projecto — Estrutura Principal

```
app/                     # Expo Router pages
├── (app)/               # App stack (autenticado)
│   ├── admin/           # Painel admin
│   ├── docs/            # Documentação de compliance/reports
│   └── ...
├── (auth)/              # Auth stack (login, verify)
├── _layout.tsx          # Root layout
├── terms.tsx            # Terms of Service
└── privacy.tsx          # Privacy Policy
assets/
├── translations/        # i18n JSON files (15 idiomas)
── ...
backend/                 # Express API
└── src/
    ├── controllers/
    ├── middleware/       # Rate limiter, error handler
    ├── routes/
    ├── services/        # Twilio, Supabase admin
    └── utils/
constants/               # Design tokens (theme, spacing, etc.)
hooks/                   # Custom hooks
lib/                     # Core: supabase client, secureStorage, i18n
providers/               # Auth, Theme, Notifications, Offline
services/                # API client, auth, IAP, monitoring, AI
store/                   # Zustand stores
```

---

## Mercado US — Estado

### ✅ Concluído (Ondas 1-3)

| Item | Detalhes |
|------|----------|
| Privacy Policy / Terms of Service | Ecrãs `app/privacy.tsx` + `app/terms.tsx` |
| Apple Login | `expo-apple-authentication` integrado |
| Google Login | Já existente, integrado com Supabase |
| Preços US ($19.99/$34.99/$49.99) | Edge Function + Admin Reports + Audit/Finance |
| SecureStore (PII) | `lib/secureStorage.ts` — tudo migrado de AsyncStorage |
| i18n Fallback PT→EN | `lib/i18n.ts` |
| es-US Translations | `assets/translations/es-US.json` |
| Universal Links | `backend/public/.well-known/` |
| Dashboard/Documents Refactor | Hooks + componentes extraídos |
| Design Tokens | `constants/theme.ts` completo |
| Testes | 9 suites, 155 testes |
| Sentry | Env var + guarda de produção |
| TLS Pinning | Placeholders + documentação |
| Acessibilidade | ~90 `accessibilityLabel` props em 30+ ficheiros |

### ⏳ Pendente / Fora de Scope

| Item | Motivo |
|------|--------|
| IAP (Apple/Google) | Deferido — Stripe mantém-se por enquanto |
| Jailbreak/Root Detection | Não implementado |
| CORS Restriction (`origin: '*'`) | Apenas dev, requer verificação pré-produção |
| RBAC Middleware (backend) | Apenas frontend |
| Rotação de Chaves Expostas | Operação manual (SERVICE_ROLE_KEY, Twilio tokens) |
| iOS `0.0.0.0` → `127.0.0.1` | Produção |
| Delete Account Endpoint | Backend incompleto |

---

## Comandos Úteis

```bash
# Testes
npx jest --passWithNoTests

# Lint
npx expo lint

# Supabase Admin
node scripts/supabase-admin.js tables
node scripts/supabase-admin.js inspect <table>

# Build
npx eas build --platform ios    # iOS
npx eas build --platform android # Android
```
