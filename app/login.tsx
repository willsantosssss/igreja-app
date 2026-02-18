import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert, Image } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { getCelulas } from "@/lib/data/celulas";

const logoImage = require("../assets/images/logo-2ieq.png");

interface UserData {
  name: string;
  birthDate: string;
  celula: string;
  createdAt: string;
}

export default function LoginScreen() {
  const colors = useColors();
  const [isNewUser, setIsNewUser] = useState(false);
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [celula, setCelula] = useState("");
  const [loading, setLoading] = useState(false);
  const [celulas, setCelulas] = useState<string[]>([]);

  useEffect(() => {
    const carregarCelulas = async () => {
      try {
        const celulasList = await getCelulas();
        const nomes = celulasList.map(c => c.name);
        setCelulas(nomes);
      } catch (error) {
        console.error("Erro ao carregar células:", error);
        // Fallback para células padrão se houver erro
        setCelulas(["Vida Nova", "Esperança", "Fé e Graça", "Amor Perfeito", "Renovo", "Outra"]);
      }
    };
    carregarCelulas();
  }, []);

  const handleLogin = async () => {
    if (!name.trim()) {
      Alert.alert("Atenção", "Por favor, preencha seu nome.");
      return;
    }

    if (!birthDate.trim()) {
      Alert.alert("Atenção", "Por favor, preencha sua data de nascimento.");
      return;
    }

    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(birthDate)) {
      Alert.alert("Atenção", "Data de nascimento inválida. Use o formato DD/MM/YYYY.");
      return;
    }

    if (!celula.trim()) {
      Alert.alert("Atenção", "Por favor, selecione uma célula.");
      return;
    }

    setLoading(true);

    try {
      const userData: UserData = {
        name: name.trim(),
        birthDate: birthDate.trim(),
        celula: celula.trim(),
        createdAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem("@user_data", JSON.stringify(userData));
      await AsyncStorage.setItem("@is_logged_in", "true");

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert("Bem-vindo!", `Olá ${name}! Você foi registrado com sucesso.`, [
        { text: "OK", onPress: () => router.replace("/(tabs)") },
      ]);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar seus dados. Tente novamente.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatBirthDate = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length <= 2) {
      setBirthDate(cleaned);
    } else if (cleaned.length <= 4) {
      setBirthDate(`${cleaned.slice(0, 2)}/${cleaned.slice(2)}`);
    } else {
      setBirthDate(`${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`);
    }
  };

  return (
    <ScreenContainer className="bg-gradient-to-b from-primary/10 to-background">
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20, flexGrow: 1, justifyContent: "center" }}>
        {/* Logo */}
        <View className="items-center gap-3">
          <Image
            source={logoImage}
            style={{ width: 120, height: 120 }}
            resizeMode="contain"
          />
        </View>

        {/* Welcome Message */}
        <View className="gap-2">
          <Text className="text-3xl font-bold text-foreground">
            {isNewUser ? "Bem-vindo!" : "Bem-vindo de Volta!"}
          </Text>
          <Text className="text-base text-muted">
            {isNewUser
              ? "Crie sua conta para acessar o aplicativo"
              : "Faça login para continuar"}
          </Text>
        </View>

        {/* Form */}
        <View className="gap-4">
          {/* Nome */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Nome Completo</Text>
            <TextInput
              className="bg-surface rounded-xl px-4 py-3 text-foreground border"
              style={{ borderColor: colors.border }}
              placeholder="Digite seu nome completo"
              placeholderTextColor={colors.muted}
              value={name}
              onChangeText={setName}
              editable={!loading}
            />
          </View>

          {/* Data de Nascimento */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Data de Nascimento</Text>
            <TextInput
              className="bg-surface rounded-xl px-4 py-3 text-foreground border"
              style={{ borderColor: colors.border }}
              placeholder="DD/MM/YYYY"
              placeholderTextColor={colors.muted}
              value={birthDate}
              onChangeText={formatBirthDate}
              keyboardType="numeric"
              maxLength={10}
              editable={!loading}
            />
            <Text className="text-xs text-muted">
              Usaremos essa data para lembrar seu aniversário
            </Text>
            {birthDate && !/^\d{2}\/\d{2}\/\d{4}$/.test(birthDate) && (
              <Text className="text-xs text-error">
                Data inválida. Use o formato DD/MM/YYYY
              </Text>
            )}
          </View>

          {/* Célula */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Célula</Text>
            {celulas.length > 0 ? (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                className="gap-2"
              >
                {celulas.map((cel) => (
                  <TouchableOpacity
                    key={cel}
                    className="px-4 py-3 rounded-full mr-2"
                    style={{
                      backgroundColor: celula === cel ? colors.primary : colors.surface,
                      borderWidth: 1,
                      borderColor: celula === cel ? colors.primary : colors.border,
                    }}
                    onPress={() => setCelula(cel)}
                    disabled={loading}
                  >
                    <Text
                      className="font-semibold text-sm whitespace-nowrap"
                      style={{ color: celula === cel ? "#FFFFFF" : colors.foreground }}
                    >
                      {cel}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <Text className="text-xs text-muted">Carregando células...</Text>
            )}
            {celula && (
              <Text className="text-xs text-success">
                ✓ Célula selecionada: {celula}
              </Text>
            )}
          </View>

          {/* Info Box */}
          <View className="bg-primary/10 rounded-xl p-4 gap-2 border border-primary/20">
            <Text className="text-sm font-semibold text-foreground">
              Por que essas informações?
            </Text>
            <Text className="text-xs text-muted leading-relaxed">
              Usamos seu nome e data de nascimento para lembrar seu aniversário e enviar uma mensagem especial. Sua célula nos ajuda a manter você conectado com seu grupo de oração.
            </Text>
          </View>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          className="rounded-full py-4 items-center"
          style={{ backgroundColor: colors.primary }}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text className="text-white font-bold text-base">
            {loading ? "Entrando..." : "Entrar"}
          </Text>
        </TouchableOpacity>

        {/* Footer */}
        <View className="items-center gap-2 mt-4">
          <Text className="text-xs text-muted text-center">
            Seus dados são armazenados com segurança no seu dispositivo
          </Text>
          <Text className="text-xs text-muted">
            2ª Igreja Quadrangular de Rondonópolis © 2026
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
