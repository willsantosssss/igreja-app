import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { syncService } from '@/lib/services/sync-service';

const API_URL = (typeof __DEV__ !== 'undefined' && __DEV__) ? 'http://127.0.0.1:3000/api/trpc' : 'https://api.example.com/trpc';

export interface Noticia {
  id: string;
  titulo: string;
  conteudo: string;
  data: string;
  destaque: boolean;
  categoria?: string;
}

// Tipo do banco de dados
interface NoticiaDB {
  id: number;
  titulo: string;
  conteudo: string;
  categoria: string;
  createdAt: Date;
  updatedAt: Date;
}

const NOTICIAS_KEY = "@noticias";

// ==================== ADAPTADORES ====================

function dbToFrontend(noticia: NoticiaDB): Noticia {
  return {
    id: noticia.id.toString(),
    titulo: noticia.titulo,
    conteudo: noticia.conteudo,
    data: new Date(noticia.createdAt).toISOString(),
    destaque: false,
    categoria: noticia.categoria,
  };
}

// ==================== LEITURA ====================

export async function getNoticias(): Promise<Noticia[]> {
  try {
    const data = await AsyncStorage.getItem(NOTICIAS_KEY);
    if (data) {
      const noticias: Noticia[] = JSON.parse(data);
      return noticias.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    }
    return [];
  } catch {
    return [];
  }
}

export async function getNoticiaById(id: string): Promise<Noticia | null> {
  try {
    const noticias = await getNoticias();
    return noticias.find(n => n.id === id) || null;
  } catch {
    return null;
  }
}

// ==================== CRIAÇÃO ====================

export async function adicionarNoticia(noticia: Omit<Noticia, "id">): Promise<Noticia> {
  // Sincronizar com servidor PRIMEIRO
  try {
    const response = await axios.post(`${API_URL}/noticias.create`, {
      titulo: noticia.titulo,
      conteudo: noticia.conteudo,
      categoria: noticia.categoria || 'geral',
    });
    
    const insertId = response.data.result.data;
    
    const novaNoticia: Noticia = {
      ...noticia,
      id: insertId.toString(),
      data: new Date().toISOString(),
    };
    
    // Salvar localmente
    const noticias = await getNoticias();
    const novaLista = [novaNoticia, ...noticias];
    await AsyncStorage.setItem(NOTICIAS_KEY, JSON.stringify(novaLista));
    
    // Forçar sincronização
    await syncService.forceSync();
    
    return novaNoticia;
  } catch (error) {
    console.error('[Notícias] Erro ao criar no servidor:', error);
    
    // Fallback: salvar apenas localmente
    const novaNoticia: Noticia = {
      ...noticia,
      id: `local_${Date.now()}`,
      data: new Date().toISOString(),
    };
    
    const noticias = await getNoticias();
    const novaLista = [novaNoticia, ...noticias];
    await AsyncStorage.setItem(NOTICIAS_KEY, JSON.stringify(novaLista));
    
    return novaNoticia;
  }
}

// ==================== EDIÇÃO ====================

export async function atualizarNoticia(id: string, noticia: Partial<Noticia>): Promise<void> {
  try {
    const noticias = await getNoticias();
    const index = noticias.findIndex(n => n.id === id);
    if (index !== -1) {
      noticias[index] = { ...noticias[index], ...noticia };
      await AsyncStorage.setItem(NOTICIAS_KEY, JSON.stringify(noticias));
      
      // Sincronizar com servidor
      try {
        const noticiaAtualizada = noticias[index];
        await axios.post(`${API_URL}/noticias.update`, {
          id: parseInt(id),
          data: {
            titulo: noticiaAtualizada.titulo,
            conteudo: noticiaAtualizada.conteudo,
            categoria: noticiaAtualizada.categoria || 'geral',
          },
        });
        
        await syncService.forceSync();
      } catch (error) {
        console.error('[Notícias] Erro ao editar no servidor:', error);
      }
    }
  } catch (error) {
    console.error("Erro ao atualizar notícia:", error);
    throw error;
  }
}

// ==================== REMOÇÃO ====================

export async function removerNoticia(id: string): Promise<void> {
  try {
    const noticias = await getNoticias();
    const novaLista = noticias.filter(n => n.id !== id);
    await AsyncStorage.setItem(NOTICIAS_KEY, JSON.stringify(novaLista));
    
    // Sincronizar com servidor
    try {
      await axios.post(`${API_URL}/noticias.delete`, parseInt(id));
      await syncService.forceSync();
    } catch (error) {
      console.error('[Notícias] Erro ao remover no servidor:', error);
    }
  } catch (error) {
    console.error("Erro ao remover notícia:", error);
    throw error;
  }
}

// ==================== SINCRONIZAÇÃO ====================

export async function syncNoticiasFromServer(noticiasDB: NoticiaDB[]): Promise<void> {
  const noticias = noticiasDB.map(dbToFrontend);
  await AsyncStorage.setItem(NOTICIAS_KEY, JSON.stringify(noticias));
}
