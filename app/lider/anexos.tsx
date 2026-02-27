import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useEffect, useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import * as FileSystem from "expo-file-system/legacy";
import * as WebBrowser from "expo-web-browser";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Anexo {
  id: number;
  titulo: string;
  descricao?: string;
  arquivoUrl: string;
  tipo: string;
  ativo: number;
  createdAt: string;
}

export default function AnexosLiderScreen() {
  const insets = useSafeAreaInsets();
  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<number | null>(null);

  const { data: anexosData, isLoading, refetch } = trpc.anexosLideres.list.useQuery();

  useEffect(() => {
    if (anexosData) {
      setAnexos(anexosData as Anexo[]);
      setLoading(false);
    }
  }, [anexosData]);

  const handleDownloadPDF = async (anexo: Anexo) => {
    try {
      setDownloading(anexo.id);

      // Abrir no navegador/visualizador de PDF
      await WebBrowser.openBrowserAsync(anexo.arquivoUrl);
    } catch (error) {
      console.error("Erro ao baixar PDF:", error);
      Alert.alert("Erro", "Não foi possível abrir o arquivo. Tente novamente.");
    } finally {
      setDownloading(null);
    }
  };

  const renderAnexo = ({ item }: { item: Anexo }) => (
    <View className="bg-surface rounded-lg p-4 mb-3 border border-border">
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1">
          <Text className="text-lg font-bold text-foreground">{item.titulo}</Text>
          {item.descricao && (
            <Text className="text-sm text-muted mt-1">{item.descricao}</Text>
          )}
          <Text className="text-xs text-muted mt-2 capitalize">
            Tipo: {item.tipo}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => handleDownloadPDF(item)}
        disabled={downloading === item.id}
        className="bg-primary rounded-lg p-3 items-center active:opacity-80"
      >
        {downloading === item.id ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold">📥 Baixar PDF</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  if (loading || isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color="#0a7ea4" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4" edges={["top", "left", "right"]}>
      <View className="mb-4">
        <Text className="text-2xl font-bold text-foreground">Anexos</Text>
        <Text className="text-sm text-muted mt-1">
          Documentos e materiais para líderes de célula
        </Text>
      </View>

      {anexos.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted text-center">
            Nenhum anexo disponível no momento
          </Text>
        </View>
      ) : (
        <FlatList
          data={anexos}
          renderItem={renderAnexo}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        />
      )}
    </ScreenContainer>
  );
}
