import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  ScrollView,
  Platform,
} from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import { BackButton } from "@/components/back-button";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";

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

export default function AdminAnexosScreen() {
  const colors = useColors();
  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    nomeArquivo: "",
    arquivoBase64: "",
    tipo: "manual",
  });

  const { data: anexosData, isLoading, isError, error, refetch } = trpc.documentoslideres.list.useQuery();
  const createMutation = trpc.documentoslideres.create.useMutation();
  const updateMutation = trpc.documentoslideres.update.useMutation();
  const deleteMutation = trpc.documentoslideres.delete.useMutation();
  const toggleMutation = trpc.documentoslideres.toggleVisibility.useMutation();

  useEffect(() => {
    if (!isLoading) {
      if (anexosData) {
        setAnexos(anexosData as Anexo[]);
      } else {
        setAnexos([]);
      }
    }
  }, [anexosData, isLoading]);

  const handleOpenModal = (anexo?: Anexo) => {
    if (anexo) {
      setEditingId(anexo.id);
      setFormData({
        titulo: anexo.titulo,
        descricao: anexo.descricao || "",
        nomeArquivo: anexo.nomeArquivo,
        arquivoBase64: "",
        tipo: anexo.tipo,
      });
    } else {
      setEditingId(null);
      setFormData({
        titulo: "",
        descricao: "",
        nomeArquivo: "",
        arquivoBase64: "",
        tipo: "manual",
      });
    }
    setModalVisible(true);
  };

  const handlePickFile = async () => {
    try {
      setUploadingFile(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "image/*",
          "video/*",
          "audio/*",
        ],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        // Ler arquivo e converter para base64
        const fileContent = await FileSystem.readAsStringAsync(file.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Detectar tipo de arquivo
        let tipoArquivo = "arquivo";
        if (file.mimeType?.includes('pdf')) tipoArquivo = 'PDF';
        else if (file.mimeType?.includes('word') || file.mimeType?.includes('document')) tipoArquivo = 'Word';
        else if (file.mimeType?.includes('excel') || file.mimeType?.includes('spreadsheet')) tipoArquivo = 'Excel';
        else if (file.mimeType?.includes('image')) tipoArquivo = 'Imagem';
        else if (file.mimeType?.includes('video')) tipoArquivo = 'Vídeo';
        else if (file.mimeType?.includes('audio')) tipoArquivo = 'Áudio';

        setFormData({
          titulo: "",
          descricao: "",
          nomeArquivo: file.name,
          arquivoBase64: fileContent,
          tipo: tipoArquivo,
        });
        setEditingId(null);
        setModalVisible(true);
      }
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Erro ao selecionar arquivo");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSave = async () => {
    if (!formData.titulo.trim() || !formData.nomeArquivo.trim() || !formData.arquivoBase64.trim()) {
      Alert.alert("Erro", "Preencha o título e selecione um arquivo PDF");
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          titulo: formData.titulo,
          descricao: formData.descricao,
          tipo: formData.tipo,
        });
        Alert.alert("Sucesso", "Anexo atualizado");
      } else {
        // Usar endpoint REST em vez do tRPC
        const apiUrl = "https://igreja-app-production-9432.up.railway.app";
        const response = await fetch(`${apiUrl}/api/upload/documentos-lideres`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            titulo: formData.titulo,
            descricao: formData.descricao,
            nomeArquivo: formData.nomeArquivo,
            arquivoBase64: formData.arquivoBase64,
            tipo: formData.tipo,
            ativo: 1,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        Alert.alert("Sucesso", "Anexo criado e enviado");
      }
      setModalVisible(false);
      refetch();
    } catch (error: any) {
      console.error("[Upload] Erro completo:", error);
      console.error("[Upload] Stack:", error.stack);
      const errorMessage = error?.message || error?.data?.message || error?.toString?.() || JSON.stringify(error);
      Alert.alert("Erro no Upload", errorMessage, [{text: "OK"}]);
    }
  };

  const handleDelete = async (id: number) => {
    Alert.alert("Confirmar", "Deseja deletar este anexo?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Deletar",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMutation.mutateAsync(id);
            Alert.alert("Sucesso", "Anexo deletado");
            refetch();
          } catch (error: any) {
            Alert.alert("Erro", error.message || "Erro ao deletar");
          }
        },
      },
    ]);
  };

  const handleToggleVisibility = async (id: number, ativo: number) => {
    try {
      await toggleMutation.mutateAsync({
        id,
        ativo: ativo === 1 ? 0 : 1,
      });
      refetch();
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Erro ao atualizar visibilidade");
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

      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={() => handleOpenModal(item)}
          className="flex-1 bg-primary rounded-lg p-2 items-center active:opacity-80"
        >
          <Text className="text-white font-semibold text-sm">Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          className="flex-1 bg-error rounded-lg p-2 items-center active:opacity-80"
        >
          <Text className="text-white font-semibold text-sm">Deletar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleToggleVisibility(item.id, item.ativo)}
          className={`flex-1 rounded-lg p-2 items-center active:opacity-80 ${
            item.ativo === 1 ? "bg-success" : "bg-muted"
          }`}
        >
          <Text className="text-white font-semibold text-sm">
            {item.ativo === 1 ? "Visível" : "Oculto"}
          </Text>
        </TouchableOpacity>
      </View>
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
          {error?.message || "Nao foi possivel carregar a lista de anexos"}
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          className="bg-primary rounded-lg p-3 items-center active:opacity-80"
        >
          <Text className="text-white font-semibold">Tentar Novamente</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4" edges={["top", "left", "right"]}>
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-2xl font-bold text-foreground">Anexos</Text>
          <Text className="text-sm text-muted mt-1">
            Gerenciar documentos para líderes
          </Text>
        </View>
        <View className="flex-row gap-2">
      <TouchableOpacity
        onPress={() => handlePickFile()}
        className="bg-primary rounded-lg p-3 items-center active:opacity-80 mb-4"
      >
        <Text className="text-white font-semibold">Selecionar Arquivo</Text>
      </TouchableOpacity>
      <Text className="text-xs text-muted text-center mb-4">
        Formatos suportados: PDF, Word, Excel, Imagens, Vídeos, Áudio
      </Text>
          <BackButton />
        </View>
      </View>

      {anexos.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted text-center">
            Nenhum anexo criado ainda
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

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 items-center justify-center">
          <View className="bg-background w-11/12 rounded-2xl p-6 max-h-5/6">
            <ScrollView>
              <Text className="text-2xl font-bold text-foreground mb-4">
                {editingId ? "Editar Anexo" : "Novo Anexo"}
              </Text>

              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">
                  Título
                </Text>
                <TextInput
                  className="border border-border rounded-lg p-3 text-foreground bg-surface"
                  placeholder="Ex: Manual do Líder"
                  value={formData.titulo}
                  onChangeText={(text) =>
                    setFormData({ ...formData, titulo: text })
                  }
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">
                  Descrição
                </Text>
                <TextInput
                  className="border border-border rounded-lg p-3 text-foreground bg-surface"
                  placeholder="Descrição opcional"
                  value={formData.descricao}
                  onChangeText={(text) =>
                    setFormData({ ...formData, descricao: text })
                  }
                  multiline
                  numberOfLines={3}
                />
              </View>

              {!editingId && (
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-foreground mb-2">
                    Arquivo PDF
                  </Text>
                  <TouchableOpacity
                    onPress={handlePickFile}
                    disabled={uploadingFile}
                    className="border-2 border-dashed border-primary rounded-lg p-4 items-center active:opacity-80"
                  >
                    {uploadingFile ? (
                      <ActivityIndicator color={colors.primary} />
                    ) : (
                      <>
                        <Text className="text-primary font-semibold mb-1">
                          📁 Selecionar PDF
                        </Text>
                        <Text className="text-xs text-muted text-center">
                          {formData.nomeArquivo || "Toque para escolher um arquivo"}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              <View className="mb-6">
                <Text className="text-sm font-semibold text-foreground mb-2">
                  Tipo
                </Text>
                <View className="flex-row gap-2">
                  {["manual", "guia", "formulario"].map((tipo) => (
                    <TouchableOpacity
                      key={tipo}
                      onPress={() =>
                        setFormData({ ...formData, tipo })
                      }
                      className={`flex-1 rounded-lg p-2 items-center ${
                        formData.tipo === tipo
                          ? "bg-primary"
                          : "bg-surface border border-border"
                      }`}
                    >
                      <Text
                        className={`font-semibold text-sm ${
                          formData.tipo === tipo
                            ? "text-white"
                            : "text-foreground"
                        }`}
                      >
                        {tipo}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  className="flex-1 bg-muted rounded-lg p-3 items-center active:opacity-80"
                >
                  <Text className="text-foreground font-semibold">Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSave}
                  className="flex-1 bg-primary rounded-lg p-3 items-center active:opacity-80"
                >
                  <Text className="text-white font-semibold">Salvar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
