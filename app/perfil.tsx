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
  const [editMode, setEditMode] = useState(false);

  // Buscar dados do usuário
  const { data: userData, isLoading: isLoadingUser, refetch } = trpc.usuarios.getMeuPerfil.useQuery(undefined, {
    enabled: !!user,
  });

  // Buscar células do banco
  const { data: celulas } = trpc.celulas.list.useQuery(undefined, {
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Atualizar a cada 30 segundos
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

  useEffect(() => {
    // Usar isLoadingUser do tRPC para controlar loading
    if (!isLoadingUser && userData !== undefined) {
      setNome(userData?.nome || "");
      setDataNascimento(userData?.dataNascimento || "");
      setCelula(userData?.celula || "");
      setLoading(false);
    }
  }, [isLoadingUser, userData]);

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
      Alert.alert("Atenção", "Por favor, preencha seu nome.");
      return;
    }

    // Validar e converter data
    let dataParaBanco = dataNascimento;
    if (dataNascimento && dataNascimento.includes("/")) {
      dataParaBanco = converterParaBanco(dataNascimento);
    }

    if (dataParaBanco && !/^\d{4}-\d{2}-\d{2}$/.test(dataParaBanco)) {
      Alert.alert("Atenção", "Data de nascimento inválida. Use o formato DD/MM/YYYY.");
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    updateMutation.mutate({
      nome: nome.trim(),
      dataNascimento: dataParaBanco || "2000-01-01",
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

  // Mostrar loading apenas enquanto carregando, não quando userData é null
  if (isLoadingUser) {
    return (
      <ScreenContainer className="p-6 justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-muted mt-4">Carregando perfil...</Text>
      </ScreenContainer>
    );
  }

  // Se userData é null, mostrar formulário vazio para criar perfil
  if (!userData) {
    return (
      <ScreenContainer>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Criar Perfil</Text>
            <Text className="text-base text-muted">
              Preencha suas informações pessoais para continuar
            </Text>
          </View>
          <View className="gap-4">
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
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Data de Nascimento</Text>
              <TextInput
                value={formatarDataExibicao(dataNascimento)}
                onChangeText={(text) => {
                  const formatada = formatarDataBanco(text);
                  setDataNascimento(converterParaBanco(formatada));
                }}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={colors.muted}
                className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
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
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
          <TouchableOpacity
            onPress={handleSave}
            disabled={updateMutation.isPending}
            className="bg-primary py-4 rounded-full items-center mt-4"
            style={{ opacity: updateMutation.isPending ? 0.6 : 1 }}
          >
            {updateMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-background font-bold text-base">Criar Perfil</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
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
              value={editMode ? formatarDataExibicao(dataNascimento) : formatarDataExibicao(dataNascimento)}
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
      </ScrollView>
    </ScreenContainer>
  );
}
