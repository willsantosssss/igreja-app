#!/usr/bin/env python3
"""
Script para adicionar coluna de opção de pagamento à tabela pagamentos_eventos.
Uso: python3 scripts/add_payment_option_column.py
"""

import mysql.connector
from urllib.parse import urlparse

# URL do banco de dados
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
        return None

def add_payment_option_column():
    """Add payment option column to pagamentos_eventos table."""
    connection = connect_to_database()
    if not connection:
        return False
    
    cursor = connection.cursor()
    
    try:
        # Check if column already exists
        cursor.execute("""
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'pagamentos_eventos' 
            AND COLUMN_NAME = 'opcaoPagamento'
        """)
        existing_column = cursor.fetchone()
        
        if not existing_column:
            print("➕ Adicionando coluna opcaoPagamento...")
            cursor.execute("""
                ALTER TABLE pagamentos_eventos 
                ADD COLUMN opcaoPagamento varchar(50) DEFAULT NULL
            """)
            print("✅ Coluna opcaoPagamento adicionada com sucesso!")
        else:
            print("⚠️  Coluna opcaoPagamento já existe")
        
        connection.commit()
        print("\n✅ Migração concluída com sucesso!")
        return True
        
    except mysql.connector.Error as err:
        print(f"❌ Erro ao executar migração: {err}")
        connection.rollback()
        return False
    finally:
        cursor.close()
        connection.close()

if __name__ == "__main__":
    print("🔍 Conectando ao banco de dados...")
    print("📍 Host: ballast.proxy.rlwy.net:44986")
    print("📁 Database: railway\n")
    
    add_payment_option_column()
