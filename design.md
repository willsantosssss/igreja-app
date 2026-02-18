# Design do Aplicativo 2IEQ Connect

## Orientação e Uso
- **Orientação**: Mobile portrait (9:16)
- **Uso**: Uma mão (one-handed usage)
- **Padrão**: Apple Human Interface Guidelines (HIG) - design iOS nativo

## Lista de Telas

### 1. Home (Início)
- **Conteúdo Principal**: 
  - Saudação personalizada ao usuário
  - Card com próximo evento da agenda
  - Card com devocional do dia (versículo destacado)
  - Acesso rápido às funcionalidades principais
  - Notificações importantes da igreja
- **Funcionalidade**: 
  - Navegação rápida para todas as seções
  - Visualização de conteúdo recente
  - Pull-to-refresh para atualizar dados

### 2. Agenda
- **Conteúdo Principal**:
  - Lista de eventos futuros organizados por data
  - Cada card mostra: título, data/hora, local, categoria (culto, reunião, evento especial)
  - Filtros por tipo de evento
- **Funcionalidade**:
  - Visualizar detalhes do evento ao tocar
  - Adicionar evento ao calendário do dispositivo
  - Compartilhar evento

### 3. Detalhe do Evento
- **Conteúdo Principal**:
  - Imagem do evento (banner)
  - Título, data/hora, local
  - Descrição completa
  - Botão de inscrição
  - Mapa de localização (se aplicável)
- **Funcionalidade**:
  - Inscrever-se no evento
  - Adicionar ao calendário
  - Compartilhar
  - Navegação para o local

### 4. Células
- **Conteúdo Principal**:
  - Mapa interativo mostrando localização das células
  - Lista de células com informações: nome, líder, dia/horário, endereço
  - Filtro por região/bairro
- **Funcionalidade**:
  - Visualizar células no mapa
  - Ver detalhes de cada célula
  - Obter direções para o local
  - Entrar em contato com líder da célula

### 5. Detalhe da Célula
- **Conteúdo Principal**:
  - Nome da célula
  - Informações do líder (nome, foto, contato)
  - Dia e horário de reunião
  - Endereço completo
  - Descrição da célula
- **Funcionalidade**:
  - Participar da célula (registrar interesse)
  - Abrir mapa/navegação
  - Contatar líder (WhatsApp/telefone)

### 6. Inscrição de Eventos
- **Conteúdo Principal**:
  - Formulário com campos: nome, email, telefone, observações
  - Informações do evento selecionado
  - Termos e condições (se aplicável)
- **Funcionalidade**:
  - Validação de campos
  - Envio de inscrição
  - Confirmação visual de sucesso
  - Receber email de confirmação

### 7. Contribuições
- **Conteúdo Principal**:
  - Opções de contribuição: dízimo, oferta, missões, projetos especiais
  - Informações bancárias da igreja (PIX, transferência)
  - QR Code PIX
  - Histórico de contribuições (opcional)
- **Funcionalidade**:
  - Copiar chave PIX
  - Copiar dados bancários
  - Compartilhar QR Code
  - Abrir app de pagamento

### 8. Devocional Diário
- **Conteúdo Principal**:
  - Capítulo do Novo Testamento do dia
  - Navegação sequencial (1 capítulo por dia)
  - Indicador de progresso (qual capítulo, quantos faltam)
  - Texto bíblico formatado
  - Opção de marcar como lido
- **Funcionalidade**:
  - Ler capítulo do dia
  - Navegar para capítulos anteriores/próximos
  - Marcar como lido
  - Compartilhar versículo
  - Ajustar tamanho da fonte

### 9. Oração
- **Conteúdo Principal**:
  - Lista de pedidos de oração da comunidade
  - Formulário para adicionar pedido
  - Contador de pessoas orando por cada pedido
- **Funcionalidade**:
  - Adicionar pedido de oração
  - Marcar "Estou orando" em pedidos
  - Compartilhar pedido
  - Testemunhos de orações respondidas

### 10. Avisos/Notícias
- **Conteúdo Principal**:
  - Feed de notícias e avisos da igreja
  - Cards com imagem, título, resumo, data
  - Categorias: avisos, notícias, testemunhos
- **Funcionalidade**:
  - Visualizar detalhes da notícia
  - Compartilhar
  - Filtrar por categoria

### 11. Perfil/Configurações
- **Conteúdo Principal**:
  - Informações do usuário (opcional)
  - Configurações de notificações
  - Preferências de tema (claro/escuro)
  - Sobre o app
  - Contato da igreja
- **Funcionalidade**:
  - Editar perfil
  - Ativar/desativar notificações
  - Alternar tema
  - Enviar feedback

## Fluxos Principais de Usuário

### Fluxo 1: Inscrever-se em Evento
1. Usuário abre app → Tela Home
2. Toca em card de evento OU vai para aba Agenda
3. Seleciona evento → Tela Detalhe do Evento
4. Toca em "Inscrever-se" → Tela Formulário de Inscrição
5. Preenche dados e envia
6. Recebe confirmação visual → Retorna para Detalhe do Evento

### Fluxo 2: Encontrar Célula
1. Usuário abre aba Células
2. Visualiza mapa com pins OU lista de células
3. Toca em célula de interesse → Tela Detalhe da Célula
4. Visualiza informações e toca em "Participar" ou "Contatar Líder"
5. Ação executada (WhatsApp abre, navegação inicia, etc.)

### Fluxo 3: Contribuir
1. Usuário abre aba Contribuições
2. Seleciona tipo de contribuição
3. Visualiza QR Code PIX ou dados bancários
4. Toca em "Copiar PIX" ou "Abrir App de Pagamento"
5. Realiza contribuição em app externo
6. Retorna ao app

### Fluxo 4: Ler Devocional
1. Usuário abre aba Devocional
2. Visualiza capítulo do dia
3. Lê o texto
4. Marca como lido (opcional)
5. Compartilha versículo favorito (opcional)

### Fluxo 5: Adicionar Pedido de Oração
1. Usuário abre aba Oração
2. Toca em botão "Adicionar Pedido"
3. Preenche formulário (título, descrição, categoria)
4. Envia pedido
5. Pedido aparece na lista da comunidade

## Escolhas de Cores

### Paleta Principal
- **Primary (Primária)**: `#6B46C1` (Roxo/Púrpura) - representa espiritualidade, fé, realeza divina
- **Secondary (Secundária)**: `#F59E0B` (Dourado/Âmbar) - representa luz, esperança, glória
- **Background (Fundo Claro)**: `#FFFFFF` (Branco)
- **Background Dark (Fundo Escuro)**: `#1A1625` (Roxo muito escuro)
- **Surface (Superfície Clara)**: `#F8F7FA` (Cinza muito claro com toque roxo)
- **Surface Dark (Superfície Escura)**: `#2D2438` (Roxo escuro)
- **Foreground (Texto Principal)**: `#1F1B24` (Quase preto com toque roxo)
- **Muted (Texto Secundário)**: `#6B7280` (Cinza médio)
- **Border**: `#E5E7EB` (Cinza claro)
- **Success**: `#10B981` (Verde) - confirmações, orações respondidas
- **Warning**: `#F59E0B` (Âmbar) - alertas importantes
- **Error**: `#EF4444` (Vermelho) - erros, campos obrigatórios

### Aplicação das Cores
- **Tab Bar**: Background branco/escuro, ícone ativo em Primary
- **Cards**: Background Surface, borda sutil, sombra leve
- **Botões Primários**: Background Primary, texto branco
- **Botões Secundários**: Borda Primary, texto Primary
- **Headers**: Gradiente sutil de Primary para Secondary (opcional)
- **Destaques**: Usar Secondary para elementos que precisam chamar atenção (ex: "Novo evento")

## Componentes de UI Principais

### Tab Bar (Navegação Principal)
- **Tabs**: Home, Agenda, Células, Devocional, Oração, Mais
- **Estilo**: Ícones SF Symbols, labels curtos, indicador de aba ativa
- **Posição**: Bottom (padrão iOS)

### Cards
- **Estilo**: Cantos arredondados (12-16px), sombra sutil, padding generoso
- **Conteúdo**: Imagem (opcional), título, descrição breve, ícones de ação

### Botões
- **Primário**: Fundo Primary, texto branco, altura 48-52px, cantos arredondados
- **Secundário**: Borda Primary, texto Primary, mesmo tamanho
- **Ícone**: Apenas ícone para ações secundárias (compartilhar, favoritar)

### Formulários
- **Inputs**: Borda Border, fundo Surface, altura 48px, placeholder em Muted
- **Labels**: Texto Foreground, peso medium, acima do input
- **Validação**: Borda Error para campos inválidos, mensagem abaixo do input

### Listas
- **Item**: Padding vertical 12-16px, separador sutil
- **Ação**: Chevron right para indicar navegação
- **Swipe**: Ações de swipe para deletar/editar (se aplicável)

## Tipografia
- **Títulos Grandes**: 28-32px, peso bold
- **Títulos Médios**: 20-24px, peso semibold
- **Corpo**: 16px, peso regular, line-height 1.5
- **Secundário**: 14px, peso regular, cor Muted
- **Botões**: 16-17px, peso semibold
- **Labels**: 12-13px, peso medium, uppercase (opcional)

## Ícones
- **Estilo**: SF Symbols (iOS) / Material Icons (Android)
- **Tamanho**: 24-28px para tab bar, 20-24px para ações inline
- **Cor**: Segue paleta (Primary para ativos, Muted para inativos)

## Animações e Feedback
- **Transições**: Suaves, 250-300ms
- **Press States**: Scale 0.97, opacity 0.9
- **Haptics**: Light impact em botões principais
- **Loading**: Spinner Primary, texto "Carregando..."
- **Success**: Checkmark animado, haptic success
- **Error**: Shake animation, haptic error

## Considerações de Acessibilidade
- **Contraste**: Mínimo 4.5:1 para texto
- **Tamanho de Toque**: Mínimo 44x44px
- **Labels**: Todos os elementos interativos com labels acessíveis
- **Suporte a VoiceOver/TalkBack**: Navegação por voz
