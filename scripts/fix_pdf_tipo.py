#!/usr/bin/env python3
"""
Script para corrigir o tipo dos PDFs na tabela anexos.
Muda de 'application/pdf' para 'pdf' para ser consistente com o AGENDA 2026.pdf
Uso: python3 scripts/fix_pdf_tipo.py
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

def fix_pdf_tipo():
    """Fix the PDF tipo in the anexos table."""
    connection = connect_to_database()
    cursor = connection.cursor()
    
    try:
        # Atualizar tipo de 'application/pdf' para 'pdf'
        query = """
        UPDATE anexos 
        SET tipo = 'pdf'
        WHERE nomeArquivo IN ('EscaladeAberturaeDízimos-Domingo.pdf', 'Líderemtreinamento!.pdf')
        """
        cursor.execute(query)
        connection.commit()
        print(f"✅ Tipo dos PDFs atualizado com sucesso!")
        print(f"   Registros afetados: {cursor.rowcount}")
    except mysql.connector.Error as err:
        print(f"❌ Erro ao atualizar tipo: {err}")
        connection.rollback()
    finally:
        cursor.close()
        connection.close()

def verify_tipos():
    """Verify the updated tipos."""
    connection = connect_to_database()
    cursor = connection.cursor(dictionary=True)
    
    try:
        query = """
        SELECT id, nomeArquivo, tipo FROM anexos 
        ORDER BY id DESC LIMIT 3
        """
        cursor.execute(query)
        results = cursor.fetchall()
        
        print("\n📋 Tipos de Arquivo na Tabela anexos:")
        for row in results:
            print(f"   ID {row['id']}: {row['nomeArquivo']}")
            print(f"   Tipo: {row['tipo']}\n")
    finally:
        cursor.close()
        connection.close()

def main():
    """Main function."""
    print("🔍 Conectando ao banco de dados...")
    print(f"📍 Host: ballast.proxy.rlwy.net:44986")
    print(f"📁 Database: railway\n")
    
    fix_pdf_tipo()
    verify_tipos()
    
    print("✨ Processo concluído!")

if __name__ == "__main__":
    main()
