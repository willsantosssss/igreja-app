import { ScrollView, Text, View, TouchableOpacity, Alert, Image } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import * as Clipboard from "expo-clipboard";
import { trpc } from "@/lib/trpc";

// Tipos de contribuição fixos (não vêm do banco)
const TIPOS_CONTRIBUICAO = [
  { id: '1', nome: 'Dízimo', emoji: '💰', descricao: '10% da sua renda devolvida a Deus como reconhecimento de Sua provisão.' },
  { id: '2', nome: 'Oferta', emoji: '🎁', descricao: 'Contribuição voluntária além do dízimo para apoiar projetos e necessidades da igreja.' },
  { id: '3', nome: 'Missões', emoji: '🌍', descricao: 'Apoio financeiro para o trabalho missionário e evangelístico.' },
  { id: '4', nome: 'Projetos Especiais', emoji: '🏗️', descricao: 'Contribuição para obras, reformas e projetos específicos da igreja.' },
];

export default function ContribuicoesScreen() {
  const colors = useColors();
  const { data: dados, isLoading } = trpc.contribuicao.get.useQuery(undefined, {
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });

  const handleCopyPix = async () => {
    if (!dados) return;
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await Clipboard.setStringAsync(dados.pixKey);
    Alert.alert("Copiado!", "Chave PIX copiada para a área de transferência.");
  };

  const handleCopyBankInfo = async () => {
    if (!dados) return;
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    const info = `Titular: ${dados.titular}\nBanco: ${dados.bank}\nAgência: ${dados.agency}\nConta: ${dados.account}\nCNPJ: ${dados.cnpj}`;
    await Clipboard.setStringAsync(info);
    Alert.alert("Copiado!", "Dados bancários copiados para a área de transferência.");
  };

  if (isLoading || !dados) {
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
            <Text className="text-3xl font-bold text-foreground">Contribuições</Text>
            <Text className="text-sm text-muted mt-1">Apoie o trabalho da igreja</Text>
          </View>
        </View>

        {/* Mensagem motivacional */}
        <View className="bg-primary/10 rounded-2xl p-5 gap-2 border border-primary/20">
          <Text className="text-base font-semibold text-foreground">{dados.mensagemMotivacional}</Text>
          <Text className="text-sm text-muted">{dados.versiculoRef}</Text>
        </View>

        {/* Tipos de contribuição */}
        <View className="gap-3">
          <Text className="text-xl font-bold text-foreground">Tipos de Contribuição</Text>
          {TIPOS_CONTRIBUICAO.map(tipo => (
            <View key={tipo.id} className="bg-surface rounded-2xl p-5 gap-2 border border-border">
              <View className="flex-row items-center gap-2">
                <Text className="text-2xl">{tipo.emoji}</Text>
                <Text className="text-base font-bold text-foreground">{tipo.nome}</Text>
              </View>
              <Text className="text-sm text-muted leading-relaxed">{tipo.descricao}</Text>
            </View>
          ))}
        </View>

        {/* PIX */}
        <View className="gap-3">
          <Text className="text-xl font-bold text-foreground">PIX</Text>
          <View className="bg-surface rounded-2xl p-5 gap-4 border border-border">
            <View className="items-center gap-3">
              <Image
              source={require("@/assets/images/qr-code-pix.jpg")}
              style={{ width: 200, height: 200 }}
              className="rounded-2xl"
            />
              <Text className="text-sm text-muted text-center">
                Escaneie o código acima ou use a chave PIX
              </Text>
            </View>

            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Chave PIX:</Text>
              <View className="bg-background rounded-xl p-4 border border-border">
                <Text className="text-base font-mono text-foreground text-center">{dados.pixKey}</Text>
              </View>
            </View>

            <TouchableOpacity
              className="rounded-full py-3 items-center"
              style={{ backgroundColor: colors.primary }}
              onPress={handleCopyPix}
            >
              <Text className="text-white font-bold text-base">Copiar Chave PIX</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dados Bancários */}
        <View className="gap-3">
          <Text className="text-xl font-bold text-foreground">Transferência Bancária</Text>
          <View className="bg-surface rounded-2xl p-5 gap-3 border border-border">
            {dados.titular && (
              <View className="gap-1">
                <Text className="text-xs text-muted">Titular</Text>
                <Text className="text-base font-semibold text-foreground">{dados.titular}</Text>
              </View>
            )}
            <View className="gap-1">
              <Text className="text-xs text-muted">Banco</Text>
              <Text className="text-base font-semibold text-foreground">{dados.bank}</Text>
            </View>
            <View className="flex-row gap-4">
              <View className="flex-1 gap-1">
                <Text className="text-xs text-muted">Agência</Text>
                <Text className="text-base font-semibold text-foreground">{dados.agency}</Text>
              </View>
              <View className="flex-1 gap-1">
                <Text className="text-xs text-muted">Conta</Text>
                <Text className="text-base font-semibold text-foreground">{dados.account}</Text>
              </View>
            </View>
            <View className="gap-1">
              <Text className="text-xs text-muted">CNPJ</Text>
              <Text className="text-base font-semibold text-foreground">{dados.cnpj}</Text>
            </View>

            <TouchableOpacity
              className="border-2 rounded-full py-3 items-center mt-2"
              style={{ borderColor: colors.primary }}
              onPress={handleCopyBankInfo}
            >
              <Text className="font-bold text-base" style={{ color: colors.primary }}>
                Copiar Dados Bancários
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Agradecimento */}
        <View className="bg-success/10 rounded-2xl p-5 gap-2 border border-success/20">
          <Text className="text-base font-semibold text-foreground">Obrigado pela sua generosidade! 🙏</Text>
          <Text className="text-sm text-muted leading-relaxed">{dados.mensagemAgradecimento}</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
