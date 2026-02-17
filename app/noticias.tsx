import { ScrollView, Text, View, TouchableOpacity, RefreshControl } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import { useState } from "react";

interface News {
  id: string;
  title: string;
  summary: string;
  category: "aviso" | "noticia" | "testemunho";
  date: string;
  imageEmoji: string;
}

const mockNews: News[] = [
  {
    id: "1",
    title: "Inscrições Abertas para Retiro Espiritual",
    summary: "Prepare-se para três dias de renovação espiritual em março. Vagas limitadas!",
    category: "aviso",
    date: "2026-02-17",
    imageEmoji: "⛺",
  },
  {
    id: "2",
    title: "Testemunho: Cura Milagrosa",
    summary: "Irmã Maria compartilha seu testemunho de cura após meses de tratamento. Glória a Deus!",
    category: "testemunho",
    date: "2026-02-16",
    imageEmoji: "🙌",
  },
  {
    id: "3",
    title: "Nova Célula no Bairro Jardim das Flores",
    summary: "Estamos expandindo! Nova célula iniciará suas atividades a partir de março.",
    category: "noticia",
    date: "2026-02-15",
    imageEmoji: "🏘️",
  },
  {
    id: "4",
    title: "Campanha de Doação de Alimentos",
    summary: "Ajude famílias necessitadas. Traga alimentos não perecíveis até o final do mês.",
    category: "aviso",
    date: "2026-02-14",
    imageEmoji: "🍞",
  },
  {
    id: "5",
    title: "Conferência de Jovens foi um Sucesso",
    summary: "Mais de 200 jovens participaram do evento. Veja as fotos e depoimentos.",
    category: "noticia",
    date: "2026-02-13",
    imageEmoji: "🎉",
  },
];

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

export default function NoticiasScreen() {
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
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

  return (
    <ScreenContainer>
      <ScrollView 
        contentContainerStyle={{ padding: 20, gap: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
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
            <Text className="text-sm text-muted mt-1">
              Fique por dentro das novidades
            </Text>
          </View>
        </View>

        {/* Lista de notícias */}
        <View className="gap-4">
          {mockNews.map((news) => (
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
