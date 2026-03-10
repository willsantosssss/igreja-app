const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

const connectionString = 'postgresql://postgres:dHdFrxPWuLJqtsOxrKrcbQJapATljGar@postgres.railway.internal:5432/railway';

async function testConnection() {
  try {
    const client = postgres(connectionString);
    const result = await client`SELECT 1 as test`;
    console.log('✅ Conexão bem-sucedida!', result);
    
    // List tables
    const tables = await client`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`;
    console.log('📊 Tabelas encontradas:', tables.length);
    tables.forEach(t => console.log('  -', t.table_name));
    
    await client.end();
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
  }
}

testConnection();
