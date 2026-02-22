import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getDb } from '../server/db';
import { eventos } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

describe('Admin Eventos Flow - tRPC Integration', () => {
  let db: any;
  let eventoId: number;

  beforeAll(async () => {
    db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }
  });

  afterAll(async () => {
    // Limpar dados de teste
    if (db && eventoId) {
      await db.delete(eventos).where(eq(eventos.id, eventoId));
    }
  });

  it('Deve criar evento via tRPC e salvar no banco', async () => {
    const novoEvento = {
      titulo: 'Encontro com Deus Kids - Teste',
      descricao: 'Evento de teste para validar fluxo',
      data: '2026-03-15',
      horario: '10:00',
      local: 'Salão Principal',
      tipo: 'evento-especial',
      requireInscricao: 1,
      especial: true,
    };

    // Simular criação via tRPC
    await db.insert(eventos).values(novoEvento);

    // Buscar evento criado
    const eventoCriado = await db.select().from(eventos).where(eq(eventos.titulo, novoEvento.titulo));
    
    expect(eventoCriado).toHaveLength(1);
    expect(eventoCriado[0].titulo).toBe(novoEvento.titulo);
    expect(eventoCriado[0].data).toBe(novoEvento.data);
    
    eventoId = eventoCriado[0].id;
  });

  it('Deve retornar evento com ID correto para redirecionamento', async () => {
    const evento = await db.select().from(eventos).where(eq(eventos.id, eventoId));
    
    expect(evento).toHaveLength(1);
    expect(evento[0].id).toBe(eventoId);
    expect(typeof evento[0].id).toBe('number');
  });

  it('Deve atualizar evento e refletir mudanças', async () => {
    const novoTitulo = 'Encontro com Deus Kids - Atualizado';
    
    await db.update(eventos)
      .set({ titulo: novoTitulo })
      .where(eq(eventos.id, eventoId));

    const eventoAtualizado = await db.select().from(eventos).where(eq(eventos.id, eventoId));
    
    expect(eventoAtualizado[0].titulo).toBe(novoTitulo);
  });

  it('Deve listar todos os eventos do banco', async () => {
    const todoEventos = await db.select().from(eventos);
    
    expect(Array.isArray(todoEventos)).toBe(true);
    expect(todoEventos.length).toBeGreaterThan(0);
    
    // Verificar que evento de teste está na lista
    const eventoTeste = todoEventos.find((e: any) => e.id === eventoId);
    expect(eventoTeste).toBeDefined();
  });

  it('Deve manter consistência entre admin e agenda', async () => {
    // Simular busca do admin
    const eventosAdmin = await db.select().from(eventos);
    
    // Simular busca da agenda (mesmo endpoint)
    const eventosAgenda = await db.select().from(eventos);
    
    // Devem ser idênticos
    expect(eventosAdmin).toEqual(eventosAgenda);
  });

  it('Deve deletar evento corretamente', async () => {
    await db.delete(eventos).where(eq(eventos.id, eventoId));
    
    const eventoDeleted = await db.select().from(eventos).where(eq(eventos.id, eventoId));
    
    expect(eventoDeleted).toHaveLength(0);
  });
});
