#!/usr/bin/env python3
"""
Script para corrigir as URLs dos PDFs na tabela anexos para usar /api/files/
em vez de /manus-storage/
Uso: python3 scripts/fix_pdf_urls_to_api.py
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

def fix_pdf_urls():
    """Fix the PDF URLs in the anexos table."""
    connection = connect_to_database()
    cursor = connection.cursor()
    
    # Mapeamento de nomes de arquivo para URLs corretas usando /api/files/
    updates = [
        {
            "nomeArquivo": "EscaladeAberturaeDízimos-Domingo.pdf",
            "urlArquivo": "/api/files/EscaladeAberturaeDízimos-Domingo.pdf"
        },
        {
            "nomeArquivo": "Líderemtreinamento!.pdf",
            "urlArquivo": "/api/files/Líderemtreinamento!.pdf"
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
        WHERE nomeArquivo IN ('EscaladeAberturaeDízimos-Domingo.pdf', 'Líderemtreinamento!.pdf', 'AGENDA 2026.pdf')
        ORDER BY id DESC
        """
        cursor.execute(query)
        results = cursor.fetchall()
        
        print("\n📋 URLs na Tabela anexos:")
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
    
    fix_pdf_urls()
    verify_urls()
    
    print("✨ Processo concluído!")

if __name__ == "__main__":
    main()
