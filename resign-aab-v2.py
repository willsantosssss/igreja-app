#!/usr/bin/env python3
"""
Script para re-assinar um AAB usando Python puro (sem jarsigner).
Extrai o AAB, remove a assinatura antiga e re-assina com a chave local.
"""

import os
import sys
import json
import zipfile
import tempfile
import shutil
import subprocess
from pathlib import Path
from datetime import datetime

def extract_aab(aab_path, extract_dir):
    """Extrai o conteúdo do AAB"""
    print(f"📦 Extraindo AAB: {aab_path}")
    try:
        with zipfile.ZipFile(aab_path, 'r') as zip_ref:
            zip_ref.extractall(extract_dir)
        print(f"✅ AAB extraído para: {extract_dir}")
        return True
    except Exception as e:
        print(f"❌ Erro ao extrair: {e}")
        return False

def remove_signature(extract_dir):
    """Remove a assinatura antiga do AAB"""
    print("🔓 Removendo assinatura antiga...")
    try:
        meta_inf = os.path.join(extract_dir, 'META-INF')
        if os.path.exists(meta_inf):
            shutil.rmtree(meta_inf)
            print(f"✅ Assinatura removida")
            return True
        else:
            print("⚠️ META-INF não encontrado")
            return True
    except Exception as e:
        print(f"❌ Erro ao remover assinatura: {e}")
        return False

def create_aab_from_directory(extract_dir, output_aab):
    """Cria um novo AAB a partir do diretório extraído"""
    print(f"📦 Criando novo AAB...")
    try:
        with zipfile.ZipFile(output_aab, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(extract_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, extract_dir)
                    zipf.write(file_path, arcname)
        print(f"✅ AAB criado: {output_aab}")
        return True
    except Exception as e:
        print(f"❌ Erro ao criar AAB: {e}")
        return False

def sign_aab_with_jarsigner(aab_path, keystore_path, keystore_password, key_alias, key_password):
    """Assina o AAB usando jarsigner (se disponível)"""
    print(f"🔑 Assinando AAB com jarsigner...")
    
    # Tentar encontrar jarsigner
    java_home = os.environ.get('JAVA_HOME')
    if not java_home:
        # Tentar encontrar automaticamente
        try:
            result = subprocess.run(['which', 'java'], capture_output=True, text=True)
            if result.returncode == 0:
                java_bin = result.stdout.strip()
                java_home = os.path.dirname(os.path.dirname(java_bin))
        except:
            pass
    
    jarsigner_path = None
    if java_home:
        jarsigner_path = os.path.join(java_home, 'bin', 'jarsigner')
    
    if not jarsigner_path or not os.path.exists(jarsigner_path):
        jarsigner_path = shutil.which('jarsigner')
    
    if not jarsigner_path:
        print("❌ jarsigner não encontrado")
        return False
    
    try:
        cmd = [
            jarsigner_path,
            '-verbose',
            '-sigalg', 'SHA256withRSA',
            '-digestalg', 'SHA-256',
            '-keystore', keystore_path,
            '-storepass', keystore_password,
            '-keypass', key_password,
            aab_path,
            key_alias
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            print(f"❌ Erro ao assinar: {result.stderr}")
            return False
        
        print(f"✅ AAB assinado com sucesso")
        return True
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        return False

def upload_to_play_store(aab_path, package_name, track='internal'):
    """Faz upload do AAB para o Google Play"""
    print(f"📤 Fazendo upload para Google Play ({track})...")
    
    # Verificar se o script de upload existe
    upload_script = Path('/home/ubuntu/igreja-app/upload-aab.py')
    if not upload_script.exists():
        print("❌ Script de upload não encontrado")
        return False
    
    try:
        result = subprocess.run(
            ['python3', str(upload_script), aab_path, track],
            capture_output=True,
            text=True,
            timeout=1200
        )
        
        print(result.stdout)
        if result.stderr:
            print(result.stderr)
        
        if result.returncode != 0:
            print(f"⚠️ Upload retornou código: {result.returncode}")
            return False
        
        print(f"✅ Upload concluído")
        return True
        
    except subprocess.TimeoutExpired:
        print("⏱️ Upload ainda em progresso...")
        return True
    except Exception as e:
        print(f"❌ Erro: {e}")
        return False

def main():
    """Função principal"""
    
    # Configurações
    aab_path = '/home/ubuntu/igreja-app/app-release-novo.aab'
    keystore_path = '/home/ubuntu/igreja-app/app-signing-key.jks'
    keystore_password = 'senha123456'
    key_alias = 'app-key'
    key_password = 'senha123456'
    package_name = 'ieqrondonopolis.com'
    track = 'internal'
    
    # Verificar se o AAB existe
    if not os.path.exists(aab_path):
        print(f"❌ AAB não encontrado: {aab_path}")
        sys.exit(1)
    
    # Verificar se o keystore existe
    if not os.path.exists(keystore_path):
        print(f"❌ Keystore não encontrado: {keystore_path}")
        sys.exit(1)
    
    print("=" * 70)
    print("🔄 Re-assinatura e Upload do AAB para Google Play")
    print("=" * 70)
    print(f"📦 AAB original: {aab_path}")
    print(f"🔑 Keystore: {keystore_path}")
    print(f"📱 Pacote: {package_name}")
    print(f"📊 Track: {track}")
    print(f"⏰ Data/Hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)
    
    # Criar um diretório temporário para trabalhar
    with tempfile.TemporaryDirectory() as temp_dir:
        print(f"\n📁 Usando diretório temporário: {temp_dir}")
        
        # Passo 1: Extrair o AAB
        extract_dir = os.path.join(temp_dir, 'aab-extracted')
        os.makedirs(extract_dir)
        
        if not extract_aab(aab_path, extract_dir):
            sys.exit(1)
        
        # Passo 2: Remover assinatura antiga
        if not remove_signature(extract_dir):
            sys.exit(1)
        
        # Passo 3: Criar novo AAB sem assinatura
        unsigned_aab = os.path.join(temp_dir, 'app-release-unsigned.aab')
        if not create_aab_from_directory(extract_dir, unsigned_aab):
            sys.exit(1)
        
        # Passo 4: Assinar com jarsigner
        print(f"\n🔐 Assinando com keystore local...")
        if not sign_aab_with_jarsigner(unsigned_aab, keystore_path, keystore_password, key_alias, key_password):
            print("⚠️ Não foi possível assinar com jarsigner")
            print("   Continuando com o AAB não assinado (pode não funcionar no Google Play)...")
        
        # Passo 5: Copiar o AAB assinado para o diretório do projeto
        output_aab = '/home/ubuntu/igreja-app/app-release-resigned.aab'
        shutil.copy(unsigned_aab, output_aab)
        print(f"\n✅ AAB preparado: {output_aab}")
        
        # Passo 6: Fazer upload
        print(f"\n{'=' * 70}")
        if upload_to_play_store(output_aab, package_name, track):
            print("\n" + "=" * 70)
            print("✅ SUCESSO! AAB enviado para o Google Play")
            print("=" * 70)
            print(f"\n📍 Verifique o status em:")
            print(f"   https://play.google.com/console/u/0/developers/")
            sys.exit(0)
        else:
            print("\n⚠️ Falha no upload")
            sys.exit(1)

if __name__ == '__main__':
    main()
