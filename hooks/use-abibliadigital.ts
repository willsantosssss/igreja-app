import { useState, useEffect, useCallback } from 'react';
import {
  buscarCapitulo,
  sincronizarTodoNT,
  obterEstatisticasCache,
  Capitulo,
} from '@/lib/services/abibliadigital-api';

export interface UseABibliaDigitalOptions {
  versao?: 'NAA' | 'NVI';
  autoSincronizar?: boolean;
}

export function useABibliaDigital(options: UseABibliaDigitalOptions = {}) {
  const { versao = 'NAA', autoSincronizar = false } = options;

  const [capitulo, setCapitulo] = useState<Capitulo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sincronizando, setSincronizando] = useState(false);
  const [progresso, setProgresso] = useState({ total: 0, atual: 0 });
  const [estatisticas, setEstatisticas] = useState({
    sincronizados: 0,
    total: 260,
    versao: 'NAA',
    ultimaSincronizacao: null as string | null,
  });

  // Carregar capítulo
  const carregarCapitulo = useCallback(
    async (livro: string, numero: number) => {
      setLoading(true);
      setError(null);

      try {
        const cap = await buscarCapitulo(livro, numero, versao);
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

  // Sincronizar todo o Novo Testamento
  const sincronizar = useCallback(async () => {
    setSincronizando(true);
    setError(null);

    try {
      const sincronizados = await sincronizarTodoNT(versao, (total, atual) => {
        setProgresso({ total, atual });
      });

      // Atualizar estatísticas
      const stats = await obterEstatisticasCache();
      setEstatisticas(stats);

      return sincronizados;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro na sincronização');
      return 0;
    } finally {
      setSincronizando(false);
    }
  }, [versao]);

  // Carregar estatísticas
  const atualizarEstatisticas = useCallback(async () => {
    try {
      const stats = await obterEstatisticasCache();
      setEstatisticas(stats);
    } catch (err) {
      console.error('Erro ao atualizar estatísticas:', err);
    }
  }, []);

  // Auto-sincronizar na montagem
  useEffect(() => {
    atualizarEstatisticas();

    if (autoSincronizar && estatisticas.sincronizados === 0) {
      sincronizar();
    }
  }, [autoSincronizar, atualizarEstatisticas, sincronizar, estatisticas.sincronizados]);

  return {
    capitulo,
    loading,
    error,
    sincronizando,
    progresso,
    estatisticas,
    carregarCapitulo,
    sincronizar,
    atualizarEstatisticas,
  };
}
