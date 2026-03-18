import postgres from "postgres";

const DATABASE_URL = "postgresql://postgres:dHdFrxPWuLJqtsOxrKrcbQJapATljGar@mainline.proxy.rlwy.net:51262/railway";

async function createTable() {
  const sql = postgres(DATABASE_URL, {
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Conectando ao banco de dados...");
    
    // Criar tabela
    await sql`
      CREATE TABLE IF NOT EXISTS "documentoslideres" (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        descricao TEXT,
        arquivoUrl VARCHAR(2048) NOT NULL,
        nomeArquivo VARCHAR(255) NOT NULL,
        tamanhoArquivo INTEGER DEFAULT 0 NOT NULL,
        tipo VARCHAR(50) NOT NULL,
        ativo INTEGER DEFAULT 1 NOT NULL,
        createdAt TIMESTAMP DEFAULT NOW() NOT NULL,
        updatedAt TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    console.log("✅ Tabela documentoslideres criada com sucesso!");
    
    // Verificar se a tabela foi criada
    const result = await sql`SELECT * FROM documentoslideres LIMIT 1`;
    console.log("✅ Tabela está funcionando corretamente!");
    
  } catch (error) {
    console.error("❌ Erro ao criar tabela:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

createTable();
