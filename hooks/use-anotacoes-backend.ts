import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trpc } from '@/lib/trpc';

export interface AnotacaoDevocional {
  id: number;
  userId: number;
  livro: string;
  capitulo: number;
  texto: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY_SYNC = '@devocional_anotacoes_sync';
const STORAGE_KEY_PENDING = '@devocional_anotacoes_pending';

/**
 * Hook para sincronizar anotações de devocional com backend
 * Suporta offline-first com sincronização automática quando online
 */
export function useAnotacoesBackend() {
  const [anotacoes, setAnotacoes] = useState<AnotacaoDevocional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Queries e mutations do tRPC
  const listByUserQuery = trpc.anotacoesDevocional.listByUser.useQuery();
  const getByCapituloQuery = trpc.anotacoesDevocional.getByCapitulo.useQuery;
  const createMutation = trpc.anotacoesDevocional.create.useMutation();
  const updateMutation = trpc.anotacoesDevocional.update.useMutation();
  const deleteMutation = trpc.anotacoesDevocional.delete.useMutation();

  // Carregar anotações ao montar
  useEffect(() => {
    carregarAnotacoes();
  }, []);

  /**
   * Carregar anotações do backend ou cache local
   */
  const carregarAnotacoes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Tentar carregar do backend
      if (listByUserQuery.data) {
        const anotacoesFormatadas = (listByUserQuery.data as any[]).map((a) => ({
          ...a,
          createdAt: typeof a.createdAt === 'string' ? a.createdAt : new Date(a.createdAt).toISOString(),
          updatedAt: typeof a.updatedAt === 'string' ? a.updatedAt : new Date(a.updatedAt).toISOString(),
        }));
        setAnotacoes(anotacoesFormatadas as AnotacaoDevocional[]);
        // Salvar no cache local
        await AsyncStorage.setItem(STORAGE_KEY_SYNC, JSON.stringify(anotacoesFormatadas));
      } else {
        // Carregar do cache local se backend não disponível
        const cached = await AsyncStorage.getItem(STORAGE_KEY_SYNC);
        if (cached) {
          setAnotacoes(JSON.parse(cached));
        }
      }
    } catch (err) {
      setError(`Erro ao carregar anotações: ${err instanceof Error ? err.message : 'Desconhecido'}`);
      // Tentar carregar do cache em caso de erro
      try {
        const cached = await AsyncStorage.getItem(STORAGE_KEY_SYNC);
        if (cached) {
          setAnotacoes(JSON.parse(cached));
        }
      } catch (cacheErr) {
        console.error('Erro ao carregar cache:', cacheErr);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sincronizar anotações pendentes com backend
   */
  const sincronizar = useCallback(async () => {
    setSyncing(true);
    setError(null);

    try {
      // Carregar anotações pendentes do armazenamento local
      const pendingStr = await AsyncStorage.getItem(STORAGE_KEY_PENDING);
      const pending = pendingStr ? JSON.parse(pendingStr) : [];

      // Processar cada anotação pendente
      for (const anotacao of pending) {
        try {
          if (anotacao.action === 'create') {
            await createMutation.mutateAsync({
              livro: anotacao.livro,
              capitulo: anotacao.capitulo,
              texto: anotacao.texto,
            });
          } else if (anotacao.action === 'update') {
            await updateMutation.mutateAsync({
              id: anotacao.id,
              texto: anotacao.texto,
            });
          } else if (anotacao.action === 'delete') {
            await deleteMutation.mutateAsync(anotacao.id);
          }
        } catch (err) {
          console.error('Erro ao sincronizar anotação:', err);
        }
      }

      // Limpar fila de pendentes
      await AsyncStorage.removeItem(STORAGE_KEY_PENDING);

      // Recarregar anotações do backend
      await carregarAnotacoes();
    } catch (err) {
      setError(`Erro ao sincronizar: ${err instanceof Error ? err.message : 'Desconhecido'}`);
    } finally {
      setSyncing(false);
    }
  }, [createMutation, updateMutation, deleteMutation]);

  /**
   * Adicionar nova anotação (com fallback offline)
   */
  const adicionarAnotacao = useCallback(
    async (livro: string, capitulo: number, texto: string) => {
      try {
        const novaAnotacao = {
          livro,
          capitulo,
          texto,
          action: 'create',
          timestamp: Date.now(),
        };

        // Tentar criar no backend
        try {
          const result = await createMutation.mutateAsync({
            livro,
            capitulo,
            texto,
          });

          // Atualizar lista local
          await carregarAnotacoes();
          return result;
        } catch (backendErr) {
          // Se falhar, salvar como pendente
          const pendingStr = await AsyncStorage.getItem(STORAGE_KEY_PENDING);
          const pending = pendingStr ? JSON.parse(pendingStr) : [];
          pending.push(novaAnotacao);
          await AsyncStorage.setItem(STORAGE_KEY_PENDING, JSON.stringify(pending));

          // Adicionar localmente também
          const anotacaoLocal = {
            id: -Math.random(), // ID temporário negativo
            userId: -1,
            ...novaAnotacao,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setAnotacoes((prev) => [...prev, anotacaoLocal]);

          throw backendErr;
        }
      } catch (err) {
        setError(`Erro ao adicionar anotação: ${err instanceof Error ? err.message : 'Desconhecido'}`);
        throw err;
      }
    },
    [createMutation]
  );

  /**
   * Atualizar anotação existente
   */
  const atualizarAnotacao = useCallback(
    async (id: number, novoTexto: string) => {
      try {
        await updateMutation.mutateAsync({
          id,
          texto: novoTexto,
        });

        // Atualizar lista local
        setAnotacoes((prev) =>
          prev.map((a) =>
            a.id === id
              ? {
                  ...a,
                  texto: novoTexto,
                  updatedAt: new Date().toISOString(),
                }
              : a
          )
        );
      } catch (err) {
        setError(`Erro ao atualizar anotação: ${err instanceof Error ? err.message : 'Desconhecido'}`);
        throw err;
      }
    },
    [updateMutation]
  );

  /**
   * Deletar anotação
   */
  const deletarAnotacao = useCallback(
    async (id: number) => {
      try {
        await deleteMutation.mutateAsync(id);

        // Remover da lista local
        setAnotacoes((prev) => prev.filter((a) => a.id !== id));
      } catch (err) {
        setError(`Erro ao deletar anotação: ${err instanceof Error ? err.message : 'Desconhecido'}`);
        throw err;
      }
    },
    [deleteMutation]
  );

  /**
   * Obter anotações de um capítulo específico
   */
  const obterAnotacoesCapitulo = useCallback(
    (livro: string, capitulo: number): AnotacaoDevocional[] => {
      return anotacoes.filter((a) => a.livro === livro && a.capitulo === capitulo);
    },
    [anotacoes]
  );

  /**
   * Obter todas as anotações de um livro
   */
  const obterAnotacoesLivro = useCallback(
    (livro: string): AnotacaoDevocional[] => {
      return anotacoes.filter((a) => a.livro === livro);
    },
    [anotacoes]
  );

  return {
    anotacoes,
    isLoading,
    isSyncing,
    error,
    adicionarAnotacao,
    atualizarAnotacao,
    deletarAnotacao,
    obterAnotacoesCapitulo,
    obterAnotacoesLivro,
    sincronizar,
    carregarAnotacoes,
  };
}
