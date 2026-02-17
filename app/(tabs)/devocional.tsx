import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Alert, Platform } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import { 
  getCapituloByIndex,
  sequenciaNovoTestamento 
} from "@/lib/data/sequencia-nt";
import { obterCapituloOffline } from "@/lib/data/biblia-completa-naa";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import * as Sharing from "expo-sharing";

export default function DevocionalScreen() {
  const colors = useColors();
  
  // Calcular índice correto para hoje (dias desde 1 de janeiro)
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const primeiroDeJaneiro = new Date(anoAtual, 0, 1);
  const umDia = 24 * 60 * 60 * 1000;
  const indiceHoje = Math.floor((hoje.getTime() - primeiroDeJaneiro.getTime()) / umDia);
  
  const [currentIndex, setCurrentIndex] = useState(Math.min(indiceHoje, sequenciaNovoTestamento.length - 1));
  const [readChapters, setReadChapters] = useState<Set<string>>(new Set());
  const [fontSize, setFontSize] = useState(16);
  const [versao, setVersao] = useState<"NAA" | "NVI">("NAA");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const capitulo = getCapituloByIndex(currentIndex);
  const isToday = currentIndex === indiceHoje;
  const chapterKey = `${capitulo.livro}-${capitulo.capitulo}`;
  const isRead = readChapters.has(chapterKey);

  // Carregar capítulo offline
  const [textoCapitulo, setTextoCapitulo] = useState<string | null>(null);

  useEffect(() => {
    loadReadChapters();
    carregarCapitulo();
  }, [currentIndex, versao]);

  const carregarCapitulo = () => {
    setIsLoading(true);
    setError(null);

    try {
      // Tentar carregar do banco de dados offline
      const texto = obterCapituloOffline(capitulo.livro, capitulo.capitulo);
      
      if (texto) {
        setTextoCapitulo(texto);
      } else {
        setError(`Capítulo ${capitulo.livro} ${capitulo.capitulo} não disponível offline`);
      }
    } catch (err) {
      setError(`Erro ao carregar capítulo: ${err instanceof Error ? err.message : 'Desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadReadChapters = async () => {
    try {
      const saved = await AsyncStorage.getItem("@devocional_lidos");
      if (saved) {
        setReadChapters(new Set(JSON.parse(saved)));
      }
    } catch (error) {
      console.error("Error loading read chapters:", error);
    }
  };

  const toggleRead = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const newReadChapters = new Set(readChapters);
    if (isRead) {
      newReadChapters.delete(chapterKey);
    } else {
      newReadChapters.add(chapterKey);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }

    setReadChapters(newReadChapters);

    try {
      await AsyncStorage.setItem(
        "@devocional_lidos",
        JSON.stringify(Array.from(newReadChapters))
      );
    } catch (error) {
      console.error("Error saving read chapters:", error);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < sequenciaNovoTestamento.length - 1) {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setCurrentIndex(currentIndex + 1);
    }
  };

  const compartilharVersiculo = async () => {
    if (!textoCapitulo) {
      Alert.alert("Erro", "Capítulo não carregado");
      return;
    }

    try {
      const mensagem = `${capitulo.livro} ${capitulo.capitulo} (${versao})\n\n${textoCapitulo.substring(0, 200)}...\n\nLeia o devocional completo no app 2iEQ!`;
      
      if (Platform.OS === "web") {
        // Web: copiar para clipboard
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          await navigator.clipboard.writeText(mensagem);
          Alert.alert("Sucesso", "Versículo copiado");
        }
      } else {
        // Mobile: compartilhar
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync("");
        }
      }
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
    }
  };

  const progressPercent = Math.round(((currentIndex + 1) / sequenciaNovoTestamento.length) * 100);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 100 }}>
        {/* Header */}
        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-3xl font-bold text-foreground">Devocional</Text>
            {isToday && (
              <View className="bg-success/20 px-3 py-1 rounded-full">
                <Text className="text-xs font-semibold text-success">Hoje</Text>
              </View>
            )}
          </View>
          <Text className="text-base text-muted">
            {capitulo.livro} {capitulo.capitulo}
          </Text>
        </View>

        {/* Progress Bar */}
        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-muted">Progresso</Text>
            <Text className="text-sm font-bold text-primary">{progressPercent}%</Text>
          </View>
          <View className="h-2 bg-surface rounded-full overflow-hidden">
            <View
              className="h-full bg-primary rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </View>
          <Text className="text-xs text-muted">
            Capítulo {currentIndex + 1} de {sequenciaNovoTestamento.length}
          </Text>
        </View>

        {/* Controles de Fonte e Versão */}
        <View className="gap-3">
          <View className="flex-row items-center justify-between gap-2">
            <TouchableOpacity
              className="flex-1 bg-surface rounded-lg p-2 items-center"
              onPress={() => setFontSize(Math.max(12, fontSize - 2))}
            >
              <Text className="text-sm font-semibold text-foreground">A-</Text>
            </TouchableOpacity>
            <Text className="text-sm text-muted">{fontSize}px</Text>
            <TouchableOpacity
              className="flex-1 bg-surface rounded-lg p-2 items-center"
              onPress={() => setFontSize(Math.min(24, fontSize + 2))}
            >
              <Text className="text-sm font-semibold text-foreground">A+</Text>
            </TouchableOpacity>
          </View>

          {/* Seletor de Versão */}
          <View className="flex-row gap-2">
            <TouchableOpacity
              className="flex-1 rounded-lg p-3 items-center border-2"
              style={{
                backgroundColor: versao === "NAA" ? colors.primary : colors.surface,
                borderColor: versao === "NAA" ? colors.primary : colors.border,
              }}
              onPress={() => setVersao("NAA")}
            >
              <Text
                className="font-semibold text-sm"
                style={{ color: versao === "NAA" ? "#FFFFFF" : colors.foreground }}
              >
                NAA
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 rounded-lg p-3 items-center border-2"
              style={{
                backgroundColor: versao === "NVI" ? colors.primary : colors.surface,
                borderColor: versao === "NVI" ? colors.primary : colors.border,
              }}
              onPress={() => setVersao("NVI")}
            >
              <Text
                className="font-semibold text-sm"
                style={{ color: versao === "NVI" ? "#FFFFFF" : colors.foreground }}
              >
                NVI
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info de Versão */}
        <View className="bg-primary/10 rounded-xl p-3 gap-1 border border-primary/20">
          <Text className="text-xs font-semibold text-foreground">
            Versão: {versao === "NAA" ? "Nova Almeida Atualizada" : "Nova Versão Internacional"}
          </Text>
          <Text className="text-xs text-muted">
            {isLoading ? "Carregando..." : "✓ Leitura 100% offline"}
          </Text>
        </View>

        {/* Subtítulo de Instrução */}
        <View className="bg-surface rounded-xl p-4 border border-border">
          <Text className="text-sm text-muted leading-relaxed">
            Separe um tempo de qualidade, fazendo a leitura junto com sua apostila para melhor aproveitamento. Não se esqueça de orar e adorar enquanto demonstra sua devoção ao Senhor.
          </Text>
        </View>

        {/* Texto do Capítulo */}
        <View className="bg-surface rounded-2xl p-6 gap-4 border border-border">
          {isLoading ? (
            <View className="items-center justify-center py-8">
              <ActivityIndicator size="large" color={colors.primary} />
              <Text className="text-muted text-sm mt-4">Carregando capítulo...</Text>
            </View>
          ) : error ? (
            <View className="items-center justify-center py-8">
              <Text className="text-error text-sm">{error}</Text>
              <Text className="text-muted text-xs mt-2">Banco de dados offline em construção</Text>
            </View>
          ) : (
            <>
              <Text
                className="text-foreground leading-relaxed"
                style={{ fontSize }}
              >
                {textoCapitulo}
              </Text>
              <View className="pt-4 border-t border-border gap-2">
                <Text className="text-xs text-muted">
                  Fonte: Bíblia {versao}
                </Text>
                <Text className="text-xs text-muted">
                  ✓ Disponível offline
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Botões de Ação */}
        <View className="gap-2">
          <TouchableOpacity
            className="rounded-full py-4 items-center"
            style={{ backgroundColor: isRead ? colors.success : colors.primary }}
            onPress={toggleRead}
          >
            <Text className="text-white font-bold text-base">
              {isRead ? "✓ Lido Hoje" : "Marcar como Lido"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="rounded-full py-3 items-center border-2"
            style={{ borderColor: colors.primary }}
            onPress={compartilharVersiculo}
            disabled={isLoading || !textoCapitulo}
          >
            <Text className="font-semibold text-base" style={{ color: colors.primary }}>
              📄 Compartilhar Versículo
            </Text>
          </TouchableOpacity>
        </View>

        {/* Navegação */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            className="flex-1 rounded-full py-3 items-center border-2"
            style={{
              borderColor: currentIndex > 0 ? colors.primary : colors.border,
              backgroundColor: currentIndex > 0 ? colors.surface : colors.background,
            }}
            onPress={goToPrevious}
            disabled={currentIndex === 0}
          >
            <Text
              className="font-semibold text-base"
              style={{ color: currentIndex > 0 ? colors.primary : colors.muted }}
            >
              ← Anterior
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 rounded-full py-3 items-center border-2"
            style={{
              borderColor: currentIndex < sequenciaNovoTestamento.length - 1 ? colors.primary : colors.border,
              backgroundColor: currentIndex < sequenciaNovoTestamento.length - 1 ? colors.surface : colors.background,
            }}
            onPress={goToNext}
            disabled={currentIndex === sequenciaNovoTestamento.length - 1}
          >
            <Text
              className="font-semibold text-base"
              style={{ color: currentIndex < sequenciaNovoTestamento.length - 1 ? colors.primary : colors.muted }}
            >
              Próximo →
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
