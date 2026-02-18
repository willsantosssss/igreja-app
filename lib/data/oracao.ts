import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { syncService } from '@/lib/services/sync-service';

const API_URL = (typeof __DEV__ !== 'undefined' && __DEV__) ? 'http://127.0.0.1:3000/api/trpc' : 'https://api.example.com/trpc';

export type PrayerCategory = "saude" | "familia" | "trabalho" | "espiritual" | "outros";

export interface PrayerRequest {
  id: string;
  title: string;
  description: string;
  category: PrayerCategory;
  author: string;
  date: string;
  prayingCount: number;
  isAnswered: boolean;
  testimony?: string;
}

// Tipo do banco de dados
interface PedidoOracaoDB {
  id: number;
  nome: string;
  descricao: string;
  categoria: string;
  contadorOrando: number;
  createdAt: Date;
  updatedAt: Date;
}

export const categoryLabels: Record<PrayerCategory, string> = {
  saude: "Saúde",
  familia: "Família",
  trabalho: "Trabalho",
  espiritual: "Espiritual",
  outros: "Outros",
};

export const categoryEmojis: Record<PrayerCategory, string> = {
  saude: "🏥",
  familia: "👨‍👩‍👧‍👦",
  trabalho: "💼",
  espiritual: "✨",
  outros: "🙏",
};

const PEDIDOS_KEY = '@pedidos_oracao';

// ==================== ADAPTADORES ====================

/**
 * Converte pedido do banco de dados para formato do frontend
 */
function dbToFrontend(pedido: PedidoOracaoDB): PrayerRequest {
  // Extrair título e descrição
  const linhas = pedido.descricao.split('\n\n');
  const title = linhas[0] || pedido.descricao.substring(0, 50);
  const description = linhas.slice(1).join('\n\n') || pedido.descricao;
  
  return {
    id: pedido.id.toString(),
    title,
    description,
    category: (pedido.categoria as PrayerCategory) || 'outros',
    author: pedido.nome,
    date: new Date(pedido.createdAt).toISOString().split('T')[0],
    prayingCount: pedido.contadorOrando,
    isAnswered: false,
  };
}

// ==================== LEITURA ====================

export async function getPedidosOracao(): Promise<PrayerRequest[]> {
  try {
    const data = await AsyncStorage.getItem(PEDIDOS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function getPedidoById(id: string): Promise<PrayerRequest | null> {
  const todos = await getPedidosOracao();
  return todos.find(p => p.id === id) || null;
}

// ==================== CRIAÇÃO ====================

export async function criarPedido(dados: Omit<PrayerRequest, 'id' | 'prayingCount' | 'isAnswered'>): Promise<PrayerRequest> {
  // Sincronizar com servidor PRIMEIRO para obter ID real
  try {
    const response = await axios.post(`${API_URL}/oracao.create`, {
      nome: dados.author,
      descricao: `${dados.title}\n\n${dados.description}`,
      categoria: dados.category,
    });
    
    const insertId = response.data.result.data;
    
    const novo: PrayerRequest = {
      ...dados,
      id: insertId.toString(),
      prayingCount: 0,
      isAnswered: false,
    };
    
    // Salvar localmente
    const todos = await getPedidosOracao();
    todos.push(novo);
    await AsyncStorage.setItem(PEDIDOS_KEY, JSON.stringify(todos));
    
    // Forçar sincronização imediata para outros dispositivos
    await syncService.forceSync();
    
    return novo;
  } catch (error) {
    console.error('[Oração] Erro ao criar pedido no servidor:', error);
    
    // Fallback: salvar apenas localmente
    const novo: PrayerRequest = {
      ...dados,
      id: `local_${Date.now()}`,
      prayingCount: 0,
      isAnswered: false,
    };
    
    const todos = await getPedidosOracao();
    todos.push(novo);
    await AsyncStorage.setItem(PEDIDOS_KEY, JSON.stringify(todos));
    
    return novo;
  }
}

// ==================== EDIÇÃO ====================

export async function editarPedido(id: string, dados: Partial<PrayerRequest>): Promise<PrayerRequest | null> {
  const todos = await getPedidosOracao();
  const index = todos.findIndex(p => p.id === id);
  if (index < 0) return null;
  
  todos[index] = { ...todos[index], ...dados };
  await AsyncStorage.setItem(PEDIDOS_KEY, JSON.stringify(todos));
  
  // Sincronizar com servidor
  try {
    const pedido = todos[index];
    await axios.post(`${API_URL}/oracao.update`, {
      id: parseInt(id),
      data: {
        nome: pedido.author,
        descricao: `${pedido.title}\n\n${pedido.description}`,
        categoria: pedido.category,
      },
    });
    
    await syncService.forceSync();
  } catch (error) {
    console.error('[Oração] Erro ao editar pedido no servidor:', error);
  }
  
  return todos[index];
}

export async function marcarRespondido(id: string, testimony?: string): Promise<boolean> {
  const todos = await getPedidosOracao();
  const index = todos.findIndex(p => p.id === id);
  if (index < 0) return false;
  todos[index].isAnswered = true;
  if (testimony) todos[index].testimony = testimony;
  await AsyncStorage.setItem(PEDIDOS_KEY, JSON.stringify(todos));
  return true;
}

export async function incrementarContador(id: string): Promise<void> {
  const todos = await getPedidosOracao();
  const index = todos.findIndex(p => p.id === id);
  if (index >= 0) {
    todos[index].prayingCount++;
    await AsyncStorage.setItem(PEDIDOS_KEY, JSON.stringify(todos));
  }
  
  // Sincronizar com servidor
  try {
    await axios.post(`${API_URL}/oracao.incrementarContador`, parseInt(id));
    await syncService.forceSync();
  } catch (error) {
    console.error('[Oração] Erro ao incrementar contador no servidor:', error);
  }
}

// ==================== REMOÇÃO ====================

export async function removerPedido(id: string): Promise<boolean> {
  const todos = await getPedidosOracao();
  const filtrados = todos.filter(p => p.id !== id);
  if (filtrados.length === todos.length) return false;
  await AsyncStorage.setItem(PEDIDOS_KEY, JSON.stringify(filtrados));
  
  // Sincronizar com servidor
  try {
    await axios.post(`${API_URL}/oracao.delete`, parseInt(id));
    await syncService.forceSync();
  } catch (error) {
    console.error('[Oração] Erro ao remover pedido no servidor:', error);
  }
  
  return true;
}

// ==================== SINCRONIZAÇÃO ====================

/**
 * Atualiza cache local com dados do servidor
 * Chamado pelo syncService
 */
export async function syncPedidosFromServer(pedidosDB: PedidoOracaoDB[]): Promise<void> {
  const pedidos = pedidosDB.map(dbToFrontend);
  await AsyncStorage.setItem(PEDIDOS_KEY, JSON.stringify(pedidos));
}

// Compatibilidade
export const mockPrayerRequests: PrayerRequest[] = [];
