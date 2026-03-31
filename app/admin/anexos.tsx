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

interface Anexo {
  id: number;
  nomeArquivo: string;
  urlArquivo: string;
  tipo?: string;
  createdAt?: string;
}

export default function AdminAnexosScreen() {
  const colors = useColors();
  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    nomeArquivo: "",
    urlArquivo: "",
    tipo: "pdf",
  });

  const { data: anexosData, isLoading, refetch } = trpc.anexos.list.useQuery();
  const createMutation = trpc.anexos.create.useMutation();
  const updateMutation = trpc.anexos.update.useMutation();
  const deleteMutation = trpc.anexos.delete.useMutation();

  useEffect(() => {
    if (anexosData) {
      setAnexos(anexosData as Anexo[]);
      setLoading(false);
    }
  }, [anexosData]);

  const handleOpenModal = (anexo?: Anexo) => {
    if (anexo) {
      setEditingId(anexo.id);
      setFormData({
        nomeArquivo: anexo.nomeArquivo,
        urlArquivo: anexo.urlArquivo,
        tipo: anexo.tipo || "pdf",
      });
    } else {
      setEditingId(null);
      setFormData({
        nomeArquivo: "",
        urlArquivo: "",
        tipo: "pdf",
      });
    }
    setModalVisible(true);
  };

  const handleUploadFile = async () => {
    if (Platform.OS === "web") {
      // Para web, usar input file nativo
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png";
      input.onchange = async (e: any) => {
        const file = e.target.files[0];
        if (file) {
          await uploadToS3(file);
        }
      };
      input.click();
    } else {
      Alert.alert("Info", "Upload de arquivo disponível na versão web");
    }
  };

  const uploadToS3 = async (file: File) => {
    try {
      setUploading(true);
      const formDataObj = new FormData();
      formDataObj.append("file", file);

      // Usar endpoint de upload do servidor
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataObj,
      });

      if (!response.ok) {
        throw new Error("Erro ao fazer upload");
      }

      const data = await response.json();
      const fileUrl = data.url;

      // Preencher formulário com dados do arquivo
      setFormData({
        nomeArquivo: file.name,
        urlArquivo: fileUrl,
        tipo: file.name.split(".").pop() || "pdf",
      });

      Alert.alert("Sucesso", "Arquivo enviado com sucesso!");
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Erro ao fazer upload");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.nomeArquivo.trim() || !formData.urlArquivo.trim()) {
      Alert.alert("Erro", "Preencha o nome do arquivo e a URL");
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          nomeArquivo: formData.nomeArquivo,
          urlArquivo: formData.urlArquivo,
          tipo: formData.tipo,
        });
        Alert.alert("Sucesso", "Anexo atualizado");
      } else {
        await createMutation.mutateAsync({
          nomeArquivo: formData.nomeArquivo,
          urlArquivo: formData.urlArquivo,
          tipo: formData.tipo,
        });
        Alert.alert("Sucesso", "Anexo criado");
      }
      setModalVisible(false);
      refetch();
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Erro ao salvar anexo");
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

  const renderAnexo = ({ item }: { item: Anexo }) => (
    <View className="bg-surface rounded-lg p-4 mb-3 border border-border">
      <View className="mb-3">
        <Text className="text-lg font-bold text-foreground">{item.nomeArquivo}</Text>
        <Text className="text-xs text-muted mt-2">
          Tipo: {item.tipo || "pdf"}
        </Text>
        {item.createdAt && (
          <Text className="text-xs text-muted">
            Criado em: {new Date(item.createdAt).toLocaleDateString("pt-BR")}
          </Text>
        )}
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
      </View>
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
            onPress={() => handleOpenModal()}
            className="bg-primary rounded-lg p-3 active:opacity-80"
          >
            <Text className="text-white font-semibold">+ Novo</Text>
          </TouchableOpacity>
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
                  Nome do Arquivo *
                </Text>
                <TextInput
                  className="border border-border rounded-lg p-3 text-foreground bg-surface"
                  placeholder="Ex: Guia de Liderança.pdf"
                  value={formData.nomeArquivo}
                  onChangeText={(text) =>
                    setFormData({ ...formData, nomeArquivo: text })
                  }
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">
                  Upload de Arquivo
                </Text>
                <TouchableOpacity
                  onPress={handleUploadFile}
                  disabled={uploading}
                  className="border-2 border-dashed border-primary rounded-lg p-4 items-center active:opacity-80 mb-3"
                >
                  {uploading ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    <>
                      <Text className="text-primary font-semibold mb-1">📁 Selecionar Arquivo</Text>
                      <Text className="text-xs text-muted">PDF, DOC, DOCX, JPG, PNG</Text>
                    </>
                  )}
                </TouchableOpacity>

                <Text className="text-sm font-semibold text-foreground mb-2 mt-4">
                  Ou Cole a URL do Arquivo
                </Text>
                <TextInput
                  className="border border-border rounded-lg p-3 text-foreground bg-surface"
                  placeholder="https://..."
                  value={formData.urlArquivo}
                  onChangeText={(text) =>
                    setFormData({ ...formData, urlArquivo: text })
                  }
                  multiline
                  numberOfLines={2}
                  editable={!uploading}
                />
                <Text className="text-xs text-muted mt-1">
                  Cole a URL do arquivo hospedado (ex: S3, Google Drive, etc)
                </Text>
              </View>

              <View className="mb-6">
                <Text className="text-sm font-semibold text-foreground mb-2">
                  Tipo de Arquivo
                </Text>
                <View className="flex-row gap-2 flex-wrap">
                  {["pdf", "doc", "img", "outro"].map((tipo) => (
                    <TouchableOpacity
                      key={tipo}
                      onPress={() =>
                        setFormData({ ...formData, tipo })
                      }
                      className={`flex-1 min-w-24 rounded-lg p-2 items-center ${
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
                        {tipo.toUpperCase()}
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
