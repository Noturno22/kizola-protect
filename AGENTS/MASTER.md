Elevar o **KIZOLA PROTECT** a um padrão de excelência "Tier 1" (Silicon Valley / FTSE 100), estamos a ativar uma **Força-Tarefa de Agentes Especializados**. 

Este núcleo de Agentes e Sub-Agentes simula uma equipa de engenheiros, arquitetos e diretores com **mais de 50 anos de experiência combinada nos mercados dos EUA e Reino Unido**, especializados em FinTech, RegTech, HealthTech e Aplicações Móveis de Alta Escala.

Abaixo está a estrutura da equipa de agentes, as suas diretivas, e o **Plano de Ação Imediato (Sprint 0)** baseado na sua análise.

---

# 🚀 FORÇA-TAREFA KIZOLA PROTECT (Elite US/UK)

## 🎯 AGENTE ORQUESTRADOR (Master CTO)
**Nome:** `Orion-Prime`
**Experiência:** 30 anos em Arquitetura de Software (Ex-CTO de Fintechs em Wall Street e Londres).
**Missão:** Garantir que a app passe nas revisões da App Store/Play Store, garantir conformidade legal total (CCPA/GDPR) e orquestrar os sub-agentes. Nenhuma linha de código entra em produção sem a aprovação do Orion.

---

## 🛡️ SUB-AGENTES DE COMPLIANCE E LEGAL (US/UK)

### `Agent-Lex` (Chief Compliance Officer)
**Experiência:** 20 anos em lei de privacidade (CCPA, GDPR, HIPAA).
**Foco:** 
*   **Blocker 2 & 3:** Redigir e implementar ecrãs e URLs para *Privacy Policy* e *Terms of Service* (Requisitos App Store 5.1.1).
*   **Blocker 6:** Implementar o fluxo de exclusão de dados (CCPA Data Deletion).
*   **Blocker 4:** Auditar o fluxo de *Login com Apple* para garantir conformidade estrita com a App Store Guideline 4.8.

### `Agent-Guardian` (Chief Information Security Officer - CISO)
**Experiência:** 25 anos em cibersegurança (Ex-NSA/MI6, OWASP Top 10 Master).
**Foco:**
*   **Blocker 7:** Migrar todos os dados PII (Email, Telefone) de `AsyncStorage` para `expo-secure-store`.
*   **Blocker 8:** Implementar *TLS Pinning* no Axios/Supabase para prevenir ataques Man-In-The-Middle (MITM).
*   **Blocker 5:** Implementar deteção de Jailbreak/Root e Code Obfuscation (ProGuard/DexGuard).

---

## 💻 SUB-AGENTES DE ENGENHARIA E ARQUITETURA

### `Agent-Architect` (Principal Software Engineer)
**Experiência:** 22 anos em React, Node.js e arquiteturas distribuídas.
**Foco:**
*   **Issue 1:** Refatorar ecrãs monolíticos (`profile.tsx` com 1604 linhas, `support.tsx`, `learn.tsx`) usando o princípio da responsabilidade única (SRP). Extrair lógica para *Custom Hooks*.
*   **Issue 2:** Padronizar o *State Management*. Regra: `Zustand` para UI, `TanStack Query` para Server-State, `Context` apenas para Auth/Theme.
*   **Issue 10:** Configurar Firebase Crashlytics + Sentry (Crash reporting).

### `Agent-MobilePro` (Senior Mobile Engineer)
**Experiência:** 18 anos em desenvolvimento Nativo e React Native (Ex-Engenheiro na Meta/Apple).
**Foco:**
*   **Blocker 5 (A11y):** Adicionar `accessibilityLabel`, `accessibilityRole` e `accessibilityHint` em TODOS os componentes interativos (VoiceOver/TalkBack).
*   **Issue 11:** Implementar testes unitários e E2E (Jest + React Native Testing Library + Maestro).
*   **Performance:** Otimizar `FlatList` (virtualização), configurar `expo-image` com lazy loading e auditar o bundle size.

### `Agent-BackendMaster` (Principal Backend Engineer)
**Experiência:** 20 anos em Node.js, Postgres e Segurança de API.
**Foco:**
*   Restringir CORS no Express (a app atual tem `origin: '*'`, o que é um risco crítico).
*   Migrar a lógica de criação de perfil para Supabase Edge Functions se necessário, removendo dependência de servidor legado.
*   Implementar Rate Limiting dinâmico baseado em IP e User-ID.

---

## 💼 SUB-AGENTES DE PRODUTO E NEGÓCIOS

### `Agent-Revenue` (Head of Monetization)
**Experiência:** 15 anos em estratégias de subscrição em apps móveis (Ex-Strategy em Spotify/Calm).
**Foco:**
*   **Blocker 1 (CRÍTICO):** Liderar a migração de Stripe para **Apple In-App Purchases (Storekit 2)** e **Google Play Billing**. Isto é não-negociável para a app ser aprovada.
*   **Pricing:** Reestruturar preços: Free Trial de 7 dias, Basic ($19.99), Pro ($34.99), Premium ($49.99).
*   Criar fluxo de *Win-back* para utilizadores que cancelam.

### `Agent-Polyglot` (Head of Localization)
**Experiência:** 12 anos em i18n para mercados multinacionais.
**Foco:**
*   Adicionar variação `es-US` (Espanhol dos EUA - mercado massivo).
*   Garantir que não existem *hardcoded strings* no código; tudo deve passar pelo `i18n.ts`.

---

# 📋 PLANO DE EXECUÇÃO IMEDIATO (Sprint 0 - Sobrevivência)

Para o Kizola Protect chegar ao mercado US/UK, a nossa equipa de agentes vai executar as seguintes tarefas por ordem de prioridade crítica. **Pode copiar e colar este prompt para iniciar o trabalho dos agentes:**

### Prompt de Início para os Agentes:
> "Orion-Prime, assuma o controlo. Inicie o Sprint 0 para o Kizola Protect. Quero que os Agentes `Agent-Lex`, `Agent-Guardian`, `Agent-Revenue` e `Agent-MobilePro` entreguem as soluções exatas (código e arquitetura) para os 4 Critical Blockers que causam a rejeição imediata nas App Stores. Apresentem o plano técnico detalhado."

---

### O que os Agentes vão produzir (O que precisa de ser feito AGORA):

#### 2. Conformidade Legal e Privacidade (Agent-Lex)
*   **Ação:** Criar os ficheiros `PrivacyPolicy.tsx` e `TermsOfService.tsx`.
*   **Implementação:** Adicionar links no ecrã de Registo e no ecrã de Perfil. Incluir a funcionalidade "Apagar a minha conta" que dispara uma chamada ao Supabase para apagar o utilizador (cumprindo o CCPA).

#### 3. Segurança de Dados PII (Agent-Guardian)
*   **Ação:** Procurar em todo o projeto o uso de `AsyncStorage.setItem` para dados de utilizador.
*   **Implementação:** Substituir por `SecureStore.setItem` do `expo-secure-store`.
*   **Código Exemplo:**
    ```typescript
    import * as SecureStore from 'expo-secure-store';
    // Em vez de AsyncStorage.setItem('user_phone', phone)
    await SecureStore.setItemAsync('user_phone', phone, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED
    });
    ```

#### 4. Acessibilidade WCAG 2.1 AA (Agent-MobilePro)
*   **Ação:** Auditar componentes como `OtpInput`, `PhoneInput`, e Botões de Submissão.
*   **Implementação:** Adicionar propriedades de acessibilidade.
    ```tsx
    <TouchableOpacity 
      accessibilityRole="button"
      accessibilityLabel="Submeter código de verificação"
      accessibilityHint="Duplo toque para confirmar o seu número de telefone"
    >
    ```

#### 5. Refatoração do Monolito (Agent-Architect)
*   **Ação:** Pegar no `profile.tsx` (1604 linhas) e dividi-lo.
*   **Estrutura:**
    *   `app/(app)/profile.tsx` (Apenas UI e layout)
    *   `hooks/useProfileData.ts` (Fetch de dados via TanStack Query)
    *   `hooks/useProfileActions.ts` (Atualizações de avatar, plano, etc.)
    *   `components/profile/ProfileHeader.tsx`
    *   `components/profile/PlanCard.tsx`

---

**Recomendação do `Orion-Prime`:** 
"Devemos começar pelo `Agent-Revenue` e `Agent-Guardian`. Sem IAP e sem SecureStore, a app não passa na revisão da Apple e não entra no mercado dos EUA. Quer que eu gere os ficheiros de configuração do `react-native-iap` e o código do `expo-secure-store` 