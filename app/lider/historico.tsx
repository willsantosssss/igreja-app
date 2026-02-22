import { useState, useEffect } from 'react';
import {
  ScrollView, Text, View, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { trpc } from '@/lib/trpc';
import { obterSessaoLider } from '@/lib/data/lideres';

interface Relatorio {
  id: number;
  liderId: number;
  celula: string;
  tipo: string;
  periodo: string;
  presentes: number;
  novosVisitantes: number;
  conversoes: number;
  observacoes?: string;
  createdAt?: string;
  updatedAt?: string;
}

type FiltroTipo = 'todos' | 'ultima_semana' | 'ultimo_mes' | 'customizado';

export default function HistoricoScreen() {
  const colors = useColors();
  const router = useRouter();
  
  // Estado simples
  const [lider, setLider] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [filtroAtivo, setFiltroAtivo] = useState<FiltroTipo>('ultimo_mes');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [mostrarFiltroCustomizado, setMostrarFiltroCustomizado] = useState(false);
  const [relatorioSelecionado, setRelatorioSelecionado] = useState<Relatorio | null>(null);

  // Carregar sessão do líder
  useEffect(() => {
    const carregarSessao = async () => {
      const sessao = await obterSessaoLider();
      if (!sessao) {
        router.replace('/lider');
        return;
      }
      setLider(sessao);
      setCarregando(false);
      
      // Aplicar filtro padrão após carregar líder
      const hoje = new Date();
      const mesAtras = new Date(hoje);
      mesAtras.setMonth(mesAtras.getMonth() - 1);
      setDataInicio(mesAtras.toISOString().split('T')[0]);
      setDataFim(hoje.toISOString().split('T')[0]);
    };
    
    carregarSessao();
  }, [router]);

  // Query para buscar relatórios
  const { data: relatoriosDB = [], isLoading: carregandoRelatorios } = trpc.relatorios.getByLiderIdWithFilters.useQuery(
    {
      liderId: lider?.id ? parseInt(lider.id) : 0,
      dataInicio,
      dataFim,
      limite: 100,
    },
    {
      enabled: !!lider?.id,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    }
  );

  // Processar relatórios e calcular estatísticas
  const relatorios = (relatoriosDB as Relatorio[]).sort((a, b) => {
    const dataA = new Date(b.periodo || b.createdAt || 0).getTime();
    const dataB = new Date(a.periodo || a.createdAt || 0).getTime();
    return dataA - dataB;
  });

  const estatisticas = {
    totalRelatorios: relatorios.length,
    mediaPresentes: relatorios.length > 0 ? Math.round(relatorios.reduce((acc, r) => acc + (r.presentes || 0), 0) / relatorios.length) : 0,
    mediaVisitantes: relatorios.length > 0 ? Math.round(relatorios.reduce((acc, r) => acc + (r.novosVisitantes || 0), 0) / relatorios.length) : 0,
    totalConversoes: relatorios.reduce((acc, r) => acc + (r.conversoes || 0), 0),
  };

  // Aplicar filtro
  const aplicarFiltro = (tipo: FiltroTipo) => {
    const hoje = new Date();
    let inicio = '';
    let fim = hoje.toISOString().split('T')[0];

    switch (tipo) {
      case 'ultima_semana':
        const semanaAtras = new Date(hoje);
        semanaAtras.setDate(semanaAtras.getDate() - 7);
        inicio = semanaAtras.toISOString().split('T')[0];
        break;
      case 'ultimo_mes':
        const mesAtras = new Date(hoje);
        mesAtras.setMonth(mesAtras.getMonth() - 1);
        inicio = mesAtras.toISOString().split('T')[0];
        break;
      case 'customizado':
        setMostrarFiltroCustomizado(true);
        return;
      case 'todos':
        inicio = '';
        fim = '';
        break;
    }

    setDataInicio(inicio);
    setDataFim(fim);
    setFiltroAtivo(tipo);
    setMostrarFiltroCustomizado(false);
  };

  const handleAplicarFiltroCustomizado = () => {
    if (!dataInicio || !dataFim) {
      Alert.alert('Atenção', 'Selecione data de início e fim.');
      return;
    }
    if (new Date(dataInicio) > new Date(dataFim)) {
      Alert.alert('Atenção', 'Data de início não pode ser maior que data de fim.');
      return;
    }
    setFiltroAtivo('customizado');
    setMostrarFiltroCustomizado(false);
  };

  const formatarData = (data: string) => {
    try {
      const d = new Date(data);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return data;
    }
  };

  if (carregando) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-muted text-base mt-4">Carregando histórico...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 gap-2">
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-foreground">Histórico</Text>
            <Text className="text-muted text-sm">Relatórios enviados</Text>
          </View>
        </View>

        {/* Estatísticas */}
        <View className="px-4 gap-3 mb-6">
          <View className="flex-row gap-2">
            <View
              className="flex-1 rounded-2xl p-4 items-center"
              style={{
                backgroundColor: colors.primary + '10',
                borderWidth: 1,
                borderColor: colors.primary + '20',
              }}
            >
              <Text style={{ color: colors.primary, fontSize: 24, fontWeight: '800' }}>
                {estatisticas.totalRelatorios}
              </Text>
              <Text className="text-xs text-muted text-center">Total</Text>
            </View>
            <View
              className="flex-1 rounded-2xl p-4 items-center"
              style={{
                backgroundColor: colors.warning + '10',
                borderWidth: 1,
                borderColor: colors.warning + '20',
              }}
            >
              <Text style={{ color: colors.warning, fontSize: 24, fontWeight: '800' }}>
                {estatisticas.mediaPresentes}
              </Text>
              <Text className="text-xs text-muted text-center">Média Presentes</Text>
            </View>
            <View
              className="flex-1 rounded-2xl p-4 items-center"
              style={{
                backgroundColor: colors.success + '10',
                borderWidth: 1,
                borderColor: colors.success + '20',
              }}
            >
              <Text style={{ color: colors.success, fontSize: 24, fontWeight: '800' }}>
                {estatisticas.mediaVisitantes}
              </Text>
              <Text className="text-xs text-muted text-center">Média Visitantes</Text>
            </View>
          </View>
        </View>

        {/* Filtros */}
        <View className="px-4 mb-6">
          <Text className="text-sm font-semibold text-muted uppercase mb-3">Período</Text>
          <View className="flex-row gap-2 flex-wrap">
            {(['ultima_semana', 'ultimo_mes', 'todos', 'customizado'] as const).map((tipo) => (
              <TouchableOpacity
                key={tipo}
                onPress={() => aplicarFiltro(tipo)}
                style={{
                  backgroundColor: filtroAtivo === tipo ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: filtroAtivo === tipo ? colors.primary : colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                }}
              >
                <Text
                  style={{
                    color: filtroAtivo === tipo ? '#fff' : colors.foreground,
                    fontSize: 12,
                    fontWeight: '600',
                  }}
                >
                  {tipo === 'ultima_semana' ? 'Última Semana' : tipo === 'ultimo_mes' ? 'Último Mês' : tipo === 'todos' ? 'Todos' : 'Customizado'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Filtro Customizado */}
        {mostrarFiltroCustomizado && (
          <View className="px-4 mb-6 bg-surface rounded-2xl p-4 border border-border">
            <Text className="text-foreground font-semibold mb-3">Selecione o Período</Text>
            <View className="mb-3">
              <Text className="text-muted text-sm mb-1">Data Inicial (YYYY-MM-DD)</Text>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  padding: 10,
                }}
              >
                <Text className="text-foreground">{dataInicio || 'Selecione'}</Text>
              </TouchableOpacity>
            </View>
            <View className="mb-3">
              <Text className="text-muted text-sm mb-1">Data Final (YYYY-MM-DD)</Text>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  padding: 10,
                }}
              >
                <Text className="text-foreground">{dataFim || 'Selecione'}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={handleAplicarFiltroCustomizado}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 8,
                padding: 10,
                alignItems: 'center',
              }}
            >
              <Text className="text-white font-semibold">Aplicar Filtro</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Lista de Relatórios */}
        <View className="px-4">
          {carregandoRelatorios ? (
            <View className="items-center justify-center py-8">
              <ActivityIndicator size="small" color={colors.primary} />
              <Text className="text-muted text-sm mt-2">Carregando relatórios...</Text>
            </View>
          ) : relatorios.length === 0 ? (
            <View className="items-center justify-center py-8">
              <Text className="text-2xl mb-2">📋</Text>
              <Text className="text-foreground font-semibold">Nenhum relatório</Text>
              <Text className="text-muted text-sm text-center">Nenhum relatório encontrado para este período</Text>
            </View>
          ) : (
            <View className="gap-3">
              {relatorios.map((relatorio) => (
                <TouchableOpacity
                  key={relatorio.id}
                  onPress={() => setRelatorioSelecionado(relatorio)}
                  style={{
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    padding: 12,
                  }}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-foreground font-semibold">{relatorio.celula}</Text>
                    <Text className="text-muted text-xs">{formatarData(relatorio.periodo || relatorio.createdAt || '')}</Text>
                  </View>
                  <View className="flex-row gap-4">
                    <View>
                      <Text className="text-muted text-xs">Presentes</Text>
                      <Text className="text-foreground font-bold">{relatorio.presentes}</Text>
                    </View>
                    <View>
                      <Text className="text-muted text-xs">Visitantes</Text>
                      <Text className="text-foreground font-bold">{relatorio.novosVisitantes}</Text>
                    </View>
                    <View>
                      <Text className="text-muted text-xs">Conversões</Text>
                      <Text className="text-foreground font-bold">{relatorio.conversoes}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal de Detalhes */}
      {relatorioSelecionado && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
              paddingBottom: 40,
            }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-foreground">Detalhes do Relatório</Text>
              <TouchableOpacity onPress={() => setRelatorioSelecionado(null)}>
                <Text className="text-2xl text-muted">✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400 }}>
              <View className="gap-4">
                <View>
                  <Text className="text-muted text-sm mb-1">Célula</Text>
                  <Text className="text-foreground font-semibold">{relatorioSelecionado.celula}</Text>
                </View>
                <View>
                  <Text className="text-muted text-sm mb-1">Data</Text>
                  <Text className="text-foreground font-semibold">{formatarData(relatorioSelecionado.periodo || relatorioSelecionado.createdAt || '')}</Text>
                </View>
                <View>
                  <Text className="text-muted text-sm mb-1">Presentes</Text>
                  <Text className="text-foreground font-semibold">{relatorioSelecionado.presentes}</Text>
                </View>
                <View>
                  <Text className="text-muted text-sm mb-1">Novos Visitantes</Text>
                  <Text className="text-foreground font-semibold">{relatorioSelecionado.novosVisitantes}</Text>
                </View>
                <View>
                  <Text className="text-muted text-sm mb-1">Conversões</Text>
                  <Text className="text-foreground font-semibold">{relatorioSelecionado.conversoes}</Text>
                </View>
                {relatorioSelecionado.observacoes && (
                  <View>
                    <Text className="text-muted text-sm mb-1">Observações</Text>
                    <Text className="text-foreground">{relatorioSelecionado.observacoes}</Text>
                  </View>
                )}
              </View>
            </ScrollView>

            <TouchableOpacity
              onPress={() => setRelatorioSelecionado(null)}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 8,
                padding: 12,
                alignItems: 'center',
                marginTop: 16,
              }}
            >
              <Text className="text-white font-semibold">Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScreenContainer>
  );
}
