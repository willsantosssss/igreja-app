import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CompletarCadastroScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const createUserMutation = trpc.usuarios.create.useMutation();
  const { data: usuarioExistente } = trpc.usuarios.getByUserId.useQuery(undefined, {
    enabled: !!user,
  });

  const [nome, setNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [celula, setCelula] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: celulas = [] } = trpc.celulas.list.useQuery(undefined, {
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  useEffect(() => {
    // Se usuário já tem cadastro, redirecionar para home
    if (usuarioExistente) {
      router.replace("/(tabs)");
    }
  }, [usuarioExistente]);

  const formatarData = (text: string) => {
    // Remove caracteres não numéricos
    const numeros = text.replace(/\D/g, "");
    
    if (numeros.length <= 2) {
      return numeros;
    } else if (numeros.length <= 4) {
      return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
    } else {
      return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4, 8)}`;
    }
  };

  const validarData = (data: string): boolean => {
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regex.test(data)) return false;

    const [dia, mes, ano] = data.split("/").map(Number);
    
    if (mes < 1 || mes > 12) return false;
    if (dia < 1 || dia > 31) return false;
    
    const anoAtual = new Date().getFullYear();
    if (ano < 1900 || ano > anoAtual) return false;

    return true;
  };

  const handleConcluir = async () => {
    if (!nome.trim()) {
      Alert.alert("Erro", "Por favor, digite seu nome");
      return;
    }

    // Data de nascimento é opcional, mas se preenchida, deve ser válida
    if (dataNascimento && !validarData(dataNascimento)) {
      Alert.alert("Erro", "Data de nascimento inválida (use DD/MM/YYYY)");
      return;
    }

    if (!celula) {
      Alert.alert("Erro", "Por favor, selecione sua célula");
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setLoading(true);
    try {
      console.log("[CompletarCadastro] Iniciando cadastro com dados:", { nome, dataNascimento, celula, userId: user?.id });
      
      // Converter data para formato YYYY-MM-DD para o banco (opcional)
      let dataFormatada: string | undefined = undefined;
      if (dataNascimento) {
        const [dia, mes, ano] = dataNascimento.split("/");
        dataFormatada = `${ano}-${mes}-${dia}`;
      }

      console.log("[CompletarCadastro] Dados formatados:", { nome, dataNascimento: dataFormatada, celula });
      
      const resultado = await createUserMutation.mutateAsync({
        nome,
        dataNascimento: dataFormatada,
        celula,
      });
      
      console.log("[CompletarCadastro] Cadastro bem-sucedido:", resultado);

      // Marcar cadastro como completo
      await AsyncStorage.setItem("@cadastro_completo", "true");

      Alert.alert("Sucesso!", "Cadastro concluído com sucesso!");
      router.replace("/(tabs)");
    } catch (error) {
      console.error("[CompletarCadastro] Erro ao criar cadastro:", error);
      console.error("[CompletarCadastro] Erro detalhado:", JSON.stringify(error, null, 2));
      Alert.alert("Erro", "Não foi possível concluir o cadastro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Se o usuário não foi carregado após 3 segundos, continuar mesmo assim
  // Isso evita loop infinito se o cache falhar
  const [showTimeout, setShowTimeout] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user) {
        console.warn("[CompletarCadastro] User not loaded after 3s, continuing anyway");
        setShowTimeout(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [user]);

  useEffect(() => {
    if (!user && showTimeout) {
      AsyncStorage.getItem("@user_email").then((email) => {
        if (email) setUserEmail(email);
      });
    }
  }, [showTimeout]);

  if (!user && !showTimeout) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-muted">Carregando...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20, flexGrow: 1 }}>
        {/* Header */}
        <View className="gap-2">
          <Text className="text-3xl font-bold text-foreground">Bem-vindo!</Text>
          <Text className="text-base text-muted">
            Vamos completar seu cadastro para conectar você à comunidade
          </Text>
        </View>

        {/* Email do usuário (somente leitura) */}
        <View className="gap-2">
          <Text className="text-sm font-semibold text-foreground">Email</Text>
          <View className="bg-surface rounded-xl p-4 border border-border">
            <Text className="text-foreground">{user?.email || userEmail || "Email não carregado"}</Text>
          </View>
        </View>

        {/* Nome */}
        <View className="gap-2">
          <Text className="text-sm font-semibold text-foreground">Nome Completo *</Text>
          <TextInput
            className="bg-surface rounded-xl p-4 text-foreground border border-border"
            value={nome}
            onChangeText={setNome}
            placeholder="Seu nome completo"
            placeholderTextColor={colors.muted}
            editable={!loading}
          />
        </View>

        {/* Data de Nascimento */}
        <View className="gap-2">
          <Text className="text-sm font-semibold text-foreground">Data de Nascimento (opcional)</Text>
          <TextInput
            className="bg-surface rounded-xl p-4 text-foreground border border-border"
            value={dataNascimento}
            onChangeText={(text) => setDataNascimento(formatarData(text))}
            placeholder="DD/MM/YYYY"
            placeholderTextColor={colors.muted}
            keyboardType="numeric"
            maxLength={10}
            editable={!loading}
          />
          <Text className="text-xs text-muted">Formato: DD/MM/YYYY</Text>
        </View>

        {/* Célula */}
        <View className="gap-2">
          <Text className="text-sm font-semibold text-foreground">Célula *</Text>
          <View className="bg-surface rounded-xl border border-border overflow-hidden">
            {celulas.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row p-2 gap-2">
                  {celulas.map((cel) => (
                    <TouchableOpacity
                      key={cel.id}
                      className="px-4 py-2 rounded-full border-2"
                      style={{
                        backgroundColor: celula === cel.nome ? colors.primary : colors.surface,
                        borderColor: celula === cel.nome ? colors.primary : colors.border,
                      }}
                      onPress={() => setCelula(cel.nome)}
                      disabled={loading}
                    >
                      <Text
                        style={{
                          color: celula === cel.nome ? "#FFFFFF" : colors.foreground,
                          fontWeight: "600",
                          fontSize: 12,
                        }}
                      >
                        {cel.nome}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            ) : (
              <View className="p-4">
                <Text className="text-muted">Carregando células...</Text>
              </View>
            )}
          </View>
        </View>



        {/* Info */}
        <View className="bg-primary/10 rounded-2xl p-4 gap-2 border border-primary/20">
          <Text className="text-sm font-semibold text-foreground">ℹ️ Por que precisamos desses dados?</Text>
          <Text className="text-xs text-muted leading-relaxed">
            Essas informações nos ajudam a conectar você com sua célula, enviar lembretes de aniversário e manter você informado sobre eventos da comunidade.
          </Text>
        </View>

        {/* Botão Concluir */}
        <TouchableOpacity
          className="rounded-full py-4 items-center"
          style={{ backgroundColor: colors.primary }}
          onPress={handleConcluir}
          disabled={loading || !nome || !celula}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-bold text-base">Concluir Cadastro</Text>
          )}
        </TouchableOpacity>

        <Text className="text-xs text-muted text-center">* Campos obrigatórios | Data de nascimento é opcional</Text>
      </ScrollView>
    </ScreenContainer>
  );
}
