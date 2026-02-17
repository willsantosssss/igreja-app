import { useState, useEffect, useCallback } from 'react';
import { ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { getRelatorios, getLideres, type RelatorioCelula, type LiderCelula } from '@/lib/data/lideres';

type FiltroTipo = 'todos' | string;

export default function AdminRelatoriosScreen() {
  const colors = useColors();
  const router = useRouter();
  const [relatorios, setRelatorios] = useState<RelatorioCelula[]>([]);
  const [lideres, setLideres] = useState<LiderCelula[]>([]);
  const [filtroCelula, setFiltroCelula] = useState<FiltroTipo>('todos');
  const [carregando, setCarregando] = useState(true);

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

        {/* Lista agrupada por data */}
        {relatoriosFiltrados.length === 0 ? (
          <View className="bg-surface rounded-xl p-6 border border-border items-center">
            <IconSymbol name="doc.text.fill" size={40} color={colors.muted} />
            <Text className="text-muted text-center mt-3">
              {relatorios.length === 0
                ? 'Nenhum relatório enviado ainda.\nOs líderes de célula podem enviar relatórios pela Área do Líder.'
                : 'Nenhum relatório encontrado para esta célula.'}
            </Text>
          </View>
        ) : (
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
        )}

        {/* Tabela resumo por célula */}
        {relatorios.length > 0 && filtroCelula === 'todos' && (
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
