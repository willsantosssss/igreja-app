import { ScrollView, Text, View, TouchableOpacity, RefreshControl, TextInput, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import { categoryLabels, categoryEmojis, type PrayerCategory, type PrayerRequest } from "@/lib/data/oracao";
import { trpc } from "@/lib/trpc";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { useTempoRelativo } from "@/hooks/use-tempo-relativo";

export default function OracaoScreen() {
  const colors = useColors();
  const [selectedCategory, setSelectedCategory] = useState<PrayerCategory | "all">("all");
  const [prayingFor, setPrayingFor] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [pedidos, setPedidos] = useState<PrayerRequest[]>([]);

  const { data: pedidosData, isLoading, refetch, dataUpdatedAt } = trpc.oracao.list.useQuery(undefined, {
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });

  const createMutation = trpc.oracao.create.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const incrementCounterMutation = trpc.oracao.incrementarContador.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const ultimaAtualizacao = useTempoRelativo(dataUpdatedAt);

  useEffect(() => {
    if (pedidosData) {
      setPedidos(pedidosData.map((p: any) => ({
        id: p.id.toString(),
        title: p.nome,
        description: p.descricao,
        author: p.categoria,
        category: 'espiritual' as PrayerCategory,
        date: p.createdAt || new Date().toISOString(),
        prayerCount: p.contadorOrando || 0,
        prayingCount: p.contadorOrando || 0,
        isAnswered: p.respondido || false,
      })));
    }
  }, [pedidosData]);
  
  // Form state
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState<PrayerCategory>("espiritual");

  const onRefresh = async () => {
    await refetch();
  };

  const filteredRequests = selectedCategory === "all" 
    ? pedidos 
    : pedidos.filter(r => r.category === selectedCategory);

  const sortedRequests = [...filteredRequests].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const togglePraying = async (id: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    const newPrayingFor = new Set(prayingFor);
    const wasNotPraying = !prayingFor.has(id);
    
    if (prayingFor.has(id)) {
      newPrayingFor.delete(id);
    } else {
      newPrayingFor.add(id);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      // Incrementar contador no banco apenas quando começar a orar
      try {
        await incrementCounterMutation.mutateAsync(parseInt(id));
      } catch (error) {
        console.error("Erro ao incrementar contador:", error);
      }
    }
    
    setPrayingFor(newPrayingFor);
    
    try {
      await AsyncStorage.setItem(
        "@oracao_praying_for",
        JSON.stringify(Array.from(newPrayingFor))
      );
    } catch (error) {
      console.error("Erro ao salvar orações:", error);
    }
  };

  const handleAddPrayer = async () => {
    if (!newTitle.trim() || !newDescription.trim()) {
      Alert.alert("Atenção", "Por favor, preencha o título e a descrição do pedido.");
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    try {
      await createMutation.mutateAsync({
        nome: newTitle.trim(),
        descricao: newDescription.trim(),
        categoria: newCategory,
      });
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      Alert.alert("Erro", "Não foi possível enviar o pedido. Tente novamente.");
      return;
    }

    Alert.alert(
      "Pedido Enviado!",
      "Seu pedido de oração foi compartilhado com a comunidade. Deus ouvirá nossas orações!",
      [{ text: "Amém!" }]
    );

    setNewTitle("");
    setNewDescription("");
    setNewCategory("espiritual");
    setShowAddForm(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "Ontem";
    if (diffDays < 7) return `${diffDays} dias atrás`;
    return date.toLocaleDateString("pt-BR");
  };

  if (showAddForm) {
    return (
      <ScreenContainer>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-3xl font-bold text-foreground">Novo Pedido</Text>
              <Text className="text-sm text-muted mt-1">
                Compartilhe seu pedido de oração
              </Text>
            </View>
            <TouchableOpacity
              className="w-10 h-10 items-center justify-center rounded-full bg-surface"
              onPress={() => setShowAddForm(false)}
            >
              <Text className="text-xl">✕</Text>
            </TouchableOpacity>
          </View>

          <View className="gap-4">
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Título do Pedido</Text>
              <TextInput
                className="bg-surface rounded-xl px-4 py-3 text-foreground border"
                style={{ borderColor: colors.border }}
                placeholder="Ex: Cura para minha família"
                placeholderTextColor={colors.muted}
                value={newTitle}
                onChangeText={setNewTitle}
              />
            </View>

            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Categoria</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <TouchableOpacity
                    key={key}
                    className="px-4 py-2 rounded-full mr-2 flex-row items-center gap-2"
                    style={{ 
                      backgroundColor: newCategory === key ? colors.primary : colors.surface,
                      borderWidth: 1,
                      borderColor: newCategory === key ? colors.primary : colors.border,
                    }}
                    onPress={() => setNewCategory(key as PrayerCategory)}
                  >
                    <Text>{categoryEmojis[key as PrayerCategory]}</Text>
                    <Text 
                      className="font-semibold text-sm"
                      style={{ color: newCategory === key ? "#FFFFFF" : colors.foreground }}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Descrição</Text>
              <TextInput
                className="bg-surface rounded-xl px-4 py-3 text-foreground border"
                style={{ borderColor: colors.border, minHeight: 120, textAlignVertical: "top" }}
                placeholder="Descreva seu pedido de oração..."
                placeholderTextColor={colors.muted}
                value={newDescription}
                onChangeText={setNewDescription}
                multiline
                numberOfLines={5}
              />
            </View>

            <TouchableOpacity
              className="rounded-full py-4 items-center mt-4"
              style={{ backgroundColor: colors.primary }}
              onPress={handleAddPrayer}
            >
              <Text className="text-white font-bold text-base">Compartilhar Pedido</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView 
        contentContainerStyle={{ padding: 20, gap: 20 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-3xl font-bold text-foreground">Oração</Text>
            <View className="flex-row items-center justify-between">
              <Text className="text-base text-muted">
                Pedidos da comunidade
              </Text>
              <Text className="text-xs text-muted">
                🔄 {ultimaAtualizacao}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            className="rounded-full px-4 py-2 flex-row items-center gap-2"
            style={{ backgroundColor: colors.primary }}
            onPress={() => setShowAddForm(true)}
          >
            <IconSymbol name="plus.circle.fill" size={20} color="#FFFFFF" />
            <Text className="text-white font-semibold text-sm">Adicionar</Text>
          </TouchableOpacity>
        </View>

        {/* Filtros */}
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
              className="px-4 py-2 rounded-full mr-2 flex-row items-center gap-2"
              style={{ 
                backgroundColor: selectedCategory === key ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: selectedCategory === key ? colors.primary : colors.border,
              }}
              onPress={() => setSelectedCategory(key as PrayerCategory)}
            >
              <Text>{categoryEmojis[key as PrayerCategory]}</Text>
              <Text 
                className="font-semibold text-sm"
                style={{ color: selectedCategory === key ? "#FFFFFF" : colors.foreground }}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Lista de pedidos */}
        <View className="gap-4">
          {sortedRequests.map((request) => {
            const isPraying = prayingFor.has(request.id);
            
            return (
              <View
                key={request.id}
                className="bg-surface rounded-2xl p-5 gap-3 border"
                style={{ 
                  borderColor: request.isAnswered ? colors.success : colors.border,
                  borderWidth: request.isAnswered ? 2 : 1,
                }}
              >
                {request.isAnswered && (
                  <View 
                    className="px-3 py-1.5 rounded-full self-start"
                    style={{ backgroundColor: `${colors.success}20` }}
                  >
                    <Text className="text-sm font-semibold" style={{ color: colors.success }}>
                      ✓ Oração Respondida
                    </Text>
                  </View>
                )}

                <View className="flex-row items-start justify-between">
                  <View className="flex-1 gap-1">
                    <Text className="text-lg font-bold text-foreground">
                      {request.title}
                    </Text>
                    <Text className="text-xs text-muted">
                      {categoryEmojis[request.category]} {categoryLabels[request.category]} • {request.author} • {formatDate(request.date)}
                    </Text>
                  </View>
                </View>

                <Text className="text-sm text-foreground leading-relaxed">
                  {request.description}
                </Text>

                {request.testimony && (
                  <View className="p-3 rounded-xl" style={{ backgroundColor: `${colors.success}10` }}>
                    <Text className="text-sm font-semibold text-foreground mb-1">Testemunho:</Text>
                    <Text className="text-sm text-foreground italic">{request.testimony}</Text>
                  </View>
                )}

                <View className="flex-row items-center justify-between mt-2">
                  <Text className="text-sm text-muted">
                    🙏 {request.prayingCount} pessoas orando
                  </Text>
                  
                  <TouchableOpacity
                    className="px-4 py-2 rounded-full flex-row items-center gap-2"
                    style={{ backgroundColor: isPraying ? colors.success : colors.primary }}
                    onPress={() => togglePraying(request.id)}
                  >
                    <IconSymbol 
                      name={isPraying ? "checkmark.circle.fill" : "hands.sparkles.fill"} 
                      size={16} 
                      color="#FFFFFF" 
                    />
                    <Text className="text-white font-semibold text-sm">
                      {isPraying ? "Orando" : "Orar"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {sortedRequests.length === 0 && (
          <View className="items-center py-10 gap-2">
            <Text className="text-5xl">🙏</Text>
            <Text className="text-base text-muted text-center">
              Nenhum pedido encontrado nesta categoria
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
