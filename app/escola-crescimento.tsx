import { ScrollView, Text, View, TouchableOpacity, Alert, TextInput, Modal, Platform } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import { router } from "expo-router";
import { trpc } from "@/lib/trpc";
import { useCelulas } from "@/lib/data/celulas";
import * as Haptics from "expo-haptics";

const CURSOS = ["Conecte", "Lidere 1", "Lidere 2", "Avance"] as const;

export default function EscolaCrescimentoScreen() {
  const colors = useColors();
  const [nome, setNome] = useState("");
  const [celula, setCelula] = useState("");
  const [curso, setCurso] = useState<typeof CURSOS[number]>("Conecte");
  const [mostrarSeletorCelulas, setMostrarSeletorCelulas] = useState(false);
  const [mostrarSeletorCursos, setMostrarSeletorCursos] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const { data: celulasList = [], isLoading: carregandoCelulas } = useCelulas();
  const celulas = celulasList.filter((c: any) => c && c.nome && c.lider && c.horario);

  // Hook para criar inscrição
  // @ts-expect-error - Endpoint foi adicionado mas tipos não foram regenerados
  const criarInscricaoMutation = trpc.escolaCrescimento.create.useMutation();

  const handleInscrever = async () => {
    if (!nome.trim()) {
      Alert.alert("Atenção", "Informe seu nome.");
      return;
    }
    if (!celula.trim()) {
      Alert.alert("Atenção", "Informe sua célula.");
      return;
    }
    if (!curso) {
      Alert.alert("Atenção", "Selecione um curso.");
      return;
    }

    setCarregando(true);
    try {
      await criarInscricaoMutation.mutateAsync({
        nome: nome.trim(),
        celula: celula.trim(),
        curso,
      });

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert("Sucesso", "Inscrição realizada com sucesso! 🎉", [
        {
          text: "OK",
          onPress: () => {
            setNome("");
            setCelula("");
            setCurso("Conecte");
            router.back();
          },
        },
      ]);
    } catch (error) {
      console.error("Erro ao inscrever:", error);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Alert.alert("Erro", "Não foi possível realizar a inscrição. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1, gap: 20 }}>
        {/* Header */}
        <View className="gap-2">
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginBottom: 8 }}
          >
            <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text className="text-3xl font-bold text-foreground">Escola de Crescimento</Text>
          <Text className="text-base text-muted">
            Desenvolva seu potencial espiritual através de nossos cursos
          </Text>
        </View>

        {/* Informações sobre cursos */}
        <View className="bg-surface rounded-2xl p-4 gap-3 border border-border">
          <Text className="text-lg font-bold text-foreground">Cursos Disponíveis</Text>
          <View className="gap-2">
            <View className="flex-row items-start gap-2">
              <Text className="text-primary font-bold">•</Text>
              <View className="flex-1">
                <Text className="font-semibold text-foreground">Conecte</Text>
                <Text className="text-sm text-muted">Principios elementares da fé.</Text>
              </View>
            </View>
            <View className="flex-row items-start gap-2">
              <Text className="text-primary font-bold">•</Text>
              <View className="flex-1">
                <Text className="font-semibold text-foreground">Lidere 1</Text>
                <Text className="text-sm text-muted">Uma vida com propósitos.</Text>
              </View>
            </View>
            <View className="flex-row items-start gap-2">
              <Text className="text-primary font-bold">•</Text>
              <View className="flex-1">
                <Text className="font-semibold text-foreground">Lidere 2</Text>
                <Text className="text-sm text-muted">Tornando-se um cristão apaixonado e contagiante.</Text>
              </View>
            </View>
            <View className="flex-row items-start gap-2">
              <Text className="text-primary font-bold">•</Text>
              <View className="flex-1">
                <Text className="font-semibold text-foreground">Avançe</Text>
                <Text className="text-sm text-muted">Kriptonita: Como destruir o que rouba a sua força.</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Formulário */}
        <View className="gap-4">
          <Text className="text-lg font-bold text-foreground">Formulário de Inscrição</Text>

          {/* Nome */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Nome</Text>
            <TextInput
              placeholder="Seu nome completo"
              placeholderTextColor={colors.muted}
              value={nome}
              onChangeText={setNome}
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              editable={!carregando}
            />
          </View>

          {/* Célula */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Célula</Text>
            <TouchableOpacity
              onPress={() => setMostrarSeletorCelulas(true)}
              disabled={carregando}
              className="bg-surface border border-border rounded-lg px-4 py-3 flex-row items-center justify-between"
            >
              <Text className={celula ? "text-foreground" : "text-muted"}>
                {celula || "Selecione sua célula"}
              </Text>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>
          </View>

          {/* Curso */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Curso</Text>
            <TouchableOpacity
              onPress={() => setMostrarSeletorCursos(true)}
              disabled={carregando}
              className="bg-surface border border-border rounded-lg px-4 py-3 flex-row items-center justify-between"
            >
              <Text className="text-foreground">{curso}</Text>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>
          </View>

          {/* Botão Inscrever */}
          <TouchableOpacity
            onPress={handleInscrever}
            disabled={carregando}
            style={{
              backgroundColor: colors.primary,
              opacity: carregando ? 0.6 : 1,
            }}
            className="rounded-lg py-4 items-center mt-4"
          >
            <Text className="text-white font-bold text-base">
              {carregando ? "Inscrevendo..." : "Inscrever-se"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal Seletor de Células */}
      <Modal
        visible={mostrarSeletorCelulas}
        transparent
        animationType="slide"
        onRequestClose={() => setMostrarSeletorCelulas(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View
            style={{
              flex: 1,
              marginTop: "auto",
              backgroundColor: colors.background,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingTop: 20,
            }}
          >
            <View className="px-6 pb-4 border-b border-border flex-row items-center justify-between">
              <Text className="text-lg font-bold text-foreground">Selecione sua Célula</Text>
              <TouchableOpacity onPress={() => setMostrarSeletorCelulas(false)}>
                <IconSymbol name="chevron.right" size={24} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6 py-4">
              {celulas.map((cel: any) => (
                <TouchableOpacity
                  key={cel.id}
                  onPress={() => {
                    setCelula(cel.nome);
                    setMostrarSeletorCelulas(false);
                  }}
                  className="py-4 border-b border-border"
                >
                  <Text className="text-base text-foreground font-medium">{cel.nome}</Text>
                  <Text className="text-sm text-muted mt-1">Líder: {cel.lider}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Seletor de Cursos */}
      <Modal
        visible={mostrarSeletorCursos}
        transparent
        animationType="slide"
        onRequestClose={() => setMostrarSeletorCursos(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View
            style={{
              flex: 1,
              marginTop: "auto",
              backgroundColor: colors.background,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingTop: 20,
            }}
          >
            <View className="px-6 pb-4 border-b border-border flex-row items-center justify-between">
              <Text className="text-lg font-bold text-foreground">Selecione um Curso</Text>
              <TouchableOpacity onPress={() => setMostrarSeletorCursos(false)}>
                <IconSymbol name="chevron.right" size={24} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6 py-4">
              {CURSOS.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => {
                    setCurso(c);
                    setMostrarSeletorCursos(false);
                  }}
                  className="py-4 border-b border-border"
                  style={{
                    backgroundColor: curso === c ? `${colors.primary}20` : "transparent",
                  }}
                >
                  <View className="flex-row items-center justify-between">
                    <Text
                      className="text-base font-medium"
                      style={{ color: curso === c ? colors.primary : colors.foreground }}
                    >
                      {c}
                    </Text>
                    {curso === c && (
                      <IconSymbol name="checkmark" size={20} color={colors.primary} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
