import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Configurar o comportamento das notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface PreferencesNotificacao {
  habilitado: boolean;
  hora: number; // 0-23
  minuto: number; // 0-59
  diasSemana: boolean[]; // [seg, ter, qua, qui, sex, sab, dom]
}

const STORAGE_KEY = "@notificacao_preferencias";

// Preferências padrão: 7:00 AM, todos os dias
const PREFERENCIAS_PADRAO: PreferencesNotificacao = {
  habilitado: true,
  hora: 7,
  minuto: 0,
  diasSemana: [true, true, true, true, true, true, true],
};

/**
 * Obter preferências de notificação armazenadas
 */
export async function obterPreferencias(): Promise<PreferencesNotificacao> {
  try {
    const dados = await AsyncStorage.getItem(STORAGE_KEY);
    if (dados) {
      return JSON.parse(dados);
    }
    return PREFERENCIAS_PADRAO;
  } catch (error) {
    console.error("Erro ao obter preferências:", error);
    return PREFERENCIAS_PADRAO;
  }
}

/**
 * Salvar preferências de notificação
 */
export async function salvarPreferencias(
  preferencias: PreferencesNotificacao
): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferencias));
    // Reagendar notificações com as novas preferências
    await agendarNotificacaoDiaria(preferencias);
  } catch (error) {
    console.error("Erro ao salvar preferências:", error);
    throw error;
  }
}

/**
 * Calcular segundos até o próximo horário especificado
 */
function calcularSegundosAteHorario(hora: number, minuto: number): number {
  const agora = new Date();
  const proximoHorario = new Date();
  proximoHorario.setHours(hora, minuto, 0, 0);

  if (proximoHorario <= agora) {
    // Se já passou, agendar para amanhã
    proximoHorario.setDate(proximoHorario.getDate() + 1);
  }

  const diferenca = proximoHorario.getTime() - agora.getTime();
  return Math.ceil(diferenca / 1000); // Converter para segundos
}

/**
 * Agendar notificação diária para o devocional
 */
export async function agendarNotificacaoDiaria(
  preferencias?: PreferencesNotificacao
): Promise<void> {
  try {
    // Cancelar notificações anteriores
    await Notifications.cancelAllScheduledNotificationsAsync();

    const prefs = preferencias || (await obterPreferencias());

    if (!prefs.habilitado) {
      return;
    }

    // Agendar notificação diária (a cada 24 horas)
    const segundosAteProximo = calcularSegundosAteHorario(prefs.hora, prefs.minuto);

    // Agendar notificação recorrente a cada 24 horas
    const trigger: Notifications.TimeIntervalTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(segundosAteProximo, 1), // Mínimo 1 segundo
      repeats: true,
    };

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "📖 Devocional do Dia",
        body: "Leia o capítulo de hoje do Novo Testamento",
        data: {
          tipo: "devocional",
          timestamp: new Date().toISOString(),
        },
        sound: "default",
        badge: 1,
      },
      trigger,
    });

    console.log("Notificação diária agendada com sucesso");
  } catch (error) {
    console.error("Erro ao agendar notificação:", error);
    throw error;
  }
}

/**
 * Enviar notificação de teste imediatamente
 */
export async function enviarNotificacaoTeste(): Promise<void> {
  try {
    const trigger: Notifications.TimeIntervalTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2, // Mostrar em 2 segundos
      repeats: false,
    };

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "📖 Devocional do Dia",
        body: "Esta é uma notificação de teste - Leia o capítulo de hoje!",
        data: {
          tipo: "devocional",
          timestamp: new Date().toISOString(),
        },
        sound: "default",
        badge: 1,
      },
      trigger,
    });
  } catch (error) {
    console.error("Erro ao enviar notificação de teste:", error);
    throw error;
  }
}

/**
 * Desabilitar todas as notificações
 */
export async function desabilitarNotificacoes(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const prefs = await obterPreferencias();
    prefs.habilitado = false;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch (error) {
    console.error("Erro ao desabilitar notificações:", error);
    throw error;
  }
}

/**
 * Habilitar notificações
 */
export async function habilitarNotificacoes(): Promise<void> {
  try {
    const prefs = await obterPreferencias();
    prefs.habilitado = true;
    await salvarPreferencias(prefs);
  } catch (error) {
    console.error("Erro ao habilitar notificações:", error);
    throw error;
  }
}

/**
 * Obter status de permissão de notificações
 */
export async function obterStatusPermissao(): Promise<boolean> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.error("Erro ao obter status de permissão:", error);
    return false;
  }
}

/**
 * Solicitar permissão de notificações
 */
export async function solicitarPermissao(): Promise<boolean> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.error("Erro ao solicitar permissão:", error);
    return false;
  }
}

/**
 * Limpar badge de notificações (chamar quando usuário abre a notificação)
 */
export async function limparBadge(): Promise<void> {
  try {
    await Notifications.setBadgeCountAsync(0);
    console.log("Badge de notificações limpo");
  } catch (error) {
    console.error("Erro ao limpar badge:", error);
  }
}

/**
 * Inicializar notificações (chamar no app launch)
 */
export async function inicializarNotificacoes(): Promise<void> {
  try {
    // Verificar e solicitar permissão se necessário
    const temPermissao = await obterStatusPermissao();
    if (!temPermissao) {
      const permissaoObtida = await solicitarPermissao();
      if (!permissaoObtida) {
        console.warn("Permissão de notificações negada");
        return;
      }
    }

    // Agendar notificações com preferências salvas
    await agendarNotificacaoDiaria();
  } catch (error) {
    console.error("Erro ao inicializar notificações:", error);
  }
}
