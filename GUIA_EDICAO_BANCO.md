# Guia Completo de Edição do Banco de Dados
## App Igreja Connect - 2ª Igreja Quadrangular de Rondonópolis

**Autor:** Manus AI  
**Data:** 19 de Fevereiro de 2026  
**Versão:** 1.0

---

## Introdução

Este guia apresenta instruções detalhadas sobre como gerenciar todos os dados do aplicativo Igreja Connect através da interface de banco de dados do Manus. O banco de dados PostgreSQL contém 15 tabelas que armazenam informações sobre eventos, células, membros, contribuições e demais funcionalidades do aplicativo.

Todas as alterações realizadas no banco de dados são sincronizadas automaticamente com o aplicativo mobile em tempo real, garantindo que os usuários sempre vejam informações atualizadas.

---

## Como Acessar o Banco de Dados

Para acessar e editar o banco de dados, siga os passos abaixo:

**Passo 1:** Abra o painel do projeto Igreja Connect no Manus.

**Passo 2:** No lado direito da tela, localize e clique no ícone **"Database"** (banco de dados).

**Passo 3:** Você verá a lista completa das 15 tabelas do banco de dados. Clique em qualquer tabela para visualizar e editar seus registros.

**Passo 4:** Para adicionar um novo registro, clique no botão **"+ Add Row"** (ou similar).

**Passo 5:** Para editar um registro existente, clique na linha correspondente, modifique os campos desejados e clique em **"Save"**.

**Passo 6:** Para excluir um registro, clique na linha e depois no botão **"Delete"** (ícone de lixeira).

---

## Tabelas do Banco de Dados

O banco de dados do aplicativo Igreja Connect contém as seguintes tabelas organizadas por categoria:

### Gestão de Usuários
- **users** - Usuários autenticados via OAuth
- **usuariosCadastrados** - Membros cadastrados da igreja

### Células e Liderança
- **celulas** - Grupos de células
- **lideres** - Líderes de células

### Eventos e Atividades
- **eventos** - Cultos, reuniões e eventos especiais
- **inscricoesEventos** - Inscrições de membros em eventos
- **inscricoesBatismo** - Inscrições para batismo

### Comunicação
- **noticias** - Notícias e comunicados
- **avisoImportante** - Aviso destacado na tela inicial
- **contatosIgreja** - Telefones e emails da igreja

### Oração e Devocional
- **pedidosOracao** - Pedidos de oração da congregação
- **anotacoesDevocional** - Anotações pessoais do devocional

### Financeiro
- **contribuicoes** - Dízimos, ofertas e contribuições
- **aniversariantes** - Lista de aniversariantes

### Relatórios
- **relatorios** - Relatórios de células e atividades

---

## 1. Tabela: users

A tabela **users** armazena informações dos usuários autenticados no aplicativo através do sistema OAuth do Manus.

| Campo | Tipo | Descrição | Formato/Exemplo |
|-------|------|-----------|-----------------|
| `id` | Número | Identificador único (gerado automaticamente) | `1`, `2`, `3` |
| `openId` | Texto | Identificador OAuth do Manus (único) | `manus_abc123xyz` |
| `name` | Texto | Nome completo do usuário | `João Silva` |
| `email` | Texto | Email do usuário | `joao@email.com` |
| `loginMethod` | Texto | Método de login usado | `google`, `apple` |
| `role` | Enum | Papel do usuário no sistema | `user`, `admin` |
| `createdAt` | Data/Hora | Data de criação (automático) | `2026-02-19 10:30:00` |
| `updatedAt` | Data/Hora | Última atualização (automático) | `2026-02-19 10:30:00` |
| `lastSignedIn` | Data/Hora | Último login | `2026-02-19 10:30:00` |

**Campos Editáveis:** `name`, `email`, `role`

**Exemplo de Edição:**
Para tornar um usuário administrador, altere o campo `role` de `user` para `admin`.

---

## 2. Tabela: celulas

A tabela **celulas** contém informações sobre os grupos de células da igreja.

| Campo | Tipo | Descrição | Formato/Exemplo |
|-------|------|-----------|-----------------|
| `id` | Número | Identificador único (gerado automaticamente) | `1`, `2`, `3` |
| `nome` | Texto | Nome da célula | `Célula Vida Nova` |
| `lider` | Texto | Nome do líder da célula | `Maria Santos` |
| `telefone` | Texto | Telefone do líder | `(66) 99999-9999` |
| `endereco` | Texto | Endereço completo da reunião | `Rua das Flores, 123 - Centro` |
| `latitude` | Texto | Latitude para mapa | `-16.4708` |
| `longitude` | Texto | Longitude para mapa | `-54.6354` |
| `diaReuniao` | Texto | Dia da semana da reunião | `Terça-feira`, `Quinta-feira` |
| `horario` | Texto | Horário da reunião | `19:30`, `20:00` |
| `createdAt` | Data/Hora | Data de criação (automático) | `2026-02-19 10:30:00` |
| `updatedAt` | Data/Hora | Última atualização (automático) | `2026-02-19 10:30:00` |

**Campos Editáveis:** Todos exceto `id`, `createdAt`, `updatedAt`

**Dica:** Para obter coordenadas geográficas (latitude/longitude), use o Google Maps. Clique com botão direito no local desejado e copie as coordenadas.

---

## 3. Tabela: eventos

A tabela **eventos** armazena informações sobre cultos, reuniões e eventos especiais da igreja.

| Campo | Tipo | Descrição | Formato/Exemplo |
|-------|------|-----------|-----------------|
| `id` | Número | Identificador único (gerado automaticamente) | `1`, `2`, `3` |
| `titulo` | Texto | Título do evento | `Culto de Celebração` |
| `descricao` | Texto | Descrição detalhada | `Culto especial com louvor e pregação` |
| `data` | Texto | Data do evento | `2026-02-25T00:00:00` |
| `horario` | Texto | Horário do evento | `19:30`, `10:00` |
| `local` | Texto | Local do evento | `Templo Central` |
| `tipo` | Texto | Tipo de evento | `culto`, `reuniao`, `evento`, `batismo` |
| `requireInscricao` | Número | Requer inscrição prévia | `0` (não), `1` (sim) |
| `createdAt` | Data/Hora | Data de criação (automático) | `2026-02-19 10:30:00` |
| `updatedAt` | Data/Hora | Última atualização (automático) | `2026-02-19 10:30:00` |

**Campos Editáveis:** Todos exceto `id`, `createdAt`, `updatedAt`

**Formato de Data:** Use o formato ISO `YYYY-MM-DDTHH:MM:SS`. Exemplo: `2026-03-15T00:00:00` para 15 de março de 2026.

**Tipos de Evento:**
- `culto` - Cultos regulares ou especiais
- `reuniao` - Reuniões administrativas ou de oração
- `evento` - Eventos especiais (conferências, retiros)
- `batismo` - Cerimônias de batismo

---

## 4. Tabela: noticias

A tabela **noticias** contém notícias, comunicados e avisos da igreja.

| Campo | Tipo | Descrição | Formato/Exemplo |
|-------|------|-----------|-----------------|
| `id` | Número | Identificador único (gerado automaticamente) | `1`, `2`, `3` |
| `titulo` | Texto | Título da notícia | `Nova Sede Inaugurada` |
| `conteudo` | Texto | Conteúdo completo da notícia | Texto longo com detalhes |
| `data` | Texto | Data de publicação | `2026-02-19T00:00:00` |
| `imagemUrl` | Texto | URL da imagem (opcional) | `https://exemplo.com/foto.jpg` |
| `destaque` | Número | Marcar como destaque | `0` (normal), `1` (destaque) |
| `createdAt` | Data/Hora | Data de criação (automático) | `2026-02-19 10:30:00` |
| `updatedAt` | Data/Hora | Última atualização (automático) | `2026-02-19 10:30:00` |

**Campos Editáveis:** Todos exceto `id`, `createdAt`, `updatedAt`

**Dica:** Notícias marcadas com `destaque = 1` aparecem em posição de maior visibilidade no aplicativo.

---

## 5. Tabela: pedidosOracao

A tabela **pedidosOracao** armazena os pedidos de oração da congregação.

| Campo | Tipo | Descrição | Formato/Exemplo |
|-------|------|-----------|-----------------|
| `id` | Número | Identificador único (gerado automaticamente) | `1`, `2`, `3` |
| `nome` | Texto | Título do pedido | `Cura para Maria` |
| `descricao` | Texto | Descrição detalhada do pedido | `Orar pela cura completa de Maria` |
| `categoria` | Texto | Categoria do pedido | `Saúde`, `Família`, `Trabalho` |
| `contadorOrando` | Número | Quantidade de pessoas orando | `5`, `10`, `20` |
| `respondido` | Número | Status da oração | `0` (ativo), `1` (respondido) |
| `testemunho` | Texto | Testemunho da resposta (opcional) | `Deus curou completamente!` |
| `createdAt` | Data/Hora | Data de criação (automático) | `2026-02-19 10:30:00` |
| `updatedAt` | Data/Hora | Última atualização (automático) | `2026-02-19 10:30:00` |

**Campos Editáveis:** Todos exceto `id`, `createdAt`, `updatedAt`

**Como Marcar Oração como Respondida:**
1. Localize o pedido de oração na tabela
2. Altere o campo `respondido` de `0` para `1`
3. Adicione um testemunho no campo `testemunho` (opcional mas recomendado)
4. Salve as alterações

**Exemplo de Testemunho:**
> "Glória a Deus! Maria foi completamente curada. Os médicos confirmaram que não há mais sinais da doença. Deus é fiel!"

---

## 6. Tabela: avisoImportante

A tabela **avisoImportante** contém o aviso principal que aparece na tela inicial do aplicativo.

| Campo | Tipo | Descrição | Formato/Exemplo |
|-------|------|-----------|-----------------|
| `id` | Número | Identificador único (gerado automaticamente) | `1`, `2`, `3` |
| `titulo` | Texto | Título do aviso | `Culto Especial Domingo` |
| `mensagem` | Texto | Mensagem completa do aviso | `Não perca o culto especial...` |
| `ativo` | Número | Exibir ou ocultar aviso | `0` (oculto), `1` (visível) |
| `dataExpiracao` | Texto | Data de expiração (opcional) | `2026-03-01T00:00:00` |
| `createdAt` | Data/Hora | Data de criação (automático) | `2026-02-19 10:30:00` |
| `updatedAt` | Data/Hora | Última atualização (automático) | `2026-02-19 10:30:00` |

**Campos Editáveis:** Todos exceto `id`, `createdAt`, `updatedAt`

**Importante:** Apenas um aviso pode estar ativo por vez. Quando você cria um novo aviso com `ativo = 1`, os avisos anteriores são automaticamente desativados.

---

## 7. Tabela: aniversariantes

A tabela **aniversariantes** contém a lista de aniversariantes da congregação.

| Campo | Tipo | Descrição | Formato/Exemplo |
|-------|------|-----------|-----------------|
| `id` | Número | Identificador único (gerado automaticamente) | `1`, `2`, `3` |
| `nome` | Texto | Nome completo | `João Silva` |
| `dataNascimento` | Texto | Data de nascimento | `15/03/1990` |
| `celula` | Texto | Célula que participa (opcional) | `Célula Vida Nova` |
| `telefone` | Texto | Telefone de contato (opcional) | `(66) 99999-9999` |
| `createdAt` | Data/Hora | Data de criação (automático) | `2026-02-19 10:30:00` |
| `updatedAt` | Data/Hora | Última atualização (automático) | `2026-02-19 10:30:00` |

**Campos Editáveis:** Todos exceto `id`, `createdAt`, `updatedAt`

**Formato de Data de Nascimento:** Use o formato `DD/MM/YYYY`. Exemplo: `25/12/1985` para 25 de dezembro de 1985.

---

## 8. Tabela: contribuicoes

A tabela **contribuicoes** registra dízimos, ofertas e contribuições financeiras.

| Campo | Tipo | Descrição | Formato/Exemplo |
|-------|------|-----------|-----------------|
| `id` | Número | Identificador único (gerado automaticamente) | `1`, `2`, `3` |
| `userId` | Número | ID do usuário que contribuiu | `1`, `2`, `3` |
| `nome` | Texto | Nome do contribuinte | `João Silva` |
| `valor` | Texto | Valor da contribuição | `R$ 100,00`, `R$ 50,00` |
| `tipo` | Texto | Tipo de contribuição | `dizimo`, `oferta`, `missoes` |
| `data` | Texto | Data da contribuição | `2026-02-19T00:00:00` |
| `comprovanteUrl` | Texto | URL do comprovante (opcional) | `https://exemplo.com/comprovante.jpg` |
| `status` | Enum | Status da contribuição | `pendente`, `confirmado`, `rejeitado` |
| `createdAt` | Data/Hora | Data de criação (automático) | `2026-02-19 10:30:00` |
| `updatedAt` | Data/Hora | Última atualização (automático) | `2026-02-19 10:30:00` |

**Campos Editáveis:** Todos exceto `id`, `createdAt`, `updatedAt`

**Tipos de Contribuição:**
- `dizimo` - Dízimo (10% da renda)
- `oferta` - Ofertas voluntárias
- `missoes` - Contribuições para missões

**Status:**
- `pendente` - Aguardando confirmação
- `confirmado` - Contribuição confirmada
- `rejeitado` - Contribuição rejeitada (ex: comprovante inválido)

---

## 9. Tabela: inscricoesEventos

A tabela **inscricoesEventos** registra as inscrições de membros em eventos que requerem inscrição prévia.

| Campo | Tipo | Descrição | Formato/Exemplo |
|-------|------|-----------|-----------------|
| `id` | Número | Identificador único (gerado automaticamente) | `1`, `2`, `3` |
| `eventoId` | Número | ID do evento relacionado | `1`, `2`, `3` |
| `userId` | Número | ID do usuário inscrito | `1`, `2`, `3` |
| `nome` | Texto | Nome do inscrito | `João Silva` |
| `telefone` | Texto | Telefone de contato | `(66) 99999-9999` |
| `status` | Enum | Status da inscrição | `confirmado`, `cancelado` |
| `createdAt` | Data/Hora | Data de criação (automático) | `2026-02-19 10:30:00` |
| `updatedAt` | Data/Hora | Última atualização (automático) | `2026-02-19 10:30:00` |

**Campos Editáveis:** Todos exceto `id`, `createdAt`, `updatedAt`

**Dica:** O campo `eventoId` deve corresponder ao `id` de um evento existente na tabela **eventos**.

---

## 10. Tabela: lideres

A tabela **lideres** contém informações sobre os líderes de células da igreja.

| Campo | Tipo | Descrição | Formato/Exemplo |
|-------|------|-----------|-----------------|
| `id` | Número | Identificador único (gerado automaticamente) | `1`, `2`, `3` |
| `userId` | Número | ID do usuário (tabela users) | `1`, `2`, `3` |
| `nome` | Texto | Nome completo do líder | `Maria Santos` |
| `celula` | Texto | Nome da célula que lidera | `Célula Vida Nova` |
| `telefone` | Texto | Telefone de contato | `(66) 99999-9999` |
| `email` | Texto | Email do líder (opcional) | `maria@email.com` |
| `ativo` | Número | Status do líder | `0` (inativo), `1` (ativo) |
| `createdAt` | Data/Hora | Data de criação (automático) | `2026-02-19 10:30:00` |
| `updatedAt` | Data/Hora | Última atualização (automático) | `2026-02-19 10:30:00` |

**Campos Editáveis:** Todos exceto `id`, `createdAt`, `updatedAt`

**Dica:** Quando um líder não está mais ativo, altere o campo `ativo` para `0` em vez de excluir o registro. Isso preserva o histórico.

---

## 11. Tabela: relatorios

A tabela **relatorios** armazena relatórios de atividades das células.

| Campo | Tipo | Descrição | Formato/Exemplo |
|-------|------|-----------|-----------------|
| `id` | Número | Identificador único (gerado automaticamente) | `1`, `2`, `3` |
| `liderId` | Número | ID do líder (tabela lideres) | `1`, `2`, `3` |
| `celula` | Texto | Nome da célula | `Célula Vida Nova` |
| `tipo` | Texto | Tipo de relatório | `semanal`, `mensal`, `trimestral` |
| `periodo` | Texto | Período do relatório | `Janeiro 2026`, `Semana 1 - Fev 2026` |
| `presentes` | Número | Número de presentes | `15`, `20`, `30` |
| `novosVisitantes` | Número | Novos visitantes | `2`, `3`, `5` |
| `conversoes` | Número | Número de conversões | `1`, `2`, `0` |
| `observacoes` | Texto | Observações adicionais (opcional) | Texto livre |
| `createdAt` | Data/Hora | Data de criação (automático) | `2026-02-19 10:30:00` |
| `updatedAt` | Data/Hora | Última atualização (automático) | `2026-02-19 10:30:00` |

**Campos Editáveis:** Todos exceto `id`, `createdAt`, `updatedAt`

**Tipos de Relatório:**
- `semanal` - Relatório semanal da célula
- `mensal` - Relatório mensal consolidado
- `trimestral` - Relatório trimestral

---

## 12. Tabela: inscricoesBatismo

A tabela **inscricoesBatismo** registra inscrições para batismo.

| Campo | Tipo | Descrição | Formato/Exemplo |
|-------|------|-----------|-----------------|
| `id` | Número | Identificador único (gerado automaticamente) | `1`, `2`, `3` |
| `nome` | Texto | Nome completo | `João Silva` |
| `dataNascimento` | Texto | Data de nascimento | `15/03/1990` |
| `celula` | Texto | Célula que participa | `Célula Vida Nova` |
| `telefone` | Texto | Telefone de contato | `(66) 99999-9999` |
| `motivacao` | Texto | Motivação para o batismo | Texto livre |
| `status` | Enum | Status da inscrição | `pendente`, `aprovado`, `rejeitado` |
| `dataProcessamento` | Data/Hora | Data de aprovação/rejeição | `2026-02-19 10:30:00` |
| `createdAt` | Data/Hora | Data de criação (automático) | `2026-02-19 10:30:00` |
| `updatedAt` | Data/Hora | Última atualização (automático) | `2026-02-19 10:30:00` |

**Campos Editáveis:** Todos exceto `id`, `createdAt`, `updatedAt`

**Fluxo de Aprovação:**
1. Inscrição criada com `status = pendente`
2. Líder/pastor avalia e altera para `aprovado` ou `rejeitado`
3. Campo `dataProcessamento` é preenchido automaticamente

---

## 13. Tabela: usuariosCadastrados

A tabela **usuariosCadastrados** contém membros cadastrados da igreja.

| Campo | Tipo | Descrição | Formato/Exemplo |
|-------|------|-----------|-----------------|
| `id` | Número | Identificador único (gerado automaticamente) | `1`, `2`, `3` |
| `userId` | Número | ID do usuário (tabela users) | `1`, `2`, `3` |
| `nome` | Texto | Nome completo | `João Silva` |
| `dataNascimento` | Texto | Data de nascimento | `15/03/1990` |
| `celula` | Texto | Célula que participa | `Célula Vida Nova` |
| `createdAt` | Data/Hora | Data de criação (automático) | `2026-02-19 10:30:00` |
| `updatedAt` | Data/Hora | Última atualização (automático) | `2026-02-19 10:30:00` |

**Campos Editáveis:** Todos exceto `id`, `createdAt`, `updatedAt`

---

## 14. Tabela: anotacoesDevocional

A tabela **anotacoesDevocional** armazena anotações pessoais do devocional diário.

| Campo | Tipo | Descrição | Formato/Exemplo |
|-------|------|-----------|-----------------|
| `id` | Número | Identificador único (gerado automaticamente) | `1`, `2`, `3` |
| `userId` | Número | ID do usuário (tabela users) | `1`, `2`, `3` |
| `livro` | Texto | Livro da Bíblia | `João`, `Salmos`, `Gênesis` |
| `capitulo` | Número | Capítulo do livro | `3`, `23`, `1` |
| `texto` | Texto | Anotação do usuário | Texto livre com reflexões |
| `createdAt` | Data/Hora | Data de criação (automático) | `2026-02-19 10:30:00` |
| `updatedAt` | Data/Hora | Última atualização (automático) | `2026-02-19 10:30:00` |

**Campos Editáveis:** Todos exceto `id`, `createdAt`, `updatedAt`

**Dica:** Estas anotações são pessoais de cada usuário. Evite editar anotações de outros usuários.

---

## 15. Tabela: contatosIgreja

A tabela **contatosIgreja** contém informações de contato da igreja.

| Campo | Tipo | Descrição | Formato/Exemplo |
|-------|------|-----------|-----------------|
| `id` | Número | Identificador único (gerado automaticamente) | `1`, `2`, `3` |
| `telefone` | Texto | Telefone principal | `(66) 3421-1234` |
| `whatsapp` | Texto | WhatsApp da igreja | `(66) 99999-9999` |
| `email` | Texto | Email de contato | `contato@igreja.com.br` |
| `createdAt` | Data/Hora | Data de criação (automático) | `2026-02-19 10:30:00` |
| `updatedAt` | Data/Hora | Última atualização (automático) | `2026-02-19 10:30:00` |

**Campos Editáveis:** Todos exceto `id`, `createdAt`, `updatedAt`

**Importante:** Mantenha apenas um registro ativo nesta tabela com os contatos oficiais da igreja.

---

## Boas Práticas

Ao editar o banco de dados, siga estas recomendações para garantir a integridade dos dados e o bom funcionamento do aplicativo:

**Validação de Dados:** Sempre verifique se os dados inseridos estão no formato correto antes de salvar. Datas devem seguir o padrão ISO, telefones devem incluir DDD, e emails devem ser válidos.

**Backup Regular:** Embora o sistema faça backups automáticos, é recomendável exportar dados importantes periodicamente através da interface do banco de dados.

**Testes Após Edição:** Após fazer alterações significativas, abra o aplicativo mobile e verifique se as informações estão sendo exibidas corretamente.

**Campos Obrigatórios:** Campos marcados como `notNull` no schema não podem ficar vazios. Sempre preencha estes campos ao criar novos registros.

**IDs de Relacionamento:** Quando uma tabela referencia outra (como `eventoId` em `inscricoesEventos`), certifique-se de que o ID existe na tabela relacionada.

**Sincronização Automática:** Todas as alterações são sincronizadas automaticamente com o aplicativo em tempo real. Não é necessário reiniciar o app ou fazer qualquer ação adicional.

---

## Exemplos Práticos

Esta seção apresenta exemplos práticos de operações comuns no banco de dados.

### Exemplo 1: Criar um Novo Evento

Para criar um culto especial de domingo:

1. Acesse a tabela **eventos**
2. Clique em **"+ Add Row"**
3. Preencha os campos:
   - `titulo`: `Culto de Celebração`
   - `descricao`: `Culto especial com louvor e pregação da Palavra`
   - `data`: `2026-02-23T00:00:00`
   - `horario`: `19:30`
   - `local`: `Templo Central`
   - `tipo`: `culto`
   - `requireInscricao`: `0`
4. Clique em **"Save"**

O evento aparecerá imediatamente na agenda do aplicativo.

### Exemplo 2: Marcar Oração como Respondida

Para marcar um pedido de oração como respondido e adicionar testemunho:

1. Acesse a tabela **pedidosOracao**
2. Localize o pedido desejado
3. Clique na linha para editar
4. Altere `respondido` de `0` para `1`
5. No campo `testemunho`, escreva: `Glória a Deus! Maria foi completamente curada. Os médicos confirmaram que não há mais sinais da doença. Deus é fiel!`
6. Clique em **"Save"**

O pedido aparecerá com badge verde "Respondido" no aplicativo e o testemunho será exibido para edificar a fé da congregação.

### Exemplo 3: Adicionar Novo Aniversariante

Para adicionar um membro à lista de aniversariantes:

1. Acesse a tabela **aniversariantes**
2. Clique em **"+ Add Row"**
3. Preencha os campos:
   - `nome`: `Maria Santos`
   - `dataNascimento`: `15/03/1985`
   - `celula`: `Célula Vida Nova`
   - `telefone`: `(66) 99999-9999`
4. Clique em **"Save"**

O aniversariante aparecerá automaticamente na lista quando chegar o mês de aniversário.

### Exemplo 4: Atualizar Aviso Importante

Para criar ou atualizar o aviso da tela inicial:

1. Acesse a tabela **avisoImportante**
2. Se já existe um aviso, clique nele para editar. Caso contrário, clique em **"+ Add Row"**
3. Preencha os campos:
   - `titulo`: `Culto Especial Domingo`
   - `mensagem`: `Não perca o culto especial deste domingo às 19h30 com pregação do Pastor convidado!`
   - `ativo`: `1`
   - `dataExpiracao`: `2026-02-24T00:00:00` (opcional)
4. Clique em **"Save"**

O aviso aparecerá destacado na tela inicial do aplicativo para todos os usuários.

---

## Solução de Problemas

Esta seção apresenta soluções para problemas comuns ao editar o banco de dados.

**Problema:** Alterações não aparecem no aplicativo.

**Solução:** Feche completamente o aplicativo e abra novamente. A sincronização é automática, mas em casos raros pode ser necessário reiniciar o app.

**Problema:** Erro ao salvar registro com data.

**Solução:** Verifique se a data está no formato ISO correto: `YYYY-MM-DDTHH:MM:SS`. Exemplo: `2026-03-15T00:00:00`.

**Problema:** Não consigo excluir um registro.

**Solução:** Alguns registros podem estar sendo referenciados por outras tabelas. Por exemplo, não é possível excluir um evento que possui inscrições. Exclua primeiro os registros relacionados.

**Problema:** Campo obrigatório vazio.

**Solução:** Campos marcados como obrigatórios (notNull) devem sempre ter um valor. Preencha o campo antes de salvar.

**Problema:** ID de relacionamento inválido.

**Solução:** Ao preencher campos como `eventoId` ou `userId`, certifique-se de que o ID existe na tabela correspondente.

---

## Conclusão

Este guia apresentou instruções detalhadas sobre como gerenciar todos os dados do aplicativo Igreja Connect através da interface de banco de dados do Manus. Com estas informações, você pode adicionar, editar e excluir registros em todas as 15 tabelas do sistema, garantindo que o aplicativo sempre exiba informações atualizadas para a congregação.

Lembre-se de sempre validar os dados antes de salvar, seguir os formatos especificados e testar as alterações no aplicativo após edições importantes. Em caso de dúvidas ou problemas não cobertos neste guia, consulte a documentação técnica do projeto ou entre em contato com o suporte.

**Que Deus abençoe o ministério da 2ª Igreja Quadrangular de Rondonópolis e que este aplicativo seja uma ferramenta poderosa para edificar vidas e expandir o Reino de Deus!**
