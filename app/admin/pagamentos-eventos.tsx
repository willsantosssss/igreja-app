import { useState, useCallback } from 'react';
import {
  ScrollView, Text, View, TextInput, TouchableOpacity, Alert, Platform, ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import * as Haptics from 'expo-haptics';
import { trpc } from '@/lib/trpc';
import * as DocumentPicker from 'expo-document-picker';

interface PagamentoEvento {
  id: number;
  eventoId: number;
  valor: string;
  qrCodeUrl: string;
  chavePix: string;
  nomeRecebedor: string;
  ativo: number;
}

interface Evento {
  id: number;
  titulo: string;
  tipo: string;
}

export default function AdminPagamentosEventosScreen() {
  const colors = useColors();
  const router = useRouter();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [editando, setEditando] = useState<PagamentoEvento | null>(null);

  // Form fields
  const [eventoSelecionado, setEventoSelecionado] = useState('');
  const [valor, setValor] = useState('');
  const [chavePix, setChavePix] = useState('');
  const [nomeRecebedor, setNomeRecebedor] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [mostrarSeletorEventos, setMostrarSeletorEventos] = useState(false);

  // Buscar eventos especiais
  // @ts-expect-error - Endpoint será criado
  const { data: eventosData = [], isLoading: loadingEventos } = trpc.eventos.list.useQuery(undefined, {
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });

  const eventosEspeciais = eventosData.filter((e: any) => e.tipo === 'special' || e.tipo === 'evento-especial');

  // Buscar pagamentos
  // @ts-expect-error - Endpoint será criado
  const { data: pagamentosData = [], refetch: refetchPagamentos, isLoading: loadingPagamentos } = trpc.pagamentosEventos.list.useQuery(undefined, {
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });

  // Mutations
  // @ts-expect-error - Endpoint será criado
  const createPagamentoMutation = trpc.pagamentosEventos.create.useMutation({
    onSuccess: () => {
      refetchPagamentos();
    },
  });

  // @ts-expect-error - Endpoint será criado
  const updatePagamentoMutation = trpc.pagamentosEventos.update.useMutation({
    onSuccess: () => {
      refetchPagamentos();
    },
  });

  // @ts-expect-error - Endpoint será criado
  const deletePagamentoMutation = trpc.pagamentosEventos.delete.useMutation({
    onSuccess: () => {
      refetchPagamentos();
    },
  });

  useFocusEffect(
    useCallback(() => {
      refetchPagamentos();
    }, [refetchPagamentos])
  );

  const handleSelecionarQRCode = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*'],
      });

      if (!result.canceled && result.assets[0]) {
        // Em produção, você faria upload para S3
        // Por enquanto, usaremos o URI local
        setQrCodeUrl(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  const handleSalvarPagamento = async () => {
    if (!eventoSelecionado.trim()) {
      Alert.alert('Atenção', 'Selecione um evento.');
      return;
    }
    if (!valor.trim()) {
      Alert.alert('Atenção', 'Informe o valor.');
      return;
    }
    if (!chavePix.trim()) {
      Alert.alert('Atenção', 'Informe a chave PIX.');
      return;
    }
    if (!nomeRecebedor.trim()) {
      Alert.alert('Atenção', 'Informe o nome do recebedor.');
      return;
    }
    if (!qrCodeUrl.trim()) {
      Alert.alert('Atenção', 'Selecione a imagem do QR Code.');
      return;
    }

    try {
      setCarregando(true);

      if (editando) {
        // Atualizar
        await updatePagamentoMutation.mutateAsync({
          id: editando.id,
          valor: valor.trim(),
          qrCodeUrl: qrCodeUrl.trim(),
          chavePix: chavePix.trim(),
          nomeRecebedor: nomeRecebedor.trim(),
        });

        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        Alert.alert('Sucesso', 'Configuração de pagamento atualizada.');
      } else {
        // Criar novo
        const evento = eventosEspeciais.find((e: any) => e.id.toString() === eventoSelecionado);
        if (!evento) {
          Alert.alert('Erro', 'Evento não encontrado.');
          return;
        }

        await createPagamentoMutation.mutateAsync({
          eventoId: evento.id,
          valor: valor.trim(),
          qrCodeUrl: qrCodeUrl.trim(),
          chavePix: chavePix.trim(),
          nomeRecebedor: nomeRecebedor.trim(),
          ativo: 1,
        });

        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        Alert.alert('Sucesso', 'Configuração de pagamento criada.');
      }

      // Limpar formulário
      setEventoSelecionado('');
      setValor('');
      setChavePix('');
      setNomeRecebedor('');
      setQrCodeUrl('');
      setMostrarForm(false);
      setEditando(null);
    } catch (error: any) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Alert.alert('Erro', 'Não foi possível salvar a configuração.');
    } finally {
      setCarregando(false);
    }
  };

  const handleEditar = (pagamento: PagamentoEvento) => {
    setEditando(pagamento);
    const evento = eventosData.find((e: any) => e.id === pagamento.eventoId);
    setEventoSelecionado(evento?.id.toString() || '');
    setValor(pagamento.valor);
    setChavePix(pagamento.chavePix);
    setNomeRecebedor(pagamento.nomeRecebedor);
    setQrCodeUrl(pagamento.qrCodeUrl);
    setMostrarForm(true);
  };

  const handleRemover = (pagamento: PagamentoEvento) => {
    Alert.alert(
      'Remover Configuração',
      'Deseja remover esta configuração de pagamento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePagamentoMutation.mutateAsync(pagamento.id);
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              Alert.alert('Sucesso', 'Configuração removida.');
            } catch (error) {
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              }
              Alert.alert('Erro', 'Não foi possível remover a configuração.');
            }
          },
        },
      ]
    );
  };

  if (loadingPagamentos || loadingEventos) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-muted text-base mt-4">Carregando...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-foreground">Pagamentos de Eventos</Text>
            <Text className="text-muted text-sm">Total: {pagamentosData.length} configurações</Text>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => router.push('/admin/inscricoes-pagas')}
              className="bg-success/20 rounded-full p-3"
            >
              <Text className="text-lg">💳</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setEditando(null);
                setEventoSelecionado('');
                setValor('');
                setChavePix('');
                setNomeRecebedor('');
                setQrCodeUrl('');
                setMostrarForm(!mostrarForm);
              }}
              className="bg-primary rounded-full p-3"
            >
              <IconSymbol name="plus" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Formulário */}
        {mostrarForm && (
          <View className="bg-surface rounded-2xl p-6 border border-border mb-6">
            <Text className="text-lg font-bold text-foreground mb-4">
              {editando ? 'Editar Pagamento' : 'Novo Pagamento'}
            </Text>

            {/* Seletor de Evento */}
            <View className="mb-4">
              <Text className="text-foreground font-semibold mb-2">Evento Especial *</Text>
              <TouchableOpacity
                className="bg-background border border-border rounded-lg px-4 py-3 flex-row items-center justify-between"
                onPress={() => setMostrarSeletorEventos(!mostrarSeletorEventos)}
                disabled={!!editando}
              >
                <Text className={eventoSelecionado ? 'text-foreground' : 'text-muted'}>
                  {eventoSelecionado
                    ? eventosEspeciais.find((e: any) => e.id.toString() === eventoSelecionado)?.titulo
                    : 'Selecione um evento'}
                </Text>
                <Text className="text-lg">{mostrarSeletorEventos ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {mostrarSeletorEventos && (
                <ScrollView className="bg-background rounded-lg border border-border mt-2" style={{ maxHeight: 200 }}>
                  {eventosEspeciais.length > 0 ? (
                    eventosEspeciais.map((evento: any) => (
                      <TouchableOpacity
                        key={evento.id}
                        className="px-4 py-3 border-b border-border"
                        onPress={() => {
                          setEventoSelecionado(evento.id.toString());
                          setMostrarSeletorEventos(false);
                        }}
                      >
                        <Text className="text-foreground">{evento.titulo}</Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View className="px-4 py-3">
                      <Text className="text-muted text-center">Nenhum evento especial disponível</Text>
                    </View>
                  )}
                </ScrollView>
              )}
            </View>

            {/* Valor */}
            <View className="mb-4">
              <Text className="text-foreground font-semibold mb-2">Valor (ex: R$ 180,00) *</Text>
              <TextInput
                value={valor}
                onChangeText={setValor}
                placeholder="R$ 0,00"
                placeholderTextColor={colors.muted}
                style={{
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  padding: 12,
                  fontSize: 16,
                  color: colors.foreground,
                }}
              />
            </View>

            {/* Nome Recebedor */}
            <View className="mb-4">
              <Text className="text-foreground font-semibold mb-2">Nome do Recebedor *</Text>
              <TextInput
                value={nomeRecebedor}
                onChangeText={setNomeRecebedor}
                placeholder="Cruzada Nacional de Evangelização"
                placeholderTextColor={colors.muted}
                style={{
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  padding: 12,
                  fontSize: 16,
                  color: colors.foreground,
                }}
              />
            </View>

            {/* Chave PIX */}
            <View className="mb-4">
              <Text className="text-foreground font-semibold mb-2">Chave PIX (Copia e Cola) *</Text>
              <TextInput
                value={chavePix}
                onChangeText={setChavePix}
                placeholder="Cole a chave PIX aqui"
                placeholderTextColor={colors.muted}
                multiline
                numberOfLines={3}
                style={{
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  padding: 12,
                  fontSize: 12,
                  color: colors.foreground,
                  fontFamily: 'monospace',
                }}
              />
            </View>

            {/* QR Code */}
            <View className="mb-4">
              <Text className="text-foreground font-semibold mb-2">QR Code (Imagem) *</Text>
              <TouchableOpacity
                className="bg-background border border-border rounded-lg px-4 py-3 items-center"
                onPress={handleSelecionarQRCode}
              >
                <Text className="text-primary font-semibold">
                  {qrCodeUrl ? '✓ Imagem Selecionada' : 'Selecionar Imagem'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Botões */}
            <View className="gap-3">
              <TouchableOpacity
                className="bg-primary rounded-lg py-3 items-center justify-center"
                onPress={handleSalvarPagamento}
                disabled={carregando}
              >
                <Text className="text-white font-bold">
                  {carregando ? 'Salvando...' : editando ? 'Atualizar' : 'Criar'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="border border-border rounded-lg py-3 items-center justify-center"
                onPress={() => {
                  setMostrarForm(false);
                  setEditando(null);
                }}
              >
                <Text className="text-foreground font-semibold">Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Lista de Pagamentos */}
        <View className="gap-3">
          {pagamentosData.length > 0 ? (
            pagamentosData.map((pagamento: PagamentoEvento) => {
              const evento = eventosData.find((e: any) => e.id === pagamento.eventoId);
              return (
                <View
                  key={pagamento.id}
                  className="bg-surface rounded-2xl p-4 border border-border gap-3"
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <Text className="text-sm text-muted mb-1">Evento</Text>
                      <Text className="text-base font-bold text-foreground">{evento?.titulo}</Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-2xl font-bold text-primary">{pagamento.valor}</Text>
                    </View>
                  </View>

                  <View className="h-px bg-border" />

                  <View>
                    <Text className="text-sm text-muted mb-1">Recebedor</Text>
                    <Text className="text-sm text-foreground">{pagamento.nomeRecebedor}</Text>
                  </View>

                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      className="flex-1 bg-primary/10 rounded-lg py-2 items-center"
                      onPress={() => handleEditar(pagamento)}
                    >
                      <Text className="text-primary font-semibold text-sm">Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 bg-error/10 rounded-lg py-2 items-center"
                      onPress={() => handleRemover(pagamento)}
                    >
                      <Text className="text-error font-semibold text-sm">Remover</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          ) : (
            <View className="bg-surface rounded-2xl p-6 items-center border border-border">
              <Text className="text-muted text-center">Nenhuma configuração de pagamento criada ainda.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
