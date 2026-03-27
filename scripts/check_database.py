#!/usr/bin/env python3
"""
Script para verificar dados do banco de dados usando a URL correta do Railway.
Uso: python3 scripts/check_database.py [tabela] [limite]
Exemplos:
  python3 scripts/check_database.py users
  python3 scripts/check_database.py usuariosCadastrados 10
  python3 scripts/check_database.py users 5
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

def get_table_data(table_name, limit=20):
    """Fetch data from a table."""
    connection = connect_to_database()
    cursor = connection.cursor(dictionary=True)
    
    try:
        query = f"SELECT * FROM {table_name} LIMIT {limit}"
        cursor.execute(query)
        results = cursor.fetchall()
        return results
    except mysql.connector.Error as err:
        print(f"❌ Erro ao consultar tabela {table_name}: {err}")
        return None
    finally:
        cursor.close()
        connection.close()

def display_results(table_name, results):
    """Display results in a formatted table."""
    if not results:
        print(f"❌ Nenhum resultado encontrado na tabela {table_name}")
        return
    
    print(f"\n✅ Tabela: {table_name}")
    print(f"📊 Total de registros: {len(results)}\n")
    
    # Get column names
    columns = list(results[0].keys())
    
    # Calculate column widths
    col_widths = {}
    for col in columns:
        col_widths[col] = max(len(col), max(len(str(row[col])) for row in results))
    
    # Print header
    header = " | ".join(f"{col:<{col_widths[col]}}" for col in columns)
    print(header)
    print("-" * len(header))
    
    # Print rows
    for row in results:
        line = " | ".join(f"{str(row[col]):<{col_widths[col]}}" for col in columns)
        print(line)

def main():
    """Main function."""
    if len(sys.argv) < 2:
        print("❌ Uso: python3 scripts/check_database.py [tabela] [limite]")
        print("Exemplos:")
        print("  python3 scripts/check_database.py users")
        print("  python3 scripts/check_database.py usuariosCadastrados 10")
        sys.exit(1)
    
    table_name = sys.argv[1]
    limit = int(sys.argv[2]) if len(sys.argv) > 2 else 20
    
    print(f"🔍 Conectando ao banco de dados...")
    print(f"📍 Host: ballast.proxy.rlwy.net:44986")
    print(f"📁 Database: railway\n")
    
    results = get_table_data(table_name, limit)
    if results is not None:
        display_results(table_name, results)

if __name__ == "__main__":
    main()
