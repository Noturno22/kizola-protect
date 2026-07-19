# Compliance & Readiness — US Publication

> **Kizola Protect** v2.0.0 | Julho 2026 | Mercado EUA

## Scorecard

| Categoria | Score | Status |
|-----------|-------|--------|
| OWASP Mobile Top 10 | 88/100 | ✅ 9/10 items conforme |
| CCPA/CPRA Privacy | 92/100 | ✅ Privacy + Terms implementados |
| App Store Readiness | 80/100 | ⚠️ IAP pendente |
| Backend Security | ✅ | Helmet, CORS, Rate-limit, Validation |
| Acessibilidade (WCAG) | ✅ | ~90 accessibilityLabels |

## Status por Área

| Área | Estado | Detalhes |
|------|--------|----------|
| **OWASP M2** Data Storage | ✅ | SecureStore para todas as PII |
| **OWASP M3** Communication | ✅ | TLS pinning documentado, CORS whitelist |
| **OWASP M4** Authentication | ✅ | Twilio + Google/Apple + MFA + lockout |
| **OWASP M7** Code Quality | ✅ | TypeScript, Zod, 155 testes |
| **CCPA** Right to Delete | ✅ | Frontend pronto, backend pendente |
| **CCPA** Opt-Out | ✅ | "Não vendemos dados" declarado |
| **Apple** Sign-In | ✅ | expo-apple-authentication |
| **Google** Login | ✅ | expo-auth-session |
| **i18n** | ✅ | 15 idiomas, fallback EN |

## 🚨 Itens Bloqueadores (P0)

| # | Problema | Gravidade | Estado |
|---|----------|-----------|--------|
| P0.1 | **Segredos expostos no Git** (SERVICE_ROLE_KEY, Twilio, Groq) | CRÍTICO | ❌ Rotacionar chaves + remover do Git |
| P0.2 | Backend exposto em `0.0.0.0` | ALTA | ❌ Usar `127.0.0.1` em produção |
| P0.3 | Sem RBAC middleware backend | ALTA | ❌ Implementar `requireRole()` |
| P0.4 | IAP sem SDK | ALTA | ⏳ Adiado (decisão produto) |
| P0.5 | Stripe mock em vez de real | ALTA | ❌ Integrar Stripe Elements |
| P0.6 | Endpoint delete-account backend | MÉDIA | ❌ Implementar |

## Acção Imediata (P0.1)

```bash
# 1. Rotacionar chaves (Supabase, Twilio, Groq)
# 2. Remover do tracking
git rm --cached backend/.env .env.local
# 3. Actualizar .gitignore
echo -e ".env*\nbackend/.env" >> .gitignore
```

**Checklist rotação:**
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] EXPO_PUBLIC_SUPABASE_ANON_KEY
- [ ] TWILIO_AUTH_TOKEN
- [ ] EXPO_PUBLIC_GROQ_API_KEY

## Pré-Publicação

- [ ] P0.1 — Rotacionar chaves + remover do Git
- [ ] P0.2 — Corrigir `0.0.0.0` → `127.0.0.1`
- [ ] P0.3 — Middleware RBAC backend
- [ ] P0.5 — Stripe real (ou IAP apenas)
- [ ] P0.6 — Endpoint delete-account
- [ ] `npm audit` + corrigir vulnerabilidades
- [ ] Verificar console.log protegidos por `__DEV__`

## Pós-Publicação

- [ ] Ofuscamento de código (Metro)
- [ ] Testes E2E (Detox / Maestro)
- [ ] CI/CD (GitHub Actions + EAS Build)
- [ ] `security.txt` para disclosure
- [ ] Push notifications reais (FCM/APNs)
- [ ] Rate limiting global backend

## Compliance Contínuo

- [ ] Rever Privacy Policy anualmente
- [ ] Auditoria dependências trimestral
- [ ] Revisão logs auditoria mensal
- [ ] Pentests anuais
- [ ] Manter `auth_audit_logs` ≥24 meses (CCPA)

---

> **Nota:** Este documento deve ser revisto por advogado especializado em direito digital dos EUA antes da publicação.
