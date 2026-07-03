#!/usr/bin/env python3
"""
Script para inserir um recado de teste no banco de dados correto do Railway.
"""

import mysql.connector
from urllib.parse import urlparse
from datetime import datetime

# URL do banco de dados do Railway
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

def insert_recado_teste():
    """Insert a test recado into the database."""
    params = parse_database_url(DATABASE_URL)
    
    try:
        connection = mysql.connector.connect(**params)
        cursor = connection.cursor()
        
        # Insert test recado
        query = """
        INSERT INTO recados (titulo, conteudo, criado_em, ativo) 
        VALUES (%s, %s, %s, %s)
        """
        
        values = (
            "Recado de Teste",
            "Este é um recado de teste para verificar se o sistema está funcionando corretamente.",
            datetime.now(),
            1
        )
        
        cursor.execute(query, values)
        connection.commit()
        
        print("✅ Recado de teste inserido com sucesso!")
        print(f"   Título: {values[0]}")
        print(f"   Conteúdo: {values[1]}")
        print(f"   Data: {values[2]}")
        
        cursor.close()
        connection.close()
        
    except mysql.connector.Error as err:
        print(f"❌ Erro ao inserir recado: {err}")

if __name__ == "__main__":
    print("🔍 Conectando ao banco de dados do Railway...")
    print("📍 Host: ballast.proxy.rlwy.net:44986")
    print("📁 Database: railway\n")
    insert_recado_teste()
