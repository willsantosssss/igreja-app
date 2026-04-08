import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AnotacaoHistorico {
  id: string; // Chave do AsyncStorage (@anotacao_Livro-Capitulo)
  livro: string;
  capitulo: number;
  texto: string;
  dataAtualizacao: string; // ISO string
}

/**
 * Hook para gerenciar histórico de anotações do devocional
 * Lê as anotações salvas pelo devocional com a chave @anotacao_${livro}-${capitulo}
 */
export function useHistoricoAnotacoes() {
  const [anotacoes, setAnotacoes] = useState<AnotacaoHistorico[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carregar todas as anotações do armazenamento local
   */
  const carregarAnotacoes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const keys = await AsyncStorage.getAllKeys();
      const anotacaoKeys = keys.filter((key) => key.startsWith('@anotacao_'));

      const anotacoesCarregadas: AnotacaoHistorico[] = [];

      for (const key of anotacaoKeys) {
        const texto = await AsyncStorage.getItem(key);
        if (texto) {
          // Extrair livro e capítulo da chave (@anotacao_Livro-Capitulo)
          const partes = key.replace('@anotacao_', '').split('-');
          const capitulo = partes.pop(); // Último elemento é o capítulo
          const livro = partes.join('-'); // Resto é o livro

          anotacoesCarregadas.push({
            id: key,
            livro,
            capitulo: parseInt(capitulo || '0'),
            texto,
            dataAtualizacao: new Date().toISOString(),
          });
        }
      }

      // Ordenar por livro e capítulo
      anotacoesCarregadas.sort((a, b) => {
        if (a.livro !== b.livro) {
          return a.livro.localeCompare(b.livro);
        }
        return a.capitulo - b.capitulo;
      });

      setAnotacoes(anotacoesCarregadas);
    } catch (err) {
      setError(`Erro ao carregar anotações: ${err instanceof Error ? err.message : 'Desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carregar anotações apenas ao montar o componente
  useEffect(() => {
    carregarAnotacoes();
  }, [carregarAnotacoes]);

  /**
   * Atualizar anotação existente
   */
  const atualizarAnotacao = useCallback(
    async (id: string, novoTexto: string) => {
      try {
        if (novoTexto.trim()) {
          await AsyncStorage.setItem(id, novoTexto);
        } else {
          await AsyncStorage.removeItem(id);
        }

        // Recarregar anotações
        await carregarAnotacoes();
      } catch (err) {
        setError(`Erro ao atualizar anotação: ${err instanceof Error ? err.message : 'Desconhecido'}`);
      }
    },
    [carregarAnotacoes]
  );

  /**
   * Deletar anotação
   */
  const deletarAnotacao = useCallback(
    async (id: string) => {
      try {
        await AsyncStorage.removeItem(id);

        // Recarregar anotações
        await carregarAnotacoes();
      } catch (err) {
        setError(`Erro ao deletar anotação: ${err instanceof Error ? err.message : 'Desconhecido'}`);
      }
    },
    [carregarAnotacoes]
  );

  /**
   * Obter anotações de um capítulo específico
   */
  const obterAnotacoesCapitulo = useCallback(
    (livro: string, capitulo: number): AnotacaoHistorico[] => {
      return anotacoes.filter((a) => a.livro === livro && a.capitulo === capitulo);
    },
    [anotacoes]
  );

  /**
   * Obter anotações de um livro específico
   */
  const obterAnotacoesLivro = useCallback(
    (livro: string): AnotacaoHistorico[] => {
      return anotacoes.filter((a) => a.livro === livro);
    },
    [anotacoes]
  );

  /**
   * Filtrar anotações por período de datas
   */
  const filtrarPorData = useCallback(
    (dataInicio?: Date, dataFim?: Date): AnotacaoHistorico[] => {
      if (!dataInicio || !dataFim) return anotacoes;

      return anotacoes.filter((a) => {
        const dataAnotacao = new Date(a.dataAtualizacao);
        return dataAnotacao >= dataInicio && dataAnotacao <= dataFim;
      });
    },
    [anotacoes]
  );

  /**
   * Buscar anotações por texto
   */
  const buscarPorTexto = useCallback(
    (termo: string): AnotacaoHistorico[] => {
      if (!termo.trim()) return anotacoes;

      const termoLower = termo.toLowerCase();
      return anotacoes.filter(
        (a) =>
          a.texto.toLowerCase().includes(termoLower) ||
          a.livro.toLowerCase().includes(termoLower)
      );
    },
    [anotacoes]
  );

  /**
   * Obter lista de livros com anotações
   */
  const obterLivrosComAnotacoes = useCallback((): string[] => {
    const livros = new Set(anotacoes.map((a) => a.livro));
    return Array.from(livros).sort((a, b) => a.localeCompare(b));
  }, [anotacoes]);

  /**
   * Deletar todas as anotações de um capítulo
   */
  const deletarAnotacoesCapitulo = useCallback(
    async (livro: string, capitulo: number) => {
      try {
        const key = `@anotacao_${livro}-${capitulo}`;
        await AsyncStorage.removeItem(key);

        // Recarregar anotações
        await carregarAnotacoes();
      } catch (err) {
        setError(`Erro ao deletar anotações do capítulo: ${err instanceof Error ? err.message : 'Desconhecido'}`);
      }
    },
    [carregarAnotacoes]
  );

  /**
   * Exportar anotações como texto
   */
  const exportarAnotacoes = useCallback(
    (filtradas?: AnotacaoHistorico[]): string => {
      const anotacoesExportar = filtradas || anotacoes;

      if (anotacoesExportar.length === 0) {
        return 'Nenhuma anotação para exportar';
      }

      return anotacoesExportar
        .map(
          (a) =>
            `${a.livro} ${a.capitulo}\n${a.texto}\n\n(${new Date(a.dataAtualizacao).toLocaleDateString('pt-BR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })})`
        )
        .join('\n\n---\n\n');
    },
    [anotacoes]
  );

  /**
   * Limpar todas as anotações
   */
  const limparTodas = useCallback(async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const anotacaoKeys = keys.filter((key) => key.startsWith('@anotacao_'));

      for (const key of anotacaoKeys) {
        await AsyncStorage.removeItem(key);
      }

      // Recarregar anotações
      await carregarAnotacoes();
    } catch (err) {
      setError(`Erro ao limpar anotações: ${err instanceof Error ? err.message : 'Desconhecido'}`);
    }
  }, [carregarAnotacoes]);

  /**
   * Obter estatísticas do histórico
   */
  const obterEstatisticas = useCallback(() => {
    return {
      totalAnotacoes: anotacoes.length,
      livrosUnicos: obterLivrosComAnotacoes().length,
      anotacaoMaisRecente: anotacoes[0]?.dataAtualizacao || null,
      anotacaoMaisAntiga: anotacoes[anotacoes.length - 1]?.dataAtualizacao || null,
    };
  }, [anotacoes, obterLivrosComAnotacoes]);

  return {
    anotacoes,
    isLoading,
    error,
    atualizarAnotacao,
    deletarAnotacao,
    obterAnotacoesCapitulo,
    obterAnotacoesLivro,
    filtrarPorData,
    buscarPorTexto,
    obterLivrosComAnotacoes,
    deletarAnotacoesCapitulo,
    exportarAnotacoes,
    limparTodas,
    carregarAnotacoes,
    obterEstatisticas,
  };
}
