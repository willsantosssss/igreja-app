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
