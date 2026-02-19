import { ScrollView, Text, View, TouchableOpacity, RefreshControl } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { type Noticia } from "@/lib/data/noticias";
import { trpc } from "@/lib/trpc";
import { useTempoRelativo } from "@/hooks/use-tempo-relativo";

interface News {
  id: string;
  title: string;
  summary: string;
  category: "aviso" | "noticia" | "testemunho";
  date: string;
  imageEmoji: string;
}

const mockNews: News[] = [];

const categoryLabels = {
  aviso: "Aviso",
  noticia: "Notícia",
  testemunho: "Testemunho",
};

const categoryColors = {
  aviso: "#F59E0B",
  noticia: "#6B46C1",
  testemunho: "#10B981",
};

const ActivityIndicator = require('react-native').ActivityIndicator;

export default function NoticiasScreen() {
  const colors = useColors();
  const [noticias, setNoticias] = useState<News[]>([]);

  // @ts-expect-error - Endpoint noticias existe
  const { data: noticiasData, isLoading: carregando, refetch, dataUpdatedAt } = trpc.noticias.list.useQuery(undefined, {
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });

  const ultimaAtualizacao = useTempoRelativo(dataUpdatedAt);

  useEffect(() => {
    if (noticiasData) {
      const noticiasFormatadas: News[] = noticiasData.map((n: any) => ({
        id: n.id.toString(),
        title: n.titulo,
        summary: n.conteudo,
        category: n.destaque ? 'aviso' : 'noticia' as "aviso" | "noticia" | "testemunho",
        date: n.data,
        imageEmoji: "📰",
      }));
      setNoticias(noticiasFormatadas);
    }
  }, [noticiasData]);

  const onRefresh = async () => {
    await refetch();
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

  if (carregando) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  const noticiasOrdenadas = (noticias.length > 0 ? noticias : mockNews).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <ScreenContainer>
      <ScrollView 
        contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={carregando} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
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
            <View className="flex-row items-center justify-between mt-1">
              <Text className="text-sm text-muted">
                Fique por dentro das novidades
              </Text>
              <Text className="text-xs text-muted">
                🔄 {ultimaAtualizacao}
              </Text>
            </View>
          </View>
        </View>

                {/* News List */}
        <View className="gap-3">
          {noticiasOrdenadas.map((news) => (
            <TouchableOpacity
              key={news.id}
              className="bg-surface rounded-2xl overflow-hidden border border-border"
            >
              {/* Imagem placeholder */}
              <View 
                className="items-center justify-center"
                style={{ height: 150, backgroundColor: categoryColors[news.category] }}
              >
                <Text className="text-6xl">{news.imageEmoji}</Text>
              </View>

              {/* Conteúdo */}
              <View className="p-5 gap-3">
                <View 
                  className="px-3 py-1.5 rounded-full self-start"
                  style={{ backgroundColor: `${categoryColors[news.category]}20` }}
                >
                  <Text 
                    className="text-xs font-semibold"
                    style={{ color: categoryColors[news.category] }}
                  >
                    {categoryLabels[news.category]}
                  </Text>
                </View>

                <Text className="text-xl font-bold text-foreground">
                  {news.title}
                </Text>

                <Text className="text-sm text-muted leading-relaxed">
                  {news.summary}
                </Text>

                <View className="flex-row items-center justify-between mt-2">
                  <Text className="text-xs text-muted">
                    {formatDate(news.date)}
                  </Text>
                  <View className="flex-row items-center gap-1">
                    <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
                      Ler mais
                    </Text>
                    <IconSymbol name="chevron.right" size={14} color={colors.primary} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Mensagem de fim */}
        <View className="items-center py-6">
          <Text className="text-sm text-muted">Você está em dia com as notícias! 📰</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
