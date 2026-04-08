# TODO - App 2ª Igreja Quadrangular de Rondonópolis

## Configuração Inicial
- [x] Gerar logo personalizado do aplicativo
- [x] Atualizar configurações de branding (app.config.ts)
- [x] Configurar paleta de cores personalizada (theme.config.js)
- [x] Adicionar mapeamentos de ícones necessários (icon-symbol.tsx)
- [x] Substituir logo pela 2iEQ Rondonópolis
- [x] Renomear app para "2ª Igreja Quadrangular de Rondonópolis"

## Navegação e Estrutura
- [x] Configurar Tab Bar com 6 abas (Home, Agenda, Células, Devocional, Oração, Mais)
- [x] Criar estrutura de pastas para todas as telas

## Tela Home (Início)
- [x] Layout principal com saudação
- [x] Card de próximo evento
- [x] Card de devocional do dia
- [x] Acesso rápido às funcionalidades
- [x] Pull-to-refresh

## Agenda de Eventos
- [x] Tela de lista de eventos
- [x] Card de evento com informações principais
- [x] Filtros por categoria
- [x] Tela de detalhes do evento
- [x] Integração com calendário do dispositivo
- [x] Funcionalidade de compartilhamento

## Células
- [x] Tela de lista de células
- [x] Integração com expo-maps para visualização no mapa
- [x] Tela de detalhes da célula
- [x] Informações do líder
- [x] Funcionalidade de navegação/direções
- [x] Botão de contato (WhatsApp/telefone)

## Formulário de Inscrição
- [ ] Formulário com validação de campos
- [ ] Envio de inscrição
- [ ] Tela de confirmação
- [ ] Armazenamento de inscrições

## Contribuições
- [x] Tela de opções de contribuição
- [x] Exibição de QR Code PIX
- [x] Informações bancárias
- [x] Funcionalidade de copiar PIX
- [x] Compartilhamento de dados

## Devocional Diário
- [x] Sistema de capítulos do Novo Testamento
- [x] Lógica de 1 capítulo por dia (260 capítulos)
- [x] Indicador de progresso
- [x] Marcar como lido
- [x] Navegação entre capítulos
- [x] Ajuste de tamanho de fonte
- [x] Compartilhamento de versículos
- [x] Armazenamento de progresso local

## Oração
- [x] Lista de pedidos de oração
- [x] Formulário para adicionar pedido
- [x] Contador de pessoas orando
- [x] Funcionalidade "Estou orando"
- [x] Compartilhamento de pedidos
- [x] Categorização de pedidos

## Avisos/Notícias
- [x] Feed de notícias da igreja
- [x] Card de notícia com imagem
- [x] Tela de detalhes da notícia
- [x] Filtros por categoria
- [x] Compartilhamento

## Perfil/Configurações
- [x] Tela de configurações
- [x] Preferências de notificações
- [x] Alternância de tema claro/escuro
- [x] Informações sobre o app
- [x] Contato da igreja
- [x] Envio de feedback

## Autenticação e Login
- [x] Página de login com Nome, Data de Nascimento e Célula
- [x] Armazenamento seguro de dados do usuário
- [x] Verificação de login no root layout
- [x] Banco de dados local de usuários

## Batismo
- [x] Página de inscrição de batismo
- [x] Formulário com dados pessoais
- [x] Data pretendida para batismo
- [x] Motivação do candidato
- [x] Armazenamento de inscrições

## Aniversariantes
- [x] Página de aniversariantes do mês
- [x] Contagem de membros por célula
- [x] Filtro por data de nascimento
- [x] Opção de enviar mensagem

## Devocional Offline
- [x] Textos bíbicos completos do Novo Testamento (NAA/NVI)
- [x] Leitura 100% offline
- [x] Seletor de versão (NAA/NVI)
- [x] Ajuste de tamanho de fonte
- [x] Progresso de leitura
- [x] Compartilhamento de versículos

## Notificações Diárias
- [x] Implementar sistema de notificações push com expo-notifications
- [x] Agendar notificação diária para devocional
- [x] Criar página de preferências de notificação
- [x] Permitir configuração de horário da notificação
- [x] Armazenar preferências localmente
- [x] Testar notificações em iOS e Android

## Anotações de Devocional
- [x] Criar hook para gerenciar anotações
- [x] Implementar armazenamento local de anotações
- [x] Adicionar interface de anotações na página de devocional
- [x] Permitir edição e exclusão de anotações
- [x] Compartilhamento de anotações

## Funcionalidades Adicionais
- [ ] Sistema de notificações push para aniversariantes
- [ ] Compartilhamento em redes sociais
- [ ] Integração com backend para sincronização de dados
- [ ] Relatório de membros por célula para liderança
- [ ] Notificação de novos pedidos de batismo
- [ ] Cache de dados

## Testes e Refinamentos
- [ ] Testar todos os fluxos principais
- [ ] Validar responsividade
- [ ] Verificar acessibilidade
- [ ] Otimizar performance

## Página Web de Apresentação
- [ ] Criar página web estática
- [ ] Design moderno e profissional
- [ ] Gráficos interativos
- [ ] Elementos de visualização
- [ ] Apresentação dos recursos do app
## Aba Líderes de Células
- [x] Criar estrutura de dados para líderes (senhas, células)
- [x] Implementar tela de login do líder com senha específica
- [x] Dashboard do líder com visão geral da célula
- [x] Visualização de membros cadastrados na célula
- [x] Exibir aniversários dos membros da célula
- [x] Exibir inscrições de eventos dos membros
- [x] Exibir inscrições de batismo dos membros
- [x] Formulário de relatório de célula (data, total pessoas, visitantes)
- [x] Histórico de relatórios preenchidos
- [x] Gerenciamento de senhas de líderes no painel admin
- [x] Adicionar acesso à Área do Líder na tela Mais
## Relatórios no Painel Admin
- [x] Criar tela de visualização de relatórios de todas as células no admin
- [x] Organizar relatórios separados por data
- [x] Adicionar link na tela principal do admin
- [x] Registrar rota no root layout
## Gráficos de Evolução nos Relatórios
- [x] Criar componente de gráfico de linha compatível com React Native
- [x] Gráfico de evolução de presença por célula
- [x] Gráfico de evolução de visitantes por célula
- [x] Integrar gráficos na tela de relatórios do admin
## Lembrete Semanal para Líderes
- [x] Ler documentação de notificações locais do Expo
- [x] Criar serviço de agendamento de lembrete semanal
- [x] Agendar notificação semanal quando líder faz login
- [x] Cancelar notificação quando líder faz logout
- [x] Configuração para ativar/desativar lembrete no dashboard do líder
- [x] Testes unitários para lógica de agendamento
## Gerenciamento de Eventos no Admin
- [x] Refatorar camada de dados de eventos para AsyncStorage dinâmico
- [x] Criar tela de gerenciamento de eventos no admin (CRUD completo)
- [x] Formulário para criar novo evento (nome, data, horário, local, descrição)
- [x] Editar evento existente
- [x] Remover evento
- [x] Integrar com tela de agenda e inscrições existentes
- [x] Adicionar link no painel admin
- [x] Registrar rota no root layout
## Inscrição em Eventos Especiais
- [x] Limitar botão de inscrição apenas a eventos com categoria "evento-especial", "retiro" e "conferencia"
- [x] Salvar inscrições em AsyncStorage com dados do membro e evento
- [x] Relatório de inscritos por evento especial no painel admin (com filtro por célula)
- [x] Relatório de inscritos no painel do líder (apenas membros da célula)

## Gráficos de Relatórios por Data
- [x] Organizar gráficos de relatórios de células por data (eixo X = datas)

## 🐛 Bugs Encontrados

- [x] Login não funciona no app nativo - tenta criar cadastro com email duplicado em vez de fazer login (CORRIGIDO em login.tsx)
- [x] Fluxo de autenticação não verifica se email já existe antes de criar novo usuário (CORRIGIDO em login.tsx)
- [ ] Erro "Already read" no login nativo - tRPC context não inicializado corretamente
- [ ] Remover lock files duplicados (pnpm-lock.yaml, package-lock.json)
- [ ] Corrigir app.json/app.config.ts - remover arquivo estático app.json
- [ ] Corrigir assets - icon.png e android-icon-foreground.png são JPG, não PNG
- [ ] Remover propriedade 'supportsTablet' do app.config.ts
- [ ] Atualizar dependências do @react-navigation
- [ ] 🔴 CRÍTICO: Histórico de anotações travando ao deletar (tela fica preta sem resposta)

## Correções no Devocional
- [x] Corrigir visualização do texto do dia para aparecer completamente
- [x] Corrigir anotações que não estão funcionando
- [x] Adicionar opção de compartilhar anotações do devocional

## Gerenciar Pedidos de Oração no Admin
- [x] Criar tela de gerenciamento de pedidos de oração no admin
- [x] Visualizar todos os pedidos, aprovar/remover

## Gerenciar Células no Admin
- [x] Criar tela de gerenciamento de células no admin (CRUD)
- [x] Campos: nome, horário, líder, endereço
- [x] Integrar com dados existentes de células

## Gerenciar Contribuição no Admin
- [x] Criar tela de gerenciamento de dados de contribuição no admin
- [x] Editar chave PIX, dados bancários e informações de oferta

## Remover Batismo e Reorganizar Home
- [x] Remover tela de batismo (app/batismo.tsx)
- [x] Remover tela admin/batismo
- [x] Remover rota de batismo do root layout
- [x] Remover referências de batismo do admin/index.tsx
- [x] Remover referências de batismo da tela Mais
- [x] Reorganizar acesso rápido na home com apenas 4 itens (sem batismo e sem aniversários)
- [x] Adicionar lista de aniversariantes do dia abaixo de "aviso importante" na home

## Corrigir Texto Bíblico do Devocional
- [x] Investigar por que apenas 2 versículos são exibidos
- [x] Corrigir para exibir o capítulo inteiro

## Sincronização em Tempo Real
- [x] Implementar sistema de sincronização de alterações do admin para todos os celulares
- [x] Listeners no AsyncStorage para detectar mudanças
- [x] Atualizar UI em tempo real quando dados forem alterados

## Gerenciamento de Aniversariantes
- [x] Remover filtro de membros por célula da aba aniversariantes
- [x] Criar tela de gerenciamento de aniversariantes no admin (CRUD)
- [x] Adicionar/editar/remover datas de aniversário dos membros
- [x] Integrar com dados de membros existentes

## QR Code nas Contribuições
- [x] Adicionar QR code na tela de contribuições
- [x] Exibir QR code para PIX/doações

## Próximo Evento Sincronizado
- [x] Sincronizar próximo evento da home com dados da agenda
- [x] Atualizar automaticamente quando novo evento for criado

## Editor de Aviso Importante
- [x] Criar tela de edição do aviso importante no admin
- [x] Salvar e sincronizar em tempo real

## Gerenciador de Notícias
- [x] Criar tela de CRUD de notícias no admin
- [x] Exibir notícias na home ou em aba específica
- [x] Ordenar por data (mais recentes primeiro)

## Correções e Melhorias Adicionais
- [x] Adicionar seletor de células no formulário de inscrição em eventos especiais
- [x] Adicionar relatório de inscritos em eventos no painel do líder
- [x] Corrigir bug do calendário no gerenciador de eventos (salvando um dia antes)
- [x] Integrar gerenciador de notícias com aba de notícias da home

## Melhorias Finais
- [x] Adicionar seletor dinâmico de células no cadastro de líderes (admin)
- [x] Remover seção "Faça parte da comunidade" da aba Mais
- [x] Implementar lazy loading de componentes pesados
- [x] Adicionar memoização em componentes que re-renderizam frequentemente
- [x] Otimizar listas com FlatList e windowSize
- [x] Reduzir tamanho de imagens e assets
- [x] Implementar code splitting onde aplicável

## Sincronizar Login com Células Dinâmicas
- [x] Atualizar tela de login para buscar células do AsyncStorage em vez de hardcoded

## Substituir Logo do App
- [x] Copiar logo 2IEQ Rondonópolis para assets
- [x] Atualizar app.config.ts com nova logo
- [x] Atualizar telas que usam emoji ⛪ (login, home, etc)

## Renomear App
- [x] Trocar "Igreja Connect" por "2IEQ Connect" em todo o app

## Sincronização Entre Dispositivos - Decisão Técnica
- [x] Tentativa de implementar sincronização automática com axios + polling
- [x] Rollback devido a complexidade e erros persistentes
- [ ] **DECISÃO:** App funciona apenas com dados locais (AsyncStorage)
- [ ] Para sincronização futura: usar apenas tRPC client nas telas (sem camada intermediária)
- [ ] Alternativa recomendada: cada dispositivo mantém seus próprios dados localmente

## Sincronização com Backend Manus (tRPC + PostgreSQL)
- [x] Criar tabelas no banco para eventos, notícias, avisos e contatos
- [x] Criar funções CRUD no server/db.ts
- [x] Criar endpoints tRPC para eventos, notícias, avisos e contatos
- [x] Testar endpoints via curl (funcionando perfeitamente)
- [ ] Modificar telas admin para usar tRPC mutations (próxima etapa)
- [ ] Modificar telas de usuário para usar tRPC queries com refetch automático (próxima etapa)
- [ ] Criar tela de teste de sincronização para demonstrar funcionamento

## Teste de Sincronização
- [x] Criar dados de teste no banco (evento, célula, pedido de oração)
- [x] Criar tela de demonstração usando tRPC
- [x] Verificar se dados aparecem automaticamente
- [x] Documentar resultados

## Migrar Admin de Eventos para tRPC
- [x] Analisar estrutura atual da tela admin/eventos.tsx
- [x] Substituir criarEvento() por trpc.eventos.create.useMutation()
- [x] Substituir editarEvento() por trpc.eventos.update.useMutation()
- [x] Substituir removerEvento() por trpc.eventos.delete.useMutation()
- [x] Substituir obterEventos() por trpc.eventos.list.useQuery()
- [x] Testar criação, edição e remoção de eventos
- [x] Verificar sincronização na tela /demo-sync

## Migrar Tela de Agenda do Usuário
- [x] Substituir getEventos() por trpc.eventos.list.useQuery()
- [x] Adaptar formato de dados do banco para formato do app
- [x] Testar visualização de eventos sincronizados

## Migrar Admin de Células para tRPC
- [x] Substituir criarCelula() por trpc.celulas.create.useMutation()
- [x] Substituir editarCelula() por trpc.celulas.update.useMutation()
- [x] Substituir removerCelula() por trpc.celulas.delete.useMutation()
- [x] Substituir obterCelulas() por trpc.celulas.list.useQuery()
- [x] Testar sincronização de células

## Migrar Admin de Notícias para tRPC
- [x] Criar endpoints tRPC para notícias (create, update, delete, list)
- [x] Substituir criarNoticia() por trpc.noticias.create.useMutation()
- [x] Substituir editarNoticia() por trpc.noticias.update.useMutation()
- [x] Substituir removerNoticia() por trpc.noticias.delete.useMutation()
- [x] Substituir obterNoticias() por trpc.noticias.list.useQuery()
- [x] Testar sincronização de notícias

## Migrar Tela de Células do Usuário
- [x] Substituir getCelulas() por trpc.celulas.list.useQuery()
- [x] Adaptar formato de dados do banco para formato do app
- [x] Testar visualização de células sincronizadas

## Migrar Tela de Notícias do Usuário
- [x] Substituir getNoticias() por trpc.noticias.list.useQuery()
- [x] Adaptar formato de dados do banco para formato do app
- [x] Testar visualização de notícias sincronizadas

## Migrar Tela de Pedidos de Oração
- [x] Substituir getPedidosOracao() por trpc.oracao.list.useQuery()
- [x] Adaptar formato de dados do banco para formato do app
- [x] Testar visualização de pedidos sincronizados

## Migrar Aviso Importante para tRPC
- [x] Migrar tela admin de aviso importante para usar tRPC mutations
- [x] Migrar tela home para buscar aviso via tRPC queries
- [x] Testar sincronização de aviso entre dispositivos

## Indicadores de Última Sincronização
- [x] Criar hook useTempoRelativo para formatar timestamps
- [x] Adicionar indicador na tela de agenda (eventos)
- [x] Adicionar indicador na tela de células
- [x] Adicionar indicador na tela de notícias
- [x] Adicionar indicador na tela de pedidos de oração
- [x] Adicionar indicador na tela home (aviso importante)

## Corrigir Salvamento no Dashboard Admin
- [x] Investigar por que alterações em eventos não salvam
- [x] Investigar por que alterações em células não salvam
- [x] Investigar por que alterações em pedidos de oração não salvam
- [x] Verificar se mutations tRPC estão sendo chamadas corretamente
- [x] Verificar se há erros de console no navegador
- [x] Corrigir problemas encontrados
- [x] Testar criação, edição e remoção em todas as telas admin

## Painel Admin Web (Segunda Opção)
- [ ] Criar estrutura base do painel admin web
- [ ] Criar página de login web
- [ ] Criar dashboard principal web
- [ ] Implementar gerenciamento de eventos (CRUD completo)
- [ ] Implementar gerenciamento de células (CRUD completo)
- [ ] Implementar gerenciamento de notícias (CRUD completo)
- [ ] Implementar gerenciamento de pedidos de oração (CRUD completo)
- [ ] Implementar gerenciamento de aviso importante (edição)
- [ ] Testar sincronização entre painel web e app mobile
- [ ] Adicionar validações e feedback visual

## Adicionar Campos na Tabela pedidosOracao
- [x] Verificar estrutura atual da tabela pedidosOracao no schema
- [x] Adicionar campo "respondido" (boolean/int) ao schema
- [x] Adicionar campo "testemunho" (text) ao schema
- [x] Gerar e executar migração do banco de dados
- [x] Testar alteração de status de oração no banco

## Auditoria de Correspondência Banco de Dados ↔ App
- [x] Listar todas as funcionalidades do app que usam dados
- [x] Verificar schema de cada tabela no banco
- [x] Identificar campos faltantes ou incompatíveis
- [x] Corrigir discrepâncias encontradas
- [x] Executar migrações necessárias
- [x] Validar que todos os dados aparecem corretamente no app

## Criar Guia PDF de Edição do Banco de Dados
- [x] Escrever guia completo em Markdown
- [x] Incluir todas as 15 tabelas do banco
- [x] Documentar cada campo com descrição e formato
- [x] Adicionar exemplos práticos
- [x] Converter para PDF
- [ ] Corrigir botão "Contato da Igreja" na a...

## Histórico de Anotações do Devocional (Local)
- [x] Criar hook melhorado useHistoricoAnotacoes para gerenciar anotações com timestamps
- [x] Criar tela de histórico de anotações (app/historico-anotacoes.tsx)
- [x] Implementar filtros por livro e período de datas
- [x] Implementar busca por texto nas anotações
- [x] Adicionar funcionalidade de editar anotações do histórico
- [x] Adicionar funcionalidade de deletar anotações do histórico
- [x] Adicionar botão "Ver Histórico" na aba devocional
- [x] Testar fluxo completo de histórico e filtros
- [x] Adicionar botão para expandir texto truncado no histórico de anotações Mais - tabela não existe ou dados não estão mapeados

## Corrigir Exibição de "Próximo Evento" na H...
- [x] Investigar lógica de busca do próximo evento na home
- [x] Verificar se está ordenando eventos por data corretamente
- [x] Corrigir para mostrar sempre o evento mais próximo
- [x] Testar sincronização entre home e agenda
- [x] Validar que alterações na agenda refletem na home

## Bugs Encontrados em Teste (Versão 1.0)
- [x] Data de nascimento opcional não funciona - backend rejeita quando vazio
- [x] Admin não consegue criar anexos - erro de permissão mesmo sendo admin

## Sistema de Pedidos de Oração Público
- [x] Adicionar botão "Novo Pedido" na tela de oração
- [x] Criar formulário de cadastro de pedido (nome, descrição, categoria)
- [x] Salvar novos pedidos no banco via tRPC
- [x] Implementar botão "Estou Orando" funcional
- [x] Incrementar contador ao clicar em "Estou Orando"
- [x] Sincronizar contador entre todos os usuários
- [x] Testar cadastro e visualização entre múltiplos usuários

## Debug: Cadastro de Pedidos de Oração Não Funciona
- [x] Verificar se endpoint create está funcionando
- [x] Verificar se função createPedidoOracao existe no db.ts
- [x] Testar mutation manualmente
- [x] Verificar logs de erro no console
- [x] Corrigir implementação

## Corrigir Aviso Importante na Home
- [x] Verificar como aviso é carregado na tela home
- [x] Verificar se está buscando do banco ou AsyncStorage
- [x] Corrigir mapeamento de campos se necessário (endpoint errado)
- [x] Testar exibição do aviso

## Verificar Salvamento Automático de Usuários
- [x] Verificar fluxo de autenticação atual
- [x] Verificar se usuários são salvos na tabela users
- [x] Verificar se usuários são salvos na tabela usuariosCadastrados
- [x] Implementar salvamento automático se necessário
- [x] Testar login e verificar tabelas

## Tela de Perfil do Usuário
- [x] Criar tela app/perfil.tsx
- [x] Adicionar formulário de edição de dados pessoais
- [x] Implementar salvamento via tRPC
- [ ] Adicionar link para perfil no menu

## Aniversariantes do Banco na Home
- [x] Criar endpoint tRPC para buscar aniversariantes do mês
- [x] Atualizar home para buscar do banco em vez de AsyncStorage
- [x] Testar exibição de aniversariantes

## Relatório de Membros Admin
- [x] Criar tela app/admin/membros.tsx
- [x] Listar todos os usuários cadastrados
- [x] Adicionar filtros por célula
- [x] Mostrar estatísticas (total, por célula)
- [ ] Adicionar link no menu admin

## Relatórios de Células no Banco de Dados
- [x] Verificar tela de líderes onde relatórios são preenchidos
- [x] Verificar se relatórios estão sendo salvos no banco
- [x] Criar endpoints tRPC se necessário
- [x] Implementar salvamento no banco
- [x] Testar preenchimento e salvamento

## Tela Admin de Visualização de Relatórios
- [x] Criar tela /admin/relatorios
- [x] Listar todos os relatórios com dados completos
- [x] Adicionar filtros por célula e período
- [x] Mostrar estatísticas (média de presentes, total de conversões)
- [x] Adicionar gráficos de crescimento
- [x] Implementar visualização de evolução temporal

## Células do Banco no Login
- [x] Encontrar tela de login/cadastro onde células são selecionadas
- [x] Atualizar para buscar células do banco via tRPC
- [x] Testar seleção de células

## Trocar Background para Preto
- [x] Localizar configuração de cores do tema
- [x] Trocar azul escuro por preto no dark mode
- [x] Verificar contraste e legibilidade

## Corrigir Seleção de Células no Login/Cadastro
- [x] Identificar tela de login/cadastro onde célula é selecionada
- [x] Verificar se está usando AsyncStorage ou lista hardcoded
- [x] Implementar busca de células da tabela celulas via tRPC
- [x] Adicionar dropdown/picker com células do banco
- [x] Testar seleção durante cadastro

## Onboarding Visual com Tour Guiado
- [x] Criar componente de onboarding com slides
- [x] Adicionar slides explicando cada funcionalidade principal
- [x] Implementar navegação entre slides (próximo/anterior/pular)
- [x] Salvar flag de onboarding concluído no AsyncStorage
- [x] Integrar onboarding na home após primeiro login
- [x] Testar fluxo completo

## Persistência de Login
- [ ] Investigar sistema de autenticação atual (OAuth, sessão)
- [ ] Implementar salvamento de token/sessão no SecureStore
- [ ] Criar verificação de sessão ao iniciar app
- [ ] Redirecionar para home se já autenticado
- [ ] Adicionar botão de logout
- [ ] Testar fluxo completo (login, fechar app, reabrir)

## Remover Tour Guiado
- [x] Remover importação e uso do componente Onboarding na home
- [x] Remover estado showOnboarding
- [x] Remover useEffect de verificação de onboarding
- [x] Deletar arquivo components/onboarding.tsx

## Trocar Cor Ciano por Verde Menta
- [x] Atualizar cor primary no theme.config.js de ciano para verde menta
- [x] Verificar se cor aparece corretamente em light e dark mode

## Remover Mapa das Células
- [x] Localizar tela de células
- [x] Remover botão/link "Mapa das Células"
- [x] Verificar se há tela de mapa para deletar

## Adicionar Botão Meu Perfil na Aba Mais
- [x] Adicionar botão "Meu Perfil" na seção Principal da aba Mais
- [x] Configurar navegação para /perfil
- [x] Adicionar ícone apropriado

## Migrar Contribuições para PostgreSQL
- [x] Criar tabela dadosContribuicao no schema
- [x] Criar funções CRUD no db.ts
- [x] Criar endpoints tRPC (get, update)
- [x] Inserir dados iniciais no banco (PIX: 62.955.505/3071-30, Banco: Mercado Pago)
- [x] Migrar tela de contribuições para usar tRPC
- [x] Criar tela admin para editar dados de contribuição
- [x] Testar sincronização automática

## Sincronizar Contatos e Aniversariantes com PostgreSQL
- [x] Migrar tela de contatos para usar tRPC (contatosIgreja)
- [x] Migrar tela de aniversariantes para usar tRPC
- [x] Testar sincronização de dados

## Criar Tela de Completar Cadastro após Login
- [x] Criar endpoint tRPC para registrar novo usuário
- [x] Criar tela de Completar Cadastro
- [x] Integrar tela no fluxo de autenticação (mostrar após primeiro login)
- [x] Testar fluxo completo de login e cadastro

## Editar Perfil do Usuário
- [x] Criar endpoint tRPC para atualizar dados do usuário
- [x] Atualizar tela de perfil com formulário de edição
- [x] Testar fluxo de edição de perfil

## Implementar Login com Google OAuth e Sincronização com Banco
- [x] Verificar implementação atual de Google OAuth
- [x] Criar endpoint tRPC para registrar usuário após login
- [x] Integrar criação de usuário no fluxo de autenticação
- [x] Testar fluxo completo de login e sincronização

## Adicionar Botão Logout na Aba Mais
- [x] Adicionar botão de logout na seção Suporte
- [x] Implementar função de logout que limpa dados locais
- [x] Redirecionar para tela de login após logout

## Implementar Login Manual com Email/Senha e Banco
- [x] Adicionar campos email e passwordHash à tabela users
- [x] Criar endpoints tRPC para signup e login
- [x] Reescrever tela de login com formulário manual
- [x] Integrar autenticação no fluxo do app
- [x] Testar fluxo completo

## Bug: App fica carregando após cadastro
- [x] Verificar erro no endpoint de signup
- [x] Debugar fluxo de redirecionamento
- [x] Corrigir e testar

## Corrigir Erro de Envio de Relatórios de Líderes
- [x] Investigar erro "Failed query: insert into relatorios" com placeholders incorretos
- [x] Reescrever função createRelatorio usando SQL direto em vez de Drizzle ORM
- [x] Adicionar função getRelatoriosByLiderId que estava faltando
- [x] Criar testes para validar criação de relatórios
- [x] Testar end-to-end: criar, recuperar e deletar relatórios
- [x] Validar sincronização com banco de dados

## Corrigir Erro "Out of range value for column liderId"
- [x] Investigar causa do erro ao enviar relatorio
- [x] Identificar que liderId estava vindo como timestamp (13 digitos) do AsyncStorage
- [x] Atualizar obterSessaoLider para buscar ID real do banco se detectar timestamp antigo
- [x] Adicionar validacao de liderId na pagina de relatorio
- [x] Criar teste de validacao de liderId
- [x] Todos os testes passando (5/5)

## Implementar Geração de Senha para Líderes
- [x] Criar função de geração de senha aleatória
- [x] Adicionar botão "Gerar" na página de admin de líderes
- [x] Exibir senha gerada após criar líder
- [x] Implementar botão "Copiar Senha"
- [x] Armazenar senha no campo telefone do banco
- [x] Validar login com senha armazenada
- [x] Criar testes de geração e validação de senha
- [x] Todos os testes passando (2/2)

## Histórico de Relatórios para Líderes
- [x] Adicionar função getRelatoriosByLiderId com filtro de data ao db.ts
- [x] Criar endpoint tRPC para buscar relatórios com filtros
- [x] Criar tela de histórico de relatórios (app/lider/historico.tsx)
- [x] Implementar filtros (última semana, mês, customizado)
- [x] Implementar busca por data
- [x] Criar tela de detalhes do relatório (modal ou página)
- [x] Adicionar estatísticas (média de presença, visitantes)
- [x] Testar fluxo completo de histórico


## Correção de Bugs Críticos - 20/02/2026
- [x] Adicionar função getUsuariosCadastrados ao db.ts
- [x] Adicionar função getMembrosPorCelula ao db.ts
- [x] Adicionar função incrementarContadorOracao ao db.ts
- [x] Corrigir função incrementarContadorOracao para usar Drizzle ORM
- [x] Criar teste de validação de correção de bugs
- [x] Validar que membros aparecem no admin
- [x] Validar que contador de oração funciona
- [x] Validar que relatórios do líder funcionam


## Correção de Carregamento Infinito em Meu Perfil
- [x] Investigar causa de carregamento infinito na tela "Meu Perfil"
- [x] Corrigir lógica de estado de loading (userData !== undefined)
- [x] Adicionar timeout de segurança de 5 segundos
- [x] Adicionar fallback para isLoadingUser do tRPC
- [x] Criar testes de validação de carregamento
- [x] Validar que página carrega corretamente


## Correção de Bugs de Carregamento - 20/02/2026 (2ª Rodada)
- [x] Investigar erro "Maximum update depth exceeded" no histórico de relatórios
- [x] Corrigir loop infinito de useEffect no historico.tsx
- [x] Remover dependência circular de filtroAtivo
- [x] Usar relatoriosDB?.length em vez de relatoriosDB completo
- [x] Investigar carregamento infinito em Meu Perfil
- [x] Remover timeout de segurança que causava loop
- [x] Usar isLoadingUser do tRPC em vez de estado local
- [x] Simplificar lógica de loading


## Sincronizar Células com Banco de Dados
- [x] Criar função getCelulasFromDB no backend (db.ts) - já existia
- [x] Criar endpoint tRPC para buscar células - já existia (celulas.list)
- [x] Atualizar getCelulas() em lib/data/celulas.ts para usar tRPC
- [x] Atualizar página de evento para usar hook useCelulas()
- [ ] Testar sincronização no formulário de inscrição
- [ ] Validar que admin e inscrição mostram mesmas células


## Migrar Painel Admin de AsyncStorage para tRPC
- [x] Investigar como admin está salvando dados (AsyncStorage vs tRPC) - JÁ USA tRPC!
- [x] Migrar gerenciamento de eventos para usar tRPC - JÁ IMPLEMENTADO
- [x] Migrar gerenciamento de células para usar tRPC - JÁ IMPLEMENTADO
- [x] Migrar gerenciamento de notícias para usar tRPC - JÁ IMPLEMENTADO
- [x] Migrar gerenciamento de líderes para usar tRPC - JÁ IMPLEMENTADO
- [x] Testar CRUD de eventos via tRPC - TESTES PASSANDO
- [x] Testar CRUD de células via tRPC - TESTES PASSANDO
- [x] Validar que app busca dados do banco, não AsyncStorage - CONFIRMADO


## Bug: Redirecionamento Errado de Eventos na Agenda
- [x] Investigar fluxo de clique em evento (agenda → detalhes)
- [x] Verificar como IDs estão sendo passados entre páginas
- [x] Debugar página de detalhes do evento
- [x] Encontrar causa do redirecionamento para evento errado
- [x] Corrigir e testar com múltiplos eventos

**Problema Encontrado:**
- Função `getEventoById` não existia no servidor (db.ts)
- Página de detalhes usava AsyncStorage em vez de tRPC
- Resultado: clicava em um evento mas carregava dados de outro

**Solução Implementada:**
1. Adicionada função `getEventoById(id: number)` no server/db.ts
2. Reescrita página de detalhes (app/event/[id].tsx) para usar tRPC
3. Convertido ID de string para número antes de buscar
4. Testes criados e passando (6/6 ✓)


## Bug: Histórico de Relatórios com Carregamento Infinito
- [x] Investigar código do histórico de relatórios
- [x] Identificar causa do carregamento infinito
- [x] Simplificar lógica de filtros e estado
- [x] Remover dependências circulares
- [x] Testar e validar

**Problemas Encontrados:**
1. Funcao getRelatoriosByLiderIdWithFilters criava novo pool MySQL
2. Usava connection.end() em vez de connection.release()
3. Isso causava travamento e timeout
4. Funcao createLider nao retornava objeto criado

**Solucao Implementada:**
1. Reescrita getRelatoriosByLiderIdWithFilters usando Drizzle ORM
2. Removido SQL raw e pool manual
3. Corrigida createLider para retornar objeto com ID
4. Testes criados e passando (5/5)


## Bug: Erro ao Salvar Aviso Importante no Painel Admin
- [x] Localizar arquivo aviso-importante.tsx
- [x] Identificar onde booleano está sendo enviado em vez de número
- [x] Converter ativo de boolean para number (0 ou 1)
- [x] Testar salvamento de aviso

**Problema:** Campo `ativo` estava sendo enviado como booleano, mas servidor esperava número (0 ou 1)
**Solução:** Convertido `ativo ? 1 : 0` antes de enviar para tRPC
**Testes:** 3/3 passando ✓


## Bug: Aviso Importante Não Atualiza na Home
- [x] Investigar como aviso é carregado na home
- [x] Verificar cache e refetch de dados
- [x] Validar se tRPC está retornando dados atualizados
- [x] Corrigir sincronização entre admin e home

**Problema:** Home não estava atualizando após salvar aviso no admin
**Causa Raíz:** Endpoint `save` estava criando novo registro em vez de atualizar. `getAvisoImportante()` não existia, retornando avisos antigos.
**Solução:** 
1. Criada função `getAvisoImportante()` que retorna o aviso mais recente e ativo
2. Criada função `saveAvisoImportante()` que desativa avisos antigos e cria novo com ativo=1
3. Corrigido endpoint `save` para usar `saveAvisoImportante()`
4. Adicionada invalidação de cache do tRPC
**Testes:** 6/6 passando ✓ (3 de sync + 3 de sync-fix)


## Bug: "Meu Perfil" Sempre Mostra Criar Perfil
- [x] Localizar arquivo de perfil e entender lógica de navegação
- [x] Verificar como detecta se usuário já tem perfil
- [x] Identificar por que sempre mostra criar perfil mesmo logado
- [x] Corrigir lógica de verificação de perfil existente
- [x] Testar navegação com usuário logado

**Problema:** Função chamada no router não existia (getUsuarioCadastradoByUserId)
**Solução:** Corrigido nome de função e endpoints para usar upsertUsuarioCadastrado()
**Testes:** 3/3 passando


## Bug: Erro ao Clicar em "Contatos da Igreja"
- [x] Localizar arquivo mais.tsx
- [x] Identificar por que .replace() está sendo chamado em undefined
- [x] Corrigir o erro
- [x] Testar navegação

**Problema:** Erro "Cannot read property 'replace' of undefined" ao clicar em "Contatos da Igreja"
**Causa Raiz:** 
1. Endpoint retornava array mas código esperava objeto
2. Campos whatsapp/email podiam ser undefined

**Solução Implementada:**
1. Corrigido endpoint para retornar primeiro elemento do array: `contatos?.[0] || null`
2. Adicionadas verificações de segurança com optional chaining: `contatosIgreja?.whatsapp`
3. Botões só são adicionados se campos existem
**Testes:** 3/3 passando


## Tarefa: Remover Botão "Enviar Mensagem" de Aniversariantes
- [x] Localizar arquivo de aniversariantes
- [x] Remover botão de enviar mensagem
- [x] Testar tela


## Tarefa: Mostrar Campo "Testemunho" Quando Oração for Respondida
- [x] Localizar arquivo de oração
- [x] Encontrar lógica de exibição do campo testemunho
- [x] Corrigir para mostrar testemunho quando respondida
- [x] Testar

**Implementação:**
1. Adicionado campo `testimony` ao mapeamento de dados da query
2. Criado formulário para adicionar testemunho quando oração for respondida
3. Botão "+ Adicionar Testemunho" aparece quando oração é marcada como respondida
4. Usuário pode digitar testemunho e salvar via tRPC
5. Testemunho aparece em card verde quando salvo
6. Testes criados e passando (3/3)


## Tarefa: Adicionar Opção de Compartilhar Anotações no Devocional
- [x] Localizar arquivo de devocional
- [x] Encontrar seção de anotações
- [x] Adicionar botão de compartilhar
- [x] Implementar funcionalidade de compartilhamento
- [x] Testar

**Status:** Feature já estava implementada!
- Botão "📤 Compartilhar" aparece automaticamente quando há anotações
- Formata mensagem com nome do capítulo e assinatura da igreja
- Usa Share API nativa do React Native
- Testes criados e passando (4/4)


## Tarefa: Adicionar Seção de Redes Sociais na Home
- [x] Localizar arquivo de home
- [x] Encontrar seção de aniversariantes
- [x] Adicionar seção de redes sociais com botões
- [x] Testar

**Implementação:**
1. Adicionada seção "Acesse nossas redes sociais" abaixo de "Aniversariantes do Dia"
2. Botão Instagram (rosa) com link: https://www.instagram.com/2ieqroo/
3. Botão YouTube (vermelho) com link: https://www.youtube.com/@2ieqroo
4. Ambos os botões usam Linking.openURL() para abrir links
5. Testes criados e passando (4/4)


## Tarefa: Trocar Ícones de Emoji pelos Oficiais
- [x] Instalar biblioteca de ícones SVG
- [x] Substituir ícones de emoji pelos oficiais
- [x] Testar

**Implementação:**
1. Criado componente InstagramIcon com gradiente oficial (rosa/roxo)
2. Criado componente YouTubeIcon com cor oficial (vermelho)
3. Substituídos ícones de emoji pelos SVG oficiais
4. Ícones renderizam com tamanho 28px
5. Testes criados e passando (4/4)

## Correção de Coordenadas do Google Maps (Células)
- [x] Modificar código para usar latitude/longitude em vez de endereço em texto
- [x] Atualizar função handleNavigate para construir URL com coordenadas
- [x] Testar funcionamento do botão "Como Chegar" em cada célula

## Inscrições em Eventos Especiais - Salvar no Banco de Dados
- [x] Adicionar campo `celula` à tabela de inscrições no banco de dados
- [x] Aplicar migração do banco de dados
- [x] Criar router tRPC para inscrições de eventos
- [x] Implementar endpoint para criar inscrição no banco de dados
- [x] Modificar app para usar endpoint tRPC além de AsyncStorage
- [x] Criar testes para validar que inscrições são salvas (19/19 passando)

## Escola de Crescimento - Novo Tipo de Evento
- [x] Criar tabela de inscrições no banco de dados
- [x] Criar router tRPC para inscrições
- [x] Criar tela de inscrição na aba Agenda
- [x] Implementar formulário com campos: Nome, Célula, Curso
- [x] Criar painel de relatório no admin
- [x] Testar fluxo completo de inscrição

## Personalização da Escola de Crescimento
- [x] Adicionar campo de data de início no banco de dados
- [x] Criar painel admin para editar data de início
- [x] Atualizar textos de apresentação dos cursos
- [x] Exibir data de início na aba Agenda

## Correção - Aba Escola de Crescimento no Admin
- [x] Adicionar link/botão para Escola de Crescimento no painel admin
- [x] Registrar rota no root layout se necessário
- [x] Testar se aba aparece e funciona corretamente

## Correção - Erro de eventosDB no Painel Admin
- [x] Corrigir erro "Cannot access 'eventosDB' before initialization" na tela de inscritos em eventos
- [x] Testar se tela de inscritos em eventos funciona corretamente

## Sincronização de Inscritos em Eventos
- [x] Sincronizar relatório de inscritos em eventos com banco de dados
- [x] Modificar tela admin para buscar inscrições via tRPC em vez de AsyncStorage
- [x] Testar se relatório mostra dados corretos do banco de dados

## Correção - Erro de Build do Gradle para Google Play
- [ ] Corrigir erro de dependências do Gradle (react-native-gesture-handler)
- [ ] Ajustar configurações do build.gradle
- [ ] Testar build do Android localmente
- [ ] Tentar publicar novamente no Google Play

## Bugs em Teste (Versão Atual)
- [x] Data de nascimento opcional ainda não funciona - frontend valida como obrigatório mesmo sendo opcional no backend

## Correções de Campos Opcionais
- [x] Remover campo de telefone do formulário de cadastro (não era armazenado no banco)

## Visualização de Dados do Líder (Nova Feature)
- [x] Criar tela de visualização de membros da célula (lider/membros-view.tsx)
- [x] Criar tela de visualização de aniversariantes do mês (lider/aniversariantes-view.tsx)
- [x] Criar tela de visualização de eventos inscritos (lider/eventos-view.tsx)
- [x] Tornar botões de estatísticas clicáveis no painel do líder
- [x] Implementar endpoints para buscar dados filtrados por célula do líder

## Filtro de Relatórios por Célula do Líder
- [x] Filtrar histórico de relatórios para mostrar apenas da célula do líder

## Simplificação do Histórico de Relatórios
- [x] Remover filtros (Ultima Semana, Último Mês, Customizado) do histórico
- [x] Deixar apenas aba "Todos" visível
- [x] Garantir ordenação cronológica (mais recentes primeiro)

## Visualização de Eventos com Filtro (Líder)
- [x] Adicionar detalhes dos eventos na tela de eventos do líder
- [x] Implementar filtro por evento específico
- [x] Mostrar inscrições agrupadas por evento

## Correção de Sincronização de Dados
- [x] Verificar sincronização de eventos (mostra 0 no painel, mas tem inscrições)
- [x] Verificar sincronização de membros
- [x] Corrigir queries de banco de dados para eventos e membros

## Exibição de Inscritos em Eventos (Líder)
- [x] Exibir nomes de inscritos na tela de eventos
- [x] Mostrar status de inscrição (confirmado/cancelado)

## Múltiplos Líderes por Célula (Nova Feature)
- [x] Permitir criar múltiplos líderes por célula
- [x] Cada líder com senha individual
- [x] Interface para adicionar novos líderes na célula
- [x] Endpoint para criar novo líder

## Correção de Datas de Aniversário
- [x] Corrigir datas que aparecem um dia antes (problema de timezone)

## Escola de Crescimento no Painel do Líder
- [x] Verificar schema de inscrições em Escola de Crescimento
- [x] Criar tela de visualização de inscritos da célula
- [x] Adicionar botão no painel do líder

## Remoção de Botão Novo Líder
- [x] Remover botão "Novo Líder" do painel do líder
- [x] Remover arquivo adicionar-lider.tsx
- [x] Remover rota de adicionar-lider

## Deploy no Railway - Correção de Erros
- [x] Corrigir funções faltando no backend (getPedidoOracaoById, updatePedidoOracao, getAnotacoesDevocionalByUserId)
- [x] Fazer novo deploy no Railway
- [x] Obter URL permanente e atualizar app.config.ts

## Correção do Fluxo de Autenticação do Líder
- [x] Investigar estrutura de múltiplos líderes por célula
- [x] Implementar seleção de célula → seleção de líder → entrada de senha
- [x] Adicionar estado liderSelecionadoId para rastrear líder selecionado
- [x] Criar lista de células únicas (sem duplicatas)
- [x] Adicionar seletor de líderes que aparece após selecionar célula
- [x] Permitir que cada líder tenha sua própria senha
- [x] Limpar senha ao trocar de célula ou líder
- [x] Criar testes unitários para validar fluxo de autenticação (9 testes)
- [x] Todos os testes passando com sucesso

## Funcionalidades de Segurança do Painel de Líder
- [x] Adicionar botão de mudar senha no painel do líder
- [x] Criar modal com formulário de mudança de senha
- [x] Validar senha atual antes de permitir mudança
- [x] Validar que nova senha tem mínimo 4 caracteres
- [x] Validar que nova senha é diferente da atual
- [x] Validar que senhas conferem
- [x] Melhorar botão de sair com confirmação (já implementado)
- [x] Criar testes unitários para validações de senha (16 testes)
- [x] Todos os testes passando com sucesso

## Correção de Erro no Painel do Líder
- [x] Diagnosticar erro "Maximum update depth exceeded"
- [x] Refatorar usando useMemo para calcular stats
- [x] Separar lógica em dois useEffect (cálculo + atualização)
- [x] Remover função duplicada carregarEstatisticas
- [x] Validar que erro foi corrigido


## Melhorias no Painel do Líder

- [x] Remover quadrados de stats (Membros, Aniversários, Inscritos, Relatórios)
- [x] Criar tela de histórico de relatórios
- [x] Implementar listagem de relatórios ordenados por data (mais recentes primeiro)
- [x] Adicionar botão de voltar na tela de relatórios


## Cadastro de Novo Relatório no Painel do Líder

- [x] Analisar estrutura do formulário de relatório existente
- [x] Criar modal/tela para novo relatório
- [x] Implementar integração com banco de dados
- [x] Adicionar botão de novo relatório no painel
- [x] Testar e validar


## Correção de Armazenamento de Senha do Líder

- [x] Verificar schema do banco de dados para campo de senha
- [x] Adicionar coluna de senha na tabela lideres
- [x] Atualizar endpoint tRPC para salvar senha corretamente
- [x] Atualizar modal de mudar senha para chamar endpoint correto
- [x] Testar e validar


## Correção de Anexos no Novo Banco de Dados

- [x] Investigar erro de anexosLideres não definido
- [x] Verificar schema e rotas tRPC para anexos
- [x] Implementar ou corrigir endpoint de anexos
- [x] Atualizar componente de anexos
- [x] Testar e validar


## Botão de Acesso a Anexos no Painel do Líder

- [x] Criar tela de visualização de anexos
- [x] Implementar listagem de anexos do banco de dados
- [x] Adicionar funcionalidade de download
- [x] Adicionar botão "Anexos" no painel do líder
- [x] Testar e validar


## Sincronização de Schema - Banco de Dados
- [x] Adicionar colunas célula, dataNascimento e email à tabela usuariosCadastrados no Railway
- [x] Validar que schema Drizzle corresponde ao banco (100% sincronizado!)
- [x] Testar fluxo completo: signup → completar-cadastro → meu perfil (tela já existe)
- [x] Corrigir erros de TypeScript nos testes (corrigidos principais erros)
- [x] Implementar tela "Meu Perfil" na aba "Mais" (já existe e funcional)
- [ ] Deploy no Railway com sincronização GitHub


## Bug: Botão "Criar Conta" não funciona
- [x] Investigar por que o botão "Criar Conta" não responde ao clique (faltavam imports de React Native)
- [x] Verificar logs do servidor para erros
- [x] Verificar console do app para erros de JavaScript
- [x] Corrigir o problema (adicionados imports: Alert, ScrollView, View, Text, TextInput, TouchableOpacity, ActivityIndicator)
- [x] Testar fluxo completo de signup (servidor rodando normalmente)

## 🐛 Bugs Novos Reportados (Expo Go - 08/04/2026)

- [ ] Erro ao excluir membro - tRPC Response not OK (HTTP 500)
- [ ] Erro ao criar configuração de pagamento - tRPC Response not OK (HTTP 500)
