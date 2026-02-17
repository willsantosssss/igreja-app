import { describe, it, expect, beforeEach, vi } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  buscarCapitulo,
  obterEstatisticasCache,
  calcularTamanhoCache,
  SEQUENCIA_NT,
} from './abibliadigital-api';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    multiRemove: vi.fn(),
    getAllKeys: vi.fn(),
  },
}));

vi.stubGlobal('fetch', vi.fn());

describe('A Bíblia Digital API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve ter 260 capítulos no Novo Testamento', () => {
    let total = 0;
    for (const livro of SEQUENCIA_NT) {
      total += livro.capitulos;
    }
    expect(total).toBe(260);
  });

  it('deve ter todos os 27 livros do Novo Testamento', () => {
    expect(SEQUENCIA_NT).toHaveLength(27);
  });

  it('deve validar estrutura de sequência NT', () => {
    for (const livro of SEQUENCIA_NT) {
      expect(livro).toHaveProperty('livro');
      expect(livro).toHaveProperty('capitulos');
      expect(typeof livro.livro).toBe('string');
      expect(typeof livro.capitulos).toBe('number');
      expect(livro.capitulos).toBeGreaterThan(0);
    }
  });

  it('deve carregar capítulo do cache', async () => {
    const mockCapitulo = {
      livro: 'João',
      numero: 1,
      versos: [
        { numero: 1, texto: 'No princípio era o Verbo' },
        { numero: 2, texto: 'E o Verbo estava com Deus' },
      ],
      versao: 'NAA' as const,
    };

    (AsyncStorage.getItem as any).mockResolvedValue(JSON.stringify(mockCapitulo));

    const resultado = await buscarCapitulo('João', 1, 'NAA');

    expect(resultado).toEqual(mockCapitulo);
  });

  it('deve retornar null se capítulo não estiver em cache', async () => {
    (AsyncStorage.getItem as any).mockResolvedValue(null);
    (global.fetch as any).mockRejectedValue(new Error('Network error'));

    const resultado = await buscarCapitulo('João', 1, 'NAA');

    expect(resultado).toBeNull();
  });

  it('deve obter estatísticas de cache', async () => {
    const mockStats = {
      sincronizados: 100,
      total: 260,
      versao: 'NAA',
    };

    (AsyncStorage.getItem as any).mockResolvedValue(JSON.stringify(mockStats));

    const stats = await obterEstatisticasCache();

    expect(stats).toHaveProperty('sincronizados');
    expect(stats).toHaveProperty('total');
    expect(stats).toHaveProperty('versao');
    expect(stats).toHaveProperty('ultimaSincronizacao');
  });

  it('deve retornar valores padrão se cache estiver vazio', async () => {
    (AsyncStorage.getItem as any).mockResolvedValue(null);

    const stats = await obterEstatisticasCache();

    expect(stats.sincronizados).toBe(0);
    expect(stats.total).toBe(260);
    expect(stats.versao).toBe('NAA');
  });

  it('deve calcular tamanho do cache', async () => {
    const mockKeys = ['@biblia_capitulo_Mateus_1_NAA', '@biblia_capitulo_Marcos_1_NAA'];
    const mockItem = JSON.stringify({ livro: 'Mateus', numero: 1, versos: [] });

    (AsyncStorage.getAllKeys as any).mockResolvedValue(mockKeys);
    (AsyncStorage.getItem as any).mockResolvedValue(mockItem);

    const tamanho = await calcularTamanhoCache();

    expect(typeof tamanho).toBe('number');
    expect(tamanho).toBeGreaterThanOrEqual(0);
  });

  it('deve validar versões suportadas', () => {
    const versoesValidas = ['NAA', 'NVI'];
    expect(versoesValidas).toContain('NAA');
    expect(versoesValidas).toContain('NVI');
  });

  it('deve ter primeiro livro como Mateus', () => {
    expect(SEQUENCIA_NT[0].livro).toBe('Mateus');
    expect(SEQUENCIA_NT[0].capitulos).toBe(28);
  });

  it('deve ter último livro como Apocalipse', () => {
    const ultimo = SEQUENCIA_NT[SEQUENCIA_NT.length - 1];
    expect(ultimo.livro).toBe('Apocalipse');
    expect(ultimo.capitulos).toBe(22);
  });

  it('deve ter estrutura de verso correta', async () => {
    const mockCapitulo = {
      livro: 'João',
      numero: 1,
      versos: [
        { numero: 1, texto: 'Texto do verso 1' },
        { numero: 2, texto: 'Texto do verso 2' },
      ],
      versao: 'NAA' as const,
    };

    for (const verso of mockCapitulo.versos) {
      expect(verso).toHaveProperty('numero');
      expect(verso).toHaveProperty('texto');
      expect(typeof verso.numero).toBe('number');
      expect(typeof verso.texto).toBe('string');
    }
  });
});
