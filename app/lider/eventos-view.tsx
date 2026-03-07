import { ScrollView, Text, View, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { BackButton } from '@/components/back-button';
import { trpc } from '@/lib/trpc';
import { obterSessaoLider } from '@/lib/data/lideres';
import { useState, useEffect } from 'react';

interface Evento {
  id: number;
  titulo: string;
  data: string;
  horario: string;
  local?: string;
  descricao?: string;
}

interface Inscricao {
  id: number;
  nome: string;
  celula: string;
  eventoId: number;
  status: string;
  evento?: Evento;
}

export default function EventosViewScreen() {
  const colors = useColors();
  const [lider, setLider] = useState<any>(null);
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [eventoSelecionado, setEventoSelecionado] = useState<number | null>(null);

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
      
      // Extrair eventos únicos
      const eventosUnicos = Array.from(
        new Map(
          eventosDB
            .filter((e: any) => inscricoesComEvento.some((i: any) => i.eventoId === e.id))
            .map((e: any) => [e.id, e])
        ).values()
      );
      setEventos(eventosUnicos);
    }
  }, [lider, inscricoesDB, eventosDB]);

  const carregarDados = async () => {
    const sessao = await obterSessaoLider();
    if (sessao) {
      setLider(sessao);
    }
    setCarregando(false);
  };

  // Filtrar inscrições pelo evento selecionado
  const inscricoesFiltradas = eventoSelecionado
    ? inscricoes.filter((i) => i.eventoId === eventoSelecionado)
    : inscricoes;

  const formatarData = (data: string) => {
    try {
      return new Date(data).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return data;
    }
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

  const renderInscricao = ({ item }: { item: Inscricao }) => (
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
          {item.evento?.local && (
            <Text className="text-xs text-muted mt-1">
              📍 {item.evento.local}
            </Text>
          )}
        </View>
        <View
          style={{
            backgroundColor: item.status === 'confirmado' ? colors.success + '20' : colors.error + '20',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
          }}
        >
          <Text 
            style={{ 
              color: item.status === 'confirmado' ? colors.success : colors.error, 
              fontSize: 11, 
              fontWeight: '600' 
            }}
          >
            {item.status === 'confirmado' ? '✓ Confirmado' : '✗ Cancelado'}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 gap-2">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-foreground">Eventos</Text>
            <Text className="text-sm text-muted">Inscrições da célula</Text>
          </View>
          <BackButton />
        </View>

        {/* Estatísticas */}
        <View className="px-4 mb-6">
          <View
            style={{
              backgroundColor: colors.primary + '10',
              borderRadius: 12,
              padding: 12,
              borderWidth: 1,
              borderColor: colors.primary + '20',
            }}
          >
            <Text className="text-sm font-semibold text-foreground">
              Total de inscrições: {inscricoesFiltradas.length}
            </Text>
          </View>
        </View>

        {/* Filtro de Eventos */}
        {eventos.length > 0 && (
          <View className="px-4 mb-6">
            <Text className="text-sm font-semibold text-foreground mb-3">Filtrar por evento:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
              {/* Botão "Todos" */}
              <TouchableOpacity
                onPress={() => setEventoSelecionado(null)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: eventoSelecionado === null ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: eventoSelecionado === null ? colors.primary : colors.border,
                }}
              >
                <Text
                  style={{
                    color: eventoSelecionado === null ? '#fff' : colors.foreground,
                    fontSize: 12,
                    fontWeight: '600',
                  }}
                >
                  Todos
                </Text>
              </TouchableOpacity>

              {/* Botões de eventos */}
              {eventos.map((evento) => {
                const inscricoesDoEvento = inscricoes.filter((i) => i.eventoId === evento.id);
                return (
                  <TouchableOpacity
                    key={evento.id}
                    onPress={() => setEventoSelecionado(evento.id)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor: eventoSelecionado === evento.id ? colors.primary : colors.surface,
                      borderWidth: 1,
                      borderColor: eventoSelecionado === evento.id ? colors.primary : colors.border,
                    }}
                  >
                    <Text
                      style={{
                        color: eventoSelecionado === evento.id ? '#fff' : colors.foreground,
                        fontSize: 12,
                        fontWeight: '600',
                      }}
                      numberOfLines={1}
                    >
                      {evento.titulo} ({inscricoesDoEvento.length})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Detalhes do Evento Selecionado */}
        {eventoSelecionado && eventos.find((e) => e.id === eventoSelecionado) && (
          <View className="px-4 mb-6">
            {(() => {
              const evento = eventos.find((e) => e.id === eventoSelecionado);
              if (!evento) return null;
              return (
                <View
                  style={{
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    padding: 16,
                  }}
                >
                  <Text className="text-lg font-bold text-foreground mb-3">{evento.titulo}</Text>
                  <View className="gap-2">
                    <Text className="text-sm text-muted">
                      📅 {formatarData(evento.data)} às {evento.horario}
                    </Text>
                    {evento.local && (
                      <Text className="text-sm text-muted">
                        📍 {evento.local}
                      </Text>
                    )}
                    {evento.descricao && (
                      <Text className="text-sm text-foreground mt-2">{evento.descricao}</Text>
                    )}
                  </View>
                </View>
              );
            })()}
          </View>
        )}

        {/* Lista de Inscrições */}
        <View className="px-4">
          {inscricoesFiltradas.length > 0 ? (
            <FlatList
              data={inscricoesFiltradas}
              renderItem={renderInscricao}
              keyExtractor={(item) => String(item.id)}
              scrollEnabled={false}
            />
          ) : (
            <View className="items-center justify-center py-12">
              <Text className="text-muted text-center">
                {eventoSelecionado ? 'Nenhuma inscrição neste evento' : 'Nenhuma inscrição em eventos'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
