# Auditoria: Banco de Dados ↔ App

## Tabelas do Banco de Dados

### ✅ 1. `users` - Usuários OAuth
**Campos:** id, openId, name, email, loginMethod, role, createdAt, updatedAt, lastSignedIn
**Status:** ✅ Correto - Usado pelo sistema de autenticação

### ✅ 2. `celulas` - Células/Grupos
**Campos:** id, nome, lider, telefone, endereco, latitude, longitude, diaReuniao, horario, createdAt, updatedAt
**Usado em:**
- `/app/(tabs)/celulas.tsx` - Lista de células
- `/app/admin/celulas.tsx` - Gerenciamento admin
**Status:** ✅ Correto - Todos os campos são usados

### ⚠️ 3. `inscricoesBatismo` - Inscrições de Batismo
**Campos:** id, nome, dataNascimento, celula, telefone, motivacao, status, dataProcessamento, createdAt, updatedAt
**Usado em:** Não encontrado no app
**Status:** ⚠️ **TABELA NÃO USADA** - Funcionalidade de batismo não implementada no app

### ⚠️ 4. `usuariosCadastrados` - Membros Cadastrados
**Campos:** id, userId, nome, dataNascimento, celula, createdAt, updatedAt
**Usado em:** Possivelmente `/app/lider/membros.tsx`
**Status:** ⚠️ Precisa verificar se está sendo usado corretamente

### ✅ 5. `pedidosOracao` - Pedidos de Oração
**Campos:** id, nome, descricao, categoria, contadorOrando, respondido, testemunho, createdAt, updatedAt
**Usado em:**
- `/app/(tabs)/oracao.tsx` - Lista de pedidos
- `/app/admin/oracao.tsx` - Gerenciamento admin
**Status:** ✅ Correto - Campos recém-adicionados (respondido, testemunho)

### ⚠️ 6. `anotacoesDevocional` - Anotações do Devocional
**Campos:** id, userId, livro, capitulo, texto, createdAt, updatedAt
**Usado em:** `/app/(tabs)/devocional.tsx`
**Status:** ⚠️ Verificar se campos `livro` e `capitulo` estão sendo usados

### ✅ 7. `eventos` - Eventos da Igreja
**Campos:** id, titulo, descricao, data, horario, local, tipo, requireInscricao, createdAt, updatedAt
**Usado em:**
- `/app/(tabs)/agenda.tsx` - Lista de eventos
- `/app/event/[id].tsx` - Detalhes do evento
- `/app/admin/eventos.tsx` - Gerenciamento admin
**Status:** ✅ Correto - Todos os campos são usados

### ✅ 8. `noticias` - Notícias
**Campos:** id, titulo, conteudo, data, imagemUrl, destaque, createdAt, updatedAt
**Usado em:**
- `/app/noticias.tsx` - Lista de notícias
- `/app/admin/noticias.tsx` - Gerenciamento admin
**Status:** ✅ Correto - Campo `imagemUrl` pode não estar sendo usado

### ✅ 9. `avisoImportante` - Aviso Importante
**Campos:** id, titulo, mensagem, ativo, dataExpiracao, createdAt, updatedAt
**Usado em:**
- `/app/(tabs)/index.tsx` - Exibição na home
- `/app/admin/aviso-importante.tsx` - Gerenciamento admin
**Status:** ✅ Correto - Campo `dataExpiracao` pode não estar sendo usado

### ⚠️ 10. `contatosIgreja` - Contatos da Igreja
**Campos:** id, telefone, whatsapp, email, createdAt, updatedAt
**Usado em:** Possivelmente `/app/(tabs)/mais.tsx`
**Status:** ⚠️ Verificar se está sendo usado

---

## Funcionalidades do App SEM Tabela no Banco

### ❌ 1. **Aniversariantes**
**Telas:**
- `/app/aniversariantes.tsx` - Lista de aniversariantes
- `/app/admin/aniversariantes.tsx` - Admin
- `/app/admin/aniversariantes-gerenciar.tsx` - Gerenciamento

**Problema:** Não existe tabela `aniversariantes` no banco de dados!
**Solução:** Criar tabela `aniversariantes` com campos: id, nome, dataNascimento, celula, telefone, createdAt, updatedAt

### ❌ 2. **Contribuições**
**Telas:**
- `/app/contribuicoes.tsx` - Tela de contribuições
- `/app/admin/contribuicao.tsx` - Admin

**Problema:** Não existe tabela `contribuicoes` no banco de dados!
**Solução:** Criar tabela `contribuicoes` com campos: id, userId, valor, tipo, data, comprovante, status, createdAt, updatedAt

### ❌ 3. **Líderes**
**Telas:**
- `/app/admin/lideres.tsx` - Gerenciamento de líderes
- `/app/lider/*` - Várias telas de líder

**Problema:** Não existe tabela `lideres` no banco de dados!
**Solução:** Usar tabela `users` com role="lider" OU criar tabela separada `lideres`

### ❌ 4. **Inscrições em Eventos**
**Telas:**
- `/app/admin/inscricoes-eventos.tsx` - Admin
- `/app/lider/inscritos-eventos.tsx` - Líder

**Problema:** Não existe tabela `inscricoesEventos` no banco de dados!
**Solução:** Criar tabela `inscricoesEventos` com campos: id, eventoId, userId, nome, telefone, status, createdAt, updatedAt

### ❌ 5. **Relatórios**
**Telas:**
- `/app/admin/relatorios.tsx` - Admin
- `/app/lider/relatorio.tsx` - Líder
- `/app/lider/historico.tsx` - Histórico

**Problema:** Não existe tabela para armazenar relatórios!
**Solução:** Criar tabela `relatorios` OU usar dados agregados de outras tabelas

---

## Resumo de Problemas Encontrados

| Problema | Severidade | Impacto |
|----------|-----------|---------|
| Tabela `aniversariantes` não existe | 🔴 CRÍTICO | Funcionalidade não funciona |
| Tabela `contribuicoes` não existe | 🔴 CRÍTICO | Funcionalidade não funciona |
| Tabela `inscricoesEventos` não existe | 🔴 CRÍTICO | Funcionalidade não funciona |
| Tabela `lideres` não existe | 🟡 MÉDIO | Pode usar `users.role` |
| Tabela `relatorios` não existe | 🟡 MÉDIO | Pode usar dados agregados |
| Tabela `inscricoesBatismo` não usada | 🟢 BAIXO | Tabela existe mas não é usada |
| Campo `imagemUrl` em notícias não usado | 🟢 BAIXO | Campo existe mas não é usado |
| Campo `dataExpiracao` em avisoImportante não usado | 🟢 BAIXO | Campo existe mas não é usado |

---

## Ações Recomendadas

### Prioridade ALTA (Funcionalidades Quebradas)
1. ✅ Criar tabela `aniversariantes`
2. ✅ Criar tabela `contribuicoes`
3. ✅ Criar tabela `inscricoesEventos`

### Prioridade MÉDIA
4. ✅ Adicionar role "lider" na tabela `users` OU criar tabela `lideres`
5. ✅ Criar tabela `relatorios` OU implementar queries agregadas

### Prioridade BAIXA
6. ⚠️ Remover tabela `inscricoesBatismo` se não for usada
7. ⚠️ Implementar uso de `imagemUrl` em notícias OU remover campo
8. ⚠️ Implementar uso de `dataExpiracao` em avisos OU remover campo
