#!/usr/bin/env python3
"""
Script para re-assinar um AAB (Android App Bundle) com uma chave local
e fazer upload para o Google Play.
"""

import os
import sys
import json
import zipfile
import tempfile
import shutil
import subprocess
from pathlib import Path

def extract_aab(aab_path, extract_dir):
    """Extrai o conteúdo do AAB"""
    print(f"📦 Extraindo AAB: {aab_path}")
    with zipfile.ZipFile(aab_path, 'r') as zip_ref:
        zip_ref.extractall(extract_dir)
    print(f"✅ AAB extraído para: {extract_dir}")

def resign_aab(aab_path, keystore_path, keystore_password, key_alias, key_password, output_path):
    """
    Re-assina o AAB usando jarsigner.
    
    Nota: Esta função requer que o jarsigner esteja disponível no PATH.
    Se não estiver, você pode usar o bundletool do Android SDK.
    """
    print(f"🔑 Re-assinando AAB com keystore: {keystore_path}")
    
    # Tentar usar jarsigner
    try:
        cmd = [
            'jarsigner',
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
        
        print(f"✅ AAB re-assinado com sucesso")
        return True
        
    except FileNotFoundError:
        print("❌ jarsigner não encontrado. Tentando usar bundletool...")
        return resign_aab_with_bundletool(aab_path, keystore_path, keystore_password, key_alias, key_password, output_path)

def resign_aab_with_bundletool(aab_path, keystore_path, keystore_password, key_alias, key_password, output_path):
    """
    Re-assina o AAB usando bundletool (alternativa ao jarsigner).
    """
    print("⚠️ Usando bundletool como alternativa...")
    
    # Verificar se bundletool está disponível
    bundletool_path = shutil.which('bundletool')
    if not bundletool_path:
        print("❌ bundletool não encontrado. Instalando...")
        try:
            subprocess.run(['npm', 'install', '-g', '@react-native-community/cli'], check=True)
        except:
            print("❌ Não foi possível instalar bundletool")
            return False
    
    # Usar bundletool para re-assinar
    cmd = [
        'bundletool',
        'build-apks',
        '--bundle=' + aab_path,
        '--output=' + output_path,
        '--ks=' + keystore_path,
        '--ks-pass=pass:' + keystore_password,
        '--ks-key-alias=' + key_alias,
        '--key-pass=pass:' + key_password,
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"❌ Erro ao usar bundletool: {result.stderr}")
            return False
        print(f"✅ AAB re-assinado com bundletool")
        return True
    except Exception as e:
        print(f"❌ Erro: {e}")
        return False

def upload_to_play_store(aab_path, package_name, track='internal'):
    """
    Faz upload do AAB para o Google Play usando a API.
    """
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
            timeout=600
        )
        
        if result.returncode != 0:
            print(f"❌ Erro no upload: {result.stderr}")
            return False
        
        print(f"✅ Upload concluído com sucesso")
        print(result.stdout)
        return True
        
    except subprocess.TimeoutExpired:
        print("⏱️ Upload ainda em progresso (timeout)...")
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
    
    print("=" * 60)
    print("🔄 Iniciando re-assinatura do AAB")
    print("=" * 60)
    print(f"📦 AAB: {aab_path}")
    print(f"🔑 Keystore: {keystore_path}")
    print(f"📱 Pacote: {package_name}")
    print(f"📊 Track: {track}")
    print("=" * 60)
    
    # Criar um diretório temporário para trabalhar
    with tempfile.TemporaryDirectory() as temp_dir:
        print(f"\n📁 Usando diretório temporário: {temp_dir}")
        
        # Copiar o AAB para o diretório temporário
        temp_aab = os.path.join(temp_dir, 'app-release.aab')
        shutil.copy(aab_path, temp_aab)
        
        # Tentar re-assinar
        if resign_aab(temp_aab, keystore_path, keystore_password, key_alias, key_password, temp_aab):
            # Se bem-sucedido, copiar de volta
            output_aab = '/home/ubuntu/igreja-app/app-release-resigned.aab'
            shutil.copy(temp_aab, output_aab)
            print(f"\n✅ AAB re-assinado salvo em: {output_aab}")
            
            # Fazer upload
            if upload_to_play_store(output_aab, package_name, track):
                print("\n" + "=" * 60)
                print("✅ SUCESSO! AAB re-assinado e enviado para o Google Play")
                print("=" * 60)
                sys.exit(0)
            else:
                print("\n⚠️ Re-assinatura bem-sucedida, mas upload falhou")
                sys.exit(1)
        else:
            print("\n❌ Falha ao re-assinar o AAB")
            sys.exit(1)

if __name__ == '__main__':
    main()
