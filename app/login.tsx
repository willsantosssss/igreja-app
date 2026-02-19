import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert, Platform } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { startOAuthLogin } from "@/constants/oauth";

const logoImage = require("../assets/images/logo-2ieq.png");

export default function LoginScreen() {
  const colors = useColors();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      // Inicia o fluxo de login com Google OAuth
      await startOAuthLogin();
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Erro", "Não foi possível iniciar o login. Tente novamente.");
      setLoading(false);
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
            Bem-vindo!
          </Text>
          <Text className="text-base text-muted">
            Faça login com sua conta Google para acessar a comunidade
          </Text>
        </View>

        {/* Info Box */}
        <View className="bg-primary/10 rounded-2xl p-5 gap-3 border border-primary/20">
          <Text className="text-sm font-semibold text-foreground">
            Por que fazer login?
          </Text>
          <Text className="text-sm text-muted leading-relaxed">
            Ao fazer login, você poderá:
          </Text>
          <View className="gap-2">
            <Text className="text-sm text-muted">
              • Receber lembretes de aniversários da comunidade
            </Text>
            <Text className="text-sm text-muted">
              • Participar de pedidos de oração
            </Text>
            <Text className="text-sm text-muted">
              • Acessar eventos e inscrições
            </Text>
            <Text className="text-sm text-muted">
              • Fazer parte da célula
            </Text>
          </View>
        </View>

        {/* Google Login Button */}
        <TouchableOpacity
          className="bg-primary rounded-xl p-4 items-center gap-3 active:opacity-80"
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Text className="text-white font-semibold text-base">
                Login com Google
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Info Text */}
        <View className="gap-2">
          <Text className="text-xs text-muted text-center">
            Seus dados são armazenados com segurança no seu dispositivo
          </Text>
          <Text className="text-xs text-muted text-center">
            2ª Igreja Quadrangular de Rondonópolis © 2026
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
