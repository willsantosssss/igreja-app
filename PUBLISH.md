# 📱 Publicação da App Igreja Connect no Google Play

Este guia explica como publicar a app Igreja Connect no Google Play Console usando **Fastlane** com **Google Service Account**.

---

## 🔧 Pré-requisitos

1. **Fastlane instalado** - `sudo gem install fastlane`
2. **Google Service Account configurado** - ✅ Já feito em `fastlane/google-play-credentials.json`
3. **APK/AAB gerado** - Será gerado automaticamente durante o build

---

## 📋 Estrutura de Publicação

O Fastlane está configurado com 4 lanes (comandos) diferentes:

| Lane | Descrição | Uso |
|------|-----------|-----|
| `upload_internal` | Upload para testes internos | Testes rápidos com sua equipe |
| `upload_beta` | Upload para testes fechados | Testes com grupo limitado de usuários |
| `upload_production` | Upload para produção | Lançamento público na Play Store |
| `build_and_upload` | Build + Upload completo | Build do zero e upload automático |

---

## 🚀 Como Publicar

### 1️⃣ **Testes Internos** (Recomendado para começar)

```bash
cd /home/ubuntu/igreja-app
fastlane android upload_internal
```

**O que acontece:**
- ✅ Faz upload do APK/AAB para o track "internal"
- ✅ Disponível apenas para contas de teste que você configurar
- ✅ Sem revisão do Google (instantâneo)
- ✅ Perfeito para testar antes de lançar

---

### 2️⃣ **Testes Fechados (Beta)**

```bash
cd /home/ubuntu/igreja-app
fastlane android upload_beta
```

**O que acontece:**
- ✅ Faz upload para o track "beta"
- ✅ Disponível para usuários que você convidar
- ✅ Sem revisão do Google
- ✅ Ideal para testes com grupo limitado

---

### 3️⃣ **Produção (Lançamento Público)**

```bash
cd /home/ubuntu/igreja-app
fastlane android upload_production
```

**O que acontece:**
- ✅ Faz upload para o track "production"
- ✅ **REVISÃO DO GOOGLE** (pode levar 24-48 horas)
- ✅ Disponível para todos os usuários
- ✅ **⚠️ Irreversível** - Verifique tudo antes!

---

## 📦 Arquivos de Configuração

### `fastlane/google-play-credentials.json`
Contém as credenciais do Google Service Account. **⚠️ NUNCA compartilhe este arquivo!**

### `fastlane/Fastfile`
Define os comandos (lanes) de publicação.

### `fastlane/Appfile`
Configuração da app (package name e credenciais).

---

## 🔐 Segurança

- ✅ O arquivo `google-play-credentials.json` está no `.gitignore`
- ✅ Nunca commit este arquivo no Git
- ✅ Mantenha a chave privada segura
- ✅ Use variáveis de ambiente para dados sensíveis

---

## 🐛 Troubleshooting

### Erro: "Fastlane not found"
```bash
sudo gem install fastlane
```

### Erro: "Invalid credentials"
- Verifique se `fastlane/google-play-credentials.json` está correto
- Confirme que o Service Account tem permissões no Google Play Console

### Erro: "APK not found"
- Certifique-se de que o build foi executado: `npm run build`
- Verifique o caminho do APK em `fastlane/Fastfile`

---

## 📞 Próximos Passos

1. **Teste localmente** com `upload_internal`
2. **Convide testers** para o track "beta"
3. **Colete feedback** antes de lançar
4. **Revise tudo** antes de `upload_production`
5. **Monitore** a revisão do Google (24-48 horas)

---

## 📚 Referências

- [Fastlane Documentation](https://docs.fastlane.tools/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Expo Build Documentation](https://docs.expo.dev/build/introduction/)

---

**Boa sorte com o lançamento da Igreja Connect! 🎉**
