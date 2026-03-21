import "dotenv/config";
import mysql from "mysql2/promise";

async function checkSchema() {
  const dbUrl = process.env.DATABASE_URL || "";
  const url = new URL(dbUrl.replace(/\?.*$/, ""));
  
  const pool = mysql.createPool({
    host: url.hostname,
    port: parseInt(url.port || "3306"),
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    ssl: { rejectUnauthorized: false },
  });

  try {
    const connection = await pool.getConnection();
    
    // Verificar colunas de inscricoesEventos
    const [columns] = await connection.execute("DESCRIBE inscricoesEventos");
    console.log("Colunas de inscricoesEventos:");
    console.log(columns);
    
    connection.release();
  } catch (error) {
    console.error("Erro:", error);
  } finally {
    await pool.end();
  }
}

checkSchema();
