import { useState, useCallback, useMemo, useEffect } from 'react';
import { ScrollView, Text, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { trpc } from '@/lib/trpc';
import {
  getInscricoesEventos,
  removerInscricao,
  type InscricaoEvento,
} from '@/lib/data/inscricoes-eventos';
import { CATEGORIAS_COM_INSCRICAO } from '@/lib/data/inscricoes-eventos';

export default function AdminInscricoesEventosScreen() {
  const colors = useColors();
  const router = useRouter();
  const [inscricoes, setInscricoes] = useState<InscricaoEvento[]>([]);
  const [eventosEspeciais, setEventosEspeciais] = useState<Event[]>([]);
  const [filtroEvento, setFiltroEvento] = useState<string>('todos');
  const [filtroCelula, setFiltroCelula] = useState<string>('todas');
  const [carregando, setCarregando] = useState(true);

  // Buscar eventos especiais do banco de dados
  const { data: eventosDB = [], isLoading: carregandoEventos } = trpc.eventos.list.useQuery(undefined, {
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });

  // Buscar inscrições do banco de dados via tRPC
  // @ts-expect-error - Endpoint foi adicionado mas tipos não foram regenerados
  const { data: inscricoesDB = [], isLoading: carregandoInscricoes, refetch: refetchInscricoes } = trpc.inscricoesEventos.list.useQuery(undefined, {
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });

  // Sincronizar inscrições do banco de dados
  useEffect(() => {
    if (inscricoesDB && inscricoesDB.length > 0) {
      setInscricoes(inscricoesDB);
      setCarregando(false);
    }
  }, [inscricoesDB]);

  // Sincronizar eventos especiais
  useEffect(() => {
    if (eventosDB && eventosDB.length > 0) {
      const eventosEspeciais = eventosDB.filter((e: any) => e.tipo === 'evento-especial' || e.tipo === 'retiro' || e.tipo === 'conferencia');
      setEventosEspeciais(eventosEspeciais.map((e: any) => ({
        id: e.id?.toString() || '',
        title: e.titulo || '',
        description: e.descricao || '',
        date: e.data || '',
        time: e.horario || '',
        location: e.local || '',
        category: e.tipo || 'evento-especial',
      })));
    }
  }, [eventosDB]);

  // Filtrar inscrições
  const inscricoesFiltradas = useMemo(() => {
    let resultado = inscricoes;
    if (filtroEvento !== 'todos') {
      resultado = resultado.filter(i => i.eventoId === filtroEvento);
    }
    if (filtroCelula !== 'todas') {
      resultado = resultado.filter(i => i.celula === filtroCelula);
    }
    return resultado.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [inscricoes, filtroEvento, filtroCelula]);

  // Células únicas
  const celulasUnicas = useMemo(() => {
    return [...new Set(inscricoes.map(i => i.celula))].sort();
  }, [inscricoes]);

  // Agrupar por evento
  const inscricoesPorEvento = useMemo(() => {
    const mapa: Record<string, { titulo: string; data: string; inscritos: InscricaoEvento[] }> = {};
    inscricoesFiltradas.forEach(i => {
      if (!mapa[i.eventoId]) {
        mapa[i.eventoId] = { titulo: i.eventoTitulo, data: i.eventoData, inscritos: [] };
      }
      mapa[i.eventoId].inscritos.push(i);
    });
    return Object.entries(mapa).sort((a, b) => new Date(b[1].data).getTime() - new Date(a[1].data).getTime());
  }, [inscricoesFiltradas]);

  const handleRemover = (id: string, nome: string) => {
    Alert.alert(
      "Remover Inscrição",
      `Deseja remover a inscrição de "${nome}"?`,
      [
        { text: "Cancelar" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            await removerInscricao(id);
            await carregarDados();
          },
        },
      ]
    );
  };

  if (carregando || carregandoEventos) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-muted text-base mt-4">Carregando inscrições...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 100 }}>
        {/* Header */}
        <View className="flex-row items-center mb-2">
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12, padding: 4 }}>
            <IconSymbol name="chevron.right" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-foreground">Inscritos em Eventos</Text>
            <Text className="text-muted text-sm">
              {inscricoesFiltradas.length} inscrição{inscricoesFiltradas.length !== 1 ? 'ões' : ''}
            </Text>
          </View>
        </View>

        {/* Resumo */}
        <View className="flex-row gap-2">
          <View className="flex-1 bg-primary/10 rounded-2xl p-4 items-center border border-primary/20">
            <Text className="text-2xl font-bold text-primary">{inscricoes.length}</Text>
            <Text className="text-xs text-muted text-center">Total Inscrições</Text>
          </View>
          <View className="flex-1 bg-success/10 rounded-2xl p-4 items-center border border-success/20">
            <Text className="text-2xl font-bold text-success">{eventosDB.length}</Text>
            <Text className="text-xs text-muted text-center">Eventos Especiais</Text>
          </View>
          <View className="flex-1 bg-warning/10 rounded-2xl p-4 items-center border border-warning/20">
            <Text className="text-2xl font-bold text-warning">{celulasUnicas.length}</Text>
            <Text className="text-xs text-muted text-center">Células</Text>
          </View>
        </View>

        {/* Filtro por Evento */}
        <View className="gap-2">
          <Text className="text-sm font-semibold text-foreground">Filtrar por Evento</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              onPress={() => setFiltroEvento('todos')}
              style={{
                backgroundColor: filtroEvento === 'todos' ? colors.primary : colors.surface,
                paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 8,
                borderWidth: 1, borderColor: filtroEvento === 'todos' ? colors.primary : colors.border,
              }}
            >
              <Text style={{ color: filtroEvento === 'todos' ? '#FFFFFF' : colors.foreground, fontWeight: '600', fontSize: 13 }}>
                Todos
              </Text>
            </TouchableOpacity>
            {eventosEspeciais.map(ev => (
              <TouchableOpacity
                key={ev.id}
                onPress={() => setFiltroEvento(ev.id)}
                style={{
                  backgroundColor: filtroEvento === ev.id ? colors.primary : colors.surface,
                  paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 8,
                  borderWidth: 1, borderColor: filtroEvento === ev.id ? colors.primary : colors.border,
                }}
              >
                <Text style={{ color: filtroEvento === ev.id ? '#FFFFFF' : colors.foreground, fontWeight: '600', fontSize: 13 }}>
                  {ev.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Filtro por Célula */}
        {celulasUnicas.length > 0 && (
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Filtrar por Célula</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                onPress={() => setFiltroCelula('todas')}
                style={{
                  backgroundColor: filtroCelula === 'todas' ? colors.success : colors.surface,
                  paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 8,
                  borderWidth: 1, borderColor: filtroCelula === 'todas' ? colors.success : colors.border,
                }}
              >
                <Text style={{ color: filtroCelula === 'todas' ? '#FFFFFF' : colors.foreground, fontWeight: '600', fontSize: 13 }}>
                  Todas
                </Text>
              </TouchableOpacity>
              {celulasUnicas.map(cel => (
                <TouchableOpacity
                  key={cel}
                  onPress={() => setFiltroCelula(cel)}
                  style={{
                    backgroundColor: filtroCelula === cel ? colors.success : colors.surface,
                    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 8,
                    borderWidth: 1, borderColor: filtroCelula === cel ? colors.success : colors.border,
                  }}
                >
                  <Text style={{ color: filtroCelula === cel ? '#FFFFFF' : colors.foreground, fontWeight: '600', fontSize: 13 }}>
                    {cel}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Lista agrupada por evento */}
        {inscricoesPorEvento.length > 0 ? (
          inscricoesPorEvento.map(([eventoId, dados]) => (
            <View key={eventoId} className="bg-surface rounded-2xl p-4 gap-3 border border-border">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base font-bold text-foreground">{dados.titulo}</Text>
                  <Text className="text-xs text-muted">{dados.data} — {dados.inscritos.length} inscrito{dados.inscritos.length !== 1 ? 's' : ''}</Text>
                </View>
              </View>

              <View className="gap-2 pt-2 border-t border-border">
                {dados.inscritos.map(insc => (
                  <View key={insc.id} className="flex-row items-center justify-between py-1">
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-foreground">{insc.nome}</Text>
                      <Text className="text-xs text-muted">{insc.celula}{insc.telefone ? ` • ${insc.telefone}` : ''}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemover(insc.id.toString(), insc.nome)}
                      style={{ padding: 4 }}
                    >
                      <Text className="text-xs text-error">Remover</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          ))
        ) : (
          <View className="items-center py-10 gap-2">
            <Text className="text-5xl">📋</Text>
            <Text className="text-base text-muted text-center">
              Nenhuma inscrição encontrada
            </Text>
            <Text className="text-sm text-muted text-center">
              As inscrições aparecerão aqui quando membros se inscreverem em eventos especiais.
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
