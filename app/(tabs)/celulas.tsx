import { ScrollView, Text, View, TouchableOpacity, RefreshControl, Linking, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import { getCelulas, type Celula } from "@/lib/data/celulas";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export default function CelulasScreen() {
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const [celulas, setCelulas] = useState<Celula[]>([]);

  useEffect(() => {
    carregarCelulas();
  }, []);

  const carregarCelulas = async () => {
    const dados = await getCelulas();
    setCelulas(dados);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarCelulas();
    setRefreshing(false);
  };

  const handleCall = (phone: string, leaderName: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert(
      "Contatar Líder",
      `Deseja entrar em contato com ${leaderName}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "WhatsApp", 
          onPress: () => {
            const cleanPhone = phone.replace(/\D/g, "");
            Linking.openURL(`https://wa.me/${cleanPhone}`);
          }
        },
        { 
          text: "Ligar", 
          onPress: () => Linking.openURL(`tel:${phone}`)
        },
      ]
    );
  };

  const handleNavigate = (address: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const encodedAddress = encodeURIComponent(address);
    const url = Platform.select({
      ios: `maps://app?daddr=${encodedAddress}`,
      android: `google.navigation:q=${encodedAddress}`,
      default: `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
    });
    Linking.openURL(url);
  };

  return (
    <ScreenContainer>
      <ScrollView 
        contentContainerStyle={{ padding: 20, gap: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View className="gap-2">
          <Text className="text-3xl font-bold text-foreground">Células</Text>
          <Text className="text-base text-muted">
            Encontre uma célula perto de você
          </Text>
        </View>

        {/* Mapa placeholder */}
        <View 
          className="rounded-2xl items-center justify-center border"
          style={{ height: 200, backgroundColor: colors.surface, borderColor: colors.border }}
        >
          <IconSymbol name="map.fill" size={48} color={colors.muted} />
          <Text className="text-sm text-muted mt-2">Mapa das Células</Text>
          <Text className="text-xs text-muted">(Visualização disponível em breve)</Text>
        </View>

        {/* Lista de células */}
        <View className="gap-4">
          <Text className="text-xl font-bold text-foreground">Todas as Células</Text>
          
          {celulas.map((celula) => (
            <View
              key={celula.id}
              className="bg-surface rounded-2xl p-5 gap-4 border border-border"
            >
              {/* Nome e horário */}
              <View className="gap-2">
                <Text className="text-xl font-bold text-foreground">
                  {celula.name}
                </Text>
                <View className="flex-row items-center gap-2">
                  <IconSymbol name="calendar" size={16} color={colors.muted} />
                  <Text className="text-sm text-muted">
                    {celula.schedule.day} às {celula.schedule.time}
                  </Text>
                </View>
              </View>

              {/* Líder */}
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 items-center justify-center rounded-full bg-primary/20">
                  <IconSymbol name="person.fill" size={20} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-muted">Líder</Text>
                  <Text className="text-base font-semibold text-foreground">
                    {celula.leader.name}
                  </Text>
                </View>
                <TouchableOpacity
                  className="px-4 py-2 rounded-full"
                  style={{ backgroundColor: colors.primary }}
                  onPress={() => handleCall(celula.leader.phone, celula.leader.name)}
                >
                  <Text className="text-white font-semibold text-sm">Contato</Text>
                </TouchableOpacity>
              </View>

              {/* Endereço */}
              <View className="gap-1">
                <Text className="text-xs text-muted">Endereço</Text>
                <Text className="text-sm text-foreground">
                  {celula.address.street}
                </Text>
                <Text className="text-sm text-foreground">
                  {celula.address.neighborhood} - {celula.address.city}
                </Text>
              </View>

              {/* Descrição */}
              <Text className="text-sm text-muted leading-relaxed">
                {celula.description}
              </Text>

              {/* Botões de ação */}
              <View className="flex-row gap-2">
                <TouchableOpacity
                  className="flex-1 border-2 rounded-full py-3 items-center"
                  style={{ borderColor: colors.primary }}
                  onPress={() => {
                    const fullAddress = `${celula.address.street}, ${celula.address.neighborhood}, ${celula.address.city}`;
                    handleNavigate(fullAddress);
                  }}
                >
                  <Text className="font-semibold text-sm" style={{ color: colors.primary }}>
                    📍 Como Chegar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 rounded-full py-3 items-center"
                  style={{ backgroundColor: colors.success }}
                  onPress={() => {
                    if (Platform.OS !== "web") {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    }
                    Alert.alert(
                      "Interesse Registrado!",
                      `Obrigado por demonstrar interesse na ${celula.name}. O líder entrará em contato em breve.`,
                      [{ text: "OK" }]
                    );
                  }}
                >
                  <Text className="text-white font-semibold text-sm">
                    ✓ Participar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
