import { useState, useEffect } from 'react';
import { obterCapituloOffline, capituloExiste, obterLivrosDisponiveis } from '@/lib/data/biblia-completa-naa';
import { sequenciaNovoTestamento } from '@/lib/data/sequencia-nt';

export interface CapituloDevocional {
  livro: string;
  capitulo: number;
  texto: string;
  versao: 'NAA' | 'NVI';
  data: string;
}

/**
 * Hook para obter devocional do dia de forma offline
 */
export function useDevocionalOffline() {
  const [capitulo, setCapitulo] = useState<CapituloDevocional | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [versao, setVersao] = useState<'NAA' | 'NVI'>('NAA');

  useEffect(() => {
    carregarDevocionalDia();
  }, [versao]);

  const carregarDevocionalDia = () => {
    setIsLoading(true);
    setError(null);

    try {
      // Calcular qual capítulo deve ser lido hoje
      const hoje = new Date();
      const anoNovo = new Date(2026, 0, 1); // 1º de janeiro de 2026
      const diferenca = hoje.getTime() - anoNovo.getTime();
      const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
      const indiceCapitulo = Math.min(dias, sequenciaNovoTestamento.length - 1);

      if (indiceCapitulo < 0 || indiceCapitulo >= sequenciaNovoTestamento.length) {
        setError('Capítulo não encontrado para esta data');
        setIsLoading(false);
        return;
      }

      const capituloInfo = sequenciaNovoTestamento[indiceCapitulo];
      const texto = obterCapituloOffline(capituloInfo.livro, capituloInfo.capitulo);

      if (!texto) {
        setError(`Capítulo ${capituloInfo.livro} ${capituloInfo.capitulo} não disponível offline`);
        setIsLoading(false);
        return;
      }

      setCapitulo({
        livro: capituloInfo.livro,
        capitulo: capituloInfo.capitulo,
        texto,
        versao,
        data: hoje.toLocaleDateString('pt-BR'),
      });

      setIsLoading(false);
    } catch (err) {
      setError(`Erro ao carregar devocional: ${err instanceof Error ? err.message : 'Desconhecido'}`);
      setIsLoading(false);
    }
  };

  const irParaCapitulo = (livro: string, numeroCapitulo: number) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!capituloExiste(livro, numeroCapitulo)) {
        setError(`Capítulo ${livro} ${numeroCapitulo} não encontrado`);
        setIsLoading(false);
        return;
      }

      const texto = obterCapituloOffline(livro, numeroCapitulo);
      if (!texto) {
        setError('Erro ao carregar capítulo');
        setIsLoading(false);
        return;
      }

      setCapitulo({
        livro,
        capitulo: numeroCapitulo,
        texto,
        versao,
        data: new Date().toLocaleDateString('pt-BR'),
      });

      setIsLoading(false);
    } catch (err) {
      setError(`Erro ao carregar capítulo: ${err instanceof Error ? err.message : 'Desconhecido'}`);
      setIsLoading(false);
    }
  };

  const irParaProximo = () => {
    if (!capitulo) return;

    const indiceAtual = sequenciaNovoTestamento.findIndex(
      (c: any) => c.livro === capitulo.livro && c.capitulo === capitulo.capitulo
    );

    if (indiceAtual < sequenciaNovoTestamento.length - 1) {
      const proximo = sequenciaNovoTestamento[indiceAtual + 1];
      irParaCapitulo(proximo.livro, proximo.capitulo);
    }
  };

  const irParaAnterior = () => {
    if (!capitulo) return;

    const indiceAtual = sequenciaNovoTestamento.findIndex(
      (c: any) => c.livro === capitulo.livro && c.capitulo === capitulo.capitulo
    );

    if (indiceAtual > 0) {
      const anterior = sequenciaNovoTestamento[indiceAtual - 1];
      irParaCapitulo(anterior.livro, anterior.capitulo);
    }
  };

  return {
    capitulo,
    isLoading,
    error,
    versao,
    setVersao,
    irParaCapitulo,
    irParaProximo,
    irParaAnterior,
    carregarDevocionalDia,
    livrosDisponiveis: obterLivrosDisponiveis(),
  };
}
