import { useState, useCallback, useEffect, useRef } from 'react';
import {
  ScrollView, Text, View, TouchableOpacity, Alert, Platform, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import * as Haptics from 'expo-haptics';
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
  const didInitialize = useRef(false);
  const [lider, setLider] = useState<any>(null);
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroAtivo, setFiltroAtivo] = useState<FiltroTipo>('ultimo_mes');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [mostrarFiltroCustomizado, setMostrarFiltroCustomizado] = useState(false);
  const [relatorioSelecionado, setRelatorioSelecionado] = useState<Relatorio | null>(null);
  const [estatisticas, setEstatisticas] = useState({
    totalRelatorios: 0,
    mediaPresentes: 0,
    mediaVisitantes: 0,
    totalConversoes: 0,
  });

  // Query para buscar relatórios com filtros
  const { data: relatoriosDB = [], isLoading: carregandoRelatorios, refetch } = trpc.relatorios.getByLiderIdWithFilters.useQuery(
    {
      liderId: lider?.id ? parseInt(lider.id) : 0,
      dataInicio,
      dataFim,
      limite: 100,
    },
    {
      enabled: !!lider?.id,
      refetchOnWindowFocus: true,
    }
  );

  useEffect(() => {
    verificarSessao();
  }, []);

  // Inicializar filtro apenas uma vez quando lider carrega
  useEffect(() => {
    if (lider && !didInitialize.current) {
      didInitialize.current = true;
      aplicarFiltro('ultimo_mes');
    }
  }, [lider?.id]);

  const verificarSessao = useCallback(async () => {
    const sessao = await obterSessaoLider();
    if (!sessao) {
      router.replace('/lider');
      return;
    }
    setLider(sessao);
    setCarregando(false);
  }, [router]);

  // Função removida - lógica movida para useEffect inline para evitar loop

  const aplicarFiltro = useCallback((tipo: FiltroTipo) => {
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
  }, []);

  const handleAplicarFiltroCustomizado = useCallback(() => {
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
  }, [dataInicio, dataFim]);

  useEffect(() => {
    if (relatoriosDB && Array.isArray(relatoriosDB)) {
      const dados = (relatoriosDB as Relatorio[]).sort((a, b) => {
        const dataA = new Date(b.periodo || b.createdAt || 0).getTime();
        const dataB = new Date(a.periodo || a.createdAt || 0).getTime();
        return dataA - dataB;
      });
      setRelatorios(dados);
      
      // Calcular estatísticas inline para evitar loop infinito
      if (dados.length === 0) {
        setEstatisticas({
          totalRelatorios: 0,
          mediaPresentes: 0,
          mediaVisitantes: 0,
          totalConversoes: 0,
        });
      } else {
        const totalPresentes = dados.reduce((acc, r) => acc + (r.presentes || 0), 0);
        const totalVisitantes = dados.reduce((acc, r) => acc + (r.novosVisitantes || 0), 0);
        const totalConversoes = dados.reduce((acc, r) => acc + (r.conversoes || 0), 0);
        setEstatisticas({
          totalRelatorios: dados.length,
          mediaPresentes: Math.round(totalPresentes / dados.length),
          mediaVisitantes: Math.round(totalVisitantes / dados.length),
          totalConversoes,
        });
      }
    } else {
      setRelatorios([]);
      setEstatisticas({
        totalRelatorios: 0,
        mediaPresentes: 0,
        mediaVisitantes: 0,
        totalConversoes: 0,
      });
    }
  }, [relatoriosDB]);

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

  const formatarData = (data: string) => {
    try {
      const d = new Date(data);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return data;
    }
  };

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
                <Text style={{ color: colors.foreground }}>
                  {dataInicio || 'Selecione uma data'}
                </Text>
              </TouchableOpacity>
            </View>
            <View className="mb-4">
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
                <Text style={{ color: colors.foreground }}>
                  {dataFim || 'Selecione uma data'}
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={handleAplicarFiltroCustomizado}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 8,
                padding: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>Aplicar Filtro</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Lista de Relatórios */}
        <View className="px-4">
          {carregandoRelatorios ? (
            <View className="items-center py-8">
              <ActivityIndicator size="small" color={colors.primary} />
              <Text className="text-muted text-sm mt-2">Carregando relatórios...</Text>
            </View>
          ) : relatorios.length === 0 ? (
            <View
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 16,
                padding: 24,
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  backgroundColor: colors.muted + '20',
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                }}
              >
                <IconSymbol name="doc.text" size={28} color={colors.muted} />
              </View>
              <Text style={{ color: colors.foreground, fontWeight: '600', marginBottom: 4 }}>
                Nenhum relatório encontrado
              </Text>
              <Text style={{ color: colors.muted, fontSize: 12, textAlign: 'center' }}>
                Você ainda não enviou nenhum relatório neste período.
              </Text>
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
                    borderRadius: 16,
                    padding: 16,
                  }}
                >
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <Text style={{ color: colors.foreground, fontWeight: '700', fontSize: 16, marginBottom: 4 }}>
                        {formatarData(relatorio.periodo)}
                      </Text>
                      <Text style={{ color: colors.muted, fontSize: 12 }}>
                        {relatorio.celula}
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: colors.primary + '20',
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 6,
                      }}
                    >
                      <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '600' }}>
                        {relatorio.tipo}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row gap-4">
                    <View className="flex-1">
                      <Text style={{ color: colors.muted, fontSize: 11, marginBottom: 2 }}>Presentes</Text>
                      <Text style={{ color: colors.foreground, fontWeight: '700', fontSize: 14 }}>
                        {relatorio.presentes}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text style={{ color: colors.muted, fontSize: 11, marginBottom: 2 }}>Visitantes</Text>
                      <Text style={{ color: colors.foreground, fontWeight: '700', fontSize: 14 }}>
                        {relatorio.novosVisitantes}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text style={{ color: colors.muted, fontSize: 11, marginBottom: 2 }}>Conversões</Text>
                      <Text style={{ color: colors.foreground, fontWeight: '700', fontSize: 14 }}>
                        {relatorio.conversoes}
                      </Text>
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
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
          }}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => setRelatorioSelecionado(null)}
          />
          <View
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 20,
              paddingBottom: 40,
            }}
          >
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-bold text-foreground">Detalhes do Relatório</Text>
              <TouchableOpacity onPress={() => setRelatorioSelecionado(null)}>
                <IconSymbol name="xmark.circle.fill" size={24} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <View className="gap-4">
              <View>
                <Text className="text-muted text-sm mb-1">Data</Text>
                <Text className="text-foreground font-semibold">
                  {formatarData(relatorioSelecionado.periodo)}
                </Text>
              </View>

              <View>
                <Text className="text-muted text-sm mb-1">Célula</Text>
                <Text className="text-foreground font-semibold">
                  {relatorioSelecionado.celula}
                </Text>
              </View>

              <View>
                <Text className="text-muted text-sm mb-1">Tipo</Text>
                <Text className="text-foreground font-semibold">
                  {relatorioSelecionado.tipo}
                </Text>
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-muted text-sm mb-1">Presentes</Text>
                  <Text className="text-foreground font-semibold text-lg">
                    {relatorioSelecionado.presentes}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-muted text-sm mb-1">Visitantes</Text>
                  <Text className="text-foreground font-semibold text-lg">
                    {relatorioSelecionado.novosVisitantes}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-muted text-sm mb-1">Conversões</Text>
                  <Text className="text-foreground font-semibold text-lg">
                    {relatorioSelecionado.conversoes}
                  </Text>
                </View>
              </View>

              {relatorioSelecionado.observacoes && (
                <View>
                  <Text className="text-muted text-sm mb-1">Observações</Text>
                  <Text className="text-foreground">
                    {relatorioSelecionado.observacoes}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}
    </ScreenContainer>
  );
}
