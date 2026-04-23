import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useLocalSearchParams, router } from "expo-router";
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, Platform, Modal, TextInput, Linking } from "react-native";
import { useState, useEffect } from "react";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import { trpc } from "@/lib/trpc";

interface PagamentoEvento {
  id: number;
  eventoId: number;
  valor: string;
  qrCodeUrl: string;
  chavePix: string;
  nomeRecebedor: string;
  linkCredito1x?: string;
  linkCredito2x?: string;
  linkCredito3x?: string;
  ativo: number;
}

export default function EventPagamentoScreen() {
  const colors = useColors();
  const { id, eventoId, eventoTitulo } = useLocalSearchParams();
  const [pagamento, setPagamento] = useState<PagamentoEvento | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [mostrarModalPix, setMostrarModalPix] = useState(false);
  const [copiouPix, setCopiouPix] = useState(false);
  const [metodoPagamento, setMetodoPagamento] = useState<'pix' | '1x' | '2x' | '3x'>('pix');

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
    setMostrarModalPix(true);
  };

  const copiarChavePixParaClipboard = async () => {
    if (!pagamento) return;
    
    try {
      if (Platform.OS !== "web") {
        await Clipboard.setStringAsync(pagamento.chavePix);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(pagamento.chavePix);
      }
      setCopiouPix(true);
      setTimeout(() => setCopiouPix(false), 2000);
    } catch (error) {
      console.error("Erro ao copiar:", error);
      Alert.alert("Erro", "Não foi possível copiar a chave PIX");
    }
  };

  const handleAbrirLinkCredito = async (link?: string) => {
    if (!link) {
      Alert.alert("Erro", "Link de pagamento não configurado para esta opção.");
      return;
    }
    
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      try {
        await Linking.openURL(link);
      } catch (error) {
        Alert.alert("Erro", "Não foi possível abrir o link de pagamento");
      }
    } else {
      window.open(link, "_blank");
    }
  };

  const handleConfirmarPagamento = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    const metodoLabel = metodoPagamento === 'pix' ? 'PIX' : `Crédito ${metodoPagamento}`;
    
    Alert.alert(
      "Pagamento Registrado",
      `Obrigado! Você escolheu pagar com ${metodoLabel}. Guarde seu comprovante de pagamento. Você receberá confirmação em breve.`,
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

          {/* Opções de Pagamento */}
          <View className="gap-3">
            <Text className="text-lg font-bold text-foreground">Escolha a forma de pagamento</Text>
            
            {/* PIX */}
            <TouchableOpacity
              onPress={() => setMetodoPagamento('pix')}
              style={{
                backgroundColor: metodoPagamento === 'pix' ? colors.primary + '20' : colors.surface,
                borderWidth: metodoPagamento === 'pix' ? 2 : 1,
                borderColor: metodoPagamento === 'pix' ? colors.primary : colors.border,
              }}
              className="rounded-2xl p-4 flex-row items-center gap-3"
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: metodoPagamento === 'pix' ? colors.primary : colors.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {metodoPagamento === 'pix' && (
                  <View
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: colors.primary,
                    }}
                  />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">PIX</Text>
                <Text className="text-xs text-muted">Pagamento imediato</Text>
              </View>
            </TouchableOpacity>

            {/* Crédito 1x */}
            {pagamento.linkCredito1x && (
              <TouchableOpacity
                onPress={() => setMetodoPagamento('1x')}
                style={{
                  backgroundColor: metodoPagamento === '1x' ? colors.primary + '20' : colors.surface,
                  borderWidth: metodoPagamento === '1x' ? 2 : 1,
                  borderColor: metodoPagamento === '1x' ? colors.primary : colors.border,
                }}
                className="rounded-2xl p-4 flex-row items-center gap-3"
              >
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: metodoPagamento === '1x' ? colors.primary : colors.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {metodoPagamento === '1x' && (
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: colors.primary,
                      }}
                    />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">Crédito 1x</Text>
                  <Text className="text-xs text-muted">Uma parcela</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Crédito 2x */}
            {pagamento.linkCredito2x && (
              <TouchableOpacity
                onPress={() => setMetodoPagamento('2x')}
                style={{
                  backgroundColor: metodoPagamento === '2x' ? colors.primary + '20' : colors.surface,
                  borderWidth: metodoPagamento === '2x' ? 2 : 1,
                  borderColor: metodoPagamento === '2x' ? colors.primary : colors.border,
                }}
                className="rounded-2xl p-4 flex-row items-center gap-3"
              >
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: metodoPagamento === '2x' ? colors.primary : colors.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {metodoPagamento === '2x' && (
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: colors.primary,
                      }}
                    />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">Crédito 2x</Text>
                  <Text className="text-xs text-muted">Duas parcelas</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Crédito 3x */}
            {pagamento.linkCredito3x && (
              <TouchableOpacity
                onPress={() => setMetodoPagamento('3x')}
                style={{
                  backgroundColor: metodoPagamento === '3x' ? colors.primary + '20' : colors.surface,
                  borderWidth: metodoPagamento === '3x' ? 2 : 1,
                  borderColor: metodoPagamento === '3x' ? colors.primary : colors.border,
                }}
                className="rounded-2xl p-4 flex-row items-center gap-3"
              >
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: metodoPagamento === '3x' ? colors.primary : colors.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {metodoPagamento === '3x' && (
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: colors.primary,
                      }}
                    />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">Crédito 3x</Text>
                  <Text className="text-xs text-muted">Três parcelas</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Conteúdo específico por método */}
          {metodoPagamento === 'pix' && (
            <>
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
                  <TouchableOpacity
                    onPress={handleCopiarChavePix}
                    className="bg-primary/10 border border-primary rounded-lg p-4 items-center"
                  >
                    <Text className="text-primary font-semibold text-sm">📋 Visualizar e Copiar Chave PIX</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}

          {(metodoPagamento === '1x' || metodoPagamento === '2x' || metodoPagamento === '3x') && (
            <>
              {/* Link de Crédito */}
              <View className="gap-3">
                <Text className="text-lg font-bold text-foreground">
                  Clique para pagar com cartão de crédito
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    if (metodoPagamento === '1x') {
                      handleAbrirLinkCredito(pagamento.linkCredito1x);
                    } else if (metodoPagamento === '2x') {
                      handleAbrirLinkCredito(pagamento.linkCredito2x);
                    } else if (metodoPagamento === '3x') {
                      handleAbrirLinkCredito(pagamento.linkCredito3x);
                    }
                  }}
                  className="bg-primary rounded-2xl p-6 items-center justify-center"
                >
                  <Text className="text-white font-bold text-lg">
                    💳 Pagar com Crédito {metodoPagamento.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

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

      {/* Modal de Chave PIX */}
      <Modal
        visible={mostrarModalPix}
        transparent
        animationType="slide"
        onRequestClose={() => setMostrarModalPix(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-6 gap-4">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-xl font-bold text-foreground">Chave PIX</Text>
              <TouchableOpacity
                onPress={() => setMostrarModalPix(false)}
                className="w-8 h-8 items-center justify-center rounded-full bg-surface"
              >
                <Text className="text-lg">✕</Text>
              </TouchableOpacity>
            </View>

            {/* Chave PIX Copiável */}
            <View className="bg-surface rounded-xl p-4 border border-border gap-3">
              <Text className="text-xs text-muted">Chave PIX (Copia e Cola):</Text>
              <TextInput
                value={pagamento.chavePix}
                editable={false}
                multiline
                className="bg-background rounded-lg p-3 text-foreground text-sm font-mono border border-border"
                style={{ minHeight: 80 }}
              />
              <TouchableOpacity
                onPress={copiarChavePixParaClipboard}
                className={`py-3 rounded-lg items-center justify-center ${
                  copiouPix ? "bg-success" : "bg-primary"
                }`}
              >
                <Text className="text-white font-semibold">
                  {copiouPix ? "✓ Copiado!" : "📋 Copiar Chave PIX"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Instruções */}
            <View className="bg-warning/10 rounded-xl p-4 border border-warning/20 gap-2">
              <Text className="text-sm font-semibold text-foreground">Como usar:</Text>
              <Text className="text-xs text-foreground leading-relaxed">
                1. Copie a chave PIX acima{"\n"}2. Abra seu banco ou app de pagamento{"\n"}3. Cole a chave no campo de transferência PIX{"\n"}4. Confirme o pagamento
              </Text>
            </View>

            {/* Botão Fechar */}
            <TouchableOpacity
              onPress={() => setMostrarModalPix(false)}
              className="bg-surface border border-border rounded-lg py-3 items-center"
            >
              <Text className="text-foreground font-semibold">Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
