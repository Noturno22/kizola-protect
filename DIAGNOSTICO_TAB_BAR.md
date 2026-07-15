# Diagnóstico — Tab Bar com Erro de Renderização (Kizola)

**Data:** 2026-07-15  
**Dispositivo:** Android  
**Sintoma:** Tab bar mostra glifos em falta ("tofu boxes") em vez de ícones/labels normais, com ícones sobrepostos/distorcidos do lado esquerdo.

---

## Stack Confirmada

| Componente | Versão |
|------------|--------|
| Expo SDK | ~56.0.15 |
| Expo Router | ~56.2.14 |
| React Native | 0.85.3 |
| React | 19.2.3 |

---

## Análise Realizada

### 1. Imports `@react-navigation` — **DESCARTADA**

```
grep -rn "@react-navigation" app/ components/ providers/ lib/ src/
```

**Resultado:** Nenhuma ocorrência encontrada em todo o repositório.

A hipótese de quebra de compatibilidade do SDK 56 com `@react-navigation/*` **não se verifica**. O código usa exclusivamente imports de `expo-router` e `@expo/vector-icons`.

### 2. Chave de tradução `dashboard.welcome` — **DESCARTADA**

| Idioma | Valor |
|--------|-------|
| EN | `"Hello"` |
| PT | `"Olá"` |

Ambos são curtos e adequados para labels de tab bar. Não contribuem para distorção.

### 3. TabBarIcons.tsx — **NÃO EXISTE**

O ficheiro `components/TabBarIcons.tsx` não existe no repositório. Os ícones estão definidos directamente no `_layout.tsx`.

### 4. Biblioteca de ícones na Tab Bar — **Ionicons (font-based)**

O `_layout.tsx` actual usa `Ionicons` de `@expo/vector-icons`:

```tsx
import Ionicons from '@expo/vector-icons/Ionicons';
// ...
tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />
```

**Importante:** O ficheiro `_layout referencia.tsx` (referência) usa `lucide-react-native` (SVG-based), mas o ficheiro activo usa `Ionicons` (font-based).

### 5. Carregamento de fontes — **PROBLEMA IDENTIFICADO**

#### app.config.js — Configuração correcta

```js
[
  'expo-font',
  {
    fonts: [
      'node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf',
    ],
  },
],
```

A fonte `Ionicons.ttf` está configurada para ser carregada via plugin `expo-font`.

#### app/_layout.tsx — **NENHUM CARREGAMENTO ACTIVO**

```tsx
const fontsLoaded = true;   // ← HARDCODED — não carrega nada
const fontError = null;

useEffect(() => {
  if (fontsLoaded || fontError) {
    SplashScreen.hideAsync();
  }
}, []);
```

**Problema:** `fontsLoaded = true` está hardcoded. Não existe nenhuma chamada a `useFonts()` ou `Font.loadAsync()`. O splash screen é escondido imediatamente, potencialmente antes de a fonte Ionicons estar pronta.

---

## Hipótese Mais Provável

### Fonte Ionicons não carregada antes da renderização da Tab Bar

**Mecanismo:**
1. O plugin `expo-font` está configurado no `app.config.js` para carregar `Ionicons.ttf`
2. Mas o root layout não usa `useFonts()` — assume `fontsLoaded = true` sem verificar
3. Se a fonte ainda não estiver pronta quando o `<Tabs>` monta, o React Native renderiza "tofu boxes" (□) para cada glifo da fonte
4. Os ícones sobrepostos à esquerda podem ser o fallback visual quando a métrica da fonte não está disponível

**Porquê tofu e não ícones vazios:** O React Native, ao não encontrar o glifo na fonte (ou quando a fonte ainda não carregou), renderiza o character `.notdef` (□) em vez de omitir o elemento. Isto explica exactamente os "tofu boxes".

---

## Causa Raiz Confirmada

O `<Tabs>` clássico do expo-router usa React Navigation por baixo (Bottom Tab Navigator). No SDK 56, o expo-router desacoplou-se do React Navigation, mas o componente `<Tabs>` continua a depender dele internamente. Isto causa bugs de rendering conhecidos no Android:

- **Issue #42364**: NativeTabs icons and labels render incorrectly
- **Issue #46184**: NativeTabs (Android): first mount renders with no bottom inset reserved
- **Issue #47610**: Android NativeTabs: tab bar attaches/populates after screen content

Os "tofu boxes" e ícones sobrepostos são sintomas deste bug — o React Navigation Bottom Tabs não renderiza correctamente na implementação nativa do SDK 56.

## Solução Aplicada

### Migrar de `<Tabs>` para `<NativeTabs>`

O `<NativeTabs>` do `expo-router/unstable-native-tabs` usa a implementação nativa do Android (Material Design tabs), que renderiza correctamente.

```tsx
// ANTES (bugged)
import { Tabs } from 'expo-router';
<Tabs screenOptions={{...}}>
  <Tabs.Screen name="dashboard" options={{ tabBarIcon: ... }} />
</Tabs>

// DEPOIS (funcional)
import { NativeTabs } from 'expo-router/unstable-native-tabs';
<NativeTabs backgroundColor={...} iconColor={{...}} labelStyle={{...}}>
  <NativeTabs.Trigger name="dashboard">
    <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
    <NativeTabs.Trigger.Icon md="home" />
  </NativeTabs.Trigger>
</NativeTabs>
```

### Ícones: Material Design (nativo Android)

Migrados de `lucide-react-native` (SVG) para Material Design (`md="home"`, etc.) — são vector icons nativos do Android, não dependem de fontes.

| Tab | Antes | Depois |
|-----|-------|--------|
| Home | `<Home size={size} color={color} />` | `md="home"` |
| Benefícios | `<Gift size={size} color={color} />` | `md="card_giftcard"` |
| Actividade | `<ClipboardList size={size} color={color} />` | `md="assignment"` |
| Aprender | `<BookOpen size={size} color={color} />` | `md="menu_book"` |
| Suporte | `<MessageCircle size={size} color={color} />` | `md="chat"` |
| Perfil | `<User size={size} color={color} />` | `md="person"` |
| Admin | `<LayoutDashboard size={size} color={color} />` | `md="dashboard"` |

---

## Checklist de Verificação

- [x] Hipótese 1: Imports `@react-navigation` — Descartada (nenhuma ocorrência no repo)
- [x] Hipótese 2: Chave `dashboard.welcome` longa — Descartada ("Hello"/"Olá" são curtos)
- [x] Hipótese 3: TabBarIcons.tsx inexistente — Confirmado (ícones no `_layout.tsx`)
- [x] Hipótese 4: Fonte Ionicons não carregada — Testada (não resolveu)
- [x] Hipótese 5: Migrar para lucide-react-native SVG — Testada (não resolveu)
- [x] **Causa raiz: `<Tabs>` clássico bugado no Android SDK 56** — **RESOLVIDO com `<NativeTabs>`**

## Notas Adicionais

### Tab bar duplicada?
Os ícones sobrepostos à esquerda podem indicar dois componentes de navegação montados ao mesmo tempo. Verificar que não existe nenhuma bottom bar customizada a renderizar em paralelo com o `<Tabs>` do expo-router.

### Ficheiro `_layout referencia.tsx`
Existe um ficheiro `_layout referencia.tsx` na raiz do projecto que usa `lucide-react-native`. Este ficheiro **não é usado** (está excluído no `tsconfig.json`). Pode servir como referência para migração futura.

### Cache do Metro
Se o problema persistir após as correcções, pode haver cache stale do Metro. Nesse caso:
```bash
npx expo start -c
# ou
rm -rf node_modules/.cache
```
