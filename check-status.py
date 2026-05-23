#!/usr/bin/env python3
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build

# Carregar credenciais
credentials = service_account.Credentials.from_service_account_file(
    'fastlane/google-play-credentials.json',
    scopes=['https://www.googleapis.com/auth/androidpublisher']
)

# Criar cliente
service = build('androidpublisher', 'v3', credentials=credentials)

# Listar edições recentes
try:
    result = service.edits().list(packageName='ieqrondonopolis.com').execute()
    print("Edições recentes:")
    for edit in result.get('edits', [])[:5]:
        print(f"  - ID: {edit['id']}, Expiração: {edit.get('expiryTimeSeconds', 'N/A')}")
except Exception as e:
    print(f"Erro: {e}")
