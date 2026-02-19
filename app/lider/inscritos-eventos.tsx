import { useState, useEffect, useCallback } from 'react';
import {
  ScrollView, Text, View, TouchableOpacity, Alert, ActivityIndicator, FlatList,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import * as Haptics from 'expo-haptics';
import { trpc } from '@/lib/trpc';
import { obterSessaoLider, type LiderCelula } from '@/lib/data/lideres';

export default function InscritosEventosScreen() {
  const colors = useColors();
  const router = useRouter();
  const [lider, setLider] = useState<LiderCelula | null>(null);
  const [inscritos, setInscritos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroEvento, setFiltroEvento] = useState<string | null>(null);

  useEffect(() => {
    verificarSessao();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (lider) {
        carregarInscritos(lider.celula);
      }
    }, [lider])
  );

  const verificarSessao = async () => {
    const sessao = await obterSessaoLider();
    if (!sessao) {
      router.replace('/lider');
      return;
    }
    setLider(sessao);
    await carregarInscritos(sessao.celula);
  };

  const carregarInscritos = async (celulaNome: string) => {
    setCarregando(true);
    try {
      // @ts-expect-error - Endpoint será tipado após reiniciar servidor
      const dados = await trpc.eventos.getInscritosEspeciaisByCelula.query(celulaNome);
      setInscritos(dados || []);
    } catch (error) {
      console.error('Erro ao carregar inscritos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os inscritos.');
      setInscritos([]);
    } finally {
      setCarregando(false);
    }
  };

  const eventosUnicos = Array.from(
    new Map(inscritos.map(i => [i.eventoId, i])).values()
  ).map(i => ({
    id: i.eventoId,
    titulo: i.eventoTitulo,
    data: i.eventoData,
    horario: i.eventoHorario,
    local: i.eventoLocal,
  }));

  const inscritosDoEvento = filtroEvento
    ? inscritos.filter(i => i.eventoId === parseInt(filtroEvento))
    : inscritos;

  const renderInscrito = ({ item }: { item: any }) => (
    <View
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <View
        style={{
          backgroundColor: colors.primary + '20',
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <IconSymbol name="person.fill" size={20} color={colors.primary} />
      </View>
      <View className="flex-1">
        <Text className="text-foreground font-semibold text-sm">{item.nome}</Text>
        <Text className="text-muted text-xs">{item.telefone}</Text>
        <Text className="text-muted text-xs mt-1">
          Inscrito em: {new Date(item.createdAt).toLocaleDateString('pt-BR')}
        </Text>
      </View>
      <View
        style={{
          backgroundColor: item.status === 'confirmado' ? colors.success + '20' : colors.warning + '20',
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 6,
        }}
      >
        <Text
          style={{
            color: item.status === 'confirmado' ? colors.success : colors.warning,
            fontSize: 10,
            fontWeight: '700',
          }}
        >
          {item.status === 'confirmado' ? 'Confirmado' : 'Cancelado'}
        </Text>
      </View>
    </View>
  );

  if (carregando) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-foreground">Inscritos em Eventos</Text>
            <Text className="text-sm text-muted mt-1">Eventos especiais da sua célula</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              width: 40,
              height: 40,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconSymbol name="chevron.left" size={20} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Filtro de Eventos */}
        {eventosUnicos.length > 0 && (
          <View className="mb-4">
            <Text className="text-sm font-semibold text-muted mb-2">Filtrar por Evento</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
              <TouchableOpacity
                onPress={() => setFiltroEvento(null)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 8,
                  backgroundColor: !filtroEvento ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: !filtroEvento ? colors.primary : colors.border,
                  marginRight: 8,
                }}
              >
                <Text
                  style={{
                    color: !filtroEvento ? '#fff' : colors.foreground,
                    fontSize: 12,
                    fontWeight: '600',
                  }}
                >
                  Todos ({inscritos.length})
                </Text>
              </TouchableOpacity>
              {eventosUnicos.map(evento => {
                const count = inscritos.filter(i => i.eventoId === evento.id).length;
                return (
                  <TouchableOpacity
                    key={evento.id}
                    onPress={() => setFiltroEvento(evento.id.toString())}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 8,
                      backgroundColor: filtroEvento === evento.id.toString() ? colors.primary : colors.surface,
                      borderWidth: 1,
                      borderColor: filtroEvento === evento.id.toString() ? colors.primary : colors.border,
                      marginRight: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: filtroEvento === evento.id.toString() ? '#fff' : colors.foreground,
                        fontSize: 12,
                        fontWeight: '600',
                      }}
                    >
                      {evento.titulo} ({count})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Lista de Inscritos */}
        {inscritosDoEvento.length > 0 ? (
          <FlatList
            scrollEnabled={false}
            data={inscritosDoEvento}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderInscrito}
          />
        ) : (
          <View className="items-center justify-center py-12">
            <View
              style={{
                backgroundColor: colors.primary + '10',
                width: 80,
                height: 80,
                borderRadius: 40,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <IconSymbol name="person.slash.fill" size={40} color={colors.primary} />
            </View>
            <Text className="text-foreground font-semibold text-center">Nenhum inscrito</Text>
            <Text className="text-muted text-sm text-center mt-2">
              Ainda não há inscritos em eventos especiais da sua célula
            </Text>
          </View>
        )}

        {/* Resumo */}
        {inscritosDoEvento.length > 0 && (
          <View
            style={{
              backgroundColor: colors.primary + '10',
              borderWidth: 1,
              borderColor: colors.primary + '20',
              borderRadius: 12,
              padding: 14,
              marginTop: 16,
            }}
          >
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>
              Total de inscritos: {inscritosDoEvento.length}
            </Text>
            <Text style={{ color: colors.primary, fontSize: 12, marginTop: 4 }}>
              Confirmados: {inscritosDoEvento.filter(i => i.status === 'confirmado').length}
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
