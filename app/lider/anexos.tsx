import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useEffect, useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
// import { trpc } from "@/lib/trpc"; // Usar apenas endpoint REST
import { BackButton } from "@/components/back-button";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/use-colors";
import { DropboxUpload } from "@/components/dropbox-upload";

interface Anexo {
  id: number;
  titulo: string;
  descricao?: string;
  arquivoUrl: string;
  nomeArquivo: string;
  tamanhoArquivo: number;
  tipo: string;
  ativo: number;
  createdAt: string;
}

export default function AnexosLiderScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [downloading, setDownloading] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const itemsPerPage = 10;

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any>(null);
  const apiUrl = "https://igreja-app-production-9432.up.railway.app";

  const carregarAnexos = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${apiUrl}/api/documentos-lideres`);
      if (!response.ok) throw new Error('Erro ao carregar anexos');
      const data = await response.json();
      
      // Filtrar apenas anexos ativos
      const anexosAtivos = (data as Anexo[]).filter((a) => a.ativo === 1);
      // Paginacao: mostrar apenas os primeiros itemsPerPage
      const paginados = anexosAtivos.slice(0, itemsPerPage);
      setAnexos(paginados);
      setHasMore(anexosAtivos.length > itemsPerPage);
      setIsError(false);
    } catch (err) {
      setError(err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarAnexos();
  }, []);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    try {
      const response = await fetch(`${apiUrl}/api/documentos-lideres`);
      if (!response.ok) throw new Error('Erro ao carregar anexos');
      const data = await response.json();
      
      const anexosAtivos = (data as Anexo[]).filter((a) => a.ativo === 1);
      const novaPage = page + 1;
      const inicio = 0;
      const fim = novaPage * itemsPerPage;
      const novoAnexos = anexosAtivos.slice(inicio, fim);
      
      setAnexos(novoAnexos);
      setPage(novaPage);
      setHasMore(fim < anexosAtivos.length);
    } catch (err) {
      console.error('Erro ao carregar mais anexos:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const getFileIcon = (tipo: string) => {
    if (tipo.includes('pdf')) return '📄';
    if (tipo.includes('word') || tipo.includes('document')) return '📝';
    if (tipo.includes('excel') || tipo.includes('spreadsheet')) return '📊';
    if (tipo.includes('image')) return '🖼️';
    if (tipo.includes('video')) return '🎥';
    if (tipo.includes('audio')) return '🎵';
    if (tipo.includes('zip') || tipo.includes('rar')) return '📦';
    return '📎';
  };

  const getMimeType = (tipo: string) => {
    if (tipo.includes('pdf')) return 'application/pdf';
    if (tipo.includes('word') || tipo.includes('document')) return 'application/msword';
    if (tipo.includes('excel') || tipo.includes('spreadsheet')) return 'application/vnd.ms-excel';
    if (tipo.includes('image')) return 'image/*';
    if (tipo.includes('video')) return 'video/*';
    if (tipo.includes('audio')) return 'audio/*';
    return 'application/octet-stream';
  };

  const handleDownloadFile = async (anexo: Anexo) => {
    try {
      setDownloading(anexo.id);

      const fileName = anexo.nomeArquivo || "documento";
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      // Verificar se é um data URI em base64
      if (anexo.arquivoUrl.startsWith("data:")) {
        // Extrair base64 do data URI
        const base64Match = anexo.arquivoUrl.match(/base64,(.+)$/);
        if (!base64Match) {
          throw new Error("Formato de arquivo inválido");
        }
        const base64Data = base64Match[1];

        // Escrever arquivo a partir do base64
        await FileSystem.writeAsStringAsync(fileUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } else {
        // Se for uma URL HTTP, fazer download normal
        const downloadResult = await FileSystem.downloadAsync(anexo.arquivoUrl, fileUri);
        if (downloadResult.status !== 200) {
          throw new Error(`Falha no download (Status: ${downloadResult.status})`);
        }
      }

      // Compartilhar arquivo para abrir/salvar
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: getMimeType(anexo.tipo),
          dialogTitle: `Abrir ${anexo.tipo}`,
        });
      } else {
        Alert.alert("Sucesso", `Arquivo salvo em: ${fileUri}`);
      }
    } catch (error: any) {
      console.error("Erro ao baixar arquivo:", error);
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
        <Text className="text-lg font-bold text-foreground">{item.titulo}</Text>
        {item.descricao && (
          <Text className="text-sm text-muted mt-1">{item.descricao}</Text>
        )}
        <Text className="text-xs text-muted mt-2">
          📄 {item.nomeArquivo} ({formatFileSize(item.tamanhoArquivo)})
        </Text>
        <Text className="text-xs text-muted">Tipo: {item.tipo}</Text>
      </View>

      <TouchableOpacity
        onPress={() => handleDownloadFile(item)}
        disabled={downloading === item.id}
        className="bg-primary rounded-lg p-3 items-center active:opacity-80"
      >
        {downloading === item.id ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text className="text-white font-semibold">⬇️ Baixar {item.tipo.toUpperCase()}</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (isError) {
    return (
      <ScreenContainer className="items-center justify-center p-4">
        <Text className="text-lg font-bold text-error mb-4">Erro ao carregar anexos</Text>
        <Text className="text-sm text-muted text-center mb-6">
          {error?.message || "Não foi possível carregar a lista de anexos"}
        </Text>
        <BackButton />
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

      <View className="mb-4">
        <DropboxUpload
          onUploadSuccess={(fileName) => {
            Alert.alert("Sucesso", `${fileName} foi enviado com sucesso`);
            carregarAnexos();
          }}
          onUploadError={(error) => {
            Alert.alert("Erro", `Falha ao enviar: ${error}`);
          }}
        />
      </View>

      {anexos.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted text-center">
            Nenhum anexo disponível no momento
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <FlatList
            data={anexos}
            renderItem={renderAnexo}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
          {hasMore && (
            <TouchableOpacity
              onPress={handleLoadMore}
              disabled={loadingMore}
              className="bg-primary rounded-lg p-3 items-center mt-4 active:opacity-80"
            >
              {loadingMore ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text className="text-white font-semibold">Carregar Mais</Text>
              )}
            </TouchableOpacity>
          )}
          {anexos.length > 0 && (
            <Text className="text-xs text-muted text-center mt-4">
              Mostrando {anexos.length} de {(anexosData as Anexo[])?.filter((a) => a.ativo === 1).length || 0} anexos
            </Text>
          )}
        </ScrollView>
      )}
    </ScreenContainer>
  );
}
