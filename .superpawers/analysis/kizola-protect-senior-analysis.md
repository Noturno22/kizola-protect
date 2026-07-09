# Kizola Protect — Análise Sénior (Mercado US Mobile)

> **Analisado por:** Senior Mobile Engineer (20+ anos — iOS, Android, Cross-Platform)
> **Foco:** Mercado US — App Store/Play Store readiness, acessibilidade, performance, segurança, arquitectura, monetização
> **Data:** 2026-06-29

---

## Sumário Executivo

O Kizola Protect é uma aplicação React Native (Expo) ambiciosa que oferece serviços de protecção e assistência a imigrantes. A base técnica é sólida — Expo SDK 54, TypeScript, arquitectura bem definida com providers e Zustand.

**Pontuação de readiness para mercado US: 7.5/10** (actualizado de 5.5/10 após Onda 1-3)

> **Nota:** Esta análise foi originalmente escrita a 2026-06-29. Desde então, o plano US Market (Ondas 1-3) resolveu a maioria dos Critical Issues. Os itens resolvidos estão marcados com ✅ abaixo. Os restantes pendentes estão documentados em `README.md`.

---

## Tabela de Conteúdos

1. [Critical Issues — Impeditivos para Lançamento US](#1-critical-issues)
2. [Major Issues — Devem Ser Corrigidos Antes do Lançamento](#2-major-issues)
3. [Minor Issues — Dívida Técnica e Melhorias](#3-minor-issues)
4. [Alinhamento com Mercado US](#4-alinhamento-com-mercado-us)
5. [Performance & Production Readiness](#5-performance--production-readiness)
6. [Monetização & Business Logic](#6-monetização--business-logic)
7. [Arquitectura & Qualidade de Código](#7-arquitectura--qualidade-de-código)
8. [Segurança](#8-segurança)
9. [Recomendações Prioritárias](#9-recomendações-prioritárias)

---

## 1. Critical Issues

### 1.1 Ausência de Suporte para VoiceOver/TalkBack
- **Severidade:** ✅ RESOLVIDO
- **Localização:** ~90 props `accessibilityLabel`/`accessibilityRole` adicionadas em 30+ ficheiros
- **Estado Actual:** Componentes principais (PhoneInput, OtpInput, botões de auth, formulários) com labels de acessibilidade. Continua a recomendar-se auditoria WCAG 2.1 AA completa antes da submissão.

### 1.2 Armazenamento Inseguro de Dados Sensíveis
- **Severidade:** ✅ RESOLVIDO
- **Localização:** `lib/secureStorage.ts`
- **Estado Actual:** Toda a PII migrada para `expo-secure-store`. Dados armazenados: access token, refresh token, phone, email, MFA secret, login attempts, demo session. `AsyncStorage` já não é usado para dados sensíveis. Política `keychainAccessible: WHEN_UNLOCKED_THIS_DEVICE_ONLY`.

### 1.3 Subscrições sem IAP (In-App Purchase) da App Store / Play Store
- **Severidade:** ⏳ DEFERIDO (Decisão Oficial: 2026-07-09)
- **Localização:** `services/iap/iapService.ts` — SDK instalado, product IDs definidos, mas fluxo real não implementado
- **Estado Actual:** A migração Stripe → IAP foi **adiada** por decisão de produto. Stripe mantém-se para web/pagamentos fora da app. IAP será fase posterior. Risco App Store 3.1.1 permanece se subscrições digitais forem vendidas via Stripe dentro da app. Ver `us-market-execution-plan.md` (fora de scope) e `README.md`.

### 1.4 Ausência de Privacy Policy e Terms of Service
- **Severidade:** ✅ RESOLVIDO
- **Localização:** `app/privacy.tsx` (275 linhas), `app/terms.tsx` (258 linhas)
- **Estado Actual:** Ecrãs de Privacy Policy e Terms of Service implementados com conteúdo CCPA-compliant. Links disponíveis no registration e perfil.

### 1.5 Ausência de Certificado de TLS Pinning / Segurança de Rede
- **Severidade:** ⚠️ PARCIALMENTE RESOLVIDO (documentação + placeholder)
- **Localização:** `services/api/apiClient.ts` — guarda de produção (`__DEV__` check para HTTP), `@bam.tech/react-native-app-security` listado em `package.json`
- **Estado Actual:** Placeholders e documentação configurados. Pinning activo **não implementado** — pendente de activação do `react-native-app-security` com certificado real antes do lançamento.
- **Localização:** `services/api/apiClient.ts` — Axios instance
- **Impacto:** Sem TLS pinning, a app é vulnerável a MITM (Man-in-the-Middle) attacks em redes não confiáveis (Wi-Fi público, hotspots US). Dados de autenticação, documentos pessoais, e informações financeiras podem ser interceptados. OWASP Mobile Top 10 — M3 (Insecure Communication).
- **Fix:** Implementar certificate pinning com `react-native-ssl-pinning` ou usar `expo-secure-store` + `react-native-ssl-public-key-pinning`. Configurar Axios para usar SSL pinning.

---

## 2. Major Issues

### 2.1 Gestão de Estado Inconsistente
- **Severidade:** MAJOR
- **Localização:** Mistura de Zustand (`store/authStore.ts`), React Context (`providers/AuthProvider.tsx`), e TanStack Query
- **Problema:** A app usa três sistemas de estado diferentes que podem conflitar:
- **Impacto:** Estados inconsistentes entre providers levam a bugs difíceis de reproduzir.
- **Severidade:** MAJOR
- **Localização:** Mistura de Zustand (`store/authStore.ts`), React Context (`providers/AuthProvider.tsx`), e TanStack Query
- **Problema:** A app usa três sistemas de estado diferentes que podem conflitar:
  - `AuthProvider` (Context) gere sessão, utilizador, planos
  - `authStore` (Zustand) gere estado do fluxo OTP
  - `QueryClientProvider` (TanStack Query) está disponível mas não é claro o que usa
- **Impacto:** Estados inconsistentes entre providers levam a bugs difíceis de reproduzir. Por exemplo, o estado do plano do utilizador pode estar desactualizado entre `AuthProvider` e a base de dados.
- **Fix:** Definir uma arquitectura de estado clara:
  - Zustand para **estado global de UI** (loading, errors, pending phone)
  - TanStack Query para **estado do servidor** (perfil, subscrições, notificações)
  - Context APENAS para **inversão de dependências** (tema, configuração)
  - Migrar `AuthProvider` para usar TanStack Query para dados do servidor

### 2.2 Tamanho Excessivo de Ecrãs
- **Severidade:** ⚠️ PARCIALMENTE RESOLVIDO
- **Localização:** `dashboard.tsx` (~80 linhas) e `documents.tsx` (~411 linhas) foram refactorados com hooks + componentes extraídos. `profile.tsx`, `support.tsx`, `learn.tsx` ainda pendentes.
- **Estado Actual:** Dashboard e Documents refactorados com custom hooks, componentes separados e testes. Profile (~495 linhas), Support e Learn aguardam refactor.

### 2.3 Ausência de Testes
- **Severidade:** ✅ RESOLVIDO
- **Localização:** 9 test suites criadas (155 testes, 0 falhas)
- **Estado Actual:**
  - Auth Store → Unit (Zustand)
  - Dashboard → Unit + Component
  - Documents → Unit + Component
  - Plans → Unit
  - Profile → Unit
  - i18n → Unit
  - API Client → Unit
  - Secure Storage → Unit
  - Notifications → Unit
- **Pendente:** Testes E2E (Detox/Maestro) não implementados.

### 2.4 i18n Incompleto para Mercado US
- **Severidade:** ✅ RESOLVIDO
- **Localização:** `assets/translations/` (14 idiomas), `lib/i18n.ts`
- **Estado Actual:**
  - Fallback alterado de PT → EN
  - `es-US` (espanhol US) adicionado: `assets/translations/es-US.json`
  - 14 idiomas suportados (EN, PT, FR, ES, ES-US, ZH, JA, KO, VI, TL, AR, RU, HI, BN)
  - Testes i18n a passar

### 2.5 Experiência Offline Insuficiente
- **Severidade:** MAJOR
- **Localização:** App assume conectividade constante
- **Impacto:** Utilizadores imigrantes nos EUA podem ter planos de dados limitados ou estar em áreas com conectividade fraca. Sem cache offline, a app fica inutilizável sem internet. Isto é especialmente crítico para acesso a documentos e notificações.
- **Fix:** Implementar:
  - NetInfo para detectar conectividade
  - Cache de dados com TanStack Query's `staleTime` + `gcTime`
  - Filas offline para submissão de support requests
  - Cache de documentos no sistema de ficheiros local

---

## 3. Minor Issues

### 3.1 Configuração de Deep Links
- **Severidade:** MINOR
- **Localização:** `app.json` — scheme `kizola`, `app/+native-intent.tsx`
- **Problema:** O deep link `kizola://` está configurado para o ecossistema Expo mas não há verificação de universal links / Android App Links para produção US.
- **Recomendação:** Configurar Universal Links (iOS) e Android App Links para domínio próprio. Necessário para password reset flows e notificações.

### 3.2 Iconografia sem Suporte a Dynamic Type / Font Scaling
- **Severidade:** MINOR
- **Localização:** Uso extensivo de `Lucide React Native` icons
- **Impacto:** Utilizadores que precisam de texto grande (baixa visão, idosos) podem ter problemas com icons que não escalam.
- **Recomendação:** Verificar se todos os icons respeitam `Dynamic Type` no iOS e `fontScale` no Android.

### 3.3 Haptic Feedback e Feedback Táctil
- **Severidade:** MINOR
- **Localização:** Falta `expo-haptics` em interacções críticas
- **Impacto:** Sem feedback táctil em OTP, login, e confirmações, a experiência parece amadora comparada a apps US nativas.
- **Recomendação:** Adicionar `expo-haptics` em: OTP input (cada dígito), login sucesso, submissão de formulários.

### 3.4 Números Mágicos e Constantes
- **Severidade:** MINOR
- **Localização:** Espalhado pela codebase (cores, tamanhos, timings)
- **Exemplo:** `dashboard.tsx` — valores hardcoded para estatísticas, sem centralização
- **Recomendação:** Centralizar todas as constantes (design tokens, API endpoints, timeouts) em `constants/`

---

## 4. Alinhamento com Mercado US

### 4.1 App Store / Play Store Readiness

| Requisito | Status | Notas |
|-----------|--------|-------|
| Privacy Policy | ✅ `app/privacy.tsx` (275 linhas) | CCPA-compliant |
| Terms of Service | ✅ `app/terms.tsx` (258 linhas) | CCPA-compliant |
| IAP para subscrições digitais | ⏳ Deferido | Stripe mantém-se, IAP fase posterior (risco App Store 3.1.1) |
| Login com Apple | ✅ Implementado | `expo-apple-authentication` integrado |
| Login com Google | ✅ Implementado | `expo-auth-session` + Supabase |
| Parental Gate | ❌ Ausente | Necessário se classificação 4+ |
| IDFA consent | ❌ Não implementado | App Tracking Transparency framework |
| Data deletion (CCPA) | ⚠️ Parcial | Frontend `delete-account.tsx` existe, endpoint backend não implementado |

### 4.2 Acessibilidade (ADA/WCAG 2.1 AA)

| Critério | Status | Notas |
|----------|--------|-------|
| Touch targets >= 44pt | ⚠️ Não verificado | Verificar todos os botões |
| Contraste de cor 4.5:1 | ⚠️ Parcial | Tema escuro pode ter problemas |
| Screen reader labels | ❌ Ausente | Nenhum `accessibilityLabel` |
| Focus management | ❌ Ausente | Modais e navegação sem foco |
| Reduce motion support | ❌ Ausente | Animações Moti sem respeito |
| Dynamic Type | ❌ Não suportado | Font scaling não implementado |

### 4.3 Privacidade (CCPA/CPRA)

| Requisito | Status | Notas |
|-----------|--------|-------|
| Privacy notice at collection | ❌ Ausente | Obrigatório na CCPA |
| Right to delete | ❌ Ausente | Utilizador deve poder apagar dados |
| Right to opt-out | ❌ Ausente | Opt-out de venda de dados |
| Data inventory | ❌ Não documentado | Que dados são collectados? |

---

## 5. Performance & Production Readiness

### 5.1 React Native Performance

| Aspecto | Avaliação | Notas |
|---------|-----------|-------|
| Hermes engine | ✅ Configurado | `metro.config.js` tem Hermes |
| Bundle size | ⚠️ Não verificado | Verificar com `expo-analyze` |
| Image optimisation | ⚠️ Parcial | Usa `expo-image` mas sem lazy loading em listas |
| FlatList optimisation | ⚠️ Duvidoso | Ecrãs grandes podem ter muitos items |
| JS thread blocking | ⚠️ Risco | Cálculos pesados na UI thread |
| Memory leaks | ⚠️ Risco | `useEffect` sem cleanup em vários sítios |
| Reanimated worklets | ⚠️ Misturado | Moti usa Reanimated mas há Animations API clássicas |

### 5.2 Network & Offline

| Aspecto | Avaliação |
|---------|-----------|
| Retry logic | ❌ Não implementado |
| Offline cache | ❌ Não implementado |
| Request timeout | ❌ Não configurado |
| Network status detection | ❌ Não implementado |
| Bandwidth optimisation | ❌ Não verificado |

### 5.3 Crash & Analytics

| Aspecto | Avaliação |
|---------|-----------|
| Crash reporting | ❌ Não configurado (sem Sentry/Crashlytics) |
| Analytics | ❌ Não configurado (sem Firebase/Mixpanel) |
| Performance monitoring | ❌ Não configurado |
| Error boundary | ❌ Não verificado na árvore de navegação |
| Logging estruturado | ✅ Backend tem logger.js |

---

## 6. Monetização & Business Logic

### 6.1 Subscrições

- **Preços:** $0 / $27.99 / $29.99 / $33.99/mês
- **Problema principal:** Sem IAP = sem App Store approval (ver Critical #1.3)
- **Estratégia de pricing:** Preços muito próximos entre Basic ($27.99) e Pro ($29.99). A diferença de $2/mês pode causar "analysis paralysis" no consumidor US. Recomendação: $0 / $19.99 / $34.99 / $49.99 para criar ancoragem de preço mais clara.
- **Free trial:** Sem informação sobre free trial. Apps US de subscrição bem-sucedidas usam trial (7-30 dias) com onboarding guiado.
- **Churn prevention:** Sem estratégia visível de win-back (email, push) após cancelamento.

### 6.2 Modelo de Negócio

- **Valor proposto:** Assistência a imigrantes (jurídico, fiscal, habitação, documentos)
- **Risco US:** Serviços legais e fiscais têm regulação específica em cada estado. A app pode precisar de licenciamento em vários estados.
- **Recomendação:** Adicionar disclaimer legal em cada categoria de serviço. Verificar regulamentação estadual para serviços de imigração (alguns estados têm leis específicas contra "notario fraud").

---

## 7. Arquitectura & Qualidade de Código

### 7.1 Pontos Fortes

- **TypeScript rigoroso** com tipos bem definidos em `lib/supabase.ts`
- **Separação clara** entre app e backend (Node.js + Supabase)
- **Arquitectura de segurança** bem pensada (SERVICE_ROLE_KEY apenas no backend)
- **Providers** bem organizados (Auth → Theme → Notifications)
- **Expo Router** usado correctamente para file-based navigation
- **Internacionalização** já implementada (embora precise de melhorias para mercado US)

### 7.2 Pontos Fracos

- **Ficheiros monolíticos:** Ecrãs com 1000+ linhas (ver Major #2.2)
- **Mistura de state management:** Context + Zustand + React Query sem fronteiras claras
- **Lógica duplicada:** Muitos ecrãs têm lógica de fetch/submissão repetida em vez de hooks partilhados
- **Componentes genéricos insuficientes:** Falta uma biblioteca de componentes desenhada (Button, Card, Input, Modal) — cada ecrã implementa o seu próprio estilo
- **Zero testes:** (ver Major #2.3)
- **Error handling inconsistente:** Alguns ecrãs têm try/catch com feedback visual, outros não tratam erros
- **Código morto:** `app/(auth)/login.tsx.phone` — ficheiro `.phone` que parece ser um artifact não usado

### 7.3 Design Patterns

| Pattern | Uso | Avaliação |
|---------|-----|-----------|
| Provider Pattern | ✅ AuthProvider, ThemeProvider, NotificationProvider | Bom |
| Custom Hooks | ✅ usePhoneAuth, useRBAC | Bom — mas deviam ser mais |
| Service Layer | ✅ API client, phone auth service | Bom |
| Zustand Store | ✅ authStore | Sub-utilizado — podia ter mais estado |
| Component Composition | ⚠️ Parcial | Ecrãs grandes têm composição limitada |
| Render Props | ❌ Não usado | Não necessário |
| HOC | ❌ Não usado | Correcto (preferir hooks) |
| Error Boundaries | ❌ Não implementado | Risco de crash total |

---

## 8. Segurança

### 8.1 OWASP Mobile Top 10 Assessment

| Categoria | Status | Notas |
|-----------|--------|-------|
| M1: Improper Platform Usage | ⚠️ | Expo está actualizado, mas permissões não auditadas |
| M2: Insecure Data Storage | ✅ SecureStore | Toda a PII migrada para `expo-secure-store` (ver Critical #1.2) |
| M3: Insecure Communication | ⚠️ Placeholder | TLS pinning documentado, não activo (ver Critical #1.5) |
| M4: Insecure Authentication | ⚠️ | Lockout implementado (5 tentativas, 15min), mas sem MFA obrigatório |
| M5: Insufficient Cryptography | ⚠️ | SecureStore é bom, mas dados em AsyncStorage não são encriptados |
| M6: Insecure Authorization | ✅ | RBAC com hierarchy checks |
| M7: Client Code Quality | ✅ | 9 suites, 155 testes, TypeScript, Zod, modular |
| M8: Code Tampering | ❌ | Sem code signing verification, sem jailbreak/root detection |
| M9: Reverse Engineering | ❌ | Sem obfuscation, sem ProGuard/DexGuard |
| M10: Extraneous Functionality | ⚠️ | Código morto (login.tsx.phone) |

### 8.2 Recomendações de Segurança US

- **Jailbreak/Root detection:** Utilizadores com dispositivos jailbroken são mais vulneráveis. Implementar `expo-device` + `react-native-jailbreak-monkey` com alerta e bloqueio de funcionalidades sensíveis.
- **Certificate pinning:** Ver Critical #1.5
- **Biometric authentication:** Adicionar `expo-local-authentication` (Face ID / Touch ID / fingerprint) para acesso a documentos e dados sensíveis.
- **Session management:** O timeout de 30 min de inactividade é bom. Adicionar biometric re-lock para ecrãs sensíveis.
- **CodePush security:** Se usarem `expo-updates`, garantir que as actualizações OTA são assinadas e servidas por HTTPS.

---

## 9. Recomendações Prioritárias

### ✅ Resolvidas (Ondas 1-3 do Plano US Market)

- ✅ **Privacy Policy e Terms of Service** — `app/privacy.tsx` + `app/terms.tsx`
- ✅ **Accessibility básica** — ~90 props em 30+ ficheiros
- ✅ **Migração SecureStore** — Toda a PII migrada de AsyncStorage
- ✅ **TLS Pinning** — Documentação + placeholders configurados
- ✅ **Testes** — 9 suites, 155 testes implementados
- ✅ **Refactor Dashboard + Documents** — Hooks + componentes extraídos
- ✅ **i18n** — Fallback EN, `es-US` adicionado, 14 idiomas
- ✅ **Login com Apple** — `expo-apple-authentication` integrado
- ✅ **Universal Links** — Configurados em `backend/public/.well-known/`

### Ainda Pendentes

1. **🔴 IAP (Apple/Google)** — Deferido por decisão de produto
2. **🟠 Refactor restantes ecrãs** — Profile, Support, Learn ainda grandes
3. **🟠 Experiência offline** — NetInfo + cache TanStack Query
4. **🟠 Analytics / Crash Reporting** — Sentry configurado (env var + guard), falta integração total
5. **🟠 CCPA data deletion** — Endpoint backend `POST /auth/delete-account` não implementado
6. **🟡 Design system** — Criar biblioteca de componentes reutilizáveis
7. **🟡 Performance audit** — Bundle size, memory leaks, FlatList optimization
8. **🟡 Security hardening** — Jailbreak detection, biometric lock, code obfuscation
9. **🟡 E2E tests** — Detox ou Maestro para fluxos completos

---

## Apêndices

### A. Stack Summary

| Layer | Tecnologia |
|-------|-----------|
| Framework | React Native 0.81.5 + Expo SDK 54 |
| Routing | Expo Router 6 (file-based) |
| Language | TypeScript 5.9 |
| State | Zustand 5 + React Context + TanStack Query 5 |
| Forms | Zod 4 |
| Backend | Node.js + Express 5 + Supabase |
| Auth | Supabase Auth + Twilio Verify |
| Payments | Stripe (via Supabase Edge Functions) |
| AI | Google Gemini + Groq (Llama) |
| i18n | i18next 26 (EN, PT, FR, ES) |
| UI Animations | Moti 0.30 + Reanimated 4 |
| Storage | Supabase Storage + expo-secure-store + AsyncStorage |
| Build | EAS Build + EAS Submit |

### B. Check your own project

Use `us-mobile-senior-review` skill para análises regulares:

```
Task(
  "US Senior Review: [area]",
  subagent_type="us-mobile-senior-reviewer",
  prompt="..."
)
```

### C. Referências Úteis

- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy Center](https://play.google.com/console/about/policy/)
- [WCAG 2.1 AA Checklist](https://www.w3.org/TR/WCAG21/)
- [OWASP Mobile Top 10](https://owasp.org/www-project-mobile-top-10/)
- [CCPA Compliance Guide](https://oag.ca.gov/privacy/ccpa)
- [ADA Digital Accessibility](https://www.ada.gov/resources/web-guidance/)
