import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './drizzle/schema.ts';

const client = postgres(process.env.DATABASE_URL, {
  ssl: 'require'
});

const db = drizzle(client, { schema });

(async () => {
  try {
    const result = await db.query.eventos.findMany();
    console.log('✅ Drizzle result:', result.length, 'eventos');
    process.exit(0);
  } catch (error) {
    console.error('❌ Drizzle error:', error.message);
    process.exit(1);
  }
})();
