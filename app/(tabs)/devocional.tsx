import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import { 
  getCapituloParaHoje, 
  getTotalCapitulos, 
  getCapituloByIndex,
  sequenciaNovoTestamento 
} from "@/lib/data/sequencia-nt";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

// Textos bíblicos simplificados (em produção, seria um banco de dados completo)
const textosBiblicos: Record<string, Record<number, string>> = {
  "Lucas": {
    4: `Então Jesus, cheio do Espírito Santo, voltou do Jordão e foi levado pelo Espírito ao deserto, onde foi tentado pelo diabo durante quarenta dias. Não comeu nada durante esses dias, e terminado esse período, teve fome.

O diabo lhe disse: "Se você é o Filho de Deus, ordene a esta pedra que se transforme em pão."

Jesus respondeu: "Está escrito: 'O homem não vive só de pão'."

O diabo o levou a um lugar alto e lhe mostrou num instante todos os reinos do mundo. E disse: "Darei a você todo este poder e toda a glória destes reinos, pois me foi entregue, e posso dá-lo a quem eu quiser. Portanto, se você me adorar, tudo será seu."

Jesus respondeu: "Está escrito: 'Adore o Senhor, o seu Deus, e só a ele preste culto'."

O diabo o levou a Jerusalém e o colocou no ponto mais alto do templo. Disse-lhe: "Se você é o Filho de Deus, jogue-se daqui para baixo. Pois está escrito: 'Ele ordenará aos seus anjos a seu respeito que o protejam; eles o sustentarão nas mãos, para que você não tropece em pedra alguma'."

Jesus respondeu: "Dito está: 'Não ponha à prova o Senhor, o seu Deus'."

Terminada toda essa tentação, o diabo se afastou dele até uma ocasião oportuna.

Jesus voltou para a Galileia no poder do Espírito, e notícias a seu respeito se espalharam por toda a região. Ele ensinava nas sinagogas, e todos o elogiavam.

Chegou a Nazaré, onde havia sido criado, e no sábado entrou na sinagoga, como era seu costume. Levantou-se para ler, e lhe foi entregue o livro do profeta Isaías. Desenrolando-o, encontrou o lugar onde estava escrito: "O Espírito do Senhor está sobre mim, porque me ungiu para pregar boas-novas aos pobres. Ele me enviou para proclamar liberdade aos presos e recuperação da vista aos cegos, para libertar os oprimidos e proclamar o ano da graça do Senhor."

Então Jesus enrolou o livro, devolveu-o ao atendente e sentou-se. Os olhos de todos na sinagoga estavam fixos nele, e ele começou dizendo-lhes: "Hoje se cumpriu a escritura que vocês acabam de ouvir."

Todos falavam bem dele e ficavam admirados com as palavras cheias de graça que saíam de sua boca. Diziam: "Não é este o filho de José?"

Jesus lhes disse: "Com certeza vocês me citarão este provérbio: 'Médico, cure-se a si mesmo! Faça aqui em sua terra tudo o que ouvimos que você fez em Cafarnaum'."

E acrescentou: "Digo-lhes a verdade: nenhum profeta é aceito em sua terra. Asseguro-lhes que havia muitas viúvas em Israel nos dias de Elias, quando o céu se fechou por três anos e meio, e houve grande fome em toda a terra. Mas Elias não foi enviado a nenhuma delas, mas sim a uma viúva em Sarepta, na região de Sidom. E havia muitos leprosos em Israel nos dias do profeta Eliseu, mas nenhum deles foi curado, a não ser Naamã, o sírio."

Todos na sinagoga ficaram furiosos ao ouvir isso. Levantaram-se, expulsaram-no da cidade e o levaram até ao cume da colina em que a cidade estava construída, a fim de o precipitar. Mas Jesus passou por entre eles e se afastou.

Então desceu para Cafarnaum, uma cidade da Galileia, e no sábado começou a ensinar o povo. Ficavam impressionados com o seu ensino, porque sua mensagem tinha autoridade.

Na sinagoga havia um homem possuído por um espírito imundo, um demônio. Gritou em alta voz: "Ei! Que temos com você, Jesus de Nazaré? Você veio para nos destruir? Sei quem você é: o Santo de Deus!"

"Cale-se!", repreendeu Jesus. "Saia dele!" Então o demônio o derrubou no meio da multidão e saiu dele sem lhe causar mal algum.

Todos ficaram assustados e diziam uns aos outros: "Que palavra é essa? Com autoridade e poder ele ordena aos espíritos imundos, e eles saem!" E a notícia a seu respeito se espalhava por toda a região.

Jesus saiu da sinagoga e entrou na casa de Simão. A sogra de Simão estava com febre alta, e pediram a Jesus que a ajudasse. Inclinou-se sobre ela e repreendeu a febre, e a febre a deixou. Ela se levantou imediatamente e começou a servi-los.

Ao pôr do sol, o povo levou a Jesus todos os doentes de várias doenças, e ele colocou as mãos sobre cada um deles e os curou. Demônios também saíram de muitos, gritando: "Você é o Filho de Deus!" Mas Jesus os repreendeu e não permitiu que falassem, porque sabiam que ele era o Cristo.

Ao amanhecer, Jesus saiu e foi para um lugar deserto. O povo o procurava e, quando o encontrou, tentou impedi-lo de partir. Mas Jesus lhes disse: "É preciso que eu pregue as boas-novas do reino de Deus também às outras cidades, pois para isso fui enviado." E pregava nas sinagogas da Judeia.`
  }
};

export default function DevocionalScreen() {
  const colors = useColors();
  const capituloHoje = getCapituloParaHoje();
  const totalCapitulos = getTotalCapitulos();
  
  // Calcular indice correto para hoje (dias desde 1 de janeiro)
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const primeiroDeJaneiro = new Date(anoAtual, 0, 1);
  const umDia = 24 * 60 * 60 * 1000;
  const indiceHoje = Math.floor((hoje.getTime() - primeiroDeJaneiro.getTime()) / umDia);
  
  const [currentIndex, setCurrentIndex] = useState(Math.min(indiceHoje, sequenciaNovoTestamento.length - 1));
  const [readChapters, setReadChapters] = useState<Set<string>>(new Set());
  const [fontSize, setFontSize] = useState(16);
  const [versao, setVersao] = useState<"NAA" | "NVI">("NAA");

  const capitulo = getCapituloByIndex(currentIndex);
  const isToday = currentIndex === indiceHoje;
  const chapterKey = `${capitulo.livro}-${capitulo.capitulo}`;
  const isRead = readChapters.has(chapterKey);

  useEffect(() => {
    loadReadChapters();
  }, []);

  const loadReadChapters = async () => {
    try {
      const saved = await AsyncStorage.getItem("@devocional_lidos");
      if (saved) {
        setReadChapters(new Set(JSON.parse(saved)));
      }
    } catch (error) {
      console.error("Error loading read chapters:", error);
    }
  };

  const toggleRead = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const newReadChapters = new Set(readChapters);
    if (isRead) {
      newReadChapters.delete(chapterKey);
    } else {
      newReadChapters.add(chapterKey);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }

    setReadChapters(newReadChapters);

    try {
      await AsyncStorage.setItem(
        "@devocional_lidos",
        JSON.stringify(Array.from(newReadChapters))
      );
    } catch (error) {
      console.error("Error saving read chapters:", error);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < sequenciaNovoTestamento.length - 1) {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setCurrentIndex(currentIndex + 1);
    }
  };

  const progressPercent = Math.round(((currentIndex + 1) / totalCapitulos) * 100);
  const textoCapitulo = textosBiblicos[capitulo.livro]?.[capitulo.capitulo] || 
    `${capitulo.livro} ${capitulo.capitulo}\n\n[Texto bíblico completo será carregado aqui]`;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 100 }}>
        {/* Header */}
        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-3xl font-bold text-foreground">Devocional</Text>
            {isToday && (
              <View className="bg-success/20 px-3 py-1 rounded-full">
                <Text className="text-xs font-semibold text-success">Hoje</Text>
              </View>
            )}
          </View>
          <Text className="text-base text-muted">
            {capitulo.livro} {capitulo.capitulo}
          </Text>
        </View>

        {/* Progress Bar */}
        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-muted">Progresso</Text>
            <Text className="text-sm font-bold text-primary">{progressPercent}%</Text>
          </View>
          <View className="h-2 bg-surface rounded-full overflow-hidden">
            <View
              className="h-full bg-primary rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </View>
          <Text className="text-xs text-muted">
            Capítulo {currentIndex + 1} de {totalCapitulos}
          </Text>
        </View>

        {/* Controles de Fonte e Versão */}
        <View className="gap-3">
          <View className="flex-row items-center justify-between gap-2">
            <TouchableOpacity
              className="flex-1 bg-surface rounded-lg p-2 items-center"
              onPress={() => setFontSize(Math.max(12, fontSize - 2))}
            >
              <Text className="text-sm font-semibold text-foreground">A-</Text>
            </TouchableOpacity>
            <Text className="text-sm text-muted">{fontSize}px</Text>
            <TouchableOpacity
              className="flex-1 bg-surface rounded-lg p-2 items-center"
              onPress={() => setFontSize(Math.min(24, fontSize + 2))}
            >
              <Text className="text-sm font-semibold text-foreground">A+</Text>
            </TouchableOpacity>
          </View>

          {/* Seletor de Versão */}
          <View className="flex-row gap-2">
            <TouchableOpacity
              className="flex-1 rounded-lg p-3 items-center border-2"
              style={{
                backgroundColor: versao === "NAA" ? colors.primary : colors.surface,
                borderColor: versao === "NAA" ? colors.primary : colors.border,
              }}
              onPress={() => setVersao("NAA")}
            >
              <Text
                className="font-semibold text-sm"
                style={{ color: versao === "NAA" ? "#FFFFFF" : colors.foreground }}
              >
                NAA
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 rounded-lg p-3 items-center border-2"
              style={{
                backgroundColor: versao === "NVI" ? colors.primary : colors.surface,
                borderColor: versao === "NVI" ? colors.primary : colors.border,
              }}
              onPress={() => setVersao("NVI")}
            >
              <Text
                className="font-semibold text-sm"
                style={{ color: versao === "NVI" ? "#FFFFFF" : colors.foreground }}
              >
                NVI
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info de Versão */}
        <View className="bg-primary/10 rounded-xl p-3 gap-1 border border-primary/20">
          <Text className="text-xs font-semibold text-foreground">
            Versão: {versao === "NAA" ? "Nova Almeida Atualizada" : "Nova Versão Internacional"}
          </Text>
          <Text className="text-xs text-muted">
            Leitura offline disponível
          </Text>
        </View>

        {/* Texto do Capítulo */}
        <View className="bg-surface rounded-2xl p-6 gap-4 border border-border">
          <Text
            className="text-foreground leading-relaxed"
            style={{ fontSize }}
          >
            {textoCapitulo}
          </Text>
          <View className="pt-4 border-t border-border gap-2">
            <Text className="text-xs text-muted">
              Fonte: Bíblia {versao}
            </Text>
            <Text className="text-xs text-muted">
              Lido offline • Sem necessidade de internet
            </Text>
          </View>
        </View>

        {/* Botões de Ação */}
        <View className="gap-2">
          <TouchableOpacity
            className="rounded-full py-4 items-center"
            style={{ backgroundColor: isRead ? colors.success : colors.primary }}
            onPress={toggleRead}
          >
            <Text className="text-white font-bold text-base">
              {isRead ? "✓ Lido Hoje" : "Marcar como Lido"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="rounded-full py-3 items-center border-2"
            style={{ borderColor: colors.primary }}
          >
            <Text className="font-semibold text-base" style={{ color: colors.primary }}>
              📄 Compartilhar Versículo
            </Text>
          </TouchableOpacity>
        </View>

        {/* Navegação */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            className="flex-1 rounded-full py-3 items-center border-2"
            style={{
              borderColor: currentIndex > 0 ? colors.primary : colors.border,
              backgroundColor: currentIndex > 0 ? colors.surface : colors.background,
            }}
            onPress={goToPrevious}
            disabled={currentIndex === 0}
          >
            <Text
              className="font-semibold text-base"
              style={{ color: currentIndex > 0 ? colors.primary : colors.muted }}
            >
              ← Anterior
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 rounded-full py-3 items-center border-2"
            style={{
              borderColor: currentIndex < sequenciaNovoTestamento.length - 1 ? colors.primary : colors.border,
              backgroundColor: currentIndex < sequenciaNovoTestamento.length - 1 ? colors.surface : colors.background,
            }}
            onPress={goToNext}
            disabled={currentIndex === sequenciaNovoTestamento.length - 1}
          >
            <Text
              className="font-semibold text-base"
              style={{ color: currentIndex < sequenciaNovoTestamento.length - 1 ? colors.primary : colors.muted }}
            >
              Próximo →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Estatísticas */}
        <View className="bg-primary/10 rounded-2xl p-5 gap-3 border border-primary/20">
          <Text className="text-sm font-semibold text-foreground">
            📊 Seu Progresso
          </Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-2xl font-bold text-primary">{readChapters.size}</Text>
              <Text className="text-xs text-muted">Capítulos Lidos</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-primary">{totalCapitulos - readChapters.size}</Text>
              <Text className="text-xs text-muted">Restantes</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-primary">{progressPercent}%</Text>
              <Text className="text-xs text-muted">Completo</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
