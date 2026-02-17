import { ScrollView, Text, View, TouchableOpacity, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import * as Clipboard from "expo-clipboard";

export default function ContribuicoesScreen() {
  const colors = useColors();

  const pixKey = "igreja@connect.com.br";
  const bankInfo = {
    bank: "Banco do Brasil",
    agency: "1234-5",
    account: "67890-1",
    cnpj: "12.345.678/0001-90",
  };

  const handleCopyPix = async () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    await Clipboard.setStringAsync(pixKey);
    Alert.alert("Copiado!", "Chave PIX copiada para a área de transferência.");
  };

  const handleCopyBankInfo = async () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    const info = `Banco: ${bankInfo.bank}\nAgência: ${bankInfo.agency}\nConta: ${bankInfo.account}\nCNPJ: ${bankInfo.cnpj}`;
    await Clipboard.setStringAsync(info);
    Alert.alert("Copiado!", "Dados bancários copiados para a área de transferência.");
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
            <Text className="text-3xl font-bold text-foreground">Contribuições</Text>
            <Text className="text-sm text-muted mt-1">
              Apoie o trabalho da igreja
            </Text>
          </View>
        </View>

        {/* Mensagem motivacional */}
        <View className="bg-primary/10 rounded-2xl p-5 gap-2 border border-primary/20">
          <Text className="text-base font-semibold text-foreground">
            "Cada um contribua segundo propôs no seu coração"
          </Text>
          <Text className="text-sm text-muted">
            2 Coríntios 9:7
          </Text>
        </View>

        {/* Tipos de contribuição */}
        <View className="gap-3">
          <Text className="text-xl font-bold text-foreground">Tipos de Contribuição</Text>
          
          <View className="bg-surface rounded-2xl p-5 gap-2 border border-border">
            <View className="flex-row items-center gap-2">
              <Text className="text-2xl">💰</Text>
              <Text className="text-base font-bold text-foreground">Dízimo</Text>
            </View>
            <Text className="text-sm text-muted leading-relaxed">
              10% da sua renda devolvida a Deus como reconhecimento de Sua provisão.
            </Text>
          </View>

          <View className="bg-surface rounded-2xl p-5 gap-2 border border-border">
            <View className="flex-row items-center gap-2">
              <Text className="text-2xl">🎁</Text>
              <Text className="text-base font-bold text-foreground">Oferta</Text>
            </View>
            <Text className="text-sm text-muted leading-relaxed">
              Contribuição voluntária além do dízimo para apoiar projetos e necessidades da igreja.
            </Text>
          </View>

          <View className="bg-surface rounded-2xl p-5 gap-2 border border-border">
            <View className="flex-row items-center gap-2">
              <Text className="text-2xl">🌍</Text>
              <Text className="text-base font-bold text-foreground">Missões</Text>
            </View>
            <Text className="text-sm text-muted leading-relaxed">
              Apoio financeiro para o trabalho missionário e evangelístico.
            </Text>
          </View>

          <View className="bg-surface rounded-2xl p-5 gap-2 border border-border">
            <View className="flex-row items-center gap-2">
              <Text className="text-2xl">🏗️</Text>
              <Text className="text-base font-bold text-foreground">Projetos Especiais</Text>
            </View>
            <Text className="text-sm text-muted leading-relaxed">
              Contribuição para obras, reformas e projetos específicos da igreja.
            </Text>
          </View>
        </View>

        {/* PIX */}
        <View className="gap-3">
          <Text className="text-xl font-bold text-foreground">PIX</Text>
          
          <View className="bg-surface rounded-2xl p-5 gap-4 border border-border">
            <View className="items-center gap-3">
              {/* QR Code placeholder */}
              <View 
                className="rounded-2xl items-center justify-center border-2"
                style={{ width: 200, height: 200, backgroundColor: colors.background, borderColor: colors.border }}
              >
                <Text className="text-6xl">📱</Text>
                <Text className="text-sm text-muted mt-2">QR Code PIX</Text>
              </View>
              
              <Text className="text-sm text-muted text-center">
                Escaneie o código acima ou use a chave PIX
              </Text>
            </View>

            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Chave PIX:</Text>
              <View className="bg-background rounded-xl p-4 border border-border">
                <Text className="text-base font-mono text-foreground text-center">
                  {pixKey}
                </Text>
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
            <View className="gap-1">
              <Text className="text-xs text-muted">Banco</Text>
              <Text className="text-base font-semibold text-foreground">{bankInfo.bank}</Text>
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1 gap-1">
                <Text className="text-xs text-muted">Agência</Text>
                <Text className="text-base font-semibold text-foreground">{bankInfo.agency}</Text>
              </View>
              <View className="flex-1 gap-1">
                <Text className="text-xs text-muted">Conta</Text>
                <Text className="text-base font-semibold text-foreground">{bankInfo.account}</Text>
              </View>
            </View>

            <View className="gap-1">
              <Text className="text-xs text-muted">CNPJ</Text>
              <Text className="text-base font-semibold text-foreground">{bankInfo.cnpj}</Text>
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

        {/* Mensagem de agradecimento */}
        <View className="bg-success/10 rounded-2xl p-5 gap-2 border border-success/20">
          <Text className="text-base font-semibold text-foreground">
            Obrigado pela sua generosidade! 🙏
          </Text>
          <Text className="text-sm text-muted leading-relaxed">
            Sua contribuição ajuda a manter o trabalho da igreja e impactar vidas para o Reino de Deus.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
