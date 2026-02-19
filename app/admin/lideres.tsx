import { useState, useEffect, useCallback } from 'react';
import {
  ScrollView, Text, View, TextInput, TouchableOpacity, Alert, Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import * as Haptics from 'expo-haptics';
import { trpc } from '@/lib/trpc';
import {
  getLideres, adicionarLider, removerLider, atualizarSenhaLider,
  getRelatorios,
  type LiderCelula, type RelatorioCelula,
} from '@/lib/data/lideres';

export default function AdminLideresScreen() {
  const colors = useColors();
  const router = useRouter();
  const [lideres, setLideres] = useState<LiderCelula[]>([]);
  const [relatorios, setRelatorios] = useState<RelatorioCelula[]>([]);
  const [novoNome, setNovoNome] = useState('');
  const [novaCelula, setNovaCelula] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoSenha, setEditandoSenha] = useState<string | null>(null);
  const [senhaEditada, setSenhaEditada] = useState('');
  const [celulas, setCelulas] = useState<Celula[]>([]);

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [])
  );

  // Buscar células do banco de dados
  const { data: celulasDB = [] } = trpc.celulas.list.useQuery(undefined, {
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });

  const carregarDados = async () => {
    const lids = await getLideres();
    setLideres(lids);
    const rels = await getRelatorios();
    setRelatorios(rels);
    // Usar células do banco de dados em vez do AsyncStorage
    if (celulasDB && celulasDB.length > 0) {
      const celulasFormatadas = celulasDB.map((c: any) => ({
        id: c.id?.toString() || '',
        name: c.nome || '',
        leader: { name: '', phone: '' },
        schedule: { day: '', time: '' },
        address: { street: '', neighborhood: '', city: '' },
        description: '',
      }));
      setCelulas(celulasFormatadas);
    }
  };

  const handleAdicionarLider = async () => {
    if (!novoNome.trim()) {
      Alert.alert('Atenção', 'Informe o nome do líder.');
      return;
    }
    if (!novaCelula.trim()) {
      Alert.alert('Atenção', 'Selecione a célula do líder.');
      return;
    }
    // Validar se a célula existe no banco de dados
    const celulaExiste = celulasDB.some((c: any) => c.nome === novaCelula);
    if (!celulaExiste) {
      Alert.alert('Atenção', 'A célula selecionada não existe no banco de dados.');
      return;
    }
    if (!novaSenha.trim() || novaSenha.trim().length < 4) {
      Alert.alert('Atenção', 'A senha deve ter pelo menos 4 caracteres.');
      return;
    }

    // Verificar se já existe líder para essa célula
    const existente = lideres.find(l => l.celula === novaCelula);
    if (existente) {
      Alert.alert('Atenção', `Já existe um líder cadastrado para a célula "${novaCelula}". Remova-o primeiro se deseja substituir.`);
      return;
    }

    try {
      await adicionarLider({
        nome: novoNome.trim(),
        celula: novaCelula.trim(),
        senha: novaSenha.trim(),
      });

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert('Sucesso', `Líder "${novoNome}" adicionado para a célula "${novaCelula}".`);
      setNovoNome('');
      setNovaCelula('');
      setNovaSenha('');
      setMostrarForm(false);
      await carregarDados();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível adicionar o líder.');
    }
  };

  const handleRemoverLider = (lider: LiderCelula) => {
    Alert.alert(
      'Remover Líder',
      `Deseja remover "${lider.nome}" como líder da célula "${lider.celula}"?\n\nIsso revogará o acesso dele ao painel de líderes.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            await removerLider(lider.id);
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            await carregarDados();
          },
        },
      ]
    );
  };

  const handleSalvarSenha = async (liderId: string) => {
    if (!senhaEditada.trim() || senhaEditada.trim().length < 4) {
      Alert.alert('Atenção', 'A senha deve ter pelo menos 4 caracteres.');
      return;
    }
    await atualizarSenhaLider(liderId, senhaEditada.trim());
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Alert.alert('Sucesso', 'Senha atualizada com sucesso.');
    setEditandoSenha(null);
    setSenhaEditada('');
    await carregarDados();
  };

  const getRelatoriosPorCelula = (celulaNome: string) => {
    return relatorios.filter(r => r.celulaNome === celulaNome);
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 100 }}>
        {/* Header */}
        <View className="flex-row items-center mb-2">
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginRight: 12, padding: 4 }}
          >
            <IconSymbol name="chevron.right" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-foreground">Gerenciar Líderes</Text>
            <Text className="text-muted text-sm">{lideres.length} líderes cadastrados</Text>
          </View>
        </View>

        {/* Botão Adicionar */}
        <TouchableOpacity
          onPress={() => setMostrarForm(!mostrarForm)}
          style={{
            backgroundColor: mostrarForm ? colors.muted : colors.primary,
            borderRadius: 12,
            padding: 14,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
            {mostrarForm ? 'Cancelar' : '+ Adicionar Novo Líder'}
          </Text>
        </TouchableOpacity>

        {/* Formulário de Novo Líder */}
        {mostrarForm && (
          <View className="bg-surface rounded-2xl p-5 border border-border gap-4">
            <Text className="text-base font-bold text-foreground">Novo Líder de Célula</Text>

            {/* Nome */}
            <View>
              <Text className="text-foreground font-semibold mb-2 text-sm">Nome do Líder *</Text>
              <TextInput
                value={novoNome}
                onChangeText={setNovoNome}
                placeholder="Nome completo"
                placeholderTextColor={colors.muted}
                style={{
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  padding: 12,
                  fontSize: 15,
                  color: colors.foreground,
                }}
              />
            </View>

            {/* Célula */}
            <View>
              <Text className="text-foreground font-semibold mb-2 text-sm">Célula *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {celulas.map((cel) => (
                  <TouchableOpacity
                    key={cel.id}
                    onPress={() => setNovaCelula(cel.name)}
                    style={{
                      backgroundColor: novaCelula === cel.name ? colors.primary : colors.background,
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 20,
                      marginRight: 8,
                      borderWidth: 1,
                      borderColor: novaCelula === cel.name ? colors.primary : colors.border,
                    }}
                  >
                    <Text style={{
                      color: novaCelula === cel.name ? '#fff' : colors.foreground,
                      fontWeight: '600',
                      fontSize: 13,
                    }}>
                      {cel.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Senha */}
            <View>
              <Text className="text-foreground font-semibold mb-2 text-sm">Senha de Acesso *</Text>
              <TextInput
                value={novaSenha}
                onChangeText={setNovaSenha}
                placeholder="Mínimo 4 caracteres"
                placeholderTextColor={colors.muted}
                style={{
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  padding: 12,
                  fontSize: 15,
                  color: colors.foreground,
                }}
              />
              <Text className="text-xs text-muted mt-1">
                O líder usará esta senha para acessar o painel de líderes
              </Text>
            </View>

            {/* Botão Salvar */}
            <TouchableOpacity
              onPress={handleAdicionarLider}
              style={{
                backgroundColor: colors.success,
                borderRadius: 12,
                padding: 14,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
                Salvar Líder
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Lista de Líderes */}
        {lideres.length === 0 ? (
          <View className="bg-surface rounded-xl p-6 border border-border items-center">
            <IconSymbol name="person.2.fill" size={40} color={colors.muted} />
            <Text className="text-muted text-center mt-3">
              Nenhum líder cadastrado ainda.{'\n'}Adicione líderes para que possam acessar o painel.
            </Text>
          </View>
        ) : (
          lideres.map((lider) => {
            const relsCelula = getRelatoriosPorCelula(lider.celula);
            return (
              <View
                key={lider.id}
                className="bg-surface rounded-2xl p-4 border border-border gap-3"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View
                      style={{
                        backgroundColor: colors.primary + '20',
                        width: 44, height: 44, borderRadius: 22,
                        alignItems: 'center', justifyContent: 'center',
                        marginRight: 12,
                      }}
                    >
                      <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 18 }}>
                        {lider.nome.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-foreground font-bold text-base">{lider.nome}</Text>
                      <Text className="text-muted text-xs">Célula: {lider.celula}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoverLider(lider)}
                    style={{
                      backgroundColor: colors.error + '15',
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ color: colors.error, fontSize: 11, fontWeight: '600' }}>Remover</Text>
                  </TouchableOpacity>
                </View>

                {/* Info */}
                <View className="flex-row gap-3">
                  <View
                    style={{
                      backgroundColor: colors.primary + '10',
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '600' }}>
                      {relsCelula.length} relatórios
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: colors.muted + '20',
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ color: colors.muted, fontSize: 11, fontWeight: '600' }}>
                      Senha: ****
                    </Text>
                  </View>
                </View>

                {/* Editar Senha */}
                {editandoSenha === lider.id ? (
                  <View className="flex-row items-center gap-2">
                    <TextInput
                      value={senhaEditada}
                      onChangeText={setSenhaEditada}
                      placeholder="Nova senha"
                      placeholderTextColor={colors.muted}
                      style={{
                        flex: 1,
                        backgroundColor: colors.background,
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: 8,
                        padding: 10,
                        fontSize: 14,
                        color: colors.foreground,
                      }}
                    />
                    <TouchableOpacity
                      onPress={() => handleSalvarSenha(lider.id)}
                      style={{
                        backgroundColor: colors.success,
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        borderRadius: 8,
                      }}
                    >
                      <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>Salvar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => { setEditandoSenha(null); setSenhaEditada(''); }}
                      style={{
                        backgroundColor: colors.muted + '20',
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        borderRadius: 8,
                      }}
                    >
                      <Text style={{ color: colors.muted, fontWeight: '700', fontSize: 12 }}>X</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => { setEditandoSenha(lider.id); setSenhaEditada(''); }}
                    style={{
                      backgroundColor: colors.warning + '10',
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: colors.warning + '30',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: colors.warning, fontSize: 12, fontWeight: '600' }}>
                      Alterar Senha
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}

        {/* Info sobre relatórios */}
        {relatorios.length > 0 && (
          <View className="bg-surface rounded-2xl p-4 border border-border gap-2">
            <Text className="text-base font-bold text-foreground">Todos os Relatórios</Text>
            <Text className="text-muted text-sm">
              Total: {relatorios.length} relatórios de todas as células
            </Text>
            {Object.entries(
              relatorios.reduce((acc: Record<string, number>, r) => {
                acc[r.celulaNome] = (acc[r.celulaNome] || 0) + 1;
                return acc;
              }, {})
            ).map(([celula, count]) => (
              <View key={celula} className="flex-row items-center justify-between py-1">
                <Text className="text-foreground text-sm">{celula}</Text>
                <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>
                  {count} relatórios
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
