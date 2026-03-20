import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useLocalSearchParams, router } from "expo-router";
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, Platform } from "react-native";
import { useState, useEffect } from "react";
import * as Haptics from "expo-haptics";
import { trpc } from "@/lib/trpc";

interface PagamentoEvento {
  id: number;
  eventoId: number;
  valor: string;
  qrCodeUrl: string;
  chavePix: string;
  nomeRecebedor: string;
  ativo: number;
}

export default function EventPagamentoScreen() {
  const colors = useColors();
  const { id, eventoId, eventoTitulo } = useLocalSearchParams();
  const [pagamento, setPagamento] = useState<PagamentoEvento | null>(null);
  const [carregando, setCarregando] = useState(true);

  // Buscar configuração de pagamento do evento
  // @ts-expect-error - Endpoint será criado
  const { data: pagamentoData, isLoading } = trpc.pagamentosEventos.getByEventoId.useQuery(
    Number(eventoId) || 0,
    { enabled: eventoId !== undefined }
  );

  useEffect(() => {
    if (pagamentoData) {
      setPagamento(pagamentoData);
      setCarregando(false);
    } else if (!isLoading && eventoId) {
      setCarregando(false);
    }
  }, [pagamentoData, isLoading, eventoId]);

  const handleCopiarChavePix = () => {
    if (!pagamento) return;
    
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(pagamento.chavePix).then(() => {
          Alert.alert("Sucesso", "Chave PIX copiada para a área de transferência!");
        }).catch(() => {
          Alert.alert("Erro", "Não foi possível copiar a chave PIX.");
        });
      } else {
        Alert.alert("Erro", "Clipboard não disponível neste navegador.");
      }
    } catch (error) {
      console.error("Erro ao copiar:", error);
      Alert.alert("Erro", "Não foi possível copiar a chave PIX.");
    }
  };

  const handleConfirmarPagamento = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    Alert.alert(
      "Pagamento Registrado",
      "Obrigado! Guarde seu comprovante de pagamento. Você receberá confirmação em breve.",
      [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]
    );
  };

  if (carregando) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted text-base">Carregando informações de pagamento...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!pagamento) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center gap-4">
          <Text className="text-2xl">⚠️</Text>
          <Text className="text-base text-muted text-center">
            Configuração de pagamento não encontrada para este evento.
          </Text>
          <TouchableOpacity
            className="bg-primary px-6 py-3 rounded-full"
            onPress={() => router.back()}
          >
            <Text className="text-white font-semibold">Voltar</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className="p-5 flex-row items-center gap-3">
          <TouchableOpacity
            className="w-10 h-10 items-center justify-center rounded-full bg-surface"
            onPress={() => router.back()}
          >
            <Text className="text-xl">←</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-foreground flex-1">Pagamento do Evento</Text>
        </View>

        {/* Conteúdo */}
        <View className="p-5 gap-6">
          {/* Nome do Evento */}
          <View className="bg-surface rounded-2xl p-4 border border-border">
            <Text className="text-sm text-muted mb-2">Evento</Text>
            <Text className="text-lg font-bold text-foreground">{eventoTitulo || "Evento"}</Text>
          </View>

          {/* Valor */}
          <View className="bg-primary/10 rounded-2xl p-6 border border-primary/20 items-center">
            <Text className="text-sm text-muted mb-2">Valor a Pagar</Text>
            <Text className="text-4xl font-bold text-primary">{pagamento.valor}</Text>
          </View>

          {/* QR Code */}
          <View className="gap-3">
            <Text className="text-lg font-bold text-foreground">Escaneie o QR Code</Text>
            <View className="bg-white rounded-2xl p-4 items-center justify-center border border-border">
              <Image
                source={require("@/assets/images/qrcode-pix.jpg")}
                style={{
                  width: 250,
                  height: 250,
                  borderRadius: 12,
                }}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Chave PIX */}
          <View className="gap-3">
            <Text className="text-lg font-bold text-foreground">Ou copie a chave PIX</Text>
            <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
              <Text className="text-sm text-muted">Beneficiário</Text>
              <Text className="text-base font-semibold text-foreground">{pagamento.nomeRecebedor}</Text>

              <View className="h-px bg-border my-2" />

              <Text className="text-sm text-muted">Chave PIX (Copia e Cola)</Text>
              <View className="bg-background rounded-lg p-3 flex-row items-center justify-between gap-3">
                <Text className="text-xs text-foreground flex-1 font-mono">
                  {pagamento.chavePix.substring(0, 30)}...
                </Text>
                <TouchableOpacity
                  onPress={handleCopiarChavePix}
                  className="bg-primary px-4 py-2 rounded-lg"
                >
                  <Text className="text-white text-xs font-semibold">Copiar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Informações Importantes */}
          <View className="bg-warning/10 rounded-2xl p-4 border border-warning/20 gap-2">
            <View className="flex-row items-start gap-3">
              <Text className="text-2xl">ℹ️</Text>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground mb-2">Importante</Text>
                <Text className="text-xs text-foreground leading-relaxed">
                  Após realizar o pagamento, guarde o comprovante. Você precisará dele para confirmar sua inscrição no evento.
                </Text>
              </View>
            </View>
          </View>

          {/* Botão de Confirmação */}
          <TouchableOpacity
            className="bg-primary rounded-xl py-4 items-center justify-center"
            onPress={handleConfirmarPagamento}
          >
            <Text className="text-white font-bold text-base">Já Realizei o Pagamento</Text>
          </TouchableOpacity>

          {/* Botão Voltar */}
          <TouchableOpacity
            className="border border-border rounded-xl py-4 items-center justify-center"
            onPress={() => router.back()}
          >
            <Text className="text-foreground font-semibold">Voltar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
