# 🔌 Integração com Backend - App 2iEQ

Este guia explica como o app está integrado com o backend real para sincronizar dados entre dispositivos.

---

## 📊 Arquitetura

```
Frontend (React Native)
    ↓
tRPC Client (lib/trpc.ts)
    ↓
Backend (server/routers.ts)
    ↓
Database (MySQL via Drizzle ORM)
```

---

## 🗄️ Banco de Dados

### Tabelas Criadas

| Tabela | Descrição | Campos |
|--------|-----------|--------|
| `celulas` | Células da igreja | id, nome, lider, telefone, endereco, latitude, longitude, diaReuniao, horario |
| `inscricoesBatismo` | Inscrições de batismo | id, nome, dataNascimento, celula, telefone, motivacao, status, dataProcessamento |
| `usuariosCadastrados` | Membros cadastrados | id, userId, nome, dataNascimento, celula |
| `pedidosOracao` | Pedidos de oração | id, nome, descricao, categoria, contadorOrando |
| `users` | Usuários do sistema (OAuth) | id, openId, name, email, loginMethod, role |

---

## 🔗 Rotas tRPC Disponíveis

### Células

```typescript
// Listar todas as células
trpc.celulas.list.useQuery()

// Obter célula por ID
trpc.celulas.getById.useQuery(id)

// Criar célula (requer autenticação)
trpc.celulas.create.useMutation()

// Atualizar célula (requer autenticação)
trpc.celulas.update.useMutation()

// Deletar célula (requer autenticação)
trpc.celulas.delete.useMutation()
```

### Inscrições de Batismo

```typescript
// Listar todas as inscrições
trpc.batismo.list.useQuery()

// Listar inscrições pendentes (requer autenticação)
trpc.batismo.listPendentes.useQuery()

// Criar inscrição
trpc.batismo.create.useMutation()

// Atualizar status (requer autenticação)
trpc.batismo.updateStatus.useMutation()

// Deletar inscrição (requer autenticação)
trpc.batismo.delete.useMutation()
```

### Usuários Cadastrados

```typescript
// Listar todos os usuários
trpc.usuarios.list.useQuery()

// Obter usuário do usuário logado (requer autenticação)
trpc.usuarios.getByUserId.useQuery()

// Listar aniversariantes do mês
trpc.usuarios.getAniversariantes.useQuery(mes)

// Listar membros de uma célula
trpc.usuarios.getMembrosPorCelula.useQuery("Nome da Célula")

// Criar usuário (requer autenticação)
trpc.usuarios.create.useMutation()

// Atualizar usuário (requer autenticação)
trpc.usuarios.update.useMutation()
```

### Pedidos de Oração

```typescript
// Listar todos os pedidos
trpc.oracao.list.useQuery()

// Obter pedido por ID
trpc.oracao.getById.useQuery(id)

// Criar pedido
trpc.oracao.create.useMutation()

// Incrementar contador de pessoas orando
trpc.oracao.incrementarContador.useMutation()

// Atualizar pedido (requer autenticação)
trpc.oracao.update.useMutation()

// Deletar pedido (requer autenticação)
trpc.oracao.delete.useMutation()
```

---

## 🎣 Usando Hooks Customizados

Criamos hooks customizados para facilitar o uso do backend no frontend:

### Exemplo: Listar Células

```typescript
import { useCelulas } from "@/hooks/use-backend-data";

export function CelulasScreen() {
  const { celulas, isLoading, refetch } = useCelulas();

  if (isLoading) return <ActivityIndicator />;

  return (
    <FlatList
      data={celulas}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <Text>{item.nome} - {item.lider}</Text>
      )}
      refreshing={isLoading}
      onRefresh={refetch}
    />
  );
}
```

### Exemplo: Criar Inscrição de Batismo

```typescript
import { useCreateInscricaoBatismo } from "@/hooks/use-backend-data";

export function BatismoForm() {
  const createMutation = useCreateInscricaoBatismo();

  const handleSubmit = async (data) => {
    try {
      await createMutation.mutateAsync({
        nome: data.nome,
        dataNascimento: data.dataNascimento,
        celula: data.celula,
        telefone: data.telefone,
        motivacao: data.motivacao,
      });
      Alert.alert("Sucesso", "Inscrição enviada!");
    } catch (error) {
      Alert.alert("Erro", "Falha ao enviar inscrição");
    }
  };

  return (
    // Seu formulário aqui
  );
}
```

### Exemplo: Obter Aniversariantes do Mês

```typescript
import { useAniversariantes } from "@/hooks/use-backend-data";

export function AniversariantesScreen() {
  const mesAtual = new Date().getMonth() + 1;
  const { aniversariantes, isLoading } = useAniversariantes(mesAtual);

  if (isLoading) return <ActivityIndicator />;

  return (
    <FlatList
      data={aniversariantes}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <Text>{item.nome} - {item.dataNascimento}</Text>
      )}
    />
  );
}
```

---

## 🔐 Autenticação

### Rotas Públicas (Sem Login)
- `celulas.list` - Listar células
- `batismo.list` - Listar inscrições de batismo
- `usuarios.list` - Listar usuários
- `usuarios.getAniversariantes` - Aniversariantes
- `usuarios.getMembrosPorCelula` - Membros por célula
- `oracao.list` - Listar pedidos de oração
- `batismo.create` - Criar inscrição de batismo
- `oracao.create` - Criar pedido de oração
- `oracao.incrementarContador` - Incrementar contador

### Rotas Protegidas (Requer Login)
- `celulas.create`, `update`, `delete` - Gerenciar células
- `batismo.listPendentes`, `updateStatus`, `delete` - Gerenciar batismo
- `usuarios.getByUserId`, `create`, `update` - Gerenciar usuários
- `oracao.update`, `delete` - Gerenciar pedidos de oração

---

## 🔄 Sincronização Entre Dispositivos

Quando um usuário faz login em múltiplos dispositivos:

1. **Dados sincronizam automaticamente** via backend
2. **Cada dispositivo puxa dados atualizados** ao abrir o app
3. **Mudanças em um dispositivo aparecem em outro** após refresh

### Exemplo de Sincronização

```typescript
// Dispositivo 1: Criar inscrição de batismo
const createMutation = useCreateInscricaoBatismo();
await createMutation.mutateAsync({
  nome: "João",
  dataNascimento: "1990-01-15",
  celula: "Célula do Centro",
  telefone: "(69) 99999-1111",
  motivacao: "Desejo seguir a Jesus",
});

// Dispositivo 2: Listar inscrições (dados sincronizados)
const { inscricoes, refetch } = useInscricoesBatismo();
await refetch(); // Puxa dados atualizados do servidor
// inscricoes agora inclui a inscrição criada no Dispositivo 1
```

---

## 📱 Migração do Frontend

### Antes (Dados Locais)

```typescript
import { CELULAS } from "@/lib/data/celulas";

export function CelulasScreen() {
  return (
    <FlatList
      data={CELULAS}
      renderItem={({ item }) => <CelulaCard celula={item} />}
    />
  );
}
```

### Depois (Backend Real)

```typescript
import { useCelulas } from "@/hooks/use-backend-data";

export function CelulasScreen() {
  const { celulas, isLoading, refetch } = useCelulas();

  return (
    <FlatList
      data={celulas}
      renderItem={({ item }) => <CelulaCard celula={item} />}
      refreshing={isLoading}
      onRefresh={refetch}
    />
  );
}
```

---

## 🚀 Próximos Passos

1. **Atualizar telas do app** para usar hooks do backend
2. **Implementar sincronização em tempo real** com WebSockets
3. **Adicionar cache offline** com TanStack Query
4. **Criar dashboard administrativo** para gerenciar dados

---

## 🆘 Troubleshooting

### "Database not available"
- Verifique se o backend está rodando
- Confirme que `DATABASE_URL` está configurado

### "UNAUTHORIZED" error
- Usuário não está autenticado
- Tente fazer login novamente

### Dados não sincronizam
- Verifique conexão com internet
- Tente fazer refresh manual
- Reinicie o app

---

**Última atualização:** 17 de fevereiro de 2026
