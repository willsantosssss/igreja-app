'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  ScrollView, Text, View, TextInput, TouchableOpacity, Alert, Platform, ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import * as Haptics from 'expo-haptics';
import { trpc } from '@/lib/trpc';

interface Celula {
  id: string;
  name: string;
}

export default function AdminLideresScreen() {
  const colors = useColors();
  const router = useRouter();
  const [novoNome, setNovoNome] = useState('');
  const [novaCelula, setNovaCelula] = useState('');
  const [novoTelefone, setNovoTelefone] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [carregando, setCarregando] = useState(false);

  // Buscar líderes do banco de dados
  const { data: lideresDB = [], refetch: refetchLideres, isLoading: loadingLideres } = trpc.lideres.list.useQuery(undefined, {
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });

  // Buscar células do banco de dados
  const { data: celulasDB = [] } = trpc.celulas.list.useQuery(undefined, {
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });

  // Mutations
  const createLiderMutation = trpc.lideres.create.useMutation({
    onSuccess: () => {
      refetchLideres();
    },
  });

  const deleteLiderMutation = trpc.lideres.delete.useMutation({
    onSuccess: () => {
      refetchLideres();
    },
  });

  const handleAdicionarLider = async () => {
    if (!novoNome.trim()) {
      Alert.alert('Atenção', 'Informe o nome do líder.');
      return;
    }
    if (!novaCelula.trim()) {
      Alert.alert('Atenção', 'Selecione a célula do líder.');
      return;
    }
    if (!novoTelefone.trim()) {
      Alert.alert('Atenção', 'Informe o telefone do líder.');
      return;
    }

    // Validar se a célula existe no banco de dados
    const celulaExiste = celulasDB.some((c: any) => c.nome === novaCelula);
    if (!celulaExiste) {
      Alert.alert('Atenção', 'A célula selecionada não existe no banco de dados.');
      return;
    }

    // Verificar se já existe líder para essa célula
    const existente = lideresDB.find((l: any) => l.celula === novaCelula);
    if (existente) {
      Alert.alert('Atenção', `Já existe um líder cadastrado para a célula "${novaCelula}". Remova-o primeiro se deseja substituir.`);
      return;
    }

    try {
      setCarregando(true);
      await createLiderMutation.mutateAsync({
        userId: 0, // Será preenchido depois se necessário
        nome: novoNome.trim(),
        celula: novaCelula.trim(),
        telefone: novoTelefone.trim(),
        email: novoEmail.trim() || undefined,
        ativo: 1,
      });

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert('Sucesso', `Líder "${novoNome}" adicionado para a célula "${novaCelula}".`);
      setNovoNome('');
      setNovaCelula('');
      setNovoTelefone('');
      setNovoEmail('');
      setMostrarForm(false);
    } catch (error: any) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Alert.alert('Erro', 'Não foi possível adicionar o líder.');
    } finally {
      setCarregando(false);
    }
  };

  const handleRemoverLider = (lider: any) => {
    Alert.alert(
      'Remover Líder',
      `Deseja remover "${lider.nome}" como líder da célula "${lider.celula}"?\n\nIsso revogará o acesso dele ao painel de líderes.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLiderMutation.mutateAsync(lider.id);
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              Alert.alert('Sucesso', 'Líder removido com sucesso.');
            } catch (error) {
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              }
              Alert.alert('Erro', 'Não foi possível remover o líder.');
            }
          },
        },
      ]
    );
  };

  if (loadingLideres) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-muted text-base mt-4">Carregando líderes...</Text>
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
            <Text className="text-2xl font-bold text-foreground">Gerenciar Líderes</Text>
            <Text className="text-muted text-sm">Total: {lideresDB.length} líderes</Text>
          </View>
          <TouchableOpacity
            onPress={() => setMostrarForm(!mostrarForm)}
            className="bg-primary rounded-full p-3"
          >
            <IconSymbol name="plus" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Formulário de Adicionar */}
        {mostrarForm && (
          <View className="bg-surface rounded-2xl p-6 border border-border mb-6">
            <Text className="text-lg font-bold text-foreground mb-4">Novo Líder</Text>

            <View className="mb-4">
              <Text className="text-foreground font-semibold mb-2">Nome *</Text>
              <TextInput
                value={novoNome}
                onChangeText={setNovoNome}
                placeholder="Nome do líder"
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

            <View className="mb-4">
              <Text className="text-foreground font-semibold mb-2">Célula *</Text>
              <View className="bg-background border border-border rounded-lg overflow-hidden">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {celulasDB.map((celula: any) => (
                    <TouchableOpacity
                      key={celula.id}
                      onPress={() => setNovaCelula(celula.nome)}
                      className={`px-4 py-3 ${novaCelula === celula.nome ? 'bg-primary' : 'bg-background'}`}
                    >
                      <Text className={novaCelula === celula.nome ? 'text-white font-semibold' : 'text-foreground'}>
                        {celula.nome}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-foreground font-semibold mb-2">Telefone *</Text>
              <TextInput
                value={novoTelefone}
                onChangeText={setNovoTelefone}
                placeholder="(XX) XXXXX-XXXX"
                placeholderTextColor={colors.muted}
                keyboardType="phone-pad"
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

            <View className="mb-6">
              <Text className="text-foreground font-semibold mb-2">Email</Text>
              <TextInput
                value={novoEmail}
                onChangeText={setNovoEmail}
                placeholder="email@example.com"
                placeholderTextColor={colors.muted}
                keyboardType="email-address"
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

            <TouchableOpacity
              onPress={handleAdicionarLider}
              disabled={carregando}
              className="bg-primary rounded-lg py-3 items-center"
            >
              <Text className="text-white font-bold">
                {carregando ? 'Adicionando...' : 'Adicionar Líder'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Lista de Líderes */}
        <View>
          {lideresDB.length === 0 ? (
            <View className="bg-surface rounded-2xl p-6 items-center border border-border">
              <Text className="text-muted text-center">Nenhum líder cadastrado</Text>
            </View>
          ) : (
            lideresDB.map((lider: any) => (
              <View key={lider.id} className="bg-surface rounded-2xl p-4 mb-3 border border-border">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-foreground">{lider.nome}</Text>
                    <Text className="text-muted text-sm">Célula: {lider.celula}</Text>
                    <Text className="text-muted text-sm">Telefone: {lider.telefone}</Text>
                    {lider.email && <Text className="text-muted text-sm">Email: {lider.email}</Text>}
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoverLider(lider)}
                    className="bg-error rounded-full p-2"
                  >
                    <IconSymbol name="trash.fill" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
