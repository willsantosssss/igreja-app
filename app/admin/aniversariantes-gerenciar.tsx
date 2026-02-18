import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { getMembrosDaCelula, type MembroCelula } from '@/lib/data/lideres';
import { getCelulas, type Celula } from '@/lib/data/celulas';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AniversariantesGerenciarScreen() {
  const colors = useColors();
  const [membros, setMembros] = useState<MembroCelula[]>([]);
  const [celulas, setCelulas] = useState<Celula[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [dataNascimento, setDataNascimento] = useState('');
  const [filtroMes, setFiltroMes] = useState<number | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      const todasCelulas = await getCelulas();
      setCelulas(todasCelulas);

      // Carregar todos os membros de todas as células
      let todosMembros: MembroCelula[] = [];
      for (const celula of todasCelulas) {
        const membroscelula = await getMembrosDaCelula(celula.name);
        todosMembros = [...todosMembros, ...membroscelula];
      }
      setMembros(todosMembros);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados');
    } finally {
      setCarregando(false);
    }
  };

  const salvarDataNascimento = async (membro: MembroCelula) => {
    if (!dataNascimento.trim()) {
      Alert.alert('Atenção', 'Digite uma data válida (DD/MM/YYYY)');
      return;
    }

    // Validar formato DD/MM/YYYY
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regex.test(dataNascimento)) {
      Alert.alert('Erro', 'Formato inválido. Use DD/MM/YYYY');
      return;
    }

    try {
      const membroAtualizado = { ...membro, dataNascimento };
      const chave = `@membro_${membro.nome}_${membro.celula}`;
      await AsyncStorage.setItem(chave, JSON.stringify(membroAtualizado));

      // Atualizar lista local
      setMembros(membros.map(m => m.nome === membro.nome && m.celula === membro.celula ? membroAtualizado : m));
      setEditandoId(null);
      setDataNascimento('');

      Alert.alert('Sucesso', 'Data de nascimento atualizada');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      Alert.alert('Erro', 'Não foi possível salvar a data');
    }
  };

  const membrosFiltrados = filtroMes
    ? membros.filter(m => {
        if (!m.dataNascimento) return false;
        const partes = m.dataNascimento.split('/');
        if (partes.length < 2) return false;
        const mes = parseInt(partes[1]);
        return mes === filtroMes;
      })
    : membros;

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  if (carregando) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-muted mt-4">Carregando membros...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Cabeçalho */}
        <View className="gap-2 mb-6">
          <Text className="text-3xl font-bold text-foreground">Gerenciar Aniversariantes</Text>
          <Text className="text-sm text-muted">Adicione ou edite datas de nascimento dos membros</Text>
        </View>

        {/* Filtro por Mês */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-muted mb-3">Filtrar por Mês</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
            <TouchableOpacity
              onPress={() => setFiltroMes(null)}
              className={`px-4 py-2 rounded-full ${filtroMes === null ? 'bg-primary' : 'bg-surface border border-border'}`}
            >
              <Text className={filtroMes === null ? 'text-background font-semibold' : 'text-foreground'}>
                Todos
              </Text>
            </TouchableOpacity>
            {meses.map((mes, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setFiltroMes(index + 1)}
                className={`px-4 py-2 rounded-full ${filtroMes === index + 1 ? 'bg-primary' : 'bg-surface border border-border'}`}
              >
                <Text className={filtroMes === index + 1 ? 'text-background font-semibold text-xs' : 'text-foreground text-xs'}>
                  {mes.substring(0, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Lista de Membros */}
        <View className="gap-3">
          {membrosFiltrados.length > 0 ? (
            membrosFiltrados.map((membro) => (
            <View
              key={`${membro.nome}-${membro.celula}`}
              className="bg-surface rounded-xl p-4 border border-border"
            >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">{membro.nome}</Text>
                    <Text className="text-xs text-muted">{membro.celula}</Text>
                  </View>
                  {membro.dataNascimento && (
                    <View style={{ backgroundColor: colors.primary + '15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
                      <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>
                        {membro.dataNascimento}
                      </Text>
                    </View>
                  )}
                </View>

{editandoId === `${membro.nome}-${membro.celula}` ? (
                  <View className="gap-2">
                    <TextInput
                      className="border rounded-lg p-3 text-foreground"
                      style={{ borderColor: colors.border }}
                      placeholder="DD/MM/YYYY"
                      placeholderTextColor={colors.muted}
                      value={dataNascimento}
                      onChangeText={setDataNascimento}
                      keyboardType="numeric"
                    />
                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        className="flex-1 bg-primary py-2 rounded-lg items-center"
                        onPress={() => salvarDataNascimento(membro)}
                      >
                        <Text className="text-background font-semibold">Salvar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="flex-1 bg-surface border border-border py-2 rounded-lg items-center"
                        onPress={() => {
                          setEditandoId(null);
                          setDataNascimento('');
                        }}
                      >
                        <Text className="text-foreground font-semibold">Cancelar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    className="bg-primary/10 py-2 rounded-lg items-center border border-primary/20"
                    onPress={() => {
                      setEditandoId(`${membro.nome}-${membro.celula}`);
                      setDataNascimento(membro.dataNascimento || '');
                    }}
                  >
                    <Text style={{ color: colors.primary, fontWeight: '600' }}>
                      {membro.dataNascimento ? '✏️ Editar' : '➕ Adicionar Data'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          ) : (
            <View className="items-center py-10 gap-2">
              <Text className="text-4xl">📅</Text>
              <Text className="text-base text-muted text-center">
                {filtroMes ? `Nenhum aniversariante em ${meses[filtroMes - 1]}` : 'Nenhum membro cadastrado'}
              </Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View className="bg-primary/10 rounded-xl p-4 gap-2 border border-primary/20 mt-6">
          <Text className="text-sm font-semibold text-foreground">ℹ️ Dica</Text>
          <Text className="text-xs text-muted leading-relaxed">
            Use o formato DD/MM/YYYY para adicionar datas de nascimento. Essas informações aparecem na tela de aniversariantes para todos os membros.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
