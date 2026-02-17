import { ScrollView, Text, View, TouchableOpacity, Alert, TextInput } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

interface Usuario {
  nome: string;
  dataNascimento: string;
  celula: string;
  createdAt: string;
}

export default function AdminAniversariantesScreen() {
  const colors = useColors();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [aniversariantes, setAniversariantes] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [mesAtual] = useState(new Date().getMonth() + 1);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    carregarAniversariantes();
  }, []);

  const carregarAniversariantes = async () => {
    try {
      const dados = await AsyncStorage.getItem("@usuarios_login");
      if (dados) {
        const lista = JSON.parse(dados);
        setUsuarios(lista);

        // Filtrar aniversariantes do mês
        const aniversariantesDoMes = lista.filter((usuario: Usuario) => {
          const dataNasc = new Date(usuario.dataNascimento);
          return dataNasc.getMonth() + 1 === mesAtual;
        });

        // Ordenar por dia do mês
        aniversariantesDoMes.sort((a: Usuario, b: Usuario) => {
          const diaA = new Date(a.dataNascimento).getDate();
          const diaB = new Date(b.dataNascimento).getDate();
          return diaA - diaB;
        });

        setAniversariantes(aniversariantesDoMes);
      }
      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar aniversariantes:", error);
      setLoading(false);
    }
  };

  const aniversariantesFiltrados = aniversariantes.filter((user) =>
    user.nome.toLowerCase().includes(searchText.toLowerCase())
  );

  const contarPorCelula = () => {
    const contagem: Record<string, number> = {};
    usuarios.forEach((user: Usuario) => {
      contagem[user.celula] = (contagem[user.celula] || 0) + 1;
    });
    return contagem;
  };

  const contagemCelulas = contarPorCelula();
  const mesNome = new Date(2026, mesAtual - 1).toLocaleDateString("pt-BR", { month: "long" });

  const calcularIdade = (dataNascimento: string) => {
    const hoje = new Date();
    const nasc = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const mesAtualCalc = hoje.getMonth();
    const mesNasc = nasc.getMonth();

    if (mesAtualCalc < mesNasc || (mesAtualCalc === mesNasc && hoje.getDate() < nasc.getDate())) {
      idade--;
    }

    return idade;
  };

  const diasParaAniversario = (dataNascimento: string) => {
    const hoje = new Date();
    const nasc = new Date(dataNascimento);
    const proximoAniversario = new Date(hoje.getFullYear(), nasc.getMonth(), nasc.getDate());

    if (proximoAniversario < hoje) {
      proximoAniversario.setFullYear(proximoAniversario.getFullYear() + 1);
    }

    const umDia = 24 * 60 * 60 * 1000;
    return Math.ceil((proximoAniversario.getTime() - hoje.getTime()) / umDia);
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 100 }}>
        {/* Header */}
        <View className="gap-2">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-primary font-semibold">← Voltar</Text>
          </TouchableOpacity>
          <Text className="text-3xl font-bold text-foreground">Aniversariantes</Text>
          <Text className="text-sm text-muted capitalize">
            Mês de {mesNome} • Total de membros: {usuarios.length}
          </Text>
        </View>

        {/* Estatísticas */}
        <View className="gap-3">
          <View className="bg-primary/10 rounded-2xl p-4 gap-2 border border-primary/20">
            <Text className="text-sm font-semibold text-foreground">📊 Estatísticas do Mês</Text>
            <View className="flex-row justify-between gap-2">
              <View className="flex-1 bg-primary/20 rounded-lg p-3 items-center">
                <Text className="text-2xl font-bold text-primary">{aniversariantes.length}</Text>
                <Text className="text-xs text-muted">Aniversariantes</Text>
              </View>
              <View className="flex-1 bg-success/20 rounded-lg p-3 items-center">
                <Text className="text-2xl font-bold text-success">{Object.keys(contagemCelulas).length}</Text>
                <Text className="text-xs text-muted">Células</Text>
              </View>
              <View className="flex-1 bg-secondary/20 rounded-lg p-3 items-center">
                <Text className="text-2xl font-bold text-secondary">{usuarios.length}</Text>
                <Text className="text-xs text-muted">Total</Text>
              </View>
            </View>
          </View>

          {/* Distribuição por Célula */}
          <View className="bg-surface rounded-2xl p-4 gap-3 border border-border">
            <Text className="text-sm font-semibold text-foreground">🏘️ Membros por Célula</Text>
            <View className="gap-2">
              {Object.entries(contagemCelulas)
                .sort((a, b) => b[1] - a[1])
                .map(([celula, count]) => (
                  <View key={celula} className="flex-row items-center justify-between">
                    <Text className="text-sm text-foreground">{celula}</Text>
                    <View className="bg-primary/20 px-3 py-1 rounded-full">
                      <Text className="text-sm font-bold text-primary">{count}</Text>
                    </View>
                  </View>
                ))}
            </View>
          </View>
        </View>

        {/* Busca */}
        <View className="gap-2">
          <Text className="text-sm font-semibold text-foreground">Buscar aniversariante:</Text>
          <TextInput
            className="bg-surface rounded-xl px-4 py-3 text-foreground border"
            style={{ borderColor: colors.border }}
            placeholder="Digite o nome..."
            placeholderTextColor={colors.muted}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Lista de Aniversariantes */}
        {loading ? (
          <View className="items-center justify-center py-10">
            <Text className="text-muted">Carregando...</Text>
          </View>
        ) : aniversariantesFiltrados.length === 0 ? (
          <View className="items-center justify-center py-10 bg-surface rounded-2xl">
            <Text className="text-muted text-center">
              {searchText ? "Nenhum aniversariante encontrado" : `Nenhum aniversariante em ${mesNome}`}
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {aniversariantesFiltrados.map((user, index) => {
              const dataNasc = new Date(user.dataNascimento);
              const dia = dataNasc.getDate().toString().padStart(2, "0");
              const mes = (dataNasc.getMonth() + 1).toString().padStart(2, "0");
              const idade = calcularIdade(user.dataNascimento);
              const diasFaltam = diasParaAniversario(user.dataNascimento);
              const ehHoje = diasFaltam === 0;

              return (
                <View
                  key={index}
                  className="bg-surface rounded-2xl p-4 gap-3 border-2"
                  style={{ borderColor: ehHoje ? colors.success : colors.border }}
                >
                  {/* Header */}
                  <View className="flex-row items-center justify-between gap-2">
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-foreground">{user.nome}</Text>
                      <Text className="text-xs text-muted">{user.celula}</Text>
                    </View>
                    {ehHoje && (
                      <View className="bg-success/20 px-3 py-1 rounded-full">
                        <Text className="text-xs font-bold text-success">🎂 HOJE!</Text>
                      </View>
                    )}
                  </View>

                  {/* Informações */}
                  <View className="gap-2 border-t border-border pt-3">
                    <View className="flex-row justify-between">
                      <Text className="text-sm text-muted">Data de Nascimento:</Text>
                      <Text className="text-sm font-semibold text-foreground">
                        {dia}/{mes}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-sm text-muted">Idade:</Text>
                      <Text className="text-sm font-semibold text-foreground">{idade} anos</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-sm text-muted">Próximo aniversário:</Text>
                      <Text className="text-sm font-semibold text-foreground">
                        {diasFaltam === 0 ? "Hoje! 🎉" : `${diasFaltam} dias`}
                      </Text>
                    </View>
                  </View>

                  {/* Botão de Ação */}
                  <TouchableOpacity
                    className="rounded-lg py-2 items-center border-2"
                    style={{ borderColor: colors.primary, backgroundColor: colors.primary + "20" }}
                    onPress={() => {
                      if (Platform.OS !== "web") {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      Alert.alert(
                        "Enviar Mensagem",
                        `Deseja enviar uma mensagem de parabéns para ${user.nome}?`,
                        [
                          { text: "Cancelar", onPress: () => {} },
                          {
                            text: "Enviar",
                            onPress: () => {
                              Alert.alert("Sucesso", "Mensagem enviada com sucesso!");
                            },
                          },
                        ]
                      );
                    }}
                  >
                    <Text className="text-sm font-bold text-primary">📧 Enviar Mensagem</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
