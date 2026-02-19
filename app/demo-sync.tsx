import { ScrollView, Text, View, ActivityIndicator, RefreshControl } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { trpc } from '@/lib/trpc';
import { useState } from 'react';

/**
 * Tela de Demonstração de Sincronização
 * 
 * Esta tela demonstra que os dados do banco de dados PostgreSQL são
 * sincronizados automaticamente entre todos os dispositivos.
 * 
 * - Dados são buscados via tRPC do servidor
 * - Atualização automática a cada 10 segundos
 * - Pull-to-refresh manual
 */
export default function DemoSyncScreen() {
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  
  // Buscar eventos do servidor com refetch automático
  // @ts-expect-error - Endpoint eventos existe mas tipos não foram regenerados ainda
  const { data: eventos, isLoading: loadingEventos, refetch: refetchEventos } = trpc.eventos.list.useQuery(undefined, {
    refetchInterval: 10000, // Atualizar a cada 10 segundos
    refetchOnWindowFocus: true,
  });
  
  // Buscar células do servidor
  const { data: celulas, isLoading: loadingCelulas, refetch: refetchCelulas } = trpc.celulas.list.useQuery(undefined, {
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  });
  
  // Buscar pedidos de oração do servidor
  const { data: pedidos, isLoading: loadingPedidos, refetch: refetchPedidos } = trpc.oracao.list.useQuery(undefined, {
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  });
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchEventos(),
      refetchCelulas(),
      refetchPedidos(),
    ]);
    setRefreshing(false);
  };
  
  return (
    <ScreenContainer>
      <ScrollView 
        className="flex-1 p-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
      >
        <Text className="text-2xl font-bold text-foreground mb-2">
          🔄 Demo de Sincronização
        </Text>
        
        <Text className="text-sm text-muted mb-6">
          Os dados abaixo vêm do banco de dados PostgreSQL e são sincronizados automaticamente a cada 10 segundos.
          Qualquer alteração feita em outro dispositivo aparecerá aqui.
        </Text>
        
        {/* Eventos */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-foreground mb-2">
            📅 Eventos ({eventos?.length || 0})
          </Text>
          {loadingEventos ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : eventos && eventos.length > 0 ? (
            // @ts-expect-error - Tipos serão regenerados após reiniciar servidor
            eventos.map((e) => (
              <View key={e.id} className="bg-surface p-3 rounded-lg mb-2 border border-border">
                <Text className="font-semibold text-foreground">{e.titulo}</Text>
                <Text className="text-sm text-muted">{e.data} às {e.horario}</Text>
                <Text className="text-sm text-muted">📍 {e.local}</Text>
                <Text className="text-xs text-muted mt-1">Tipo: {e.tipo}</Text>
              </View>
            ))
          ) : (
            <Text className="text-muted italic">Nenhum evento encontrado</Text>
          )}
        </View>
        
        {/* Células */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-foreground mb-2">
            📍 Células ({celulas?.length || 0})
          </Text>
          {loadingCelulas ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : celulas && celulas.length > 0 ? (
            celulas.map((c) => (
              <View key={c.id} className="bg-surface p-3 rounded-lg mb-2 border border-border">
                <Text className="font-semibold text-foreground">{c.nome}</Text>
                <Text className="text-sm text-muted">👤 Líder: {c.lider}</Text>
                <Text className="text-sm text-muted">📅 {c.diaReuniao} às {c.horario}</Text>
                <Text className="text-xs text-muted mt-1">📍 {c.endereco}</Text>
              </View>
            ))
          ) : (
            <Text className="text-muted italic">Nenhuma célula encontrada</Text>
          )}
        </View>
        
        {/* Pedidos de Oração */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-foreground mb-2">
            🙏 Pedidos de Oração ({pedidos?.length || 0})
          </Text>
          {loadingPedidos ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : pedidos && pedidos.length > 0 ? (
            pedidos.map((p) => (
              <View key={p.id} className="bg-surface p-3 rounded-lg mb-2 border border-border">
                <Text className="font-semibold text-foreground">{p.nome}</Text>
                <Text className="text-sm text-muted">🏷️ {p.categoria}</Text>
                <Text className="text-sm text-muted">👥 {p.contadorOrando} pessoas orando</Text>
              </View>
            ))
          ) : (
            <Text className="text-muted italic">Nenhum pedido de oração encontrado</Text>
          )}
        </View>
        
        <View className="bg-primary/10 p-4 rounded-lg border border-primary/30">
          <Text className="text-sm text-foreground font-semibold mb-1">
            ✅ Sincronização Ativa
          </Text>
          <Text className="text-xs text-muted">
            Dados atualizados automaticamente a cada 10 segundos. Arraste para baixo para atualizar manualmente.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
