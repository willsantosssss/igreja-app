import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { SESSION_TOKEN_KEY } from "@/constants/oauth";


export default function LoginScreen() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const signupMutation = trpc.auth.signup.useMutation();
  const loginMutation = trpc.auth.login.useMutation();

  const handleSignup = async () => {
    if (!email || !password || !name) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Erro", "Senha deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      console.log("[Login] Starting signup with:", { email, name });
      const signupResult = await signupMutation.mutateAsync({ email, password, name });
      console.log("[Login] Signup success, auto-logging in...");
      
      // Auto-login após signup
      const loginResult = await loginMutation.mutateAsync({ email, password });
      console.log("[Login] Auto-login success");
      
      // Guardar token JWT no localStorage
      if (loginResult.sessionToken) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(SESSION_TOKEN_KEY, loginResult.sessionToken);
          console.log("[Login] Session token saved to localStorage");
        } else {
          await AsyncStorage.setItem(SESSION_TOKEN_KEY, loginResult.sessionToken);
        }
      }
      
      await AsyncStorage.setItem("@is_logged_in", "true");
      await AsyncStorage.setItem("@cadastro_completo", "false");
      await AsyncStorage.setItem("@user_email", email);
      console.log("[Login] AsyncStorage set, redirecting...");
      router.replace("/completar-cadastro");
    } catch (error: any) {
      console.error("[Login] Signup error:", error);
      Alert.alert("Erro", error.message || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erro", "Preencha email e senha");
      return;
    }

    setLoading(true);
    try {
      const loginResult = await loginMutation.mutateAsync({ email, password });
      console.log("[Login] Login success");
      
      // Guardar token JWT no localStorage
      if (loginResult.sessionToken) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(SESSION_TOKEN_KEY, loginResult.sessionToken);
          console.log("[Login] Session token saved to localStorage");
        } else {
          await AsyncStorage.setItem(SESSION_TOKEN_KEY, loginResult.sessionToken);
        }
      }
      
      await AsyncStorage.setItem("@is_logged_in", "true");
      await AsyncStorage.setItem("@cadastro_completo", "true");
      await AsyncStorage.setItem("@user_email", email);
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Email ou senha incorretos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }} className="p-6">
        <View className="gap-8">
          {/* Header */}
          <View className="items-center gap-2">
            <Text className="text-4xl font-bold text-foreground">
              {isSignup ? "Criar Conta" : "Bem-vindo"}
            </Text>
            <Text className="text-base text-muted text-center">
              {isSignup ? "Cadastre-se para acessar o app" : "Faça login para continuar"}
            </Text>
          </View>

          {/* Form */}
          <View className="gap-4">
            {isSignup && (
              <View>
                <Text className="text-sm font-semibold text-foreground mb-2">Nome</Text>
                <TextInput
                  className="border border-border rounded-lg p-3 text-foreground bg-surface"
                  placeholder="Seu nome"
                  placeholderTextColor="#999"
                  value={name}
                  onChangeText={setName}
                  editable={!loading}
                />
              </View>
            )}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">Email</Text>
              <TextInput
                className="border border-border rounded-lg p-3 text-foreground bg-surface"
                placeholder="seu@email.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                editable={!loading}
              />
            </View>
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">Senha</Text>
              <TextInput
                className="border border-border rounded-lg p-3 text-foreground bg-surface"
                placeholder="Sua senha"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>
          </View>

          {/* Button */}
          <TouchableOpacity
            onPress={isSignup ? handleSignup : handleLogin}
            disabled={loading}
            className="bg-primary rounded-lg p-4 items-center active:opacity-80"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">
                {isSignup ? "Criar Conta" : "Entrar"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Toggle */}
          <View className="flex-row items-center justify-center gap-2">
            <Text className="text-muted text-sm">
              {isSignup ? "Já tem conta?" : "Não tem conta?"}
            </Text>
            <TouchableOpacity onPress={() => setIsSignup(!isSignup)} disabled={loading}>
              <Text className="text-primary font-semibold text-sm">
                {isSignup ? "Faça login" : "Cadastre-se"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
