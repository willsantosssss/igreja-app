import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';

/**
 * Serviço de sincronização em tempo real entre dispositivos
 * Estratégia: Polling a cada 30 segundos + Cache híbrido (AsyncStorage + Servidor)
 */

const SYNC_INTERVAL = 30000; // 30 segundos
const LAST_SYNC_KEY = '@last_sync_timestamp';

// URL da API (ajustar conforme ambiente)
const API_URL = __DEV__ 
  ? 'http://127.0.0.1:3000/api/trpc'
  : `https://${Constants.expoConfig?.extra?.apiUrl || 'api.example.com'}/trpc`;

type SyncListener = () => void;

class SyncService {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<SyncListener> = new Set();
  private isSyncing = false;

  /**
   * Inicia o serviço de sincronização automática
   */
  start() {
    if (this.intervalId) return; // Já está rodando

    console.log('[Sync] Serviço iniciado');
    
    // Sincronização inicial
    this.syncAll();

    // Polling a cada 30 segundos
    this.intervalId = setInterval(() => {
      this.syncAll();
    }, SYNC_INTERVAL);
  }

  /**
   * Para o serviço de sincronização
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[Sync] Serviço parado');
    }
  }

  /**
   * Registra um listener para ser notificado quando houver sincronização
   */
  addListener(listener: SyncListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notifica todos os listeners
   */
  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  /**
   * Sincroniza todos os dados do servidor
   */
  async syncAll() {
    if (this.isSyncing) return; // Evita sincronizações simultâneas

    this.isSyncing = true;
    try {
      console.log('[Sync] Iniciando sincronização...');

      await Promise.all([
        this.syncContatos(),
        this.syncEventos(),
        this.syncNoticias(),
        this.syncAviso(),
        this.syncCelulas(),
        this.syncPedidosOracao(),
      ]);

      await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
      console.log('[Sync] Sincronização concluída');
      
      this.notifyListeners();
    } catch (error) {
      console.error('[Sync] Erro na sincronização:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Força uma sincronização imediata
   */
  async forceSync() {
    await this.syncAll();
  }

  // ==================== SINCRONIZAÇÃO POR TIPO ====================

  private async syncContatos() {
    try {
      const response = await axios.get(`${API_URL}/contatos.get`, {
        params: { input: {} },
      });
      const data = response.data.result.data.json;
      if (data && data.length > 0) {
        const contato = data[0];
        await AsyncStorage.setItem('@contatos_igreja', JSON.stringify({
          telefone: contato.telefone,
          whatsapp: contato.whatsapp,
          email: contato.email,
        }));
      }
    } catch (error) {
      console.error('[Sync] Erro ao sincronizar contatos:', error);
    }
  }

  private async syncEventos() {
    try {
      const response = await axios.get(`${API_URL}/eventos.list`, {
        params: { input: {} },
      });
      const data = response.data.result.data.json;
      if (data) {
        // Importar função de adaptação
        const { syncEventosFromServer } = await import('@/lib/data/events');
        await syncEventosFromServer(data);
      }
    } catch (error) {
      console.error('[Sync] Erro ao sincronizar eventos:', error);
    }
  }

  private async syncNoticias() {
    try {
      const response = await axios.get(`${API_URL}/noticias.list`, {
        params: { input: {} },
      });
      const data = response.data.result.data.json;
      if (data) {
        const { syncNoticiasFromServer } = await import('@/lib/data/noticias');
        await syncNoticiasFromServer(data);
      }
    } catch (error) {
      console.error('[Sync] Erro ao sincronizar notícias:', error);
    }
  }

  private async syncAviso() {
    try {
      const response = await axios.get(`${API_URL}/aviso.get`, {
        params: { input: {} },
      });
      const data = response.data.result.data.json;
      if (data) {
        const { syncAvisoFromServer } = await import('@/lib/data/aviso-importante');
        await syncAvisoFromServer(data);
      }
    } catch (error) {
      console.error('[Sync] Erro ao sincronizar aviso:', error);
    }
  }

  private async syncCelulas() {
    try {
      const response = await axios.get(`${API_URL}/celulas.list`, {
        params: { input: {} },
      });
      const data = response.data.result.data.json;
      if (data) {
        const { syncCelulasFromServer } = await import('@/lib/data/celulas');
        await syncCelulasFromServer(data);
      }
    } catch (error) {
      console.error('[Sync] Erro ao sincronizar células:', error);
    }
  }

  private async syncPedidosOracao() {
    try {
      const response = await axios.get(`${API_URL}/oracao.list`, {
        params: { input: {} },
      });
      const data = response.data.result.data.json;
      if (data) {
        const { syncPedidosFromServer } = await import('@/lib/data/oracao');
        await syncPedidosFromServer(data);
      }
    } catch (error) {
      console.error('[Sync] Erro ao sincronizar pedidos de oração:', error);
    }
  }

  /**
   * Obtém o timestamp da última sincronização
   */
  async getLastSyncTime(): Promise<Date | null> {
    try {
      const timestamp = await AsyncStorage.getItem(LAST_SYNC_KEY);
      return timestamp ? new Date(timestamp) : null;
    } catch {
      return null;
    }
  }
}

// Singleton
export const syncService = new SyncService();
