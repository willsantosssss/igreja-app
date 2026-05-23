#!/bin/bash

# Script para re-assinar o AAB com a chave correta que o Google Play espera

set -e

cd /home/ubuntu/igreja-app

echo "🔐 Re-assinando AAB com a chave correta"
echo ""

# Variáveis
KEYSTORE_PATH="app-signing-key.jks"
KEYSTORE_PASSWORD="senha123456"
KEY_ALIAS="app-key"
KEY_PASSWORD="senha123456"
INPUT_AAB="app-release-final.aab"
OUTPUT_AAB="app-release-final-signed-correct.aab"

# Verificar se o arquivo existe
if [ ! -f "$INPUT_AAB" ]; then
    echo "❌ Arquivo não encontrado: $INPUT_AAB"
    exit 1
fi

echo "📁 Arquivo de entrada: $INPUT_AAB"
echo "📁 Arquivo de saída: $OUTPUT_AAB"
echo "🔑 Keystore: $KEYSTORE_PATH"
echo "🔑 Alias: $KEY_ALIAS"
echo ""

# Fazer backup
cp "$INPUT_AAB" "${INPUT_AAB}.backup"
echo "✅ Backup criado: ${INPUT_AAB}.backup"
echo ""

# Remover assinatura antiga
echo "🔄 Removendo assinatura antiga..."
zip -d "$INPUT_AAB" "META-INF/*" 2>/dev/null || true

echo ""
echo "🔐 Assinando com jarsigner..."
jarsigner -verbose \
  -sigalg SHA256withRSA \
  -digestalg SHA-256 \
  -keystore "$KEYSTORE_PATH" \
  -storepass "$KEYSTORE_PASSWORD" \
  -keypass "$KEY_PASSWORD" \
  "$INPUT_AAB" \
  "$KEY_ALIAS"

echo ""
echo "✅ AAB assinado com sucesso!"
echo ""

# Copiar para arquivo de saída
cp "$INPUT_AAB" "$OUTPUT_AAB"

echo "📁 Arquivo final: $OUTPUT_AAB"
echo ""
echo "🔍 Verificando assinatura..."
jarsigner -verify -verbose "$OUTPUT_AAB"

echo ""
echo "✅ Verificação concluída!"
echo ""
echo "📊 Resumo:"
echo "  - Arquivo original: ${INPUT_AAB}.backup"
echo "  - Arquivo assinado: $OUTPUT_AAB"
echo "  - Chave usada: $KEY_ALIAS (SHA1: 03:A4:C6:62:D8:97:EB:63:80:F3:58:85:E4:66:82:57:41:14:85:15)"
echo ""
echo "🚀 Próximo passo: Fazer upload de $OUTPUT_AAB para o Google Play Console"
