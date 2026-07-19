# Diagnóstico — Tab Bar (RESOLVIDO)

**Data:** 2026-07-15 | **Dispositivo:** Android | **Estado:** ✅ Resolvido

## Problema

Tab bar mostrava "tofu boxes" (□) em vez de ícones, com ícones sobrepostos.

## Causa Raiz

`<Tabs>` do expo-router usa React Navigation por baixo. No SDK 56, o Bottom Tab Navigator tem bugs conhecidos no Android (issues #42364, #46184, #47610).

## Solução Aplicada

Migrar de `<Tabs>` para `<NativeTabs>` (expo-router/unstable-native-tabs) com ícones Material Design nativos.

```tsx
// ANTES (bugged)
import { Tabs } from 'expo-router';

// DEPOIS (funcional)
import { NativeTabs } from 'expo-router/unstable-native-tabs';
```

| Tab | Ícone |
|-----|-------|
| Home | `md="home"` |
| Benefícios | `md="card_giftcard"` |
| Actividade | `md="assignment"` |
| Aprender | `md="menu_book"` |
| Suporte | `md="chat"` |
| Perfil | `md="person"` |
| Admin | `md="dashboard"` |

## Cache Metro (se problema persistir)

```bash
npx expo start -c
```
