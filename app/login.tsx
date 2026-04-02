import { useState } from "react";
import { Alert, ScrollView, View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { setSessionToken, setUserInfo, getSessionToken } from "@/lib/_core/auth";
import { useColors } from "@/hooks/use-colors";
import { usePersistentStorage } from "@/lib/hooks/use-persistent-storage";


export default function LoginScreen() {
  console.log("[LoginScreen] Component rendering");
  const colors = useColors();
  const storage = usePersistentStorage();
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
      
      // Guardar token JWT usando setSessionToken (SecureStore no React Native, localStorage na web)
      if (loginResult.sessionToken) {
        try {
          console.log("[Login] Token recebido:", loginResult.sessionToken.substring(0, 20) + "...");
          await setSessionToken(loginResult.sessionToken);
          console.log("[Login] Session token saved");
          // Verificar se foi salvo
          const savedToken = await getSessionToken();
          console.log("[Login] Token verificado:", savedToken ? "OK" : "FALHOU");
        } catch (e) {
          console.warn("[Login] Failed to save token", e);
        }
      } else {
        console.warn("[Login] Nenhum sessionToken recebido do servidor!");
      }
      
      // Salvar informações do usuário em cache para uso imediato na tela de completar cadastro
      if (loginResult.openId && loginResult.email) {
        try {
          await setUserInfo({
            id: loginResult.userId,
            openId: loginResult.openId,
            email: loginResult.email,
            name: loginResult.name || null,
            loginMethod: "manual",
            lastSignedIn: new Date(),
          });
          console.log("[Login] User info cached");
        } catch (e) {
          console.warn("[Login] Failed to cache user info", e);
        }
      }
      
      await storage.setItem("@is_logged_in", "true");
      await storage.setItem("@cadastro_completo", "false");
      await storage.setItem("@user_email", email);
      console.log("[Login] Storage set, redirecting...");
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
      console.log("[Login] Iniciando login com:", { email });
      console.log("[Login] loginMutation:", typeof loginMutation);
      const loginResult = await loginMutation.mutateAsync({ email, password });
      console.log("[Login] Login success!");
      console.log("[Login] Login result type:", typeof loginResult);
      console.log("[Login] Login result keys:", loginResult ? Object.keys(loginResult) : 'null');
      console.log("[Login] Login result completo:", JSON.stringify(loginResult, null, 2));
      console.log("[Login] sessionToken existe?", !!loginResult.sessionToken);
      console.log("[Login] sessionToken valor:", loginResult.sessionToken?.substring(0, 50));
      
      // Guardar token JWT usando setSessionToken (SecureStore no React Native, localStorage na web)
      if (loginResult.sessionToken) {
        try {
          console.log("[Login] Saving token:", loginResult.sessionToken.substring(0, 20) + "...");
          console.log("[Login] typeof window:", typeof window);
          console.log("[Login] window.localStorage exists:", !!window.localStorage);
          // Salvar token diretamente em localStorage para web
          if (typeof window !== 'undefined' && window.localStorage) {
            console.log("[Login] Attempting to save to localStorage...");
            window.localStorage.setItem('app_session_token', loginResult.sessionToken);
            console.log("[Login] Token salvo em localStorage");
            // Verificar imediatamente
            const checkToken = window.localStorage.getItem('app_session_token');
            console.log("[Login] Verificação imediata:", checkToken ? "SIM (" + checkToken.length + " chars)" : "NÃO");
          } else {
            console.log("[Login] window.localStorage não disponível, usando setSessionToken");
            await setSessionToken(loginResult.sessionToken);
            console.log("[Login] Token salvo via setSessionToken");
          }
        } catch (e) {
          console.error("[Login] Failed to save token", e);
        }
      } else {
        console.error("[Login] loginResult.sessionToken é undefined!", loginResult);
      }
      
      // Salvar informações do usuário em cache
      if (loginResult.openId && loginResult.email) {
        try {
          await setUserInfo({
            id: loginResult.userId,
            openId: loginResult.openId,
            email: loginResult.email,
            name: loginResult.name || null,
            loginMethod: "manual",
            lastSignedIn: new Date(),
          });
          console.log("[Login] User info cached");
        } catch (e) {
          console.warn("[Login] Failed to cache user info", e);
        }
      }
      
      await storage.setItem("@is_logged_in", "true");
      await storage.setItem("@user_email", email);
      
      // Aguardar um pouco para garantir que o token está disponível no tRPC client
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Verificar se o usuário tem cadastro completo (registro em usuariosCadastrados)
      // Se não tiver, redirecionar para completar-cadastro
      try {
        console.log("[Login] Verificando cadastro completo...");
        const usuarioResponse = await trpc.usuarios.getByUserId.query();
        console.log("[Login] Resposta do cadastro:", usuarioResponse ? "Existe" : "Não existe");
        if (usuarioResponse) {
          await storage.setItem("@cadastro_completo", "true");
          router.replace("/(tabs)");
        } else {
          await storage.setItem("@cadastro_completo", "false");
          router.replace("/completar-cadastro");
        }
      } catch (e) {
        // Se houver erro ao verificar, assumir que precisa completar cadastro
        console.warn("[Login] Erro ao verificar cadastro:", e);
        await storage.setItem("@cadastro_completo", "false");
        router.replace("/completar-cadastro");
      }
    } catch (error: any) {
      console.error("[Login] ERRO CAPTURADO NO CATCH EXTERNO:", error);
      console.error("[Login] Error message:", error.message);
      console.error("[Login] Error stack:", error.stack);
      console.error("[Login] Error type:", typeof error);
      console.error("[Login] Error keys:", error ? Object.keys(error) : 'null');
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
            style={[
              {
                backgroundColor: colors.primary,
                borderRadius: 8,
                paddingVertical: 16,
                paddingHorizontal: 16,
                alignItems: 'center',
                justifyContent: 'center',
              },
              loading && { opacity: 0.6 },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
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
              <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 14 }}>
                {isSignup ? "Faça login" : "Cadastre-se"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
