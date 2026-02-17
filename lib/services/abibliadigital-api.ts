import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Serviço de integração com A Bíblia Digital API
 * Sincroniza 260 capítulos do Novo Testamento com cache offline
 * 
 * Nota: Para usar, configure a variável de ambiente EXPO_PUBLIC_ABIBLIA_TOKEN
 * ou use o endpoint via backend (tRPC) para esconder o token
 */

const API_BASE = 'https://www.abibliadigital.com.br/api';
const CACHE_KEY_PREFIX = '@biblia_capitulo_';
const CACHE_INDEX_KEY = '@biblia_index';
const CACHE_TIMESTAMP_KEY = '@biblia_timestamp';

// Usar token da variável de ambiente (melhor: usar backend proxy)
const ABIBLIA_TOKEN = process.env.EXPO_PUBLIC_ABIBLIA_TOKEN || '';

export interface Capitulo {
  livro: string;
  numero: number;
  versos: Verso[];
  versao: 'NAA' | 'NVI';
}

export interface Verso {
  numero: number;
  texto: string;
}

/**
 * Sequência dos 260 capítulos do Novo Testamento
 */
export const SEQUENCIA_NT = [
  // Mateus (28)
  { livro: 'Mateus', capitulos: 28 },
  // Marcos (16)
  { livro: 'Marcos', capitulos: 16 },
  // Lucas (24)
  { livro: 'Lucas', capitulos: 24 },
  // João (21)
  { livro: 'João', capitulos: 21 },
  // Atos (28)
  { livro: 'Atos', capitulos: 28 },
  // Romanos (16)
  { livro: 'Romanos', capitulos: 16 },
  // 1 Coríntios (16)
  { livro: '1 Coríntios', capitulos: 16 },
  // 2 Coríntios (13)
  { livro: '2 Coríntios', capitulos: 13 },
  // Gálatas (6)
  { livro: 'Gálatas', capitulos: 6 },
  // Efésios (6)
  { livro: 'Efésios', capitulos: 6 },
  // Filipenses (4)
  { livro: 'Filipenses', capitulos: 4 },
  // Colossenses (4)
  { livro: 'Colossenses', capitulos: 4 },
  // 1 Tessalonicenses (5)
  { livro: '1 Tessalonicenses', capitulos: 5 },
  // 2 Tessalonicenses (3)
  { livro: '2 Tessalonicenses', capitulos: 3 },
  // 1 Timóteo (6)
  { livro: '1 Timóteo', capitulos: 6 },
  // 2 Timóteo (4)
  { livro: '2 Timóteo', capitulos: 4 },
  // Tito (3)
  { livro: 'Tito', capitulos: 3 },
  // Filemom (1)
  { livro: 'Filemom', capitulos: 1 },
  // Hebreus (13)
  { livro: 'Hebreus', capitulos: 13 },
  // Tiago (5)
  { livro: 'Tiago', capitulos: 5 },
  // 1 Pedro (5)
  { livro: '1 Pedro', capitulos: 5 },
  // 2 Pedro (3)
  { livro: '2 Pedro', capitulos: 3 },
  // 1 João (5)
  { livro: '1 João', capitulos: 5 },
  // 2 João (1)
  { livro: '2 João', capitulos: 1 },
  // 3 João (1)
  { livro: '3 João', capitulos: 1 },
  // Judas (1)
  { livro: 'Judas', capitulos: 1 },
  // Apocalipse (22)
  { livro: 'Apocalipse', capitulos: 22 },
];

/**
 * Buscar capítulo da API com fallback para cache
 */
export async function buscarCapitulo(
  livro: string,
  numero: number,
  versao: 'NAA' | 'NVI' = 'NAA'
): Promise<Capitulo | null> {
  const cacheKey = `${CACHE_KEY_PREFIX}${livro}_${numero}_${versao}`;

  try {
    // Tentar buscar do cache primeiro
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Se não estiver em cache, buscar da API
    const capitulo = await buscarDaAPI(livro, numero, versao);

    if (capitulo) {
      // Salvar no cache
      await AsyncStorage.setItem(cacheKey, JSON.stringify(capitulo));
      return capitulo;
    }

    return null;
  } catch (error) {
    console.error(`[Bíblia Digital] Erro ao buscar ${livro} ${numero}:`, error);
    // Tentar retornar do cache mesmo com erro
    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }
}

/**
 * Buscar capítulo da API A Bíblia Digital
 */
async function buscarDaAPI(
  livro: string,
  numero: number,
  versao: 'NAA' | 'NVI'
): Promise<Capitulo | null> {
  try {
    // Mapear nome do livro para versão da API
    const livroMapeado = mapearNomeLivro(livro);
    const versaoAbrev = versao === 'NAA' ? 'naa' : 'nvi';

    // Construir URL da API - formato correto para A Bíblia Digital
    // Endpoint: GET /verses/{version}/{book}/{chapter}
    const url = `${API_BASE}/verses/${versaoAbrev}/${livroMapeado}/${numero}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Adicionar token se disponível
    if (ABIBLIA_TOKEN) {
      headers['Authorization'] = `Bearer ${ABIBLIA_TOKEN}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const statusText = response.statusText || `HTTP ${response.status}`;
      const errorBody = await response.text().catch(() => '');
      
      console.warn(
        `[Bíblia Digital] Falha ao buscar ${livro} ${numero}: ${statusText}`,
        errorBody ? `(${errorBody.substring(0, 100)})` : ''
      );

      // Se for 401/403, pode ser falta de token
      if (response.status === 401 || response.status === 403) {
        console.error('[Bíblia Digital] Erro de autenticação - verifique o token');
      }

      return null;
    }

    const data = await response.json();

    // Transformar resposta da API para nosso formato
    if (data && data.verses) {
      const versos: Verso[] = data.verses.map((v: any) => ({
        numero: v.number || v.verse,
        texto: v.text || v.content,
      }));

      return {
        livro,
        numero,
        versos,
        versao,
      };
    }

    return null;
  } catch (error) {
    console.error(`[Bíblia Digital] Erro na API:`, error);
    return null;
  }
}

/**
 * Mapear nome do livro para formato da API
 */
function mapearNomeLivro(livro: string): string {
  const mapa: Record<string, string> = {
    'Mateus': 'mt',
    'Marcos': 'mk',
    'Lucas': 'lk',
    'João': 'jn',
    'Atos': 'ac',
    'Romanos': 'rm',
    '1 Coríntios': '1co',
    '2 Coríntios': '2co',
    'Gálatas': 'gl',
    'Efésios': 'ef',
    'Filipenses': 'fp',
    'Colossenses': 'cl',
    '1 Tessalonicenses': '1ts',
    '2 Tessalonicenses': '2ts',
    '1 Timóteo': '1tm',
    '2 Timóteo': '2tm',
    'Tito': 'tt',
    'Filemom': 'fm',
    'Hebreus': 'hb',
    'Tiago': 'tg',
    '1 Pedro': '1pe',
    '2 Pedro': '2pe',
    '1 João': '1jo',
    '2 João': '2jo',
    '3 João': '3jo',
    'Judas': 'jd',
    'Apocalipse': 'ap',
  };

  return mapa[livro] || livro.toLowerCase();
}

/**
 * Sincronizar todos os 260 capítulos do Novo Testamento com backoff exponencial
 */
export async function sincronizarTodoNT(
  versao: 'NAA' | 'NVI' = 'NAA',
  onProgress?: (total: number, processados: number, sincronizados: number) => void
): Promise<number> {
  let sincronizados = 0;
  let processados = 0;
  let total = 0;

  // Calcular total de capítulos
  for (const livroInfo of SEQUENCIA_NT) {
    total += livroInfo.capitulos;
  }

  try {
    let delayMs = 100; // Delay inicial
    const maxDelayMs = 1000; // Delay máximo

    for (const livroInfo of SEQUENCIA_NT) {
      for (let cap = 1; cap <= livroInfo.capitulos; cap++) {
        try {
          const capitulo = await buscarCapitulo(livroInfo.livro, cap, versao);
          if (capitulo) {
            sincronizados++;
          }
        } catch (err) {
          console.warn(`Erro ao sincronizar ${livroInfo.livro} ${cap}:`, err);
        }

        processados++;
        onProgress?.(total, processados, sincronizados);

        // Delay adaptativo para não sobrecarregar a API
        await new Promise((resolve) => setTimeout(resolve, delayMs));

        // Aumentar delay se muitas falhas (backoff exponencial)
        if (processados % 10 === 0 && sincronizados < processados * 0.5) {
          delayMs = Math.min(delayMs * 1.5, maxDelayMs);
          console.log(`[Bíblia Digital] Taxa de sucesso baixa, aumentando delay para ${delayMs}ms`);
        }
      }
    }

    // Salvar timestamp de sincronização
    await AsyncStorage.setItem(CACHE_TIMESTAMP_KEY, new Date().toISOString());
    await AsyncStorage.setItem(CACHE_INDEX_KEY, JSON.stringify({ versao, sincronizados, total }));

    console.log(`[Bíblia Digital] Sincronização concluída: ${sincronizados}/${total} capítulos`);
    return sincronizados;
  } catch (error) {
    console.error('[Bíblia Digital] Erro na sincronização:', error);
    return sincronizados;
  }
}

/**
 * Obter estatísticas de cache
 */
export async function obterEstatisticasCache(): Promise<{
  sincronizados: number;
  total: number;
  versao: string;
  ultimaSincronizacao: string | null;
}> {
  try {
    const indexStr = await AsyncStorage.getItem(CACHE_INDEX_KEY);
    const timestamp = await AsyncStorage.getItem(CACHE_TIMESTAMP_KEY);

    if (indexStr) {
      const index = JSON.parse(indexStr);
      return {
        sincronizados: index.sincronizados || 0,
        total: index.total || 260,
        versao: index.versao || 'NAA',
        ultimaSincronizacao: timestamp || null,
      };
    }

    return {
      sincronizados: 0,
      total: 260,
      versao: 'NAA',
      ultimaSincronizacao: null,
    };
  } catch (error) {
    console.error('[Bíblia Digital] Erro ao obter estatísticas:', error);
    return {
      sincronizados: 0,
      total: 260,
      versao: 'NAA',
      ultimaSincronizacao: null,
    };
  }
}

/**
 * Limpar cache de bíblia
 */
export async function limparCacheBiblia(): Promise<void> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const bibliaKeys = allKeys.filter((key) => key.startsWith(CACHE_KEY_PREFIX));

    await AsyncStorage.multiRemove([...bibliaKeys, CACHE_INDEX_KEY, CACHE_TIMESTAMP_KEY]);

    console.log(`[Bíblia Digital] ${bibliaKeys.length} itens removidos do cache`);
  } catch (error) {
    console.error('[Bíblia Digital] Erro ao limpar cache:', error);
  }
}

/**
 * Calcular tamanho do cache
 */
export async function calcularTamanhoCache(): Promise<number> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const bibliaKeys = allKeys.filter((key) => key.startsWith(CACHE_KEY_PREFIX));

    let tamanho = 0;
    for (const key of bibliaKeys) {
      const item = await AsyncStorage.getItem(key);
      if (item) {
        tamanho += item.length;
      }
    }

    return tamanho;
  } catch (error) {
    console.error('[Bíblia Digital] Erro ao calcular tamanho:', error);
    return 0;
  }
}
