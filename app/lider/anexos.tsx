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
import { BackButton } from "@/components/back-button";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as WebBrowser from "expo-web-browser";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/use-colors";
import { setDropboxAccessToken, listDropboxFiles, getDropboxShareLink } from "@/lib/dropbox-service";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AnexoDropbox {
  name: string;
  path: string;
  id: string;
  modified: string;
  size: number;
}

export default function AnexosLiderScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [anexos, setAnexos] = useState<AnexoDropbox[]>([]);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Carregar token do Dropbox e listar arquivos
  const carregarAnexos = async () => {
    try {
      setIsLoading(true);
      
      // Verificar se tem token salvo
      const token = await AsyncStorage.getItem("dropbox_access_token");
      if (!token) {
        setIsError(true);
        setError({ message: "Não autenticado com Dropbox" });
        setIsAuthenticated(false);
        return;
      }

      // Configurar token
      setDropboxAccessToken(token);
      setIsAuthenticated(true);

      // Listar arquivos
      const files = await listDropboxFiles();
      setAnexos(files);
      setIsError(false);
    } catch (err) {
      console.error("Erro ao carregar anexos:", err);
      setError(err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarAnexos();
  }, []);

  const getFileIcon = (fileName: string) => {
    const ext = fileName.toLowerCase().split(".").pop();
    if (ext === "pdf") return "📄";
    if (["doc", "docx"].includes(ext || "")) return "📝";
    if (["xls", "xlsx"].includes(ext || "")) return "📊";
    if (["jpg", "jpeg", "png", "gif"].includes(ext || "")) return "🖼️";
    if (["mp4", "avi", "mov"].includes(ext || "")) return "🎥";
    if (["mp3", "wav", "flac"].includes(ext || "")) return "🎵";
    if (["zip", "rar", "7z"].includes(ext || "")) return "📦";
    return "📎";
  };

  const handleDownloadFile = async (anexo: AnexoDropbox) => {
    try {
      setDownloading(anexo.id);

      // Obter link de compartilhamento
      const shareLink = await getDropboxShareLink(anexo.path);
      
      // Abrir no navegador para download
      await WebBrowser.openBrowserAsync(shareLink);
    } catch (error: any) {
      console.error("Erro ao baixar arquivo:", error);
      Alert.alert("Erro", error.message || "Não foi possível baixar o arquivo");
    } finally {
      setDownloading(null);
    }
  };

  const handleAutenticar = async () => {
    try {
      // Abrir página de autenticação do Dropbox
      // Nota: Para produção, você precisará configurar um servidor backend
      // que gerencia o fluxo OAuth do Dropbox
      Alert.alert(
        "Autenticação Dropbox",
        "Para autenticar com o Dropbox, você precisa fazer login através do navegador.\n\nEste recurso será implementado em breve.",
        [{ text: "OK" }]
      );
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Erro ao autenticar");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const renderAnexo = ({ item }: { item: AnexoDropbox }) => (
    <View className="bg-surface rounded-lg p-4 mb-3 border border-border">
      <View className="mb-3">
        <Text className="text-lg font-bold text-foreground">
          {getFileIcon(item.name)} {item.name}
        </Text>
        <Text className="text-xs text-muted mt-2">
          Tamanho: {formatFileSize(item.size)}
        </Text>
        <Text className="text-xs text-muted">
          Modificado: {formatDate(item.modified)}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => handleDownloadFile(item)}
        disabled={downloading === item.id}
        className="bg-primary rounded-lg p-3 items-center active:opacity-80"
      >
        {downloading === item.id ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text className="text-white font-semibold">⬇️ Baixar</Text>
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

  if (!isAuthenticated) {
    return (
      <ScreenContainer className="p-4 items-center justify-center" edges={["top", "left", "right"]}>
        <View className="items-center gap-4">
          <Text className="text-2xl font-bold text-foreground">Anexos</Text>
          <Text className="text-sm text-muted text-center">
            Para acessar os anexos, você precisa autenticar com o Dropbox
          </Text>
          <TouchableOpacity
            onPress={handleAutenticar}
            className="bg-primary rounded-lg px-6 py-3 active:opacity-80"
          >
            <Text className="text-white font-semibold">Autenticar com Dropbox</Text>
          </TouchableOpacity>
          <BackButton />
        </View>
      </ScreenContainer>
    );
  }

  if (isError) {
    return (
      <ScreenContainer className="items-center justify-center p-4" edges={["top", "left", "right"]}>
        <Text className="text-lg font-bold text-error mb-4">Erro ao carregar anexos</Text>
        <Text className="text-sm text-muted text-center mb-6">
          {error?.message || "Não foi possível carregar a lista de anexos"}
        </Text>
        <TouchableOpacity
          onPress={carregarAnexos}
          className="bg-primary rounded-lg px-6 py-3 active:opacity-80 mb-4"
        >
          <Text className="text-white font-semibold">Tentar Novamente</Text>
        </TouchableOpacity>
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
            Documentos armazenados no Dropbox
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
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <FlatList
            data={anexos}
            renderItem={renderAnexo}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
          <Text className="text-xs text-muted text-center mt-4">
            Total: {anexos.length} arquivo(s)
          </Text>
        </ScrollView>
      )}
    </ScreenContainer>
  );
}
