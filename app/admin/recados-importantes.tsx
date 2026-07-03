import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { useRecados } from "@/hooks/use-recados";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

export default function RecadosImportantesScreen() {
  const router = useRouter();
  const colors = useColors();
  const queryClient = useQueryClient();
  const { data: recados = [], isLoading } = useRecados();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");

  // Criar recado
  const createMutation = useMutation({
    mutationFn: async () => {
      return await trpc.recados.create.mutate({ titulo, conteudo });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recados"] });
      setTitulo("");
      setConteudo("");
      setShowForm(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Sucesso", "Recado criado com sucesso!");
    },
    onError: (error: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erro", error.message || "Erro ao criar recado");
    },
  });

  // Atualizar recado
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingId) return;
      return await trpc.recados.update.mutate({ id: editingId, titulo, conteudo });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recados"] });
      setTitulo("");
      setConteudo("");
      setEditingId(null);
      setShowForm(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Sucesso", "Recado atualizado com sucesso!");
    },
    onError: (error: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erro", error.message || "Erro ao atualizar recado");
    },
  });

  // Deletar recado
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await trpc.recados.delete.mutate(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recados"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Sucesso", "Recado deletado com sucesso!");
    },
    onError: (error: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erro", error.message || "Erro ao deletar recado");
    },
  });

  const handleEdit = (recado: any) => {
    setEditingId(recado.id);
    setTitulo(recado.titulo);
    setConteudo(recado.conteudo);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    Alert.alert("Confirmar", "Tem certeza que deseja deletar este recado?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Deletar",
        style: "destructive",
        onPress: () => deleteMutation.mutate(id),
      },
    ]);
  };

  const handleSave = () => {
    if (!titulo.trim() || !conteudo.trim()) {
      Alert.alert("Erro", "Título e conteúdo são obrigatórios");
      return;
    }

    if (editingId) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setTitulo("");
    setConteudo("");
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-border">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-lg font-semibold text-primary">← Voltar</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-foreground">Recados Importantes</Text>
          <View className="w-12" />
        </View>

        {/* Botão Novo Recado */}
        {!showForm && (
          <TouchableOpacity
            onPress={() => setShowForm(true)}
            className="m-4 bg-primary rounded-lg p-4"
            style={{ opacity: 0.9 }}
          >
            <Text className="text-center text-white font-semibold">+ Novo Recado</Text>
          </TouchableOpacity>
        )}

        {/* Formulário */}
        {showForm && (
          <View className="m-4 bg-surface rounded-lg p-4 border border-border">
            <Text className="text-lg font-bold text-foreground mb-3">
              {editingId ? "Editar Recado" : "Novo Recado"}
            </Text>

            <Text className="text-sm font-semibold text-foreground mb-2">Título</Text>
            <TextInput
              placeholder="Digite o título"
              value={titulo}
              onChangeText={setTitulo}
              className="bg-background border border-border rounded-lg p-3 text-foreground mb-4"
              placeholderTextColor={colors.muted}
            />

            <Text className="text-sm font-semibold text-foreground mb-2">Conteúdo</Text>
            <TextInput
              placeholder="Digite o conteúdo do recado"
              value={conteudo}
              onChangeText={setConteudo}
              multiline
              numberOfLines={5}
              className="bg-background border border-border rounded-lg p-3 text-foreground mb-4"
              placeholderTextColor={colors.muted}
              textAlignVertical="top"
            />

            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 bg-primary rounded-lg p-3"
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-center text-white font-semibold">
                    {editingId ? "Atualizar" : "Criar"}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCancel}
                className="flex-1 bg-muted rounded-lg p-3"
              >
                <Text className="text-center text-background font-semibold">Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Lista de Recados */}
        <View className="p-4">
          {isLoading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : recados.length === 0 ? (
            <Text className="text-center text-muted text-base">Nenhum recado cadastrado</Text>
          ) : (
            recados.map((recado) => (
              <View
                key={recado.id}
                className="bg-surface border border-border rounded-lg p-4 mb-3"
              >
                <Text className="text-lg font-bold text-foreground mb-2">{recado.titulo}</Text>
                <Text className="text-sm text-muted mb-3">{recado.conteudo}</Text>
                <Text className="text-xs text-muted mb-3">
                  Criado em: {formatDate(recado.criado_em)}
                </Text>

                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => handleEdit(recado)}
                    className="flex-1 bg-primary rounded-lg p-2"
                  >
                    <Text className="text-center text-white font-semibold text-sm">Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDelete(recado.id)}
                    className="flex-1 bg-error rounded-lg p-2"
                  >
                    <Text className="text-center text-white font-semibold text-sm">Deletar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
