import { ScrollView, Text, View, TouchableOpacity, Alert, TextInput } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { obterInscricoes, contarInscricoesPendentes } from "@/lib/notifications/batismo-notificacao";
import { useCallback } from "react";

interface BatismoData {
  nome: string;
  dataNascimento: string;
  telefone: string;
  motivacao: string;
  createdAt: string;
  status?: "pendente" | "aprovado" | "rejeitado";
}

interface Usuario {
  nome: string;
  dataNascimento: string;
  celula: string;
  createdAt: string;
}

export default function AdminScreen() {
  const colors = useColors();
  const [senhaAdmin, setSenhaAdmin] = useState("");
  const [isAutenticado, setIsAutenticado] = useState(false);
  const [senhaInput, setSenhaInput] = useState("");
  const [batismos, setBatismos] = useState<BatismoData[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [aniversariantesMes, setAniversariantesMes] = useState<Usuario[]>([]);
  const [batismosPendentes, setBatismosPendentes] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (isAutenticado) {
        carregarDados();
      }
    }, [isAutenticado])
  );

  const carregarDados = async () => {
    try {
      // Carregar inscrições de batismo usando serviço
      const inscricoes = await obterInscricoes();
      setBatismos(inscricoes as any);

      const pendentes = await contarInscricoesPendentes();
      setBatismosPendentes(pendentes);

      // Carregar usuários
      const dadosUsuarios = await AsyncStorage.getItem("@usuarios_login");
      if (dadosUsuarios) {
        const lista = JSON.parse(dadosUsuarios);
        setUsuarios(lista);

        // Filtrar aniversariantes do mês
        const mesAtual = new Date().getMonth() + 1;
        const aniversariantes = lista.filter((user: Usuario) => {
          const dataNasc = new Date(user.dataNascimento);
          return dataNasc.getMonth() + 1 === mesAtual;
        });
        setAniversariantesMes(aniversariantes);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const verificarSenha = () => {
    // Senha padrão: "admin2iq" (em produção, seria mais seguro)
    if (senhaInput === "admin2iq") {
      setIsAutenticado(true);
      setSenhaInput("");
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert("Sucesso", "Autenticação realizada com sucesso!");
    } else {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Alert.alert("Erro", "Senha incorreta");
      setSenhaInput("");
    }
  };

  const logout = () => {
    Alert.alert("Confirmar", "Deseja sair do painel de administração?", [
      { text: "Cancelar", onPress: () => {} },
      {
        text: "Sair",
        onPress: () => {
          setIsAutenticado(false);
          setSenhaInput("");
        },
      },
    ]);
  };

  const batismosAprovados = batismos.filter((b) => b.status === "aprovado").length;

  if (!isAutenticado) {
    return (
      <ScreenContainer>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 100 }}>
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Painel Admin</Text>
            <Text className="text-base text-muted">2ª Igreja Quadrangular de Rondonópolis</Text>
          </View>

          {/* Card de Login */}
          <View className="bg-surface rounded-2xl p-6 gap-4 border border-border">
            <View className="gap-2">
              <Text className="text-lg font-bold text-foreground">🔐 Autenticação</Text>
              <Text className="text-sm text-muted">Digite a senha de administrador</Text>
            </View>

            <TextInput
              className="bg-background rounded-xl px-4 py-3 text-foreground border"
              style={{ borderColor: colors.border }}
              placeholder="Senha"
              placeholderTextColor={colors.muted}
              value={senhaInput}
              onChangeText={setSenhaInput}
              secureTextEntry
            />

            <TouchableOpacity
              className="rounded-full py-3 items-center"
              style={{ backgroundColor: colors.primary }}
              onPress={verificarSenha}
            >
              <Text className="text-white font-bold text-base">Entrar</Text>
            </TouchableOpacity>

            <View className="bg-warning/10 rounded-lg p-3 gap-1 border border-warning/20">
              <Text className="text-xs font-semibold text-warning">💡 Dica</Text>
              <Text className="text-xs text-muted">
                Use a senha padrão fornecida pela liderança da igreja
              </Text>
            </View>
          </View>

          {/* Informações */}
          <View className="bg-primary/10 rounded-2xl p-4 gap-2 border border-primary/20">
            <Text className="text-sm font-semibold text-foreground">ℹ️ Sobre este Painel</Text>
            <Text className="text-xs text-muted leading-relaxed">
              Este painel permite que administradores gerenciem inscrições de batismo e visualizem
              aniversariantes da comunidade. Acesso restrito apenas para liderança.
            </Text>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 100 }}>
        {/* Header com Logout */}
        <View className="flex-row items-center justify-between gap-2">
          <View className="flex-1 gap-1">
            <Text className="text-3xl font-bold text-foreground">Painel Admin</Text>
            <Text className="text-sm text-muted">Bem-vindo, Administrador</Text>
          </View>
          <TouchableOpacity
            className="bg-error/20 px-4 py-2 rounded-lg border border-error"
            onPress={logout}
          >
            <Text className="text-xs font-bold text-error">Sair</Text>
          </TouchableOpacity>
        </View>

        {/* Estatísticas Gerais */}
        <View className="gap-3">
          <Text className="text-sm font-semibold text-foreground">📊 Resumo Geral</Text>
          <View className="flex-row gap-2">
            <View className="flex-1 bg-primary/10 rounded-2xl p-4 gap-2 border border-primary/20 items-center">
              <Text className="text-2xl font-bold text-primary">{usuarios.length}</Text>
              <Text className="text-xs text-muted text-center">Membros Cadastrados</Text>
            </View>
            <View className="flex-1 bg-warning/10 rounded-2xl p-4 gap-2 border border-warning/20 items-center">
              <Text className="text-2xl font-bold text-warning">{batismosPendentes}</Text>
              <Text className="text-xs text-muted text-center">Pendentes 🔔</Text>
            </View>
            <View className="flex-1 bg-success/10 rounded-2xl p-4 gap-2 border border-success/20 items-center">
              <Text className="text-2xl font-bold text-success">{batismosAprovados}</Text>
              <Text className="text-xs text-muted text-center">Batismos Aprovados</Text>
            </View>
          </View>
        </View>

        {/* Aniversariantes do Mês */}
        <View className="bg-surface rounded-2xl p-4 gap-3 border border-border">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-base font-bold text-foreground">🎂 Aniversariantes do Mês</Text>
              <Text className="text-xs text-muted">{aniversariantesMes.length} pessoas</Text>
            </View>
            <TouchableOpacity
              className="bg-primary/20 px-4 py-2 rounded-lg border border-primary"
              onPress={() => router.push("/admin/aniversariantes")}
            >
              <Text className="text-xs font-bold text-primary">Ver Detalhes →</Text>
            </TouchableOpacity>
          </View>

          {aniversariantesMes.length > 0 ? (
            <View className="gap-2 pt-2 border-t border-border">
              {aniversariantesMes.slice(0, 3).map((user, index) => (
                <View key={index} className="flex-row items-center justify-between">
                  <Text className="text-sm text-foreground">{user.nome}</Text>
                  <Text className="text-xs text-muted">{user.celula}</Text>
                </View>
              ))}
              {aniversariantesMes.length > 3 && (
                <Text className="text-xs text-primary pt-2">
                  +{aniversariantesMes.length - 3} outros aniversariantes
                </Text>
              )}
            </View>
          ) : (
            <Text className="text-sm text-muted pt-2">Nenhum aniversariante este mês</Text>
          )}
        </View>

        {/* Inscrições de Batismo */}
        <View className="bg-surface rounded-2xl p-4 gap-3 border border-border">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-base font-bold text-foreground">💧 Inscrições de Batismo</Text>
              <Text className="text-xs text-muted">{batismos.length} inscrições</Text>
            </View>
            <TouchableOpacity
              className="bg-primary/20 px-4 py-2 rounded-lg border border-primary"
              onPress={() => router.push("/admin/batismo")}
            >
              <Text className="text-xs font-bold text-primary">Gerenciar →</Text>
            </TouchableOpacity>
          </View>

          {batismos.length > 0 ? (
            <View className="gap-2 pt-2 border-t border-border">
              <View className="flex-row justify-between">
                <View className="items-center">
                  <Text className="text-lg font-bold text-warning">{batismosPendentes}</Text>
                  <Text className="text-xs text-muted">Pendentes</Text>
                </View>
                <View className="items-center">
                  <Text className="text-lg font-bold text-success">{batismosAprovados}</Text>
                  <Text className="text-xs text-muted">Aprovados</Text>
                </View>
                <View className="items-center">
                  <Text className="text-lg font-bold text-error">
                    {batismos.filter((b) => b.status === "rejeitado").length}
                  </Text>
                  <Text className="text-xs text-muted">Rejeitados</Text>
                </View>
              </View>
            </View>
          ) : (
            <Text className="text-sm text-muted pt-2">Nenhuma inscrição de batismo</Text>
          )}
        </View>

        {/* Membros por Célula */}
        <View className="bg-surface rounded-2xl p-4 gap-3 border border-border">
          <Text className="text-base font-bold text-foreground">🏘️ Distribuição por Célula</Text>

          {usuarios.length > 0 ? (
            <View className="gap-2 pt-2 border-t border-border">
              {Object.entries(
                usuarios.reduce((acc: Record<string, number>, user: Usuario) => {
                  acc[user.celula] = (acc[user.celula] || 0) + 1;
                  return acc;
                }, {})
              )
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([celula, count]) => (
                  <View key={celula} className="flex-row items-center justify-between">
                    <Text className="text-sm text-foreground">{celula}</Text>
                    <View className="bg-primary/20 px-3 py-1 rounded-full">
                      <Text className="text-xs font-bold text-primary">{count} membros</Text>
                    </View>
                  </View>
                ))}
            </View>
          ) : (
            <Text className="text-sm text-muted pt-2">Nenhum membro cadastrado</Text>
          )}
        </View>

        {/* Botões de Ação Rápida */}
        <View className="gap-2">
          <Text className="text-sm font-semibold text-foreground">⚡ Ações Rápidas</Text>
          <TouchableOpacity
            className="bg-primary rounded-full py-3 items-center"
            onPress={() => router.push("/admin/batismo")}
          >
            <Text className="text-white font-bold">💧 Gerenciar Batismos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-secondary rounded-full py-3 items-center"
            onPress={() => router.push("/admin/aniversariantes")}
          >
            <Text className="text-white font-bold">🎂 Ver Aniversariantes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="rounded-full py-3 items-center"
            style={{ backgroundColor: colors.success }}
            onPress={() => router.push("/admin/lideres" as any)}
          >
            <Text className="text-white font-bold">👥 Gerenciar Líderes de Células</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
