import { useState, useCallback, useEffect } from 'react';
import { ScrollView, Text, View, TouchableOpacity, Alert, TextInput, Platform, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { categoryLabels, categoryEmojis, type PrayerCategory } from '@/lib/data/oracao';
import { trpc } from '@/lib/trpc';
import * as Haptics from 'expo-haptics';

interface PedidoOracao {
  id: string;
  title: string;
  description: string;
  author: string;
  category: PrayerCategory;
  date: string;
  prayingCount: number;
  isAnswered: boolean;
  testimony?: string;
}

export default function AdminOracaoScreen() {
  const colors = useColors();
  const router = useRouter();
  const [pedidos, setPedidos] = useState<PedidoOracao[]>([]);
  const [filtro, setFiltro] = useState<'todos' | 'ativos' | 'respondidos'>('todos');
  const [testimonyInput, setTestimonyInput] = useState<Record<string, string>>({});
  const [showTestimony, setShowTestimony] = useState<string | null>(null);
  const [modalConfirmVisivel, setModalConfirmVisivel] = useState(false);
  const [pedidoParaRemover, setPedidoParaRemover] = useState<{ id: string; titulo: string } | null>(null);

  const { data: pedidosData, isLoading: carregando, refetch } = trpc.oracao.list.useQuery(undefined, {
    refetchOnWindowFocus: true,
  });

  const deletarMutation = trpc.oracao.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const atualizarMutation = trpc.oracao.update.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  useEffect(() => {
    if (pedidosData) {
      setPedidos(pedidosData.map((p: any) => ({
        id: p.id.toString(),
        title: p.nome,
        description: p.descricao,
        author: p.categoria,
        category: 'espiritual' as PrayerCategory,
        date: new Date(p.criadoEm).toLocaleDateString('pt-BR'),
        prayingCount: p.orandoPor || 0,
        isAnswered: p.respondido === 1,
        testimony: p.testemunho || undefined,
      })));
    }
  }, [pedidosData]);

  const pedidosFiltrados = pedidos.filter(p => {
    if (filtro === 'ativos') return !p.isAnswered;
    if (filtro === 'respondidos') return p.isAnswered;
    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleRemover = (id: string, titulo: string) => {
    setPedidoParaRemover({ id, titulo });
    setModalConfirmVisivel(true);
  };

  const confirmarRemocao = async () => {
    if (!pedidoParaRemover) return;
    try {
      await deletarMutation.mutateAsync(parseInt(pedidoParaRemover.id));
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setModalConfirmVisivel(false);
      setPedidoParaRemover(null);
    } catch {
      Alert.alert("Erro", "Não foi possível remover o pedido");
    }
  };

  const handleMarcarRespondido = async (id: string) => {
    const testimony = testimonyInput[id]?.trim() || '';
    try {
      await atualizarMutation.mutateAsync({
        id: parseInt(id),
        data: {
          respondido: 1,
          testemunho: testimony,
        } as any,
      });
      setShowTestimony(null);
      setTestimonyInput(prev => ({ ...prev, [id]: '' }));
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      Alert.alert("Erro", "Não foi possível marcar como respondido");
    }
  };

  const ativos = pedidos.filter(p => !p.isAnswered).length;
  const respondidos = pedidos.filter(p => p.isAnswered).length;

  if (carregando) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted text-base">Carregando pedidos...</Text>
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
            <Text className="text-2xl font-bold text-foreground">Pedidos de Oração</Text>
            <Text className="text-muted text-sm">{pedidos.length} pedidos no total</Text>
          </View>
        </View>

        {/* Resumo */}
        <View className="flex-row gap-2">
          <View className="flex-1 bg-primary/10 rounded-2xl p-4 items-center border border-primary/20">
            <Text className="text-2xl font-bold text-primary">{pedidos.length}</Text>
            <Text className="text-xs text-muted text-center">Total</Text>
          </View>
          <View className="flex-1 bg-warning/10 rounded-2xl p-4 items-center border border-warning/20">
            <Text className="text-2xl font-bold text-warning">{ativos}</Text>
            <Text className="text-xs text-muted text-center">Ativos</Text>
          </View>
          <View className="flex-1 bg-success/10 rounded-2xl p-4 items-center border border-success/20">
            <Text className="text-2xl font-bold text-success">{respondidos}</Text>
            <Text className="text-xs text-muted text-center">Respondidos</Text>
          </View>
        </View>

        {/* Filtros */}
        <View className="flex-row gap-2">
          {([
            { key: 'todos' as const, label: 'Todos' },
            { key: 'ativos' as const, label: 'Ativos' },
            { key: 'respondidos' as const, label: 'Respondidos' },
          ]).map(f => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFiltro(f.key)}
              style={{
                flex: 1,
                backgroundColor: filtro === f.key ? colors.primary : colors.surface,
                paddingVertical: 10, borderRadius: 12, alignItems: 'center',
                borderWidth: 1, borderColor: filtro === f.key ? colors.primary : colors.border,
              }}
            >
              <Text style={{ color: filtro === f.key ? '#fff' : colors.foreground, fontWeight: '600', fontSize: 13 }}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Lista */}
        {pedidosFiltrados.length === 0 ? (
          <View className="items-center py-10 gap-2">
            <Text className="text-5xl">🙏</Text>
            <Text className="text-base text-muted text-center">Nenhum pedido encontrado</Text>
          </View>
        ) : (
          pedidosFiltrados.map(pedido => (
            <View
              key={pedido.id}
              className="bg-surface rounded-2xl p-4 gap-3 border"
              style={{ borderColor: pedido.isAnswered ? colors.success : colors.border }}
            >
              {/* Header do pedido */}
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Text className="text-sm">{categoryEmojis[pedido.category]}</Text>
                    <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '600' }}>
                      {categoryLabels[pedido.category]}
                    </Text>
                    {pedido.isAnswered && (
                      <View style={{ backgroundColor: colors.success + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                        <Text style={{ color: colors.success, fontSize: 10, fontWeight: '700' }}>✓ Respondido</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-base font-bold text-foreground">{pedido.title}</Text>
                  <Text className="text-xs text-muted mt-1">{pedido.author} • {pedido.date}</Text>
                </View>
              </View>

              <Text className="text-sm text-foreground leading-relaxed">{pedido.description}</Text>

              {pedido.testimony && (
                <View style={{ backgroundColor: colors.success + '10', padding: 10, borderRadius: 10 }}>
                  <Text className="text-xs font-semibold text-foreground mb-1">Testemunho:</Text>
                  <Text className="text-xs text-foreground italic">{pedido.testimony}</Text>
                </View>
              )}

              <Text className="text-xs text-muted">🙏 {pedido.prayingCount} pessoas orando</Text>

              {/* Ações */}
              <View className="flex-row gap-2 pt-2 border-t border-border">
                {!pedido.isAnswered && (
                  <>
                    <TouchableOpacity
                      className="flex-1 py-2 rounded-lg items-center"
                      style={{ backgroundColor: colors.success + '15' }}
                      onPress={() => {
                        if (showTestimony === pedido.id) {
                          handleMarcarRespondido(pedido.id);
                        } else {
                          setShowTestimony(pedido.id);
                        }
                      }}
                    >
                      <Text style={{ color: colors.success, fontSize: 12, fontWeight: '600' }}>
                        ✓ Marcar Respondido
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
                <TouchableOpacity
                  className="flex-1 py-2 rounded-lg items-center"
                  style={{ backgroundColor: colors.error + '15' }}
                  onPress={() => handleRemover(pedido.id, pedido.title)}
                >
                  <Text style={{ color: colors.error, fontSize: 12, fontWeight: '600' }}>
                    Remover
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Input de testemunho */}
              {showTestimony === pedido.id && !pedido.isAnswered && (
                <View className="gap-2">
                  <Text className="text-xs text-muted">Testemunho (opcional):</Text>
                  <TextInput
                    className="border rounded-xl p-3 text-foreground"
                    style={{ borderColor: colors.border, backgroundColor: colors.background, fontSize: 13, minHeight: 60, textAlignVertical: 'top' }}
                    placeholder="Adicione um testemunho..."
                    placeholderTextColor={colors.muted}
                    value={testimonyInput[pedido.id] || ''}
                    onChangeText={text => setTestimonyInput(prev => ({ ...prev, [pedido.id]: text }))}
                    multiline
                  />
                  <TouchableOpacity
                    className="py-2 rounded-lg items-center"
                    style={{ backgroundColor: colors.success }}
                    onPress={() => handleMarcarRespondido(pedido.id)}
                  >
                    <Text className="text-white font-semibold text-sm">Confirmar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal de Confirmação de Remoção */}
      <Modal visible={modalConfirmVisivel} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center p-4">
          <View className="bg-surface rounded-2xl p-6 w-full max-w-sm">
            <Text className="text-xl font-bold text-foreground mb-2">Remover Pedido</Text>
            <Text className="text-sm text-muted mb-6">
              Deseja remover o pedido "{pedidoParaRemover?.titulo}"?
            </Text>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => {
                  setModalConfirmVisivel(false);
                  setPedidoParaRemover(null);
                }}
                className="flex-1 bg-surface border border-border rounded-lg py-3 items-center"
              >
                <Text className="text-foreground font-semibold">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmarRemocao}
                className="flex-1 bg-error rounded-lg py-3 items-center"
              >
                <Text className="text-background font-semibold">Remover</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
