import { describe, it, expect, beforeEach, vi } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    multiRemove: vi.fn(),
    getAllKeys: vi.fn(),
  },
}));

// Mock sequencia-nt
vi.mock('@/lib/data/sequencia-nt', () => ({
  sequenciaNovoTestamento: [
    { livro: 'Mateus', capitulo: 1 },
    { livro: 'Mateus', capitulo: 2 },
  ],
  getCapituloByIndex: (index: number) => ({
    livro: 'Mateus',
    capitulo: 1 + (index % 2),
  }),
}));

// Mock fetch
global.fetch = vi.fn();

describe('Devocional Cache Progressivo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar capítulo do dia', async () => {
    const { getCapituloDoDia } = await import('./devocional-cache-progressivo');
    const capitulo = getCapituloDoDia();

    expect(capitulo).toHaveProperty('livro');
    expect(capitulo).toHaveProperty('numero');
    expect(typeof capitulo.numero).toBe('number');
  });

  it('deve retornar capítulo do cache se existir', async () => {
    const { buscarCapituloComCache } = await import('./devocional-cache-progressivo');

    const capituloMock = {
      livro: 'João',
      numero: 1,
      versos: [{ numero: 1, texto: 'No princípio era o Verbo' }],
      versao: 'NAA' as const,
    };

    (AsyncStorage.getItem as any).mockResolvedValueOnce(JSON.stringify(capituloMock));

    const resultado = await buscarCapituloComCache('João', 1, 'NAA');

    expect(resultado).toEqual(capituloMock);
  });

  it('deve retornar fallback se API falhar', async () => {
    const { buscarCapituloComCache } = await import('./devocional-cache-progressivo');

    (AsyncStorage.getItem as any).mockResolvedValueOnce(null);
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));
    (AsyncStorage.getAllKeys as any).mockResolvedValueOnce([]);

    const resultado = await buscarCapituloComCache('João', 1, 'NAA');

    expect(resultado).toBeDefined();
    expect(resultado?.versos[0].texto).toContain('indisponível');
  });

  it('deve retornar estatísticas do cache', async () => {
    const { obterEstatisticasCache } = await import('./devocional-cache-progressivo');

    (AsyncStorage.getAllKeys as any).mockResolvedValueOnce([
      '@devocional_cache_João_1_NAA',
      '@devocional_cache_João_2_NAA',
    ]);

    const stats = await obterEstatisticasCache();

    expect(stats.capitulosCacheados).toBe(2);
  });

  it('deve retornar 0 se cache vazio', async () => {
    const { obterEstatisticasCache } = await import('./devocional-cache-progressivo');

    (AsyncStorage.getAllKeys as any).mockResolvedValueOnce([]);

    const stats = await obterEstatisticasCache();

    expect(stats.capitulosCacheados).toBe(0);
  });

  it('deve limpar cache corretamente', async () => {
    const { limparCache } = await import('./devocional-cache-progressivo');

    (AsyncStorage.getAllKeys as any).mockResolvedValueOnce([
      '@devocional_cache_João_1_NAA',
      '@devocional_cache_João_2_NAA',
    ]);

    await limparCache();

    expect(AsyncStorage.multiRemove).toHaveBeenCalled();
  });

  it('deve calcular tamanho do cache', async () => {
    const { calcularTamanhoCache } = await import('./devocional-cache-progressivo');

    (AsyncStorage.getAllKeys as any).mockResolvedValueOnce([
      '@devocional_cache_João_1_NAA',
    ]);
    (AsyncStorage.getItem as any).mockResolvedValueOnce('x'.repeat(1000));

    const tamanho = await calcularTamanhoCache();

    expect(tamanho).toBe(1000);
  });
});
