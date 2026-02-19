import { useState, useMemo } from 'react';
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { trpc } from '@/lib/trpc';

type AbaAtiva = 'lista' | 'estatisticas' | 'graficos';

export default function AdminRelatoriosScreen() {
  const colors = useColors();
  const router = useRouter();
  const [filtroCelula, setFiltroCelula] = useState<string>('todos');
  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>('lista');

  const { data: relatorios, isLoading, refetch } = trpc.relatorios.list.useQuery(undefined, {
    refetchOnWindowFocus: true,
  });

  const { data: celulas } = trpc.celulas.list.useQuery();

  // Filtrar relatórios
  const relatoriosFiltrados = useMemo(() => {
    if (!relatorios) return [];
    if (filtroCelula === 'todos') return relatorios;
    return relatorios.filter(r => r.celula === filtroCelula);
  }, [relatorios, filtroCelula]);

  // Estatísticas
  const stats = useMemo(() => {
    if (!relatoriosFiltrados.length) return null;
    
    const totalRelatorios = relatoriosFiltrados.length;
    const totalPresentes = relatoriosFiltrados.reduce((sum, r) => sum + r.presentes, 0);
    const totalVisitantes = relatoriosFiltrados.reduce((sum, r) => sum + r.novosVisitantes, 0);
    const totalConversoes = relatoriosFiltrados.reduce((sum, r) => sum + r.conversoes, 0);
    const mediaPresentes = Math.round(totalPresentes / totalRelatorios);

    return {
      totalRelatorios,
      totalPresentes,
      totalVisitantes,
      totalConversoes,
      mediaPresentes,
    };
  }, [relatoriosFiltrados]);

  // Dados para gráfico (últimos 10 relatórios)
  const dadosGrafico = useMemo(() => {
    if (!relatoriosFiltrados.length) return null;
    
    const ultimos = [...relatoriosFiltrados]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .reverse();

    return {
      labels: ultimos.map(r => {
        const date = new Date(r.createdAt);
        return `${date.getDate()}/${date.getMonth() + 1}`;
      }),
      presentes: ultimos.map(r => r.presentes),
      visitantes: ultimos.map(r => r.novosVisitantes),
      conversoes: ultimos.map(r => r.conversoes),
    };
  }, [relatoriosFiltrados]);

  // Células únicas para filtro
  const celulasUnicas = useMemo(() => {
    if (!relatorios) return [];
    const unique = [...new Set(relatorios.map(r => r.celula))];
    return unique.sort();
  }, [relatorios]);

  if (isLoading) {
    return (
      <ScreenContainer className="p-6 justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-muted mt-4">Carregando relatórios...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <View className="gap-1">
            <Text className="text-3xl font-bold text-foreground">Relatórios</Text>
            <Text className="text-sm text-muted">
              {relatoriosFiltrados.length} relatório{relatoriosFiltrados.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => refetch()}
            className="bg-primary px-4 py-2 rounded-full"
          >
            <Text className="text-background font-semibold">Atualizar</Text>
          </TouchableOpacity>
        </View>

        {/* Filtro de Célula */}
        <View className="gap-2">
          <Text className="text-sm font-semibold text-foreground">Filtrar por Célula</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            <TouchableOpacity
              onPress={() => setFiltroCelula('todos')}
              className={`px-4 py-2 rounded-full ${filtroCelula === 'todos' ? 'bg-primary' : 'bg-surface'}`}
            >
              <Text className={`font-semibold ${filtroCelula === 'todos' ? 'text-background' : 'text-foreground'}`}>
                Todas
              </Text>
            </TouchableOpacity>
            {celulasUnicas.map(celula => (
              <TouchableOpacity
                key={celula}
                onPress={() => setFiltroCelula(celula)}
                className={`px-4 py-2 rounded-full ${filtroCelula === celula ? 'bg-primary' : 'bg-surface'}`}
              >
                <Text className={`font-semibold ${filtroCelula === celula ? 'text-background' : 'text-foreground'}`}>
                  {celula}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Abas */}
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => setAbaAtiva('lista')}
            className={`flex-1 py-3 rounded-xl ${abaAtiva === 'lista' ? 'bg-primary' : 'bg-surface'}`}
          >
            <Text className={`text-center font-semibold ${abaAtiva === 'lista' ? 'text-background' : 'text-foreground'}`}>
              Lista
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setAbaAtiva('estatisticas')}
            className={`flex-1 py-3 rounded-xl ${abaAtiva === 'estatisticas' ? 'bg-primary' : 'bg-surface'}`}
          >
            <Text className={`text-center font-semibold ${abaAtiva === 'estatisticas' ? 'text-background' : 'text-foreground'}`}>
              Estatísticas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setAbaAtiva('graficos')}
            className={`flex-1 py-3 rounded-xl ${abaAtiva === 'graficos' ? 'bg-primary' : 'bg-surface'}`}
          >
            <Text className={`text-center font-semibold ${abaAtiva === 'graficos' ? 'text-background' : 'text-foreground'}`}>
              Gráficos
            </Text>
          </TouchableOpacity>
        </View>

        {/* Conteúdo por Aba */}
        {abaAtiva === 'lista' && (
          <View className="gap-3">
            {relatoriosFiltrados.length === 0 ? (
              <View className="bg-surface rounded-2xl p-6 items-center">
                <Text className="text-muted text-center">Nenhum relatório encontrado</Text>
              </View>
            ) : (
              relatoriosFiltrados
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map(relatorio => (
                  <View key={relatorio.id} className="bg-surface rounded-2xl p-4 gap-2">
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1">
                        <Text className="text-lg font-bold text-foreground">{relatorio.celula}</Text>
                        <Text className="text-sm text-muted">{relatorio.periodo}</Text>
                      </View>
                      <View className="bg-primary/10 px-3 py-1 rounded-full">
                        <Text className="text-xs font-semibold text-primary">{relatorio.tipo}</Text>
                      </View>
                    </View>
                    
                    <View className="flex-row flex-wrap gap-3 mt-2">
                      <View className="bg-background rounded-xl p-3 flex-1 min-w-[80px]">
                        <Text className="text-2xl font-bold text-primary">{relatorio.presentes}</Text>
                        <Text className="text-xs text-muted">Presentes</Text>
                      </View>
                      <View className="bg-background rounded-xl p-3 flex-1 min-w-[80px]">
                        <Text className="text-2xl font-bold text-primary">{relatorio.novosVisitantes}</Text>
                        <Text className="text-xs text-muted">Visitantes</Text>
                      </View>
                      <View className="bg-background rounded-xl p-3 flex-1 min-w-[80px]">
                        <Text className="text-2xl font-bold text-success">{relatorio.conversoes}</Text>
                        <Text className="text-xs text-muted">Conversões</Text>
                      </View>
                    </View>

                    {relatorio.observacoes && (
                      <View className="mt-2 bg-background rounded-xl p-3">
                        <Text className="text-xs font-semibold text-foreground mb-1">Observações:</Text>
                        <Text className="text-sm text-muted">{relatorio.observacoes}</Text>
                      </View>
                    )}
                  </View>
                ))
            )}
          </View>
        )}

        {abaAtiva === 'estatisticas' && stats && (
          <View className="gap-4">
            <View className="bg-surface rounded-2xl p-4 gap-3">
              <Text className="text-lg font-bold text-foreground">Resumo Geral</Text>
              
              <View className="flex-row flex-wrap gap-3">
                <View className="bg-background rounded-xl p-4 flex-1 min-w-[140px]">
                  <Text className="text-3xl font-bold text-primary">{stats.totalRelatorios}</Text>
                  <Text className="text-sm text-muted">Total de Relatórios</Text>
                </View>
                <View className="bg-background rounded-xl p-4 flex-1 min-w-[140px]">
                  <Text className="text-3xl font-bold text-primary">{stats.mediaPresentes}</Text>
                  <Text className="text-sm text-muted">Média de Presentes</Text>
                </View>
              </View>

              <View className="flex-row flex-wrap gap-3">
                <View className="bg-background rounded-xl p-4 flex-1 min-w-[140px]">
                  <Text className="text-3xl font-bold text-primary">{stats.totalPresentes}</Text>
                  <Text className="text-sm text-muted">Total de Presentes</Text>
                </View>
                <View className="bg-background rounded-xl p-4 flex-1 min-w-[140px]">
                  <Text className="text-3xl font-bold text-primary">{stats.totalVisitantes}</Text>
                  <Text className="text-sm text-muted">Total de Visitantes</Text>
                </View>
              </View>

              <View className="bg-background rounded-xl p-4">
                <Text className="text-3xl font-bold text-success">{stats.totalConversoes}</Text>
                <Text className="text-sm text-muted">Total de Conversões</Text>
              </View>
            </View>
          </View>
        )}

        {abaAtiva === 'graficos' && dadosGrafico && (
          <View className="gap-4">
            <View className="bg-surface rounded-2xl p-4 gap-4">
              <Text className="text-lg font-bold text-foreground">Evolução (Últimos 10 Relatórios)</Text>
              
              {/* Gráfico de Presentes */}
              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Presentes</Text>
                <View className="bg-background rounded-xl p-4">
                  {dadosGrafico.presentes.map((valor, idx) => (
                    <View key={idx} className="flex-row items-center gap-2 mb-2">
                      <Text className="text-xs text-muted w-12">{dadosGrafico.labels[idx]}</Text>
                      <View className="flex-1 bg-border rounded-full h-6 overflow-hidden">
                        <View 
                          className="bg-primary h-full rounded-full items-end justify-center pr-2"
                          style={{ width: `${(valor / Math.max(...dadosGrafico.presentes)) * 100}%` }}
                        >
                          <Text className="text-xs font-bold text-background">{valor}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Gráfico de Visitantes */}
              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Visitantes</Text>
                <View className="bg-background rounded-xl p-4">
                  {dadosGrafico.visitantes.map((valor, idx) => (
                    <View key={idx} className="flex-row items-center gap-2 mb-2">
                      <Text className="text-xs text-muted w-12">{dadosGrafico.labels[idx]}</Text>
                      <View className="flex-1 bg-border rounded-full h-6 overflow-hidden">
                        <View 
                          className="bg-primary h-full rounded-full items-end justify-center pr-2"
                          style={{ width: `${Math.max(...dadosGrafico.visitantes) > 0 ? (valor / Math.max(...dadosGrafico.visitantes)) * 100 : 0}%` }}
                        >
                          {valor > 0 && <Text className="text-xs font-bold text-background">{valor}</Text>}
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Gráfico de Conversões */}
              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Conversões</Text>
                <View className="bg-background rounded-xl p-4">
                  {dadosGrafico.conversoes.map((valor, idx) => (
                    <View key={idx} className="flex-row items-center gap-2 mb-2">
                      <Text className="text-xs text-muted w-12">{dadosGrafico.labels[idx]}</Text>
                      <View className="flex-1 bg-border rounded-full h-6 overflow-hidden">
                        <View 
                          className="bg-success h-full rounded-full items-end justify-center pr-2"
                          style={{ width: `${Math.max(...dadosGrafico.conversoes) > 0 ? (valor / Math.max(...dadosGrafico.conversoes)) * 100 : 0}%` }}
                        >
                          {valor > 0 && <Text className="text-xs font-bold text-background">{valor}</Text>}
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Botão Voltar */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-border py-3 rounded-full items-center mt-4"
        >
          <Text className="text-foreground font-semibold">Voltar</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
