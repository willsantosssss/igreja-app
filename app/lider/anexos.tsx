// @ts-nocheck
import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { BackButton } from "@/components/back-button";
import * as FileSystem from 'expo-file-system';
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/use-colors";
import { getApiBaseUrl } from "@/constants/oauth";

interface Anexo {
  id: number;
  nomeArquivo: string;
  urlArquivo: string;
  tipo?: string;
  createdAt?: string;
}

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('[ErrorBoundary] Erro capturado:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ScreenContainer className="items-center justify-center">
          <Text className="text-foreground text-center">Erro ao carregar anexos</Text>
        </ScreenContainer>
      );
    }

    return this.props.children;
  }
}

function AnexosLiderScreenContent() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<number | null>(null);

  const { data: anexosData, isLoading, error } = trpc.anexos.list.useQuery(undefined, {
    retry: 1,
    retryDelay: 1000,
  });

  useEffect(() => {
    try {
      if (anexosData && Array.isArray(anexosData)) {
        setAnexos(anexosData as Anexo[]);
      } else if (anexosData) {
        setAnexos([]);
      }
      setLoading(false);
    } catch (e) {
      console.error('[Anexos] Erro ao processar dados:', e);
      setAnexos([]);
      setLoading(false);
    }
  }, [anexosData]);

  useEffect(() => {
    if (error) {
      console.error('[Anexos] Erro na query:', error);
      setLoading(false);
    }
  }, [error]);

  const handleDownloadPDF = async (anexo: Anexo) => {
    try {
      setDownloading(anexo.id);

      // Construir URL completa
      const fullUrl = anexo.urlArquivo.startsWith("http")
        ? anexo.urlArquivo
        : `${getApiBaseUrl()}${anexo.urlArquivo}`;

      // Log removido para produção

      // Baixar arquivo
      const fileName = anexo.nomeArquivo || anexo.urlArquivo.split("/").pop() || "documento.pdf";
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      console.log(`[Download] Downloading from: ${fullUrl} to: ${fileUri}`);

      const downloadResult = await FileSystem.downloadAsync(fullUrl, fileUri);

      // Log removido para produção

      if (downloadResult.status === 200) {
        // Compartilhar arquivo para abrir/salvar
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: "application/pdf",
            dialogTitle: "Abrir PDF",
          });
        } else {
          Alert.alert("Sucesso", `Arquivo salvo em: ${fileUri}`);
        }
      } else {
        Alert.alert("Erro", `Não foi possível baixar o arquivo (Status: ${downloadResult.status})`);
      }
    } catch (error: any) {
      console.error("Erro ao baixar PDF:", error);
      Alert.alert("Erro", error.message || "Não foi possível baixar o arquivo");
    } finally {
      setDownloading(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const renderAnexo = ({ item }: { item: Anexo }) => (
    <View className="bg-surface rounded-lg p-4 mb-3 border border-border">
      <View className="mb-3">
        <Text className="text-lg font-bold text-foreground">{item.nomeArquivo}</Text>
        <Text className="text-xs text-muted mt-2">
          📄 {item.nomeArquivo}
        </Text>
        {item.tipo && (
          <Text className="text-xs text-muted">Tipo: {item.tipo}</Text>
        )}
        {item.createdAt && (
          <Text className="text-xs text-muted">Criado em: {new Date(item.createdAt).toLocaleDateString('pt-BR')}</Text>
        )}
      </View>

      <TouchableOpacity
        onPress={() => handleDownloadPDF(item)}
        disabled={downloading === item.id}
        className="bg-primary rounded-lg p-3 items-center active:opacity-80"
      >
        {downloading === item.id ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text className="text-white font-semibold">⬇️ Baixar PDF</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  if (loading || isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ErrorBoundary>
      <ScreenContainer className="p-4" edges={["top", "left", "right"]}>
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-2xl font-bold text-foreground">Anexos</Text>
          <Text className="text-sm text-muted mt-1">
            Documentos para líderes de célula
          </Text>
        </View>
        <BackButton />
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
        />
      )}
    </ScreenContainer>
    </ErrorBoundary>
  );
}

export default function AnexosLiderScreen() {
  return (
    <ErrorBoundary>
      <AnexosLiderScreenContent />
    </ErrorBoundary>
  );
}
