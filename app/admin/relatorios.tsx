import { useState, useEffect, useCallback, useMemo } from 'react';
import { ScrollView, Text, View, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { LineChart, type LineChartDataset } from '@/components/line-chart';
import { getRelatorios, getLideres, type RelatorioCelula, type LiderCelula } from '@/lib/data/lideres';

type FiltroTipo = 'todos' | string;

export default function AdminRelatoriosScreen() {
  const colors = useColors();
  const router = useRouter();
  const [relatorios, setRelatorios] = useState<RelatorioCelula[]>([]);
  const [lideres, setLideres] = useState<LiderCelula[]>([]);
  const [filtroCelula, setFiltroCelula] = useState<FiltroTipo>('todos');
  const [carregando, setCarregando] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<'lista' | 'graficos'>('lista');
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = Math.min(screenWidth - 40, 400);

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [])
  );

  const carregarDados = async () => {
    setCarregando(true);
    const [rels, lids] = await Promise.all([getRelatorios(), getLideres()]);
    setRelatorios(rels);
    setLideres(lids);
    setCarregando(false);
  };

  // Filtrar por célula
  const relatoriosFiltrados = filtroCelula === 'todos'
    ? relatorios
    : relatorios.filter(r => r.celulaNome === filtroCelula);

  // Agrupar por data
  const agrupadosPorData = relatoriosFiltrados.reduce<Record<string, RelatorioCelula[]>>((acc, r) => {
    const chave = r.data;
    if (!acc[chave]) acc[chave] = [];
    acc[chave].push(r);
    return acc;
  }, {});

  // Ordenar datas (mais recentes primeiro)
  const datasOrdenadas = Object.keys(agrupadosPorData).sort((a, b) => {
    const parseData = (d: string) => {
      const parts = d.split('/');
      if (parts.length === 3) {
        return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).getTime();
      }
      return 0;
    };
    return parseData(b) - parseData(a);
  });

  // Nomes únicos de células
  const celulasUnicas = [...new Set(relatorios.map(r => r.celulaNome))].sort();

  // Cores para cada célula nos gráficos
  const coresCelulas = useMemo(() => {
    const paleta = ['#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#F97316', '#14B8A6'];
    const mapa: Record<string, string> = {};
    celulasUnicas.forEach((cel, i) => {
      mapa[cel] = paleta[i % paleta.length];
    });
    return mapa;
  }, [celulasUnicas.join(',')]);

  // Função para parsear data DD/MM/YYYY
  const parseData = (d: string) => {
    const parts = d.split('/');
    if (parts.length === 3) {
      return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).getTime();
    }
    return 0;
  };

  // Preparar dados para gráficos
  const dadosGraficos = useMemo(() => {
    if (relatoriosFiltrados.length === 0) return null;

    // Obter todas as datas únicas e ordená-las cronologicamente
    const datasUnicas = [...new Set(relatoriosFiltrados.map(r => r.data))]
      .sort((a, b) => parseData(a) - parseData(b));

    // Limitar a últimas 12 datas para legibilidade
    const datasExibidas = datasUnicas.slice(-12);
    const labelsFormatadas = datasExibidas.map(d => {
      const parts = d.split('/');
      return `${parts[0]}/${parts[1]}`;
    });

    if (filtroCelula !== 'todos') {
      // Uma célula selecionada: mostrar presença e visitantes como duas linhas
      const presencaData = datasExibidas.map(data => {
        const rels = relatoriosFiltrados.filter(r => r.data === data);
        return rels.reduce((acc, r) => acc + r.totalPessoas, 0);
      });
      const visitantesData = datasExibidas.map(data => {
        const rels = relatoriosFiltrados.filter(r => r.data === data);
        return rels.reduce((acc, r) => acc + r.visitantes, 0);
      });

      return {
        labels: labelsFormatadas,
        presencaDatasets: [
          { label: 'Presença Total', data: presencaData, color: colors.primary },
          { label: 'Visitantes', data: visitantesData, color: colors.success },
        ] as LineChartDataset[],
        visitantesDatasets: null,
      };
    } else {
      // Todas as células: uma linha por célula
      const presencaDatasets: LineChartDataset[] = celulasUnicas
        .filter(cel => relatorios.some(r => r.celulaNome === cel))
        .map(cel => ({
          label: cel,
          data: datasExibidas.map(data => {
            const rels = relatorios.filter(r => r.celulaNome === cel && r.data === data);
            return rels.reduce((acc, r) => acc + r.totalPessoas, 0);
          }),
          color: coresCelulas[cel] || '#06B6D4',
        }));

      const visitantesDatasets: LineChartDataset[] = celulasUnicas
        .filter(cel => relatorios.some(r => r.celulaNome === cel))
        .map(cel => ({
          label: cel,
          data: datasExibidas.map(data => {
            const rels = relatorios.filter(r => r.celulaNome === cel && r.data === data);
            return rels.reduce((acc, r) => acc + r.visitantes, 0);
          }),
          color: coresCelulas[cel] || '#06B6D4',
        }));

      return {
        labels: labelsFormatadas,
        presencaDatasets,
        visitantesDatasets,
      };
    }
  }, [relatoriosFiltrados, filtroCelula, celulasUnicas.join(',')]);

  // Totais gerais
  const totalPessoas = relatoriosFiltrados.reduce((acc, r) => acc + r.totalPessoas, 0);
  const totalVisitantes = relatoriosFiltrados.reduce((acc, r) => acc + r.visitantes, 0);
  const mediaPresenca = relatoriosFiltrados.length > 0
    ? Math.round(totalPessoas / relatoriosFiltrados.length)
    : 0;
  const mediaVisitantes = relatoriosFiltrados.length > 0
    ? Math.round(totalVisitantes / relatoriosFiltrados.length)
    : 0;

  if (carregando) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted text-base">Carregando relatórios...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 100 }}>
        {/* Header */}
        <View className="flex-row items-center mb-2">
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginRight: 12, padding: 4 }}
          >
            <IconSymbol name="chevron.right" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-foreground">Relatórios de Células</Text>
            <Text className="text-muted text-sm">
              {relatoriosFiltrados.length} relatório{relatoriosFiltrados.length !== 1 ? 's' : ''}
              {filtroCelula !== 'todos' ? ` — ${filtroCelula}` : ' — Todas as células'}
            </Text>
          </View>
        </View>

        {/* Filtro por Célula */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            onPress={() => setFiltroCelula('todos')}
            style={{
              backgroundColor: filtroCelula === 'todos' ? colors.primary : colors.surface,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 20,
              marginRight: 8,
              borderWidth: 1,
              borderColor: filtroCelula === 'todos' ? colors.primary : colors.border,
            }}
          >
            <Text style={{
              color: filtroCelula === 'todos' ? '#fff' : colors.foreground,
              fontWeight: '600',
              fontSize: 13,
            }}>
              Todas ({relatorios.length})
            </Text>
          </TouchableOpacity>
          {celulasUnicas.map((cel) => {
            const count = relatorios.filter(r => r.celulaNome === cel).length;
            return (
              <TouchableOpacity
                key={cel}
                onPress={() => setFiltroCelula(cel)}
                style={{
                  backgroundColor: filtroCelula === cel ? colors.primary : colors.surface,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 20,
                  marginRight: 8,
                  borderWidth: 1,
                  borderColor: filtroCelula === cel ? colors.primary : colors.border,
                }}
              >
                <Text style={{
                  color: filtroCelula === cel ? '#fff' : colors.foreground,
                  fontWeight: '600',
                  fontSize: 13,
                }}>
                  {cel} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Abas: Lista / Gráficos */}
        {relatoriosFiltrados.length > 0 && (
          <View className="flex-row rounded-xl overflow-hidden" style={{ borderWidth: 1, borderColor: colors.border }}>
            <TouchableOpacity
              onPress={() => setAbaAtiva('lista')}
              style={{
                flex: 1,
                paddingVertical: 10,
                alignItems: 'center',
                backgroundColor: abaAtiva === 'lista' ? colors.primary : colors.surface,
              }}
            >
              <Text style={{
                color: abaAtiva === 'lista' ? '#fff' : colors.foreground,
                fontWeight: '700',
                fontSize: 13,
              }}>Relatórios</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setAbaAtiva('graficos')}
              style={{
                flex: 1,
                paddingVertical: 10,
                alignItems: 'center',
                backgroundColor: abaAtiva === 'graficos' ? colors.primary : colors.surface,
              }}
            >
              <Text style={{
                color: abaAtiva === 'graficos' ? '#fff' : colors.foreground,
                fontWeight: '700',
                fontSize: 13,
              }}>Gráficos</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Resumo Geral */}
        {relatoriosFiltrados.length > 0 && (
          <View className="flex-row gap-2">
            <View
              className="flex-1 rounded-2xl p-4 items-center"
              style={{
                backgroundColor: colors.primary + '10',
                borderWidth: 1,
                borderColor: colors.primary + '20',
              }}
            >
              <Text style={{ color: colors.primary, fontSize: 22, fontWeight: '800' }}>
                {relatoriosFiltrados.length}
              </Text>
              <Text className="text-xs text-muted text-center">Relatórios</Text>
            </View>
            <View
              className="flex-1 rounded-2xl p-4 items-center"
              style={{
                backgroundColor: colors.success + '10',
                borderWidth: 1,
                borderColor: colors.success + '20',
              }}
            >
              <Text style={{ color: colors.success, fontSize: 22, fontWeight: '800' }}>
                {mediaPresenca}
              </Text>
              <Text className="text-xs text-muted text-center">Média Presença</Text>
            </View>
            <View
              className="flex-1 rounded-2xl p-4 items-center"
              style={{
                backgroundColor: colors.warning + '10',
                borderWidth: 1,
                borderColor: colors.warning + '20',
              }}
            >
              <Text style={{ color: colors.warning, fontSize: 22, fontWeight: '800' }}>
                {mediaVisitantes}
              </Text>
              <Text className="text-xs text-muted text-center">Média Visitantes</Text>
            </View>
          </View>
        )}

        {/* === ABA GRÁFICOS === */}
        {abaAtiva === 'graficos' && dadosGraficos && (
          <View className="gap-4">
            {/* Gráfico de Presença */}
            <View
              className="bg-surface rounded-2xl p-4 border border-border"
            >
              <LineChart
                title={filtroCelula !== 'todos' ? `Evolução — ${filtroCelula}` : 'Presença por Célula'}
                labels={dadosGraficos.labels}
                datasets={dadosGraficos.presencaDatasets}
                width={chartWidth}
                height={240}
                gridColor={colors.border}
                labelColor={colors.muted}
                showArea={filtroCelula !== 'todos'}
                showDots={dadosGraficos.labels.length <= 8}
              />
            </View>

            {/* Gráfico de Visitantes (apenas quando "Todas" está selecionado) */}
            {dadosGraficos.visitantesDatasets && (
              <View
                className="bg-surface rounded-2xl p-4 border border-border"
              >
                <LineChart
                  title="Visitantes por Célula"
                  labels={dadosGraficos.labels}
                  datasets={dadosGraficos.visitantesDatasets}
                  width={chartWidth}
                  height={240}
                  gridColor={colors.border}
                  labelColor={colors.muted}
                  showArea={false}
                  showDots={dadosGraficos.labels.length <= 8}
                />
              </View>
            )}

            {/* Dica */}
            <View
              className="rounded-xl p-3"
              style={{ backgroundColor: colors.primary + '08', borderWidth: 1, borderColor: colors.primary + '15' }}
            >
              <Text style={{ color: colors.muted, fontSize: 11, textAlign: 'center' }}>
                {filtroCelula !== 'todos'
                  ? 'Mostrando presença total e visitantes da célula selecionada'
                  : 'Selecione uma célula no filtro acima para ver detalhes individuais'}
              </Text>
            </View>
          </View>
        )}

        {/* === ABA LISTA === */}
        {/* Lista agrupada por data */}
        {abaAtiva === 'lista' && relatoriosFiltrados.length === 0 ? (
          <View className="bg-surface rounded-xl p-6 border border-border items-center">
            <IconSymbol name="doc.text.fill" size={40} color={colors.muted} />
            <Text className="text-muted text-center mt-3">
              {relatorios.length === 0
                ? 'Nenhum relatório enviado ainda.\nOs líderes de célula podem enviar relatórios pela Área do Líder.'
                : 'Nenhum relatório encontrado para esta célula.'}
            </Text>
          </View>
        ) : abaAtiva === 'lista' ? (
          datasOrdenadas.map((data) => {
            const grupo = agrupadosPorData[data];
            const totalDia = grupo.reduce((acc, r) => acc + r.totalPessoas, 0);
            const visitantesDia = grupo.reduce((acc, r) => acc + r.visitantes, 0);

            return (
              <View key={data} className="gap-2">
                {/* Cabeçalho da data */}
                <View
                  className="flex-row items-center justify-between"
                  style={{
                    backgroundColor: colors.primary + '08',
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderWidth: 1,
                    borderColor: colors.primary + '15',
                  }}
                >
                  <View className="flex-row items-center gap-2">
                    <IconSymbol name="calendar" size={18} color={colors.primary} />
                    <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 15 }}>
                      {data}
                    </Text>
                  </View>
                  <View className="flex-row gap-3">
                    <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '600' }}>
                      {totalDia} pessoas
                    </Text>
                    <Text style={{ color: colors.success, fontSize: 12, fontWeight: '600' }}>
                      {visitantesDia} visit.
                    </Text>
                  </View>
                </View>

                {/* Relatórios desse dia */}
                {grupo.map((r) => (
                  <View
                    key={r.id}
                    className="bg-surface rounded-xl p-4 border border-border"
                    style={{ marginLeft: 8 }}
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center flex-1">
                        <View
                          style={{
                            backgroundColor: colors.primary + '20',
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 10,
                          }}
                        >
                          <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 14 }}>
                            {r.celulaNome.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-foreground font-bold text-sm">{r.celulaNome}</Text>
                          <Text className="text-muted text-xs">Líder: {r.liderNome}</Text>
                        </View>
                      </View>
                    </View>

                    <View className="flex-row gap-3 ml-12">
                      <View
                        style={{
                          backgroundColor: colors.primary + '12',
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 8,
                        }}
                      >
                        <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>
                          {r.totalPessoas} pessoas
                        </Text>
                      </View>
                      <View
                        style={{
                          backgroundColor: colors.success + '12',
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 8,
                        }}
                      >
                        <Text style={{ color: colors.success, fontSize: 12, fontWeight: '600' }}>
                          {r.visitantes} visitante{r.visitantes !== 1 ? 's' : ''}
                        </Text>
                      </View>
                      <View
                        style={{
                          backgroundColor: colors.muted + '15',
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 8,
                        }}
                      >
                        <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '600' }}>
                          {r.totalPessoas - r.visitantes} membros
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            );
          })
        ) : null}

        {/* Tabela resumo por célula */}
        {abaAtiva === 'lista' && relatorios.length > 0 && filtroCelula === 'todos' && (
          <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
            <Text className="text-base font-bold text-foreground">Resumo por Célula</Text>
            {celulasUnicas.map((cel) => {
              const rels = relatorios.filter(r => r.celulaNome === cel);
              const total = rels.reduce((acc, r) => acc + r.totalPessoas, 0);
              const visit = rels.reduce((acc, r) => acc + r.visitantes, 0);
              const media = rels.length > 0 ? Math.round(total / rels.length) : 0;
              const lider = lideres.find(l => l.celula === cel);

              return (
                <View
                  key={cel}
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                    paddingBottom: 10,
                    marginBottom: 4,
                  }}
                >
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-foreground font-semibold text-sm">{cel}</Text>
                    <Text className="text-muted text-xs">
                      {lider ? `Líder: ${lider.nome}` : 'Sem líder'}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-muted text-xs">{rels.length} relatórios</Text>
                    <Text className="text-muted text-xs">Média: {media} pessoas</Text>
                    <Text style={{ color: colors.success, fontSize: 11, fontWeight: '600' }}>
                      {visit} visitantes total
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
