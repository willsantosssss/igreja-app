import { useState, useEffect } from 'react';
import {
  ScrollView, Text, View, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { BackButton } from '@/components/back-button';
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

export default function HistoricoScreen() {
  const colors = useColors();
  const router = useRouter();
  
  const [lider, setLider] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

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
    };
    
    carregarSessao();
  }, [router]);

  // Query para buscar TODOS os relatórios (sem filtro de data)
  const { data: relatoriosDB = [], isLoading: carregandoRelatorios } = trpc.relatorios.getByLiderIdWithFilters.useQuery(
    {
      liderId: lider?.id ? parseInt(lider.id) : 0,
      dataInicio: '',
      dataFim: '',
      limite: 1000,
    },
    {
      enabled: !!lider?.id,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    }
  );

  // Processar relatórios e calcular estatísticas (ordenados cronologicamente - mais recentes primeiro)
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
          <View className="flex-1">
            <Text className="text-2xl font-bold text-foreground">Histórico</Text>
            <Text className="text-muted text-sm">Relatórios enviados</Text>
          </View>
          <BackButton />
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

        {/* Lista de Relatórios */}
        <View className="px-4">
          {carregandoRelatorios ? (
            <View className="items-center justify-center py-8">
              <ActivityIndicator size="small" color={colors.primary} />
              <Text className="text-muted text-sm mt-2">Carregando relatórios...</Text>
            </View>
          ) : relatorios.length === 0 ? (
            <View className="items-center justify-center py-12">
              <Text className="text-muted text-center">Nenhum relatório enviado ainda</Text>
            </View>
          ) : (
            <View className="gap-3">
              {relatorios.map((relatorio) => (
                <TouchableOpacity
                  key={relatorio.id}
                  style={{
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 16,
                    padding: 16,
                  }}
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-foreground font-semibold">{relatorio.celula}</Text>
                    <Text className="text-xs text-muted">
                      {formatarData(relatorio.periodo || relatorio.createdAt || '')}
                    </Text>
                  </View>
                  
                  <View className="flex-row gap-4 mb-2">
                    <View>
                      <Text className="text-xs text-muted">Presentes</Text>
                      <Text className="text-lg font-bold text-foreground">{relatorio.presentes}</Text>
                    </View>
                    <View>
                      <Text className="text-xs text-muted">Visitantes</Text>
                      <Text className="text-lg font-bold text-foreground">{relatorio.novosVisitantes}</Text>
                    </View>
                    <View>
                      <Text className="text-xs text-muted">Conversões</Text>
                      <Text className="text-lg font-bold text-foreground">{relatorio.conversoes}</Text>
                    </View>
                  </View>

                  {relatorio.observacoes && (
                    <View className="mt-3 pt-3 border-t border-border">
                      <Text className="text-xs text-muted mb-1">Observações</Text>
                      <Text className="text-sm text-foreground">{relatorio.observacoes}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
