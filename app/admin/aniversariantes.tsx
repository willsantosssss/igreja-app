import { ScrollView, Text, View, TouchableOpacity, Alert, TextInput, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState, useMemo } from "react";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { trpc } from "@/lib/trpc";

interface Usuario {
  id: number;
  nome: string;
  dataNascimento: string;
  celula: string;
}

// Helper para parsear datas em ambos formatos (YYYY-MM-DD ou DD/MM/YYYY)
const parseDateString = (dateStr: string) => {
  if (dateStr.includes("-")) {
    // Formato YYYY-MM-DD (do banco)
    const [year, month, day] = dateStr.split("-").map(Number);
    return { day, month, year };
  } else {
    // Formato DD/MM/YYYY (compatibilidade)
    const [day, month, year] = dateStr.split("/").map(Number);
    return { day, month, year };
  }
};

export default function AdminAniversariantesScreen() {
  const colors = useColors();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [searchText, setSearchText] = useState("");
  
  const { data: aniversariantes = [], isLoading } = trpc.usuarios.getAniversariantes.useQuery(currentMonth);
  const { data: todosUsuarios = [] } = trpc.usuarios.list.useQuery();

  const stats = useMemo(() => {
    const aniversariantesFiltrados = aniversariantes.filter((user) =>
      user.nome.toLowerCase().includes(searchText.toLowerCase())
    );

    const contagemCelulas: Record<string, number> = {};
    aniversariantes.forEach((user) => {
      contagemCelulas[user.celula] = (contagemCelulas[user.celula] || 0) + 1;
    });

    return {
      aniversariantes: aniversariantesFiltrados,
      total: aniversariantes.length,
      contagemCelulas,
      totalMembros: todosUsuarios.length,
    };
  }, [aniversariantes, todosUsuarios, searchText]);

  const getAge = (birthDate: string) => {
    const { day, month, year } = parseDateString(birthDate);
    const today = new Date();
    let age = today.getFullYear() - year;
    
    const birthMonth = month - 1;
    if (today.getMonth() < birthMonth || 
        (today.getMonth() === birthMonth && today.getDate() < day)) {
      age--;
    }
    
    return age;
  };

  const getDaysUntilBirthday = (birthDate: string) => {
    const { day, month } = parseDateString(birthDate);
    const today = new Date();
    const nextBirthday = new Date(today.getFullYear(), month - 1, day);
    
    if (nextBirthday < today) {
      nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
    }
    
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.ceil((nextBirthday.getTime() - today.getTime()) / oneDay);
  };

  const formatDate = (birthDate: string) => {
    const { day, month } = parseDateString(birthDate);
    return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}`;
  };

  const monthName = new Date(2024, currentMonth - 1).toLocaleString('pt-BR', { month: 'long' });

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-muted mt-4">Carregando aniversariantes...</Text>
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
          <Text className="text-3xl font-bold text-foreground">Aniversariantes</Text>
          <Text className="text-sm text-muted capitalize">
            Sincronizados com o banco de dados
          </Text>
        </View>

        {/* Month Navigation */}
        <View className="flex-row items-center justify-between gap-3">
          <TouchableOpacity
            className="flex-1 py-3 px-4 rounded-lg bg-surface items-center border border-border"
            onPress={() => setCurrentMonth((m) => m === 1 ? 12 : m - 1)}
          >
            <Text className="text-sm font-semibold text-foreground">← Anterior</Text>
          </TouchableOpacity>
          <View className="flex-1 py-3 px-4 rounded-lg bg-primary/10 items-center border border-primary/20">
            <Text className="text-sm font-semibold capitalize" style={{ color: colors.primary }}>
              {monthName}
            </Text>
          </View>
          <TouchableOpacity
            className="flex-1 py-3 px-4 rounded-lg bg-surface items-center border border-border"
            onPress={() => setCurrentMonth((m) => m === 12 ? 1 : m + 1)}
          >
            <Text className="text-sm font-semibold text-foreground">Próximo →</Text>
          </TouchableOpacity>
        </View>

        {/* Estatísticas */}
        <View className="gap-3">
          <View className="bg-primary/10 rounded-2xl p-4 gap-2 border border-primary/20">
            <Text className="text-sm font-semibold text-foreground">📊 Estatísticas do Mês</Text>
            <View className="flex-row justify-between gap-2">
              <View className="flex-1 bg-primary/20 rounded-lg p-3 items-center">
                <Text className="text-2xl font-bold text-primary">{stats.total}</Text>
                <Text className="text-xs text-muted">Aniversariantes</Text>
              </View>
              <View className="flex-1 bg-success/20 rounded-lg p-3 items-center">
                <Text className="text-2xl font-bold text-success">{Object.keys(stats.contagemCelulas).length}</Text>
                <Text className="text-xs text-muted">Células</Text>
              </View>
              <View className="flex-1 bg-secondary/20 rounded-lg p-3 items-center">
                <Text className="text-2xl font-bold text-secondary">{stats.totalMembros}</Text>
                <Text className="text-xs text-muted">Total</Text>
              </View>
            </View>
          </View>

          {/* Distribuição por Célula */}
          {Object.keys(stats.contagemCelulas).length > 0 && (
            <View className="bg-surface rounded-2xl p-4 gap-3 border border-border">
              <Text className="text-sm font-semibold text-foreground">🏘️ Membros por Célula</Text>
              <View className="gap-2">
                {Object.entries(stats.contagemCelulas)
                  .sort((a, b) => b[1] - a[1])
                  .map(([celula, count]) => (
                    <View key={celula} className="flex-row items-center justify-between">
                      <Text className="text-sm text-foreground">{celula || "Sem célula"}</Text>
                      <View className="bg-primary/20 px-3 py-1 rounded-full">
                        <Text className="text-sm font-bold text-primary">{count}</Text>
                      </View>
                    </View>
                  ))}
              </View>
            </View>
          )}
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
        {stats.aniversariantes.length === 0 ? (
          <View className="items-center justify-center py-10 bg-surface rounded-2xl">
            <Text className="text-muted text-center">
              {searchText ? "Nenhum aniversariante encontrado" : `Nenhum aniversariante em ${monthName}`}
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {stats.aniversariantes.map((user) => {
              const age = getAge(user.dataNascimento);
              const daysUntil = getDaysUntilBirthday(user.dataNascimento);
              const isToday = daysUntil === 0;

              return (
                <View
                  key={user.id}
                  className="bg-surface rounded-2xl p-4 gap-3 border-2"
                  style={{ borderColor: isToday ? colors.success : colors.border }}
                >
                  {/* Header */}
                  <View className="flex-row items-center justify-between gap-2">
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-foreground">{user.nome}</Text>
                      <Text className="text-xs text-muted">{user.celula || "Sem célula"}</Text>
                    </View>
                    {isToday && (
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
                        {formatDate(user.dataNascimento)}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-sm text-muted">Idade:</Text>
                      <Text className="text-sm font-semibold text-foreground">{age} anos</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-sm text-muted">Próximo aniversário:</Text>
                      <Text className="text-sm font-semibold text-foreground">
                        {isToday ? "Hoje! 🎉" : `${daysUntil} dias`}
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
