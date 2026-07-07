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
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
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

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean; error?: Error}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    console.error('[ErrorBoundary] Erro capturado:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('[ErrorBoundary] Stack:', errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ScreenContainer className="items-center justify-center p-4">
          <Text className="text-foreground text-center text-lg font-bold mb-2">
            ⚠️ Erro ao carregar anexos
          </Text>
          <Text className="text-muted text-center text-sm">
            {this.state.error?.message || 'Tente novamente mais tarde'}
          </Text>
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
  const [error, setError] = useState<string | null>(null);

  const { data: anexosData, isLoading, error: queryError } = trpc.anexos.list.useQuery(undefined, {
    retry: 1,
    retryDelay: 1000,
  });

  useEffect(() => {
    try {
      if (queryError) {
        console.error('[Anexos] Query error:', queryError);
        setError('Erro ao carregar anexos');
        setAnexos([]);
      } else if (anexosData && Array.isArray(anexosData)) {
        setAnexos(anexosData as Anexo[]);
        setError(null);
      } else if (anexosData) {
        setAnexos([]);
        setError(null);
      }
      setLoading(false);
    } catch (e) {
      console.error('[Anexos] Erro ao processar dados:', e);
      setAnexos([]);
      setError('Erro ao processar dados');
      setLoading(false);
    }
  }, [anexosData, queryError]);

  const handleDownloadPDF = async (anexo: Anexo) => {
    try {
      setDownloading(anexo.id);

      // Construir URL completa
      const fullUrl = anexo.urlArquivo.startsWith("http")
        ? anexo.urlArquivo
        : `${getApiBaseUrl()}${anexo.urlArquivo}`;

      // Baixar arquivo
      const fileName = anexo.nomeArquivo || anexo.urlArquivo.split("/").pop() || "documento.pdf";
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      console.log(`[Download] Downloading from: ${fullUrl}`);

      const downloadResult = await FileSystem.downloadAsync(fullUrl, fileUri);

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

  const renderAnexo = ({ item }: { item: Anexo }) => {
    try {
      return (
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
              <Text className="text-xs text-muted">
                Criado em: {new Date(item.createdAt).toLocaleDateString('pt-BR')}
              </Text>
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
    } catch (e) {
      console.error('[Anexos] Erro ao renderizar item:', e);
      return null;
    }
  };

  if (loading || isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-muted mt-4">Carregando anexos...</Text>
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer className="items-center justify-center p-4">
        <Text className="text-foreground text-center text-lg font-bold mb-2">
          ⚠️ {error}
        </Text>
        <Text className="text-muted text-center text-sm">
          Tente novamente mais tarde
        </Text>
      </ScreenContainer>
    );
  }

  return (
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
          onError={(error) => {
            console.error('[Anexos] FlatList error:', error);
          }}
        />
      )}
    </ScreenContainer>
  );
}

export default function AnexosLiderScreen() {
  return (
    <ErrorBoundary>
      <AnexosLiderScreenContent />
    </ErrorBoundary>
  );
}
