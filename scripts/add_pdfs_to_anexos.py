#!/usr/bin/env python3
"""
Script para adicionar PDFs à tabela anexos do banco de dados.
Uso: python3 scripts/add_pdfs_to_anexos.py
"""

import sys
import mysql.connector
from urllib.parse import urlparse
import os
from datetime import datetime

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

def add_pdf_to_anexos(nomeArquivo, urlArquivo, tipo="application/pdf"):
    """Add a PDF to the anexos table."""
    connection = connect_to_database()
    cursor = connection.cursor()
    
    try:
        query = """
        INSERT INTO anexos (nomeArquivo, urlArquivo, tipo, createdAt, updatedAt)
        VALUES (%s, %s, %s, NOW(), NOW())
        """
        cursor.execute(query, (nomeArquivo, urlArquivo, tipo))
        connection.commit()
        print(f"✅ Arquivo '{nomeArquivo}' adicionado com sucesso!")
        return cursor.lastrowid
    except mysql.connector.Error as err:
        print(f"❌ Erro ao adicionar arquivo: {err}")
        connection.rollback()
        return None
    finally:
        cursor.close()
        connection.close()

def main():
    """Main function."""
    print("🔍 Conectando ao banco de dados...")
    print(f"📍 Host: ballast.proxy.rlwy.net:44986")
    print(f"📁 Database: railway\n")
    
    # PDFs to add
    pdfs = [
        {
            "nomeArquivo": "EscaladeAberturaeDízimos-Domingo.pdf",
            "urlArquivo": "/uploads/EscaladeAberturaeDízimos-Domingo.pdf"
        },
        {
            "nomeArquivo": "Líderemtreinamento!.pdf",
            "urlArquivo": "/uploads/Líderemtreinamento!.pdf"
        }
    ]
    
    print("📝 Adicionando PDFs à tabela anexos...\n")
    
    for pdf in pdfs:
        print(f"📄 Processando: {pdf['nomeArquivo']}")
        pdf_id = add_pdf_to_anexos(pdf['nomeArquivo'], pdf['urlArquivo'])
        if pdf_id:
            print(f"   ID: {pdf_id}\n")
    
    print("✨ Processo concluído!")

if __name__ == "__main__":
    main()
