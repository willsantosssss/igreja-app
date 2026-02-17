import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock AsyncStorage
const store: Record<string, string> = {};
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn((key: string) => Promise.resolve(store[key] || null)),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
      return Promise.resolve();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
      return Promise.resolve();
    }),
  },
}));

import {
  getEventos, criarEvento, editarEvento, removerEvento,
  getEventoById, categoryLabels, categoryColors,
} from '../lib/data/events';

describe('CRUD de Eventos', () => {
  beforeEach(() => {
    // Limpar store
    Object.keys(store).forEach(key => delete store[key]);
  });

  it('deve retornar eventos iniciais na primeira chamada', async () => {
    const eventos = await getEventos();
    expect(eventos.length).toBeGreaterThan(0);
    expect(eventos[0]).toHaveProperty('id');
    expect(eventos[0]).toHaveProperty('title');
    expect(eventos[0]).toHaveProperty('date');
    expect(eventos[0]).toHaveProperty('time');
    expect(eventos[0]).toHaveProperty('location');
    expect(eventos[0]).toHaveProperty('category');
  });

  it('deve criar um novo evento', async () => {
    // Inicializar
    await getEventos();

    const novo = await criarEvento({
      title: 'Evento Teste',
      description: 'Descrição do teste',
      date: '2026-04-01',
      time: '20:00',
      location: 'Local Teste',
      category: 'culto',
    });

    expect(novo.id).toBeDefined();
    expect(novo.title).toBe('Evento Teste');
    expect(novo.category).toBe('culto');

    const todos = await getEventos();
    expect(todos.find(e => e.id === novo.id)).toBeDefined();
  });

  it('deve editar um evento existente', async () => {
    await getEventos();

    const novo = await criarEvento({
      title: 'Original',
      description: '',
      date: '2026-05-01',
      time: '10:00',
      location: 'Local A',
      category: 'reuniao',
    });

    const editado = await editarEvento(novo.id, {
      title: 'Editado',
      location: 'Local B',
    });

    expect(editado).not.toBeNull();
    expect(editado!.title).toBe('Editado');
    expect(editado!.location).toBe('Local B');
    expect(editado!.date).toBe('2026-05-01'); // Não alterado
  });

  it('deve retornar null ao editar evento inexistente', async () => {
    await getEventos();
    const resultado = await editarEvento('id-inexistente', { title: 'Teste' });
    expect(resultado).toBeNull();
  });

  it('deve remover um evento', async () => {
    await getEventos();

    const novo = await criarEvento({
      title: 'Para Remover',
      description: '',
      date: '2026-06-01',
      time: '15:00',
      location: 'Local',
      category: 'retiro',
    });

    const removido = await removerEvento(novo.id);
    expect(removido).toBe(true);

    const todos = await getEventos();
    expect(todos.find(e => e.id === novo.id)).toBeUndefined();
  });

  it('deve retornar false ao remover evento inexistente', async () => {
    await getEventos();
    const resultado = await removerEvento('id-inexistente');
    expect(resultado).toBe(false);
  });

  it('deve buscar evento por ID', async () => {
    const eventos = await getEventos();
    const primeiro = eventos[0];

    const encontrado = await getEventoById(primeiro.id);
    expect(encontrado).not.toBeNull();
    expect(encontrado!.title).toBe(primeiro.title);
  });

  it('deve retornar null para ID inexistente', async () => {
    await getEventos();
    const resultado = await getEventoById('id-inexistente');
    expect(resultado).toBeNull();
  });

  it('deve ter labels para todas as categorias', () => {
    expect(categoryLabels.culto).toBe('Culto');
    expect(categoryLabels.reuniao).toBe('Reunião');
    expect(categoryLabels['evento-especial']).toBe('Evento Especial');
    expect(categoryLabels.retiro).toBe('Retiro');
    expect(categoryLabels.conferencia).toBe('Conferência');
  });

  it('deve ter cores para todas as categorias', () => {
    expect(categoryColors.culto).toBeDefined();
    expect(categoryColors.reuniao).toBeDefined();
    expect(categoryColors['evento-especial']).toBeDefined();
    expect(categoryColors.retiro).toBeDefined();
    expect(categoryColors.conferencia).toBeDefined();
  });

  it('deve manter dados ao criar múltiplos eventos', async () => {
    await getEventos();
    const contInicial = (await getEventos()).length;

    await criarEvento({
      title: 'Evento A',
      description: '',
      date: '2026-07-01',
      time: '10:00',
      location: 'Local A',
      category: 'culto',
    });

    await criarEvento({
      title: 'Evento B',
      description: '',
      date: '2026-07-02',
      time: '11:00',
      location: 'Local B',
      category: 'conferencia',
    });

    const todos = await getEventos();
    expect(todos.length).toBe(contInicial + 2);
    expect(todos.find(e => e.title === 'Evento A')).toBeDefined();
    expect(todos.find(e => e.title === 'Evento B')).toBeDefined();
  });
});
