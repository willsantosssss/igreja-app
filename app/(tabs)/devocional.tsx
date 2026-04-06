import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useDevocionaiProgressivo } from '@/hooks/use-devocional-progressivo';
import { sequenciaNovoTestamento } from '@/lib/data/sequencia-nt';
import { Share } from 'react-native';

export default function DevocionaiScreen() {
  const colors = useColors();
  const router = useRouter();
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

  // Salvar anotação automaticamente
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

  // Compartilhar texto bíblico
  const compartilharTexto = async () => {
    if (!capitulo) return;

    try {
      const texto = capitulo.versos.map((v) => `${v.numero}. ${v.texto}`).join('\n\n');

      await Share.share({
        message: `📖 ${capitulo.livro} ${capitulo.numero} (${capitulo.versao})\n\n${texto}\n\n— 2ª IEQ Rondonópolis`,
        title: `${capitulo.livro} ${capitulo.numero}`,
      });
    } catch (err) {
      console.error('Erro ao compartilhar:', err);
    }
  };

  // Compartilhar anotações
  const compartilharAnotacao = async () => {
    if (!capitulo || !anotacao.trim()) {
      Alert.alert('Atenção', 'Escreva uma anotação antes de compartilhar.');
      return;
    }

    try {
      await Share.share({
        message: `📝 Minhas anotações sobre ${capitulo.livro} ${capitulo.numero}\n\n${anotacao}\n\n— 2ª IEQ Rondonópolis - Devocional`,
        title: `Anotações - ${capitulo.livro} ${capitulo.numero}`,
      });
    } catch (err) {
      console.error('Erro ao compartilhar anotação:', err);
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
    <ScreenContainer>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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

          {/* Texto do Capítulo — exibido completamente */}
          {error ? (
            <View className="bg-error/10 p-4 rounded-lg mb-4">
              <Text className="text-error font-semibold">{error}</Text>
              <TouchableOpacity
                className="mt-3 bg-primary py-2 rounded-lg items-center"
                onPress={carregarCapituloDoDia}
              >
                <Text className="text-background font-semibold">Tentar Novamente</Text>
              </TouchableOpacity>
            </View>
          ) : capitulo ? (
            <View className="bg-surface p-4 rounded-xl mb-4" style={{ minHeight: 200 }}>
              <Text className="text-lg font-bold text-foreground mb-3">
                {capitulo.livro} {capitulo.numero}
              </Text>
              {capitulo.versos.map((verso) => (
                <Text
                  key={verso.numero}
                  className="text-foreground mb-2"
                  style={{ fontSize, lineHeight: fontSize * 1.6 }}
                  selectable
                >
                  <Text className="font-bold text-primary" style={{ fontSize: fontSize - 2 }}>
                    {verso.numero}{' '}
                  </Text>
                  {verso.texto}
                </Text>
              ))}
            </View>
          ) : null}

          {/* Botões de Ação */}
          <View className="gap-2 mb-4">
            <TouchableOpacity
              className={`py-3 rounded-xl items-center ${isRead ? 'bg-success' : 'bg-primary'}`}
              onPress={marcarComoLido}
            >
              <Text className="text-background font-semibold">
                {isRead ? '✓ Lido' : 'Marcar como Lido'}
              </Text>
            </TouchableOpacity>

            <View className="flex-row gap-2">
              <TouchableOpacity
                className="flex-1 bg-surface py-3 rounded-xl items-center border border-border"
                onPress={compartilharTexto}
              >
                <Text className="text-foreground font-semibold">📤 Compartilhar Texto</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-1 py-3 rounded-xl items-center ${mostrarAnotacoes ? 'bg-primary' : 'bg-surface border border-border'}`}
                onPress={() => setMostrarAnotacoes(!mostrarAnotacoes)}
              >
                <Text className={mostrarAnotacoes ? 'text-background font-semibold' : 'text-foreground font-semibold'}>
                  📝 Anotações
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="bg-surface py-3 rounded-xl items-center border border-border"
              onPress={() => router.push('/historico-anotacoes')}
            >
              <Text className="text-foreground font-semibold">📚 Ver Histórico de Anotações</Text>
            </TouchableOpacity>
          </View>

          {/* Seção de Anotações — funcional com TextInput */}
          {mostrarAnotacoes && (
            <View className="bg-surface p-4 rounded-xl gap-3 border border-border mb-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-bold text-foreground">Minhas Anotações</Text>
                {anotacao.trim() ? (
                  <TouchableOpacity
                    onPress={compartilharAnotacao}
                    style={{
                      backgroundColor: colors.primary + '15',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>
                      📤 Compartilhar
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              <Text className="text-xs text-muted">
                {capitulo ? `Anotações para ${capitulo.livro} ${capitulo.numero}` : 'Selecione um capítulo'}
              </Text>

              <TextInput
                className="border rounded-xl p-3 text-foreground"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                  fontSize: 14,
                  lineHeight: 22,
                  minHeight: 120,
                  textAlignVertical: 'top',
                }}
                placeholder="Escreva aqui sua reflexão, versículos que te marcaram, aplicações para o dia..."
                placeholderTextColor={colors.muted}
                value={anotacao}
                onChangeText={salvarAnotacao}
                multiline
                numberOfLines={6}
                returnKeyType="default"
              />

              {anotacao.trim() ? (
                <View className="flex-row items-center gap-2">
                  <View
                    style={{
                      backgroundColor: colors.success + '15',
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 6,
                    }}
                  >
                    <Text style={{ color: colors.success, fontSize: 11, fontWeight: '600' }}>
                      ✓ Salvo automaticamente
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert(
                        'Limpar Anotação',
                        'Deseja apagar esta anotação?',
                        [
                          { text: 'Cancelar' },
                          {
                            text: 'Apagar',
                            style: 'destructive',
                            onPress: () => salvarAnotacao(''),
                          },
                        ]
                      );
                    }}
                  >
                    <Text style={{ color: colors.error, fontSize: 11, fontWeight: '600' }}>
                      Limpar
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          )}

          {/* Progresso */}
          <View className="bg-surface p-3 rounded-xl">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-xs text-muted">Progresso de Leitura</Text>
              <Text className="text-xs font-semibold text-primary">
                {readChapters.size}/{sequenciaNovoTestamento.length} capítulos
              </Text>
            </View>
            <View className="bg-border rounded-full h-2 overflow-hidden">
              <View
                className="bg-primary h-2 rounded-full"
                style={{
                  width: `${Math.min(100, (readChapters.size / sequenciaNovoTestamento.length) * 100)}%`,
                }}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
