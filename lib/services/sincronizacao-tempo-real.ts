import AsyncStorage from '@react-native-async-storage/async-storage';
import * as React from 'react';

/**
 * Serviço de Sincronização em Tempo Real
 * Permite que alterações feitas pelo admin apareçam em todos os celulares
 * Usa listeners no AsyncStorage para detectar mudanças
 */

export type DataType = 'eventos' | 'celulas' | 'oracao' | 'contribuicao' | 'lideres' | 'membros' | 'aniversariantes' | 'relatorios';

export interface SincronizacaoListener {
  (dados: any): void;
}

// Mapa de listeners por tipo de dados
const listeners: Map<DataType, Set<SincronizacaoListener>> = new Map();

// Intervalo de verificação de mudanças (em ms)
const VERIFICACAO_INTERVALO = 2000;

// Timestamps da última verificação por tipo
const ultimaVerificacao: Map<DataType, number> = new Map();

/**
 * Registrar listener para um tipo de dados
 * Será chamado sempre que os dados forem alterados
 */
export function registrarListener(
  tipo: DataType,
  callback: SincronizacaoListener
): () => void {
  if (!listeners.has(tipo)) {
    listeners.set(tipo, new Set());
  }

  listeners.get(tipo)!.add(callback);

  // Retornar função para desregistrar
  return () => {
    listeners.get(tipo)?.delete(callback);
  };
}

/**
 * Iniciar monitoramento de sincronização
 * Deve ser chamado uma vez na inicialização do app
 */
export function iniciarMonitoramento(): () => void {
  const tipos: DataType[] = ['eventos', 'celulas', 'oracao', 'contribuicao', 'lideres', 'membros', 'aniversariantes', 'relatorios'];
  const intervalIds: ReturnType<typeof setInterval>[] = [];

  tipos.forEach((tipo) => {
    // Inicializar timestamp
    ultimaVerificacao.set(tipo, Date.now());

    // Configurar intervalo de verificação
    const intervalId = setInterval(() => {
      verificarMudancas(tipo);
    }, VERIFICACAO_INTERVALO);

    intervalIds.push(intervalId);
  });

  console.log('[Sincronização] Monitoramento iniciado para todos os tipos de dados');

  // Retornar função para parar monitoramento
  return () => {
    intervalIds.forEach((id) => clearInterval(id));
    console.log('[Sincronização] Monitoramento parado');
  };
}

/**
 * Verificar se houve mudanças em um tipo de dados
 */
async function verificarMudancas(tipo: DataType): Promise<void> {
  try {
    const chave = `@${tipo}`;
    const dados = await AsyncStorage.getItem(chave);

    if (!dados) {
      return;
    }

    // Calcular hash dos dados para detectar mudanças
    const hashAtual = calcularHash(dados);
    const chaveHash = `@${tipo}_hash`;
    const hashAnterior = await AsyncStorage.getItem(chaveHash);

    if (hashAtual !== hashAnterior) {
      // Dados foram alterados, notificar listeners
      await AsyncStorage.setItem(chaveHash, hashAtual);
      notificarListeners(tipo, JSON.parse(dados));

      console.log(`[Sincronização] Mudanças detectadas em ${tipo}`);
    }
  } catch (error) {
    console.error(`[Sincronização] Erro ao verificar mudanças em ${tipo}:`, error);
  }
}

/**
 * Notificar todos os listeners de um tipo de dados
 */
function notificarListeners(tipo: DataType, dados: any): void {
  const callbacks = listeners.get(tipo);

  if (callbacks && callbacks.size > 0) {
    callbacks.forEach((callback) => {
      try {
        callback(dados);
      } catch (error) {
        console.error(`[Sincronização] Erro ao executar listener para ${tipo}:`, error);
      }
    });
  }
}

/**
 * Calcular hash simples de uma string
 * Usado para detectar mudanças nos dados
 */
function calcularHash(str: string): string {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return hash.toString(36);
}

/**
 * Forçar sincronização de um tipo de dados
 * Útil quando você sabe que os dados foram alterados
 */
export async function forcaSincronizacao(tipo: DataType): Promise<void> {
  try {
    const chave = `@${tipo}`;
    const dados = await AsyncStorage.getItem(chave);

    if (dados) {
      const hashAtual = calcularHash(dados);
      const chaveHash = `@${tipo}_hash`;
      await AsyncStorage.setItem(chaveHash, hashAtual);

      notificarListeners(tipo, JSON.parse(dados));
      console.log(`[Sincronização] Sincronização forçada para ${tipo}`);
    }
  } catch (error) {
    console.error(`[Sincronização] Erro ao forçar sincronização de ${tipo}:`, error);
  }
}

/**
 * Obter status de sincronização
 */
export async function obterStatusSincronizacao(): Promise<{
  ativo: boolean;
  tiposMonitorados: DataType[];
  ultimasAlteracoes: Record<DataType, string | null>;
}> {
  const tipos: DataType[] = ['eventos', 'celulas', 'oracao', 'contribuicao', 'lideres', 'membros', 'aniversariantes', 'relatorios'];
  const ultimasAlteracoes: Record<DataType, string | null> = {
    eventos: null,
    celulas: null,
    oracao: null,
    contribuicao: null,
    lideres: null,
    membros: null,
    aniversariantes: null,
    relatorios: null,
  };

  for (const tipo of tipos) {
    const chaveTimestamp = `@${tipo}_timestamp`;
    const timestamp = await AsyncStorage.getItem(chaveTimestamp);
    ultimasAlteracoes[tipo] = timestamp || null;
  }

  return {
    ativo: listeners.size > 0,
    tiposMonitorados: tipos,
    ultimasAlteracoes,
  };
}

/**
 * Limpar todos os listeners
 */
export function limparListeners(): void {
  listeners.clear();
  console.log('[Sincronização] Todos os listeners foram removidos');
}

/**
 * Hook para usar sincronização em componentes React
 * Exemplo:
 * const dados = useSincronizacao('eventos', getEventos);
 */
export function useSincronizacao<T>(
  tipo: DataType,
  carregarDados: () => Promise<T>
): {
  dados: T | null;
  carregando: boolean;
  erro: string | null;
  recarregar: () => Promise<void>;
} {
  const [dados, setDados] = React.useState<T | null>(null);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState<string | null>(null);

  const recarregar = React.useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);
      const novosDados = await carregarDados();
      setDados(novosDados);
      await forcaSincronizacao(tipo);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setCarregando(false);
    }
  }, [tipo, carregarDados]);

  React.useEffect(() => {
    recarregar();

    // Registrar listener para mudanças
    const unsubscribe = registrarListener(tipo, (novosDados) => {
      setDados(novosDados);
    });

    return unsubscribe;
  }, [tipo, recarregar]);

  return { dados, carregando, erro, recarregar };
}

