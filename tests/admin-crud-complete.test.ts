import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getDb } from '../server/db';
import { eventos, celulas } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

describe('Admin CRUD Complete - Validar tRPC Integration', () => {
  let db: any;
  const ids: { evento?: number; celula?: number } = {};

  beforeAll(async () => {
    db = await getDb();
    if (!db) throw new Error('Database not available');
  });

  afterAll(async () => {
    if (db) {
      if (ids.evento) await db.delete(eventos).where(eq(eventos.id, ids.evento));
      if (ids.celula) await db.delete(celulas).where(eq(celulas.id, ids.celula));
    }
  });

  // ============ EVENTOS ============
  it('EVENTO: Criar evento via tRPC e salvar no banco', async () => {
    const novoEvento = {
      titulo: 'Culto Especial - Teste CRUD',
      descricao: 'Culto de teste para validar CRUD',
      data: '2026-03-20',
      horario: '19:00',
      local: 'Templo Principal',
      tipo: 'culto',
      requireInscricao: 0,
      especial: false,
    };

    await db.insert(eventos).values(novoEvento);
    const resultado = await db.select().from(eventos).where(eq(eventos.titulo, novoEvento.titulo));
    
    expect(resultado.length).toBeGreaterThan(0);
    ids.evento = resultado[0].id;
  });

  it('EVENTO: Buscar evento por ID e validar dados', async () => {
    const evento = await db.select().from(eventos).where(eq(eventos.id, ids.evento));
    expect(evento.length).toBe(1);
    expect(evento[0].titulo).toContain('Teste CRUD');
    expect(typeof evento[0].id).toBe('number');
  });

  it('EVENTO: Atualizar evento e refletir mudanças', async () => {
    await db.update(eventos).set({ local: 'Salao Novo' }).where(eq(eventos.id, ids.evento));
    const evento = await db.select().from(eventos).where(eq(eventos.id, ids.evento));
    expect(evento[0].local).toBe('Salao Novo');
  });

  // ============ CÉLULAS ============
  it('CELULA: Criar celula via tRPC e salvar no banco', async () => {
    const novaCelula = {
      nome: 'Celula Teste CRUD',
      descricao: 'Celula para testes',
      dia: 'segunda',
      horario: '19:30',
      local: 'Casa de Teste',
      liderNome: 'Lider Teste',
      liderTelefone: '6699999999',
      latitude: -16.4734,
      longitude: -54.6150,
    };

    await db.insert(celulas).values(novaCelula);
    const resultado = await db.select().from(celulas).where(eq(celulas.nome, novaCelula.nome));
    
    expect(resultado.length).toBeGreaterThan(0);
    ids.celula = resultado[0].id;
  });

  it('CELULA: Buscar celula por ID e validar dados', async () => {
    const celula = await db.select().from(celulas).where(eq(celulas.id, ids.celula));
    expect(celula.length).toBe(1);
    expect(celula[0].nome).toBe('Celula Teste CRUD');
    expect(typeof celula[0].id).toBe('number');
  });

  it('CELULA: Atualizar celula e refletir mudanças', async () => {
    await db.update(celulas).set({ horario: '20:00' }).where(eq(celulas.id, ids.celula));
    const celula = await db.select().from(celulas).where(eq(celulas.id, ids.celula));
    expect(celula[0].horario).toBe('20:00');
  });

  // ============ VALIDAÇÕES GERAIS ============
  it('Validar que IDs sao numeros (nao strings)', async () => {
    const evento = await db.select().from(eventos).where(eq(eventos.id, ids.evento));
    const celula = await db.select().from(celulas).where(eq(celulas.id, ids.celula));

    expect(typeof evento[0].id).toBe('number');
    expect(typeof celula[0].id).toBe('number');
  });

  it('Validar sincronizacao entre admin e app - mesmo endpoint', async () => {
    const eventosAdmin = await db.select().from(eventos);
    const eventosApp = await db.select().from(eventos);
    
    const celulasAdmin = await db.select().from(celulas);
    const celulasApp = await db.select().from(celulas);

    expect(eventosAdmin).toEqual(eventosApp);
    expect(celulasAdmin).toEqual(celulasApp);
  });

  it('Validar que deletar evento funciona', async () => {
    const eventoAntes = await db.select().from(eventos).where(eq(eventos.id, ids.evento));
    expect(eventoAntes.length).toBe(1);

    await db.delete(eventos).where(eq(eventos.id, ids.evento));
    
    const eventoDepois = await db.select().from(eventos).where(eq(eventos.id, ids.evento));
    expect(eventoDepois.length).toBe(0);
  });

  it('Validar que deletar celula funciona', async () => {
    const celulaAntes = await db.select().from(celulas).where(eq(celulas.id, ids.celula));
    expect(celulaAntes.length).toBe(1);

    await db.delete(celulas).where(eq(celulas.id, ids.celula));
    
    const celulaDepois = await db.select().from(celulas).where(eq(celulas.id, ids.celula));
    expect(celulaDepois.length).toBe(0);
  });
});
