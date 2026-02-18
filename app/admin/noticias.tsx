import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert, Switch, FlatList } from "react-native";
import { useState, useCallback } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { router, useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { getNoticias, adicionarNoticia, removerNoticia, atualizarNoticia, type Noticia } from "@/lib/data/noticias";

export default function NoticiasScreen() {
  const colors = useColors();
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [editando, setEditando] = useState<string | null>(null);
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [destaque, setDestaque] = useState(false);

  useFocusEffect(
    useCallback(() => {
      carregarNoticias();
    }, [])
  );

  const carregarNoticias = async () => {
    try {
      setCarregando(true);
      const dados = await getNoticias();
      setNoticias(dados);
    } catch (error) {
      console.error("Erro ao carregar notícias:", error);
      Alert.alert("Erro", "Não foi possível carregar as notícias");
    } finally {
      setCarregando(false);
    }
  };

  const handleAdicionarNoticia = async () => {
    if (!titulo.trim()) {
      Alert.alert("Atenção", "O título não pode estar vazio");
      return;
    }

    if (!conteudo.trim()) {
      Alert.alert("Atenção", "O conteúdo não pode estar vazio");
      return;
    }

    try {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      if (editando) {
        // Atualizar notícia existente
        await atualizarNoticia(editando, {
          titulo: titulo.trim(),
          conteudo: conteudo.trim(),
          destaque,
        });
        Alert.alert("Sucesso", "Notícia atualizada com sucesso!");
      } else {
        // Adicionar nova notícia
        await adicionarNoticia({
          titulo: titulo.trim(),
          conteudo: conteudo.trim(),
          data: new Date().toISOString(),
          destaque,
        });
        Alert.alert("Sucesso", "Notícia adicionada com sucesso!");
      }

      setTitulo("");
      setConteudo("");
      setDestaque(false);
      setEditando(null);
      carregarNoticias();
    } catch (error) {
      console.error("Erro ao salvar notícia:", error);
      Alert.alert("Erro", "Não foi possível salvar a notícia");
    }
  };

  const handleEditarNoticia = (noticia: Noticia) => {
    setEditando(noticia.id);
    setTitulo(noticia.titulo);
    setConteudo(noticia.conteudo);
    setDestaque(noticia.destaque);
  };

  const handleRemoverNoticia = (id: string) => {
    Alert.alert(
      "Confirmar",
      "Tem certeza que deseja remover esta notícia?",
      [
        { text: "Cancelar", onPress: () => {} },
        {
          text: "Remover",
          onPress: async () => {
            try {
              await removerNoticia(id);
              if (Platform.OS !== "web") {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              carregarNoticias();
            } catch (error) {
              Alert.alert("Erro", "Não foi possível remover a notícia");
            }
          },
        },
      ]
    );
  };

  const handleCancelar = () => {
    setTitulo("");
    setConteudo("");
    setDestaque(false);
    setEditando(null);
  };

  if (carregando) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-muted">Carregando...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
        {/* Header */}
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            className="w-10 h-10 items-center justify-center rounded-full bg-surface"
            onPress={() => router.back()}
          >
            <Text className="text-xl">←</Text>
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-3xl font-bold text-foreground">Notícias</Text>
            <Text className="text-sm text-muted mt-1">Gerenciar notícias da igreja</Text>
          </View>
        </View>

        {/* Formulário */}
        <View className="bg-surface rounded-2xl p-4 gap-3 border border-border">
          <Text className="text-base font-semibold text-foreground">
            {editando ? "Editar Notícia" : "Nova Notícia"}
          </Text>

          {/* Título */}
          <View className="gap-1">
            <Text className="text-sm font-semibold text-foreground">Título</Text>
            <TextInput
              className="bg-background rounded-lg p-3 text-foreground border border-border"
              style={{ borderColor: colors.border }}
              placeholder="Digite o título"
              placeholderTextColor={colors.muted}
              value={titulo}
              onChangeText={setTitulo}
              maxLength={100}
            />
            <Text className="text-xs text-muted text-right">{titulo.length}/100</Text>
          </View>

          {/* Conteúdo */}
          <View className="gap-1">
            <Text className="text-sm font-semibold text-foreground">Conteúdo</Text>
            <TextInput
              className="bg-background rounded-lg p-3 text-foreground border border-border"
              style={{ borderColor: colors.border, minHeight: 100 }}
              placeholder="Digite o conteúdo"
              placeholderTextColor={colors.muted}
              value={conteudo}
              onChangeText={setConteudo}
              maxLength={500}
              multiline
              textAlignVertical="top"
            />
            <Text className="text-xs text-muted text-right">{conteudo.length}/500</Text>
          </View>

          {/* Destaque */}
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-foreground">Destacar</Text>
            <Switch
              value={destaque}
              onValueChange={setDestaque}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={destaque ? colors.primary : colors.muted}
            />
          </View>

          {/* Botões */}
          <View className="flex-row gap-2 pt-2">
            <TouchableOpacity
              className="flex-1 border-2 rounded-lg py-2 items-center"
              style={{ borderColor: colors.border }}
              onPress={handleCancelar}
            >
              <Text className="font-semibold text-sm" style={{ color: colors.foreground }}>
                Cancelar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 rounded-lg py-2 items-center"
              style={{ backgroundColor: colors.primary }}
              onPress={handleAdicionarNoticia}
            >
              <Text className="text-white font-semibold text-sm">
                {editando ? "Atualizar" : "Adicionar"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Lista de Notícias */}
        <View className="gap-2">
          <Text className="text-base font-semibold text-foreground">
            Notícias ({noticias.length})
          </Text>
          {noticias.length > 0 ? (
            noticias.map(noticia => (
              <View
                key={noticia.id}
                className="bg-surface rounded-xl p-4 gap-2 border border-border"
              >
                <View className="flex-row items-start justify-between gap-2">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      {noticia.destaque && (
                        <Text className="text-xs bg-primary/20 px-2 py-1 rounded text-primary font-semibold">
                          DESTAQUE
                        </Text>
                      )}
                    </View>
                    <Text className="text-base font-semibold text-foreground mt-1">
                      {noticia.titulo}
                    </Text>
                    <Text className="text-sm text-muted mt-1 leading-relaxed" numberOfLines={2}>
                      {noticia.conteudo}
                    </Text>
                    <Text className="text-xs text-muted mt-2">
                      {new Date(noticia.data).toLocaleDateString("pt-BR")}
                    </Text>
                  </View>
                </View>

                <View className="flex-row gap-2 pt-2">
                  <TouchableOpacity
                    className="flex-1 border-2 rounded-lg py-2 items-center"
                    style={{ borderColor: colors.primary }}
                    onPress={() => handleEditarNoticia(noticia)}
                  >
                    <Text className="font-semibold text-sm" style={{ color: colors.primary }}>
                      Editar
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 border-2 rounded-lg py-2 items-center"
                    style={{ borderColor: colors.error }}
                    onPress={() => handleRemoverNoticia(noticia.id)}
                  >
                    <Text className="font-semibold text-sm" style={{ color: colors.error }}>
                      Remover
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text className="text-sm text-muted text-center py-4">Nenhuma notícia cadastrada</Text>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
