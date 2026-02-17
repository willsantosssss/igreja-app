import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

interface BatismoData {
  nome: string;
  dataNascimento: string;
  telefone: string;
  email: string;
  dataPretendida: string;
  motivacao: string;
  createdAt: string;
}

export default function BatismoScreen() {
  const colors = useColors();
  const [nome, setNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [dataPretendida, setDataPretendida] = useState("");
  const [motivacao, setMotivacao] = useState("");
  const [loading, setLoading] = useState(false);

  const formatDate = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length <= 2) {
      return cleaned;
    } else if (cleaned.length <= 4) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    } else {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
    }
  };

  const formatPhone = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length <= 2) {
      return cleaned;
    } else if (cleaned.length <= 7) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    } else {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
    }
  };

  const handleSubmit = async () => {
    if (!nome.trim()) {
      Alert.alert("Atenção", "Por favor, preencha seu nome completo.");
      return;
    }

    if (!dataNascimento.trim() || dataNascimento.length < 10) {
      Alert.alert("Atenção", "Por favor, preencha sua data de nascimento (DD/MM/YYYY).");
      return;
    }

    if (!telefone.trim() || telefone.length < 14) {
      Alert.alert("Atenção", "Por favor, preencha seu telefone com DDD.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      Alert.alert("Atenção", "Por favor, preencha um email válido.");
      return;
    }

    if (!dataPretendida.trim() || dataPretendida.length < 10) {
      Alert.alert("Atenção", "Por favor, preencha a data pretendida para o batismo.");
      return;
    }

    if (!motivacao.trim() || motivacao.length < 20) {
      Alert.alert("Atenção", "Por favor, descreva sua motivação (mínimo 20 caracteres).");
      return;
    }

    setLoading(true);

    try {
      const batismoData: BatismoData = {
        nome: nome.trim(),
        dataNascimento: dataNascimento.trim(),
        telefone: telefone.trim(),
        email: email.trim(),
        dataPretendida: dataPretendida.trim(),
        motivacao: motivacao.trim(),
        createdAt: new Date().toISOString(),
      };

      // Salvar inscrição localmente
      const inscricoes = await AsyncStorage.getItem("@batismo_inscricoes");
      const lista = inscricoes ? JSON.parse(inscricoes) : [];
      lista.push(batismoData);
      await AsyncStorage.setItem("@batismo_inscricoes", JSON.stringify(lista));

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert(
        "Inscrição Enviada!",
        `Obrigado ${nome}! Sua inscrição para batismo foi registrada. Em breve entraremos em contato para confirmar a data.`,
        [{ text: "OK", onPress: () => router.back() }]
      );

      // Limpar formulário
      setNome("");
      setDataNascimento("");
      setTelefone("");
      setEmail("");
      setDataPretendida("");
      setMotivacao("");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível enviar sua inscrição. Tente novamente.");
      console.error("Batismo submission error:", error);
    } finally {
      setLoading(false);
    }
  };

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
            <Text className="text-3xl font-bold text-foreground">Batismo</Text>
            <Text className="text-sm text-muted mt-1">
              Inscrição para batismo
            </Text>
          </View>
        </View>

        {/* Info Box */}
        <View className="bg-success/10 rounded-2xl p-5 gap-2 border border-success/20">
          <View className="flex-row items-center gap-2">
            <Text className="text-2xl">💧</Text>
            <Text className="text-base font-semibold text-foreground flex-1">
              Batismo em Águas
            </Text>
          </View>
          <Text className="text-sm text-muted leading-relaxed">
            O batismo é um passo importante na vida cristã, representando sua decisão de seguir a Jesus Cristo.
          </Text>
        </View>

        {/* Form */}
        <View className="gap-4">
          {/* Nome */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Nome Completo *</Text>
            <TextInput
              className="bg-surface rounded-xl px-4 py-3 text-foreground border"
              style={{ borderColor: colors.border }}
              placeholder="Digite seu nome completo"
              placeholderTextColor={colors.muted}
              value={nome}
              onChangeText={setNome}
              editable={!loading}
            />
          </View>

          {/* Data de Nascimento */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Data de Nascimento *</Text>
            <TextInput
              className="bg-surface rounded-xl px-4 py-3 text-foreground border"
              style={{ borderColor: colors.border }}
              placeholder="DD/MM/YYYY"
              placeholderTextColor={colors.muted}
              value={dataNascimento}
              onChangeText={(text) => setDataNascimento(formatDate(text))}
              keyboardType="numeric"
              maxLength={10}
              editable={!loading}
            />
          </View>

          {/* Telefone */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Telefone com DDD *</Text>
            <TextInput
              className="bg-surface rounded-xl px-4 py-3 text-foreground border"
              style={{ borderColor: colors.border }}
              placeholder="(XX) XXXXX-XXXX"
              placeholderTextColor={colors.muted}
              value={telefone}
              onChangeText={(text) => setTelefone(formatPhone(text))}
              keyboardType="phone-pad"
              maxLength={15}
              editable={!loading}
            />
          </View>

          {/* Email */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Email *</Text>
            <TextInput
              className="bg-surface rounded-xl px-4 py-3 text-foreground border"
              style={{ borderColor: colors.border }}
              placeholder="seu.email@exemplo.com"
              placeholderTextColor={colors.muted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              editable={!loading}
            />
          </View>

          {/* Data Pretendida */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Data Pretendida para Batismo *</Text>
            <TextInput
              className="bg-surface rounded-xl px-4 py-3 text-foreground border"
              style={{ borderColor: colors.border }}
              placeholder="DD/MM/YYYY"
              placeholderTextColor={colors.muted}
              value={dataPretendida}
              onChangeText={(text) => setDataPretendida(formatDate(text))}
              keyboardType="numeric"
              maxLength={10}
              editable={!loading}
            />
            <Text className="text-xs text-muted">
              Sugestão: próximo domingo ou data especial
            </Text>
          </View>

          {/* Motivação */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">
              Por que deseja ser batizado? *
            </Text>
            <TextInput
              className="bg-surface rounded-xl px-4 py-3 text-foreground border"
              style={{ borderColor: colors.border, minHeight: 100, textAlignVertical: "top" }}
              placeholder="Compartilhe sua motivação e seu testemunho..."
              placeholderTextColor={colors.muted}
              value={motivacao}
              onChangeText={setMotivacao}
              multiline
              numberOfLines={5}
              editable={!loading}
            />
            <Text className="text-xs text-muted">
              {motivacao.length}/200 caracteres
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          className="rounded-full py-4 items-center"
          style={{ backgroundColor: colors.primary }}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text className="text-white font-bold text-base">
            {loading ? "Enviando..." : "Enviar Inscrição"}
          </Text>
        </TouchableOpacity>

        {/* Info Footer */}
        <View className="bg-surface rounded-xl p-4 gap-2 border border-border">
          <Text className="text-sm font-semibold text-foreground">Próximos Passos</Text>
          <Text className="text-xs text-muted leading-relaxed">
            1. Sua inscrição será revisada pela liderança da igreja
            2. Você receberá um contato confirmando a data
            3. Haverá uma breve conversa com o pastor antes do batismo
            4. Celebraremos seu compromisso com Jesus!
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
