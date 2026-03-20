import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useLocalSearchParams, router } from "expo-router";
import { categoryLabels, categoryColors, type Event } from "@/lib/data/events";
import { eventoPermiteInscricao, criarInscricao, verificarInscricao } from "@/lib/data/inscricoes-eventos";
import * as Haptics from "expo-haptics";
import { Platform, FlatList, ScrollView, View, Text, TouchableOpacity, TextInput, Alert, Linking } from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCelulas, type Celula } from "@/lib/data/celulas";
import { trpc } from "@/lib/trpc";

export default function EventDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [jaInscrito, setJaInscrito] = useState(false);
  const [nome, setNome] = useState("");
  const [celula, setCelula] = useState("");
  const [telefone, setTelefone] = useState("");

  const [mostrarSeletorCelulas, setMostrarSeletorCelulas] = useState(false);

  const { data: celulasList = [], isLoading: carregandoCelulas } = useCelulas();
  const celulas = celulasList.filter((c: any) => c && c.nome && c.lider && c.horario);

  // Usar hook tRPC para buscar evento
  const eventoId = typeof id === 'string' && !isNaN(Number(id)) ? Number(id) : null;
  // @ts-expect-error - Endpoint existe mas tipos não foram regenerados
  const { data: eventoData, isLoading: carregandoEvento } = trpc.eventos.getById.useQuery(
    eventoId || 0,
    { enabled: eventoId !== null }
  );

  // Hook para criar inscrição no banco de dados
  // @ts-expect-error - Endpoint foi adicionado mas tipos não foram regenerados
  const criarInscricaoMutation = trpc.inscricoesEventos.create.useMutation();

  useEffect(() => {
    if (eventoData) {
      // Adaptar formato do banco para formato do app
      const eventoFormatado: Event = {
        id: eventoData.id.toString(),
        title: eventoData.titulo,
        description: eventoData.descricao,
        date: eventoData.data,
        time: eventoData.horario,
        location: eventoData.local,
        category: eventoData.tipo as any,
      };
      setEvent(eventoFormatado);
      setCarregando(false);
    } else if (!carregandoEvento && eventoId !== null) {
      setCarregando(false);
    }
  }, [eventoData, carregandoEvento, eventoId]);

  useEffect(() => {
    carregarDadosUsuario();
  }, [id]);

  const carregarDadosUsuario = async () => {
    try {
      const dadosUsuarios = await AsyncStorage.getItem("@usuarios_login");
      if (dadosUsuarios) {
        const lista = JSON.parse(dadosUsuarios);
        if (lista.length > 0) {
          const ultimo = lista[lista.length - 1];
          setNome(ultimo.nome || "");
          setCelula(ultimo.celula || "");
          setTelefone(ultimo.telefone || "");
          // Verificar se já está inscrito
          if (typeof id === 'string' && ultimo.nome) {
            const inscrito = await verificarInscricao(id, ultimo.nome);
            setJaInscrito(inscrito);
          }
        }
      }
    } catch {}
  };

  if (carregando) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted text-base">Carregando...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!event) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center gap-4">
          <Text className="text-2xl">❌</Text>
          <Text className="text-base text-muted">Evento não encontrado</Text>
          <TouchableOpacity
            className="bg-primary px-6 py-3 rounded-full"
            onPress={() => router.back()}
          >
            <Text className="text-white font-semibold">Voltar</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const permiteInscricao = eventoPermiteInscricao(event.category);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
  };

  const handleSubscribe = async () => {
    if (!nome.trim()) {
      Alert.alert("Atenção", "Informe seu nome completo.");
      return;
    }
    if (!celula.trim()) {
      Alert.alert("Atenção", "Informe sua célula.");
      return;
    }

    try {
      // Salvar no banco de dados via tRPC
      await criarInscricaoMutation.mutateAsync({
        eventoId: Number(event.id),
        nome: nome.trim(),
        telefone: telefone.trim(),
        celula: celula.trim(),
      });

      // Também salvar no AsyncStorage para compatibilidade com relatórios locais
      await criarInscricao({
        eventoId: event.id,
        eventoTitulo: event.title,
        eventoData: event.date,
        nomeCompleto: nome.trim(),
        celula: celula.trim(),
        telefone: telefone.trim(),
      });

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      setJaInscrito(true);
      setMostrarFormulario(false);

      // Se for evento especial (pago), redirecionar automaticamente para página de pagamento
      if (event?.category === 'special' || eventoData?.tipo === 'special' || eventoData?.tipo === 'evento-especial') {
        Alert.alert(
          "Inscrição Confirmada!",
          `Você foi inscrito no evento "${event?.title || eventoData?.titulo}". Redirecionando para pagamento...`,
          [{ text: "OK" }]
        );
        
        // Redirecionar automaticamente após 1 segundo
        setTimeout(() => {
          router.push({
            pathname: "/event-pagamento/[id]",
            params: {
              id: event?.id || eventoData?.id?.toString(),
              eventoId: event?.id || eventoData?.id?.toString(),
              eventoTitulo: event?.title || eventoData?.titulo,
            },
          });
        }, 1000);
      } else {
        Alert.alert(
          "Inscrição Confirmada!",
          `Você foi inscrito no evento "${event.title}". Em breve você receberá mais informações.`,
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Erro ao inscrever:", error);
      Alert.alert("Erro", "Não foi possível realizar a inscrição. Tente novamente.");
    }
  };

  const handleShare = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Formatar mensagem para WhatsApp
    const mensagem = `🎉 *${event.title}*\n\n📅 *Data:* ${formatDate(event.date)}\n🕐 *Horário:* ${event.time}\n📍 *Local:* ${event.location}\n\n${event.description}\n\n👉 Inscreva-se no nosso app!`;

    // Codificar mensagem para URL
    const mensagemCodificada = encodeURIComponent(mensagem);

    // URL do WhatsApp
    const whatsappUrl = `https://wa.me/?text=${mensagemCodificada}`;

    // Tentar abrir WhatsApp
    Linking.canOpenURL(whatsappUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(whatsappUrl);
        } else {
          // Se WhatsApp não estiver instalado, mostrar alerta
          Alert.alert(
            "WhatsApp não instalado",
            "Instale o WhatsApp para compartilhar este evento.",
            [{ text: "OK" }]
          );
        }
      })
      .catch(() => {
        Alert.alert(
          "Erro",
          "Não foi possível abrir o WhatsApp. Tente novamente.",
          [{ text: "OK" }]
        );
      });
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: permiteInscricao ? 100 : 40 }}>
        {/* Header com botão voltar */}
        <View className="p-5 flex-row items-center gap-3">
          <TouchableOpacity
            className="w-10 h-10 items-center justify-center rounded-full bg-surface"
            onPress={() => router.back()}
          >
            <Text className="text-xl">←</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-foreground flex-1">Detalhes do Evento</Text>
          <TouchableOpacity
            className="w-10 h-10 items-center justify-center rounded-full bg-surface"
            onPress={handleShare}
          >
            <IconSymbol name="paperplane.fill" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Imagem do evento (placeholder) */}
        <View 
          className="mx-5 rounded-2xl items-center justify-center"
          style={{ height: 200, backgroundColor: categoryColors[event.category] }}
        >
          <Text className="text-6xl">📅</Text>
        </View>

        {/* Conteúdo */}
        <View className="p-5 gap-6">
          {/* Categoria */}
          <View className="flex-row items-center gap-2">
            <View 
              className="px-3 py-1.5 rounded-full"
              style={{ backgroundColor: `${categoryColors[event.category]}20` }}
            >
              <Text 
                className="text-sm font-semibold"
                style={{ color: categoryColors[event.category] }}
              >
                {categoryLabels[event.category]}
              </Text>
            </View>
            {permiteInscricao && (
              <View className="px-3 py-1.5 rounded-full bg-primary/10">
                <Text className="text-xs font-semibold text-primary">Inscrição Aberta</Text>
              </View>
            )}
          </View>

          {/* Título */}
          <Text className="text-3xl font-bold text-foreground">
            {event.title}
          </Text>

          {/* Informações */}
          <View className="gap-4">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 items-center justify-center rounded-full bg-surface">
                <IconSymbol name="calendar" size={20} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-muted">Data</Text>
                <Text className="text-base font-semibold text-foreground">{formatDate(event.date)}</Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 items-center justify-center rounded-full bg-surface">
                <Text className="text-xl">🕐</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm text-muted">Horário</Text>
                <Text className="text-base font-semibold text-foreground">{event.time}</Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 items-center justify-center rounded-full bg-surface">
                <Text className="text-xl">📍</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm text-muted">Local</Text>
                <Text className="text-base font-semibold text-foreground">{event.location}</Text>
              </View>
            </View>
          </View>

          {/* Descrição */}
          <View className="gap-2">
            <Text className="text-xl font-bold text-foreground">Sobre o Evento</Text>
            <Text className="text-base text-foreground leading-relaxed">
              {event.description}
            </Text>
          </View>

          {/* Formulário de inscrição (apenas eventos especiais) */}
          {permiteInscricao && mostrarFormulario && !jaInscrito && (
            <View className="bg-surface rounded-2xl p-5 gap-4 border border-border">
              <Text className="text-lg font-bold text-foreground">Formulário de Inscrição</Text>

              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Nome Completo</Text>
                <TextInput
                  className="bg-background rounded-xl px-4 py-3 text-foreground border"
                  style={{ borderColor: colors.border }}
                  placeholder="Seu nome completo"
                  placeholderTextColor={colors.muted}
                  value={nome}
                  onChangeText={setNome}
                />
              </View>

              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Célula</Text>
                <TouchableOpacity
                  className="bg-background rounded-xl px-4 py-3 border flex-row items-center justify-between"
                  style={{ borderColor: colors.border }}
                  onPress={() => setMostrarSeletorCelulas(!mostrarSeletorCelulas)}
                >
                  <Text className={celula ? "text-foreground" : "text-muted"}>
                    {celula || "Selecione sua célula"}
                  </Text>
                  <Text className="text-lg">{mostrarSeletorCelulas ? "▲" : "▼"}</Text>
                </TouchableOpacity>
                {mostrarSeletorCelulas && (
                  <ScrollView className="bg-surface rounded-xl border border-border mt-2" style={{ maxHeight: 300 }}>
                    {celulas && celulas.length > 0 ? (
                      celulas.map((cel, index) => (
                        <TouchableOpacity
                          key={cel.id?.toString() || cel.name || index}
                          className="px-4 py-3 border-b border-border"
                          style={{ borderBottomColor: colors.border }}
                          onPress={() => {
                            setCelula(cel.nome || cel.name || "");
                            setMostrarSeletorCelulas(false);
                          }}
                        >
                          <Text className="text-foreground">{cel.nome || cel.name}</Text>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View className="px-4 py-3">
                        <Text className="text-muted text-center">Nenhuma célula disponível</Text>
                      </View>
                    )}
                  </ScrollView>
                )}
              </View>

              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Telefone *</Text>
                <TextInput
                  className="bg-background rounded-xl px-4 py-3 text-foreground border"
                  style={{ borderColor: colors.border }}
                  placeholder="Seu telefone"
                  placeholderTextColor={colors.muted}
                  value={telefone}
                  onChangeText={setTelefone}
                  keyboardType="phone-pad"
                />
              </View>

              <TouchableOpacity
                className="bg-primary rounded-xl py-3 items-center justify-center"
                onPress={handleSubscribe}
              >
                <Text className="text-white font-bold text-base">Confirmar Inscrição</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="border border-border rounded-xl py-3 items-center justify-center"
                onPress={() => setMostrarFormulario(false)}
              >
                <Text className="text-foreground font-semibold">Cancelar</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Botão de inscrição */}
          {permiteInscricao && !mostrarFormulario && !jaInscrito && (
            <TouchableOpacity
              className="bg-primary rounded-xl py-4 items-center justify-center"
              onPress={() => setMostrarFormulario(true)}
            >
              <Text className="text-white font-bold text-base">Inscrever-se no Evento</Text>
            </TouchableOpacity>
          )}

          {/* Confirmação de inscrição */}
          {jaInscrito && (
            <View className="bg-success/10 rounded-xl p-4 border border-success">
              <View className="flex-row items-center gap-3">
                <Text className="text-2xl">✅</Text>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-success">Você já está inscrito</Text>
                  <Text className="text-xs text-success/80">Aguarde mais informações</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
