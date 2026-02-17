import { useState, useEffect } from "react";
import { buscarCapituloAPI, CapituloTexto, getEstatisticasCache } from "@/lib/services/bible-api";

export function useCapituloBiblia(livro: string, capitulo: number, versao: "NAA" | "NVI" = "NAA") {
  const [texto, setTexto] = useState<CapituloTexto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const carregarCapitulo = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const resultado = await buscarCapituloAPI(livro, capitulo, versao);
        if (resultado) {
          setTexto(resultado);
        } else {
          setError("Capítulo não encontrado");
        }
      } catch (err) {
        setError("Erro ao carregar capítulo");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    carregarCapitulo();
  }, [livro, capitulo, versao]);

  return { texto, isLoading, error };
}

export function useEstatisticasCache() {
  const [stats, setStats] = useState({
    totalCapitulos: 260,
    capitulosEmCache: 0,
    tamanhoCache: "0 KB",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const carregarStats = async () => {
      try {
        const resultado = await getEstatisticasCache();
        setStats(resultado);
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error);
      } finally {
        setIsLoading(false);
      }
    };

    carregarStats();
  }, []);

  return { stats, isLoading };
}
