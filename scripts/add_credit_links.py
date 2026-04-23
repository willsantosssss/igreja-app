#!/usr/bin/env python3
"""
Script para adicionar colunas de links de crédito à tabela configPagamentosEventos.
Uso: python3 scripts/add_credit_links.py
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

def add_credit_link_columns():
    """Add credit link columns to configPagamentosEventos table."""
    connection = connect_to_database()
    if not connection:
        return False
    
    cursor = connection.cursor()
    
    try:
        # Check if columns already exist
        cursor.execute("""
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'configPagamentosEventos' 
            AND COLUMN_NAME IN ('linkCredito1x', 'linkCredito2x', 'linkCredito3x')
        """)
        existing_columns = [row[0] for row in cursor.fetchall()]
        
        # Add missing columns
        columns_to_add = [
            ('linkCredito1x', 'Crédito 1x'),
            ('linkCredito2x', 'Crédito 2x'),
            ('linkCredito3x', 'Crédito 3x'),
        ]
        
        for col_name, col_label in columns_to_add:
            if col_name not in existing_columns:
                print(f"➕ Adicionando coluna {col_name}...")
                cursor.execute(f"""
                    ALTER TABLE configPagamentosEventos 
                    ADD COLUMN {col_name} varchar(500) DEFAULT NULL
                """)
                print(f"✅ Coluna {col_name} adicionada com sucesso!")
            else:
                print(f"⚠️  Coluna {col_name} já existe")
        
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
    
    add_credit_link_columns()
