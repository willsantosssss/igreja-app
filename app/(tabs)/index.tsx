import { ScrollView, Text, View, TouchableOpacity, RefreshControl } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import { router } from "expo-router";

export default function HomeScreen() {
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <ScreenContainer>
      <ScrollView 
        contentContainerStyle={{ padding: 20, gap: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header com saudação */}
        <View className="gap-2">
          <Text className="text-4xl font-bold text-foreground">Bem-vindo!</Text>
          <Text className="text-base text-muted">
            Igreja Connect - Conectando você à comunidade
          </Text>
        </View>

        {/* Card de Devocional do Dia */}
        <View className="bg-primary rounded-2xl p-6 gap-3">
          <View className="flex-row items-center gap-2">
            <IconSymbol name="book.fill" size={24} color="#FFFFFF" />
            <Text className="text-lg font-semibold text-white">Devocional do Dia</Text>
          </View>
          <Text className="text-sm text-white opacity-90">
            "No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus."
          </Text>
          <Text className="text-xs text-white opacity-75">João 1:1</Text>
          <TouchableOpacity 
            className="bg-white rounded-full px-4 py-2 self-start mt-2"
            onPress={() => router.push("/devocional")}
            style={{ opacity: 0.95 }}
          >
            <Text className="text-primary font-semibold text-sm">Ler capítulo</Text>
          </TouchableOpacity>
        </View>

        {/* Card de Próximo Evento */}
        <View className="bg-surface rounded-2xl p-6 gap-3 border border-border">
          <View className="flex-row items-center gap-2">
            <IconSymbol name="calendar" size={24} color={colors.primary} />
            <Text className="text-lg font-semibold text-foreground">Próximo Evento</Text>
          </View>
          <View className="gap-1">
            <Text className="text-base font-semibold text-foreground">Culto de Celebração</Text>
            <Text className="text-sm text-muted">Domingo, 19:00</Text>
            <Text className="text-sm text-muted">📍 Templo Central</Text>
          </View>
          <TouchableOpacity 
            className="border-2 rounded-full px-4 py-2 self-start mt-2"
            style={{ borderColor: colors.primary }}
            onPress={() => router.push("/agenda")}
          >
            <Text className="font-semibold text-sm" style={{ color: colors.primary }}>Ver agenda</Text>
          </TouchableOpacity>
        </View>

        {/* Grid de Acesso Rápido */}
        <View className="gap-3">
          <Text className="text-xl font-bold text-foreground">Acesso Rápido</Text>
          
          <View className="flex-row gap-3">
            <TouchableOpacity 
              className="flex-1 bg-surface rounded-2xl p-5 items-center gap-3 border border-border"
              onPress={() => router.push("/celulas")}
            >
              <IconSymbol name="map.fill" size={32} color={colors.primary} />
              <Text className="text-sm font-semibold text-foreground text-center">Células</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-1 bg-surface rounded-2xl p-5 items-center gap-3 border border-border"
              onPress={() => router.push("/oracao")}
            >
              <IconSymbol name="hands.sparkles.fill" size={32} color={colors.primary} />
              <Text className="text-sm font-semibold text-foreground text-center">Oração</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity 
              className="flex-1 bg-surface rounded-2xl p-5 items-center gap-3 border border-border"
              onPress={() => router.push("/mais")}
            >
              <IconSymbol name="heart.fill" size={32} color={colors.secondary} />
              <Text className="text-sm font-semibold text-foreground text-center">Contribuir</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-1 bg-surface rounded-2xl p-5 items-center gap-3 border border-border"
              onPress={() => router.push("/mais")}
            >
              <IconSymbol name="newspaper.fill" size={32} color={colors.primary} />
              <Text className="text-sm font-semibold text-foreground text-center">Notícias</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Avisos Importantes */}
        <View className="bg-warning/10 rounded-2xl p-5 gap-2 border border-warning/20">
          <View className="flex-row items-center gap-2">
            <Text className="text-2xl">📢</Text>
            <Text className="text-base font-semibold text-foreground">Aviso Importante</Text>
          </View>
          <Text className="text-sm text-foreground">
            Inscrições abertas para o retiro espiritual de março! Vagas limitadas.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
