import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useDevocionaiProgressivo } from '@/hooks/use-devocional-progressivo';
import { sequenciaNovoTestamento } from '@/lib/data/sequencia-nt';
import { Share } from 'react-native';

export default function DevocionaiScreen() {
  const colors = useColors();
  const [versao, setVersao] = useState<'NAA' | 'NVI'>('NAA');
  const [fontSize, setFontSize] = useState(16);
  const [mostrarAnotacoes, setMostrarAnotacoes] = useState(false);
  const [anotacao, setAnotacao] = useState('');
  const [readChapters, setReadChapters] = useState(new Set<string>());

  const { capitulo, loading, error, estatisticas, carregarCapituloDoDia } =
    useDevocionaiProgressivo(versao);

  // Calcular índice do dia
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const primeiroDeJaneiro = new Date(anoAtual, 0, 1);
  const umDia = 24 * 60 * 60 * 1000;
  const indiceHoje = Math.floor((hoje.getTime() - primeiroDeJaneiro.getTime()) / umDia);
  const indexeCorreto = Math.min(indiceHoje, sequenciaNovoTestamento.length - 1);

  const chapterKey = capitulo ? `${capitulo.livro}-${capitulo.numero}` : '';
  const isRead = readChapters.has(chapterKey);

  // Carregar capítulos lidos
  const loadReadChapters = async () => {
    try {
      const stored = await AsyncStorage.getItem('@devocional_lidos');
      if (stored) {
        setReadChapters(new Set(JSON.parse(stored)));
      }
    } catch (err) {
      console.error('Erro ao carregar capítulos lidos:', err);
    }
  };

  // Marcar como lido
  const marcarComoLido = async () => {
    if (!chapterKey) return;

    const newSet = new Set(readChapters);
    newSet.add(chapterKey);
    setReadChapters(newSet);

    try {
      await AsyncStorage.setItem('@devocional_lidos', JSON.stringify(Array.from(newSet)));
    } catch (err) {
      console.error('Erro ao salvar capítulo lido:', err);
    }
  };

  // Carregar anotação
  const loadAnotacao = async () => {
    if (!chapterKey) return;

    try {
      const stored = await AsyncStorage.getItem(`@anotacao_${chapterKey}`);
      if (stored) {
        setAnotacao(stored);
      } else {
        setAnotacao('');
      }
    } catch (err) {
      console.error('Erro ao carregar anotação:', err);
    }
  };

  // Salvar anotação
  const salvarAnotacao = async (texto: string) => {
    if (!chapterKey) return;

    setAnotacao(texto);

    try {
      if (texto.trim()) {
        await AsyncStorage.setItem(`@anotacao_${chapterKey}`, texto);
      } else {
        await AsyncStorage.removeItem(`@anotacao_${chapterKey}`);
      }
    } catch (err) {
      console.error('Erro ao salvar anotação:', err);
    }
  };

  // Compartilhar
  const compartilhar = async () => {
    if (!capitulo) return;

    try {
      const texto = capitulo.versos.map((v) => `${v.numero}. ${v.texto}`).join('\n\n');

      await Share.share({
        message: `${capitulo.livro} ${capitulo.numero}\n\n${texto}\n\n2iEQ Rondonópolis - Devocional ${capitulo.versao}`,
        title: `${capitulo.livro} ${capitulo.numero}`,
      });
    } catch (err) {
      console.error('Erro ao compartilhar:', err);
    }
  };

  // Efeitos
  useEffect(() => {
    loadReadChapters();
  }, []);

  useEffect(() => {
    loadAnotacao();
  }, [chapterKey]);

  useEffect(() => {
    carregarCapituloDoDia();
  }, [versao]);

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-muted mt-4">Carregando devocional...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* Cabeçalho */}
        <View className="gap-2 mb-4">
          <Text className="text-2xl font-bold text-foreground">Devocional do Dia</Text>
          <Text className="text-sm text-muted">
            {capitulo ? `${capitulo.livro} ${capitulo.numero}` : 'Carregando...'}
          </Text>
        </View>

        {/* Subtítulo */}
        <View className="bg-primary/10 p-3 rounded-lg mb-4">
          <Text className="text-xs text-primary leading-relaxed">
            Separe um tempo de qualidade, fazendo a leitura junto com sua apostila para melhor
            aproveitamento. Não se esqueça de orar e adorar enquanto demonstra sua devoção ao
            Senhor.
          </Text>
        </View>

        {/* Versão e Tamanho de Fonte */}
        <View className="flex-row gap-2 mb-4">
          <View className="flex-1 flex-row gap-2">
            {(['NAA', 'NVI'] as const).map((v) => (
              <TouchableOpacity
                key={v}
                className={`flex-1 py-2 rounded-lg items-center ${
                  versao === v ? 'bg-primary' : 'bg-surface'
                }`}
                onPress={() => setVersao(v)}
              >
                <Text className={versao === v ? 'text-background font-semibold' : 'text-foreground'}>
                  {v}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            className="bg-surface px-3 py-2 rounded-lg"
            onPress={() => setFontSize(Math.max(12, fontSize - 2))}
          >
            <Text className="text-foreground font-semibold">A-</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-surface px-3 py-2 rounded-lg"
            onPress={() => setFontSize(Math.min(24, fontSize + 2))}
          >
            <Text className="text-foreground font-semibold">A+</Text>
          </TouchableOpacity>
        </View>

        {/* Texto do Capítulo */}
        {error ? (
          <View className="bg-error/10 p-4 rounded-lg mb-4">
            <Text className="text-error font-semibold">{error}</Text>
          </View>
        ) : capitulo ? (
          <View className="bg-surface p-4 rounded-lg mb-4">
            {capitulo.versos.map((verso) => (
              <Text
                key={verso.numero}
                className="text-foreground mb-3 leading-relaxed"
                style={{ fontSize }}
              >
                <Text className="font-bold text-primary">{verso.numero}</Text> {verso.texto}
              </Text>
            ))}
          </View>
        ) : null}

        {/* Cache Info */}
        <View className="bg-surface p-3 rounded-lg mb-4">
          <Text className="text-xs text-muted mb-2">
            Cache: {estatisticas.capitulosCacheados} capítulos carregados
          </Text>
          {estatisticas.ultimoCapituloCarregado && (
            <Text className="text-xs text-muted">
              Último: {estatisticas.ultimoCapituloCarregado}
            </Text>
          )}
        </View>

        {/* Botões de Ação */}
        <View className="gap-2 mb-4">
          <TouchableOpacity
            className={`py-3 rounded-lg items-center ${isRead ? 'bg-success' : 'bg-primary'}`}
            onPress={marcarComoLido}
          >
            <Text className="text-background font-semibold">
              {isRead ? '✓ Lido' : 'Marcar como Lido'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-primary py-3 rounded-lg items-center" onPress={compartilhar}>
            <Text className="text-background font-semibold">Compartilhar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`py-3 rounded-lg items-center ${mostrarAnotacoes ? 'bg-primary' : 'bg-surface'}`}
            onPress={() => setMostrarAnotacoes(!mostrarAnotacoes)}
          >
            <Text className={mostrarAnotacoes ? 'text-background font-semibold' : 'text-foreground'}>
              📝 Anotações
            </Text>
          </TouchableOpacity>
        </View>

        {/* Anotações */}
        {mostrarAnotacoes && (
          <View className="bg-surface p-4 rounded-lg">
            <Text className="text-sm font-semibold text-foreground mb-2">Minhas Anotações</Text>
            <View
              className="border border-border rounded-lg p-3 min-h-24"
              style={{
                backgroundColor: colors.background,
              }}
            >
              <Text
                className="text-foreground"
                style={{ fontSize: 14 }}
                selectable
              >
                {anotacao || 'Clique para adicionar sua reflexão...'}
              </Text>
            </View>
            <TouchableOpacity
              className="mt-2 bg-primary py-2 rounded-lg items-center"
              onPress={() => {
                // Aqui você poderia abrir um modal de edição
                // Por enquanto, apenas mostra a anotação
              }}
            >
              <Text className="text-background font-semibold">Editar Anotação</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
