const { getDb } = require('./server/db');

(async () => {
  const db = await getDb();
  if (!db) {
    console.log('Database not available');
    process.exit(1);
  }
  
  const result = await db.query.lideres.findMany();
  console.log('Total de líderes:', result.length);
  result.forEach((l) => {
    console.log(`- ${l.nome} (ID: ${l.id}, Ativo: ${l.ativo})`);
  });
  process.exit(0);
})();
