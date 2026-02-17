import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Chave para armazenar configuração do lembrete
const LEMBRETE_CONFIG_KEY = '@lembrete_lider_config';
const LEMBRETE_ID_KEY = '@lembrete_lider_notification_id';

export interface LembreteConfig {
  ativo: boolean;
  diaSemana: number; // 1=Domingo, 2=Segunda, ..., 7=Sábado
  hora: number; // 0-23
  minuto: number; // 0-59
}

const CONFIG_PADRAO: LembreteConfig = {
  ativo: true,
  diaSemana: 7, // Sábado (lembrete antes do domingo)
  hora: 18,
  minuto: 0,
};

// Obter configuração do lembrete
export async function obterConfigLembrete(): Promise<LembreteConfig> {
  try {
    const data = await AsyncStorage.getItem(LEMBRETE_CONFIG_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return CONFIG_PADRAO;
  } catch {
    return CONFIG_PADRAO;
  }
}

// Salvar configuração do lembrete
export async function salvarConfigLembrete(config: LembreteConfig): Promise<void> {
  await AsyncStorage.setItem(LEMBRETE_CONFIG_KEY, JSON.stringify(config));
}

// Solicitar permissão de notificações
export async function solicitarPermissaoNotificacao(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  try {
    const Notifications = await import('expo-notifications');

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('lembretes-celula', {
        name: 'Lembretes de Célula',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0a7ea4',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch {
    return false;
  }
}

// Agendar lembrete semanal
export async function agendarLembreteSemanal(
  nomeLider: string,
  nomeCelula: string,
  config?: LembreteConfig,
): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  try {
    const Notifications = await import('expo-notifications');
    const configAtual = config || await obterConfigLembrete();

    if (!configAtual.ativo) {
      await cancelarLembrete();
      return false;
    }

    // Solicitar permissão
    const permitido = await solicitarPermissaoNotificacao();
    if (!permitido) return false;

    // Cancelar lembrete anterior
    await cancelarLembrete();

    // Configurar handler para mostrar notificação em foreground
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    // Agendar notificação semanal
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Relatório de Célula',
        body: `Olá, ${nomeLider}! Não esqueça de preencher o relatório da célula "${nomeCelula}" desta semana.`,
        data: { tipo: 'lembrete_relatorio', celula: nomeCelula },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: configAtual.diaSemana,
        hour: configAtual.hora,
        minute: configAtual.minuto,
        channelId: Platform.OS === 'android' ? 'lembretes-celula' : undefined,
      },
    });

    // Salvar ID da notificação para poder cancelar depois
    await AsyncStorage.setItem(LEMBRETE_ID_KEY, notificationId);
    await salvarConfigLembrete(configAtual);

    return true;
  } catch (error) {
    console.warn('Erro ao agendar lembrete:', error);
    return false;
  }
}

// Cancelar lembrete
export async function cancelarLembrete(): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    const Notifications = await import('expo-notifications');
    const notificationId = await AsyncStorage.getItem(LEMBRETE_ID_KEY);

    if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      await AsyncStorage.removeItem(LEMBRETE_ID_KEY);
    }
  } catch {
    // Silenciar erros
  }
}

// Verificar se há lembrete agendado
export async function verificarLembreteAgendado(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  try {
    const Notifications = await import('expo-notifications');
    const notificationId = await AsyncStorage.getItem(LEMBRETE_ID_KEY);

    if (!notificationId) return false;

    const agendados = await Notifications.getAllScheduledNotificationsAsync();
    return agendados.some(n => n.identifier === notificationId);
  } catch {
    return false;
  }
}

// Nomes dos dias da semana
export const DIAS_SEMANA = [
  { valor: 1, nome: 'Domingo' },
  { valor: 2, nome: 'Segunda-feira' },
  { valor: 3, nome: 'Terça-feira' },
  { valor: 4, nome: 'Quarta-feira' },
  { valor: 5, nome: 'Quinta-feira' },
  { valor: 6, nome: 'Sexta-feira' },
  { valor: 7, nome: 'Sábado' },
];

// Formatar horário
export function formatarHorario(hora: number, minuto: number): string {
  return `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`;
}
