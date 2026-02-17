import { ScrollView, Text, View, TouchableOpacity, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useLocalSearchParams, router } from "expo-router";
import { mockEvents, categoryLabels, categoryColors } from "@/lib/data/events";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export default function EventDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams();
  const event = mockEvents.find(e => e.id === id);

  if (!event) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center gap-4">
          <Text className="text-2xl">❌</Text>
          <Text className="text-base text-muted">Evento não encontrado</Text>
          <TouchableOpacity
            className="bg-primary px-6 py-3 rounded-full"
            onPress={() => router.back()}
          >
            <Text className="text-white font-semibold">Voltar</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
  };

  const handleSubscribe = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Alert.alert(
      "Inscrição Confirmada!",
      `Você foi inscrito no evento "${event.title}". Em breve você receberá mais informações.`,
      [{ text: "OK" }]
    );
  };

  const handleShare = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert(
      "Compartilhar",
      `Compartilhar "${event.title}" com amigos`,
      [{ text: "OK" }]
    );
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header com botão voltar */}
        <View className="p-5 flex-row items-center gap-3">
          <TouchableOpacity
            className="w-10 h-10 items-center justify-center rounded-full bg-surface"
            onPress={() => router.back()}
          >
            <Text className="text-xl">←</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-foreground flex-1">Detalhes do Evento</Text>
          <TouchableOpacity
            className="w-10 h-10 items-center justify-center rounded-full bg-surface"
            onPress={handleShare}
          >
            <IconSymbol name="paperplane.fill" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Imagem do evento (placeholder) */}
        <View 
          className="mx-5 rounded-2xl items-center justify-center"
          style={{ height: 200, backgroundColor: categoryColors[event.category] }}
        >
          <Text className="text-6xl">📅</Text>
        </View>

        {/* Conteúdo */}
        <View className="p-5 gap-6">
          {/* Categoria */}
          <View 
            className="px-3 py-1.5 rounded-full self-start"
            style={{ backgroundColor: `${categoryColors[event.category]}20` }}
          >
            <Text 
              className="text-sm font-semibold"
              style={{ color: categoryColors[event.category] }}
            >
              {categoryLabels[event.category]}
            </Text>
          </View>

          {/* Título */}
          <Text className="text-3xl font-bold text-foreground">
            {event.title}
          </Text>

          {/* Informações */}
          <View className="gap-4">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 items-center justify-center rounded-full bg-surface">
                <IconSymbol name="calendar" size={20} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-muted">Data</Text>
                <Text className="text-base font-semibold text-foreground">{formatDate(event.date)}</Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 items-center justify-center rounded-full bg-surface">
                <Text className="text-xl">🕐</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm text-muted">Horário</Text>
                <Text className="text-base font-semibold text-foreground">{event.time}</Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 items-center justify-center rounded-full bg-surface">
                <Text className="text-xl">📍</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm text-muted">Local</Text>
                <Text className="text-base font-semibold text-foreground">{event.location}</Text>
              </View>
            </View>
          </View>

          {/* Descrição */}
          <View className="gap-2">
            <Text className="text-xl font-bold text-foreground">Sobre o Evento</Text>
            <Text className="text-base text-foreground leading-relaxed">
              {event.description}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Botão fixo de inscrição */}
      <View 
        className="absolute bottom-0 left-0 right-0 p-5 border-t"
        style={{ backgroundColor: colors.background, borderTopColor: colors.border }}
      >
        <TouchableOpacity
          className="rounded-full py-4 items-center"
          style={{ backgroundColor: colors.primary }}
          onPress={handleSubscribe}
        >
          <Text className="text-white font-bold text-base">Inscrever-se no Evento</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
