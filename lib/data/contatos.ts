import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { syncService } from '@/lib/services/sync-service';

const API_URL = (typeof __DEV__ !== 'undefined' && __DEV__) ? 'http://127.0.0.1:3000/trpc' : 'https://api.example.com/trpc';

export interface ContatosIgreja {
  telefone: string;
  whatsapp: string;
  email: string;
}

const CONTATOS_KEY = '@contatos_igreja';
const CONTATOS_INIT_KEY = '@contatos_init';

// Dados iniciais (seed)
const CONTATOS_INICIAIS: ContatosIgreja = {
  telefone: '+55 66 3411-0000',
  whatsapp: '+55 66 99999-0000',
  email: 'contato@2ieqrondonopolis.com.br',
};

// ==================== LEITURA ====================

export async function getContatos(): Promise<ContatosIgreja> {
  try {
    const init = await AsyncStorage.getItem(CONTATOS_INIT_KEY);
    if (!init) {
      await AsyncStorage.setItem(CONTATOS_KEY, JSON.stringify(CONTATOS_INICIAIS));
      await AsyncStorage.setItem(CONTATOS_INIT_KEY, 'true');
      return CONTATOS_INICIAIS;
    }
    const data = await AsyncStorage.getItem(CONTATOS_KEY);
    return data ? JSON.parse(data) : CONTATOS_INICIAIS;
  } catch {
    return CONTATOS_INICIAIS;
  }
}

// ==================== EDIÇÃO ====================

export async function atualizarContatos(dados: Partial<ContatosIgreja>): Promise<ContatosIgreja> {
  const atual = await getContatos();
  const atualizado = { ...atual, ...dados };
  
  // Salvar localmente
  await AsyncStorage.setItem(CONTATOS_KEY, JSON.stringify(atualizado));
  
  // Sincronizar com servidor
  try {
    await axios.post(`${API_URL}/contatos.update`, {
      telefone: atualizado.telefone,
      whatsapp: atualizado.whatsapp,
      email: atualizado.email,
    });
    
    // Forçar sincronização imediata para outros dispositivos
    await syncService.forceSync();
  } catch (error) {
    console.error('[Contatos] Erro ao sincronizar com servidor:', error);
  }
  
  return atualizado;
}
