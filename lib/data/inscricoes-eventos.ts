import AsyncStorage from '@react-native-async-storage/async-storage';

export interface InscricaoEvento {
  id: string;
  eventoId: string;
  eventoTitulo: string;
  eventoData: string;
  nomeCompleto: string;
  celula: string;
  telefone: string;
  createdAt: string;
}

const INSCRICOES_KEY = '@inscricoes_eventos';

// Categorias que permitem inscrição
export const CATEGORIAS_COM_INSCRICAO = ['evento-especial', 'retiro', 'conferencia'];

export function eventoPermiteInscricao(categoria: string): boolean {
  return CATEGORIAS_COM_INSCRICAO.includes(categoria);
}

// ==================== LEITURA ====================

export async function getInscricoesEventos(): Promise<InscricaoEvento[]> {
  try {
    const data = await AsyncStorage.getItem(INSCRICOES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function getInscricoesPorEvento(eventoId: string): Promise<InscricaoEvento[]> {
  const todas = await getInscricoesEventos();
  return todas.filter(i => i.eventoId === eventoId);
}

export async function getInscricoesPorCelula(celulaNome: string): Promise<InscricaoEvento[]> {
  const todas = await getInscricoesEventos();
  return todas.filter(i => i.celula === celulaNome);
}

export async function getInscricoesPorEventoECelula(eventoId: string, celulaNome: string): Promise<InscricaoEvento[]> {
  const todas = await getInscricoesEventos();
  return todas.filter(i => i.eventoId === eventoId && i.celula === celulaNome);
}

export async function verificarInscricao(eventoId: string, nomeCompleto: string): Promise<boolean> {
  const todas = await getInscricoesEventos();
  return todas.some(i => i.eventoId === eventoId && i.nomeCompleto.toLowerCase() === nomeCompleto.toLowerCase());
}

// ==================== CRIAÇÃO ====================

export async function criarInscricao(dados: Omit<InscricaoEvento, 'id' | 'createdAt'>): Promise<InscricaoEvento> {
  const todas = await getInscricoesEventos();
  const nova: InscricaoEvento = {
    ...dados,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  todas.push(nova);
  await AsyncStorage.setItem(INSCRICOES_KEY, JSON.stringify(todas));
  return nova;
}

// ==================== REMOÇÃO ====================

export async function removerInscricao(id: string): Promise<boolean> {
  const todas = await getInscricoesEventos();
  const filtradas = todas.filter(i => i.id !== id);
  if (filtradas.length === todas.length) return false;
  await AsyncStorage.setItem(INSCRICOES_KEY, JSON.stringify(filtradas));
  return true;
}

// ==================== ESTATÍSTICAS ====================

export async function getEstatisticasInscricoes() {
  const todas = await getInscricoesEventos();

  // Agrupar por evento
  const porEvento: Record<string, { titulo: string; data: string; total: number }> = {};
  todas.forEach(i => {
    if (!porEvento[i.eventoId]) {
      porEvento[i.eventoId] = { titulo: i.eventoTitulo, data: i.eventoData, total: 0 };
    }
    porEvento[i.eventoId].total++;
  });

  // Agrupar por célula
  const porCelula: Record<string, number> = {};
  todas.forEach(i => {
    porCelula[i.celula] = (porCelula[i.celula] || 0) + 1;
  });

  return {
    total: todas.length,
    porEvento: Object.entries(porEvento).map(([id, dados]) => ({ eventoId: id, ...dados })),
    porCelula: Object.entries(porCelula).map(([celula, total]) => ({ celula, total })),
  };
}
