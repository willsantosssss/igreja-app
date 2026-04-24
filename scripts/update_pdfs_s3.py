#!/usr/bin/env python3
"""
Script para atualizar as URLs dos PDFs na tabela anexos para usar o storage S3 do Manus.
Uso: python3 scripts/update_pdfs_s3.py
"""

import sys
import mysql.connector
from urllib.parse import urlparse

# URL do banco de dados (armazenada em .env.local)
DATABASE_URL = "mysql://root:dzADEIqMtSkFfNoDFDTIFKTVXkRIwZIH@ballast.proxy.rlwy.net:44986/railway"

def parse_database_url(url):
    """Parse a MySQL URL and return connection parameters."""
    parsed = urlparse(url)
    return {
        'host': parsed.hostname,
        'port': parsed.port or 3306,
        'user': parsed.username,
        'password': parsed.password,
        'database': parsed.path.lstrip('/')
    }

def connect_to_database():
    """Connect to the database using the correct URL."""
    params = parse_database_url(DATABASE_URL)
    try:
        connection = mysql.connector.connect(**params)
        return connection
    except mysql.connector.Error as err:
        print(f"❌ Erro ao conectar ao banco: {err}")
        sys.exit(1)

def update_pdf_urls():
    """Update the PDF URLs in the anexos table."""
    connection = connect_to_database()
    cursor = connection.cursor()
    
    # Mapeamento de nomes de arquivo para URLs do storage S3
    updates = [
        {
            "nomeArquivo": "EscaladeAberturaeDízimos-Domingo.pdf",
            "urlArquivo": "/manus-storage/escala_86d4fc52.pdf"
        },
        {
            "nomeArquivo": "Líderemtreinamento!.pdf",
            "urlArquivo": "/manus-storage/lider_b8c43932.pdf"
        }
    ]
    
    try:
        for update in updates:
            query = """
            UPDATE anexos 
            SET urlArquivo = %s
            WHERE nomeArquivo = %s
            """
            cursor.execute(query, (update['urlArquivo'], update['nomeArquivo']))
        
        connection.commit()
        print(f"✅ URLs atualizadas com sucesso!")
        print(f"   Registros afetados: {cursor.rowcount}")
    except mysql.connector.Error as err:
        print(f"❌ Erro ao atualizar URLs: {err}")
        connection.rollback()
    finally:
        cursor.close()
        connection.close()

def verify_urls():
    """Verify the updated URLs."""
    connection = connect_to_database()
    cursor = connection.cursor(dictionary=True)
    
    try:
        query = """
        SELECT id, nomeArquivo, urlArquivo FROM anexos 
        WHERE nomeArquivo IN ('EscaladeAberturaeDízimos-Domingo.pdf', 'Líderemtreinamento!.pdf')
        ORDER BY id DESC
        """
        cursor.execute(query)
        results = cursor.fetchall()
        
        print("\n📋 URLs Atualizadas:")
        for row in results:
            print(f"   ID {row['id']}: {row['nomeArquivo']}")
            print(f"   URL: {row['urlArquivo']}\n")
    finally:
        cursor.close()
        connection.close()

def main():
    """Main function."""
    print("🔍 Conectando ao banco de dados...")
    print(f"📍 Host: ballast.proxy.rlwy.net:44986")
    print(f"📁 Database: railway\n")
    
    update_pdf_urls()
    verify_urls()
    
    print("✨ Processo concluído!")

if __name__ == "__main__":
    main()
