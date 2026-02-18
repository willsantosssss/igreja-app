import { useState, useEffect, useCallback } from 'react';
import {
  ScrollView, Text, View, TouchableOpacity, Alert, TextInput, Platform, Modal,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import * as Haptics from 'expo-haptics';
import {
  getEventos, criarEvento, editarEvento, removerEvento,
  categoryLabels, categoryColors,
  type Event, type EventCategory,
} from '@/lib/data/events';

type FormData = {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: EventCategory;
};

const FORM_VAZIO: FormData = {
  title: '',
  description: '',
  date: '',
  time: '',
  location: '',
  category: 'culto',
};

export default function AdminEventosScreen() {
  const colors = useColors();
  const router = useRouter();
  const [eventos, setEventos] = useState<Event[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);

  const carregarEventos = async () => {
    const lista = await getEventos();
    // Ordenar por data (mais recentes primeiro)
    lista.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setEventos(lista);
    setCarregando(false);
  };

  useEffect(() => {
    carregarEventos();
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarEventos();
    }, [])
  );

  const abrirFormCriar = () => {
    setEditandoId(null);
    setForm(FORM_VAZIO);
    setModalVisivel(true);
  };

  const abrirFormEditar = (evento: Event) => {
    setEditandoId(evento.id);
    setForm({
      title: evento.title,
      description: evento.description,
      date: evento.date,
      time: evento.time,
      location: evento.location,
      category: evento.category,
    });
    setModalVisivel(true);
  };

  const validarForm = (): boolean => {
    if (!form.title.trim()) {
      Alert.alert('Atenção', 'Informe o nome do evento.');
      return false;
    }
    if (!form.date.trim()) {
      Alert.alert('Atenção', 'Informe a data do evento (formato: AAAA-MM-DD).');
      return false;
    }
    // Validar formato da data
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(form.date.trim())) {
      Alert.alert('Atenção', 'A data deve estar no formato AAAA-MM-DD (ex: 2026-03-15).');
      return false;
    }
    if (!form.time.trim()) {
      Alert.alert('Atenção', 'Informe o horário do evento.');
      return false;
    }
    if (!form.location.trim()) {
      Alert.alert('Atenção', 'Informe o local do evento.');
      return false;
    }
    return true;
  };

  const handleSalvar = async () => {
    if (!validarForm()) return;

    setSalvando(true);
    try {
      // Adicionar hora à data para evitar problema de timezone
      const dataComHora = form.date.trim() + 'T00:00:00';
      
      if (editandoId) {
        await editarEvento(editandoId, {
          title: form.title.trim(),
          description: form.description.trim(),
          date: dataComHora,
          time: form.time.trim(),
          location: form.location.trim(),
          category: form.category,
        });
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        Alert.alert('Sucesso', 'Evento atualizado com sucesso!');
      } else {
        await criarEvento({
          title: form.title.trim(),
          description: form.description.trim(),
          date: dataComHora,
          time: form.time.trim(),
          location: form.location.trim(),
          category: form.category,
        });
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        Alert.alert('Sucesso', 'Evento criado com sucesso!');
      }
      setModalVisivel(false);
      setForm(FORM_VAZIO);
      setEditandoId(null);
      await carregarEventos();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o evento.');
    } finally {
      setSalvando(false);
    }
  };

  const handleRemover = (evento: Event) => {
    Alert.alert(
      'Remover Evento',
      `Deseja remover "${evento.title}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            await removerEvento(evento.id);
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            await carregarEventos();
          },
        },
      ],
    );
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  const categorias: EventCategory[] = ['culto', 'reuniao', 'evento-especial', 'retiro', 'conferencia'];

  if (carregando) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted text-base">Carregando...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 100 }}>
        {/* Header */}
        <View className="flex-row items-center gap-3 mb-2">
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <Text className="text-xl">←</Text>
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-foreground">Gerenciar Eventos</Text>
            <Text className="text-sm text-muted">{eventos.length} eventos cadastrados</Text>
          </View>
          <TouchableOpacity
            onPress={abrirFormCriar}
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>+ Novo</Text>
          </TouchableOpacity>
        </View>

        {/* Lista de eventos */}
        {eventos.length === 0 ? (
          <View className="items-center py-10 gap-3">
            <Text className="text-5xl">📅</Text>
            <Text className="text-base text-muted text-center">
              Nenhum evento cadastrado
            </Text>
            <TouchableOpacity
              onPress={abrirFormCriar}
              style={{
                backgroundColor: colors.primary,
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 24,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>Criar Primeiro Evento</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="gap-3">
            {eventos.map((evento) => (
              <View
                key={evento.id}
                className="bg-surface rounded-2xl border border-border overflow-hidden"
              >
                {/* Barra de cor da categoria */}
                <View style={{ height: 4, backgroundColor: categoryColors[evento.category] }} />

                <View style={{ padding: 16, gap: 12 }}>
                  {/* Cabeçalho: categoria + ações */}
                  <View className="flex-row items-center justify-between">
                    <View
                      className="px-2 py-1 rounded-full"
                      style={{ backgroundColor: categoryColors[evento.category] + '20' }}
                    >
                      <Text
                        style={{ color: categoryColors[evento.category], fontSize: 11, fontWeight: '700' }}
                      >
                        {categoryLabels[evento.category]}
                      </Text>
                    </View>
                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        onPress={() => abrirFormEditar(evento)}
                        style={{
                          backgroundColor: colors.primary + '15',
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 8,
                        }}
                      >
                        <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>Editar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleRemover(evento)}
                        style={{
                          backgroundColor: colors.error + '15',
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 8,
                        }}
                      >
                        <Text style={{ color: colors.error, fontSize: 12, fontWeight: '700' }}>Remover</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Título */}
                  <Text className="text-base font-bold text-foreground">{evento.title}</Text>

                  {/* Descrição */}
                  {evento.description ? (
                    <Text className="text-sm text-muted" numberOfLines={2}>
                      {evento.description}
                    </Text>
                  ) : null}

                  {/* Info: data, hora, local */}
                  <View className="flex-row flex-wrap gap-3">
                    <View className="flex-row items-center gap-1">
                      <IconSymbol name="calendar" size={14} color={colors.muted} />
                      <Text className="text-xs text-muted">{formatDate(evento.date)}</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Text className="text-xs text-muted">🕐 {evento.time}</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Text className="text-xs text-muted">📍 {evento.location}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modal de Criar/Editar */}
      <Modal
        visible={modalVisivel}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisivel(false)}
      >
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}>
            {/* Header do Modal */}
            <View className="flex-row items-center justify-between mb-2">
              <TouchableOpacity onPress={() => setModalVisivel(false)}>
                <Text style={{ color: colors.error, fontSize: 16, fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
              <Text className="text-lg font-bold text-foreground">
                {editandoId ? 'Editar Evento' : 'Novo Evento'}
              </Text>
              <TouchableOpacity onPress={handleSalvar} disabled={salvando}>
                <Text style={{ color: salvando ? colors.muted : colors.primary, fontSize: 16, fontWeight: '700' }}>
                  {salvando ? 'Salvando...' : 'Salvar'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Categoria */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Categoria</Text>
              <View className="flex-row flex-wrap gap-2">
                {categorias.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setForm(prev => ({ ...prev, category: cat }))}
                    style={{
                      backgroundColor: form.category === cat ? categoryColors[cat] : colors.surface,
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: form.category === cat ? categoryColors[cat] : colors.border,
                    }}
                  >
                    <Text
                      style={{
                        color: form.category === cat ? '#fff' : colors.foreground,
                        fontSize: 13,
                        fontWeight: '600',
                      }}
                    >
                      {categoryLabels[cat]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Nome do Evento */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Nome do Evento *</Text>
              <TextInput
                value={form.title}
                onChangeText={(v) => setForm(prev => ({ ...prev, title: v }))}
                placeholder="Ex: Culto de Celebração"
                placeholderTextColor={colors.muted}
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  padding: 14,
                  fontSize: 16,
                  color: colors.foreground,
                }}
              />
            </View>

            {/* Data */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Data *</Text>
              <TextInput
                value={form.date}
                onChangeText={(v) => setForm(prev => ({ ...prev, date: v }))}
                placeholder="AAAA-MM-DD (ex: 2026-03-15)"
                placeholderTextColor={colors.muted}
                keyboardType="numbers-and-punctuation"
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  padding: 14,
                  fontSize: 16,
                  color: colors.foreground,
                }}
              />
            </View>

            {/* Horário */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Horário *</Text>
              <TextInput
                value={form.time}
                onChangeText={(v) => setForm(prev => ({ ...prev, time: v }))}
                placeholder="Ex: 19:00"
                placeholderTextColor={colors.muted}
                keyboardType="numbers-and-punctuation"
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  padding: 14,
                  fontSize: 16,
                  color: colors.foreground,
                }}
              />
            </View>

            {/* Local */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Local *</Text>
              <TextInput
                value={form.location}
                onChangeText={(v) => setForm(prev => ({ ...prev, location: v }))}
                placeholder="Ex: Templo Central"
                placeholderTextColor={colors.muted}
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  padding: 14,
                  fontSize: 16,
                  color: colors.foreground,
                }}
              />
            </View>

            {/* Descrição */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Descrição</Text>
              <TextInput
                value={form.description}
                onChangeText={(v) => setForm(prev => ({ ...prev, description: v }))}
                placeholder="Descrição do evento (opcional)"
                placeholderTextColor={colors.muted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  padding: 14,
                  fontSize: 16,
                  color: colors.foreground,
                  minHeight: 100,
                }}
              />
            </View>

            {/* Preview */}
            <View className="gap-2 mt-2">
              <Text className="text-sm font-semibold text-muted">Pré-visualização</Text>
              <View
                className="rounded-2xl border overflow-hidden"
                style={{ borderColor: colors.border }}
              >
                <View style={{ height: 4, backgroundColor: categoryColors[form.category] }} />
                <View style={{ padding: 16, gap: 8 }}>
                  <View
                    className="px-2 py-1 rounded-full self-start"
                    style={{ backgroundColor: categoryColors[form.category] + '20' }}
                  >
                    <Text style={{ color: categoryColors[form.category], fontSize: 11, fontWeight: '700' }}>
                      {categoryLabels[form.category]}
                    </Text>
                  </View>
                  <Text className="text-base font-bold text-foreground">
                    {form.title || 'Nome do evento'}
                  </Text>
                  {form.description ? (
                    <Text className="text-sm text-muted" numberOfLines={2}>{form.description}</Text>
                  ) : null}
                  <View className="flex-row flex-wrap gap-3">
                    {form.date ? (
                      <Text className="text-xs text-muted">📅 {formatDate(form.date)}</Text>
                    ) : null}
                    {form.time ? (
                      <Text className="text-xs text-muted">🕐 {form.time}</Text>
                    ) : null}
                    {form.location ? (
                      <Text className="text-xs text-muted">📍 {form.location}</Text>
                    ) : null}
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
