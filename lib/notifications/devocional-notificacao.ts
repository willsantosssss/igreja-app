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
const LAST_SCHEDULED_KEY = "@notificacao_last_scheduled";

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
 * Calcular próxima data que deve receber notificação
 * Retorna a data do próximo dia que está habilitado
 */
function calcularProximaDataNotificacao(
  hora: number,
  minuto: number,
  diasSemana: boolean[]
): Date {
  const agora = new Date();
  const proximaData = new Date(agora);
  proximaData.setHours(hora, minuto, 0, 0);

  // Se o horário de hoje já passou, começar a procurar a partir de amanhã
  if (proximaData <= agora) {
    proximaData.setDate(proximaData.getDate() + 1);
  }

  // Procurar o próximo dia habilitado (máximo 7 dias)
  for (let i = 0; i < 7; i++) {
    const diaSemana = proximaData.getDay(); // 0 = domingo, 1 = segunda, etc
    // Converter para índice do array (0 = segunda, 6 = domingo)
    const indiceArray = diaSemana === 0 ? 6 : diaSemana - 1;

    if (diasSemana[indiceArray]) {
      return proximaData;
    }

    // Tentar próximo dia
    proximaData.setDate(proximaData.getDate() + 1);
    proximaData.setHours(hora, minuto, 0, 0);
  }

  // Fallback (nunca deve chegar aqui se houver pelo menos um dia habilitado)
  return proximaData;
}

/**
 * Agendar notificações para todos os dias habilitados da semana
 * Usa CALENDAR trigger para respeitar dias específicos
 */
export async function agendarNotificacaoDiaria(
  preferencias?: PreferencesNotificacao
): Promise<void> {
  try {
    // Cancelar notificações anteriores
    await Notifications.cancelAllScheduledNotificationsAsync();

    const prefs = preferencias || (await obterPreferencias());

    if (!prefs.habilitado) {
      console.log("Notificações desabilitadas");
      return;
    }

    // Agendar notificação para cada dia habilitado
    const diasHabilitados = prefs.diasSemana
      .map((habilitado, index) => habilitado ? index : -1)
      .filter(index => index !== -1);

    if (diasHabilitados.length === 0) {
      console.warn("Nenhum dia habilitado para notificações");
      return;
    }

    console.log(`Agendando notificações para ${diasHabilitados.length} dia(s) da semana`);

    // Agendar para cada dia habilitado
    for (const diaIndex of diasHabilitados) {
      // Converter índice do array para dia da semana (0 = segunda, 6 = domingo)
      // getDay() retorna 0 = domingo, 1 = segunda, etc
      const diaGetDay = diaIndex === 6 ? 0 : diaIndex + 1;

      const trigger: Notifications.CalendarTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour: prefs.hora,
        minute: prefs.minuto,
        weekday: diaGetDay, // 0 = domingo, 1 = segunda, etc
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

      console.log(`Notificação agendada para dia ${diaIndex} (getDay: ${diaGetDay}) às ${prefs.hora.toString().padStart(2, "0")}:${prefs.minuto.toString().padStart(2, "0")}`);
    }

    // Salvar timestamp de quando foi agendado para evitar duplicatas
    await AsyncStorage.setItem(LAST_SCHEDULED_KEY, new Date().toISOString());

    console.log("Notificações diárias agendadas com sucesso");
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

    console.log("Notificação de teste agendada");
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
    console.log("Notificações desabilitadas");
  } catch (error) {
    console.error("Erro ao desabilitar notificações:", error);
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
    console.log("Notificações habilitadas");
  } catch (error) {
    console.error("Erro ao habilitar notificações:", error);
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
