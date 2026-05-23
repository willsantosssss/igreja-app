#!/usr/bin/env python3
"""
Script para publicar a app Igreja Connect no Google Play Console
usando Google Service Account e Google Play API
"""

import json
import sys
import os
from pathlib import Path
from google.oauth2 import service_account
from google.auth.transport.requests import Request
import requests

# Configurações
CREDENTIALS_FILE = "fastlane/google-play-credentials.json"
PACKAGE_NAME = "ieqrondonopolis.com"
SCOPES = ["https://www.googleapis.com/auth/androidpublisher"]

def get_access_token():
    """Obter token de acesso do Google Service Account"""
    try:
        credentials = service_account.Credentials.from_service_account_file(
            CREDENTIALS_FILE, scopes=SCOPES
        )
        credentials.refresh(Request())
        return credentials.token
    except Exception as e:
        print(f"❌ Erro ao obter token de acesso: {e}")
        sys.exit(1)

def upload_apk(apk_path, track="internal"):
    """Fazer upload do APK para o Google Play Console"""
    
    if not os.path.exists(apk_path):
        print(f"❌ Arquivo APK não encontrado: {apk_path}")
        sys.exit(1)
    
    access_token = get_access_token()
    
    # URL da API do Google Play
    url = f"https://androidpublisher.googleapis.com/androidpublisher/v3/applications/{PACKAGE_NAME}/edits"
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    print(f"📱 Iniciando upload para {track}...")
    print(f"📦 Pacote: {PACKAGE_NAME}")
    print(f"📄 APK: {apk_path}")
    
    try:
        # Criar uma nova edição
        print("🔄 Criando edição...")
        response = requests.post(url, headers=headers, json={})
        
        if response.status_code != 200:
            print(f"❌ Erro ao criar edição: {response.status_code}")
            print(response.text)
            sys.exit(1)
        
        edit_id = response.json()["id"]
        print(f"✅ Edição criada: {edit_id}")
        
        # Fazer upload do APK
        print(f"📤 Fazendo upload do APK...")
        upload_url = f"{url}/{edit_id}/apks"
        
        with open(apk_path, "rb") as apk_file:
            files = {"apk": apk_file}
            upload_response = requests.post(
                upload_url,
                headers={"Authorization": f"Bearer {access_token}"},
                files=files
            )
        
        if upload_response.status_code != 200:
            print(f"❌ Erro ao fazer upload: {upload_response.status_code}")
            print(upload_response.text)
            sys.exit(1)
        
        print(f"✅ APK enviado com sucesso!")
        
        # Atualizar track
        print(f"🎯 Atualizando track para '{track}'...")
        track_url = f"{url}/{edit_id}/tracks/{track}"
        
        track_response = requests.patch(
            track_url,
            headers=headers,
            json={"releases": [{"status": "completed", "versionCodes": []}]}
        )
        
        if track_response.status_code != 200:
            print(f"⚠️  Aviso ao atualizar track: {track_response.status_code}")
        else:
            print(f"✅ Track atualizado para '{track}'!")
        
        # Confirmar edição
        print("✅ Confirmando edição...")
        commit_url = f"{url}/{edit_id}:commit"
        commit_response = requests.post(
            commit_url,
            headers=headers,
            json={}
        )
        
        if commit_response.status_code == 200:
            print(f"🎉 Upload concluído com sucesso!")
            print(f"✅ A app foi enviada para o track '{track}'")
            print(f"⏱️  Tempo estimado de revisão: 24-48 horas (para produção)")
        else:
            print(f"⚠️  Erro ao confirmar edição: {commit_response.status_code}")
            print(commit_response.text)
    
    except Exception as e:
        print(f"❌ Erro durante o upload: {e}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python3 publish.py <caminho_apk> [track]")
        print("Exemplo: python3 publish.py android/app/build/outputs/apk/release/app-release.apk internal")
        sys.exit(1)
    
    apk_path = sys.argv[1]
    track = sys.argv[2] if len(sys.argv) > 2 else "internal"
    
    upload_apk(apk_path, track)
