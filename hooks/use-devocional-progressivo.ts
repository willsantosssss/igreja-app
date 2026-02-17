import { useState, useEffect, useCallback } from 'react';
import {
  buscarCapituloComCache,
  getCapituloDoDia,
  obterEstatisticasCache,
  CapituloDevocional,
} from '@/lib/services/devocional-cache-progressivo';

export function useDevocionaiProgressivo(versao: 'NAA' | 'NVI' = 'NAA') {
  const [capitulo, setCapitulo] = useState<CapituloDevocional | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estatisticas, setEstatisticas] = useState({
    capitulosCacheados: 0,
    ultimoCapituloCarregado: null as string | null,
  });

  // Carregar capítulo do dia
  const carregarCapituloDoDia = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { livro, numero } = getCapituloDoDia();
      const cap = await buscarCapituloComCache(livro, numero, versao);

      if (cap) {
        setCapitulo(cap);
      } else {
        setError('Não foi possível carregar o capítulo do dia');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar capítulo');
    } finally {
      setLoading(false);
    }
  }, [versao]);

  // Carregar capítulo específico
  const carregarCapitulo = useCallback(
    async (livro: string, numero: number) => {
      setLoading(true);
      setError(null);

      try {
        const cap = await buscarCapituloComCache(livro, numero, versao);

        if (cap) {
          setCapitulo(cap);
        } else {
          setError(`Capítulo ${livro} ${numero} não encontrado`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar capítulo');
      } finally {
        setLoading(false);
      }
    },
    [versao]
  );

  // Atualizar estatísticas
  const atualizarEstatisticas = useCallback(async () => {
    try {
      const stats = await obterEstatisticasCache();
      setEstatisticas(stats);
    } catch (err) {
      console.error('Erro ao atualizar estatísticas:', err);
    }
  }, []);

  // Carregar capítulo do dia na montagem
  useEffect(() => {
    carregarCapituloDoDia();
    atualizarEstatisticas();
  }, [carregarCapituloDoDia, atualizarEstatisticas]);

  return {
    capitulo,
    loading,
    error,
    estatisticas,
    carregarCapituloDoDia,
    carregarCapitulo,
    atualizarEstatisticas,
  };
}
