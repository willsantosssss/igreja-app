import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { BackButton } from "@/components/back-button";
import { DropboxUpload } from "@/components/dropbox-upload";
import { useColors } from "@/hooks/use-colors";
import { listDropboxFiles, deleteDropboxFile, setDropboxAccessToken } from "@/lib/dropbox-service";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AnexoDropbox {
  name: string;
  path: string;
  id: string;
  modified: string;
  size: number;
}

export default function GerenciarAnexosScreen() {
  const colors = useColors();
  const [anexos, setAnexos] = useState<AnexoDropbox[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const carregarAnexos = async () => {
    try {
      setIsLoading(true);

      // Verificar se tem token salvo
      const token = await AsyncStorage.getItem("dropbox_access_token");
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      // Configurar token
      setDropboxAccessToken(token);
      setIsAuthenticated(true);

      // Listar arquivos
      const files = await listDropboxFiles();
      setAnexos(files);
    } catch (error: any) {
      console.error("Erro ao carregar anexos:", error);
      Alert.alert("Erro", "Não foi possível carregar os anexos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarAnexos();
  }, []);

  const handleDeleteFile = async (anexo: AnexoDropbox) => {
    Alert.alert(
      "Deletar arquivo?",
      `Tem certeza que deseja deletar "${anexo.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Deletar",
          style: "destructive",
          onPress: async () => {
            try {
              setIsDeletingId(anexo.id);
              await deleteDropboxFile(anexo.path);
              setAnexos(anexos.filter((a) => a.id !== anexo.id));
              Alert.alert("Sucesso", "Arquivo deletado com sucesso");
            } catch (error: any) {
              Alert.alert("Erro", error.message || "Não foi possível deletar o arquivo");
            } finally {
              setIsDeletingId(null);
            }
          },
        },
      ]
    );
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isAuthenticated) {
    return (
      <ScreenContainer className="p-4 items-center justify-center" edges={["top", "left", "right"]}>
        <View className="items-center gap-4">
          <Text className="text-2xl font-bold text-foreground">Gerenciar Anexos</Text>
          <Text className="text-sm text-muted text-center">
            Para gerenciar anexos, você precisa autenticar com o Dropbox
          </Text>
          <Text className="text-xs text-muted text-center mt-4">
            Funcionalidade em desenvolvimento. Em breve você conseguirá autenticar diretamente pelo app.
          </Text>
          <BackButton />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4" edges={["top", "left", "right"]}>
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-2xl font-bold text-foreground">Gerenciar Anexos</Text>
          <Text className="text-sm text-muted mt-1">
            Enviar e gerenciar documentos no Dropbox
          </Text>
        </View>
        <BackButton />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Componente de Upload */}
        <DropboxUpload onUploadSuccess={() => carregarAnexos()} />

        {/* Lista de Arquivos */}
        <View className="mt-6">
          <Text className="text-lg font-bold text-foreground mb-4">
            Arquivos Enviados ({anexos.length})
          </Text>

          {isLoading ? (
            <View className="items-center justify-center py-8">
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : anexos.length === 0 ? (
            <View className="bg-surface rounded-lg p-6 items-center border border-border">
              <Text className="text-muted text-center">
                Nenhum arquivo enviado ainda
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {anexos.map((anexo) => (
                <View
                  key={anexo.id}
                  className="bg-surface rounded-lg p-4 border border-border flex-row items-center justify-between"
                >
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-foreground">
                      {anexo.name}
                    </Text>
                    <Text className="text-xs text-muted mt-1">
                      {formatFileSize(anexo.size)} • {formatDate(anexo.modified)}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleDeleteFile(anexo)}
                    disabled={isDeletingId === anexo.id}
                    className="ml-2 active:opacity-80"
                  >
                    {isDeletingId === anexo.id ? (
                      <ActivityIndicator size="small" color={colors.error} />
                    ) : (
                      <Text className="text-lg">🗑️</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
