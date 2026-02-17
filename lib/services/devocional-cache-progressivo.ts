import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCapituloByIndex, sequenciaNovoTestamento } from '@/lib/data/sequencia-nt';
import { buscarTextoLocal } from '../data/textos-nt-fallback';

/**
 * Serviço de Cache Progressivo para Devocional
 * Baixa 1 capítulo/dia via API com fallback offline
 */

const CACHE_KEY_PREFIX = '@devocional_cache_';
const CACHE_TIMESTAMP_KEY = '@devocional_cache_timestamp_';
const CACHE_METADATA_KEY = '@devocional_cache_metadata';

export interface CapituloDevocional {
  livro: string;
  numero: number;
  versos: VersoDevocional[];
  versao: 'NAA' | 'NVI';
  dataCarregamento?: string;
}

export interface VersoDevocional {
  numero: number;
  texto: string;
}

/**
 * Obter capítulo do dia (hoje)
 */
export function getCapituloDoDia(): { livro: string; numero: number } {
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const primeiroDeJaneiro = new Date(anoAtual, 0, 1);
  const umDia = 24 * 60 * 60 * 1000;
  const indiceHoje = Math.floor((hoje.getTime() - primeiroDeJaneiro.getTime()) / umDia);

  const indexeCorreto = Math.min(indiceHoje, sequenciaNovoTestamento.length - 1);
  const cap = getCapituloByIndex(indexeCorreto);
  return {
    livro: cap.livro,
    numero: cap.capitulo,
  };
}

/**
 * Buscar capítulo com cache progressivo
 * Tenta: Cache → API → Texto Local → Fallback
 */
export async function buscarCapituloComCache(
  livro: string,
  numero: number,
  versao: 'NAA' | 'NVI' = 'NAA'
): Promise<CapituloDevocional | null> {
  const cacheKey = `${CACHE_KEY_PREFIX}${livro}_${numero}_${versao}`;

  try {
    // 1. Tentar buscar do cache local
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      console.log(`[Cache Progressivo] Capítulo ${livro} ${numero} carregado do cache`);
      return JSON.parse(cached);
    }

    // 2. Tentar buscar da API
    console.log(`[Cache Progressivo] Buscando ${livro} ${numero} da API...`);
    const capitulo = await buscarDaAPI(livro, numero, versao);

    if (capitulo) {
      // Salvar no cache
      await AsyncStorage.setItem(cacheKey, JSON.stringify(capitulo));
      await AsyncStorage.setItem(CACHE_TIMESTAMP_KEY + cacheKey, new Date().toISOString());

      console.log(`[Cache Progressivo] ${livro} ${numero} salvo no cache`);
      return capitulo;
    }

    // 3. Se falhar, tentar fallback (texto local)
    console.warn(`[Cache Progressivo] Falha ao buscar ${livro} ${numero}, tentando fallback...`);
    return await buscarFallback(livro, numero, versao);
  } catch (error) {
    console.error(`[Cache Progressivo] Erro ao buscar ${livro} ${numero}:`, error);
    return await buscarFallback(livro, numero, versao);
  }
}

/**
 * Buscar capítulo da API (usando endpoint simples)
 */
async function buscarDaAPI(
  livro: string,
  numero: number,
  versao: 'NAA' | 'NVI'
): Promise<CapituloDevocional | null> {
  try {
    // Usar endpoint simples que não requer autenticação
    // Exemplo: https://www.abibliadigital.com.br/api/verses/naa/jn/1
    const livroAbrev = mapearNomeLivro(livro);
    const versaoAbrev = versao === 'NAA' ? 'naa' : 'nvi';

    const url = `https://www.abibliadigital.com.br/api/verses/${versaoAbrev}/${livroAbrev}/${numero}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`[Cache Progressivo] API retornou ${response.status} para ${livro} ${numero}`);
      return null;
    }

    const data = await response.json();

    if (data && data.verses && Array.isArray(data.verses)) {
      const versos: VersoDevocional[] = data.verses.map((v: any) => ({
        numero: v.number || v.verse || 0,
        texto: v.text || v.content || '',
      }));

      return {
        livro,
        numero,
        versos,
        versao,
        dataCarregamento: new Date().toISOString(),
      };
    }

    return null;
  } catch (error) {
    console.error(`[Cache Progressivo] Erro na API:`, error);
    return null;
  }
}

/**
 * Fallback: Retornar capítulo com texto local ou mensagem
 */
async function buscarFallback(
  livro: string,
  numero: number,
  versao: 'NAA' | 'NVI'
): Promise<CapituloDevocional | null> {
  try {
    // 1. Tentar buscar do cache mesmo que antigo
    const allKeys = await AsyncStorage.getAllKeys();
    const livroKeys = allKeys.filter((k) => k.includes(livro) && k.startsWith(CACHE_KEY_PREFIX));

    if (livroKeys.length > 0) {
      const fallbackKey = livroKeys[0];
      const cached = await AsyncStorage.getItem(fallbackKey);
      if (cached) {
        console.log(`[Cache Progressivo] Usando fallback de capítulo anterior`);
        return JSON.parse(cached);
      }
    }

    // 2. Tentar buscar texto local pré-carregado
    const textoLocal = buscarTextoLocal(livro, numero);
    if (textoLocal) {
      console.log(`[Cache Progressivo] Usando texto local para ${livro} ${numero}`);
      return {
        livro,
        numero,
        versos: textoLocal.versos,
        versao,
        dataCarregamento: new Date().toISOString(),
      };
    }

    // 3. Retornar capítulo com mensagem de indisponibilidade
    console.warn(`[Cache Progressivo] Capítulo ${livro} ${numero} não encontrado em nenhuma fonte`);
    return {
      livro,
      numero,
      versos: [
        {
          numero: 1,
          texto: `${livro} ${numero}\n\nCapítulo indisponível. Verifique sua conexão com a internet e tente novamente.`,
        },
      ],
      versao,
      dataCarregamento: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`[Cache Progressivo] Erro no fallback:`, error);
    return null;
  }
}

/**
 * Mapear nome do livro para abreviação
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
 * Obter estatísticas de cache
 */
export async function obterEstatisticasCache(): Promise<{
  capitulosCacheados: number;
  ultimoCapituloCarregado: string | null;
}> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter((k) => k.startsWith(CACHE_KEY_PREFIX));

    let ultimoCapitulo: string | null = null;
    let ultimoTimestamp = 0;

    for (const key of cacheKeys) {
      const timestampKey = CACHE_TIMESTAMP_KEY + key;
      const timestamp = await AsyncStorage.getItem(timestampKey);
      if (timestamp) {
        const ts = new Date(timestamp).getTime();
        if (ts > ultimoTimestamp) {
          ultimoTimestamp = ts;
          ultimoCapitulo = key.replace(CACHE_KEY_PREFIX, '');
        }
      }
    }

    return {
      capitulosCacheados: cacheKeys.length,
      ultimoCapituloCarregado: ultimoCapitulo,
    };
  } catch (error) {
    console.error('[Cache Progressivo] Erro ao obter estatísticas:', error);
    return {
      capitulosCacheados: 0,
      ultimoCapituloCarregado: null,
    };
  }
}

/**
 * Limpar cache
 */
export async function limparCache(): Promise<void> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter(
      (k) => k.startsWith(CACHE_KEY_PREFIX) || k.startsWith(CACHE_TIMESTAMP_KEY)
    );

    await AsyncStorage.multiRemove(cacheKeys);
    console.log(`[Cache Progressivo] ${cacheKeys.length} itens removidos do cache`);
  } catch (error) {
    console.error('[Cache Progressivo] Erro ao limpar cache:', error);
  }
}

/**
 * Calcular tamanho do cache
 */
export async function calcularTamanhoCache(): Promise<number> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter((k) => k.startsWith(CACHE_KEY_PREFIX));

    let tamanho = 0;
    for (const key of cacheKeys) {
      const item = await AsyncStorage.getItem(key);
      if (item) {
        tamanho += item.length;
      }
    }

    return tamanho;
  } catch (error) {
    console.error('[Cache Progressivo] Erro ao calcular tamanho:', error);
    return 0;
  }
}
