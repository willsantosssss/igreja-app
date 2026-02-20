import { ScrollView, Text, View, TouchableOpacity, RefreshControl, ActivityIndicator, TextInput, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useLocalSearchParams, router } from "expo-router";
import { getEventoById, categoryLabels, categoryColors, type Event } from "@/lib/data/events";
import { eventoPermiteInscricao, criarInscricao, verificarInscricao } from "@/lib/data/inscricoes-eventos";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCelulas, type Celula } from "@/lib/data/celulas";

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
  const [celulas, setCelulas] = useState<Celula[]>([]);
  const [mostrarSeletorCelulas, setMostrarSeletorCelulas] = useState(false);

  useEffect(() => {
    carregarEvento();
    carregarDadosUsuario();
    carregarCelulas();
  }, [id]);

  const carregarCelulas = async () => {
    try {
      const lista = await getCelulas();
      // Filtrar apenas células ativas/válidas
      const celulasFiltradas = lista.filter((c: any) => {
        return c && c.name && c.leader && c.leader.name && c.schedule;
      });
      console.log("Células carregadas:", celulasFiltradas.length, celulasFiltradas);
      setCelulas(celulasFiltradas);
    } catch (err) {
      console.error("Erro ao carregar células:", err);
      setCelulas([]);
    }
  };

  const carregarEvento = async () => {
    if (typeof id === 'string') {
      // Tentar buscar como string primeiro (AsyncStorage)
      let ev = await getEventoById(id);
      
      // Se não encontrou, tentar como número (banco de dados)
      if (!ev && !isNaN(Number(id))) {
        ev = await getEventoById(String(Number(id)));
      }
      
      setEvent(ev);
    }
    setCarregando(false);
  };

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
      Alert.alert(
        "Inscrição Confirmada!",
        `Você foi inscrito no evento "${event.title}". Em breve você receberá mais informações.`,
        [{ text: "OK" }]
      );
    } catch {
      Alert.alert("Erro", "Não foi possível realizar a inscrição. Tente novamente.");
    }
  };

  const handleShare = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert(
      "Compartilhar",
      `Compartilhar "${event.title}" com amigos`,
      [{ text: "OK" }]
    );
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
                  <View className="bg-surface rounded-xl border border-border mt-2 max-h-48">
                    <ScrollView>
                      {celulas && celulas.length > 0 ? (
                        celulas.map((cel) => (
                          <TouchableOpacity
                            key={cel.id || cel.name}
                            className="px-4 py-3 border-b border-border"
                            style={{ borderBottomColor: colors.border }}
                            onPress={() => {
                              setCelula(cel.name);
                              setMostrarSeletorCelulas(false);
                            }}
                          >
                            <Text className="text-foreground">{cel.name}</Text>
                            <Text className="text-xs text-muted">{cel.leader?.name} - {cel.schedule?.day} {cel.schedule?.time}</Text>
                          </TouchableOpacity>
                        ))
                      ) : (
                        <View className="p-4 items-center">
                          <Text className="text-muted">Nenhuma célula disponível</Text>
                        </View>
                      )}
                    </ScrollView>
                  </View>
                )}
              </View>

              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Telefone (opcional)</Text>
                <TextInput
                  className="bg-background rounded-xl px-4 py-3 text-foreground border"
                  style={{ borderColor: colors.border }}
                  placeholder="(00) 00000-0000"
                  placeholderTextColor={colors.muted}
                  value={telefone}
                  onChangeText={setTelefone}
                  keyboardType="phone-pad"
                />
              </View>

              <TouchableOpacity
                className="rounded-full py-4 items-center"
                style={{ backgroundColor: colors.primary }}
                onPress={handleSubscribe}
              >
                <Text className="text-white font-bold text-base">Confirmar Inscrição</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Mensagem se não permite inscrição */}
          {!permiteInscricao && (
            <View className="bg-surface rounded-2xl p-4 gap-2 border border-border">
              <Text className="text-sm text-muted text-center">
                Este é um evento regular da igreja. Não é necessário inscrição prévia. Venha e participe!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Botão fixo de inscrição (apenas eventos especiais) */}
      {permiteInscricao && (
        <View 
          className="absolute bottom-0 left-0 right-0 p-5 border-t"
          style={{ backgroundColor: colors.background, borderTopColor: colors.border }}
        >
          {jaInscrito ? (
            <View className="rounded-full py-4 items-center" style={{ backgroundColor: colors.success }}>
              <Text className="text-white font-bold text-base">✓ Inscrito neste Evento</Text>
            </View>
          ) : (
            <TouchableOpacity
              className="rounded-full py-4 items-center"
              style={{ backgroundColor: colors.primary }}
              onPress={() => setMostrarFormulario(!mostrarFormulario)}
            >
              <Text className="text-white font-bold text-base">
                {mostrarFormulario ? "Fechar Formulário" : "Inscrever-se no Evento"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScreenContainer>
  );
}
