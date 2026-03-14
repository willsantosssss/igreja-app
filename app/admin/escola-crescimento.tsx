import { ScrollView, Text, View, TouchableOpacity, Alert, ActivityIndicator, FlatList } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { trpc } from '@/lib/trpc';
import { useState, useCallback, useMemo } from 'react';

const CURSOS = ["Conecte", "Lidere 1", "Lidere 2", "Avance"] as const;

export default function AdminEscolaCrescimentoScreen() {
  const colors = useColors();
  const router = useRouter();
  const [filtroCurso, setFiltroCurso] = useState<string>('todos');
  const [filtroCelula, setFiltroCelula] = useState<string>('todas');
  const [novaData, setNovaData] = useState("");
  const [editandoConfig, setEditandoConfig] = useState(false);

  // Buscar inscrições de Escola de Crescimento
  // @ts-expect-error - Endpoint foi adicionado mas tipos não foram regenerados
  const { data: inscricoesData = [], isLoading: carregandoInscricoes, refetch } = trpc.escolaCrescimento.list.useQuery(undefined, {
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });

  // Buscar configuração
  // @ts-expect-error - Endpoint foi adicionado mas tipos não foram regenerados
  const { data: configData, refetch: refetchConfig } = trpc.escolaCrescimento.getConfig.useQuery(undefined, {
    refetchOnWindowFocus: true,
  });

  // Mutation para atualizar config
  // @ts-expect-error - Endpoint foi adicionado mas tipos não foram regenerados
  const updateConfigMutation = trpc.escolaCrescimento.updateConfig.useMutation();

  // Usar os dados diretamente do tRPC sem duplicar em estado local
  // Isso evita loops infinitos de atualização
  const inscricoesParaExibir = inscricoesData || [];
  const configParaExibir = configData || null;

  // Filtrar inscrições
  const inscricoesFiltradas = useMemo(() => {
    let resultado = inscricoesParaExibir;
    if (filtroCurso !== 'todos') {
      resultado = resultado.filter(i => i.curso === filtroCurso);
    }
    if (filtroCelula !== 'todas') {
      resultado = resultado.filter(i => i.celula === filtroCelula);
    }
    return resultado.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [inscricoesParaExibir, filtroCurso, filtroCelula]);

  // Células únicas
  const celulasUnicas = useMemo(() => {
    return [...new Set(inscricoesParaExibir.map(i => i.celula))].sort();
  }, [inscricoesParaExibir]);

  // Estatísticas por curso
  const estatisticasPorCurso = useMemo(() => {
    const stats: Record<string, number> = {};
    CURSOS.forEach(c => {
      stats[c] = inscricoesParaExibir.filter(i => i.curso === c).length;
    });
    return stats;
  }, [inscricoesParaExibir]);

  const handleAtualizarData = async () => {
    if (!novaData.trim()) {
      Alert.alert("Atenção", "Informe a data de início.");
      return;
    }
    try {
      await updateConfigMutation.mutateAsync({
        dataInicio: novaData,
      });
      refetchConfig();
      setEditandoConfig(false);
      Alert.alert("Sucesso", "Data de início atualizada com sucesso!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar a data.");
    }
  };

  const handleDeletar = async (id: number) => {
    Alert.alert(
      "Confirmar exclusão",
      "Deseja realmente remover esta inscrição?",
      [
        { text: "Cancelar", onPress: () => {} },
        {
          text: "Remover",
          onPress: async () => {
            try {
              // @ts-expect-error - Endpoint foi adicionado mas tipos não foram regenerados
              await trpc.escolaCrescimento.delete.mutate(id);
              refetch();
              Alert.alert("Sucesso", "Inscrição removida com sucesso");
            } catch (error) {
              Alert.alert("Erro", "Não foi possível remover a inscrição");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ gap: 20 }}>
        {/* Header */}
        <View className="gap-2">
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginBottom: 8 }}
          >
            <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text className="text-3xl font-bold text-foreground">Escola de Crescimento</Text>
          <Text className="text-base text-muted">Gerenciar inscrições nos cursos</Text>
        </View>

        {/* Estatísticas */}
        <View className="bg-surface rounded-2xl p-4 gap-3 border border-border">
          <Text className="text-lg font-bold text-foreground">Resumo de Inscrições</Text>
          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-muted">Total de inscrições:</Text>
              <Text className="text-lg font-bold text-primary">{inscricoesParaExibir.length}</Text>
            </View>
            {CURSOS.map(curso => (
              <View key={curso} className="flex-row items-center justify-between">
                <Text className="text-muted">{curso}:</Text>
                <Text className="font-semibold text-foreground">{estatisticasPorCurso[curso]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Configuração */}
        <View className="bg-primary rounded-2xl p-4 gap-3 border border-primary">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-lg font-bold text-white">Data de Início</Text>
              <Text className="text-sm text-white opacity-80 mt-1">{configParaExibir?.dataInicio || "Não configurado"}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setEditandoConfig(!editandoConfig)}
              className="p-2"
            >
              <IconSymbol name="pencil" size={20} color="white" />
            </TouchableOpacity>
          </View>
          {editandoConfig && (
            <View className="gap-2 mt-2">
              <TextInput
                placeholder="DD/MM/YYYY"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={novaData}
                onChangeText={setNovaData}
                className="bg-white bg-opacity-20 text-white rounded-lg px-3 py-2"
              />
              <TouchableOpacity
                onPress={handleAtualizarData}
                className="bg-white rounded-lg py-2 items-center"
              >
                <Text className="text-primary font-bold">Salvar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Filtros */}
        <View className="gap-3">
          <Text className="text-lg font-bold text-foreground">Filtros</Text>
          
          {/* Filtro por Curso */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-muted">Curso</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
              <TouchableOpacity
                onPress={() => setFiltroCurso('todos')}
                style={{
                  backgroundColor: filtroCurso === 'todos' ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: filtroCurso === 'todos' ? colors.primary : colors.border,
                }}
                className="px-4 py-2 rounded-full"
              >
                <Text style={{ color: filtroCurso === 'todos' ? '#FFFFFF' : colors.foreground }}>
                  Todos
                </Text>
              </TouchableOpacity>
              {CURSOS.map(curso => (
                <TouchableOpacity
                  key={curso}
                  onPress={() => setFiltroCurso(curso)}
                  style={{
                    backgroundColor: filtroCurso === curso ? colors.primary : colors.surface,
                    borderWidth: 1,
                    borderColor: filtroCurso === curso ? colors.primary : colors.border,
                  }}
                  className="px-4 py-2 rounded-full"
                >
                  <Text style={{ color: filtroCurso === curso ? '#FFFFFF' : colors.foreground }}>
                    {curso}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Filtro por Célula */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-muted">Célula</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
              <TouchableOpacity
                onPress={() => setFiltroCelula('todas')}
                style={{
                  backgroundColor: filtroCelula === 'todas' ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: filtroCelula === 'todas' ? colors.primary : colors.border,
                }}
                className="px-4 py-2 rounded-full"
              >
                <Text style={{ color: filtroCelula === 'todas' ? '#FFFFFF' : colors.foreground }}>
                  Todas
                </Text>
              </TouchableOpacity>
              {celulasUnicas.map(celula => (
                <TouchableOpacity
                  key={celula}
                  onPress={() => setFiltroCelula(celula)}
                  style={{
                    backgroundColor: filtroCelula === celula ? colors.primary : colors.surface,
                    borderWidth: 1,
                    borderColor: filtroCelula === celula ? colors.primary : colors.border,
                  }}
                  className="px-4 py-2 rounded-full"
                >
                  <Text style={{ color: filtroCelula === celula ? '#FFFFFF' : colors.foreground }}>
                    {celula}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Lista de inscrições */}
        <View className="gap-3">
          <Text className="text-lg font-bold text-foreground">
            Inscrições ({inscricoesFiltradas.length})
          </Text>

          {carregandoInscricoes ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : inscricoesFiltradas.length === 0 ? (
            <View className="items-center py-10 gap-2">
              <Text className="text-5xl">📋</Text>
              <Text className="text-base text-muted text-center">
                Nenhuma inscrição encontrada
              </Text>
            </View>
          ) : (
            <FlatList
              scrollEnabled={false}
              data={inscricoesFiltradas}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View className="bg-surface rounded-xl p-4 gap-2 border border-border mb-3">
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <Text className="text-base font-bold text-foreground">{item.nome}</Text>
                      <View className="flex-row items-center gap-2 mt-2">
                        <View
                          style={{ backgroundColor: `${colors.primary}20` }}
                          className="px-2 py-1 rounded"
                        >
                          <Text
                            style={{ color: colors.primary }}
                            className="text-xs font-semibold"
                          >
                            {item.curso}
                          </Text>
                        </View>
                        <Text className="text-xs text-muted">• {item.celula}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeletar(item.id)}
                      className="p-2"
                    >
                      <IconSymbol name="trash" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                  <Text className="text-xs text-muted mt-2">
                    Inscrito em: {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
              )}
            />
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
