import { ScrollView, Text, View, TouchableOpacity, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import {
  obterInscricoes,
  obterInscricoesPendentes,
  aprovarInscricao,
  rejeitarInscricao,
  deletarInscricao,
  contarInscricoesPendentes,
} from "@/lib/notifications/batismo-notificacao";
import { useCallback } from "react";

interface BatismoData {
  id: string;
  nome: string;
  dataNascimento: string;
  celula: string;
  status: "pendente" | "aprovado" | "rejeitado";
  dataCriacao: string;
  dataProcessamento?: string;
}

export default function AdminBatismoScreen() {
  const colors = useColors();
  const [inscricoes, setInscricoes] = useState<BatismoData[]>([]);
  const [filtro, setFiltro] = useState<"todas" | "pendente" | "aprovado" | "rejeitado">("todas");
  const [loading, setLoading] = useState(true);
  const [contadorPendentes, setContadorPendentes] = useState(0);

  useFocusEffect(
    useCallback(() => {
      carregarInscricoes();
    }, [])
  );

  const carregarInscricoes = async () => {
    try {
      const dados = await obterInscricoes();
      setInscricoes(dados);

      const pendentes = await contarInscricoesPendentes();
      setContadorPendentes(pendentes);

      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar inscrições:", error);
      setLoading(false);
    }
  };

  const handleAprovar = async (inscricaoId: string, nome: string) => {
    try {
      await aprovarInscricao(inscricaoId);

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert("Sucesso", `${nome} foi aprovado para batismo!`);
      carregarInscricoes();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível aprovar a inscrição");
    }
  };

  const handleRejeitar = async (inscricaoId: string, nome: string) => {
    Alert.prompt(
      "Rejeitar Inscrição",
      "Digite o motivo da rejeição (opcional):",
      [
        { text: "Cancelar", onPress: () => {} },
        {
          text: "Rejeitar",
          onPress: async (motivo: string | undefined) => {
            try {
              await rejeitarInscricao(inscricaoId, motivo);

              if (Platform.OS !== "web") {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }

              Alert.alert("Sucesso", `${nome} foi rejeitado.`);
              carregarInscricoes();
            } catch (error) {
              Alert.alert("Erro", "Não foi possível rejeitar a inscrição");
            }
          },
        },
      ]
    );
  };

  const handleDeletar = async (inscricaoId: string) => {
    Alert.alert(
      "Confirmar exclusão",
      "Tem certeza que deseja deletar esta inscrição?",
      [
        { text: "Cancelar", onPress: () => {} },
        {
          text: "Deletar",
          onPress: async () => {
            try {
              await deletarInscricao(inscricaoId);

              if (Platform.OS !== "web") {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }

              Alert.alert("Sucesso", "Inscrição deletada");
              carregarInscricoes();
            } catch (error) {
              Alert.alert("Erro", "Não foi possível deletar a inscrição");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const inscricesFiltradas = inscricoes.filter((insc) => {
    if (filtro === "todas") return true;
    return insc.status === filtro;
  });

  const getCorStatus = (status: string) => {
    switch (status) {
      case "aprovado":
        return colors.success;
      case "rejeitado":
        return colors.error;
      default:
        return colors.warning;
    }
  };

  const getTextoStatus = (status: string) => {
    switch (status) {
      case "aprovado":
        return "Aprovado";
      case "rejeitado":
        return "Rejeitado";
      default:
        return "Pendente";
    }
  };

  const formatarData = (dataString: string) => {
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString("pt-BR");
    } catch {
      return dataString;
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 100 }}>
        {/* Header */}
        <View className="gap-2">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-primary font-semibold">← Voltar</Text>
          </TouchableOpacity>
          <Text className="text-3xl font-bold text-foreground">Inscrições de Batismo</Text>
        </View>

        {/* Estatísticas */}
        <View className="bg-surface rounded-2xl p-4 gap-3 border border-border">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-sm text-muted">Total de Inscrições</Text>
              <Text className="text-3xl font-bold text-foreground">{inscricoes.length}</Text>
            </View>
            <View
              className="px-4 py-3 rounded-full"
              style={{ backgroundColor: colors.warning + "20" }}
            >
              <Text className="text-2xl font-bold text-warning">{contadorPendentes}</Text>
              <Text className="text-xs text-warning font-semibold">Pendentes</Text>
            </View>
          </View>

          <View className="flex-row gap-2 pt-2 border-t border-border">
            <View className="flex-1 items-center">
              <Text className="text-lg font-bold text-success">
                {inscricoes.filter((i) => i.status === "aprovado").length}
              </Text>
              <Text className="text-xs text-muted">Aprovados</Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-lg font-bold text-error">
                {inscricoes.filter((i) => i.status === "rejeitado").length}
              </Text>
              <Text className="text-xs text-muted">Rejeitados</Text>
            </View>
          </View>
        </View>

        {/* Alerta de Pendentes */}
        {contadorPendentes > 0 && (
          <View className="bg-warning/10 rounded-2xl p-4 gap-2 border border-warning/20">
            <View className="flex-row items-center gap-2">
              <Text className="text-2xl">🔔</Text>
              <View className="flex-1">
                <Text className="text-sm font-bold text-warning">
                  {contadorPendentes} inscrição{contadorPendentes > 1 ? "ões" : ""} pendente{contadorPendentes > 1 ? "s" : ""}
                </Text>
                <Text className="text-xs text-muted">Aguardando sua aprovação</Text>
              </View>
            </View>
          </View>
        )}

        {/* Filtros */}
        <View className="gap-2">
          <Text className="text-sm font-semibold text-foreground">Filtrar por status:</Text>
          <View className="flex-row gap-2 flex-wrap">
            {(["todas", "pendente", "aprovado", "rejeitado"] as const).map((f) => (
              <TouchableOpacity
                key={f}
                className="px-4 py-2 rounded-full border-2"
                style={{
                  backgroundColor: filtro === f ? colors.primary : colors.surface,
                  borderColor: filtro === f ? colors.primary : colors.border,
                }}
                onPress={() => setFiltro(f)}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{ color: filtro === f ? "#FFFFFF" : colors.foreground }}
                >
                  {f === "todas"
                    ? "Todas"
                    : f === "pendente"
                      ? "Pendentes"
                      : f === "aprovado"
                        ? "Aprovados"
                        : "Rejeitados"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Lista de Inscrições */}
        {loading ? (
          <View className="items-center justify-center py-10">
            <Text className="text-muted">Carregando...</Text>
          </View>
        ) : inscricesFiltradas.length === 0 ? (
          <View className="items-center justify-center py-10 bg-surface rounded-2xl">
            <Text className="text-muted text-center">Nenhuma inscrição encontrada</Text>
          </View>
        ) : (
          <View className="gap-3">
            {inscricesFiltradas.map((insc) => (
              <View
                key={insc.id}
                className="bg-surface rounded-2xl p-4 gap-3 border-2"
                style={{ borderColor: getCorStatus(insc.status) }}
              >
                {/* Header do Card */}
                <View className="flex-row items-center justify-between gap-2">
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-foreground">{insc.nome}</Text>
                    <Text className="text-xs text-muted">{formatarData(insc.dataCriacao)}</Text>
                  </View>
                  <View
                    className="px-3 py-1 rounded-full"
                    style={{ backgroundColor: getCorStatus(insc.status) + "20" }}
                  >
                    <Text
                      className="text-xs font-bold"
                      style={{ color: getCorStatus(insc.status) }}
                    >
                      {getTextoStatus(insc.status)}
                    </Text>
                  </View>
                </View>

                {/* Informações */}
                <View className="gap-2 border-t border-border pt-3">
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">Data de Nascimento:</Text>
                    <Text className="text-sm font-semibold text-foreground">
                      {insc.dataNascimento}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">Célula:</Text>
                    <Text className="text-sm font-semibold text-foreground">{insc.celula}</Text>
                  </View>
                </View>

                {/* Botões de Ação */}
                {insc.status === "pendente" && (
                  <View className="flex-row gap-2 pt-2">
                    <TouchableOpacity
                      className="flex-1 rounded-lg py-2 items-center bg-success/20 border border-success"
                      onPress={() => handleAprovar(insc.id, insc.nome)}
                    >
                      <Text className="text-xs font-bold text-success">✓ Aprovar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 rounded-lg py-2 items-center bg-error/20 border border-error"
                      onPress={() => handleRejeitar(insc.id, insc.nome)}
                    >
                      <Text className="text-xs font-bold text-error">✗ Rejeitar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 rounded-lg py-2 items-center bg-warning/20 border border-warning"
                      onPress={() => handleDeletar(insc.id)}
                    >
                      <Text className="text-xs font-bold text-warning">🗑 Deletar</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {insc.status !== "pendente" && (
                  <View className="flex-row gap-2 pt-2">
                    <TouchableOpacity
                      className="flex-1 rounded-lg py-2 items-center bg-warning/20 border border-warning"
                      onPress={() => handleDeletar(insc.id)}
                    >
                      <Text className="text-xs font-bold text-warning">🗑 Deletar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
