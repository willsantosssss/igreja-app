#!/bin/bash

# Script para re-assinar o AAB com a chave correta usando bundletool

cd /home/ubuntu/igreja-app

# Variáveis
KEYSTORE_PATH="app-signing-key.jks"
KEYSTORE_PASSWORD="senha123456"
KEY_ALIAS="app-key"
KEY_PASSWORD="senha123456"
INPUT_AAB="app-release-final.aab"
OUTPUT_AAB="app-release-signed-correct.aab"

echo "🔄 Re-assinando AAB com a chave correta..."
echo "Keystore: $KEYSTORE_PATH"
echo "Input AAB: $INPUT_AAB"
echo "Output AAB: $OUTPUT_AAB"

# Usar jarsigner para re-assinar o AAB
jarsigner -verbose \
  -sigalg SHA256withRSA \
  -digestalg SHA-256 \
  -keystore "$KEYSTORE_PATH" \
  -storepass "$KEYSTORE_PASSWORD" \
  -keypass "$KEY_PASSWORD" \
  "$INPUT_AAB" \
  "$KEY_ALIAS"

if [ $? -eq 0 ]; then
  echo "✅ AAB re-assinado com sucesso!"
  echo "Arquivo de saída: $OUTPUT_AAB"
  
  # Verificar a assinatura
  echo ""
  echo "🔍 Verificando a assinatura..."
  jarsigner -verify -verbose "$INPUT_AAB"
else
  echo "❌ Erro ao re-assinar o AAB"
  exit 1
fi
