import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

/**
 * Script para importar dados de CSVs para o Railway MySQL
 * Uso: npx tsx scripts/import-from-csv.ts
 */

const RAILWAY_DB_URL =
  process.env.DATABASE_URL ||
  "mysql://root:IYXvcURyRTwwYweeFUunhhj@ballast.proxy.rlwy.net:54202/railway";

async function importFromCSV() {
  console.log("🔄 Iniciando importação de dados...\n");

  let conn: mysql.Connection | null = null;

  try {
    // Conectar ao Railway
    console.log("📡 Conectando ao Railway MySQL...");
    conn = await mysql.createConnection(RAILWAY_DB_URL);
    console.log("✅ Conectado ao Railway MySQL\n");

    // Desabilitar constraints
    await conn.query("SET FOREIGN_KEY_CHECKS=0");

    const exportsDir = path.join(process.cwd(), "exports");
    const files = fs
      .readdirSync(exportsDir)
      .filter((f) => f.endsWith(".csv") && !f.includes("__drizzle"))
      .sort();

    console.log(`📋 Encontrados ${files.length} arquivos CSV\n`);

    for (const file of files) {
      const tableName = file.replace(/_\d{4}-\d{2}-\d{2}\.csv$/, "");
      const filePath = path.join(exportsDir, file);

      try {
        console.log(`📦 Importando: ${tableName}`);

        // Ler CSV
        const csvContent = fs.readFileSync(filePath, "utf-8");
        const records = parse(csvContent, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        }) as any[];

        if (records.length === 0) {
          console.log(`   ⏭️  Arquivo vazio`);
          continue;
        }

        // Limpar tabela
        await conn.query(`TRUNCATE TABLE \`${tableName}\``);

        // Preparar insert
        const columns = Object.keys(records[0]);
        const columnNames = columns.map((c) => `\`${c}\``).join(",");
        const placeholders = columns.map(() => "?").join(",");
        const insertQuery = `INSERT INTO \`${tableName}\` (${columnNames}) VALUES (${placeholders})`;

        // Inserir dados
        for (const record of records) {
          const values = columns.map((col) => {
            const value = record[col];
            // Converter valores vazios para null
            if (value === "" || value === null) return null;
            // Converter "true"/"false" para boolean
            if (value === "true") return 1;
            if (value === "false") return 0;
            // Converter números
            if (!isNaN(value) && value !== "") return Number(value);
            return value;
          });

          await conn.query(insertQuery, values);
        }

        console.log(`   ✅ ${records.length} registros importados`);
      } catch (error) {
        console.log(`   ⚠️  Erro ao importar ${tableName}: ${(error as any).message}`);
      }
    }

    // Reabilitar constraints
    await conn.query("SET FOREIGN_KEY_CHECKS=1");

    console.log("\n✅ Importação concluída com sucesso!");
    console.log("🎉 Dados migrados para Railway MySQL!");
  } catch (error) {
    console.error("❌ Erro durante importação:", error);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

importFromCSV();
