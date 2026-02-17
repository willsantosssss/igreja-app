import { ScrollView, Text, View, TouchableOpacity, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import { 
  getDayOfYear, 
  getChapterOfDay, 
  getChapterByIndex, 
  getSampleText,
  totalChapters 
} from "@/lib/data/devocional";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export default function DevocionalScreen() {
  const colors = useColors();
  const dayOfYear = getDayOfYear();
  const todayChapter = getChapterOfDay(dayOfYear);
  
  const [currentIndex, setCurrentIndex] = useState(todayChapter.index);
  const [readChapters, setReadChapters] = useState<Set<number>>(new Set());
  const [fontSize, setFontSize] = useState(16);

  const currentChapter = getChapterByIndex(currentIndex);
  const verses = getSampleText(currentChapter.book, currentChapter.chapter);
  const isToday = currentIndex === todayChapter.index;
  const isRead = readChapters.has(currentIndex);

  useEffect(() => {
    loadReadChapters();
  }, []);

  const loadReadChapters = async () => {
    try {
      const saved = await AsyncStorage.getItem("@devocional_read_chapters");
      if (saved) {
        setReadChapters(new Set(JSON.parse(saved)));
      }
    } catch (error) {
      console.error("Erro ao carregar capítulos lidos:", error);
    }
  };

  const toggleRead = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    const newReadChapters = new Set(readChapters);
    if (isRead) {
      newReadChapters.delete(currentIndex);
    } else {
      newReadChapters.add(currentIndex);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
    
    setReadChapters(newReadChapters);
    
    try {
      await AsyncStorage.setItem(
        "@devocional_read_chapters",
        JSON.stringify(Array.from(newReadChapters))
      );
    } catch (error) {
      console.error("Erro ao salvar capítulos lidos:", error);
    }
  };

  const navigateChapter = (direction: "prev" | "next") => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (direction === "prev") {
      setCurrentIndex((currentIndex - 1 + totalChapters) % totalChapters);
    } else {
      setCurrentIndex((currentIndex + 1) % totalChapters);
    }
  };

  const goToToday = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setCurrentIndex(todayChapter.index);
  };

  const adjustFontSize = (delta: number) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setFontSize(Math.max(12, Math.min(24, fontSize + delta)));
  };

  const handleShare = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert(
      "Compartilhar",
      `Compartilhar ${currentChapter.book} ${currentChapter.chapter}`,
      [{ text: "OK" }]
    );
  };

  const progress = ((currentIndex + 1) / totalChapters) * 100;
  const readProgress = (readChapters.size / totalChapters) * 100;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View className="p-5 gap-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-3xl font-bold text-foreground">Devocional Diário</Text>
              <Text className="text-sm text-muted mt-1">
                {currentChapter.book} {currentChapter.chapter}
              </Text>
            </View>
            <TouchableOpacity
              className="w-10 h-10 items-center justify-center rounded-full bg-surface"
              onPress={handleShare}
            >
              <IconSymbol name="paperplane.fill" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Badge "Hoje" */}
          {isToday && (
            <View 
              className="px-3 py-1.5 rounded-full self-start"
              style={{ backgroundColor: `${colors.primary}20` }}
            >
              <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
                📖 Leitura de Hoje
              </Text>
            </View>
          )}

          {/* Progresso */}
          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-muted">
                Capítulo {currentIndex + 1} de {totalChapters}
              </Text>
              <Text className="text-xs text-muted">
                {progress.toFixed(1)}% concluído
              </Text>
            </View>
            <View className="h-2 rounded-full bg-surface overflow-hidden">
              <View 
                className="h-full rounded-full"
                style={{ width: `${progress}%`, backgroundColor: colors.primary }}
              />
            </View>
            <Text className="text-xs text-muted">
              {readChapters.size} capítulos lidos ({readProgress.toFixed(1)}%)
            </Text>
          </View>
        </View>

        {/* Controles de navegação */}
        <View className="px-5 flex-row items-center justify-between mb-4">
          <TouchableOpacity
            className="flex-row items-center gap-2 px-4 py-2 rounded-full bg-surface"
            onPress={() => navigateChapter("prev")}
          >
            <Text className="text-xl">←</Text>
            <Text className="text-sm font-semibold text-foreground">Anterior</Text>
          </TouchableOpacity>

          {!isToday && (
            <TouchableOpacity
              className="px-4 py-2 rounded-full"
              style={{ backgroundColor: colors.primary }}
              onPress={goToToday}
            >
              <Text className="text-white font-semibold text-sm">Ir para Hoje</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            className="flex-row items-center gap-2 px-4 py-2 rounded-full bg-surface"
            onPress={() => navigateChapter("next")}
          >
            <Text className="text-sm font-semibold text-foreground">Próximo</Text>
            <Text className="text-xl">→</Text>
          </TouchableOpacity>
        </View>

        {/* Controles de fonte */}
        <View className="px-5 flex-row items-center justify-between mb-4">
          <Text className="text-sm text-muted">Tamanho do texto:</Text>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              className="w-8 h-8 items-center justify-center rounded-full bg-surface"
              onPress={() => adjustFontSize(-2)}
            >
              <Text className="text-lg font-bold text-foreground">A-</Text>
            </TouchableOpacity>
            <Text className="text-sm text-muted w-8 text-center">{fontSize}px</Text>
            <TouchableOpacity
              className="w-8 h-8 items-center justify-center rounded-full bg-surface"
              onPress={() => adjustFontSize(2)}
            >
              <Text className="text-lg font-bold text-foreground">A+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Texto bíblico */}
        <View className="px-5 gap-4 mb-6">
          {verses.map((verse, index) => (
            <View key={index} className="flex-row gap-3">
              <Text 
                className="font-semibold text-muted"
                style={{ fontSize: fontSize - 2 }}
              >
                {index + 1}
              </Text>
              <Text 
                className="flex-1 text-foreground leading-relaxed"
                style={{ fontSize }}
              >
                {verse}
              </Text>
            </View>
          ))}

          <View className="mt-4 p-4 bg-surface rounded-xl border border-border">
            <Text className="text-sm text-muted text-center italic">
              Continue sua jornada de leitura diária do Novo Testamento. 
              Um capítulo por dia para crescimento espiritual.
            </Text>
          </View>
        </View>

        {/* Botão marcar como lido */}
        <View className="px-5">
          <TouchableOpacity
            className="rounded-full py-4 items-center flex-row justify-center gap-2"
            style={{ backgroundColor: isRead ? colors.success : colors.primary }}
            onPress={toggleRead}
          >
            <IconSymbol 
              name={isRead ? "checkmark.circle.fill" : "checkmark.circle.fill"} 
              size={24} 
              color="#FFFFFF" 
            />
            <Text className="text-white font-bold text-base">
              {isRead ? "Marcado como Lido" : "Marcar como Lido"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
