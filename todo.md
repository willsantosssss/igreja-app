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

## Gerenciador de Contatos da Igreja
- [x] Criar tela de gerenciamento de contatos no admin
- [x] Campos: telefone, WhatsApp, email
- [x] Integrar com tela Mais (seção Suporte) com sincronização em tempo real (useFocusEffect)
- [x] Salvar contatos no AsyncStorage

## Sincronização em Tempo Real Entre Dispositivos
- [x] Criar endpoints REST no backend para todos os dados (eventos, células, notícias, etc)
- [x] Implementar serviço de sincronização com polling (30s)
- [x] Atualizar camadas de dados para sincronização híbrida (AsyncStorage + Servidor)
- [x] Implementar estratégia offline-first com fallback
- [x] Testar sincronização entre múltiplos dispositivos

## Corrigir Sincronização de Pedidos de Oração
- [x] Atualizar camada de dados para sincronizar criação de pedidos com servidor
- [x] Garantir que pedidos criados por qualquer usuário apareçam para todos
- [x] Sincronizar contador "Estou Orando" em tempo real
- [x] Testar criação e visualização entre múltiplos dispositivos

## Sincronização Completa de Alterações do Admin
- [x] Atualizar camada de dados de eventos para sincronizar com servidor
- [x] Atualizar camada de dados de células para sincronizar com servidor
- [x] Atualizar camada de dados de notícias para sincronizar com servidor
- [x] Atualizar camada de dados de aviso importante para sincronizar com servidor
- [x] Testar criação/edição/remoção em todas as telas de admin
- [x] Verificar sincronização em tempo real entre múltiplos dispositivos

## Corrigir Erros de Sincronização
- [x] Investigar erros de sincronização nos logs do servidor
- [x] Corrigir endpoints de criação/edição/remoção no backend
- [x] Testar sincronização de eventos, células, notícias e aviso
- [x] Verificar se alterações do admin aparecem para todos os usuários

## Corrigir Definitivamente Erros de Sincronização
- [x] Testar requisições tRPC manualmente com curl
- [x] Identificar formato correto de requisições GET no tRPC
- [x] Atualizar sync-service com formato correto
- [x] Verificar sincronização sem erros

## Resolver Erros Persistentes do Sync Service
- [x] Investigar logs em tempo real do servidor e app
- [x] Verificar se API_URL está correta no ambiente de desenvolvimento
- [x] Testar requisições axios diretamente
- [x] Corrigir configuração de CORS se necessário
- [x] Validar sincronização sem erros
