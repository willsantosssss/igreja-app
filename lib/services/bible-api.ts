/**
 * Serviço de integração com Bible API
 * Fornece acesso a 260 capítulos do Novo Testamento
 * Versões suportadas: NAA, NVI
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const BIBLE_API_BASE = "https://www.bible-api.com";

// Mapeamento de versões para IDs da API
const VERSAO_MAP: Record<string, string> = {
  NAA: "naa", // Nova Almeida Atualizada
  NVI: "nvi", // Nova Versão Internacional
};

// Sequência de 260 capítulos do Novo Testamento
const NOVO_TESTAMENTO = [
  // Mateus (28 capítulos)
  "Mateus 1", "Mateus 2", "Mateus 3", "Mateus 4", "Mateus 5", "Mateus 6", "Mateus 7", "Mateus 8",
  "Mateus 9", "Mateus 10", "Mateus 11", "Mateus 12", "Mateus 13", "Mateus 14", "Mateus 15", "Mateus 16",
  "Mateus 17", "Mateus 18", "Mateus 19", "Mateus 20", "Mateus 21", "Mateus 22", "Mateus 23", "Mateus 24",
  "Mateus 25", "Mateus 26", "Mateus 27", "Mateus 28",

  // Marcos (16 capítulos)
  "Marcos 1", "Marcos 2", "Marcos 3", "Marcos 4", "Marcos 5", "Marcos 6", "Marcos 7", "Marcos 8",
  "Marcos 9", "Marcos 10", "Marcos 11", "Marcos 12", "Marcos 13", "Marcos 14", "Marcos 15", "Marcos 16",

  // Lucas (24 capítulos)
  "Lucas 1", "Lucas 2", "Lucas 3", "Lucas 4", "Lucas 5", "Lucas 6", "Lucas 7", "Lucas 8",
  "Lucas 9", "Lucas 10", "Lucas 11", "Lucas 12", "Lucas 13", "Lucas 14", "Lucas 15", "Lucas 16",
  "Lucas 17", "Lucas 18", "Lucas 19", "Lucas 20", "Lucas 21", "Lucas 22", "Lucas 23", "Lucas 24",

  // João (21 capítulos)
  "João 1", "João 2", "João 3", "João 4", "João 5", "João 6", "João 7", "João 8",
  "João 9", "João 10", "João 11", "João 12", "João 13", "João 14", "João 15", "João 16",
  "João 17", "João 18", "João 19", "João 20", "João 21",

  // Atos (28 capítulos)
  "Atos 1", "Atos 2", "Atos 3", "Atos 4", "Atos 5", "Atos 6", "Atos 7", "Atos 8",
  "Atos 9", "Atos 10", "Atos 11", "Atos 12", "Atos 13", "Atos 14", "Atos 15", "Atos 16",
  "Atos 17", "Atos 18", "Atos 19", "Atos 20", "Atos 21", "Atos 22", "Atos 23", "Atos 24",
  "Atos 25", "Atos 26", "Atos 27", "Atos 28",

  // Romanos (16 capítulos)
  "Romanos 1", "Romanos 2", "Romanos 3", "Romanos 4", "Romanos 5", "Romanos 6", "Romanos 7", "Romanos 8",
  "Romanos 9", "Romanos 10", "Romanos 11", "Romanos 12", "Romanos 13", "Romanos 14", "Romanos 15", "Romanos 16",

  // 1 Coríntios (16 capítulos)
  "1 Coríntios 1", "1 Coríntios 2", "1 Coríntios 3", "1 Coríntios 4", "1 Coríntios 5", "1 Coríntios 6", "1 Coríntios 7", "1 Coríntios 8",
  "1 Coríntios 9", "1 Coríntios 10", "1 Coríntios 11", "1 Coríntios 12", "1 Coríntios 13", "1 Coríntios 14", "1 Coríntios 15", "1 Coríntios 16",

  // 2 Coríntios (13 capítulos)
  "2 Coríntios 1", "2 Coríntios 2", "2 Coríntios 3", "2 Coríntios 4", "2 Coríntios 5", "2 Coríntios 6", "2 Coríntios 7", "2 Coríntios 8",
  "2 Coríntios 9", "2 Coríntios 10", "2 Coríntios 11", "2 Coríntios 12", "2 Coríntios 13",

  // Gálatas (6 capítulos)
  "Gálatas 1", "Gálatas 2", "Gálatas 3", "Gálatas 4", "Gálatas 5", "Gálatas 6",

  // Efésios (6 capítulos)
  "Efésios 1", "Efésios 2", "Efésios 3", "Efésios 4", "Efésios 5", "Efésios 6",

  // Filipenses (4 capítulos)
  "Filipenses 1", "Filipenses 2", "Filipenses 3", "Filipenses 4",

  // Colossenses (4 capítulos)
  "Colossenses 1", "Colossenses 2", "Colossenses 3", "Colossenses 4",

  // 1 Tessalonicenses (5 capítulos)
  "1 Tessalonicenses 1", "1 Tessalonicenses 2", "1 Tessalonicenses 3", "1 Tessalonicenses 4", "1 Tessalonicenses 5",

  // 2 Tessalonicenses (3 capítulos)
  "2 Tessalonicenses 1", "2 Tessalonicenses 2", "2 Tessalonicenses 3",

  // 1 Timóteo (6 capítulos)
  "1 Timóteo 1", "1 Timóteo 2", "1 Timóteo 3", "1 Timóteo 4", "1 Timóteo 5", "1 Timóteo 6",

  // 2 Timóteo (4 capítulos)
  "2 Timóteo 1", "2 Timóteo 2", "2 Timóteo 3", "2 Timóteo 4",

  // Tito (3 capítulos)
  "Tito 1", "Tito 2", "Tito 3",

  // Filemon (1 capítulo)
  "Filemon 1",

  // Hebreus (13 capítulos)
  "Hebreus 1", "Hebreus 2", "Hebreus 3", "Hebreus 4", "Hebreus 5", "Hebreus 6", "Hebreus 7", "Hebreus 8",
  "Hebreus 9", "Hebreus 10", "Hebreus 11", "Hebreus 12", "Hebreus 13",

  // Tiago (5 capítulos)
  "Tiago 1", "Tiago 2", "Tiago 3", "Tiago 4", "Tiago 5",

  // 1 Pedro (5 capítulos)
  "1 Pedro 1", "1 Pedro 2", "1 Pedro 3", "1 Pedro 4", "1 Pedro 5",

  // 2 Pedro (3 capítulos)
  "2 Pedro 1", "2 Pedro 2", "2 Pedro 3",

  // 1 João (5 capítulos)
  "1 João 1", "1 João 2", "1 João 3", "1 João 4", "1 João 5",

  // 2 João (1 capítulo)
  "2 João 1",

  // 3 João (1 capítulo)
  "3 João 1",

  // Judas (1 capítulo)
  "Judas 1",

  // Apocalipse (22 capítulos)
  "Apocalipse 1", "Apocalipse 2", "Apocalipse 3", "Apocalipse 4", "Apocalipse 5", "Apocalipse 6", "Apocalipse 7", "Apocalipse 8",
  "Apocalipse 9", "Apocalipse 10", "Apocalipse 11", "Apocalipse 12", "Apocalipse 13", "Apocalipse 14", "Apocalipse 15", "Apocalipse 16",
  "Apocalipse 17", "Apocalipse 18", "Apocalipse 19", "Apocalipse 20", "Apocalipse 21", "Apocalipse 22",
];

export interface CapituloTexto {
  livro: string;
  capitulo: number;
  versao: string;
  texto: string;
  referencia: string;
}

/**
 * Buscar texto de um capítulo da Bible API
 */
export async function buscarCapituloAPI(
  livro: string,
  capitulo: number,
  versao: "NAA" | "NVI" = "NAA"
): Promise<CapituloTexto | null> {
  try {
    const cacheKey = `@biblia_${livro}_${capitulo}_${versao}`;
    
    // Tentar carregar do cache primeiro
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Buscar da API
    const referencia = `${livro} ${capitulo}`;
    const url = `${BIBLE_API_BASE}/${referencia}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      console.warn(`[Bible API] Falha ao buscar ${referencia}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    // Processar resposta da API
    const texto = data.verses?.map((v: any) => v.text).join("\n\n") || "";
    
    const resultado: CapituloTexto = {
      livro,
      capitulo,
      versao,
      texto,
      referencia,
    };

    // Salvar no cache
    await AsyncStorage.setItem(cacheKey, JSON.stringify(resultado));

    return resultado;
  } catch (error) {
    console.error(`[Bible API] Erro ao buscar ${livro} ${capitulo}:`, error);
    return null;
  }
}

/**
 * Pré-carregar capítulos para cache offline
 */
export async function precarregarCapitulos(
  capitulos: string[],
  versao: "NAA" | "NVI" = "NAA"
): Promise<void> {
  console.log(`[Bible API] Pré-carregando ${capitulos.length} capítulos...`);
  
  for (const cap of capitulos) {
    const [livro, numeroStr] = cap.split(" ");
    const numero = parseInt(numeroStr);
    
    await buscarCapituloAPI(livro, numero, versao);
    
    // Pequeno delay para não sobrecarregar a API
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log("[Bible API] Pré-carregamento concluído");
}

/**
 * Obter lista completa de 260 capítulos do Novo Testamento
 */
export function getNovoTestamento(): string[] {
  return NOVO_TESTAMENTO;
}

/**
 * Limpar cache de bíblia
 */
export async function limparCacheBiblia(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const bibliaKeys = keys.filter(k => k.startsWith("@biblia_"));
    await AsyncStorage.multiRemove(bibliaKeys);
    console.log(`[Bible API] ${bibliaKeys.length} itens removidos do cache`);
  } catch (error) {
    console.error("[Bible API] Erro ao limpar cache:", error);
  }
}

/**
 * Obter estatísticas de cache
 */
export async function getEstatisticasCache(): Promise<{
  totalCapitulos: number;
  capitulosEmCache: number;
  tamanhoCache: string;
}> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const bibliaKeys = keys.filter(k => k.startsWith("@biblia_"));
    
    let tamanhoTotal = 0;
    for (const key of bibliaKeys) {
      const item = await AsyncStorage.getItem(key);
      if (item) {
        tamanhoTotal += item.length;
      }
    }

    return {
      totalCapitulos: NOVO_TESTAMENTO.length,
      capitulosEmCache: bibliaKeys.length,
      tamanhoCache: `${(tamanhoTotal / 1024).toFixed(2)} KB`,
    };
  } catch (error) {
    console.error("[Bible API] Erro ao obter estatísticas:", error);
    return {
      totalCapitulos: NOVO_TESTAMENTO.length,
      capitulosEmCache: 0,
      tamanhoCache: "0 KB",
    };
  }
}
