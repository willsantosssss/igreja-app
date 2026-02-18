import { ScrollView, Text, View, TextInput, TouchableOpacity, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import { getContatos, atualizarContatos, type ContatosIgreja } from "@/lib/data/contatos";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export default function ContatosAdminScreen() {
  const colors = useColors();
  const [contatos, setContatos] = useState<ContatosIgreja>({
    telefone: '',
    whatsapp: '',
    email: '',
  });
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarContatos();
  }, []);

  const carregarContatos = async () => {
    const dados = await getContatos();
    setContatos(dados);
  };

  const handleSalvar = async () => {
    // Validações
    if (!contatos.telefone.trim()) {
      Alert.alert("Erro", "Telefone é obrigatório");
      return;
    }
    if (!contatos.whatsapp.trim()) {
      Alert.alert("Erro", "WhatsApp é obrigatório");
      return;
    }
    if (!contatos.email.trim()) {
      Alert.alert("Erro", "Email é obrigatório");
      return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contatos.email)) {
      Alert.alert("Erro", "Email inválido");
      return;
    }

    setSalvando(true);
    try {
      await atualizarContatos(contatos);
      
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      Alert.alert(
        "Sucesso!",
        "Contatos da igreja atualizados com sucesso",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert("Erro", "Falha ao salvar contatos");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
        {/* Header */}
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center"
          >
            <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-foreground">Contatos da Igreja</Text>
            <Text className="text-sm text-muted">Gerencie as informações de contato</Text>
          </View>
        </View>

        {/* Formulário */}
        <View className="gap-4">
          {/* Telefone */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Telefone</Text>
            <View 
              className="flex-row items-center gap-3 rounded-xl p-4 border"
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
            >
              <Text className="text-2xl">📞</Text>
              <TextInput
                className="flex-1 text-base text-foreground"
                placeholder="+55 66 3411-0000"
                placeholderTextColor={colors.muted}
                value={contatos.telefone}
                onChangeText={(text) => setContatos({ ...contatos, telefone: text })}
                keyboardType="phone-pad"
              />
            </View>
            <Text className="text-xs text-muted">Telefone fixo da igreja</Text>
          </View>

          {/* WhatsApp */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">WhatsApp</Text>
            <View 
              className="flex-row items-center gap-3 rounded-xl p-4 border"
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
            >
              <Text className="text-2xl">💬</Text>
              <TextInput
                className="flex-1 text-base text-foreground"
                placeholder="+55 66 99999-0000"
                placeholderTextColor={colors.muted}
                value={contatos.whatsapp}
                onChangeText={(text) => setContatos({ ...contatos, whatsapp: text })}
                keyboardType="phone-pad"
              />
            </View>
            <Text className="text-xs text-muted">Número com código do país (+55)</Text>
          </View>

          {/* Email */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Email</Text>
            <View 
              className="flex-row items-center gap-3 rounded-xl p-4 border"
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
            >
              <Text className="text-2xl">✉️</Text>
              <TextInput
                className="flex-1 text-base text-foreground"
                placeholder="contato@igreja.com.br"
                placeholderTextColor={colors.muted}
                value={contatos.email}
                onChangeText={(text) => setContatos({ ...contatos, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <Text className="text-xs text-muted">Email oficial da igreja</Text>
          </View>
        </View>

        {/* Botão Salvar */}
        <TouchableOpacity
          className="rounded-full py-4 items-center"
          style={{ backgroundColor: colors.primary, opacity: salvando ? 0.6 : 1 }}
          onPress={handleSalvar}
          disabled={salvando}
        >
          <Text className="text-white font-bold text-base">
            {salvando ? "Salvando..." : "Salvar Contatos"}
          </Text>
        </TouchableOpacity>

        {/* Informação */}
        <View 
          className="rounded-xl p-4 border"
          style={{ backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}40` }}
        >
          <Text className="text-sm text-foreground leading-relaxed">
            ℹ️ Estes contatos serão exibidos na seção "Suporte" da aba "Mais" para todos os usuários do aplicativo.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
