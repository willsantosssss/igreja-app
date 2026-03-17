import { sql } from "drizzle-orm";
import { getDb } from "@/server/db";

export async function initDocumentosLideresTable() {
  try {
    const db = getDb();
    
    // Criar tabela se não existir
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "documentosLideres" (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        descricao TEXT,
        "arquivoUrl" VARCHAR(2048) NOT NULL,
        "nomeArquivo" VARCHAR(255) NOT NULL,
        "tamanhoArquivo" INTEGER DEFAULT 0 NOT NULL,
        tipo VARCHAR(50) NOT NULL,
        ativo INTEGER DEFAULT 1 NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
    
    console.log("[Migration] documentosLideres table initialized successfully");
    return true;
  } catch (error: any) {
    console.error("[Migration] Failed to initialize documentosLideres table:", error.message);
    return false;
  }
}
