ATENÇÃO: NÃO ALTERAR MAIS NADA DO PROJECTO EXISTENTE.

Você deve APENAS integrar autenticação por telefone com Twilio Verify + Supabase no projecto atual Kizola Protect sem modificar:
- design existente
- rotas existentes
- componentes existentes
- layout existente
- cores existentes
- lógica existente
- estrutura principal existente

==================================================
OBJETIVO
==================================================

Adicionar SOMENTE:
- login por telefone
- envio OTP Twilio Verify
- verificação OTP
- persistência de sessão
- proteção básica de rotas

SEM REFACTOR GERAL.
SEM REESTRUTURAR O PROJECTO.
SEM MEXER EM TELAS EXISTENTES DESNECESSARIAMENTE.

==================================================
IMPORTANTE
==================================================

NÃO:
- reorganizar pastas
- recriar arquitetura
- substituir navegação
- alterar UI global
- alterar tema
- alterar providers existentes
- alterar Expo Router atual
- alterar configurações do app
- alterar backend existente
- alterar lógica atual

APENAS:
✔ adicionar autenticação telefone
✔ integrar Twilio Verify
✔ integrar Supabase Auth
✔ criar arquivos mínimos necessários

==================================================
VARIÁVEIS EXISTENTES
==================================================

Já configuradas:

TWILIO_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxx
VERIFY_SERVICE_SID=VAxxxxxxxx

Adicionar apenas se faltar:

EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=

==================================================
IMPLEMENTAÇÃO MÍNIMA
==================================================

Criar SOMENTE:

Frontend:
- service auth/twilio
- service supabase
- tela verify OTP
- hook auth
- session persistence

Backend:
- rota send-code
- rota verify-code

==================================================
FLUXO
==================================================

1. usuário digita telefone
2. backend envia OTP usando Twilio Verify
3. usuário digita código
4. backend verifica código
5. Supabase autentica usuário
6. sessão salva
7. usuário entra no app

==================================================
TWILIO VERIFY
==================================================

USAR EXCLUSIVAMENTE:

client.verify.v2.services(
 process.env.VERIFY_SERVICE_SID
)

NÃO:
- criar OTP manual
- usar Map()
- armazenar códigos
- usar fake SMS

==================================================
REGRAS
==================================================

- reutilizar componentes existentes
- reutilizar estilos existentes
- reutilizar navegação existente
- manter compatibilidade total
- alterar apenas o necessário

==================================================
ANTES DE ALTERAR
==================================================

Sempre analisar:
- estrutura atual
- dependências atuais
- providers atuais
- auth atual

E integrar SEM QUEBRAR NADA.

==================================================
RESULTADO FINAL
==================================================

O projecto deve continuar exatamente igual visualmente,
mas agora com:

✔ login telefone funcionando
✔ OTP Twilio funcionando
✔ sessão persistente
✔ Supabase autenticando
✔ tudo estável