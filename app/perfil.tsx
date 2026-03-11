import { ScrollView, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { BackButton } from "@/components/back-button";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export default function PerfilScreen() {
  const colors = useColors();
  const { user, loading: authLoading } = useAuth();
  const [nome, setNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [celula, setCelula] = useState("");
  const [loading, setLoading] = useState(true);
  const [mostrarCelulas, setMostrarCelulas] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Buscar dados do usuário (Blindado com enabled)
  const { data: userData, isLoading: isLoadingUser, refetch } = trpc.usuarios.getMeuPerfil.useQuery(undefined, {
    enabled: !!user && !authLoading,
    retry: false,
  });

  // Buscar células do banco (Blindado com enabled)
  const { data: celulas } = trpc.celulas.list.useQuery(undefined, {
    enabled: !!user && !authLoading,
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });

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

  const deleteAccountMutation = trpc.usuarios.deleteAccount.useMutation({
    onSuccess: () => {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert("Conta Deletada", "Sua conta foi deletada com sucesso.");
      router.replace("/login");
    },
    onError: (error) => {
      Alert.alert("Erro", "Não foi possível deletar a conta. Tente novamente.");
      console.error("Erro ao deletar conta:", error);
    },
  });

  // Redirecionamento seguro se não estiver logado
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (!isLoadingUser && userData !== undefined) {
      setNome(userData?.nome || "");
      setDataNascimento(userData?.dataNascimento || "");
      setCelula(userData?.celula || "");
      setLoading(false);
    }
  }, [isLoadingUser, userData]);

  // Tela de carregamento inicial para evitar que o app tente ler 'user' nulo
  if (authLoading || !user) {
    return (
      <ScreenContainer className="items-center justify-center bg-background">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  const formatarDataExibicao = (data: string) => {
    if (!data) return "";
    if (data.includes("-")) {
      const [ano, mes, dia] = data.split("-");
      return `${dia}/${mes}/${ano}`;
    }
    return data;
  };

  const formatarDataBanco = (data: string) => {
    if (!data) return "";
    const numeros = data.replace(/\D/g, "");
    if (numeros.length <= 2) {
      return numeros;
    } else if (numeros.length <= 4) {
      return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
    } else {
      return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4, 8)}`;
    }
  };

  const converterParaBanco = (data: string) => {
    const numeros = data.replace(/\D/g, "");
    if (numeros.length === 8) {
      return `${numeros.slice(4, 8)}-${numeros.slice(2, 4)}-${numeros.slice(0, 2)}`;
    }
    return data;
  };

  const handleSave = () => {
    if (!nome.trim()) {
      Alert.alert("Erro", "O nome é obrigatório");
      return;
    }
    updateMutation.mutate({
      nome,
      dataNascimento,
      celula,
    });
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Deletar Conta",
      "Tem certeza que deseja deletar sua conta? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Deletar",
          style: "destructive",
          onPress: () => deleteAccountMutation.mutate(),
        },
      ]
    );
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView className="flex-1 p-6">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-8">
          <BackButton />
          <Text className="text-2xl font-bold text-foreground">Meu Perfil</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Título */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-foreground">Editar Perfil</Text>
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
              value={formatarDataExibicao(dataNascimento)}
              onChangeText={(text) => {
                const formatada = formatarDataBanco(text);
                setDataNascimento(converterParaBanco(formatada));
              }}
              placeholder="DD/MM/YYYY (ex: 15/05/1990)"
              placeholderTextColor={colors.muted}
              className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
              keyboardType="numeric"
              maxLength={10}
            />
            <Text className="text-xs text-muted">Formato: DD/MM/YYYY (ex: 15/05/1990)</Text>
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

        {/* Botão Deletar Conta */}
        <TouchableOpacity
          onPress={handleDeleteAccount}
          disabled={deleteAccountMutation.isPending}
          className="bg-error/10 border border-error rounded-full py-4 items-center mt-4 mb-12"
          style={{ opacity: deleteAccountMutation.isPending ? 0.6 : 1 }}
        >
          {deleteAccountMutation.isPending ? (
            <ActivityIndicator color={colors.error} />
          ) : (
            <Text className="text-error font-bold text-base">Deletar Conta</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
