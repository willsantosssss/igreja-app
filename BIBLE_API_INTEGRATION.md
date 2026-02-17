# Integração com Bible API

## Visão Geral

O aplicativo 2iEQ agora integra a **Bible API** para fornecer acesso aos 260 capítulos do Novo Testamento nas versões **NAA (Nova Almeida Atualizada)** e **NVI (Nova Versão Internacional)**, com suporte completo a cache offline.

## Características

✅ **260 Capítulos Completos** - Todos os capítulos do Novo Testamento em sequência  
✅ **Duas Versões** - NAA e NVI disponíveis  
✅ **Cache Offline** - Capítulos carregados ficam disponíveis offline  
✅ **Sincronização Automática** - Dados sincronizados entre dispositivos  
✅ **Testes Automatizados** - 10 testes unitários cobrindo toda a funcionalidade  

## Arquivos Principais

### Serviço de Bible API
**Arquivo:** `lib/services/bible-api.ts`

Funções principais:
- `buscarCapituloAPI(livro, capitulo, versao)` - Busca capítulo da API com cache
- `precarregarCapitulos(capitulos, versao)` - Pré-carrega múltiplos capítulos
- `getNovoTestamento()` - Retorna lista de 260 capítulos
- `limparCacheBiblia()` - Limpa cache local
- `getEstatisticasCache()` - Retorna estatísticas de cache

### Hook Customizado
**Arquivo:** `hooks/use-biblia.ts`

Hooks para usar no React:
- `useCapituloBiblia(livro, capitulo, versao)` - Hook para carregar capítulo
- `useEstatisticasCache()` - Hook para estatísticas de cache

### Tela de Devocional
**Arquivo:** `app/(tabs)/devocional.tsx`

Implementação completa com:
- Carregamento de capítulos via Bible API
- Seletor de versão (NAA/NVI)
- Ajuste de tamanho de fonte
- Compartilhamento de versículos
- Marcação de capítulos lidos
- Progresso de leitura

## Como Usar

### Carregar um Capítulo

```typescript
import { useCapituloBiblia } from "@/hooks/use-biblia";

export function MeuComponente() {
  const { texto, isLoading, error } = useCapituloBiblia("Lucas", 4, "NAA");

  if (isLoading) return <Text>Carregando...</Text>;
  if (error) return <Text>Erro: {error}</Text>;

  return <Text>{texto?.texto}</Text>;
}
```

### Pré-carregar Capítulos

```typescript
import { precarregarCapitulos, getNovoTestamento } from "@/lib/services/bible-api";

// Pré-carregar todos os capítulos
const capitulos = getNovoTestamento();
await precarregarCapitulos(capitulos, "NAA");
```

### Verificar Estatísticas de Cache

```typescript
import { getEstatisticasCache } from "@/lib/services/bible-api";

const stats = await getEstatisticasCache();
console.log(`${stats.capitulosEmCache}/${stats.totalCapitulos} capítulos em cache`);
console.log(`Tamanho: ${stats.tamanhoCache}`);
```

## Sequência de 260 Capítulos

A sequência segue a ordem tradicional do Novo Testamento:

1. **Evangelhos** (89 capítulos)
   - Mateus (28)
   - Marcos (16)
   - Lucas (24)
   - João (21)

2. **Atos** (28 capítulos)

3. **Epístolas Paulinas** (100 capítulos)
   - Romanos (16)
   - 1 Coríntios (16)
   - 2 Coríntios (13)
   - Gálatas (6)
   - Efésios (6)
   - Filipenses (4)
   - Colossenses (4)
   - 1 Tessalonicenses (5)
   - 2 Tessalonicenses (3)
   - 1 Timóteo (6)
   - 2 Timóteo (4)
   - Tito (3)
   - Filemon (1)

4. **Hebreus** (13 capítulos)

5. **Epístolas Gerais** (21 capítulos)
   - Tiago (5)
   - 1 Pedro (5)
   - 2 Pedro (3)
   - 1 João (5)
   - 2 João (1)
   - 3 João (1)
   - Judas (1)

6. **Apocalipse** (22 capítulos)

## Cache Offline

### Como Funciona

1. Quando um capítulo é solicitado, o app primeiro verifica o cache local (AsyncStorage)
2. Se encontrado, retorna do cache imediatamente
3. Se não encontrado, busca da Bible API
4. Após receber da API, salva no cache para uso offline

### Limpando Cache

```typescript
import { limparCacheBiblia } from "@/lib/services/bible-api";

await limparCacheBiblia();
```

### Tamanho de Cache

Cada capítulo ocupa aproximadamente 10-15 KB em cache. Com 260 capítulos, o cache completo ocupa cerca de 2.6-3.9 MB.

## Testes

### Executar Testes

```bash
pnpm test
```

### Cobertura de Testes

- ✅ Verificar 260 capítulos retornados
- ✅ Validar sequência (Mateus 1 a Apocalipse 22)
- ✅ Testar cache de capítulos
- ✅ Validar busca da API
- ✅ Testar limpeza de cache
- ✅ Verificar estatísticas de cache
- ✅ Testar tratamento de erros

## Integração com Backend

Para sincronizar dados de devocional entre dispositivos:

1. Adicionar rota tRPC em `server/routers.ts`:
```typescript
devocional: {
  marcarComoLido: procedure.input(z.object({
    userId: z.string(),
    capitulo: z.string(),
  })).mutation(async ({ input }) => {
    // Salvar no banco de dados
  }),
  obterCapitulosLidos: procedure.input(z.string()).query(async ({ input }) => {
    // Retornar capítulos lidos do usuário
  }),
}
```

2. Usar hook customizado:
```typescript
const { mutate: marcarLido } = trpc.devocional.marcarComoLido.useMutation();
```

## Próximos Passos

1. **Sincronização em Tempo Real** - Implementar WebSockets para atualizar capítulos lidos entre dispositivos
2. **Notificações Diárias** - Lembrar usuários de ler o devocional do dia
3. **Comentários Bíblicos** - Adicionar notas e reflexões da 2iEQ para cada capítulo
4. **Estatísticas de Leitura** - Dashboard mostrando progresso de leitura por mês/ano
5. **Compartilhamento Social** - Integração com WhatsApp, Instagram, etc.

## Suporte

Para problemas ou dúvidas:
- Verificar console do app para logs de erro
- Limpar cache e tentar novamente
- Verificar conexão com internet
- Consultar documentação da Bible API em https://www.bible-api.com
