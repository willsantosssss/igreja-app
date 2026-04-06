#!/usr/bin/env python3
"""
Script para criar a tabela configEscolaCrescimento no banco de dados.
"""

import mysql.connector
from urllib.parse import urlparse

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

def create_config_table():
    """Create the configEscolaCrescimento table."""
    params = parse_database_url(DATABASE_URL)
    connection = mysql.connector.connect(**params)
    cursor = connection.cursor()
    
    try:
        # Create table
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS configEscolaCrescimento (
            id INT AUTO_INCREMENT PRIMARY KEY,
            dataInicio VARCHAR(10),
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
        )
        """
        
        cursor.execute(create_table_sql)
        connection.commit()
        print("✅ Tabela configEscolaCrescimento criada com sucesso!")
        
        # Insert default config
        insert_sql = "INSERT INTO configEscolaCrescimento (dataInicio) VALUES (NULL)"
        cursor.execute(insert_sql)
        connection.commit()
        print("✅ Configuração padrão inserida!")
        
    except mysql.connector.Error as err:
        print(f"❌ Erro: {err}")
    finally:
        cursor.close()
        connection.close()

if __name__ == "__main__":
    print("🔍 Criando tabela configEscolaCrescimento...")
    create_config_table()
