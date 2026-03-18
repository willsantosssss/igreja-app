import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useColors } from "@/hooks/use-colors";
import { uploadToDropbox } from "@/lib/dropbox-service";

interface DropboxUploadProps {
  onUploadSuccess?: (fileName: string) => void;
  onUploadError?: (error: Error) => void;
}

export function DropboxUpload({ onUploadSuccess, onUploadError }: DropboxUploadProps) {
  const colors = useColors();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: number;
    uri: string;
  } | null>(null);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");

  const handleSelectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "application/msword", "application/vnd.ms-excel", "text/*"],
      });

      if (result.type === "success") {
        setSelectedFile({
          name: result.name,
          size: result.size || 0,
          uri: result.uri,
        });
      }
    } catch (error: any) {
      Alert.alert("Erro", "Não foi possível selecionar o arquivo");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Alert.alert("Erro", "Selecione um arquivo primeiro");
      return;
    }

    if (!titulo.trim()) {
      Alert.alert("Erro", "Digite um título para o documento");
      return;
    }

    try {
      setIsUploading(true);

      // Ler arquivo como base64
      const fileContent = await FileSystem.readAsStringAsync(selectedFile.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Fazer upload para Dropbox
      const result = await uploadToDropbox(
        selectedFile.name,
        fileContent,
        selectedFile.name.split(".").pop() || "arquivo"
      );

      Alert.alert("Sucesso", "Arquivo enviado para o Dropbox com sucesso!");
      setSelectedFile(null);
      setTitulo("");
      setDescricao("");

      onUploadSuccess?.(result.name);
    } catch (error: any) {
      console.error("Erro ao fazer upload:", error);
      Alert.alert("Erro", error.message || "Não foi possível fazer upload do arquivo");
      onUploadError?.(error);
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <View className="bg-surface rounded-lg p-4 border border-border">
      <Text className="text-lg font-bold text-foreground mb-4">Enviar Documento</Text>

      {/* Campo de Título */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-foreground mb-2">Título</Text>
        <TextInput
          placeholder="Ex: Manual de Liderança"
          value={titulo}
          onChangeText={setTitulo}
          placeholderTextColor={colors.muted}
          className="bg-background border border-border rounded-lg px-4 py-3 text-foreground"
          editable={!isUploading}
        />
      </View>

      {/* Campo de Descrição */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-foreground mb-2">Descrição (opcional)</Text>
        <TextInput
          placeholder="Descreva o conteúdo do documento"
          value={descricao}
          onChangeText={setDescricao}
          placeholderTextColor={colors.muted}
          className="bg-background border border-border rounded-lg px-4 py-3 text-foreground"
          multiline
          numberOfLines={3}
          editable={!isUploading}
        />
      </View>

      {/* Seleção de Arquivo */}
      {selectedFile ? (
        <View className="bg-background rounded-lg p-3 mb-4 border border-border">
          <Text className="text-sm font-semibold text-foreground">📎 {selectedFile.name}</Text>
          <Text className="text-xs text-muted mt-1">
            Tamanho: {formatFileSize(selectedFile.size)}
          </Text>
          <TouchableOpacity
            onPress={() => setSelectedFile(null)}
            disabled={isUploading}
            className="mt-2 active:opacity-80"
          >
            <Text className="text-xs text-primary font-semibold">Trocar arquivo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={handleSelectFile}
          disabled={isUploading}
          className="bg-background border-2 border-dashed border-primary rounded-lg p-4 items-center mb-4 active:opacity-80"
        >
          <Text className="text-2xl mb-2">📁</Text>
          <Text className="text-sm font-semibold text-foreground">Selecionar arquivo</Text>
          <Text className="text-xs text-muted mt-1">PDF, Word, Excel ou Texto</Text>
        </TouchableOpacity>
      )}

      {/* Botão de Upload */}
      <TouchableOpacity
        onPress={handleUpload}
        disabled={isUploading || !selectedFile || !titulo.trim()}
        className={`rounded-lg p-3 items-center ${
          isUploading || !selectedFile || !titulo.trim()
            ? "bg-border opacity-50"
            : "bg-primary active:opacity-80"
        }`}
      >
        {isUploading ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text className="text-white font-semibold">⬆️ Enviar para Dropbox</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
