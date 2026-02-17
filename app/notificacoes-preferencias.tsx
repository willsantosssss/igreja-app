import { ScrollView, Text, View, TouchableOpacity, Switch, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import {
  obterPreferencias,
  salvarPreferencias,
  enviarNotificacaoTeste,
  obterStatusPermissao,
  solicitarPermissao,
} from "@/lib/notifications/devocional-notificacao";

interface PreferencesNotificacao {
  habilitado: boolean;
  hora: number;
  minuto: number;
  diasSemana: boolean[];
}

const DIAS_SEMANA = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

export default function NotificacoesPreferenciasScreen() {
  const colors = useColors();
  const [preferencias, setPreferencias] = useState<PreferencesNotificacao | null>(null);
  const [temPermissao, setTemPermissao] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const prefs = await obterPreferencias();
      setPreferencias(prefs);

      const temPerm = await obterStatusPermissao();
      setTemPermissao(temPerm);

      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar preferências:", error);
      setLoading(false);
    }
  };

  const handleToggleNotificacoes = async (valor: boolean) => {
    if (!preferencias) return;

    // Se quer habilitar mas não tem permissão, solicitar
    if (valor && !temPermissao) {
      const permissaoObtida = await solicitarPermissao();
      if (!permissaoObtida) {
        Alert.alert(
          "Permissão Negada",
          "Você precisa permitir notificações nas configurações do seu dispositivo"
        );
        return;
      }
      setTemPermissao(true);
    }

    const novasPrefs = { ...preferencias, habilitado: valor };
    setPreferencias(novasPrefs);
    await salvarPreferencias(novasPrefs);

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    Alert.alert(
      "Sucesso",
      valor ? "Notificações ativadas!" : "Notificações desativadas"
    );
  };

  const handleToggleDia = async (dia: number) => {
    if (!preferencias) return;

    const novosDias = [...preferencias.diasSemana];
    novosDias[dia] = !novosDias[dia];

    const novasPrefs = { ...preferencias, diasSemana: novosDias };
    setPreferencias(novasPrefs);
    await salvarPreferencias(novasPrefs);

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleChangeHora = async (novaHora: number) => {
    if (!preferencias) return;

    const novasPrefs = { ...preferencias, hora: novaHora };
    setPreferencias(novasPrefs);
    await salvarPreferencias(novasPrefs);
  };

  const handleChangeMinuto = async (novoMinuto: number) => {
    if (!preferencias) return;

    const novasPrefs = { ...preferencias, minuto: novoMinuto };
    setPreferencias(novasPrefs);
    await salvarPreferencias(novasPrefs);
  };

  const handleTestarNotificacao = async () => {
    try {
      await enviarNotificacaoTeste();
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert("Sucesso", "Notificação de teste enviada!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível enviar a notificação de teste");
    }
  };

  if (loading || !preferencias) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted">Carregando...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 100 }}>
        {/* Header */}
        <View className="gap-2">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-primary font-semibold">← Voltar</Text>
          </TouchableOpacity>
          <Text className="text-3xl font-bold text-foreground">Notificações</Text>
          <Text className="text-base text-muted">Preferências de notificação do devocional</Text>
        </View>

        {/* Status de Permissão */}
        {!temPermissao && (
          <View className="bg-warning/10 rounded-2xl p-4 gap-2 border border-warning/20">
            <Text className="text-sm font-semibold text-warning">⚠️ Permissão Necessária</Text>
            <Text className="text-xs text-muted">
              Para receber notificações, você precisa permitir no seu dispositivo
            </Text>
            <TouchableOpacity
              className="mt-2 bg-warning/20 rounded-lg py-2 items-center border border-warning"
              onPress={async () => {
                const perm = await solicitarPermissao();
                if (perm) {
                  setTemPermissao(true);
                  Alert.alert("Sucesso", "Permissão concedida!");
                }
              }}
            >
              <Text className="text-sm font-bold text-warning">Permitir Notificações</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Toggle Principal */}
        <View className="bg-surface rounded-2xl p-4 gap-3 border border-border">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-base font-bold text-foreground">Notificações Ativadas</Text>
              <Text className="text-sm text-muted">
                {preferencias.habilitado ? "Você receberá notificações" : "Notificações desativadas"}
              </Text>
            </View>
            <Switch
              value={preferencias.habilitado}
              onValueChange={handleToggleNotificacoes}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={preferencias.habilitado ? colors.primary : colors.muted}
            />
          </View>
        </View>

        {preferencias.habilitado && (
          <>
            {/* Horário da Notificação */}
            <View className="gap-3">
              <Text className="text-sm font-semibold text-foreground">⏰ Horário da Notificação</Text>

              <View className="bg-surface rounded-2xl p-4 gap-3 border border-border">
                <View className="flex-row items-center justify-between">
                  <Text className="text-base font-semibold text-foreground">Hora</Text>
                  <View className="flex-row items-center gap-2">
                    <TouchableOpacity
                      className="bg-primary/20 rounded-lg px-3 py-2 border border-primary"
                      onPress={() =>
                        handleChangeHora(Math.max(0, preferencias.hora - 1))
                      }
                    >
                      <Text className="text-primary font-bold">−</Text>
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-foreground w-12 text-center">
                      {preferencias.hora.toString().padStart(2, "0")}
                    </Text>
                    <TouchableOpacity
                      className="bg-primary/20 rounded-lg px-3 py-2 border border-primary"
                      onPress={() =>
                        handleChangeHora(Math.min(23, preferencias.hora + 1))
                      }
                    >
                      <Text className="text-primary font-bold">+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="flex-row items-center justify-between">
                  <Text className="text-base font-semibold text-foreground">Minuto</Text>
                  <View className="flex-row items-center gap-2">
                    <TouchableOpacity
                      className="bg-primary/20 rounded-lg px-3 py-2 border border-primary"
                      onPress={() =>
                        handleChangeMinuto(Math.max(0, preferencias.minuto - 5))
                      }
                    >
                      <Text className="text-primary font-bold">−</Text>
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-foreground w-12 text-center">
                      {preferencias.minuto.toString().padStart(2, "0")}
                    </Text>
                    <TouchableOpacity
                      className="bg-primary/20 rounded-lg px-3 py-2 border border-primary"
                      onPress={() =>
                        handleChangeMinuto(Math.min(59, preferencias.minuto + 5))
                      }
                    >
                      <Text className="text-primary font-bold">+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="bg-primary/10 rounded-lg p-3 mt-2 border border-primary/20">
                  <Text className="text-sm text-foreground">
                    Você receberá notificações às{" "}
                    <Text className="font-bold">
                      {preferencias.hora.toString().padStart(2, "0")}:
                      {preferencias.minuto.toString().padStart(2, "0")}
                    </Text>
                  </Text>
                </View>
              </View>
            </View>

            {/* Dias da Semana */}
            <View className="gap-3">
              <Text className="text-sm font-semibold text-foreground">📅 Dias da Semana</Text>

              <View className="bg-surface rounded-2xl p-4 gap-2 border border-border">
                {DIAS_SEMANA.map((dia, index) => (
                  <TouchableOpacity
                    key={index}
                    className="flex-row items-center justify-between p-3 rounded-lg border"
                    style={{
                      borderColor: preferencias.diasSemana[index]
                        ? colors.primary
                        : colors.border,
                      backgroundColor: preferencias.diasSemana[index]
                        ? colors.primary + "10"
                        : "transparent",
                    }}
                    onPress={() => handleToggleDia(index)}
                  >
                    <Text className="text-base font-semibold text-foreground">{dia}</Text>
                    <View
                      className="w-6 h-6 rounded border-2 items-center justify-center"
                      style={{
                        borderColor: preferencias.diasSemana[index]
                          ? colors.primary
                          : colors.border,
                        backgroundColor: preferencias.diasSemana[index]
                          ? colors.primary
                          : "transparent",
                      }}
                    >
                      {preferencias.diasSemana[index] && (
                        <Text className="text-white font-bold text-xs">✓</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Botão de Teste */}
            <TouchableOpacity
              className="rounded-full py-3 items-center border-2"
              style={{ borderColor: colors.primary, backgroundColor: colors.primary + "20" }}
              onPress={handleTestarNotificacao}
            >
              <Text className="text-base font-bold text-primary">🔔 Testar Notificação</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Informações */}
        <View className="bg-primary/10 rounded-2xl p-4 gap-2 border border-primary/20">
          <Text className="text-sm font-semibold text-foreground">ℹ️ Sobre Notificações</Text>
          <Text className="text-xs text-muted leading-relaxed">
            Você receberá uma notificação diária lembrando você de ler o devocional do dia. A
            notificação será enviada no horário que você configurar nos dias selecionados.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
