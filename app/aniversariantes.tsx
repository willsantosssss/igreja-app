import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface UserData {
  name: string;
  birthDate: string;
  celula: string;
}

export default function AniversariantesScreen() {
  const colors = useColors();
  const [aniversariantes, setAniversariantes] = useState<UserData[]>([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [celulasData, setCelulasData] = useState<Record<string, number>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Carregar dados de usuários (simulado - em produção viria do backend)
      const userData = await AsyncStorage.getItem("@user_data");
      
      // Aqui você carregaria todos os usuários do banco de dados
      // Por enquanto, vamos simular com dados mockados
      const mockUsers: UserData[] = [
        { name: "João Silva", birthDate: "15/02/1990", celula: "Vida Nova" },
        { name: "Maria Santos", birthDate: "08/02/1985", celula: "Esperança" },
        { name: "Pedro Oliveira", birthDate: "22/02/1992", celula: "Fé e Graça" },
        { name: "Ana Costa", birthDate: "28/02/1988", celula: "Amor Perfeito" },
        { name: "Carlos Mendes", birthDate: "14/02/1995", celula: "Renovo" },
        { name: "Beatriz Lima", birthDate: "10/02/1991", celula: "Vida Nova" },
      ];

      // Filtrar aniversariantes de fevereiro (mês atual)
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const aniversariantesDoMes = mockUsers.filter((user) => {
        const [day, month] = user.birthDate.split("/").map(Number);
        return month === currentMonth;
      }).sort((a, b) => {
        const dayA = parseInt(a.birthDate.split("/")[0]);
        const dayB = parseInt(b.birthDate.split("/")[0]);
        return dayA - dayB;
      });

      setAniversariantes(aniversariantesDoMes);
      setTotalMembers(mockUsers.length);

      // Contar membros por célula
      const celulasCount: Record<string, number> = {};
      mockUsers.forEach((user) => {
        celulasCount[user.celula] = (celulasCount[user.celula] || 0) + 1;
      });
      setCelulasData(celulasCount);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

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
            <Text className="text-3xl font-bold text-primary">{aniversariantes.length}</Text>
            <Text className="text-sm text-muted">Aniversariantes este mês</Text>
          </View>
          <View className="bg-secondary/10 rounded-2xl p-5 gap-2 border border-secondary/20">
            <Text className="text-3xl font-bold" style={{ color: colors.secondary }}>{totalMembers}</Text>
            <Text className="text-sm text-muted">Total de membros</Text>
          </View>
        </View>

        {/* Aniversariantes */}
        <View className="gap-3">
          <Text className="text-xl font-bold text-foreground">Fevereiro de 2026</Text>
          
          {aniversariantes.length > 0 ? (
            aniversariantes.map((person, index) => (
              <View
                key={index}
                className="bg-surface rounded-2xl p-5 gap-3 border border-border"
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 gap-2">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-2xl">🎂</Text>
                      <Text className="text-lg font-bold text-foreground flex-1">
                        {person.name}
                      </Text>
                    </View>
                    <Text className="text-sm text-muted">
                      {person.birthDate} • {getAge(person.birthDate)} anos
                    </Text>
                    <Text className="text-sm text-muted">
                      {getDayOfWeek(person.birthDate)} de fevereiro
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
