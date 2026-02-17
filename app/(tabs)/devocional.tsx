import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import { getCapituloDodia, getTodosCapitulos } from "@/lib/data/biblia-naa";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export default function DevocionalScreen() {
  const colors = useColors();
  const capitulos = getTodosCapitulos();
  const capituloHoje = getCapituloDodia();
  
  const [currentIndex, setCurrentIndex] = useState(
    capitulos.findIndex(c => c.id === capituloHoje.id)
  );
  const [readChapters, setReadChapters] = useState<Set<string>>(new Set());
  const [fontSize, setFontSize] = useState(16);
  const [versao, setVersao] = useState<"NAA" | "NVI">("NAA");

  const capitulo = capitulos[currentIndex];
  const isToday = currentIndex === capitulos.findIndex(c => c.id === capituloHoje.id);
  const isRead = readChapters.has(capitulo.id);

  useEffect(() => {
    loadReadChapters();
  }, []);

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
      newReadChapters.delete(capitulo.id);
    } else {
      newReadChapters.add(capitulo.id);
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
    if (currentIndex < capitulos.length - 1) {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setCurrentIndex(currentIndex + 1);
    }
  };

  const progressPercent = Math.round(((currentIndex + 1) / capitulos.length) * 100);

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
            Capítulo {currentIndex + 1} de {capitulos.length}
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
            Leitura offline disponível
          </Text>
        </View>

        {/* Resumo */}
        <View className="bg-secondary/10 rounded-2xl p-4 gap-2 border border-secondary/20">
          <Text className="text-sm font-semibold text-foreground">{capitulo.resumo}</Text>
        </View>

        {/* Texto do Capítulo */}
        <View className="bg-surface rounded-2xl p-6 gap-4 border border-border">
          <Text
            className="text-foreground leading-relaxed"
            style={{ fontSize }}
          >
            {capitulo.texto}
          </Text>
          <View className="pt-4 border-t border-border gap-2">
            <Text className="text-xs text-muted">
              Fonte: Bíblia {versao}
            </Text>
            <Text className="text-xs text-muted">
              Lido offline • Sem necessidade de internet
            </Text>
          </View>
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
              borderColor: currentIndex < capitulos.length - 1 ? colors.primary : colors.border,
              backgroundColor: currentIndex < capitulos.length - 1 ? colors.surface : colors.background,
            }}
            onPress={goToNext}
            disabled={currentIndex === capitulos.length - 1}
          >
            <Text
              className="font-semibold text-base"
              style={{ color: currentIndex < capitulos.length - 1 ? colors.primary : colors.muted }}
            >
              Próximo →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Estatísticas */}
        <View className="bg-primary/10 rounded-2xl p-5 gap-3 border border-primary/20">
          <Text className="text-sm font-semibold text-foreground">
            📊 Seu Progresso
          </Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-2xl font-bold text-primary">{readChapters.size}</Text>
              <Text className="text-xs text-muted">Capítulos Lidos</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-primary">{capitulos.length - readChapters.size}</Text>
              <Text className="text-xs text-muted">Restantes</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-primary">{progressPercent}%</Text>
              <Text className="text-xs text-muted">Completo</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
