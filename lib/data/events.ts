import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { syncService } from '@/lib/services/sync-service';

const API_URL = (typeof __DEV__ !== 'undefined' && __DEV__) ? 'http://127.0.0.1:3000/trpc' : 'https://api.example.com/trpc';

export type EventCategory = "culto" | "reuniao" | "evento-especial" | "retiro" | "conferencia";

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: EventCategory;
  imageUrl?: string;
}

// Tipo do banco de dados
interface EventoDB {
  id: number;
  titulo: string;
  descricao: string;
  data: string;
  horario: string;
  local: string;
  tipo: string;
  requireInscricao: number;
  createdAt: Date;
  updatedAt: Date;
}

const EVENTOS_KEY = '@eventos';

// ==================== ADAPTADORES ====================

function dbToFrontend(evento: EventoDB): Event {
  return {
    id: evento.id.toString(),
    title: evento.titulo,
    description: evento.descricao,
    date: evento.data,
    time: evento.horario,
    location: evento.local,
    category: (evento.tipo as EventCategory) || 'evento-especial',
  };
}

// ==================== LEITURA ====================

export async function getEventos(): Promise<Event[]> {
  try {
    const data = await AsyncStorage.getItem(EVENTOS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function getEventoById(id: string): Promise<Event | null> {
  const eventos = await getEventos();
  return eventos.find(e => e.id === id) || null;
}

// ==================== CRIAÇÃO ====================

export async function criarEvento(evento: Omit<Event, 'id'>): Promise<Event> {
  // Sincronizar com servidor PRIMEIRO
  try {
    const response = await axios.post(`${API_URL}/eventos.create`, {
      titulo: evento.title,
      descricao: evento.description,
      data: evento.date,
      horario: evento.time,
      local: evento.location,
      tipo: evento.category,
      requireInscricao: 0,
    });
    
    const insertId = response.data.result.data;
    
    const novoEvento: Event = {
      ...evento,
      id: insertId.toString(),
    };
    
    // Salvar localmente
    const eventos = await getEventos();
    eventos.push(novoEvento);
    await AsyncStorage.setItem(EVENTOS_KEY, JSON.stringify(eventos));
    
    // Forçar sincronização
    await syncService.forceSync();
    
    return novoEvento;
  } catch (error) {
    console.error('[Eventos] Erro ao criar no servidor:', error);
    
    // Fallback: salvar apenas localmente
    const novoEvento: Event = {
      ...evento,
      id: `local_${Date.now()}`,
    };
    
    const eventos = await getEventos();
    eventos.push(novoEvento);
    await AsyncStorage.setItem(EVENTOS_KEY, JSON.stringify(eventos));
    
    return novoEvento;
  }
}

// ==================== EDIÇÃO ====================

export async function editarEvento(id: string, dados: Partial<Omit<Event, 'id'>>): Promise<Event | null> {
  const eventos = await getEventos();
  const index = eventos.findIndex(e => e.id === id);
  if (index < 0) return null;

  eventos[index] = { ...eventos[index], ...dados };
  await AsyncStorage.setItem(EVENTOS_KEY, JSON.stringify(eventos));
  
  // Sincronizar com servidor
  try {
    const evento = eventos[index];
    await axios.post(`${API_URL}/eventos.update`, {
      id: parseInt(id),
      data: {
        titulo: evento.title,
        descricao: evento.description,
        data: evento.date,
        horario: evento.time,
        local: evento.location,
        tipo: evento.category,
      },
    });
    
    await syncService.forceSync();
  } catch (error) {
    console.error('[Eventos] Erro ao editar no servidor:', error);
  }
  
  return eventos[index];
}

// ==================== REMOÇÃO ====================

export async function removerEvento(id: string): Promise<boolean> {
  const eventos = await getEventos();
  const filtrados = eventos.filter(e => e.id !== id);
  if (filtrados.length === eventos.length) return false;
  await AsyncStorage.setItem(EVENTOS_KEY, JSON.stringify(filtrados));
  
  // Sincronizar com servidor
  try {
    await axios.post(`${API_URL}/eventos.delete`, parseInt(id));
    await syncService.forceSync();
  } catch (error) {
    console.error('[Eventos] Erro ao remover no servidor:', error);
  }
  
  return true;
}

// ==================== SINCRONIZAÇÃO ====================

export async function syncEventosFromServer(eventosDB: EventoDB[]): Promise<void> {
  const eventos = eventosDB.map(dbToFrontend);
  await AsyncStorage.setItem(EVENTOS_KEY, JSON.stringify(eventos));
}

// ==================== CONSTANTES ====================

export const categoryLabels: Record<EventCategory, string> = {
  culto: "Culto",
  reuniao: "Reunião",
  "evento-especial": "Evento Especial",
  retiro: "Retiro",
  conferencia: "Conferência",
};

export const categoryColors: Record<EventCategory, string> = {
  culto: "#6B46C1",
  reuniao: "#10B981",
  "evento-especial": "#F59E0B",
  retiro: "#8B5CF6",
  conferencia: "#EF4444",
};

// Compatibilidade
export const mockEvents: Event[] = [];
