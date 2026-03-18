import postgres from 'postgres';

const DATABASE_URL = 'postgresql://postgres:dHdFrxPWuLJqtsOxrKrcbQJapATljGar@mainline.proxy.rlwy.net:51262/railway';

console.log('[Test] Creating postgres client...');
const client = postgres(DATABASE_URL, { ssl: { rejectUnauthorized: false } });

console.log('[Test] Client created:', client ? 'yes' : 'no');

try {
  console.log('[Test] Executing query...');
  const result = await client`SELECT * FROM eventos ORDER BY id DESC`;
  console.log('[Test] Query executed successfully');
  console.log('[Test] Result:', result.length, 'eventos');
  result.forEach(e => {
    console.log('  -', e.id, e.titulo);
  });
  process.exit(0);
} catch (error) {
  console.error('[Test] Error:', error.message);
  console.error('[Test] Full error:', error);
  process.exit(1);
}
