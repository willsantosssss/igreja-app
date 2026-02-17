#!/usr/bin/env python3
"""
Script para criar checkpoint automático do app 2iEQ
Uso: python scripts/create_checkpoint.py "Descrição das alterações"
"""

import subprocess
import sys
import os
from datetime import datetime

def main():
    # Obter descrição do checkpoint
    if len(sys.argv) < 2:
        print("❌ Erro: Descrição do checkpoint não fornecida")
        print("\nUso: python scripts/create_checkpoint.py \"Descrição das alterações\"")
        print("\nExemplos:")
        print("  python scripts/create_checkpoint.py \"Alterado nome da igreja e cores\"")
        print("  python scripts/create_checkpoint.py \"Adicionados 3 novos eventos\"")
        sys.exit(1)
    
    descricao = sys.argv[1]
    
    # Validar diretório
    if not os.path.exists("app.config.ts"):
        print("❌ Erro: Script deve ser executado do diretório raiz do projeto")
        print("Navegue para: /home/ubuntu/igreja-app")
        sys.exit(1)
    
    print("\n" + "="*60)
    print("📸 CRIANDO CHECKPOINT DO APP 2IEQ")
    print("="*60)
    
    # Exibir informações
    timestamp = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    print(f"\n⏰ Data/Hora: {timestamp}")
    print(f"📝 Descrição: {descricao}")
    
    # Executar git status
    print("\n📊 Status do repositório:")
    try:
        result = subprocess.run(
            ["git", "status", "--short"],
            capture_output=True,
            text=True,
            cwd=os.getcwd()
        )
        
        if result.stdout:
            print(result.stdout)
        else:
            print("✅ Nenhuma alteração detectada (repositório limpo)")
    except Exception as e:
        print(f"⚠️  Aviso: Não foi possível verificar status do git: {e}")
    
    # Criar checkpoint via webdev_save_checkpoint
    print("\n🔄 Executando webdev_save_checkpoint...")
    print("-" * 60)
    
    try:
        # Nota: Este script não pode chamar webdev_save_checkpoint diretamente
        # O usuário deve executar o comando via Manus
        print("\n✅ Para criar o checkpoint, execute no Manus:")
        print(f"\n   webdev_save_checkpoint com descrição: \"{descricao}\"")
        print("\n" + "="*60)
        print("📌 INSTRUÇÕES:")
        print("="*60)
        print("""
1. Abra uma conversa com Manus
2. Envie a seguinte mensagem:
   
   Crie um checkpoint com a descrição: "{}"
   
3. Manus criará o checkpoint automaticamente
4. Você receberá um link para acessar a versão salva

Alternativamente, você pode usar o painel de gerenciamento:
- Clique em "Publish" no painel de controle
- Selecione "Create Checkpoint"
- Adicione a descrição e confirme
        """.format(descricao))
        
    except Exception as e:
        print(f"❌ Erro ao criar checkpoint: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
