import { ScrollView, Text, View, TouchableOpacity, RefreshControl } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import { mockEvents, categoryLabels, categoryColors, type EventCategory } from "@/lib/data/events";
import { router } from "expo-router";

export default function AgendaScreen() {
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | "all">("all");

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filteredEvents = selectedCategory === "all" 
    ? mockEvents 
    : mockEvents.filter(e => e.category === selectedCategory);

  const sortedEvents = [...filteredEvents].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
  };

  return (
    <ScreenContainer>
      <ScrollView 
        contentContainerStyle={{ padding: 20, gap: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View className="gap-2">
          <Text className="text-3xl font-bold text-foreground">Agenda</Text>
          <Text className="text-base text-muted">
            Eventos e programações da igreja
          </Text>
        </View>

        {/* Filtros por categoria */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
          <TouchableOpacity
            className="px-4 py-2 rounded-full mr-2"
            style={{ 
              backgroundColor: selectedCategory === "all" ? colors.primary : colors.surface,
              borderWidth: 1,
              borderColor: selectedCategory === "all" ? colors.primary : colors.border,
            }}
            onPress={() => setSelectedCategory("all")}
          >
            <Text 
              className="font-semibold text-sm"
              style={{ color: selectedCategory === "all" ? "#FFFFFF" : colors.foreground }}
            >
              Todos
            </Text>
          </TouchableOpacity>

          {Object.entries(categoryLabels).map(([key, label]) => (
            <TouchableOpacity
              key={key}
              className="px-4 py-2 rounded-full mr-2"
              style={{ 
                backgroundColor: selectedCategory === key ? categoryColors[key as EventCategory] : colors.surface,
                borderWidth: 1,
                borderColor: selectedCategory === key ? categoryColors[key as EventCategory] : colors.border,
              }}
              onPress={() => setSelectedCategory(key as EventCategory)}
            >
              <Text 
                className="font-semibold text-sm"
                style={{ color: selectedCategory === key ? "#FFFFFF" : colors.foreground }}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Lista de eventos */}
        <View className="gap-4">
          {sortedEvents.map((event) => (
            <TouchableOpacity
              key={event.id}
              className="bg-surface rounded-2xl p-5 gap-3 border border-border"
              onPress={() => router.push(`/event/${event.id}`)}
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1 gap-1">
                  <View className="flex-row items-center gap-2">
                    <View 
                      className="px-2 py-1 rounded-full"
                      style={{ backgroundColor: `${categoryColors[event.category]}20` }}
                    >
                      <Text 
                        className="text-xs font-semibold"
                        style={{ color: categoryColors[event.category] }}
                      >
                        {categoryLabels[event.category]}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-lg font-bold text-foreground mt-1">
                    {event.title}
                  </Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.muted} />
              </View>

              <Text className="text-sm text-muted" numberOfLines={2}>
                {event.description}
              </Text>

              <View className="flex-row items-center gap-4">
                <View className="flex-row items-center gap-2">
                  <IconSymbol name="calendar" size={16} color={colors.muted} />
                  <Text className="text-sm text-muted">{formatDate(event.date)}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-sm text-muted">🕐 {event.time}</Text>
                </View>
              </View>

              <View className="flex-row items-center gap-2">
                <Text className="text-sm text-muted">📍 {event.location}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {sortedEvents.length === 0 && (
          <View className="items-center py-10 gap-2">
            <Text className="text-5xl">📅</Text>
            <Text className="text-base text-muted text-center">
              Nenhum evento encontrado nesta categoria
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
