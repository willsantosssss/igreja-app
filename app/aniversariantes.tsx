import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import { useMemo } from "react";
import { trpc } from "@/lib/trpc";

export default function AniversariantesScreen() {
  const colors = useColors();
  const { data: aniversariantes = [], isLoading } = trpc.usuarios.getAniversariantes.useQuery(new Date().getMonth() + 1);

  const stats = useMemo(() => {
    const currentMonth = new Date().getMonth() + 1;
    
    const aniversariantesDoMes = aniversariantes.filter((user) => {
      const [day, month] = user.dataNascimento.split("/").map(Number);
      return month === currentMonth;
    }).sort((a, b) => {
      const dayA = parseInt(a.dataNascimento.split("/")[0]);
      const dayB = parseInt(b.dataNascimento.split("/")[0]);
      return dayA - dayB;
    });

    return {
      aniversariantes: aniversariantesDoMes,
      total: aniversariantes.length,
    };
  }, [aniversariantes]);

  const getAge = (birthDate: string) => {
    const [day, month, year] = birthDate.split("/").map(Number);
    const today = new Date();
    const birthYear = year;
    let age = today.getFullYear() - birthYear;
    
    const birthMonth = month - 1;
    if (today.getMonth() < birthMonth || 
        (today.getMonth() === birthMonth && today.getDate() < day)) {
      age--;
    }
    
    return age;
  };

  const getDayOfWeek = (birthDate: string) => {
    const [day, month, year] = birthDate.split("/").map(Number);
    const date = new Date(year, month - 1, day);
    const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    return days[date.getDay()];
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
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            className="w-10 h-10 items-center justify-center rounded-full bg-surface"
            onPress={() => router.back()}
          >
            <Text className="text-xl">←</Text>
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-3xl font-bold text-foreground">Aniversariantes</Text>
            <Text className="text-sm text-muted mt-1">
              Celebre com a comunidade
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View className="grid grid-cols-2 gap-3">
          <View className="bg-primary/10 rounded-2xl p-5 gap-2 border border-primary/20">
            <Text className="text-3xl font-bold text-primary">{stats.aniversariantes.length}</Text>
            <Text className="text-sm text-muted">Aniversariantes este mês</Text>
          </View>
          <View className="bg-secondary/10 rounded-2xl p-5 gap-2 border border-secondary/20">
            <Text className="text-3xl font-bold" style={{ color: colors.secondary }}>{stats.total}</Text>
            <Text className="text-sm text-muted">Total de membros</Text>
          </View>
        </View>

        {/* Aniversariantes */}
        <View className="gap-3">
          <Text className="text-xl font-bold text-foreground">
            {new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).charAt(0).toUpperCase() + new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).slice(1)}
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
                      {person.dataNascimento} • {getAge(person.dataNascimento)} anos
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

                <TouchableOpacity
                  className="rounded-full py-2 items-center border"
                  style={{ borderColor: colors.primary }}
                >
                  <Text className="font-semibold text-sm" style={{ color: colors.primary }}>
                    Enviar mensagem 💌
                  </Text>
                </TouchableOpacity>
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
