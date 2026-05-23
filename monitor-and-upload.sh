#!/bin/bash

# Script para monitorar o build EAS e fazer upload automaticamente

PROJECT_DIR="/home/ubuntu/igreja-app"
LOG_FILE="/tmp/eas-build.log"
MAX_WAIT=1800  # 30 minutos

echo "📱 Monitorando build EAS..."
echo "⏱️  Tempo máximo de espera: $MAX_WAIT segundos"

# Aguardar o build terminar
cd "$PROJECT_DIR"
eas build --platform android --profile preview --wait > "$LOG_FILE" 2>&1

# Verificar se o build foi bem-sucedido
if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
    
    # Extrair URL do APK do log
    APK_URL=$(grep -oP 'https://[^\s]+\.apk' "$LOG_FILE" | head -1)
    
    if [ -z "$APK_URL" ]; then
        echo "❌ Não foi possível extrair URL do APK do log"
        echo "📋 Log:"
        tail -50 "$LOG_FILE"
        exit 1
    fi
    
    echo "📦 APK URL: $APK_URL"
    
    # Fazer download do APK
    echo "📥 Fazendo download do APK..."
    APK_FILE="$PROJECT_DIR/app-release.apk"
    curl -L -o "$APK_FILE" "$APK_URL"
    
    if [ ! -f "$APK_FILE" ]; then
        echo "❌ Erro ao fazer download do APK"
        exit 1
    fi
    
    echo "✅ APK baixado: $APK_FILE"
    
    # Fazer upload para o Google Play
    echo "📤 Fazendo upload para o Google Play..."
    python3 "$PROJECT_DIR/publish.py" "$APK_FILE" "internal"
    
    if [ $? -eq 0 ]; then
        echo "🎉 Upload concluído com sucesso!"
        echo "✅ A app foi enviada para testes internos no Google Play Console"
    else
        echo "❌ Erro ao fazer upload"
        exit 1
    fi
else
    echo "❌ Build falhou!"
    echo "📋 Log:"
    tail -100 "$LOG_FILE"
    exit 1
fi
