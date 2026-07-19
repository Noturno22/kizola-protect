# NEXT_STEPS.md — Próximos Passos

> Última actualização: Julho 2026 | Branch: `feature/us-market-phase1`

## 🚨 P0 — CRÍTICO (antes de qualquer publicação)

### Segurança
- [ ] **Rotacionar chaves expostas** — SERVICE_ROLE_KEY, Twilio tokens, Groq API key
- [ ] **Remover `.env` do Git** — `git rm --cached backend/.env .env.local`
- [ ] **Actualizar `.gitignore`** — cobrir todos os `.env*`
- [ ] **Corrigir backend host** — `0.0.0.0` → `127.0.0.1` em produção

### Backend
- [ ] **Implementar RBAC middleware** — `requireRole('admin')` nas rotas admin
- [ ] **Implementar endpoint delete-account** — `POST /auth/delete-account`
- [ ] **Substituir Stripe mock** — integrar Stripe Elements real

---

## 🔧 BUGS CONHECIDOS

### Tradução
- [ ] **Tela Terms/Privacy não traduz** — verificar chaves i18n nos 15 idiomas
- [ ] **Tela Benefits** — traduzir "new services" e cards

### UX
- [ ] **Splash → spinner** — eliminar ecrã de processamento, splash até terminar
- [ ] **Demo mode labels** — remover "auth.demo.Mode" do login

---

## 📋 MÉDIO — Funcionalidades Pendentes

### Subscrições
- [ ] **IAP Apple/Google** — adiado, mas necessário para App Store
- [ ] **Webhook Stripe** — verificar edge functions em produção

### Notificações
- [ ] **Push notifications reais** — FCM (Android) + APNs (iOS)
- [ ] **Notificações por utilizador** — verificar RLS na tabela notifications

### Documentos
- [ ] **Download de documentos** — testar fluxo completo
- [ ] **Preview de PDF** — verificar react-native-pdf

---

## 🎯 MELHORIAS — Pós-Publicação

### Segurança
- [ ] Certificate pinning activo
- [ ] Ofuscamento de código (Metro bundler)
- [ ] `security.txt` para disclosure
- [ ] Pentests anuais

### Testing
- [ ] Testes E2E (Detox / Maestro)
- [ ] CI/CD (GitHub Actions + EAS Build)
- [ ] Testes de integração backend

### Performance
- [ ] FlashList para listas grandes
- [ ] Lazy loading de ecrãs
- [ ] Auditoria de bundle size

### UX
- [ ] Onboarding flow completo
- [ ] Modo offline funcional
- [ ] Acessibilidade avançada (TalkBack/VoiceOver)

---

## 📊 MÉTRICAS DE SUCESSO

| Métrica | Objectivo |
|---------|-----------|
| Testes | 155+ passam |
| OWASP Score | ≥90/100 |
| i18n Coverage | 100% chaves traduzidas |
| Acessibilidade | 100% interactive elements |
| Build | EAS build sem erros |

---

## 🗓️ ROADMAP SUGERIDO

### Fase 1 — Segurança (1 semana)
1. Rotacionar chaves
2. RBAC middleware
3. Delete account endpoint
4. Stripe real

### Fase 2 — UX (1 semana)
1. Corrigir traduções
2. Fix splash/spinner
3. Push notifications

### Fase 3 — Publicação (2 semanas)
1. EAS Build
2. App Store submission
3. Google Play submission
4. Testes E2E

### Fase 4 — Crescimento (contínuo)
1. IAP Apple/Google
2. Analytics
3. A/B testing
4. Localização adicional
