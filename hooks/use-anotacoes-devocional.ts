import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Anotacao {
  id: string;
  livro: string;
  capitulo: number;
  texto: string;
  dataCriacao: string;
  dataAtualizacao: string;
}

const STORAGE_KEY = '@devocional_anotacoes';

/**
 * Hook para gerenciar anotações de leitura devocional
 */
export function useAnotacoesDevocional() {
  const [anotacoes, setAnotacoes] = useState<Anotacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar anotações ao montar
  useEffect(() => {
    carregarAnotacoes();
  }, []);

  /**
   * Carregar todas as anotações do armazenamento local
   */
  const carregarAnotacoes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        setAnotacoes(JSON.parse(saved));
      }
    } catch (err) {
      setError(`Erro ao carregar anotações: ${err instanceof Error ? err.message : 'Desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Salvar anotações no armazenamento local
   */
  const salvarAnotacoes = async (novasAnotacoes: Anotacao[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(novasAnotacoes));
      setAnotacoes(novasAnotacoes);
    } catch (err) {
      setError(`Erro ao salvar anotações: ${err instanceof Error ? err.message : 'Desconhecido'}`);
    }
  };

  /**
   * Adicionar nova anotação
   */
  const adicionarAnotacao = async (livro: string, capitulo: number, texto: string) => {
    const novaAnotacao: Anotacao = {
      id: `${livro}-${capitulo}-${Date.now()}`,
      livro,
      capitulo,
      texto,
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString(),
    };

    const novasAnotacoes = [...anotacoes, novaAnotacao];
    await salvarAnotacoes(novasAnotacoes);
    return novaAnotacao;
  };

  /**
   * Atualizar anotação existente
   */
  const atualizarAnotacao = async (id: string, novoTexto: string) => {
    const novasAnotacoes = anotacoes.map((a) =>
      a.id === id
        ? {
            ...a,
            texto: novoTexto,
            dataAtualizacao: new Date().toISOString(),
          }
        : a
    );

    await salvarAnotacoes(novasAnotacoes);
  };

  /**
   * Deletar anotação
   */
  const deletarAnotacao = async (id: string) => {
    const novasAnotacoes = anotacoes.filter((a) => a.id !== id);
    await salvarAnotacoes(novasAnotacoes);
  };

  /**
   * Obter anotações de um capítulo específico
   */
  const obterAnotacoesCapitulo = (livro: string, capitulo: number): Anotacao[] => {
    return anotacoes.filter((a) => a.livro === livro && a.capitulo === capitulo);
  };

  /**
   * Obter todas as anotações de um livro
   */
  const obterAnotacoesLivro = (livro: string): Anotacao[] => {
    return anotacoes.filter((a) => a.livro === livro);
  };

  /**
   * Deletar todas as anotações de um capítulo
   */
  const deletarAnotacoesCapitulo = async (livro: string, capitulo: number) => {
    const novasAnotacoes = anotacoes.filter(
      (a) => !(a.livro === livro && a.capitulo === capitulo)
    );
    await salvarAnotacoes(novasAnotacoes);
  };

  /**
   * Exportar anotações como texto
   */
  const exportarAnotacoes = (livro: string, capitulo: number): string => {
    const anotacoesCapitulo = obterAnotacoesCapitulo(livro, capitulo);

    if (anotacoesCapitulo.length === 0) {
      return 'Nenhuma anotação para este capítulo';
    }

    return anotacoesCapitulo
      .map(
        (a) =>
          `${a.livro} ${a.capitulo}\n${a.texto}\n\n(${new Date(a.dataCriacao).toLocaleDateString('pt-BR')})`
      )
      .join('\n\n---\n\n');
  };

  /**
   * Limpar todas as anotações
   */
  const limparTodas = async () => {
    await salvarAnotacoes([]);
  };

  return {
    anotacoes,
    isLoading,
    error,
    adicionarAnotacao,
    atualizarAnotacao,
    deletarAnotacao,
    obterAnotacoesCapitulo,
    obterAnotacoesLivro,
    deletarAnotacoesCapitulo,
    exportarAnotacoes,
    limparTodas,
    carregarAnotacoes,
  };
}
