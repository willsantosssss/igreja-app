import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { syncService } from '@/lib/services/sync-service';

const API_URL = (typeof __DEV__ !== 'undefined' && __DEV__) ? 'http://127.0.0.1:3000/trpc' : 'https://api.example.com/trpc';

export interface AvisoImportante {
  titulo: string;
  mensagem: string;
  ativo: boolean;
  dataCriacao: string;
}

// Tipo do banco de dados
interface AvisoImportanteDB {
  id: number;
  titulo: string;
  mensagem: string;
  ativo: number;
  createdAt: Date;
  updatedAt: Date;
}

const AVISO_KEY = "@aviso_importante";

// ==================== ADAPTADORES ====================

function dbToFrontend(aviso: AvisoImportanteDB): AvisoImportante {
  return {
    titulo: aviso.titulo,
    mensagem: aviso.mensagem,
    ativo: aviso.ativo === 1,
    dataCriacao: new Date(aviso.createdAt).toISOString(),
  };
}

// ==================== LEITURA ====================

export async function getAvisoImportante(): Promise<AvisoImportante> {
  try {
    const data = await AsyncStorage.getItem(AVISO_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return {
      titulo: "",
      mensagem: "",
      ativo: false,
      dataCriacao: new Date().toISOString(),
    };
  } catch {
    return {
      titulo: "",
      mensagem: "",
      ativo: false,
      dataCriacao: new Date().toISOString(),
    };
  }
}

// ==================== CRIAÇÃO/ATUALIZAÇÃO ====================

export async function salvarAvisoImportante(aviso: AvisoImportante): Promise<void> {
  try {
    // Salvar localmente
    await AsyncStorage.setItem(AVISO_KEY, JSON.stringify(aviso));
    
    // Sincronizar com servidor
    try {
      await axios.post(`${API_URL}/aviso.update`, {
        titulo: aviso.titulo,
        mensagem: aviso.mensagem,
        ativo: aviso.ativo ? 1 : 0,
      });
      
      await syncService.forceSync();
    } catch (error) {
      console.error('[Aviso] Erro ao sincronizar com servidor:', error);
    }
  } catch (error) {
    console.error("Erro ao salvar aviso importante:", error);
    throw error;
  }
}

// ==================== REMOÇÃO ====================

export async function limparAvisoImportante(): Promise<void> {
  try {
    const avisoVazio: AvisoImportante = {
      titulo: "",
      mensagem: "",
      ativo: false,
      dataCriacao: new Date().toISOString(),
    };
    
    await AsyncStorage.setItem(AVISO_KEY, JSON.stringify(avisoVazio));
    
    // Sincronizar com servidor
    try {
      await axios.post(`${API_URL}/aviso.update`, {
        titulo: "",
        mensagem: "",
        ativo: 0,
      });
      
      await syncService.forceSync();
    } catch (error) {
      console.error('[Aviso] Erro ao limpar no servidor:', error);
    }
  } catch (error) {
    console.error("Erro ao limpar aviso importante:", error);
    throw error;
  }
}

// ==================== SINCRONIZAÇÃO ====================

export async function syncAvisoFromServer(avisoDBArray: AvisoImportanteDB[]): Promise<void> {
  if (avisoDBArray.length > 0) {
    const aviso = dbToFrontend(avisoDBArray[0]);
    await AsyncStorage.setItem(AVISO_KEY, JSON.stringify(aviso));
  }
}
