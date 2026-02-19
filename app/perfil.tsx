import { ScrollView, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export default function PerfilScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const [nome, setNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [celula, setCelula] = useState("");
  const [loading, setLoading] = useState(true);
  const [mostrarCelulas, setMostrarCelulas] = useState(false);

  // Buscar dados do usuário
  const { data: userData, refetch } = trpc.usuarios.getMeuPerfil.useQuery(undefined, {
    enabled: !!user,
  });

  // Buscar células do banco
  const { data: celulas } = trpc.celulas.list.useQuery();

  const updateMutation = trpc.usuarios.updateMeuPerfil.useMutation({
    onSuccess: () => {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert("Sucesso", "Seu perfil foi atualizado!");
      refetch();
    },
    onError: (error) => {
      Alert.alert("Erro", "Não foi possível atualizar o perfil. Tente novamente.");
      console.error("Erro ao atualizar perfil:", error);
    },
  });

  useEffect(() => {
    if (userData) {
      setNome(userData.nome || "");
      setDataNascimento(userData.dataNascimento || "");
      setCelula(userData.celula || "");
      setLoading(false);
    }
  }, [userData]);

  const handleSave = async () => {
    if (!nome.trim()) {
      Alert.alert("Atenção", "Por favor, preencha seu nome.");
      return;
    }

    // Validar formato de data (YYYY-MM-DD)
    if (dataNascimento && !/^\d{4}-\d{2}-\d{2}$/.test(dataNascimento)) {
      Alert.alert("Atenção", "Data de nascimento deve estar no formato AAAA-MM-DD (ex: 1990-05-15)");
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    updateMutation.mutate({
      nome: nome.trim(),
      dataNascimento: dataNascimento || "2000-01-01",
      celula: celula.trim(),
    });
  };

  if (!user) {
    return (
      <ScreenContainer className="p-6 justify-center items-center">
        <Text className="text-lg text-muted mb-4">Você precisa fazer login para acessar seu perfil.</Text>
        <TouchableOpacity
          onPress={() => router.push("/login")}
          className="bg-primary px-6 py-3 rounded-full"
        >
          <Text className="text-background font-semibold">Fazer Login</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  if (loading) {
    return (
      <ScreenContainer className="p-6 justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-muted mt-4">Carregando perfil...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
        {/* Header */}
        <View className="gap-2">
          <Text className="text-3xl font-bold text-foreground">Meu Perfil</Text>
          <Text className="text-base text-muted">
            Atualize suas informações pessoais
          </Text>
        </View>

        {/* Formulário */}
        <View className="gap-4">
          {/* Nome */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Nome Completo *</Text>
            <TextInput
              value={nome}
              onChangeText={setNome}
              placeholder="Seu nome completo"
              placeholderTextColor={colors.muted}
              className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
            />
          </View>

          {/* Data de Nascimento */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Data de Nascimento</Text>
            <TextInput
              value={dataNascimento}
              onChangeText={setDataNascimento}
              placeholder="AAAA-MM-DD (ex: 1990-05-15)"
              placeholderTextColor={colors.muted}
              className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
            />
            <Text className="text-xs text-muted">Formato: AAAA-MM-DD (ex: 1990-05-15)</Text>
          </View>

          {/* Célula */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Célula</Text>
            <TouchableOpacity
              onPress={() => setMostrarCelulas(!mostrarCelulas)}
              className="bg-surface border border-border rounded-xl px-4 py-3 flex-row justify-between items-center"
            >
              <Text className={celula ? "text-foreground" : "text-muted"}>
                {celula || "Selecione sua célula"}
              </Text>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>
            
            {mostrarCelulas && celulas && (
              <View className="bg-surface border border-border rounded-xl overflow-hidden">
                <ScrollView style={{ maxHeight: 200 }}>
                  <TouchableOpacity
                    onPress={() => {
                      setCelula("");
                      setMostrarCelulas(false);
                    }}
                    className="px-4 py-3 border-b border-border"
                  >
                    <Text className="text-muted">Nenhuma</Text>
                  </TouchableOpacity>
                  {celulas.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      onPress={() => {
                        setCelula(c.nome);
                        setMostrarCelulas(false);
                      }}
                      className="px-4 py-3 border-b border-border"
                    >
                      <Text className="text-foreground font-semibold">{c.nome}</Text>
                      <Text className="text-xs text-muted">Líder: {c.lider}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Botão Salvar */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={updateMutation.isPending}
            className="bg-primary py-4 rounded-full items-center mt-4"
            style={{ opacity: updateMutation.isPending ? 0.6 : 1 }}
          >
            {updateMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-background font-bold text-base">Salvar Alterações</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Informações da Conta */}
        <View className="bg-surface rounded-2xl p-4 gap-2 mt-4">
          <Text className="text-sm font-semibold text-foreground">Informações da Conta</Text>
          <View className="gap-1">
            <Text className="text-xs text-muted">Email: {user.email || "Não informado"}</Text>
            <Text className="text-xs text-muted">ID: {user.id}</Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
