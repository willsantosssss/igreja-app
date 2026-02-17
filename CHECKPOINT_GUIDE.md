# 📸 Guia de Checkpoint - App 2iEQ

Este guia explica como criar checkpoints após fazer alterações no aplicativo.

## O que é um Checkpoint?

Um **checkpoint** é um snapshot (foto) do seu projeto em um momento específico. Permite que você:
- ✅ Salve versões do app
- ✅ Volte a versões anteriores se algo der errado
- ✅ Compartilhe versões com outros
- ✅ Publique o app nas lojas

---

## 🚀 Como Criar um Checkpoint

### Opção 1: Usar o Script (Recomendado)

#### Linux/Mac:
```bash
cd /home/ubuntu/igreja-app
./scripts/create_checkpoint.sh "Descrição das alterações"
```

#### Windows (PowerShell):
```powershell
cd C:\Users\...\igreja-app
python scripts/create_checkpoint.py "Descrição das alterações"
```

### Opção 2: Usar o Painel de Gerenciamento

1. Abra o painel de controle do projeto
2. Clique em **"Publish"** (canto superior direito)
3. Selecione **"Create Checkpoint"**
4. Digite a descrição das alterações
5. Clique em **"Save"**

### Opção 3: Solicitar ao Manus

Envie uma mensagem para Manus:

```
Crie um checkpoint com a descrição: "Alterado nome da igreja e cores"
```

---

## 📝 Exemplos de Descrições

Boas descrições ajudam a identificar o que foi alterado:

✅ **Bom:**
- "Alterado nome da igreja para 'Comunidade Cristã'"
- "Adicionados 5 novos eventos na agenda"
- "Atualizado logo e cores do app"
- "Implementado sistema de notificações"

❌ **Ruim:**
- "Alterações"
- "Ajustes"
- "Mudanças várias"

---

## 📋 Checklist Antes de Criar Checkpoint

Antes de criar um checkpoint, verifique:

- [ ] Todas as alterações foram salvas
- [ ] O app está funcionando corretamente
- [ ] Testou as mudanças no Expo Go
- [ ] Não há erros no console
- [ ] A descrição é clara e descritiva

---

## 🔄 Fluxo Recomendado

1. **Faça alterações** no código
2. **Teste no Expo Go** (escaneie o QR Code)
3. **Verifique se funciona** corretamente
4. **Crie um checkpoint** com descrição clara
5. **Repita** para próximas alterações

---

## 📊 Visualizar Checkpoints

Para ver todos os checkpoints criados:

1. Abra o painel de controle
2. Clique em **"Checkpoints"**
3. Veja a lista de versões salvas
4. Clique em qualquer versão para visualizar

---

## ↩️ Voltar a um Checkpoint Anterior

Se algo der errado e você quer voltar a uma versão anterior:

1. Abra o painel de controle
2. Clique em **"Checkpoints"**
3. Selecione a versão anterior desejada
4. Clique em **"Rollback"**
5. Confirme a ação

---

## 💡 Dicas

- **Crie checkpoints frequentemente** (a cada 2-3 alterações importantes)
- **Use descrições descritivas** para facilitar identificação
- **Teste antes de criar** checkpoint para evitar salvar erros
- **Nomeie versões importantes** (ex: "v1.0 - Lançamento")

---

## ⚠️ Importante

- Checkpoints são **salvos automaticamente** na nuvem
- Você pode ter **múltiplas versões** do app
- Não há limite de checkpoints
- Sempre é possível voltar a uma versão anterior

---

## 🆘 Problemas Comuns

### "Script não encontrado"
```bash
# Certifique-se de estar no diretório correto
cd /home/ubuntu/igreja-app

# Dê permissão de execução ao script
chmod +x scripts/create_checkpoint.sh
```

### "Erro ao criar checkpoint"
1. Verifique se todas as alterações foram salvas
2. Verifique se há espaço em disco disponível
3. Tente novamente em alguns minutos
4. Se persistir, contate o suporte

---

## 📞 Suporte

Se tiver dúvidas sobre checkpoints:
1. Consulte este guia
2. Abra o painel de controle e clique em "Help"
3. Contate o suporte do Manus

---

**Última atualização:** 17 de fevereiro de 2026
