import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { syncService } from '@/lib/services/sync-service';

const API_URL = (typeof __DEV__ !== 'undefined' && __DEV__) ? 'http://127.0.0.1:3000/api/trpc' : 'https://api.example.com/trpc';

export interface Celula {
  id: string;
  name: string;
  leader: {
    name: string;
    phone: string;
  };
  schedule: {
    day: string;
    time: string;
  };
  address: {
    street: string;
    neighborhood: string;
    city: string;
  };
  description: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Tipo do banco de dados
interface CelulaDB {
  id: number;
  nome: string;
  lider: string;
  telefone: string;
  endereco: string;
  latitude: string;
  longitude: string;
  diaReuniao: string;
  horario: string;
  createdAt: Date;
  updatedAt: Date;
}

const CELULAS_KEY = '@celulas';

// ==================== ADAPTADORES ====================

function dbToFrontend(celula: CelulaDB): Celula {
  return {
    id: celula.id.toString(),
    name: celula.nome,
    leader: {
      name: celula.lider,
      phone: celula.telefone,
    },
    schedule: {
      day: celula.diaReuniao,
      time: celula.horario,
    },
    address: {
      street: celula.endereco,
      neighborhood: '',
      city: 'Rondonópolis - MT',
    },
    description: '',
    coordinates: {
      latitude: parseFloat(celula.latitude) || 0,
      longitude: parseFloat(celula.longitude) || 0,
    },
  };
}

// ==================== LEITURA ====================

export async function getCelulas(): Promise<Celula[]> {
  try {
    const data = await AsyncStorage.getItem(CELULAS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function getCelulaById(id: string): Promise<Celula | null> {
  const todas = await getCelulas();
  return todas.find(c => c.id === id) || null;
}

// ==================== CRIAÇÃO ====================

export async function criarCelula(dados: Omit<Celula, 'id'>): Promise<Celula> {
  // Sincronizar com servidor PRIMEIRO
  try {
    const response = await axios.post(`${API_URL}/celulas.create`, {
      nome: dados.name,
      lider: dados.leader.name,
      telefone: dados.leader.phone,
      endereco: dados.address.street,
      latitude: dados.coordinates?.latitude.toString() || '0',
      longitude: dados.coordinates?.longitude.toString() || '0',
      diaReuniao: dados.schedule.day,
      horario: dados.schedule.time,
    });
    
    const insertId = response.data.result.data;
    
    const nova: Celula = {
      ...dados,
      id: insertId.toString(),
    };
    
    // Salvar localmente
    const todas = await getCelulas();
    todas.push(nova);
    await AsyncStorage.setItem(CELULAS_KEY, JSON.stringify(todas));
    
    // Forçar sincronização
    await syncService.forceSync();
    
    return nova;
  } catch (error) {
    console.error('[Células] Erro ao criar no servidor:', error);
    
    // Fallback: salvar apenas localmente
    const nova: Celula = {
      ...dados,
      id: `local_${Date.now()}`,
    };
    
    const todas = await getCelulas();
    todas.push(nova);
    await AsyncStorage.setItem(CELULAS_KEY, JSON.stringify(todas));
    
    return nova;
  }
}

// ==================== EDIÇÃO ====================

export async function editarCelula(id: string, dados: Partial<Omit<Celula, 'id'>>): Promise<Celula | null> {
  const todas = await getCelulas();
  const index = todas.findIndex(c => c.id === id);
  if (index < 0) return null;

  // Merge profundo para objetos aninhados
  const atual = todas[index];
  todas[index] = {
    ...atual,
    ...dados,
    leader: { ...atual.leader, ...(dados.leader || {}) },
    schedule: { ...atual.schedule, ...(dados.schedule || {}) },
    address: { ...atual.address, ...(dados.address || {}) },
  };
  await AsyncStorage.setItem(CELULAS_KEY, JSON.stringify(todas));
  
  // Sincronizar com servidor
  try {
    const celula = todas[index];
    await axios.post(`${API_URL}/celulas.update`, {
      id: parseInt(id),
      data: {
        nome: celula.name,
        lider: celula.leader.name,
        telefone: celula.leader.phone,
        endereco: celula.address.street,
        latitude: celula.coordinates?.latitude.toString() || '0',
        longitude: celula.coordinates?.longitude.toString() || '0',
        diaReuniao: celula.schedule.day,
        horario: celula.schedule.time,
      },
    });
    
    await syncService.forceSync();
  } catch (error) {
    console.error('[Células] Erro ao editar no servidor:', error);
  }
  
  return todas[index];
}

// ==================== REMOÇÃO ====================

export async function removerCelula(id: string): Promise<boolean> {
  const todas = await getCelulas();
  const filtradas = todas.filter(c => c.id !== id);
  if (filtradas.length === todas.length) return false;
  await AsyncStorage.setItem(CELULAS_KEY, JSON.stringify(filtradas));
  
  // Sincronizar com servidor
  try {
    await axios.post(`${API_URL}/celulas.delete`, parseInt(id));
    await syncService.forceSync();
  } catch (error) {
    console.error('[Células] Erro ao remover no servidor:', error);
  }
  
  return true;
}

// ==================== SINCRONIZAÇÃO ====================

export async function syncCelulasFromServer(celulasDB: CelulaDB[]): Promise<void> {
  const celulas = celulasDB.map(dbToFrontend);
  await AsyncStorage.setItem(CELULAS_KEY, JSON.stringify(celulas));
}

// Compatibilidade
export const mockCelulas: Celula[] = [];
