import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { useState, useEffect } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { router } from 'expo-router';
import { useDevocionaiProgressivo } from '@/hooks/use-devocional-progressivo';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { sequenciaNovoTestamento, getCapituloByIndex } from '@/lib/data/sequencia-nt';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

interface CapituloHistorico {
  index: number;
  livro: string;
  capitulo: number;
  data: string;
  isPassed: boolean;
  isToday: boolean;
}

export default function HistoricoDevocionaisScreen() {
  const colors = useColors();
  const { carregarCapitulo, loading } = useDevocionaiProgressivo('NAA');
  const [capitulos, setCapitulos] = useState<CapituloHistorico[]>([]);

  useEffect(() => {
    carregarCapitulos();
  }, []);

  const carregarCapitulos = () => {
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const primeiroDeJaneiro = new Date(anoAtual, 0, 1);
    const umDia = 24 * 60 * 60 * 1000;
    const indiceHoje = Math.floor((hoje.getTime() - primeiroDeJaneiro.getTime()) / umDia);

    const capitulosLista: CapituloHistorico[] = sequenciaNovoTestamento.map((_, index) => {
      const cap = getCapituloByIndex(index);
      
      // Calcular data do capítulo
      const dataCapitulo = new Date(anoAtual, 0, 1);
      dataCapitulo.setDate(dataCapitulo.getDate() + index);
      
      const isPassed = index < indiceHoje;
      const isToday = index === indiceHoje;

      return {
        index,
        livro: cap.livro,
        capitulo: cap.capitulo,
        data: dataCapitulo.toLocaleDateString('pt-BR', { 
          weekday: 'short', 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }),
        isPassed,
        isToday,
      };
    });

    setCapitulos(capitulosLista);
  };

  const handleSelectCapitulo = (livro: string, numero: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    carregarCapitulo(livro, numero);
    router.push({
      pathname: '/devocional',
      params: { livro, numero }
    });
  };

  const renderCapitulo = ({ item }: { item: CapituloHistorico }) => (
    <TouchableOpacity
      onPress={() => handleSelectCapitulo(item.livro, item.capitulo)}
      className={`flex-row items-center gap-4 p-4 rounded-xl mb-2 border ${
        item.isToday
          ? 'bg-primary/10 border-primary'
          : item.isPassed
          ? 'bg-surface border-border'
          : 'bg-surface border-border opacity-50'
      }`}
      disabled={!item.isPassed && !item.isToday}
    >
      <View
        className="w-12 h-12 items-center justify-center rounded-lg"
        style={{
          backgroundColor: item.isToday
            ? colors.primary
            : item.isPassed
            ? colors.primary + '30'
            : colors.muted + '20',
        }}
      >
        <Text className="text-lg font-bold" style={{ color: item.isToday ? '#FFFFFF' : colors.primary }}>
          {item.capitulo}
        </Text>
      </View>

      <View className="flex-1">
        <Text className={`text-base font-semibold ${item.isToday ? 'text-primary' : 'text-foreground'}`}>
          {item.livro} {item.capitulo}
        </Text>
        <Text className="text-xs text-muted">{item.data}</Text>
      </View>

      {item.isToday && (
        <View className="px-3 py-1 rounded-full" style={{ backgroundColor: colors.primary }}>
          <Text className="text-xs font-semibold text-white">Hoje</Text>
        </View>
      )}

      {item.isPassed && !item.isToday && (
        <IconSymbol name="checkmark.circle.fill" size={20} color={colors.success} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
        {/* Header */}
        <View className="gap-2">
          <View className="flex-row items-center gap-2 mb-2">
            <TouchableOpacity onPress={() => router.back()}>
              <IconSymbol name="chevron.left" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-foreground">Histórico de Devocionais</Text>
          </View>
          <Text className="text-base text-muted">
            Acesse os devotionais do Novo Testamento de qualquer dia do ano
          </Text>
        </View>

        {/* Estatísticas */}
        <View className="flex-row gap-3">
          <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
            <Text className="text-xs text-muted mb-1">Lidos</Text>
            <Text className="text-2xl font-bold text-primary">
              {capitulos.filter(c => c.isPassed || c.isToday).length}
            </Text>
          </View>
          <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
            <Text className="text-xs text-muted mb-1">Restantes</Text>
            <Text className="text-2xl font-bold text-muted">
              {capitulos.filter(c => !c.isPassed && !c.isToday).length}
            </Text>
          </View>
        </View>

        {/* Lista de Capítulos */}
        <View className="gap-2">
          <Text className="text-lg font-bold text-foreground">Todos os Capítulos</Text>
          {loading ? (
            <View className="items-center justify-center py-8">
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <FlatList
              data={capitulos}
              renderItem={renderCapitulo}
              keyExtractor={(item) => `${item.livro}-${item.capitulo}`}
              scrollEnabled={false}
              nestedScrollEnabled={false}
            />
          )}
        </View>

        {/* Dica */}
        <View className="bg-primary/10 rounded-xl p-4 border border-primary/20">
          <View className="flex-row gap-2">
            <Text className="text-lg">💡</Text>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-foreground mb-1">Dica</Text>
              <Text className="text-xs text-muted leading-relaxed">
                Você pode acessar devocionais do dia atual e anteriores. Os próximos estarão disponíveis conforme chegarem.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
