import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  FlatList,
  Alert,
  Modal,
  Pressable,
  Keyboard,
  Share,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useHistoricoAnotacoes, AnotacaoHistorico } from '@/hooks/use-historico-anotacoes';

export default function HistoricoAnotacoesScreen() {
  const colors = useColors();
  const router = useRouter();
  const { anotacoes, isLoading, obterLivrosComAnotacoes, buscarPorTexto, filtrarPorData, deletarAnotacao, atualizarAnotacao } =
    useHistoricoAnotacoes();

  const [filtroLivro, setFiltroLivro] = useState<string>('');
  const [termoBusca, setTermoBusca] = useState('');
  const [dataInicio, setDataInicio] = useState<Date | null>(null);
  const [dataFim, setDataFim] = useState<Date | null>(null);
  const [anotacoesFiltradas, setAnotacoesFiltradas] = useState<AnotacaoHistorico[]>(anotacoes);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [textoEdicao, setTextoEdicao] = useState('');
  const [modalVisivel, setModalVisivel] = useState(false);
  const [expandidosIds, setExpandidosIds] = useState<Set<string>>(new Set());
  const [modalDeletarVisivel, setModalDeletarVisivel] = useState(false);
  const [anotacaoParaDeletar, setAnotacaoParaDeletar] = useState<{ id: string; livro: string; capitulo: number } | null>(null);

  const livrosDisponiveis = obterLivrosComAnotacoes();

  // Aplicar filtros
  useEffect(() => {
    let resultado = anotacoes;

    // Filtro por livro
    if (filtroLivro) {
      resultado = resultado.filter((a) => a.livro === filtroLivro);
    }

    // Filtro por busca de texto
    if (termoBusca.trim()) {
      resultado = buscarPorTexto(termoBusca);
    }

    // Filtro por data
    if (dataInicio && dataFim) {
      resultado = resultado.filter((a) => {
        const dataAnotacao = new Date(a.dataAtualizacao);
        return dataAnotacao >= dataInicio && dataAnotacao <= dataFim;
      });
    }

    setAnotacoesFiltradas(resultado);
  }, [filtroLivro, termoBusca, dataInicio, dataFim, anotacoes]);

  const handleEditar = (anotacao: AnotacaoHistorico) => {
    setEditandoId(anotacao.id);
    setTextoEdicao(anotacao.texto);
    setModalVisivel(true);
  };

  const handleSalvarEdicao = async () => {
    if (!editandoId || !textoEdicao.trim()) {
      Alert.alert('Erro', 'O texto não pode estar vazio');
      return;
    }

    await atualizarAnotacao(editandoId, textoEdicao);
    setModalVisivel(false);
    setEditandoId(null);
    setTextoEdicao('');
  };

  const handleDeletar = (id: string, livro: string, capitulo: number) => {
    setAnotacaoParaDeletar({ id, livro, capitulo });
    setModalDeletarVisivel(true);
  };

  const handleCompartilhar = async (anotacao: AnotacaoHistorico) => {
    try {
      await Share.share({
        message: `📝 Minhas anotações sobre ${anotacao.livro} ${anotacao.capitulo}\n\n${anotacao.texto}\n\n— 2ª IEQ Rondonópolis - Devocional`,
        title: `Anotações - ${anotacao.livro} ${anotacao.capitulo}`,
      });
    } catch (err) {
      console.error('Erro ao compartilhar anotação:', err);
    }
  };

  const confirmarDelecao = async () => {
    if (anotacaoParaDeletar) {
      await deletarAnotacao(anotacaoParaDeletar.id);
      setModalDeletarVisivel(false);
      setAnotacaoParaDeletar(null);
    }
  };

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleExpandir = (id: string) => {
    const novoExpandidos = new Set(expandidosIds);
    if (novoExpandidos.has(id)) {
      novoExpandidos.delete(id);
    } else {
      novoExpandidos.add(id);
    }
    setExpandidosIds(novoExpandidos);
  };

  const renderAnotacao = ({ item }: { item: AnotacaoHistorico }) => {
    const estaExpandido = expandidosIds.has(item.id);
    return (
      <View className="bg-surface rounded-xl p-4 mb-3 border border-border">
        {/* Cabeçalho */}
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-base font-bold text-foreground">
            {item.livro} {item.capitulo}
          </Text>
          <Text className="text-xs text-muted">{formatarData(item.dataAtualizacao)}</Text>
        </View>

        {/* Texto da anotação */}
        <Text 
          className="text-sm text-foreground leading-relaxed mb-3" 
          numberOfLines={estaExpandido ? undefined : 3}
        >
          {item.texto}
        </Text>

        {/* Botão de expandir/recolher */}
        {item.texto.length > 100 && (
          <TouchableOpacity
            onPress={() => toggleExpandir(item.id)}
            className="mb-3 py-2"
          >
            <Text className="text-primary font-semibold text-sm">
              {estaExpandido ? '▲ Recolher' : '▼ Expandir'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Botões de ação */}
        <View className="flex-row gap-2">
          <TouchableOpacity
            className="flex-1 bg-primary/10 py-2 rounded-lg items-center"
            onPress={() => handleEditar(item)}
          >
            <Text className="text-primary font-semibold text-sm">✏️ Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-success/10 py-2 rounded-lg items-center"
            onPress={() => handleCompartilhar(item)}
          >
            <Text className="text-success font-semibold text-sm">📤 Compartilhar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-error/10 py-2 rounded-lg items-center"
            onPress={() => handleDeletar(item.id, item.livro, item.capitulo)}
          >
            <Text className="text-error font-semibold text-sm">🗑️ Deletar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View className="flex-1">
        {/* Cabeçalho */}
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-2xl font-bold text-foreground">Histórico de Anotações</Text>
            <Text className="text-sm text-muted">{anotacoesFiltradas.length} anotação(ções)</Text>
          </View>
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Text className="text-2xl">✕</Text>
          </TouchableOpacity>
        </View>

        {/* Busca */}
        <TextInput
          placeholder="🔍 Buscar anotações..."
          value={termoBusca}
          onChangeText={setTermoBusca}
          className="bg-surface border border-border rounded-lg px-4 py-2 text-foreground mb-4"
          placeholderTextColor={colors.muted}
        />

        {/* Filtro por Livro */}
        {livrosDisponiveis.length > 0 && (
          <View className="mb-4">
            <Text className="text-sm font-semibold text-foreground mb-2">Filtrar por Livro</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setFiltroLivro('')}
                className={`px-4 py-2 rounded-full ${
                  filtroLivro === '' ? 'bg-primary' : 'bg-surface border border-border'
                }`}
              >
                <Text className={filtroLivro === '' ? 'text-background font-semibold' : 'text-foreground'}>
                  Todos
                </Text>
              </TouchableOpacity>
              {livrosDisponiveis.map((livro) => (
                <TouchableOpacity
                  key={livro}
                  onPress={() => setFiltroLivro(livro)}
                  className={`px-4 py-2 rounded-full ${
                    filtroLivro === livro ? 'bg-primary' : 'bg-surface border border-border'
                  }`}
                >
                  <Text className={filtroLivro === livro ? 'text-background font-semibold' : 'text-foreground'}>
                    {livro}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Lista de Anotações */}
        {anotacoesFiltradas.length > 0 ? (
          <FlatList
            data={anotacoesFiltradas}
            renderItem={renderAnotacao}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={{ flexGrow: 1 }}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-muted text-center">
              Nenhuma anotação encontrada{'\n'}Comece a adicionar anotações no devocional
            </Text>
          </View>
        )}
      </View>

      {/* Modal de Edição */}
      <Modal visible={modalVisivel} transparent animationType="slide">
        <Pressable className="flex-1 bg-black/50 justify-end" onPress={() => {
          Keyboard.dismiss();
          setModalVisivel(false);
        }}>
          <Pressable onPress={(e) => e.stopPropagation()} className="bg-background rounded-t-3xl p-6 max-h-[80%]">
            <Text className="text-xl font-bold text-foreground mb-4">Editar Anotação</Text>
            <TextInput
              value={textoEdicao}
              onChangeText={setTextoEdicao}
              multiline
              numberOfLines={6}
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground mb-4"
              placeholderTextColor={colors.muted}
            />
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => {
                  Keyboard.dismiss();
                  setModalVisivel(false);
                }}
                className="flex-1 bg-surface border border-border rounded-lg py-3 items-center"
              >
                <Text className="text-foreground font-semibold">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSalvarEdicao}
                className="flex-1 bg-primary rounded-lg py-3 items-center"
              >
                <Text className="text-background font-semibold">Salvar</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal de Confirmação de Deleção */}
      <Modal visible={modalDeletarVisivel} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center p-4">
          <View className="bg-background rounded-2xl p-6 w-full max-w-sm">
            <Text className="text-xl font-bold text-foreground mb-2">Confirmar exclusão</Text>
            <Text className="text-sm text-muted mb-6">
              Tem certeza que deseja deletar a anotação de {anotacaoParaDeletar?.livro} {anotacaoParaDeletar?.capitulo}?
            </Text>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => {
                  setModalDeletarVisivel(false);
                  setAnotacaoParaDeletar(null);
                }}
                className="flex-1 bg-surface border border-border rounded-lg py-3 items-center"
              >
                <Text className="text-foreground font-semibold">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmarDelecao}
                className="flex-1 bg-error rounded-lg py-3 items-center"
              >
                <Text className="text-background font-semibold">Deletar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
