import { useState } from "react";
import { ScrollView, Text, View, TextInput, Pressable, ActivityIndicator } from "react-native";
import { useAuthEmail } from "@/hooks/use-auth-email";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

export default function LoginScreen() {
  const colors = useColors();
  const { state, login, clearError } = useAuthEmail();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      clearError();
      await login(email, password);
    } catch (error) {
      console.error("[Login] Login failed:", error);
    }
  };

  const isLoading = state.isLoading;
  const isDisabled = !email || !password || isLoading;

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        <View className="flex-1 justify-center px-6 gap-8">
          {/* Header */}
          <View className="items-center gap-2">
            <Text className="text-4xl font-bold text-foreground">Igreja Connect</Text>
            <Text className="text-base text-muted text-center">
              Faça login para acessar sua comunidade
            </Text>
          </View>

          {/* Error Message */}
          {state.error && (
            <View className="bg-error/10 border border-error rounded-lg p-4">
              <Text className="text-error font-medium">{state.error}</Text>
            </View>
          )}

          {/* Form */}
          <View className="gap-4">
            {/* Email Input */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Email</Text>
              <TextInput
                placeholder="seu@email.com"
                placeholderTextColor={colors.muted}
                value={email}
                onChangeText={setEmail}
                editable={!isLoading}
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                style={{
                  color: colors.foreground,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                }}
              />
            </View>

            {/* Password Input */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Senha</Text>
              <TextInput
                placeholder="••••••••"
                placeholderTextColor={colors.muted}
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
                secureTextEntry
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                style={{
                  color: colors.foreground,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                }}
              />
            </View>

            {/* Login Button */}
            <Pressable
              onPress={handleLogin}
              disabled={isDisabled}
              style={({ pressed }) => [
                {
                  backgroundColor: isDisabled ? colors.muted : colors.primary,
                  opacity: pressed && !isDisabled ? 0.9 : 1,
                },
              ]}
              className="rounded-lg py-3 mt-4 flex-row items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <ActivityIndicator color={colors.background} size="small" />
                  <Text className="text-background font-semibold">Entrando...</Text>
                </>
              ) : (
                <Text className="text-background font-semibold">Entrar</Text>
              )}
            </Pressable>
          </View>

          {/* Footer Info */}
          <View className="items-center gap-2 mt-4">
            <Text className="text-xs text-muted text-center">
              Versão 1.0.0 • Desenvolvido com ❤️
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
