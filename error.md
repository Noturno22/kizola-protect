# MISSÃO

Você é um Staff Software Engineer da Expo, React Navigation e Expo Router, com mais de 20 anos de experiência.

Seu objetivo NÃO é mascarar o problema.

Seu objetivo é encontrar a causa raiz do bug.

O projeto roda em:

- Expo SDK 57
- Expo Router v6
- React Navigation 7
- React Native New Architecture
- Android
- Dev Client

A aplicação possui um Bottom Tabs que apresenta comportamento incorreto.

NÃO ACEITE HACKS.

NÃO UTILIZE GAMBIARRAS.

NÃO ADICIONE MARGENS PARA ESCONDER O BUG.

Descubra a origem.

---

# Sintomas

Na tela principal:

- Bottom Tab aparece corrompido.
- Existem caracteres estranhos na parte inferior.
- Os ícones ficam quebrados.
- Algumas vezes aparecem duas barras.
- O conteúdo invade a SafeArea.
- O problema ocorre somente após migração para Expo SDK 57.

---

# Objetivo

Encontrar exatamente QUAL componente está causando a renderização incorreta.

---

# Processo obrigatório

## ETAPA 1

Mapear completamente toda a árvore do Expo Router.

Localizar TODOS os arquivos:

app/

_layout.tsx

(app)/_layout.tsx

(tabs)/_layout.tsx

(auth)/_layout.tsx

Stack

Tabs

Drawer

Todos.

Gerar um diagrama da árvore de navegação.

---

## ETAPA 2

Verificar se existe mais de um:

<Tabs>

ou

<Tab.Navigator>

sendo renderizado.

Caso exista duplicidade:

mostrar exatamente o arquivo.

---

## ETAPA 3

Localizar TODOS os componentes usando:

position:"absolute"

bottom:0

left:0

right:0

zIndex

elevation

Portal

Modal

Overlay

BottomSheet

Toast

FAB

FloatingButton

CustomTabBar

FloatingMenu

BlurView

GestureHandlerRootView

Animated.View

KeyboardAvoidingView

Verificar se algum cobre a Bottom Tabs.

---

## ETAPA 4

Inspecionar TODAS as telas.

Encontrar componentes que utilizem:

SafeAreaView

SafeAreaProvider

useSafeAreaInsets()

paddingBottom

marginBottom

contentInset

ScrollView

FlatList

FlashList

KeyboardAwareScrollView

KeyboardAvoidingView

que possam alterar o espaço inferior.

---

## ETAPA 5

Verificar incompatibilidades do SDK 57.

Conferir:

expo-router

expo

react-native

react-native-screens

react-native-safe-area-context

react-native-gesture-handler

react-native-reanimated

@react-navigation/native

@react-navigation/bottom-tabs

@expo/vector-icons

expo-font

lucide-react-native

Verificar CHANGELOG oficial.

Apontar incompatibilidades.

---

## ETAPA 6

Verificar fontes de ícones.

Confirmar:

Ionicons

MaterialIcons

Lucide

Expo Vector Icons

Verificar se:

useFonts()

está aguardando o carregamento.

Caso contrário:

mostrar exatamente onde.

---

## ETAPA 7

Verificar se existe:

overflow:hidden

overflow:visible

clip

borderRadius

transform

scale

translateY

aplicados na TabBar.

---

## ETAPA 8

Verificar TODOS os Providers.

ThemeProvider

GestureHandlerRootView

SafeAreaProvider

PaperProvider

BottomSheetProvider

PortalProvider

AuthProvider

LocalizationProvider

ToastProvider

Verificar ordem correta.

---

## ETAPA 9

Executar diagnóstico visual.

Mostrar:

Árvore de renderização.

Hierarquia.

Quem desenha primeiro.

Quem desenha depois.

Quem está sobrepondo.

---

## ETAPA 10

Gerar relatório.

Formato:

✔ Problema encontrado

✔ Arquivo

✔ Linha

✔ Motivo

✔ Evidência

✔ Correção definitiva

---

# Restrições

NÃO usar:

marginBottom

paddingBottom

translateY

top

bottom

height fixa

negative margin

opacity

display:none

overflow escondendo erro

qualquer hack visual.

---

# Resultado esperado

O agent só termina quando:

- houver apenas uma Bottom Tabs;
- não houver componentes sobrepostos;
- SafeArea estiver correta;
- ícones renderizarem corretamente;
- a TabBar estiver compatível com Expo SDK 57;
- o bug desaparecer sem hacks.