import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useColors } from "@/hooks/use-colors";

interface DropboxUploadProps {
  onUploadSuccess?: (fileName: string) => void;
  onUploadError?: (error: string) => void;
  accessToken?: string;
}

export function DropboxUpload({
  onUploadSuccess,
  onUploadError,
  accessToken,
}: DropboxUploadProps) {
  const colors = useColors();
  const [isUploading, setIsUploading] = useState(false);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      if (!file.uri) {
        Alert.alert("Erro", "Arquivo não selecionado");
        return;
      }

      setIsUploading(true);

      // Aqui você pode chamar a API de upload para Dropbox
      // Por enquanto, apenas confirmar seleção
      onUploadSuccess?.(file.name);
      Alert.alert("Sucesso", `Arquivo ${file.name} selecionado`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      onUploadError?.(errorMessage);
      Alert.alert("Erro", errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View className="gap-3">
      <TouchableOpacity
        disabled={isUploading}
        onPress={handlePickDocument}
        className="bg-primary rounded-lg p-4 flex-row items-center justify-center gap-2"
        style={{ opacity: isUploading ? 0.6 : 1 }}
      >
        {isUploading ? (
          <>
            <ActivityIndicator color={colors.background} size="small" />
            <Text className="text-background font-semibold">Enviando...</Text>
          </>
        ) : (
          <>
            <Text className="text-lg">📤</Text>
            <Text className="text-background font-semibold">Selecionar Arquivo</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
