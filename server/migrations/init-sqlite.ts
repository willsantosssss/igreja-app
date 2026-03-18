import Database from "better-sqlite3";
import path from "path";

export async function initSqliteDatabase() {
  try {
    const dbPath = path.join(process.cwd(), "app.db");
    const db = new Database(dbPath);
    
    // Enable WAL mode for better concurrency
    db.pragma("journal_mode = WAL");
    
    // Create users table
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        openId TEXT UNIQUE,
        name TEXT,
        email TEXT UNIQUE,
        passwordHash TEXT,
        loginMethod TEXT,
        role TEXT DEFAULT 'user' NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
        lastSignedIn DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);

    // Create documentoslideres table
    db.exec(`
      CREATE TABLE IF NOT EXISTS documentoslideres (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        descricao TEXT,
        arquivo_url TEXT,
        nome_arquivo TEXT,
        tamanho_arquivo INTEGER,
        tipo TEXT,
        ativo INTEGER DEFAULT 1,
        arquivo_base64 LONGTEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create celulas table
    db.exec(`
      CREATE TABLE IF NOT EXISTS celulas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        lider TEXT NOT NULL,
        telefone TEXT NOT NULL,
        endereco TEXT NOT NULL,
        latitude TEXT NOT NULL,
        longitude TEXT NOT NULL,
        diaReuniao TEXT NOT NULL,
        horarioReuniao TEXT NOT NULL,
        ativo INTEGER DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create lideres table
    db.exec(`
      CREATE TABLE IF NOT EXISTS lideres (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        celula TEXT NOT NULL,
        telefone TEXT NOT NULL,
        email TEXT,
        ativo INTEGER DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("[Database] SQLite tables initialized successfully");
    db.close();
  } catch (error) {
    console.error("[Database] Failed to initialize SQLite tables:", error);
    throw error;
  }
}
