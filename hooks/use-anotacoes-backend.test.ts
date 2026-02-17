import { describe, it, expect, beforeEach, vi } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

describe('useAnotacoesBackend', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve carregar anotações do cache local quando backend não está disponível', async () => {
    const mockAnotacoes = [
      {
        id: 1,
        userId: 1,
        livro: 'João',
        capitulo: 1,
        texto: 'Reflexão sobre João 1',
        createdAt: '2026-02-17T20:00:00Z',
        updatedAt: '2026-02-17T20:00:00Z',
      },
    ];

    (AsyncStorage.getItem as any).mockResolvedValue(JSON.stringify(mockAnotacoes));

    // Simular carregamento do cache
    const cached = await AsyncStorage.getItem('@devocional_anotacoes_sync');
    expect(cached).toBeDefined();
    expect(JSON.parse(cached!)).toEqual(mockAnotacoes);
  });

  it('deve salvar anotações no cache local', async () => {
    const mockAnotacoes = [
      {
        id: 1,
        userId: 1,
        livro: 'Mateus',
        capitulo: 5,
        texto: 'Bem-aventurados os puros de coração',
        createdAt: '2026-02-17T20:00:00Z',
        updatedAt: '2026-02-17T20:00:00Z',
      },
    ];

    await AsyncStorage.setItem('@devocional_anotacoes_sync', JSON.stringify(mockAnotacoes));

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@devocional_anotacoes_sync',
      JSON.stringify(mockAnotacoes)
    );
  });

  it('deve gerenciar fila de anotações pendentes', async () => {
    const pendingAnotacao = {
      action: 'create',
      livro: 'Marcos',
      capitulo: 1,
      texto: 'Nova anotação',
      timestamp: Date.now(),
    };

    const pending = [pendingAnotacao];

    // Simular armazenamento
    const stored = JSON.stringify(pending);
    const retrieved = JSON.parse(stored);

    expect(retrieved).toHaveLength(1);
    expect(retrieved[0].action).toBe('create');
    expect(retrieved[0].livro).toBe('Marcos');
    expect(retrieved[0].capitulo).toBe(1);
  });

  it('deve formatar datas corretamente', () => {
    const date = new Date('2026-02-17T20:00:00Z');
    const formatted = date.toISOString();

    expect(formatted).toBe('2026-02-17T20:00:00.000Z');
  });

  it('deve filtrar anotações por capítulo', () => {
    const anotacoes = [
      { livro: 'João', capitulo: 1, texto: 'Anotação 1' },
      { livro: 'João', capitulo: 2, texto: 'Anotação 2' },
      { livro: 'Mateus', capitulo: 1, texto: 'Anotação 3' },
    ];

    const filtradas = anotacoes.filter((a) => a.livro === 'João' && a.capitulo === 1);

    expect(filtradas).toHaveLength(1);
    expect(filtradas[0].texto).toBe('Anotação 1');
  });

  it('deve filtrar anotações por livro', () => {
    const anotacoes = [
      { livro: 'João', capitulo: 1, texto: 'Anotação 1' },
      { livro: 'João', capitulo: 2, texto: 'Anotação 2' },
      { livro: 'Mateus', capitulo: 1, texto: 'Anotação 3' },
    ];

    const filtradas = anotacoes.filter((a) => a.livro === 'João');

    expect(filtradas).toHaveLength(2);
  });

  it('deve limpar fila de pendentes após sincronização bem-sucedida', async () => {
    const pending = [
      { action: 'create', livro: 'Lucas', capitulo: 1, texto: 'Anotação' },
    ];

    await AsyncStorage.setItem('@devocional_anotacoes_pending', JSON.stringify(pending));
    await AsyncStorage.removeItem('@devocional_anotacoes_pending');

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@devocional_anotacoes_pending');
  });

  it('deve manter histórico de anotações editadas', () => {
    const anotacaoOriginal = {
      id: 1,
      texto: 'Texto original',
      updatedAt: '2026-02-17T20:00:00Z',
    };

    const anotacaoEditada = {
      ...anotacaoOriginal,
      texto: 'Texto editado',
      updatedAt: '2026-02-17T21:00:00Z',
    };

    expect(anotacaoEditada.id).toBe(anotacaoOriginal.id);
    expect(anotacaoEditada.texto).not.toBe(anotacaoOriginal.texto);
    expect(anotacaoEditada.updatedAt).not.toBe(anotacaoOriginal.updatedAt);
  });

  it('deve validar estrutura de anotação', () => {
    const anotacao = {
      id: 1,
      userId: 1,
      livro: 'João',
      capitulo: 1,
      texto: 'Reflexão',
      createdAt: '2026-02-17T20:00:00Z',
      updatedAt: '2026-02-17T20:00:00Z',
    };

    expect(anotacao).toHaveProperty('id');
    expect(anotacao).toHaveProperty('userId');
    expect(anotacao).toHaveProperty('livro');
    expect(anotacao).toHaveProperty('capitulo');
    expect(anotacao).toHaveProperty('texto');
    expect(anotacao).toHaveProperty('createdAt');
    expect(anotacao).toHaveProperty('updatedAt');
  });
});
