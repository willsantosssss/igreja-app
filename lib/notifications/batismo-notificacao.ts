import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface InscricaoBatismo {
  id: string;
  nome: string;
  dataNascimento: string;
  celula: string;
  status: "pendente" | "aprovado" | "rejeitado";
  dataCriacao: string;
  dataProcessamento?: string;
}

const STORAGE_KEY_INSCRICOES = "@batismo_inscricoes";
const STORAGE_KEY_ADMIN_NOTIFICACOES = "@admin_notificacoes_batismo";

/**
 * Obter todas as inscrições de batismo
 */
export async function obterInscricoes(): Promise<InscricaoBatismo[]> {
  try {
    const dados = await AsyncStorage.getItem(STORAGE_KEY_INSCRICOES);
    if (dados) {
      return JSON.parse(dados);
    }
    return [];
  } catch (error) {
    console.error("Erro ao obter inscrições:", error);
    return [];
  }
}

/**
 * Obter inscrições pendentes
 */
export async function obterInscricoesPendentes(): Promise<InscricaoBatismo[]> {
  const inscricoes = await obterInscricoes();
  return inscricoes.filter((i) => i.status === "pendente");
}

/**
 * Contar inscrições pendentes
 */
export async function contarInscricoesPendentes(): Promise<number> {
  const pendentes = await obterInscricoesPendentes();
  return pendentes.length;
}

/**
 * Adicionar nova inscrição de batismo e notificar admin
 */
export async function adicionarInscricaoBatismo(
  inscricao: Omit<InscricaoBatismo, "id" | "dataCriacao" | "status">
): Promise<InscricaoBatismo> {
  try {
    const inscricoes = await obterInscricoes();

    const novaInscricao: InscricaoBatismo = {
      ...inscricao,
      id: `batismo_${Date.now()}`,
      status: "pendente",
      dataCriacao: new Date().toISOString(),
    };

    inscricoes.push(novaInscricao);
    await AsyncStorage.setItem(STORAGE_KEY_INSCRICOES, JSON.stringify(inscricoes));

    // Enviar notificação para admin
    await notificarAdminNovaInscricao(novaInscricao);

    return novaInscricao;
  } catch (error) {
    console.error("Erro ao adicionar inscrição:", error);
    throw error;
  }
}

/**
 * Notificar admin sobre nova inscrição de batismo
 */
export async function notificarAdminNovaInscricao(
  inscricao: InscricaoBatismo
): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🙏 Nova Inscrição de Batismo",
        body: `${inscricao.nome} se inscreveu para batismo. Toque para revisar.`,
        data: {
          tipo: "batismo_nova_inscricao",
          inscricaoId: inscricao.id,
          timestamp: new Date().toISOString(),
        },
        sound: "default",
        badge: 1,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1,
        repeats: false,
      },
    });

    console.log("Notificação de nova inscrição enviada");
  } catch (error) {
    console.error("Erro ao notificar admin:", error);
  }
}

/**
 * Aprovar inscrição de batismo
 */
export async function aprovarInscricao(inscricaoId: string): Promise<void> {
  try {
    const inscricoes = await obterInscricoes();
    const inscricao = inscricoes.find((i) => i.id === inscricaoId);

    if (!inscricao) {
      throw new Error("Inscrição não encontrada");
    }

    inscricao.status = "aprovado";
    inscricao.dataProcessamento = new Date().toISOString();

    await AsyncStorage.setItem(STORAGE_KEY_INSCRICOES, JSON.stringify(inscricoes));

    // Notificar admin que foi aprovada
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "✅ Inscrição Aprovada",
        body: `${inscricao.nome} foi aprovado para batismo.`,
        data: {
          tipo: "batismo_aprovado",
          inscricaoId: inscricao.id,
          timestamp: new Date().toISOString(),
        },
        sound: "default",
        badge: 1,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1,
        repeats: false,
      },
    });

    console.log("Inscrição aprovada:", inscricaoId);
  } catch (error) {
    console.error("Erro ao aprovar inscrição:", error);
    throw error;
  }
}

/**
 * Rejeitar inscrição de batismo
 */
export async function rejeitarInscricao(
  inscricaoId: string,
  motivo?: string
): Promise<void> {
  try {
    const inscricoes = await obterInscricoes();
    const inscricao = inscricoes.find((i) => i.id === inscricaoId);

    if (!inscricao) {
      throw new Error("Inscrição não encontrada");
    }

    inscricao.status = "rejeitado";
    inscricao.dataProcessamento = new Date().toISOString();

    await AsyncStorage.setItem(STORAGE_KEY_INSCRICOES, JSON.stringify(inscricoes));

    // Notificar admin que foi rejeitada
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "❌ Inscrição Rejeitada",
        body: `${inscricao.nome} - ${motivo || "Inscrição rejeitada"}`,
        data: {
          tipo: "batismo_rejeitado",
          inscricaoId: inscricao.id,
          timestamp: new Date().toISOString(),
        },
        sound: "default",
        badge: 1,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1,
        repeats: false,
      },
    });

    console.log("Inscrição rejeitada:", inscricaoId);
  } catch (error) {
    console.error("Erro ao rejeitar inscrição:", error);
    throw error;
  }
}

/**
 * Deletar inscrição
 */
export async function deletarInscricao(inscricaoId: string): Promise<void> {
  try {
    const inscricoes = await obterInscricoes();
    const index = inscricoes.findIndex((i) => i.id === inscricaoId);

    if (index === -1) {
      throw new Error("Inscrição não encontrada");
    }

    inscricoes.splice(index, 1);
    await AsyncStorage.setItem(STORAGE_KEY_INSCRICOES, JSON.stringify(inscricoes));

    console.log("Inscrição deletada:", inscricaoId);
  } catch (error) {
    console.error("Erro ao deletar inscrição:", error);
    throw error;
  }
}

/**
 * Obter inscrição por ID
 */
export async function obterInscricaoPorId(
  inscricaoId: string
): Promise<InscricaoBatismo | null> {
  try {
    const inscricoes = await obterInscricoes();
    return inscricoes.find((i) => i.id === inscricaoId) || null;
  } catch (error) {
    console.error("Erro ao obter inscrição:", error);
    return null;
  }
}

/**
 * Obter estatísticas de inscrições
 */
export async function obterEstatisticasInscricoes(): Promise<{
  total: number;
  pendentes: number;
  aprovadas: number;
  rejeitadas: number;
}> {
  try {
    const inscricoes = await obterInscricoes();

    return {
      total: inscricoes.length,
      pendentes: inscricoes.filter((i) => i.status === "pendente").length,
      aprovadas: inscricoes.filter((i) => i.status === "aprovado").length,
      rejeitadas: inscricoes.filter((i) => i.status === "rejeitado").length,
    };
  } catch (error) {
    console.error("Erro ao obter estatísticas:", error);
    return { total: 0, pendentes: 0, aprovadas: 0, rejeitadas: 0 };
  }
}

/**
 * Obter inscrições por status
 */
export async function obterInscricoesPorStatus(
  status: "pendente" | "aprovado" | "rejeitado"
): Promise<InscricaoBatismo[]> {
  try {
    const inscricoes = await obterInscricoes();
    return inscricoes.filter((i) => i.status === status);
  } catch (error) {
    console.error("Erro ao obter inscrições por status:", error);
    return [];
  }
}
