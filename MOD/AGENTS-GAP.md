# AGENTS.md — Gap Analysis (Resumo)

> O `AGENTS.md` actual cobre apenas schemas de 10 tabelas + Supabase CLI.
> Faltam 17 secções essenciais para agents contribuírem eficazmente.

## Secções em Falta (por prioridade)

### 🔴 Alta
| Secção | Porque | Referência |
|--------|--------|------------|
| Project Overview | Contexto de domínio (imigrantes EUA, subscrições) | `README.md` |
| Tech Stack | Versões exactas, dependências proibidas | `package.json` |
| Navigation Architecture | Expo Router groups, onde colocar ecrãs novos | `app/_layout.tsx`, `app/(app)/_layout.tsx` |
| Auth Flow | Fluxo OTP/Google/Apple, roles, backend endpoints | `hooks/usePhoneAuth.ts`, `backend/src/` |
| Code Conventions | Naming, imports, error handling, TypeScript rules | Código existente |

### 🟡 Média
| Secção | Referência |
|--------|------------|
| Providers & Order | `app/_layout.tsx` (linhas 55-69) |
| Design System | `constants/theme.ts`, `constants/colors.ts` |
| i18n System | `lib/i18n.ts`, `assets/translations/` |
| Backend API | `backend/src/` (controllers, routes, middleware) |
| Supabase RLS | Políticas por tabela, relacionamentos, funções RPC |

### 🟢 Baixa
| Secção | Referência |
|--------|------------|
| Testing | `jest.config.js`, `__tests__/` (9 suites, 155 testes) |
| Payment Flow | `supabase/functions/`, `app/(app)/checkout.tsx` |
| Module Details | `app/(app)/admin/`, `components/documents/` |
| Env Variables | `.env.local`, `backend/.env` |
| Services | Supabase, Twilio, Stripe, Gemini, Groq, Sentry |

## Acção Recomendada

Integrar as secções de alta directamente no `AGENTS.md` principal.
As secções médias/baixas podem ser referenciadas por links a ficheiros específicos.
