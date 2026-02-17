import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { useAnotacoesBackend } from '@/hooks/use-anotacoes-backend';
import * as Sharing from 'expo-sharing';
import { cn } from '@/lib/utils';

interface AnotacoesDevocionalBackendProps {
  livro: string;
  capitulo: number;
}

export function AnotacoesDevocionalBackend({ livro, capitulo }: AnotacoesDevocionalBackendProps) {
  const colors = useColors();
  const {
    adicionarAnotacao,
    atualizarAnotacao,
    deletarAnotacao,
    obterAnotacoesCapitulo,
    isSyncing,
    isLoading,
    error,
  } = useAnotacoesBackend();

  const [novaAnotacao, setNovaAnotacao] = useState('');
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [textoEdicao, setTextoEdicao] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const anotacoes = obterAnotacoesCapitulo(livro, capitulo);

  const handleAdicionarAnotacao = async () => {
    if (!novaAnotacao.trim()) {
      Alert.alert('Erro', 'Digite uma anotação antes de salvar');
      return;
    }

    try {
      await adicionarAnotacao(livro, capitulo, novaAnotacao);
      setNovaAnotacao('');
      setMostrarFormulario(false);
      Alert.alert('Sucesso', 'Anotação adicionada');
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível salvar a anotação');
    }
  };

  const handleAtualizarAnotacao = async (id: number) => {
    if (!textoEdicao.trim()) {
      Alert.alert('Erro', 'Digite uma anotação antes de salvar');
      return;
    }

    try {
      await atualizarAnotacao(id, textoEdicao);
      setEditandoId(null);
      setTextoEdicao('');
      Alert.alert('Sucesso', 'Anotação atualizada');
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível atualizar a anotação');
    }
  };

  const handleDeletarAnotacao = (id: number) => {
    Alert.alert('Deletar anotação', 'Tem certeza que deseja deletar esta anotação?', [
      { text: 'Cancelar', onPress: () => {} },
      {
        text: 'Deletar',
        onPress: async () => {
          try {
            await deletarAnotacao(id);
            Alert.alert('Sucesso', 'Anotação deletada');
          } catch (err) {
            Alert.alert('Erro', 'Não foi possível deletar a anotação');
          }
        },
      },
    ]);
  };

  const handleCompartilharAnotacoes = async () => {
    try {
      const texto = anotacoes
        .map(
          (a) =>
            `${livro} ${capitulo}\n${a.texto}\n\n(${new Date(a.updatedAt).toLocaleDateString('pt-BR')})`
        )
        .join('\n\n---\n\n');

      if (Platform.OS === 'web') {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          await navigator.clipboard.writeText(texto);
          Alert.alert('Sucesso', 'Anotações copiadas para a área de transferência');
        }
      } else {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync('');
        }
      }
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível compartilhar as anotações');
    }
  };

  const iniciarEdicao = (id: number, texto: string) => {
    setEditandoId(id);
    setTextoEdicao(texto);
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setTextoEdicao('');
  };

  if (isLoading) {
    return (
      <View className="gap-4 items-center justify-center py-8">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-sm text-muted">Carregando anotações...</Text>
      </View>
    );
  }

  return (
    <View className="gap-4">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-bold text-foreground">📝 Minhas Anotações</Text>
        <View className="flex-row items-center gap-2">
          {isSyncing && (
            <View className="flex-row items-center gap-1 bg-primary/10 px-2 py-1 rounded-full">
              <ActivityIndicator size="small" color={colors.primary} />
              <Text className="text-xs text-primary font-semibold">Sincronizando...</Text>
            </View>
          )}
          {anotacoes.length > 0 && (
            <View className="rounded-full bg-primary px-3 py-1">
              <Text className="text-xs font-semibold text-background">{anotacoes.length}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Mensagem de erro */}
      {error && (
        <View className="rounded-lg bg-error/10 border border-error p-3">
          <Text className="text-sm text-error">{error}</Text>
        </View>
      )}

      {/* Formulário de Nova Anotação */}
      {mostrarFormulario && (
        <View className="gap-3 rounded-lg bg-surface p-4 border border-border">
          <Text className="font-semibold text-foreground">Nova Anotação</Text>
          <TextInput
            placeholder="Digite sua reflexão sobre este capítulo..."
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={4}
            value={novaAnotacao}
            onChangeText={setNovaAnotacao}
            className="rounded-lg bg-background p-3 text-foreground"
            style={{ borderWidth: 1, borderColor: colors.border }}
          />
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={handleAdicionarAnotacao}
              disabled={isSyncing}
              className="flex-1 rounded-lg bg-primary py-2 px-4 items-center"
            >
              <Text className="font-semibold text-background">Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setMostrarFormulario(false);
                setNovaAnotacao('');
              }}
              className="flex-1 rounded-lg bg-surface border border-border py-2 px-4 items-center"
            >
              <Text className="font-semibold text-foreground">Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Botão Adicionar Anotação */}
      {!mostrarFormulario && (
        <TouchableOpacity
          onPress={() => setMostrarFormulario(true)}
          disabled={isSyncing}
          className="rounded-lg bg-primary/10 border border-primary py-3 px-4 items-center"
        >
          <Text className="font-semibold text-primary">+ Adicionar Anotação</Text>
        </TouchableOpacity>
      )}

      {/* Lista de Anotações */}
      {anotacoes.length > 0 ? (
        <ScrollView className="gap-3 max-h-96">
          {anotacoes.map((anotacao) => (
            <View key={anotacao.id} className="gap-2 rounded-lg bg-surface p-4 border border-border">
              {editandoId === anotacao.id ? (
                // Modo Edição
                <>
                  <TextInput
                    placeholder="Edite sua anotação..."
                    placeholderTextColor={colors.muted}
                    multiline
                    numberOfLines={3}
                    value={textoEdicao}
                    onChangeText={setTextoEdicao}
                    className="rounded-lg bg-background p-3 text-foreground"
                    style={{ borderWidth: 1, borderColor: colors.border }}
                  />
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => handleAtualizarAnotacao(anotacao.id)}
                      disabled={isSyncing}
                      className="flex-1 rounded-lg bg-success py-2 px-3 items-center"
                    >
                      <Text className="font-semibold text-background text-sm">Salvar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={cancelarEdicao}
                      className="flex-1 rounded-lg bg-surface border border-border py-2 px-3 items-center"
                    >
                      <Text className="font-semibold text-foreground text-sm">Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                // Modo Visualização
                <>
                  <Text className="text-sm text-foreground leading-relaxed">{anotacao.texto}</Text>
                  <Text className="text-xs text-muted">
                    {new Date(anotacao.updatedAt).toLocaleDateString('pt-BR')}
                  </Text>
                  <View className="flex-row gap-2 pt-2">
                    <TouchableOpacity
                      onPress={() => iniciarEdicao(anotacao.id, anotacao.texto)}
                      disabled={isSyncing}
                      className="flex-1 rounded-lg bg-primary/10 border border-primary py-2 px-3 items-center"
                    >
                      <Text className="font-semibold text-primary text-sm">Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeletarAnotacao(anotacao.id)}
                      disabled={isSyncing}
                      className="flex-1 rounded-lg bg-error/10 border border-error py-2 px-3 items-center"
                    >
                      <Text className="font-semibold text-error text-sm">Deletar</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          ))}
        </ScrollView>
      ) : !mostrarFormulario ? (
        <View className="rounded-lg bg-surface p-4 items-center border border-border">
          <Text className="text-sm text-muted">Nenhuma anotação ainda</Text>
          <Text className="text-xs text-muted mt-1">
            Adicione suas reflexões sobre este capítulo
          </Text>
        </View>
      ) : null}

      {/* Botão Compartilhar */}
      {anotacoes.length > 0 && (
        <TouchableOpacity
          onPress={handleCompartilharAnotacoes}
          disabled={isSyncing}
          className="rounded-lg bg-surface border border-border py-3 px-4 items-center"
        >
          <Text className="font-semibold text-foreground">📤 Compartilhar Anotações</Text>
        </TouchableOpacity>
      )}

      {/* Indicador de sincronização */}
      {isSyncing && (
        <View className="rounded-lg bg-primary/10 border border-primary p-3 items-center">
          <Text className="text-xs text-primary font-semibold">
            Sincronizando com servidor...
          </Text>
        </View>
      )}
    </View>
  );
}
