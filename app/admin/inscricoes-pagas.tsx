import { View, Text, TouchableOpacity, ScrollView, FlatList, Alert, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import * as Haptics from "expo-haptics";
import { trpc } from "@/lib/trpc";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";

interface Inscricao {
  id: number;
  eventoId: number;
  nome: string;
  email?: string;
  telefone: string;
  celula: string;
  statusPagamento: "pago" | "nao-pago";
  dataPagamento?: string;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
  eventoTitulo?: string;
  eventoData?: string;
}

export default function InscricoesPagasScreen() {
  const colors = useColors();
  const [filtro, setFiltro] = useState<"todos" | "pago" | "nao-pago">("todos");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(false);

  // Buscar inscrições
  const { data: inscricoes = [], isLoading, refetch } = trpc.inscricoes.list.useQuery(undefined, {
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });

  // Atualizar status de pagamento
  const atualizarStatusMutation = trpc.inscricoes.updateStatus.useMutation({
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      refetch();
      setEditandoId(null);
    },
    onError: (error: any) => {
      Alert.alert("Erro", error.message || "Falha ao atualizar status");
    },
  });

  const inscricoesFiltradas = (inscricoes as Inscricao[]).filter((inscricao) => {
    if (filtro === "pago") return inscricao.statusPagamento === "pago";
    if (filtro === "nao-pago") return inscricao.statusPagamento === "nao-pago";
    return true;
  });

  const handleMarcarComoPago = async (inscricaoId: number) => {
    setCarregando(true);
    try {
      await atualizarStatusMutation.mutateAsync({
        inscricaoId,
        statusPagamento: "pago",
      });
    } catch (error) {
      console.error("Erro ao marcar como pago:", error);
    } finally {
      setCarregando(false);
    }
  };

  const handleMarcarComoNaoPago = async (inscricaoId: number) => {
    setCarregando(true);
    try {
      await atualizarStatusMutation.mutateAsync({
        inscricaoId,
        statusPagamento: "nao-pago",
      });
    } catch (error) {
      console.error("Erro ao marcar como não pago:", error);
    } finally {
      setCarregando(false);
    }
  };

  const exportarParaExcel = async () => {
    try {
      setCarregando(true);
      
      // Criar CSV com os dados
      let csv = "Nome,Célula,Status de Pagamento\n";
      
      inscricoesFiltradas.forEach((inscricao) => {
        const status = inscricao.statusPagamento === "pago" ? "Pago" : "Não Pago";
        csv += `"${inscricao.nome}","${inscricao.celula}","${status}"\n`;
      });
      
      // Salvar arquivo
      const fileName = `inscricoes_${new Date().toISOString().split('T')[0]}.csv`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(filePath, csv, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      
      // Compartilhar arquivo
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: "text/csv",
          dialogTitle: "Exportar Inscrições",
        });
      } else {
        alert("Compartilhamento não disponível neste dispositivo");
      }
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Erro ao exportar:", error);
      alert("Erro ao exportar dados");
    } finally {
      setCarregando(false);
    }
  };

  const renderInscricao = ({ item }: { item: Inscricao }) => (
    <View className="bg-surface rounded-xl p-4 mb-3 border border-border">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-1">
          <Text className="text-base font-bold text-foreground">{item.nome}</Text>
          <Text className="text-xs text-muted mt-1">{item.eventoTitulo}</Text>
        </View>
        <View
          className={`px-3 py-1 rounded-full ${
            item.statusPagamento === "pago"
              ? "bg-success/20"
              : "bg-error/20"
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              item.statusPagamento === "pago"
                ? "text-success"
                : "text-error"
            }`}
          >
            {item.statusPagamento === "pago" ? "✓ Pago" : "✗ Não Pago"}
          </Text>
        </View>
      </View>

      {item.telefone && (
        <Text className="text-xs text-muted mb-3">📱 {item.telefone}</Text>
      )}

      <View className="flex-row gap-2">
        {item.statusPagamento !== "pago" ? (
          <TouchableOpacity
            className="flex-1 bg-success/20 rounded-lg py-2 items-center"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setEditandoId(item.id);
            }}
          >
            <Text className="text-xs font-semibold text-success">Marcar como Pago</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className="flex-1 bg-error/20 rounded-lg py-2 items-center"
            onPress={() => handleMarcarComoNaoPago(item.id)}
          >
            <Text className="text-xs font-semibold text-error">Desfazer Pagamento</Text>
          </TouchableOpacity>
        )}
      </View>

      {editandoId === item.id && (
        <View className="mt-3 bg-background rounded-lg p-3 border border-border">
          <Text className="text-foreground font-semibold mb-2">Confirmar Pagamento</Text>
          <Text className="text-sm text-muted mb-3">
            Marcar {item.nome} como pagante?
          </Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setEditandoId(null)}
              className="flex-1 bg-muted/20 rounded-lg py-2 items-center"
            >
              <Text className="text-muted font-semibold text-sm">Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleMarcarComoPago(item.id)}
              disabled={carregando}
              className="flex-1 bg-success rounded-lg py-2 items-center"
            >
              {carregando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold text-sm">Confirmar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <ScreenContainer className="p-4">
      {/* Header */}
      <View className="flex-row items-center gap-3 mb-6">
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center rounded-full bg-surface"
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-foreground flex-1">Inscrições Pagas</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Filtros */}
        <View className="mb-6 gap-2">
          <Text className="text-sm font-semibold text-foreground">Filtrar por Status</Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              className={`flex-1 px-4 py-2 rounded-lg ${
                filtro === "todos"
                  ? "bg-primary"
                  : "bg-surface border border-border"
              }`}
              onPress={() => {
                setFiltro("todos");
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text
                className={`text-xs font-semibold text-center ${
                  filtro === "todos"
                    ? "text-background"
                    : "text-foreground"
                }`}
              >
                Todos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 px-4 py-2 rounded-lg ${
                filtro === "pago"
                  ? "bg-success/30"
                  : "bg-surface border border-border"
              }`}
              onPress={() => {
                setFiltro("pago");
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text
                className={`text-xs font-semibold text-center ${
                  filtro === "pago"
                    ? "text-success"
                    : "text-foreground"
                }`}
              >
                ✓ Pagos ({(inscricoes as Inscricao[]).filter(i => i.statusPagamento === "pago").length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 px-4 py-2 rounded-lg ${
                filtro === "nao-pago"
                  ? "bg-error/30"
                  : "bg-surface border border-border"
              }`}
              onPress={() => {
                setFiltro("nao-pago");
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text
                className={`text-xs font-semibold text-center ${
                  filtro === "nao-pago"
                    ? "text-error"
                    : "text-foreground"
                }`}
              >
                ✗ Não Pagos ({(inscricoes as Inscricao[]).filter(i => i.statusPagamento === "nao-pago").length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Resumo */}
        <View className="bg-primary/10 rounded-xl p-4 mb-6 border border-primary/20">
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-2xl font-bold text-primary">{inscricoesFiltradas.length}</Text>
              <Text className="text-xs text-muted">Inscrições</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-success">
                {inscricoesFiltradas.filter((i) => i.statusPagamento === "pago").length}
              </Text>
              <Text className="text-xs text-muted">Pagas</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-error">
                {inscricoesFiltradas.filter((i) => i.statusPagamento === "nao-pago").length}
              </Text>
              <Text className="text-xs text-muted">Não Pagas</Text>
            </View>
          </View>
        </View>

        {/* Botão de Exportar */}
        {inscricoesFiltradas.length > 0 && (
          <TouchableOpacity
            className="bg-primary rounded-lg py-3 px-4 mb-6 flex-row items-center justify-center gap-2"
            onPress={exportarParaExcel}
            disabled={carregando}
          >
            <Text className="text-white font-semibold">📊 Exportar para Excel</Text>
          </TouchableOpacity>
        )}

        {/* Lista de Inscrições */}
        {isLoading ? (
          <View className="items-center justify-center py-8">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : inscricoesFiltradas.length === 0 ? (
          <View className="items-center justify-center py-8">
            <Text className="text-2xl mb-2">📭</Text>
            <Text className="text-muted">Nenhuma inscrição encontrada</Text>
          </View>
        ) : (
          <FlatList
            data={inscricoesFiltradas}
            renderItem={renderInscricao}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
