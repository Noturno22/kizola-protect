# Kizola Protect — Análise Sénior (Mercado US Mobile)

> **Analisado por:** Senior Mobile Engineer (20+ anos — iOS, Android, Cross-Platform)
> **Foco:** Mercado US — App Store/Play Store readiness, acessibilidade, performance, segurança, arquitectura, monetização
> **Data:** 2026-06-29

---

## Sumário Executivo

O Kizola Protect é uma aplicação React Native (Expo) ambiciosa que oferece serviços de protecção e assistência a imigrantes. A base técnica é sólida — Expo SDK 54, TypeScript, arquitectura bem definida com providers e Zustand. No entanto, existem **riscos significativos** para lançamento no mercado US que precisam de ser endereçados antes de qualquer submissão à App Store ou Google Play.

**Pontuação de readiness para mercado US: 5.5/10**

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
- **Severidade:** CRITICAL
- **Localização:** Toda a app — falta `accessible`, `accessibilityLabel`, `accessibilityRole` nos componentes
- **Impacto:** Violação da ADA (Americans with Disabilities Act) e WCAG 2.1 AA. Utilizadores cegos ou com baixa visão — uma comunidade significativa nos EUA — não conseguem usar a app. Risco real de processo judicial nos EUA.
- **Exemplo concreto:** O `PhoneInput.tsx` e `OtpInput.tsx` não têm任何 suporte a accessibility. Um utilizante cego não consegue introduzir o número de telefone nem o código OTP.
- **Fix:** Adicionar `accessibilityLabel`, `accessibilityRole`, `accessibilityState` a todos os componentes interactivos. Usar `react-native-accessibility` ou `@react-native-aria` para componentes customizados.

### 1.2 Armazenamento Inseguro de Dados Sensíveis
- **Severidade:** CRITICAL
- **Localização:** `providers/AuthProvider.tsx`, `store/authStore.ts`
- **Impacto:** O `authStore.ts` usa `expo-secure-store` para o token de sessão, o que é correcto. No entanto, a app usa `AsyncStorage` extensivamente para dados em demo mode, incluindo dados de perfil do utilizador. Nos EUA, a CCPA exige protecção adequada de PII. Além disso, `AsyncStorage` não é encriptado — qualquer app maliciosa ou backup não encriptado expõe dados do utilizador.
- **Fix:** Migrar todo o armazenamento de PII para `expo-secure-store`. Para demo mode, implementar `expo-secure-store` com fallback documentado. Nunca armazenar `phone`, `email`, `full_name` em AsyncStorage.

### 1.3 Subscrições sem IAP (In-App Purchase) da App Store / Play Store
- **Severidade:** CRITICAL
- **Localização:** `app/(app)/checkout.tsx` — usa Stripe directamente; `app/(app)/plans.tsx` — selecciona planos
- **Impacto:** **Violação directa das guidelines da App Store (3.1.1) e Google Play (Payments policy).** Apps que vendem subscrições de serviços digitais (conteúdo premium, features do app) SÃO OBRIGADAS a usar IAP da Apple/Google. Usar Stripe directamente para subscrições digitais resulta em **rejeição na App Store e remoção do Google Play**. Isto é um blocker absoluto.
- **Excepção:** Se as subscrições forem apenas para serviços físicos ou serviços fora da app (ex: consultas jurídicas presenciais), aí Stripe pode ser usado. Mas os planos descritos (Free/Basic/Pro/Premium) parecem ser features digitais dentro da app.
- **Fix:** Implementar `expo-in-app-purchases` (Apple IAP + Google Play Billing) para todas as subscrições digitais. Stripe deve ser usado apenas para serviços outside-the-app (ex: pagamento de taxas legais). **Necessária revisão legal urgente.**

### 1.4 Ausência de Privacy Policy e Terms of Service
- **Severidade:** CRITICAL
- **Localização:** App inteira — não há ecrã de privacy policy nem terms of service no onboarding ou registro
- **Impacto:** App Store ( guideline 5.1.1) e Google Play exigem privacy policy para apps que collect dados pessoais. O Kizola Protect collecta nome, email, telefone, documentos — sem privacy policy visível. **Rejeição garantida.**
- **Fix:** Adicionar ecrã de Privacy Policy e Terms of Service no onboarding. Exigir aceitação no registo. Manter ligação no perfil do utilizador.

### 1.5 Ausência de Certificado de TLS Pinning / Segurança de Rede
- **Severidade:** CRITICAL
- **Localização:** `services/api/apiClient.ts` — Axios instance
- **Impacto:** Sem TLS pinning, a app é vulnerável a MITM (Man-in-the-Middle) attacks em redes não confiáveis (Wi-Fi público, hotspots US). Dados de autenticação, documentos pessoais, e informações financeiras podem ser interceptados. OWASP Mobile Top 10 — M3 (Insecure Communication).
- **Fix:** Implementar certificate pinning com `react-native-ssl-pinning` ou usar `expo-secure-store` + `react-native-ssl-public-key-pinning`. Configurar Axios para usar SSL pinning.

---

## 2. Major Issues

### 2.1 Gestão de Estado Inconsistente
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
- **Severidade:** MAJOR
- **Localização:**
  - `app/(app)/profile.tsx` — 1604 linhas
  - `app/(app)/support.tsx` — 1173 linhas
  - `app/(app)/learn.tsx` — 1161 linhas
  - `app/(app)/documents.tsx` — 1015 linhas
  - `app/(app)/dashboard.tsx` — 977 linhas
- **Impacto:** Violação do princípio de responsabilidade única. Ecrãs com 1000+ linhas são impossíveis de testar, debuggar, e manter. Um developer novo no projecto demora horas a entender cada ecrã. Para uma codebase US enterprise, ecrãs devem ter no máximo 200-300 linhas.
- **Fix:** Extrair lógica para custom hooks, componentes filhos. Separar por domínio. Exemplo:
  - `profile.tsx` → `ProfileInfo.tsx` + `useProfile.ts` + `AvatarSection.tsx` + `BeneficiariesSection.tsx`

### 2.3 Ausência de Testes
- **Severidade:** MAJOR
- **Localização:** Nenhum ficheiro de teste encontrado na codebase
- **Impacto:** Sem testes, cada alteração é um risco. Para uma app que lida com dados pessoais, documentos, e subscrições — um bug pode ter consequências legais e financeiras. Nos EUA, apps financeiras e de saúde têm requisitos regulatórios de teste.
- **Fix:** Implementar:
  - Testes unitários com Jest + React Native Testing Library
  - Testes de integração para fluxos críticos (login, subscrição, upload de documentos)
  - Testes E2E com Detox ou Maestro para fluxos de onboarding + checkout

### 2.4 i18n Incompleto para Mercado US
- **Severidade:** MAJOR
- **Localização:** `assets/translations/`
- **Problema:** A app tem 4 línguas (EN, PT, FR, ES) com Português como fallback. No mercado US:
  - **Espanhol US** (Spanglish, termos específicos US) não está contemplado
  - **Fallback para PT** não faz sentido para mercado US — deve ser EN
  - Traduções parciais — muitos textos na UI não estão internacionalizados
- **Impacto:** Utilizadores hispânicos (maior minoria linguística nos EUA) recebem traduções de má qualidade. Fallback incorrecto causa confusão.
- **Fix:** 
  - Mudar fallback para `en`
  - Adicionar perfil de tradução `es-US` (espanhol com termos US)
  - Usar i18next ICU MessageFormat para pluralização correcta em EN/ES
  - Auditoria de strings não traduzidas

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
| Privacy Policy | ❌ Ausente | CRITICAL — rejeição garantida |
| Terms of Service | ❌ Ausente | CRITICAL — rejeição garantida |
| IAP para subscrições digitais | ❌ Stripe directo | CRITICAL — rejeição garantida |
| Login com Apple | ❌ Ausente | Guideline 4.8 — obrigatório se há login social |
| Parental Gate | ❌ Ausente | Necessário se classificação 4+ |
| IDFA consent | ❌ Não implementado | App Tracking Transparency framework |
| Data deletion (CCPA) | ❌ Não implementado | Obrigatório para residentes CA |

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
| M2: Insecure Data Storage | ❌ CRITICAL | AsyncStorage para dados sensíveis (ver Critical #1.2) |
| M3: Insecure Communication | ❌ CRITICAL | Sem TLS pinning (ver Critical #1.5) |
| M4: Insecure Authentication | ⚠️ | Lockout implementado (5 tentativas, 15min), mas sem MFA obrigatório |
| M5: Insufficient Cryptography | ⚠️ | SecureStore é bom, mas dados em AsyncStorage não são encriptados |
| M6: Insecure Authorization | ✅ | RBAC com hierarchy checks |
| M7: Client Code Quality | ⚠️ | Sem testes, mas sem buffer overflow óbvio |
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

### Imediatas (Precisam de ser resolvidas antes de qualquer submissão à App Store)

1. **🔴 Implementar IAP** — Migrar subscrições de Stripe para Apple IAP + Google Play Billing
2. **🔴 Adicionar Privacy Policy e Terms of Service** — No onboarding + ecrã de perfil
3. **🔴 Implementar accessibility básica** — `accessibilityLabel`, `accessibilityRole` nos componentes principais
4. **🔴 Migrar dados sensíveis** de AsyncStorage para SecureStore
5. **🔴 Implementar TLS pinning** no Axios client

### Curto Prazo (Antes do lançamento US)

7. **🟠 Implementar testes** — Jest + RNTL para fluxos críticos
8. **🟠 Refactor ecrãs grandes** — Extrair hooks + componentes (profile, support, dashboard)
9. **🟠 Implementar experiência offline** — NetInfo + cache TanStack Query
10. **🟠 Adicionar analytics e crash reporting** — Firebase Crashlytics + Analytics
11. **🟠 Corrigir i18n** — Fallback EN, adicionar `es-US`, auditar strings não traduzidas
12. **🟠 Implementar Login com Apple** — Obrigatório pela App Store (guideline 4.8)
13. **🟠 Adicionar CCPA data deletion flow** — Utilizador deve poder pedir eliminação de dados

### Médio Prazo (Pós-lançamento)

14. **🟡 Design system** — Criar biblioteca de componentes reutilizáveis
15. **🟡 Estratégia de pricing** — Rever preços, adicionar free trial, win-back flows
16. **🟡 Performance audit** — Bundle size, memory leaks, FlatList optimization
17. **🟡 Security hardening** — Jailbreak detection, biometric lock, code obfuscation
18. **🟡 Universal Links + Android App Links** — Deep links para produção
19. **🟡 E2E tests** — Detox ou Maestro para fluxos completos

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
