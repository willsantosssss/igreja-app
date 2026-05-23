#!/usr/bin/env python3
"""
Script para fazer upload do AAB (Android App Bundle) no Google Play Console
usando Google Service Account e Google Play API
"""

import json
import sys
import os
from pathlib import Path
from google.oauth2 import service_account
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

# Configurações
CREDENTIALS_FILE = "fastlane/google-play-credentials.json"
PACKAGE_NAME = "ieqrondonopolis.com"
SCOPES = ["https://www.googleapis.com/auth/androidpublisher"]

def get_service():
    """Obter serviço do Google Play API"""
    try:
        credentials = service_account.Credentials.from_service_account_file(
            CREDENTIALS_FILE, scopes=SCOPES
        )
        service = build("androidpublisher", "v3", credentials=credentials)
        return service
    except Exception as e:
        print(f"❌ Erro ao criar serviço: {e}")
        sys.exit(1)

def upload_aab(aab_path, track="internal"):
    """Fazer upload do AAB para o Google Play Console"""
    
    if not os.path.exists(aab_path):
        print(f"❌ Arquivo AAB não encontrado: {aab_path}")
        sys.exit(1)
    
    service = get_service()
    
    print(f"📱 Iniciando upload para {track}...")
    print(f"📦 Pacote: {PACKAGE_NAME}")
    print(f"📄 AAB: {aab_path}")
    print(f"📊 Tamanho: {os.path.getsize(aab_path) / (1024*1024):.1f} MB")
    
    try:
        # Criar uma nova edição
        print("🔄 Criando edição...")
        edit_request = service.edits().insert(body={}, packageName=PACKAGE_NAME)
        edit_result = edit_request.execute()
        edit_id = edit_result["id"]
        print(f"✅ Edição criada: {edit_id}")
        
        # Fazer upload do AAB
        print(f"📤 Fazendo upload do AAB...")
        media = MediaFileUpload(aab_path, mimetype="application/octet-stream", resumable=True)
        upload_request = service.edits().bundles().upload(
            editId=edit_id,
            packageName=PACKAGE_NAME,
            media_body=media
        )
        upload_result = upload_request.execute()
        bundle_version_code = upload_result["versionCode"]
        print(f"✅ AAB enviado com sucesso! Version Code: {bundle_version_code}")
        
        # Atualizar track
        print(f"🎯 Atualizando track para '{track}'...")
        track_request = service.edits().tracks().update(
            editId=edit_id,
            track=track,
            packageName=PACKAGE_NAME,
            body={
                "releases": [
                    {
                        "name": f"Release v1.0.0 - {track}",
                        "versionCodes": [str(bundle_version_code)],
                        "status": "completed",
                        "releaseNotes": [
                            {
                                "language": "pt-BR",
                                "text": "Versão inicial da app Igreja Connect"
                            }
                        ]
                    }
                ]
            }
        )
        track_result = track_request.execute()
        print(f"✅ Track atualizado para '{track}'!")
        
        # Confirmar edição
        print("✅ Confirmando edição...")
        commit_request = service.edits().commit(
            editId=edit_id,
            packageName=PACKAGE_NAME
        )
        commit_result = commit_request.execute()
        
        print(f"🎉 Upload concluído com sucesso!")
        print(f"✅ A app foi enviada para o track '{track}'")
        print(f"📊 Version Code: {bundle_version_code}")
        print(f"⏱️  Tempo estimado de revisão: 24-48 horas (para produção)")
        print(f"🔗 Acesse: https://play.google.com/console/u/0/developers/5675048090175286156/app/4973723791643011267/releases/overview")
    
    except Exception as e:
        print(f"❌ Erro durante o upload: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python3 upload-aab.py <caminho_aab> [track]")
        print("Exemplo: python3 upload-aab.py app-release.aab internal")
        sys.exit(1)
    
    aab_path = sys.argv[1]
    track = sys.argv[2] if len(sys.argv) > 2 else "internal"
    
    upload_aab(aab_path, track)
