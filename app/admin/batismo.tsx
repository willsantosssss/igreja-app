import { ScrollView, Text, View, TouchableOpacity, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

interface BatismoData {
  nome: string;
  dataNascimento: string;
  telefone: string;
  motivacao: string;
  createdAt: string;
  id?: string;
  status?: "pendente" | "aprovado" | "rejeitado";
}

export default function AdminBatismoScreen() {
  const colors = useColors();
  const [inscricoes, setInscricoes] = useState<BatismoData[]>([]);
  const [filtro, setFiltro] = useState<"todas" | "pendente" | "aprovado" | "rejeitado">("todas");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarInscricoes();
  }, []);

  const carregarInscricoes = async () => {
    try {
      const dados = await AsyncStorage.getItem("@batismo_inscricoes");
      if (dados) {
        const lista = JSON.parse(dados);
        setInscricoes(lista);
      }
      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar inscrições:", error);
      setLoading(false);
    }
  };

  const atualizarStatus = async (index: number, novoStatus: "pendente" | "aprovado" | "rejeitado") => {
    try {
      const novaLista = [...inscricoes];
      novaLista[index].status = novoStatus;
      setInscricoes(novaLista);
      await AsyncStorage.setItem("@batismo_inscricoes", JSON.stringify(novaLista));
      
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      const statusTexto = {
        pendente: "Pendente",
        aprovado: "Aprovado",
        rejeitado: "Rejeitado",
      };

      Alert.alert("Sucesso", `Inscrição marcada como ${statusTexto[novoStatus]}`);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar o status");
    }
  };

  const deletarInscricao = (index: number) => {
    Alert.alert(
      "Confirmar exclusão",
      "Tem certeza que deseja deletar esta inscrição?",
      [
        { text: "Cancelar", onPress: () => {} },
        {
          text: "Deletar",
          onPress: async () => {
            try {
              const novaLista = inscricoes.filter((_, i) => i !== index);
              setInscricoes(novaLista);
              await AsyncStorage.setItem("@batismo_inscricoes", JSON.stringify(novaLista));
              
              if (Platform.OS !== "web") {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              Alert.alert("Sucesso", "Inscrição deletada");
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
    return (insc.status || "pendente") === filtro;
  });

  const getCorStatus = (status?: string) => {
    switch (status) {
      case "aprovado":
        return colors.success;
      case "rejeitado":
        return colors.error;
      default:
        return colors.warning;
    }
  };

  const getTextoStatus = (status?: string) => {
    switch (status) {
      case "aprovado":
        return "Aprovado";
      case "rejeitado":
        return "Rejeitado";
      default:
        return "Pendente";
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
          <Text className="text-sm text-muted">
            Total: {inscricoes.length} | Pendentes: {inscricoes.filter(i => (i.status || "pendente") === "pendente").length}
          </Text>
        </View>

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
                  {f === "todas" ? "Todas" : f === "pendente" ? "Pendentes" : f === "aprovado" ? "Aprovados" : "Rejeitados"}
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
            {inscricesFiltradas.map((insc, index) => {
              const indiceOriginal = inscricoes.findIndex(
                (i) => i.createdAt === insc.createdAt && i.nome === insc.nome
              );
              const dataNasc = new Date(insc.dataNascimento);
              const dataFormatada = `${dataNasc.getDate().toString().padStart(2, "0")}/${(dataNasc.getMonth() + 1)
                .toString()
                .padStart(2, "0")}/${dataNasc.getFullYear()}`;

              return (
                <View
                  key={index}
                  className="bg-surface rounded-2xl p-4 gap-3 border-2"
                  style={{ borderColor: getCorStatus(insc.status) }}
                >
                  {/* Header do Card */}
                  <View className="flex-row items-center justify-between gap-2">
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-foreground">{insc.nome}</Text>
                      <Text className="text-xs text-muted">
                        {new Date(insc.createdAt).toLocaleDateString("pt-BR")}
                      </Text>
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
                      <Text className="text-sm font-semibold text-foreground">{dataFormatada}</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-sm text-muted">Telefone:</Text>
                      <Text className="text-sm font-semibold text-foreground">{insc.telefone}</Text>
                    </View>
                  </View>

                  {/* Motivação */}
                  <View className="gap-1 bg-primary/10 rounded-lg p-3">
                    <Text className="text-xs font-semibold text-primary">Motivação:</Text>
                    <Text className="text-sm text-foreground leading-relaxed">{insc.motivacao}</Text>
                  </View>

                  {/* Botões de Ação */}
                  <View className="flex-row gap-2 pt-2">
                    <TouchableOpacity
                      className="flex-1 rounded-lg py-2 items-center bg-success/20 border border-success"
                      onPress={() => atualizarStatus(indiceOriginal, "aprovado")}
                    >
                      <Text className="text-xs font-bold text-success">✓ Aprovar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 rounded-lg py-2 items-center bg-error/20 border border-error"
                      onPress={() => atualizarStatus(indiceOriginal, "rejeitado")}
                    >
                      <Text className="text-xs font-bold text-error">✗ Rejeitar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 rounded-lg py-2 items-center bg-warning/20 border border-warning"
                      onPress={() => deletarInscricao(indiceOriginal)}
                    >
                      <Text className="text-xs font-bold text-warning">🗑 Deletar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
