import { ScrollView, Text, View, FlatList, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { BackButton } from '@/components/back-button';
import { trpc } from '@/lib/trpc';
import { obterSessaoLider } from '@/lib/data/lideres';
import { useState, useEffect } from 'react';

export default function EventosViewScreen() {
  const colors = useColors();
  const [lider, setLider] = useState<any>(null);
  const [inscricoes, setInscricoes] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Buscar inscrições em eventos
  const { data: inscricoesDB = [] } = trpc.inscricoesEventos.list.useQuery(undefined, {
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });

  // Buscar eventos
  const { data: eventosDB = [] } = trpc.eventos.list.useQuery(undefined, {
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    if (lider && inscricoesDB.length > 0) {
      // Filtrar inscrições da célula do líder
      const inscricoesDaCelula = inscricoesDB.filter((i: any) => i.celula === lider.celula);
      
      // Enriquecer com dados do evento
      const inscricoesComEvento = inscricoesDaCelula.map((i: any) => {
        const evento = eventosDB.find((e: any) => e.id === i.eventoId);
        return {
          ...i,
          evento,
        };
      });
      
      setInscricoes(inscricoesComEvento);
    }
  }, [lider, inscricoesDB, eventosDB]);

  const carregarDados = async () => {
    const sessao = await obterSessaoLider();
    if (sessao) {
      setLider(sessao);
    }
    setCarregando(false);
  };

  if (carregando) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  const renderInscricao = ({ item }: { item: any }) => (
    <View
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
      }}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-foreground font-semibold">{item.nome}</Text>
          <Text className="text-xs text-muted mt-1">
            {item.evento?.titulo || 'Evento não encontrado'}
          </Text>
          {item.evento?.data && (
            <Text className="text-xs text-muted mt-1">
              📅 {new Date(item.evento.data).toLocaleDateString('pt-BR')} às {item.evento.horario}
            </Text>
          )}
        </View>
        <View
          style={{
            backgroundColor: colors.success + '20',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
          }}
        >
          <Text style={{ color: colors.success, fontSize: 11, fontWeight: '600' }}>
            {item.status === 'confirmado' ? '✓ Confirmado' : 'Cancelado'}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 100 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-foreground">Eventos</Text>
            <Text className="text-sm text-muted">Inscrições da célula</Text>
          </View>
          <BackButton />
        </View>

        {/* Info */}
        <View
          style={{
            backgroundColor: colors.success + '10',
            borderRadius: 12,
            padding: 12,
            borderWidth: 1,
            borderColor: colors.success + '20',
          }}
        >
          <Text className="text-sm font-semibold text-foreground">
            Total de inscrições: {inscricoes.length}
          </Text>
        </View>

        {/* Lista de Inscrições */}
        {inscricoes.length > 0 ? (
          <FlatList
            data={inscricoes}
            renderItem={renderInscricao}
            keyExtractor={(item) => String(item.id)}
            scrollEnabled={false}
          />
        ) : (
          <View className="items-center justify-center py-12">
            <Text className="text-muted text-center">Nenhuma inscrição em eventos</Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
