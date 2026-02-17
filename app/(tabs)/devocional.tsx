import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import { 
  getCapituloByIndex,
  sequenciaNovoTestamento 
} from "@/lib/data/sequencia-nt";
import { AnotacoesDevocionalBackend } from "@/components/anotacoes-devocional-backend";
import { useABibliaDigital } from "@/hooks/use-abibliadigital";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import * as Sharing from "expo-sharing";

export default function DevocionalScreen() {
  const colors = useColors();
  
  // Calcular índice correto para hoje (dias desde 1 de janeiro)
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const primeiroDeJaneiro = new Date(anoAtual, 0, 1);
  const umDia = 24 * 60 * 60 * 1000;
  const indiceHoje = Math.floor((hoje.getTime() - primeiroDeJaneiro.getTime()) / umDia);
  
  const [currentIndex, setCurrentIndex] = useState(Math.min(indiceHoje, sequenciaNovoTestamento.length - 1));
  const [readChapters, setReadChapters] = useState<Set<string>>(new Set());
  const [fontSize, setFontSize] = useState(16);
  const [versao, setVersao] = useState<"NAA" | "NVI">("NAA");
  const [mostrarAnotacoes, setMostrarAnotacoes] = useState(false);

  const capitulo = getCapituloByIndex(currentIndex);
  const isToday = currentIndex === indiceHoje;
  const chapterKey = `${capitulo.livro}-${capitulo.capitulo}`;
  const isRead = readChapters.has(chapterKey);

  // Usar hook da Bíblia Digital API
  const { 
    capitulo: textoCapitulo, 
    loading, 
    error,
    carregarCapitulo,
    sincronizar,
    sincronizando,
    progresso,
    estatisticas,
  } = useABibliaDigital({ versao, autoSincronizar: true });

  useEffect(() => {
    loadReadChapters();
    carregarCapitulo(capitulo.livro, capitulo.capitulo);
  }, [currentIndex, versao, capitulo.livro, capitulo.capitulo, carregarCapitulo]);

  const loadReadChapters = async () => {
    try {
      const stored = await AsyncStorage.getItem("@devocional_lidos");
      if (stored) {
        setReadChapters(new Set(JSON.parse(stored)));
      }
    } catch (err) {
      console.error("Erro ao carregar capítulos lidos:", err);
    }
  };

  const toggleRead = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const newReadChapters = new Set(readChapters);
      if (newReadChapters.has(chapterKey)) {
        newReadChapters.delete(chapterKey);
      } else {
        newReadChapters.add(chapterKey);
      }
      
      setReadChapters(newReadChapters);
      await AsyncStorage.setItem("@devocional_lidos", JSON.stringify(Array.from(newReadChapters)));
    } catch (err) {
      console.error("Erro ao salvar progresso:", err);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < sequenciaNovoTestamento.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleShare = async () => {
    try {
      if (!textoCapitulo) return;

      const versos = textoCapitulo.versos
        .map((v) => `${v.numero}. ${v.texto}`)
        .join("\n");

      const mensagem = `${capitulo.livro} ${capitulo.capitulo} (${versao})\n\n${versos}\n\nLeia no app 2iEQ Rondonópolis`;

      await Sharing.shareAsync(mensagem, {
        mimeType: "text/plain",
        dialogTitle: `Compartilhar ${capitulo.livro} ${capitulo.capitulo}`,
      });
    } catch (err) {
      console.error("Erro ao compartilhar:", err);
    }
  };

  const handleSincronizar = async () => {
    await sincronizar();
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          {/* Cabeçalho */}
          <View className="gap-2">
            <Text className="text-2xl font-bold text-foreground">Devocional do Dia</Text>
            <Text className="text-sm text-muted">
              Separe um tempo de qualidade, fazendo a leitura junto com sua apostila para melhor aproveitamento. Não se esqueça de orar e adorar enquanto demonstra sua devoção ao Senhor.
            </Text>
          </View>

          {/* Capítulo Atual */}
          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-foreground">
                {capitulo.livro} {capitulo.capitulo}
              </Text>
              {isToday && (
                <View className="bg-primary px-3 py-1 rounded-full">
                  <Text className="text-xs font-semibold text-background">Hoje</Text>
                </View>
              )}
            </View>

            {/* Seletor de Versão */}
            <View className="flex-row gap-2">
              {(["NAA", "NVI"] as const).map((v) => (
                <TouchableOpacity
                  key={v}
                  className="flex-1 py-2 rounded-lg items-center"
                  style={{
                    backgroundColor: versao === v ? colors.primary : colors.surface,
                  }}
                  onPress={() => setVersao(v)}
                >
                  <Text
                    className="font-semibold text-sm"
                    style={{ color: versao === v ? colors.background : colors.foreground }}
                  >
                    {v}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Texto do Capítulo */}
          <View className="bg-surface rounded-lg p-4 gap-3 min-h-64">
            {loading ? (
              <View className="items-center justify-center py-8">
                <ActivityIndicator size="large" color={colors.primary} />
                <Text className="text-muted mt-2">Carregando capítulo...</Text>
              </View>
            ) : error ? (
              <View className="items-center justify-center py-8">
                <Text className="text-error text-center">{error}</Text>
                <TouchableOpacity
                  className="mt-4 bg-primary px-4 py-2 rounded-lg"
                  onPress={() => carregarCapitulo(capitulo.livro, capitulo.capitulo)}
                >
                  <Text className="text-background font-semibold">Tentar Novamente</Text>
                </TouchableOpacity>
              </View>
            ) : textoCapitulo ? (
              <View className="gap-2">
                {textoCapitulo.versos.map((verso) => (
                  <View key={verso.numero} className="gap-1">
                    <Text
                      className="font-semibold"
                      style={{ fontSize: fontSize - 2, color: colors.primary }}
                    >
                      {verso.numero}
                    </Text>
                    <Text
                      className="text-foreground leading-relaxed"
                      style={{ fontSize }}
                    >
                      {verso.texto}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View className="items-center justify-center py-8">
                <Text className="text-muted">Capítulo não disponível offline</Text>
                <Text className="text-muted text-xs mt-2">
                  Sincronize os capítulos para ler offline
                </Text>
              </View>
            )}
          </View>

          {/* Ajuste de Fonte */}
          <View className="gap-2">
            <Text className="text-sm text-muted">Tamanho da Fonte</Text>
            <View className="flex-row items-center justify-between gap-2">
              <TouchableOpacity
                className="bg-surface px-4 py-2 rounded-lg"
                onPress={() => setFontSize(Math.max(12, fontSize - 2))}
              >
                <Text className="text-foreground font-semibold">-</Text>
              </TouchableOpacity>
              <Text className="text-foreground font-semibold flex-1 text-center">{fontSize}px</Text>
              <TouchableOpacity
                className="bg-surface px-4 py-2 rounded-lg"
                onPress={() => setFontSize(Math.min(24, fontSize + 2))}
              >
                <Text className="text-foreground font-semibold">+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Status de Sincronização */}
          {sincronizando && (
            <View className="bg-primary/10 p-3 rounded-lg gap-2">
              <View className="flex-row items-center gap-2">
                <ActivityIndicator size="small" color={colors.primary} />
                <Text className="text-primary font-semibold flex-1">
                  Sincronizando... {progresso.atual}/{progresso.total}
                </Text>
              </View>
              <View className="bg-border h-2 rounded-full overflow-hidden">
                <View
                  className="bg-primary h-full"
                  style={{
                    width: `${progresso.total > 0 ? (progresso.atual / progresso.total) * 100 : 0}%`,
                  }}
                />
              </View>
            </View>
          )}

          {/* Estatísticas de Cache */}
          <View className="bg-surface p-3 rounded-lg">
            <Text className="text-xs text-muted mb-2">
              Cache: {estatisticas.sincronizados}/{estatisticas.total} capítulos ({versao})
            </Text>
            {!sincronizando && estatisticas.sincronizados < estatisticas.total && (
              <TouchableOpacity
                className="bg-primary py-2 rounded-lg items-center"
                onPress={handleSincronizar}
              >
                <Text className="text-background font-semibold">
                  Sincronizar Novo Testamento
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Botão de Anotações */}
          <TouchableOpacity
            className="rounded-lg py-3 items-center"
            style={{ backgroundColor: mostrarAnotacoes ? colors.primary : colors.surface }}
            onPress={() => setMostrarAnotacoes(!mostrarAnotacoes)}
          >
            <Text
              className="font-semibold"
              style={{ color: mostrarAnotacoes ? colors.background : colors.primary }}
            >
              {mostrarAnotacoes ? "▼ Ocultar Anotações" : "▶ Minhas Anotações"}
            </Text>
          </TouchableOpacity>

          {mostrarAnotacoes && (
            <AnotacoesDevocionalBackend
              livro={capitulo.livro}
              capitulo={capitulo.capitulo}
            />
          )}

          {/* Botões de Ação */}
          <View className="gap-2">
            <TouchableOpacity
              className="rounded-full py-4 items-center"
              style={{ backgroundColor: isRead ? colors.success : colors.primary }}
              onPress={toggleRead}
            >
              <Text className="text-background font-semibold">
                {isRead ? "✓ Lido" : "Marcar como Lido"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="rounded-full py-4 items-center border-2"
              style={{ borderColor: colors.primary }}
              onPress={handleShare}
            >
              <Text className="text-primary font-semibold">Compartilhar</Text>
            </TouchableOpacity>
          </View>

          {/* Navegação */}
          <View className="flex-row gap-2">
            <TouchableOpacity
              className="flex-1 rounded-lg py-3 items-center"
              style={{
                backgroundColor: currentIndex > 0 ? colors.primary : colors.border,
              }}
              onPress={handlePrevious}
              disabled={currentIndex === 0}
            >
              <Text
                className="font-semibold"
                style={{
                  color: currentIndex > 0 ? colors.background : colors.muted,
                }}
              >
                ← Anterior
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 rounded-lg py-3 items-center"
              style={{
                backgroundColor:
                  currentIndex < sequenciaNovoTestamento.length - 1
                    ? colors.primary
                    : colors.border,
              }}
              onPress={handleNext}
              disabled={currentIndex === sequenciaNovoTestamento.length - 1}
            >
              <Text
                className="font-semibold"
                style={{
                  color:
                    currentIndex < sequenciaNovoTestamento.length - 1
                      ? colors.background
                      : colors.muted,
                }}
              >
                Próximo →
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
