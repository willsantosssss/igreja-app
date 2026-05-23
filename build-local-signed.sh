#!/bin/bash

# Script para fazer build do Expo app localmente e assinar com keystore local
# Sem usar EAS Build

set -e

cd /home/ubuntu/igreja-app

echo "🔨 Iniciando build local do Expo app..."
echo ""

# Variáveis
KEYSTORE_PATH="app-signing-key.jks"
KEYSTORE_PASSWORD="senha123456"
KEY_ALIAS="app-key"
KEY_PASSWORD="senha123456"
OUTPUT_DIR="./build-output"

# Criar diretório de saída
mkdir -p "$OUTPUT_DIR"

echo "📦 Passo 1: Instalando dependências..."
pnpm install --frozen-lockfile

echo ""
echo "🏗️  Passo 2: Fazendo build do Expo app para Android..."
# Usar expo build-web para gerar os assets
# Depois usar Gradle para compilar o APK/AAB

# Para Expo Managed Workflow, precisamos usar:
# npx eas build --platform android --local

echo "⚠️  Tentando build local com EAS..."
npx eas build --platform android --profile production --local 2>&1 | tee build.log

echo ""
echo "✅ Build concluído!"
echo ""
echo "📍 Procurando pelo AAB gerado..."

# Procurar pelo AAB gerado
AAB_FILE=$(find . -name "*.aab" -type f -mmin -30 | head -1)

if [ -z "$AAB_FILE" ]; then
    echo "❌ Nenhum AAB encontrado!"
    echo ""
    echo "Alternativa: Você pode fazer o build remoto com EAS e depois re-assinar localmente."
    exit 1
fi

echo "✅ AAB encontrado: $AAB_FILE"
echo ""
echo "🔐 Passo 3: Assinando AAB com keystore local..."

# Fazer backup do AAB original
cp "$AAB_FILE" "$OUTPUT_DIR/app-release-original.aab"

# Assinar com jarsigner
jarsigner -verbose \
  -sigalg SHA256withRSA \
  -digestalg SHA-256 \
  -keystore "$KEYSTORE_PATH" \
  -storepass "$KEYSTORE_PASSWORD" \
  -keypass "$KEY_PASSWORD" \
  "$AAB_FILE" \
  "$KEY_ALIAS"

echo ""
echo "✅ AAB assinado com sucesso!"
echo ""
echo "🔍 Passo 4: Verificando assinatura..."

jarsigner -verify -verbose "$AAB_FILE"

echo ""
echo "📁 Copiando AAB assinado para pasta de saída..."
cp "$AAB_FILE" "$OUTPUT_DIR/app-release-signed.aab"

echo ""
echo "✅ Build concluído com sucesso!"
echo ""
echo "📍 Arquivo final: $OUTPUT_DIR/app-release-signed.aab"
echo ""
echo "🚀 Próximo passo: Fazer upload para o Google Play Console"
echo ""
echo "Você pode usar:"
echo "  - Google Play Console (interface web)"
echo "  - ou: fastlane supply --aab $OUTPUT_DIR/app-release-signed.aab"
