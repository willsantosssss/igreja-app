#!/usr/bin/env python3
import mysql.connector
import os

# Conectar ao banco
conn = mysql.connector.connect(
    host=os.getenv('DB_HOST', 'localhost'),
    user=os.getenv('DB_USER', 'root'),
    password=os.getenv('DB_PASSWORD', ''),
    database=os.getenv('DB_NAME', 'igreja_app')
)

cursor = conn.cursor(dictionary=True)

# Verificar tabela anexos
print("=== TABELA ANEXOS ===")
cursor.execute("SELECT * FROM anexos ORDER BY id DESC LIMIT 5")
anexos = cursor.fetchall()
for anexo in anexos:
    print(f"ID: {anexo['id']}")
    print(f"Nome: {anexo['nomeArquivo']}")
    print(f"URL: {anexo['urlArquivo']}")
    print(f"Criado: {anexo['criadoEm']}")
    print("---")

if not anexos:
    print("Nenhum anexo encontrado!")

# Verificar se arquivo existe no disco
print("\n=== VERIFICAR ARQUIVOS NO DISCO ===")
uploads_dir = "/home/ubuntu/igreja-app/uploads"
if os.path.exists(uploads_dir):
    files = os.listdir(uploads_dir)
    print(f"Arquivos em {uploads_dir}:")
    for f in files[:10]:
        file_path = os.path.join(uploads_dir, f)
        size = os.path.getsize(file_path)
        print(f"  - {f} ({size} bytes)")
else:
    print(f"Pasta {uploads_dir} não existe!")

cursor.close()
conn.close()
