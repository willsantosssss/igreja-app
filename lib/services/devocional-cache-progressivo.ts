import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCapituloByIndex, sequenciaNovoTestamento } from '@/lib/data/sequencia-nt';

/**
 * Serviço de Cache Progressivo para Devocional
 * Usa a API bolls.life para buscar capítulos completos da Bíblia em português
 * Com cache local via AsyncStorage e fallback offline
 */

const CACHE_KEY_PREFIX = '@devocional_cache_';
const CACHE_TIMESTAMP_KEY = '@devocional_cache_timestamp_';

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
 * Mapeamento de nomes de livros para IDs da API bolls.life
 */
const LIVRO_PARA_ID: Record<string, number> = {
  'Mateus': 40,
  'Marcos': 41,
  'Lucas': 42,
  'João': 43,
  'Atos': 44,
  'Romanos': 45,
  '1 Coríntios': 46,
  '2 Coríntios': 47,
  'Gálatas': 48,
  'Efésios': 49,
  'Filipenses': 50,
  'Colossenses': 51,
  '1 Tessalonicenses': 52,
  '2 Tessalonicenses': 53,
  '1 Timóteo': 54,
  '2 Timóteo': 55,
  'Tito': 56,
  'Filemom': 57,
  'Hebreus': 58,
  'Tiago': 59,
  '1 Pedro': 60,
  '2 Pedro': 61,
  '1 João': 62,
  '2 João': 63,
  '3 João': 64,
  'Judas': 65,
  'Apocalipse': 66,
};

/**
 * Mapeamento de versão para slug da API bolls.life
 */
const VERSAO_PARA_SLUG: Record<string, string> = {
  'NAA': 'NAA',
  'NVI': 'NVIPT',
};

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
 * Remover tags HTML do texto retornado pela API
 */
function limparHTML(html: string): string {
  return html
    .replace(/<sup[^>]*>.*?<\/sup>/gi, '') // Remove notas de rodapé
    .replace(/<br\s*\/?>/gi, '\n') // Converte <br> em quebra de linha
    .replace(/<[^>]+>/g, '') // Remove todas as tags HTML restantes
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ') // Normaliza espaços
    .trim();
}

/**
 * Buscar capítulo com cache progressivo
 * Tenta: Cache → API bolls.life → Fallback
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
      const parsed = JSON.parse(cached) as CapituloDevocional;
      // Verificar se o cache tem mais de 2 versículos (cache antigo incompleto)
      if (parsed.versos && parsed.versos.length > 3) {
        console.log(`[Cache Progressivo] Capítulo ${livro} ${numero} carregado do cache (${parsed.versos.length} versículos)`);
        return parsed;
      }
      // Cache antigo com poucos versículos — buscar novamente
      console.log(`[Cache Progressivo] Cache antigo com apenas ${parsed.versos?.length} versículos, buscando novamente...`);
    }

    // 2. Tentar buscar da API bolls.life
    console.log(`[Cache Progressivo] Buscando ${livro} ${numero} da API bolls.life...`);
    const capitulo = await buscarDaAPIBolls(livro, numero, versao);

    if (capitulo && capitulo.versos.length > 0) {
      // Salvar no cache
      await AsyncStorage.setItem(cacheKey, JSON.stringify(capitulo));
      await AsyncStorage.setItem(CACHE_TIMESTAMP_KEY + cacheKey, new Date().toISOString());

      console.log(`[Cache Progressivo] ${livro} ${numero} salvo no cache (${capitulo.versos.length} versículos)`);
      return capitulo;
    }

    // 3. Tentar API antiga como fallback
    console.log(`[Cache Progressivo] Tentando API alternativa para ${livro} ${numero}...`);
    const capituloAlt = await buscarDaAPIAlternativa(livro, numero, versao);
    if (capituloAlt && capituloAlt.versos.length > 0) {
      await AsyncStorage.setItem(cacheKey, JSON.stringify(capituloAlt));
      return capituloAlt;
    }

    // 4. Se falhar, retornar mensagem de indisponibilidade
    console.warn(`[Cache Progressivo] Falha ao buscar ${livro} ${numero} de todas as fontes`);
    return {
      livro,
      numero,
      versos: [
        {
          numero: 1,
          texto: `Capítulo indisponível no momento. Verifique sua conexão com a internet e tente novamente puxando a tela para baixo.`,
        },
      ],
      versao,
      dataCarregamento: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`[Cache Progressivo] Erro ao buscar ${livro} ${numero}:`, error);
    return {
      livro,
      numero,
      versos: [
        {
          numero: 1,
          texto: `Erro ao carregar o capítulo. Verifique sua conexão com a internet e tente novamente.`,
        },
      ],
      versao,
      dataCarregamento: new Date().toISOString(),
    };
  }
}

/**
 * Buscar capítulo da API bolls.life (retorna capítulo COMPLETO)
 */
async function buscarDaAPIBolls(
  livro: string,
  numero: number,
  versao: 'NAA' | 'NVI'
): Promise<CapituloDevocional | null> {
  try {
    const bookId = LIVRO_PARA_ID[livro];
    if (!bookId) {
      console.warn(`[Cache Progressivo] Livro "${livro}" não encontrado no mapeamento`);
      return null;
    }

    const slug = VERSAO_PARA_SLUG[versao] || 'NAA';
    const url = `https://bolls.life/get-text/${slug}/${bookId}/${numero}/`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[Cache Progressivo] bolls.life retornou ${response.status} para ${livro} ${numero}`);
      return null;
    }

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      const versos: VersoDevocional[] = data.map((v: any) => ({
        numero: v.verse || 0,
        texto: limparHTML(v.text || ''),
      })).filter((v: VersoDevocional) => v.texto.length > 0);

      if (versos.length > 0) {
        return {
          livro,
          numero,
          versos,
          versao,
          dataCarregamento: new Date().toISOString(),
        };
      }
    }

    return null;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn(`[Cache Progressivo] Timeout ao buscar de bolls.life`);
    } else {
      console.error(`[Cache Progressivo] Erro na API bolls.life:`, error);
    }
    return null;
  }
}

/**
 * API alternativa: abibliadigital.com.br
 */
async function buscarDaAPIAlternativa(
  livro: string,
  numero: number,
  versao: 'NAA' | 'NVI'
): Promise<CapituloDevocional | null> {
  try {
    const mapaAbrev: Record<string, string> = {
      'Mateus': 'mt', 'Marcos': 'mk', 'Lucas': 'lk', 'João': 'jn',
      'Atos': 'ac', 'Romanos': 'rm', '1 Coríntios': '1co', '2 Coríntios': '2co',
      'Gálatas': 'gl', 'Efésios': 'ef', 'Filipenses': 'fp', 'Colossenses': 'cl',
      '1 Tessalonicenses': '1ts', '2 Tessalonicenses': '2ts', '1 Timóteo': '1tm',
      '2 Timóteo': '2tm', 'Tito': 'tt', 'Filemom': 'fm', 'Hebreus': 'hb',
      'Tiago': 'tg', '1 Pedro': '1pe', '2 Pedro': '2pe', '1 João': '1jo',
      '2 João': '2jo', '3 João': '3jo', 'Judas': 'jd', 'Apocalipse': 'ap',
    };

    const livroAbrev = mapaAbrev[livro];
    if (!livroAbrev) return null;

    const versaoAbrev = versao === 'NAA' ? 'naa' : 'nvi';
    const url = `https://www.abibliadigital.com.br/api/verses/${versaoAbrev}/${livroAbrev}/${numero}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = await response.json();

    if (data && data.verses && Array.isArray(data.verses)) {
      const versos: VersoDevocional[] = data.verses.map((v: any) => ({
        numero: v.number || v.verse || 0,
        texto: limparHTML(v.text || v.content || ''),
      }));

      if (versos.length > 0) {
        return {
          livro,
          numero,
          versos,
          versao,
          dataCarregamento: new Date().toISOString(),
        };
      }
    }

    return null;
  } catch (error) {
    console.error(`[Cache Progressivo] Erro na API alternativa:`, error);
    return null;
  }
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
 * Limpar cache (forçar re-download de todos os capítulos)
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
