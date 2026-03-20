# 🔍 Configuração do Sentry - Monitoramento de Erros

Sentry é um serviço de monitoramento de erros em tempo real que ajuda a identificar e corrigir bugs em produção.

## 📋 Passo a Passo

### 1. Criar Conta no Sentry

1. Acesse [sentry.io](https://sentry.io)
2. Clique em "Sign Up" (ou faça login se já tiver conta)
3. Escolha o plano (Free é suficiente para começar)
4. Confirme seu email

### 2. Criar Projeto

1. Clique em "Projects" no menu
2. Clique em "Create Project"
3. Escolha a plataforma:
   - **Backend:** Node.js
   - **Frontend:** React
4. Dê um nome: "Igreja App - Backend" ou "Igreja App - Frontend"
5. Clique em "Create Project"

### 3. Obter DSN

Após criar o projeto, você verá a página de setup com o **DSN** (Data Source Name):

```
https://seu_key@seu_org.ingest.sentry.io/seu_project_id
```

Copie este valor.

### 4. Configurar Variáveis de Ambiente

Adicione a variável `SENTRY_DSN` no seu `.env.local`:

```bash
SENTRY_DSN=https://seu_key@seu_org.ingest.sentry.io/seu_project_id
```

### 5. Integrar no Backend (Node.js)

Já temos a dependência `@sentry/node` instalada. Adicione ao arquivo `server/_core/index.ts`:

```typescript
import * as Sentry from "@sentry/node";

// No início da função startServer()
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  });
}

// Adicionar middleware de erro
app.use(Sentry.Handlers.errorHandler());
```

### 6. Integrar no Frontend (React Native)

Adicione ao arquivo `app/_layout.tsx`:

```typescript
import * as Sentry from "@sentry/react-native";

if (process.env.EXPO_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 0.1,
  });
}
```

### 7. Testar Integração

Para testar se está funcionando, lance um erro propositalmente:

**Backend:**
```typescript
app.get("/test-error", (req, res) => {
  throw new Error("Test error from Sentry");
});
```

**Frontend:**
```typescript
<Button onPress={() => {
  throw new Error("Test error from Sentry");
}}>
  Test Sentry
</Button>
```

Acesse a URL ou clique no botão, e você deve ver o erro aparecer no Sentry em alguns segundos.

## 🎯 Recursos Úteis

### Capturar Exceções Manualmente

```typescript
import * as Sentry from "@sentry/node";

try {
  // seu código
} catch (error) {
  Sentry.captureException(error);
}
```

### Adicionar Contexto

```typescript
Sentry.setContext("user", {
  id: user.id,
  email: user.email,
});

Sentry.setTag("environment", "production");
```

### Breadcrumbs (Rastreamento de Ações)

```typescript
Sentry.addBreadcrumb({
  category: "auth",
  message: "User logged in",
  level: "info",
});
```

## 📊 Dashboard do Sentry

No dashboard do Sentry, você pode:
- Ver todos os erros em tempo real
- Agrupar erros por tipo
- Ver stack traces completos
- Rastrear tendências de erros
- Configurar alertas por email

## 🔒 Segurança

- **Nunca** commite o DSN no Git
- Use variáveis de ambiente
- Configure diferentes DSNs para dev/prod
- Revise quais dados são enviados (evite dados sensíveis)

## 💡 Dicas

1. **Sampling:** Em produção, envie apenas 10% dos erros para economizar quota
2. **Alertas:** Configure alertas para erros críticos
3. **Performance:** Monitore performance com `tracesSampleRate`
4. **Integração com GitHub:** Conecte seu repositório para melhor rastreamento

## ❓ Troubleshooting

### Erros não aparecem no Sentry

- Verifique se `SENTRY_DSN` está configurado
- Verifique se o app está em produção (ou `tracesSampleRate > 0`)
- Verifique se há conexão com internet
- Veja os logs do console para mensagens de erro

### Muitos erros sendo enviados

- Reduza `tracesSampleRate` em produção
- Configure filtros para ignorar certos erros
- Revise se há erros repetitivos que podem ser corrigidos

---

**Próximas Etapas:**
1. Criar conta no Sentry
2. Criar projeto
3. Copiar DSN
4. Adicionar `SENTRY_DSN` ao `.env.local`
5. Integrar no backend e frontend
6. Testar com erro proposital
