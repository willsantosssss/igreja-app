import { useState, useCallback, useEffect } from 'react';
import { ScrollView, Text, View, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { type Celula } from '@/lib/data/celulas';
import { trpc } from '@/lib/trpc';

const DIAS_SEMANA = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];

export default function AdminCelulasScreen() {
  const colors = useColors();
  const router = useRouter();
  const [celulas, setCelulas] = useState<Celula[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const { data: celulasData, isLoading: carregando, refetch } = trpc.celulas.list.useQuery(undefined, {
    refetchOnWindowFocus: true,
  });

  const criarMutation = trpc.celulas.create.useMutation({ onSuccess: () => refetch() });
  const atualizarMutation = trpc.celulas.update.useMutation({ onSuccess: () => refetch() });
  const deletarMutation = trpc.celulas.delete.useMutation({ onSuccess: () => refetch() });

  // Form state
  const [nome, setNome] = useState('');
  const [liderNome, setLiderNome] = useState('');
  const [liderTelefone, setLiderTelefone] = useState('');
  const [dia, setDia] = useState('Terça-feira');
  const [horario, setHorario] = useState('19:30');
  const [rua, setRua] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('Rondonópolis - MT');
  const [descricao, setDescricao] = useState('');

  useEffect(() => {
    if (celulasData) {
      setCelulas(celulasData.map((c: any) => ({
        id: c.id.toString(),
        name: c.nome,
        leader: { name: c.lider, phone: c.telefone },
        schedule: { day: c.diaReuniao, time: c.horario },
        address: { street: c.endereco, neighborhood: '', city: '' },
        description: '',
      })));
    }
  }, [celulasData]);

  const limparForm = () => {
    setNome(''); setLiderNome(''); setLiderTelefone('');
    setDia('Terça-feira'); setHorario('19:30');
    setRua(''); setBairro(''); setCidade('Rondonópolis - MT');
    setDescricao(''); setEditandoId(null);
  };

  const preencherForm = (c: Celula) => {
    setNome(c.name); setLiderNome(c.leader.name); setLiderTelefone(c.leader.phone);
    setDia(c.schedule.day); setHorario(c.schedule.time);
    setRua(c.address.street); setBairro(c.address.neighborhood); setCidade(c.address.city);
    setDescricao(c.description); setEditandoId(c.id);
    setShowForm(true);
  };

  const handleSalvar = async () => {
    if (!nome.trim() || !liderNome.trim()) {
      Alert.alert('Atenção', 'Preencha pelo menos o nome da célula e o nome do líder.');
      return;
    }

    const endereco = `${rua.trim()}, ${bairro.trim()} - ${cidade.trim()}`;

    try {
      if (editandoId) {
        await atualizarMutation.mutateAsync({
          id: parseInt(editandoId),
          data: {
            nome: nome.trim(),
            lider: liderNome.trim(),
            telefone: liderTelefone.trim(),
            endereco,
            diaReuniao: dia,
            horario: horario.trim(),
          },
        });
        Alert.alert('Sucesso', 'Célula atualizada e sincronizada!');
      } else {
        await criarMutation.mutateAsync({
          nome: nome.trim(),
          lider: liderNome.trim(),
          telefone: liderTelefone.trim(),
          endereco,
          diaReuniao: dia,
          horario: horario.trim(),
          latitude: '',
          longitude: '',
        });
        Alert.alert('Sucesso', 'Nova célula criada e sincronizada!');
      }
      limparForm();
      setShowForm(false);
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a célula.');
    }
  };

  const handleRemover = (id: string, nomeCelula: string) => {
    Alert.alert(
      'Remover Célula',
      `Deseja remover a célula "${nomeCelula}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar' },
        {
          text: 'Remover', style: 'destructive',
          onPress: async () => {
            try {
              await deletarMutation.mutateAsync(parseInt(id));
              Alert.alert('Sucesso', 'Célula removida e sincronizada!');
            } catch {
              Alert.alert('Erro', 'Não foi possível remover a célula.');
            }
          },
        },
      ]
    );
  };

  if (carregando) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted text-base">Carregando células...</Text>
        </View>
      </ScreenContainer>
    );
  }

  // Formulário
  if (showForm) {
    return (
      <ScreenContainer>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
          <View className="flex-row items-center mb-2">
            <TouchableOpacity onPress={() => { setShowForm(false); limparForm(); }} style={{ marginRight: 12, padding: 4 }}>
              <IconSymbol name="chevron.right" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-foreground">
              {editandoId ? 'Editar Célula' : 'Nova Célula'}
            </Text>
          </View>

          {/* Nome */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Nome da Célula *</Text>
            <TextInput
              className="bg-surface rounded-xl px-4 py-3 text-foreground border"
              style={{ borderColor: colors.border }}
              placeholder="Ex: Célula Vida Nova"
              placeholderTextColor={colors.muted}
              value={nome}
              onChangeText={setNome}
            />
          </View>

          {/* Líder */}
          <View className="bg-surface rounded-2xl p-4 gap-3 border border-border">
            <Text className="text-sm font-bold text-foreground">Líder</Text>
            <View className="gap-2">
              <Text className="text-xs text-muted">Nome do Líder *</Text>
              <TextInput
                className="bg-background rounded-xl px-4 py-3 text-foreground border"
                style={{ borderColor: colors.border }}
                placeholder="Nome completo"
                placeholderTextColor={colors.muted}
                value={liderNome}
                onChangeText={setLiderNome}
              />
            </View>
            <View className="gap-2">
              <Text className="text-xs text-muted">Telefone</Text>
              <TextInput
                className="bg-background rounded-xl px-4 py-3 text-foreground border"
                style={{ borderColor: colors.border }}
                placeholder="+55 66 99999-9999"
                placeholderTextColor={colors.muted}
                value={liderTelefone}
                onChangeText={setLiderTelefone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Horário */}
          <View className="bg-surface rounded-2xl p-4 gap-3 border border-border">
            <Text className="text-sm font-bold text-foreground">Horário</Text>
            <View className="gap-2">
              <Text className="text-xs text-muted">Dia da Semana</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {DIAS_SEMANA.map(d => (
                    <TouchableOpacity
                      key={d}
                      onPress={() => setDia(d)}
                      style={{
                        backgroundColor: dia === d ? colors.primary : colors.background,
                        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
                        borderWidth: 1, borderColor: dia === d ? colors.primary : colors.border,
                      }}
                    >
                      <Text style={{ color: dia === d ? '#fff' : colors.foreground, fontSize: 12, fontWeight: '600' }}>
                        {d.replace('-feira', '')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
            <View className="gap-2">
              <Text className="text-xs text-muted">Horário</Text>
              <TextInput
                className="bg-background rounded-xl px-4 py-3 text-foreground border"
                style={{ borderColor: colors.border }}
                placeholder="19:30"
                placeholderTextColor={colors.muted}
                value={horario}
                onChangeText={setHorario}
              />
            </View>
          </View>

          {/* Endereço */}
          <View className="bg-surface rounded-2xl p-4 gap-3 border border-border">
            <Text className="text-sm font-bold text-foreground">Endereço</Text>
            <View className="gap-2">
              <Text className="text-xs text-muted">Rua</Text>
              <TextInput
                className="bg-background rounded-xl px-4 py-3 text-foreground border"
                style={{ borderColor: colors.border }}
                placeholder="Rua das Flores, 123"
                placeholderTextColor={colors.muted}
                value={rua}
                onChangeText={setRua}
              />
            </View>
            <View className="gap-2">
              <Text className="text-xs text-muted">Bairro</Text>
              <TextInput
                className="bg-background rounded-xl px-4 py-3 text-foreground border"
                style={{ borderColor: colors.border }}
                placeholder="Centro"
                placeholderTextColor={colors.muted}
                value={bairro}
                onChangeText={setBairro}
              />
            </View>
            <View className="gap-2">
              <Text className="text-xs text-muted">Cidade</Text>
              <TextInput
                className="bg-background rounded-xl px-4 py-3 text-foreground border"
                style={{ borderColor: colors.border }}
                placeholder="Rondonópolis - MT"
                placeholderTextColor={colors.muted}
                value={cidade}
                onChangeText={setCidade}
              />
            </View>
          </View>

          {/* Descrição */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Descrição</Text>
            <TextInput
              className="bg-surface rounded-xl px-4 py-3 text-foreground border"
              style={{ borderColor: colors.border, minHeight: 80, textAlignVertical: 'top' }}
              placeholder="Descreva a célula..."
              placeholderTextColor={colors.muted}
              value={descricao}
              onChangeText={setDescricao}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Botão Salvar */}
          <TouchableOpacity
            className="py-4 rounded-xl items-center mt-2"
            style={{ backgroundColor: colors.primary }}
            onPress={handleSalvar}
          >
            <Text className="text-white font-bold text-base">
              {editandoId ? 'Salvar Alterações' : 'Criar Célula'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
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
            <Text className="text-2xl font-bold text-foreground">Gerenciar Células</Text>
            <Text className="text-muted text-sm">{celulas.length} células cadastradas</Text>
          </View>
          <TouchableOpacity
            onPress={() => { limparForm(); setShowForm(true); }}
            style={{ backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>+ Nova</Text>
          </TouchableOpacity>
        </View>

        {/* Lista */}
        {celulas.map(celula => (
          <View key={celula.id} className="bg-surface rounded-2xl p-4 gap-3 border border-border">
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <Text className="text-lg font-bold text-foreground">{celula.name}</Text>
                <Text className="text-xs text-muted mt-1">ID: {celula.id}</Text>
              </View>
            </View>

            {/* Líder */}
            <View className="flex-row items-center gap-2">
              <View style={{ backgroundColor: colors.primary + '15', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 13 }}>
                  {celula.leader.name.charAt(0)}
                </Text>
              </View>
              <View>
                <Text className="text-sm font-semibold text-foreground">{celula.leader.name}</Text>
                <Text className="text-xs text-muted">{celula.leader.phone}</Text>
              </View>
            </View>

            {/* Horário e Endereço */}
            <View className="flex-row gap-3">
              <View className="flex-1" style={{ backgroundColor: colors.primary + '08', padding: 10, borderRadius: 10 }}>
                <Text className="text-xs text-muted mb-1">Horário</Text>
                <Text className="text-sm font-semibold text-foreground">{celula.schedule.day}</Text>
                <Text className="text-sm text-foreground">{celula.schedule.time}</Text>
              </View>
              <View className="flex-1" style={{ backgroundColor: colors.primary + '08', padding: 10, borderRadius: 10 }}>
                <Text className="text-xs text-muted mb-1">Endereço</Text>
                <Text className="text-xs text-foreground">{celula.address.street}</Text>
                <Text className="text-xs text-muted">{celula.address.neighborhood}, {celula.address.city}</Text>
              </View>
            </View>

            {celula.description ? (
              <Text className="text-xs text-muted">{celula.description}</Text>
            ) : null}

            {/* Ações */}
            <View className="flex-row gap-2 pt-2 border-t border-border">
              <TouchableOpacity
                className="flex-1 py-2 rounded-lg items-center"
                style={{ backgroundColor: colors.primary + '15' }}
                onPress={() => preencherForm(celula)}
              >
                <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-2 rounded-lg items-center"
                style={{ backgroundColor: colors.error + '15' }}
                onPress={() => handleRemover(celula.id, celula.name)}
              >
                <Text style={{ color: colors.error, fontSize: 12, fontWeight: '600' }}>Remover</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {celulas.length === 0 && (
          <View className="items-center py-10 gap-2">
            <Text className="text-5xl">🏠</Text>
            <Text className="text-base text-muted text-center">Nenhuma célula cadastrada</Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
