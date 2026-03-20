import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

/**
 * Script para migrar dados de um banco para outro
 * Uso: npx tsx scripts/migrate-to-railway.ts
 */

const SOURCE_DB = process.env.DATABASE_URL || "";
const TARGET_DB = "mysql://root:IYXvcURyRTwwYweeFUunhhj@ballast.proxy.rlwy.net:54202/railway";

if (!SOURCE_DB) {
  console.error("❌ SOURCE DATABASE_URL not set");
  process.exit(1);
}

async function migrate() {
  console.log("🔄 Iniciando migração de dados...\n");

  let sourceConn: mysql.Connection | null = null;
  let targetConn: mysql.Connection | null = null;

  try {
    // Conectar ao banco de origem
    console.log("📡 Conectando ao banco de origem...");
    sourceConn = await mysql.createConnection(SOURCE_DB);
    console.log("✅ Conectado ao banco de origem\n");

    // Conectar ao banco de destino
    console.log("📡 Conectando ao banco de destino (Railway)...");
    targetConn = await mysql.createConnection(TARGET_DB);
    console.log("✅ Conectado ao banco de destino\n");

    // Desabilitar constraints
    await targetConn.query("SET FOREIGN_KEY_CHECKS=0");

    // Listar todas as tabelas
    const [tables] = await sourceConn.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE()"
    ) as any;

    console.log(`📋 Encontradas ${tables.length} tabelas\n`);

    for (const table of tables) {
      const tableName = table.TABLE_NAME;
      console.log(`📦 Migrando tabela: ${tableName}`);

      // Obter dados da tabela de origem
      const [rows] = await sourceConn.query(`SELECT * FROM \`${tableName}\``);

      if (Array.isArray(rows) && rows.length > 0) {
        // Limpar tabela de destino
        await targetConn.query(`TRUNCATE TABLE \`${tableName}\``);

        // Inserir dados
        const columns = Object.keys(rows[0]);
        const placeholders = columns.map(() => "?").join(",");
        const columnNames = columns.map((c) => `\`${c}\``).join(",");

        const insertQuery = `INSERT INTO \`${tableName}\` (${columnNames}) VALUES (${placeholders})`;

        for (const row of rows) {
          const values = columns.map((col) => (row as any)[col]);
          await targetConn.query(insertQuery, values);
        }

        console.log(`   ✅ ${rows.length} registros inseridos`);
      } else {
        console.log(`   ⏭️  Tabela vazia`);
      }
    }

    // Reabilitar constraints
    await targetConn.query("SET FOREIGN_KEY_CHECKS=1");

    console.log("\n✅ Migração concluída com sucesso!");
  } catch (error) {
    console.error("❌ Erro durante migração:", error);
    process.exit(1);
  } finally {
    if (sourceConn) await sourceConn.end();
    if (targetConn) await targetConn.end();
  }
}

migrate();
