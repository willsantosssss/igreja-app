import { describe, it, expect, beforeAll } from 'vitest';
import { createRelatorio, getDb } from '../server/db';

describe('Criar Relatório - Debug', () => {
  beforeAll(async () => {
    const db = await getDb();
    if (!db) {
      console.log('[Test] Database not available, skipping tests');
      process.exit(0);
    }
  });

  it('should create relatorio successfully', async () => {
    try {
      const relatorioData = {
        liderId: 1,
        celula: 'Alive',
        tipo: 'semanal',
        periodo: '19/02/2026',
        presentes: 25,
        novosVisitantes: 2,
        conversoes: 0,
        observacoes: 'Teste de relatório',
      };

      console.log('[Test] Attempting to create relatório with data:', relatorioData);
      const result = await createRelatorio(relatorioData);
      console.log('[Test] ✅ Relatório created successfully, ID:', result);
      expect(result).toBeGreaterThan(0);
    } catch (error: any) {
      console.log('[Test] ❌ Error creating relatório:', error.message);
      throw error;
    }
  });
});
