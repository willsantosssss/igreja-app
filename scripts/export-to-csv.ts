import { getDb } from "../server/db";
import * as fs from "fs";
import * as path from "path";

/**
 * Script para exportar todos os dados do banco em CSV
 * Uso: npx tsx scripts/export-to-csv.ts
 */

async function exportToCSV() {
  console.log("🔄 Iniciando exportação de dados...\n");

  try {
    const db = await getDb();
    if (!db) {
      console.error("❌ Banco de dados não disponível");
      process.exit(1);
    }

    // Obter todas as tabelas do banco
    const [tables] = await db.execute(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE()"
    ) as any;

    const exportDir = path.join(process.cwd(), "exports");
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    for (const tableObj of tables) {
      const table = (tableObj as any).TABLE_NAME;
      try {
        console.log(`📦 Exportando tabela: ${table}`);

        // Executar query para obter dados
        const query = `SELECT * FROM ${table}`;
        const result = await db.execute(query as any);
        const rows = (result as any)[0] || [];

        if (Array.isArray(rows) && rows.length > 0) {
          // Obter nomes das colunas
          const columns = Object.keys(rows[0]);

          // Criar CSV
          const csvContent = [
            columns.join(","),
            ...rows.map((row: any) =>
              columns
                .map((col) => {
                  const value = row[col];
                  // Escapar valores com aspas e quebras de linha
                  if (value === null || value === undefined) {
                    return "";
                  }
                  const stringValue = String(value);
                  if (
                    stringValue.includes(",") ||
                    stringValue.includes('"') ||
                    stringValue.includes("\n")
                  ) {
                    return `"${stringValue.replace(/"/g, '""')}"`;
                  }
                  return stringValue;
                })
                .join(",")
            ),
          ].join("\n");

          // Salvar arquivo
          const fileName = `${table}_${new Date().toISOString().split("T")[0]}.csv`;
          const filePath = path.join(exportDir, fileName);
          fs.writeFileSync(filePath, csvContent, "utf-8");

          console.log(`   ✅ ${rows.length} registros exportados para ${fileName}`);
        } else {
          console.log(`   ⏭️  Tabela vazia`);
        }
      } catch (error) {
        console.log(`   ⚠️  Erro ao exportar ${table}: ${(error as any).message}`);
      }
    }

    console.log("\n✅ Exportação concluída!");
    console.log(`📁 Arquivos salvos em: ${exportDir}`);
  } catch (error) {
    console.error("❌ Erro durante exportação:", error);
    process.exit(1);
  }
}

exportToCSV();
