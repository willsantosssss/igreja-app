import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export default function AdminMembrosScreen() {
  const colors = useColors();
  const [filtroCelula, setFiltroCelula] = useState("");

  const { data: membros, isLoading, refetch } = trpc.usuarios.list.useQuery(undefined, {
    refetchOnWindowFocus: true,
  });
  const deleteUserMutation = trpc.usuarios.deleteUser.useMutation();

  const membrosFiltrados = membros?.filter((membro) => {
    if (!filtroCelula) return true;
    return membro.celula.toLowerCase().includes(filtroCelula.toLowerCase());
  }) || [];

  // Estatísticas
  const totalMembros = membros?.length || 0;
  const celulasUnicas = [...new Set(membros?.map((m) => m.celula).filter((c) => c))];
  const membrosPorCelula = celulasUnicas.map((celula) => ({
    celula,
    count: membros?.filter((m) => m.celula === celula).length || 0,
  }));

  if (isLoading) {
    return (
      <ScreenContainer className="p-6 justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-muted mt-4">Carregando membros...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <View className="gap-1">
            <Text className="text-3xl font-bold text-foreground">Membros</Text>
            <Text className="text-sm text-muted">Total: {totalMembros} membros</Text>
          </View>
          <TouchableOpacity
            onPress={() => refetch()}
            className="bg-primary px-4 py-2 rounded-full"
          >
            <Text className="text-background font-semibold">Atualizar</Text>
          </TouchableOpacity>
        </View>

        {/* Estatísticas */}
        <View className="bg-surface rounded-2xl p-4 gap-3">
          <Text className="text-lg font-bold text-foreground">Estatísticas</Text>
          <View className="flex-row flex-wrap gap-3">
            <View className="bg-background rounded-xl p-3 flex-1 min-w-[120px]">
              <Text className="text-2xl font-bold text-primary">{totalMembros}</Text>
              <Text className="text-xs text-muted">Total de Membros</Text>
            </View>
            <View className="bg-background rounded-xl p-3 flex-1 min-w-[120px]">
              <Text className="text-2xl font-bold text-primary">{celulasUnicas.length}</Text>
              <Text className="text-xs text-muted">Células Ativas</Text>
            </View>
          </View>

          {/* Membros por Célula */}
          {membrosPorCelula.length > 0 && (
            <View className="gap-2 mt-2">
              <Text className="text-sm font-semibold text-foreground">Membros por Célula</Text>
              {membrosPorCelula.map((item) => (
                <View key={item.celula} className="flex-row justify-between items-center">
                  <Text className="text-sm text-foreground">{item.celula || "Sem célula"}</Text>
                  <Text className="text-sm font-bold text-primary">{item.count}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Filtro */}
        <View className="gap-2">
          <Text className="text-sm font-semibold text-foreground">Filtrar por Célula</Text>
          <TextInput
            value={filtroCelula}
            onChangeText={setFiltroCelula}
            placeholder="Digite o nome da célula"
            placeholderTextColor={colors.muted}
            className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
          />
        </View>

        {/* Lista de Membros */}
        <View className="gap-3">
          <Text className="text-lg font-bold text-foreground">
            Lista de Membros {filtroCelula && `(${membrosFiltrados.length})`}
          </Text>
          {membrosFiltrados.length === 0 ? (
            <View className="bg-surface rounded-2xl p-6 items-center">
              <Text className="text-muted text-center">
                {filtroCelula ? "Nenhum membro encontrado nesta célula" : "Nenhum membro cadastrado"}
              </Text>
            </View>
          ) : (
            membrosFiltrados.map((membro) => (
              <View
                key={membro.id}
                className="bg-surface rounded-2xl p-4 gap-2"
              >
                <View className="flex-row justify-between items-start gap-3">
                  <View className="flex-1 gap-1">
                    <Text className="text-base font-bold text-foreground">{membro.nome}</Text>
                    <Text className="text-sm text-muted">
                      Nascimento: {membro.dataNascimento}
                    </Text>
                    {membro.celula && (
                      <Text className="text-sm text-muted">Célula: {membro.celula}</Text>
                    )}
                  </View>
                  <View className="gap-2">
                    <View className="bg-primary/10 px-3 py-1 rounded-full">
                      <Text className="text-xs font-semibold text-primary">ID: {membro.userId}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        if (Platform.OS !== "web") {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                        Alert.alert(
                          "Deletar Membro",
                          `Tem certeza que deseja deletar completamente ${membro.nome}? Esta ação não pode ser desfeita.`,
                          [
                            { text: "Cancelar", onPress: () => {} },
                            {
                              text: "Deletar",
                              onPress: async () => {
                                try {
                                  await deleteUserMutation.mutateAsync(membro.userId);
                                  Alert.alert("Sucesso", "Membro deletado com sucesso!");
                                  refetch();
                                } catch (error: any) {
                                  Alert.alert("Erro", error.message || "Erro ao deletar membro");
                                }
                              },
                              style: "destructive",
                            },
                          ]
                        );
                      }}
                      className="bg-error/20 px-3 py-1.5 rounded-full"
                    >
                      <Text className="text-xs font-semibold text-error">🗑️ Deletar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Botão Voltar */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-border py-3 rounded-full items-center mt-4"
        >
          <Text className="text-foreground font-semibold">Voltar</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
