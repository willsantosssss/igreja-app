import { sql } from "drizzle-orm";
import { getDb } from "../db";

export async function createAnexosLideresTable() {
  try {
    console.log("[Migration] Creating anexosLideres table...");
    
    const db = await getDb();
    if (!db) {
      console.warn("[Migration] Database not available, skipping migration");
      return;
    }
    
    // Create table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "anexosLideres" (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        descricao TEXT,
        "arquivoUrl" VARCHAR(500) NOT NULL,
        "nomeArquivo" VARCHAR(255) NOT NULL,
        "tamanhoArquivo" INTEGER,
        tipo VARCHAR(50),
        ativo INTEGER DEFAULT 1,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log("[Migration] Table anexosLideres created successfully");
  } catch (error) {
    console.warn("[Migration] Failed to create anexosLideres table:", error);
  }
}
