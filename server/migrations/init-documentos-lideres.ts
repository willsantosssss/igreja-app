import { sql } from "drizzle-orm";
import { getDb } from "@/server/db";

export async function initDocumentosLideresTable() {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Migration] Database not available, skipping table creation");
      return false;
    }
    
    // Criar tabela se não existir
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "documentoslideres" (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        descricao TEXT,
        "arquivourl" VARCHAR(2048) NOT NULL,
        "nomearquivo" VARCHAR(255) NOT NULL,
        "tamanhoarquivo" INTEGER DEFAULT 0 NOT NULL,
        tipo VARCHAR(50) NOT NULL,
        ativo INTEGER DEFAULT 1 NOT NULL,
        "arquivobase64" TEXT,
        "createdat" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedat" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
    
    console.log("[Migration] documentoslideres table initialized successfully");
    return true;
  } catch (error: any) {
    console.error("[Migration] Failed to initialize documentoslideres table:", error.message);
    return false;
  }
}
