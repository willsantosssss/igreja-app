# 🔐 Variáveis de Ambiente - Igreja App

Este documento lista todas as variáveis de ambiente necessárias para executar o app em desenvolvimento e produção.

## 📋 Resumo Rápido

| Variável | Obrigatória | Ambiente | Descrição |
|----------|-------------|----------|-----------|
| `DATABASE_URL` | ✅ Sim | Todos | URL de conexão ao banco MySQL |
| `JWT_SECRET` | ✅ Sim | Produção | Chave para assinar cookies |
| `VITE_APP_ID` | ✅ Sim | Todos | ID único da aplicação |
| `OAUTH_SERVER_URL` | ✅ Sim | Produção | URL do servidor OAuth |
| `OWNER_OPEN_ID` | ✅ Sim | Produção | ID do proprietário |
| `OWNER_NAME` | ✅ Sim | Produção | Nome do proprietário |
| `BUILT_IN_FORGE_API_URL` | ❌ Não | Opcional | URL da API Forge |
| `BUILT_IN_FORGE_API_KEY` | ❌ Não | Opcional | Chave da API Forge |
| `EXPO_PUBLIC_ABIBLIA_TOKEN` | ❌ Não | Opcional | Token ABiblia Digital |
| `NODE_ENV` | ❌ Não | Todos | Ambiente (development/production) |
| `PORT` | ❌ Não | Todos | Porta do servidor (padrão: 3000) |

---

## 🔧 Configuração por Ambiente

### Desenvolvimento Local

```bash
# .env.local (desenvolvimento)
DATABASE_URL=mysql://root:password@localhost:3306/igreja
JWT_SECRET=chave_desenvolvimento_qualquer_coisa
VITE_APP_ID=space.manus.igreja.app.dev
NODE_ENV=development
PORT=3000
```

### Produção (Railway)

```bash
# .env.local (produção)
DATABASE_URL=mysql://root:IYXvcURyRTwwYweeFUunhhj@ballast.proxy.rlwy.net:54202/railway
JWT_SECRET=<gerar com: openssl rand -base64 32>
VITE_APP_ID=space.manus.igreja.app.t20240115103045
OAUTH_SERVER_URL=https://seu-oauth-server.com
OWNER_OPEN_ID=seu_owner_id
OWNER_NAME=Nome do Proprietário
NODE_ENV=production
PORT=3000
```

---

## 📝 Descrição Detalhada de Cada Variável

### DATABASE_URL
**Obrigatória:** ✅ Sim  
**Formato:** `mysql://user:password@host:port/database`  
**Exemplo:** `mysql://root:senha123@localhost:3306/igreja`

URL de conexão ao banco de dados MySQL. Necessária para todas as operações de banco de dados.

**Como obter no Railway:**
1. Acesse [railway.app](https://railway.app)
2. Clique no banco MySQL
3. Vá para aba "Variables"
4. Copie `MYSQL_PUBLIC_URL`

---

### JWT_SECRET
**Obrigatória:** ✅ Sim (em produção)  
**Comprimento mínimo:** 32 caracteres  
**Exemplo:** `qP8vX2nK9mL4jR7sT1wQ5yZ3aB6cD0eF`

Chave secreta para assinar cookies de sessão e tokens JWT. Deve ser aleatória e segura.

**Como gerar:**
```bash
openssl rand -base64 32
```

**⚠️ IMPORTANTE:** Nunca compartilhe esta chave! Se for comprometida, todos os tokens serão inválidos.

---

### VITE_APP_ID
**Obrigatória:** ✅ Sim  
**Formato:** `space.manus.nome.app.timestamp`  
**Exemplo:** `space.manus.igreja.app.t20240115103045`

ID único que identifica a aplicação no sistema. Usado para validações e configurações.

---

### OAUTH_SERVER_URL
**Obrigatória:** ✅ Sim (em produção)  
**Formato:** URL HTTPS  
**Exemplo:** `https://seu-oauth-server.com`

URL do servidor OAuth onde os usuários fazem login. Deve ser HTTPS em produção.

---

### OWNER_OPEN_ID
**Obrigatória:** ✅ Sim (em produção)  
**Formato:** String de ID  
**Exemplo:** `user_123456`

ID do proprietário da aplicação no sistema OAuth. Usado para validar permissões de admin.

---

### OWNER_NAME
**Obrigatória:** ✅ Sim (em produção)  
**Formato:** String de texto  
**Exemplo:** `Pastor João Silva`

Nome do proprietário da aplicação. Usado em logs e identificações.

---

### BUILT_IN_FORGE_API_URL
**Obrigatória:** ❌ Não  
**Formato:** URL HTTPS  
**Exemplo:** `https://api.forge.com`

URL da API Forge para recursos adicionais. Deixe vazio se não usar.

---

### BUILT_IN_FORGE_API_KEY
**Obrigatória:** ❌ Não  
**Formato:** String de chave  
**Exemplo:** `sk_live_abc123...`

Chave de API para Forge. Deixe vazio se não usar.

---

### EXPO_PUBLIC_ABIBLIA_TOKEN
**Obrigatória:** ❌ Não  
**Formato:** String de token  
**Exemplo:** `seu_token_aqui`

Token para acessar a API ABiblia Digital (para leitura de Bíblia). 

**Como obter:**
1. Acesse [abibliadigital.com.br](https://www.abibliadigital.com.br/)
2. Crie uma conta
3. Gere um token na área de desenvolvedor

---

### NODE_ENV
**Obrigatória:** ❌ Não (padrão: development)  
**Valores permitidos:** `development`, `staging`, `production`  
**Exemplo:** `production`

Define o ambiente de execução. Afeta comportamento de logs, validações e otimizações.

---

### PORT
**Obrigatória:** ❌ Não (padrão: 3000)  
**Valores permitidos:** 1-65535  
**Exemplo:** `3000`

Porta em que o servidor Express rodará.

---

## 🔒 Segurança

### Boas Práticas

1. **Nunca commite `.env.local` no Git**
   - Já está no `.gitignore`, mas sempre verifique

2. **Use valores diferentes para dev e produção**
   - Nunca use a mesma `JWT_SECRET` em ambos

3. **Rotacione chaves regularmente**
   - Especialmente `JWT_SECRET` e chaves de API

4. **Use HTTPS em produção**
   - Sempre use URLs HTTPS para APIs externas

5. **Não compartilhe este arquivo**
   - Contém informações sensíveis

### Checklist de Segurança

- [ ] `JWT_SECRET` tem pelo menos 32 caracteres
- [ ] `JWT_SECRET` é aleatório e único
- [ ] `DATABASE_URL` não está commitado no Git
- [ ] Todas as URLs usam HTTPS em produção
- [ ] Chaves de API não são compartilhadas
- [ ] `.env.local` está no `.gitignore`

---

## 🚀 Deploy para Produção

### Passo 1: Gerar Chaves Seguras

```bash
# Gerar JWT_SECRET
openssl rand -base64 32

# Resultado exemplo:
# qP8vX2nK9mL4jR7sT1wQ5yZ3aB6cD0eF
```

### Passo 2: Configurar Railway

1. Acesse [railway.app](https://railway.app)
2. Vá para seu projeto
3. Clique em "Variables"
4. Adicione cada variável do `.env.local`

### Passo 3: Testar Conexão

```bash
# Testar conexão ao banco
mysql -h ballast.proxy.rlwy.net -u root -p -D railway

# Testar servidor
curl https://seu-dominio.com/health
```

---

## 🆘 Troubleshooting

### "DATABASE_URL not set"
- Verifique se `.env.local` existe
- Verifique se `DATABASE_URL` está definida
- Reinicie o servidor

### "Connection refused"
- Verifique se o banco MySQL está rodando
- Verifique se a URL está correta
- Verifique firewall/rede

### "Access denied"
- Verifique user e password
- Verifique se o usuário tem permissões
- Verifique se o banco existe

### "Invalid JWT_SECRET"
- Verifique se tem pelo menos 32 caracteres
- Regenere com `openssl rand -base64 32`
- Reinicie o servidor

---

## 📚 Referências

- [Railway Docs](https://docs.railway.app/)
- [MySQL Connection String](https://dev.mysql.com/doc/connector-net/en/connector-net-connection-string.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OAuth 2.0 Spec](https://tools.ietf.org/html/rfc6749)
