import { useState, useEffect } from 'react';
import {
  ScrollView, Text, View, TextInput, TouchableOpacity, Alert, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useAuth } from '@/hooks/use-auth';
import { trpc } from '@/lib/trpc';

export default function RelatorioScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState('');
  const [totalPessoas, setTotalPessoas] = useState('');
  const [visitantes, setVisitantes] = useState('');
  const [conversoes, setConversoes] = useState('0');
  const [observacoes, setObservacoes] = useState('');

  const { data: lider, isLoading } = trpc.lideres.getByUserId.useQuery(user?.id || 0, {
    enabled: !!user?.id,
  });

  const createRelatorioMutation = trpc.relatorios.create.useMutation();

  useEffect(() => {
    // Definir data de hoje como padrão
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const ano = hoje.getFullYear();
    setData(`${dia}/${mes}/${ano}`);
  }, []);

  const validarFormulario = (): boolean => {
    if (!data.trim()) {
      Alert.alert('Erro', 'Informe a data da célula.');
      return false;
    }
    if (!totalPessoas.trim() || isNaN(Number(totalPessoas))) {
      Alert.alert('Erro', 'Informe o total de pessoas (número válido).');
      return false;
    }
    if (!visitantes.trim() || isNaN(Number(visitantes))) {
      Alert.alert('Erro', 'Informe o número de visitantes (número válido).');
      return false;
    }
    if (Number(visitantes) > Number(totalPessoas)) {
      Alert.alert('Erro', 'O número de visitantes não pode ser maior que o total de pessoas.');
      return false;
    }
    return true;
  };

  const handleEnviar = async () => {
    if (!lider || !validarFormulario()) return;

    try {
      await createRelatorioMutation.mutateAsync({
        liderId: lider.id,
        celula: lider.celula,
        tipo: 'semanal',
        periodo: data.trim(),
        presentes: Number(totalPessoas),
        novosVisitantes: Number(visitantes),
        conversoes: Number(conversoes) || 0,
        observacoes: observacoes.trim() || undefined,
      });

      Alert.alert(
        'Relatório Enviado!',
        `Relatório da célula "${lider.celula}" registrado com sucesso.\n\nData: ${data}\nTotal: ${totalPessoas} pessoas\nVisitantes: ${visitantes}`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível enviar o relatório. Tente novamente.');
    }
  };

  if (isLoading) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted text-base">Carregando...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!lider) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted text-base text-center">
            Você não está cadastrado como líder de célula.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4 bg-primary px-6 py-3 rounded-full"
          >
            <Text className="text-background font-semibold">Voltar</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginRight: 12, padding: 4 }}
          >
            <IconSymbol name="chevron.right" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-foreground">Novo Relatório</Text>
            <Text className="text-muted text-sm">Célula: {lider.celula}</Text>
          </View>
        </View>

        {/* Formulário */}
        <View className="bg-surface rounded-2xl p-6 border border-border">
          {/* Data */}
          <View className="mb-5">
            <Text className="text-foreground font-semibold mb-2">Data da Célula *</Text>
            <TextInput
              value={data}
              onChangeText={setData}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={colors.muted}
              keyboardType="default"
              style={{
                backgroundColor: colors.background,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                padding: 14,
                fontSize: 16,
                color: colors.foreground,
              }}
            />
          </View>

          {/* Total de Pessoas */}
          <View className="mb-5">
            <Text className="text-foreground font-semibold mb-2">Total de Pessoas *</Text>
            <Text className="text-muted text-xs mb-2">
              Inclua membros e visitantes no total
            </Text>
            <TextInput
              value={totalPessoas}
              onChangeText={setTotalPessoas}
              placeholder="Ex: 15"
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
              returnKeyType="done"
              style={{
                backgroundColor: colors.background,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                padding: 14,
                fontSize: 16,
                color: colors.foreground,
              }}
            />
          </View>

          {/* Visitantes */}
          <View className="mb-5">
            <Text className="text-foreground font-semibold mb-2">Visitantes *</Text>
            <Text className="text-muted text-xs mb-2">
              Quantas pessoas visitaram pela primeira vez
            </Text>
            <TextInput
              value={visitantes}
              onChangeText={setVisitantes}
              placeholder="Ex: 3"
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
              returnKeyType="done"
              style={{
                backgroundColor: colors.background,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                padding: 14,
                fontSize: 16,
                color: colors.foreground,
              }}
            />
          </View>

          {/* Conversões */}
          <View className="mb-5">
            <Text className="text-foreground font-semibold mb-2">Conversões</Text>
            <Text className="text-muted text-xs mb-2">
              Quantas pessoas aceitaram Jesus
            </Text>
            <TextInput
              value={conversoes}
              onChangeText={setConversoes}
              placeholder="Ex: 1"
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
              returnKeyType="done"
              style={{
                backgroundColor: colors.background,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                padding: 14,
                fontSize: 16,
                color: colors.foreground,
              }}
            />
          </View>

          {/* Observações */}
          <View className="mb-6">
            <Text className="text-foreground font-semibold mb-2">Observações</Text>
            <TextInput
              value={observacoes}
              onChangeText={setObservacoes}
              placeholder="Testemunhos, necessidades, pedidos especiais..."
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={{
                backgroundColor: colors.background,
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

          {/* Resumo */}
          {totalPessoas && visitantes && !isNaN(Number(totalPessoas)) && !isNaN(Number(visitantes)) && (
            <View
              style={{
                backgroundColor: colors.primary + '10',
                borderRadius: 12,
                padding: 14,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: colors.primary + '30',
              }}
            >
              <Text style={{ color: colors.primary, fontWeight: '700', marginBottom: 4 }}>
                Resumo
              </Text>
              <Text className="text-muted text-sm">
                Total: {totalPessoas} pessoas ({Number(totalPessoas) - Number(visitantes)} membros + {visitantes} visitantes)
                {Number(conversoes) > 0 && ` • ${conversoes} conversão${Number(conversoes) > 1 ? 'ões' : ''}`}
              </Text>
            </View>
          )}

          {/* Botão Enviar */}
          <TouchableOpacity
            onPress={handleEnviar}
            disabled={createRelatorioMutation.isPending}
            style={{
              backgroundColor: createRelatorioMutation.isPending ? colors.muted : colors.success,
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              opacity: createRelatorioMutation.isPending ? 0.7 : 1,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
              {createRelatorioMutation.isPending ? 'Enviando...' : 'Enviar Relatório'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
