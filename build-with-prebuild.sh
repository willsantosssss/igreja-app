#!/bin/bash

# Script para fazer build do Expo app usando expo prebuild + Gradle local
# Isso gera o código Android nativo que pode ser compilado com Gradle

set -e

cd /home/ubuntu/igreja-app

echo "🔨 Build local com expo prebuild + Gradle"
echo ""

# Variáveis
KEYSTORE_PATH="app-signing-key.jks"
KEYSTORE_PASSWORD="senha123456"
KEY_ALIAS="app-key"
KEY_PASSWORD="senha123456"

echo "📦 Passo 1: Instalando dependências..."
pnpm install --frozen-lockfile

echo ""
echo "🏗️  Passo 2: Gerando código Android nativo com expo prebuild..."
echo "(Isso pode levar alguns minutos)"

# Remover android anterior se existir
rm -rf android

# Usar expo prebuild para gerar o código Android
npx expo prebuild --platform android --clean

echo ""
echo "✅ Código Android gerado com sucesso!"
echo ""
echo "🔐 Passo 3: Configurando keystore no Gradle..."

# Criar arquivo gradle.properties com configurações de assinatura
cat > android/gradle.properties << EOF
# Configurações de assinatura
MYAPP_RELEASE_STORE_FILE=$KEYSTORE_PATH
MYAPP_RELEASE_STORE_PASSWORD=$KEYSTORE_PASSWORD
MYAPP_RELEASE_KEY_ALIAS=$KEY_ALIAS
MYAPP_RELEASE_KEY_PASSWORD=$KEY_PASSWORD
EOF

echo "✅ Gradle configurado!"
echo ""
echo "🏗️  Passo 4: Compilando APK/AAB com Gradle..."

# Verificar se o Android SDK está disponível
if ! command -v gradle &> /dev/null && ! [ -d "$ANDROID_HOME" ]; then
    echo "❌ Android SDK/Gradle não encontrado!"
    echo ""
    echo "Para compilar com Gradle, você precisa:"
    echo "1. Instalar Android SDK"
    echo "2. Ou usar Docker"
    echo ""
    echo "Alternativa: Use o EAS Build remoto e depois re-assine localmente"
    exit 1
fi

# Compilar AAB (App Bundle)
cd android
./gradlew bundleRelease

echo ""
echo "✅ AAB compilado com sucesso!"
echo ""
echo "📍 Arquivo gerado: app/build/outputs/bundle/release/app-release.aab"
echo ""
echo "🚀 Próximo passo: Fazer upload para o Google Play Console"
