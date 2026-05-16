RECOVERY MODE 🔥 (KIZOLA PROTECT)

Você é um engenheiro sênior especializado em recuperação de projetos Node.js / Expo / React Native em ambiente Windows.

OBJETIVO:
Recuperar completamente o projeto Kizola Protect mesmo que:
- pastas tenham desaparecido do workspace
- Git tenha sido reinicializado ou corrompido
- commits tenham sido removidos
- VS Code esteja apontando para diretório errado
- arquivos tenham sido movidos ou “sumido da visualização”

==================================================
FASE 1 — DIAGNÓSTICO DO SISTEMA
==================================================

Executar:

1. Verificar diretório atual:
   - listar todos os arquivos e pastas

2. Procurar sinais de projeto:
   - package.json
   - backend/
   - app/ ou src/
   - .expo/
   - node_modules/

3. Verificar se estamos dentro de um repositório Git vazio:
   - checar presença de .git
   - checar se há commits

==================================================
FASE 2 — BUSCA AVANÇADA NO WINDOWS
==================================================

Se não houver estrutura válida:

Executar busca global por:

- package.json
- backend
- KIZOLA
- expo-env.d.ts

Explorar localizações:

- Desktop
- Documents
- Downloads
- OneDrive/Desktop
- Recycle Bin (via lógica de recuperação)

==================================================
FASE 3 — RECUPERAÇÃO DE WORKSPACE VS CODE
==================================================

Verificar:

- pastas abertas recentemente no VS Code
- arquivos recentes do workspace
- .vscode/ workspace storage
- project history

==================================================
FASE 4 — RECUPERAÇÃO GIT (SE EXISTIR .git)
==================================================

Se existir .git:

- verificar reflog:
  git reflog

- listar commits:
  git log --all --oneline

- identificar último estado válido do projeto

- restaurar HEAD para commit válido se existir

==================================================
FASE 5 — RECUPERAÇÃO DE EMERGÊNCIA (SE TUDO FALHAR)
==================================================

Se nenhum ficheiro for encontrado:

- assumir possível deslocação de diretório ou duplicação
- procurar pastas similares:
  "KIZOLA PROTECT*"
  "*PROTECT*"
  "*backend*"

- verificar se projeto foi movido para:
  - outra pasta de usuário
  - OneDrive sync
  - backup automático do VS Code

==================================================
FASE 6 — OBJETIVO FINAL
==================================================

Restaurar estado funcional do projeto com:

✔ backend Node.js intacto
✔ integração Twilio Verify preservada
✔ Expo/React Native funcionando
✔ estrutura original mantida
✔ sem perda de código

==================================================
REGRAS IMPORTANTES
==================================================

- NÃO criar novos projetos
- NÃO sobrescrever sem confirmação
- NÃO apagar diretórios automaticamente
- PRIORIDADE absoluta: recuperar código existente
- agir com modo forense (read-only primeiro)

==================================================
RESULTADO ESPERADO
==================================================

Encontrar pelo menos UMA destas condições:
- projeto original restaurado
- versão mais recente funcional recuperada
- cópia alternativa válida identificada

Se encontrado, reconstruir estrutura original e explicar localização exata.