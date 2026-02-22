import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert, Switch } from "react-native";
import { useState, useCallback } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { router, useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { type AvisoImportante } from "@/lib/data/aviso-importante";
import { trpc } from "@/lib/trpc";

export default function AvisoImportanteScreen() {
  const colors = useColors();
  const [aviso, setAviso] = useState<AvisoImportante | null>(null);
  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const { data: avisoData, isLoading: carregando, refetch } = trpc.avisoImportante.get.useQuery(undefined, {
    refetchOnWindowFocus: true,
  });

  const salvarMutation = trpc.avisoImportante.save.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  useFocusEffect(
    useCallback(() => {
      if (avisoData) {
        setAviso(avisoData);
        setTitulo(avisoData.titulo);
        setMensagem(avisoData.mensagem);
        setAtivo(avisoData.ativo);
      }
    }, [avisoData])
  );

  const handleSalvar = async () => {
    if (!titulo.trim()) {
      Alert.alert("Atenção", "O título não pode estar vazio");
      return;
    }

    if (!mensagem.trim()) {
      Alert.alert("Atenção", "A mensagem não pode estar vazia");
      return;
    }

    try {
      setSalvando(true);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      await salvarMutation.mutateAsync({
        titulo: titulo.trim(),
        mensagem: mensagem.trim(),
        ativo: ativo ? 1 : 0,
      });
      Alert.alert("Sucesso", "Aviso importante atualizado e sincronizado!");
      router.back();
    } catch (error) {
      console.error("Erro ao salvar aviso:", error);
      Alert.alert("Erro", "Não foi possível salvar o aviso importante");
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-muted">Carregando...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
        {/* Header */}
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            className="w-10 h-10 items-center justify-center rounded-full bg-surface"
            onPress={() => router.back()}
          >
            <Text className="text-xl">←</Text>
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-3xl font-bold text-foreground">Aviso Importante</Text>
            <Text className="text-sm text-muted mt-1">Edite o aviso exibido na home</Text>
          </View>
        </View>

        {/* Status */}
        <View className="bg-surface rounded-2xl p-4 gap-3 border border-border flex-row items-center justify-between">
          <View>
            <Text className="text-base font-semibold text-foreground">Status</Text>
            <Text className="text-sm text-muted">{ativo ? "Ativo" : "Inativo"}</Text>
          </View>
          <Switch
            value={ativo}
            onValueChange={setAtivo}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={ativo ? colors.primary : colors.muted}
          />
        </View>

        {/* Título */}
        <View className="gap-2">
          <Text className="text-base font-semibold text-foreground">Título</Text>
          <TextInput
            className="bg-surface rounded-xl p-4 text-foreground border border-border"
            style={{ color: colors.foreground, borderColor: colors.border }}
            placeholder="Digite o título do aviso"
            placeholderTextColor={colors.muted}
            value={titulo}
            onChangeText={setTitulo}
            maxLength={100}
          />
          <Text className="text-xs text-muted text-right">{titulo.length}/100</Text>
        </View>

        {/* Mensagem */}
        <View className="gap-2">
          <Text className="text-base font-semibold text-foreground">Mensagem</Text>
          <TextInput
            className="bg-surface rounded-xl p-4 text-foreground border border-border"
            style={{ color: colors.foreground, borderColor: colors.border, minHeight: 120 }}
            placeholder="Digite a mensagem do aviso"
            placeholderTextColor={colors.muted}
            value={mensagem}
            onChangeText={setMensagem}
            maxLength={500}
            multiline
            textAlignVertical="top"
          />
          <Text className="text-xs text-muted text-right">{mensagem.length}/500</Text>
        </View>

        {/* Pré-visualização */}
        <View className="gap-2">
          <Text className="text-base font-semibold text-foreground">Pré-visualização</Text>
          <View className="bg-warning/10 rounded-2xl p-5 gap-2 border border-warning/20">
            <View className="flex-row items-center gap-2">
              <Text className="text-2xl">📢</Text>
              <Text className="text-base font-semibold text-foreground">{titulo || "Aviso Importante"}</Text>
            </View>
            <Text className="text-sm text-foreground">
              {mensagem || "Sua mensagem aparecerá aqui..."}
            </Text>
          </View>
        </View>

        {/* Botões */}
        <View className="flex-row gap-3 pt-4">
          <TouchableOpacity
            className="flex-1 border-2 rounded-full py-3 items-center"
            style={{ borderColor: colors.primary }}
            onPress={() => router.back()}
          >
            <Text className="font-bold text-base" style={{ color: colors.primary }}>
              Cancelar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 rounded-full py-3 items-center"
            style={{ backgroundColor: colors.primary, opacity: salvando ? 0.6 : 1 }}
            onPress={handleSalvar}
            disabled={salvando}
          >
            <Text className="text-white font-bold text-base">
              {salvando ? "Salvando..." : "Salvar"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
