import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import { BackButton } from "@/components/back-button";
import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";

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

export default function AniversariantesScreen() {
  const colors = useColors();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const { data: aniversariantes = [], isLoading, refetch } = trpc.usuarios.getAniversariantes.useQuery(currentMonth, {
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  const stats = useMemo(() => {
    const aniversariantesDoMes = aniversariantes.sort((a, b) => {
      const dayA = parseDateString(a.dataNascimento).day;
      const dayB = parseDateString(b.dataNascimento).day;
      return dayA - dayB;
    });

    return {
      aniversariantes: aniversariantesDoMes,
      total: aniversariantes.length,
    };
  }, [aniversariantes]);

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

  const getDayOfWeek = (birthDate: string) => {
    const { day, month, year } = parseDateString(birthDate);
    const date = new Date(year, month - 1, day);
    const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    return days[date.getDay()];
  };

  const formatDate = (birthDate: string) => {
    const { day, month } = parseDateString(birthDate);
    return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}`;
  };

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
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-3xl font-bold text-foreground">Aniversariantes</Text>
            <Text className="text-sm text-muted mt-1">
              Celebre com a comunidade
            </Text>
          </View>
          <BackButton />
        </View>

        {/* Month Navigation */}
        <View className="flex-row items-center justify-between gap-3">
          <TouchableOpacity
            className="flex-1 py-3 px-4 rounded-lg bg-surface items-center border border-border"
            onPress={() => setCurrentMonth((m) => m === 1 ? 12 : m - 1)}
          >
            <Text className="text-sm font-semibold text-foreground">← Mês Anterior</Text>
          </TouchableOpacity>
          <View className="flex-1 py-3 px-4 rounded-lg bg-primary/10 items-center border border-primary/20">
            <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
              {new Date(2024, currentMonth - 1).toLocaleString('pt-BR', { month: 'long' }).charAt(0).toUpperCase() + new Date(2024, currentMonth - 1).toLocaleString('pt-BR', { month: 'long' }).slice(1)}
            </Text>
          </View>
          <TouchableOpacity
            className="flex-1 py-3 px-4 rounded-lg bg-surface items-center border border-border"
            onPress={() => setCurrentMonth((m) => m === 12 ? 1 : m + 1)}
          >
            <Text className="text-sm font-semibold text-foreground">Próximo →</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View className="grid grid-cols-2 gap-3">
          <View className="bg-primary/10 rounded-2xl p-5 gap-2 border border-primary/20">
            <Text className="text-3xl font-bold text-primary">{stats.aniversariantes.length}</Text>
            <Text className="text-sm text-muted">Aniversariantes</Text>
          </View>
          <View className="bg-secondary/10 rounded-2xl p-5 gap-2 border border-secondary/20">
            <Text className="text-3xl font-bold" style={{ color: colors.secondary }}>{stats.total}</Text>
            <Text className="text-sm text-muted">Total de membros</Text>
          </View>
        </View>

        {/* Aniversariantes */}
        <View className="gap-3">
          <Text className="text-xl font-bold text-foreground">
            {new Date(2024, currentMonth - 1).toLocaleString('pt-BR', { month: 'long' }).charAt(0).toUpperCase() + new Date(2024, currentMonth - 1).toLocaleString('pt-BR', { month: 'long' }).slice(1)}
          </Text>
          
          {stats.aniversariantes.length > 0 ? (
            stats.aniversariantes.map((person, index) => (
              <View
                key={index}
                className="bg-surface rounded-2xl p-5 gap-3 border border-border"
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 gap-2">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-2xl">🎂</Text>
                      <Text className="text-lg font-bold text-foreground flex-1">
                        {person.nome}
                      </Text>
                    </View>
                    <Text className="text-sm text-muted">
                      {formatDate(person.dataNascimento)} • {getAge(person.dataNascimento)} anos
                    </Text>
                    <Text className="text-sm text-muted">
                      {getDayOfWeek(person.dataNascimento)}
                    </Text>
                  </View>
                  <View 
                    className="px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: `${colors.primary}20` }}
                  >
                    <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
                      {person.celula}
                    </Text>
                  </View>
                </View>


              </View>
            ))
          ) : (
            <View className="items-center py-10 gap-2">
              <Text className="text-5xl">🎉</Text>
              <Text className="text-base text-muted text-center">
                Nenhum aniversariante este mês
              </Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View className="bg-primary/10 rounded-2xl p-5 gap-2 border border-primary/20">
          <Text className="text-sm font-semibold text-foreground">
            💝 Dica Importante
          </Text>
          <Text className="text-xs text-muted leading-relaxed">
            Não esqueça de enviar uma mensagem de parabéns para os aniversariantes! Uma palavra de encorajamento pode fazer toda a diferença na vida de alguém.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
